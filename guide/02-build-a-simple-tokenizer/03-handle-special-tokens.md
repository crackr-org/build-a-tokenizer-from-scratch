# Handle special tokens

Extend a fixed vocabulary so unfamiliar text and document boundaries have a defined representation.

Your tokenizer learned a fixed vocabulary from The Verdict, but the text it will receive is not fixed. A new username, misspelling, or code identifier can introduce a token the corpus never contained. The tokenizer still has to return IDs the model understands.

## When a token has no ID

A larger training corpus reduces the number of unfamiliar tokens, but it cannot anticipate every future input. Someone can type a new username such as `learner_builds_2026`, misspell `tokenization` as `tokenizashun`, or introduce a code identifier such as `parseUtf8Chunk` after the vocabulary has already been **frozen**.[^frozen]

[^frozen]: Fixed after tokenizer training. Changing the token-to-ID map later would also require resizing and retraining the model.

Historically, models solved this **“Out of Vocabulary”** problem by assigning an `<UNK>` fallback ID to unrecognized words, effectively blinding the model to their actual contents.

Modern Large Language Models solve this elegantly using **subword tokenization**, popularized by [Sennrich et al. (2015)](https://arxiv.org/abs/1508.07909) and later refined into **Byte-Level Byte-Pair Encoding** for models like GPT-4 through OpenAI's [tiktoken](https://github.com/openai/tiktoken). In Byte-Level BPE, the base vocabulary includes all 256 raw UTF-8 bytes. If an unfamiliar word cannot be matched to a known subword, the tokenizer fractures it down to individual bytes.

Our current `SimpleTokenizer` has no such mechanism. It attempts exact string matching. Because The Verdict never contained the exact word `Hello`, it was never assigned an ID, causing our program to crash:

```python
tokenizer = SimpleTokenizer(training_text)
tokenizer.encode("Hello")
```

```text
Traceback (most recent call last):
  ...
KeyError: 'Hello'
```

Tokenization succeeds in splitting the string, but `encode` fails because `Hello` does not exist in the `token_to_id` dictionary. To handle production data without crashing, a tokenizer must be able to fall back to smaller known sub-components or raw bytes.

We are not adding **subword tokenization** yet, so `SimpleTokenizer` will use the simpler fallback described above. An unfamiliar token is represented by a reserved `<|unk|>` ID. Encoding can then continue without inventing a new ID or crashing. The tradeoff is **information loss: every unfamiliar token becomes the same ID, so its original identity cannot be recovered.**

`<|unk|>` is a special token. Ordinary vocabulary entries are extracted from The Verdict because they appear in the corpus. The unknown token is included deliberately even when its literal string never appears there. Its ID means that the vocabulary could not represent the original token. Like every other entry, it participates in the same `token_to_id` and `id_to_token` maps.

## Separate unrelated tokens

An unfamiliar word is not the only information a plain token stream can fail to represent. A pretraining corpus is assembled from many independent books, articles, and web pages. To prepare batches efficiently, those documents are often joined into long token streams. Joining them removes the boundary between sources: the last token of one document now sits directly beside the first token of an unrelated document.

Imagine one document ends with `The spacecraft landed on Mars.` and the next begins with `Whisk the eggs until smooth.` Without a boundary, next-token training asks the model to predict `Whisk` immediately after `Mars.`. That transition came from the way the dataset was assembled, not from any relationship between space travel and a recipe.

```text
Without boundary: "The spacecraft landed on Mars. Whisk the eggs until smooth."
With boundary:    "The spacecraft landed on Mars. <|endoftext|> Whisk the eggs until smooth."
```

`<|endoftext|>` reserves an ID for that missing boundary. Instead of learning `Mars. → Whisk`, the model learns `Mars. → <|endoftext|>` and `<|endoftext|> → Whisk`. The model can also learn that producing this ID means the current document is complete.

> **What the token actually does**
>
> `<|endoftext|>` does not erase context or improve the model by itself. It gives the training data an explicit boundary signal. The model learns how to use that signal from the examples it sees during training.

## Give unknown tokens a fallback

Extend the constructor so `<|unk|>` always has a unique ID in both vocabulary maps. Add it after the ordinary corpus vocabulary has been sorted and assigned its IDs.

Update `encode` so a missing token uses that reserved ID instead of raising `KeyError`. Known tokens must continue to use their existing IDs, and the vocabulary must not change while encoding.

```python
tokenizer.decode(tokenizer.encode("Hello, do you like tea?"))
# "<|unk|>, do you like tea?"
```

## Separate unrelated documents

Add `<|endoftext|>` to both vocabulary maps. The code preparing the corpus decides where documents end and inserts the marker between them. `SimpleTokenizer` must preserve the complete marker as one token, encode its reserved ID, and decode that ID back to the same marker.

```python
tokenizer.decode(tokenizer.encode("It was. <|endoftext|> It was."))
# "It was. <|endoftext|> It was."
```

## Before you submit

- [ ] Both special tokens have unique IDs in both vocabulary maps.
- [ ] Encoding an unknown token does not change the vocabulary.
- [ ] Unknown tokens encode and decode as `<|unk|>`.
- [ ] The complete `<|endoftext|>` marker is treated as one token.
- [ ] Known text and document boundaries complete the round trip.

> Ready to submit? [Run the automated evaluation on Crackr](https://app.crackr.dev/projects/build-your-own-tokenizer).

## Stuck?

Try to struggle with the problem first. Open these only when you are genuinely stuck.

### Trace the failing dictionary lookup

Print the result of `tokenize("Hello")` before calling `encode`. If it contains one token, splitting worked. The failure is the following lookup in `token_to_id`, which needs a fallback for missing keys.

### Resolve the fallback ID once

Read the ID belonging to `<|unk|>` before mapping the input tokens. For every token, use its known ID when one exists and that fallback ID otherwise. Python dictionary lookups support this behavior directly.

### Add reserved entries after corpus tokens

First build the same sorted ordinary vocabulary as the previous substage. Then add the two reserved strings and build both maps from that final list. This preserves the IDs of corpus tokens while giving each special token a distinct ID.

### Match the complete boundary marker first

Test `tokenize("one.<|endoftext|>two.")`. The marker should be one list item even without surrounding spaces. If you use a regular expression, recognize the full special-token string before applying the ordinary punctuation and whitespace boundaries.

---

[← Previous](02-build-core-tokenizer.md) · [Guide contents](../../README.md)
