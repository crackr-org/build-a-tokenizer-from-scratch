# Implement BPE

Put the whole thing together: pretokenize the corpus, train BPE on its bytes, then use the learned merges to encode and decode new text.

In the previous substage we understood how BPE works. Now we are going to build it. Create a new file called `bpe_tokenizer.py` and define a new class called `BPETokenizer`.

We'll keep this first version deliberately naive. Making it fast will be the concern of the next substage. For now, let's keep it simple: pretokenize, count pair frequencies, choose the max, merge it everywhere it appears, and repeat.

## Prepare the training corpus

We will train this tokenizer on [Tiny Shakespeare](https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt). We picked this corpus since it is large enough for the pair statistics to feel real, but still small enough for this intentionally slow implementation. Download it once and keep it.

```text
https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt
```

## Create the interface

The evaluator will create your class, train it on text, encode new text, and decode the resulting IDs. This is the public interface:

```python
class BPETokenizer:
    def __init__(self):
        ...

    def train(self, text, vocab_size):
        ...

    def encode(self, text):
        ...

    def decode(self, ids):
        ...
```

`train` discovers merge rules from a corpus. `encode` uses those rules without learning anything new. `decode` reverses the token IDs back into text. Pair counting, pair replacement, and pretokenization will still of course have to exist, but how you implement and where you put them is your decision.

## 01 — Pretokenize

The [GPT-2 paper](https://cdn.openai.com/better-language-models/language-models.pdf) from 2019 introduces an important twist to its BPE implementation. The paper covers concepts consistent with what we discussed earlier, but introduces an important divergence. The authors **do not apply the BPE algorithm directly**.

The authors noticed an inefficiency that you would eventually run into if you ran the merge loop straight on raw text. Take, for example, the word *dog*. In actual sentences, it almost never shows up alone. It comes glued to punctuation: *dog.*, *dog!*, *dog?*, *dog,*, and so on. If *dog* sits beside a period often enough, the algorithm will cheerfully mint a token for the entire chunk: *dog.*

By itself, that might seem harmless. But multiply it across the whole vocabulary: *cat.*, *cat!*, *cat?*. *house.*, *house!*, *house?*, and so on. Common nouns, verbs, and adjectives start producing this family of **“punctuation-inflected tokens”**, each taking up a slot in the fixed merge budget.

GPT-2, for example, had [50,000 merges](https://cdn.openai.com/better-language-models/language-models.pdf) to spend. Do we really want to waste thousands of them on identical stems that differ only by the punctuation mark beside them? That is a rather terrible allocation of limited vocabulary capacity. It also binds the word and punctuation into one unit: *dog* and *dog.* now require different token representations instead of reusing the same word piece.

The GPT-2 authors saw this clearly. They write:

> “We observed BPE includes many versions of common words like ‘dog’ since they occur in many contexts (e.g., ‘dog.’, ‘dog!’, ‘dog?’).”
>
> The authors explain that these variants waste limited vocabulary and model capacity, so they prevent BPE from merging across character categories.
>
> — [Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language-models.pdf), 2019

So they introduced a step before BPE: split the text into chunks based on character categories, then run BPE only inside each chunk. That step is **pretokenization**: manually enforced rules prevent certain character types from merging, placing constraints on top of the byte-pair encoding algorithm.

We can inspect the GPT-2 repository's [encoder.py](https://github.com/openai/gpt-2/blob/master/src/encoder.py) to see the exact regex pattern used in its tokenizer. It uses a complex regular expression to chop up text before BPE. One important detail is the import: `import regex as re`. It uses the [regex package](https://pypi.org/project/regex/) rather than Python's built-in `re` module. The package extends `re` with additional functionality, most notably Unicode category matching such as `\p{L}` for any letter and `\p{N}` for any number, which makes the pretokenizer work across writing systems.

```python
import regex as re

pat = re.compile(r"""'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+""")
```

Breaking this pattern apart reveals a few interesting bits:

| Fragment | Rule | Description | Example |
| --- | --- | --- | --- |
| `'s\|'t\|'re\|'ve\|'m\|'ll\|'d` | Contractions | The `\|` symbol means OR. This branch matches one of seven lowercase English contraction endings. Because it comes first, I'll is split into I and 'll before the letters branch can claim the letters. | `I'll  →  I \| 'll` |
| ` ?\p{L}+` | Letters | The first literal space is optional because of `?`. The `\p{L}` property means any Unicode letter, and `+` means one or more. A word therefore stays together with one leading space when present. | `·hello  →  ·hello` |
| ` ?\p{N}+` | Numbers | This follows the same shape as the letter branch, but `\p{N}` means any Unicode number. It groups one or more numbers and may attach one ordinary leading space. | `·123  →  ·123` |
| ` ?[^\s\p{L}\p{N}]+` | Punctuation and symbols | Inside `[...]`, the leading `^` means NOT. This branch accepts a run of characters that are not whitespace, Unicode letters, or Unicode numbers. That includes punctuation, emoji, and symbols. | `!!!  →  !!!` |
| `\s+(?!\S)\|\s+` | Whitespace | `\s+` means one or more whitespace characters. The negative lookahead `(?!\S)` helps leave one space available for the following chunk, while the final `\|\s+` catches any whitespace left over. | `···hello  →  ·· \| ·hello` |

For our BPE tokenizer implementation, we'll use the exact same regex pattern used by GPT-2. Make sure you understand it down to the smallest detail, then use it in both training and encoding. Every regex match is a separate pretoken. BPE may merge bytes inside that pretoken, but never across its boundary. The `regex` package is allowed in this submission.

## 02 — Train the tokenizer

Implement `train`. It receives the training text and the `vocab_size`. The vocabulary already begins with 256 byte tokens, whose IDs run from 0 through 255. So if `vocab_size` is 276, `train` should learn 20 merges and mint IDs 256 through 275.

Pretokenize the corpus, count pairs, choose the pair with the largest total, mint the next ID beginning at 256, and replace all of its nonoverlapping occurrences inside every pretoken.

Save each merge in learning order and store the bytes represented by its new ID. If two pairs have the same count, compare the bytes represented by their left tokens and then their right tokens to break the tie. Stop when the `vocab_size` is reached or no adjacent pair remains.

## 03 — Encode and decode text

Implement `encode`. Pretokenize new text with the same regex, treat each chunk as UTF-8 bytes, and apply the merges learned during training. Return the IDs from every chunk in their original order.

Encoding must not, of course, redo any training. That is, it should not count frequencies, learn another rule, or change the tokenizer. When several learned pairs are available, apply the one learned earliest.

Implement `decode`. Look up the bytes represented by every ID, concatenate the byte stream in order, then decode it as UTF-8 using `errors="replace"`. A model can generate token IDs whose bytes do not form valid UTF-8. In that case, Python returns the replacement character `�` instead of raising a `UnicodeDecodeError`.

## Run it on Tiny Shakespeare

Train your tokenizer on Tiny Shakespeare.

```python
from pathlib import Path
from bpe_tokenizer import BPETokenizer

training_text = Path("tiny_shakespeare.txt").read_text(encoding="utf-8")

tokenizer = BPETokenizer()
tokenizer.train(training_text, vocab_size=276)

ids = tokenizer.encode(training_text)
original_size = len(training_text.encode("utf-8"))

print(f"tokens: {len(ids):,}")
print(f"compression: {original_size / len(ids):.2f}x")
assert tokenizer.decode(ids) == training_text
```

You should see:

```text
tokens: 911,120
compression: 1.22x
```

Try a few larger vocabulary sizes. Print the learned merges, inspect the tokens they create, and see how the training corpus is tokenized.

Now check the round trip on text that did not appear in Tiny Shakespeare:

```python
examples = [
    "",
    "?",
    "Hello world!!!",
    "Aم你👋",
    "tokenizzzzer",
]

for text in examples:
    assert tokenizer.decode(tokenizer.encode(text)) == text
```

## Before you submit

- [ ] `bpe_tokenizer.py` defines `BPETokenizer` with `train`, `encode`, and `decode`.
- [ ] Training begins with the 256 byte tokens and respects the supplied `vocab_size`.
- [ ] Training and encoding use the GPT-2 regex and never merge across its pretokens.
- [ ] Encoding applies the saved merges in learning order without training again.
- [ ] Unseen Unicode text survives `decode(encode(text))` unchanged.
- [ ] The solution uses only the Python standard library and the provided `regex` package.

> Ready to submit? [Run the automated evaluation on Crackr](https://app.crackr.dev/projects/build-your-own-tokenizer).

## Stuck?

Try to struggle with the problem first. Open these only when you are genuinely stuck.

### Keep the learned state small

One mapping can store each learned pair and its new ID. A second can map every ID back to the bytes it represents. Begin the second mapping with `bytes([token_id])` for IDs 0 through 255, then extend it whenever a merge is learned.

### Count repeated pretokens once

Store each unique pretoken as a tuple of byte IDs alongside the number of times it appears. When counting a pair inside that tuple, add the pretoken's frequency instead of one.

### Reuse one merge helper

Write one function that replaces a pair from left to right. Move the cursor by two positions after a match and one after anything else. The same helper can be used by training and `encode`.

### Find the first merge that differs

If your result does not match, print each learned pair, its frequency, and the ID assigned to it. Compare the runs one round at a time. The first round that differs tells you to inspect training; if every learned merge matches but the final token count does not, inspect `encode` instead.

### Use the merge IDs as ranks

New IDs are minted in learning order. During encoding, the available learned pair with the smallest assigned ID is therefore the one that should be applied next.

---

[← Previous](02-how-bpe-compresses-text.md) · [Guide contents](../../README.md) · [Next →](04-benchmark-your-bpe.md)
