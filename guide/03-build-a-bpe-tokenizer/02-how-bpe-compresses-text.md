# How BPE compresses text

Why raw bytes are too expensive for a Transformer, how BPE compresses them one repeated pair at a time, what the tokenizer keeps after training, and how many merges are enough.

We learned that, ideally, we would just feed raw byte sequences directly into the model. But that would stretch our sequences to a length that the transformer cannot computationally afford. Because a transformer's [self-attention mechanism](https://www.codecademy.com/article/transformer-architecture-self-attention-mechanism) scales quadratically, `O(N²)`, doubling the sequence length quadruples the attention work and the size of its attention matrix.

If we feed the model uncompressed byte streams, the sequence length explodes, exhausting the GPU's VRAM or forcing us to truncate the text so severely that the model cannot reason over long contexts. There is ongoing research into tokenization-free architectures, including [ByT5](https://arxiv.org/abs/2105.13626), [MEGABYTE](https://arxiv.org/abs/2305.07185), and [BLT](https://arxiv.org/abs/2412.09871). But until those architectures are proven at scale, raw byte streams are simply too expensive for standard transformers to process. We must compress them.

## Compress them, you say?

Yes. The algorithm called [Byte Pair Encoding](https://www.derczynski.com/papers/archive/BPE_Gage.pdf), used by the tokenizers for models such as [GPT-2](https://cdn.openai.com/better-language-models/language-models.pdf) and [GPT-3](https://openai.com/index/language-models-are-few-shot-learners/), and the [original model behind ChatGPT](https://openai.com/index/chatgpt/), wasn't invented with artificial intelligence in mind. It was published in 1994 by a programmer named Philip Gage as a simple, general-purpose algorithm for compressing text files. For two decades, it was just a data compression trick.

Then, in 2015, a team of researchers led by [Rico Sennrich](https://aclanthology.org/P16-1162/) realized this algorithm could solve a major headache in AI translation models: the out-of-vocabulary problem, the same problem we handled with the `<|unk|>` token in our `SimpleTokenizer`.

Sennrich's team proved that Gage's compression loop offered the perfect compromise. It allowed the system to store common words as highly efficient single tokens, but when it encountered a rare or misspelled word, it fell back to reading the unknown word in smaller, recognizable subword chunks. OpenAI later pushed that fallback layer all the way down to our 256 raw UTF-8 bytes for GPT-2. Today, BPE stands as one of the industry standards for LLM tokenization.

## So, how does BPE work?

We understand what BPE is trying to do: compress text, or in our case, tokens. So how does BPE compress a token sequence?

The algorithm begins with a sequence containing only tokens from its base vocabulary. For us, those are UTF-8 byte IDs from `0` through `255`. It loops through the training corpus and **counts every pair of adjacent tokens, and identifies the pair that occurs most often. That pair is assigned, or minted, a new token ID, and every nonoverlapping occurrence of the pair is replaced by the new token.**

Let's walk through a little example to visualise the algorithm. Say our training text is just the string `aaabdaaabac`, and we pretend the alphabet is `{a, b, c, d}` with a vocabulary size of four.

The algorithm starts by scanning the sequence and counting every adjacent pair. `aa` is the most frequent. It occupies four adjacent positions, but only two can be replaced without overlapping. We create a new token, say `Z = aa`, and replace those two occurrences. Our sequence shrinks:

```text
aaabdaaabac  →  Zabdaaabac  →  ZabdZabac
```

Now we have five unique tokens: `a, b, c, d, Z`. We repeat the same process for round two. The pair `ab` appears twice, so we mint `Y = ab` and replace both occurrences:

```text
ZabdZabac  →  ZYdZYac
```

The vocabulary size is now six, and our sequence is down to seven tokens. We do another round. The pair we created, `ZY`, appears twice, so we create `X = ZY` and the sequence becomes:

```text
ZYdZYac  →  XdXac
```

We started with 11 characters. After three merges, we have 5 tokens and a vocabulary of seven elements. That's the core idea of BPE.

## What BPE actually learns

Training BPE is just that same merge loop we explained, but repeated on a pretty large body of text. You take a training corpus, count adjacent token pairs, merge the most frequent pair, add the new token to the vocabulary, and repeat until the vocabulary reaches the target size.

[GPT-2](https://cdn.openai.com/better-language-models/language-models.pdf) learned 50,000 merge rules from [WebText](https://openai.com/index/better-language-models/), a corpus containing slightly over eight million documents and 40 gigabytes of text. Those merges, together with the 256 base byte tokens and one `<|endoftext|>` token, produced its vocabulary of **50,257 tokens**.

[BLOOM](https://huggingface.co/bigscience/bloom) gives us a much more multilingual example. Its byte-level BPE tokenizer was trained on an alpha-weighted subset of an early version of the [ROOTS corpus](https://papers.nips.cc/paper_files/paper/2022/hash/ce9e92e3de2372a4b93353eb7f3dc0bd-Abstract-Datasets_and_Benchmarks.html), which covered 46 natural languages and 13 programming languages. It produced a vocabulary of **250,680 tokens**.

After training, the artifact we end up with is an **ordered list of merge rules**. Each one says: “replace token A followed by token B with token C.” The order is rather important because later rules often depend on tokens that earlier rules created.

That is to say, BPE training and encoding are separate. Training applies the algorithm to the corpus to learn the rules. It is a one-time job. When new text arrives, the tokenizer uses the saved merge ranks without relearning any frequencies from that text. It repeatedly applies the highest-priority merge currently available. The same text therefore becomes the same token IDs during model training and later when somebody uses the model.

So, the algorithm in pseudocode looks like this:

```text
vocabulary = every byte from 0 to 255
tokens = training_text_as_utf8_bytes()

while vocabulary.size < target_size:
    pair_counts = count_adjacent_pairs(tokens)
    pair = most_frequent(pair_counts)

    new_token = vocabulary.add(pair)
    merge_rules.append(pair, new_token)

    tokens = replace_non_overlapping(
        tokens,
        pair,
        new_token,
    )

save(vocabulary, merge_rules)
```

## How many merges are enough?

We kept mentioning merges but never actually answered a rather important question: **how many merges do we need to apply?**

And the answer is of the type we humans don't like: **it depends!** It's a trade-off that you need to make based on the model's goal and the resources you have in hand.

For example, say you're training a tokenizer for some large language model and you decide your number will be 5,000 merges. **Your vocabulary will probably be small.** Yes, the embedding table will consume relatively little memory, but **your compression will be weak**. Common words and patterns will still fracture into several separate tokens. This stretches the sequence length, causing the Transformer's O(N²) attention mechanism to burn through compute and fill up the finite context window before the model can “read”[^read] a meaningful amount of text.

[^read]: The model never reads text directly. Here, “read” means how much of the original text can be represented inside its fixed number of token positions.

If you run too many merges, say 1,000,000, the trade-off moves in the other direction. Frequent long strings, and possibly entire phrases from the training corpus, can compress into single tokens. But the penalty shifts to the embedding table, which **balloons to a massive size and eats up gigabytes of VRAM** before the model even reaches its first Transformer block. A single one-million-row embedding table with 4,096 values per row, stored with two bytes per value, already takes about 8 GB.

Running too many merges also makes poor use of the vocabulary. Once the common patterns have already been captured, later rounds start minting tokens for increasingly rare, highly specific strings. Every one of those tokens still needs a full row in the embedding table, despite appearing only a handful of times in the corpus. The model then gets fewer examples from which to learn a useful embedding for each rare token, while every extra merge buys less and less useful compression on new text.

So where do real models land on this curve? [GPT-2](https://openaipublic.blob.core.windows.net/gpt-2/encodings/main/vocab.bpe) learned **50,000** merges. [GPT-4](https://github.com/openai/tiktoken/blob/main/tiktoken/model.py)'s [cl100k_base](https://openaipublic.blob.core.windows.net/encodings/cl100k_base.tiktoken) encoding contains **100,000** learned merges above the 256 starting bytes. [Llama 3](https://huggingface.co/meta-llama/Meta-Llama-3-8B/blob/main/original/tokenizer.model) goes to **127,744** learned merges. [GPT-4o](https://github.com/openai/tiktoken/blob/main/tiktoken/model.py)'s [o200k_base](https://openaipublic.blob.core.windows.net/encodings/o200k_base.tiktoken) encoding contains **199,742** learned merges. At the high end, [BLOOM's tokenizer artifact](https://huggingface.co/bigscience/bloom/blob/main/tokenizer.json) records **250,434** merge rules.

There is no universal sweet spot. The right number depends on the languages and domains in the corpus, the model's size, the available memory, and how much sequence length you are willing to spend.

> **The core idea**
>
> Start with bytes. Find the most common adjacent pair. Give it one new token. Replace every nonoverlapping occurrence. Repeat, and keep the rules in order.

---

[← Previous](01-unicode-utf8-and-bytes.md) · [Guide contents](../../README.md) · [Next →](03-implement-bpe.md)
