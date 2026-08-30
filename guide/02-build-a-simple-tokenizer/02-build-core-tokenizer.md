# Build the core tokenizer

Build the mapping that turns text into token IDs and token IDs back into readable text.

You already know the core idea: tokenization is a mapping between pieces of text, called tokens, and numbers, called token IDs. Your task is to implement the simplest version of that mapping. You will decide how tokens are found, how their IDs are stored, and how the translation works in both directions.

## Prepare the training corpus

Your tokenizer needs text from which to build its vocabulary. Use [The Verdict](https://raw.githubusercontent.com/rasbt/LLMs-from-scratch/main/ch02/01_main-chapter-code/the-verdict.txt), a public-domain short story by Edith Wharton.

Write the code that downloads the file and loads its [UTF-8](https://www.reedbeta.com/blog/programmers-intro-to-unicode/) contents into a string named `training_text`. Keep the corpus-loading code outside `SimpleTokenizer`.

## Create the interface

Create `simple_tokenizer.py` with this public shape so the evaluator can import your implementation.

```python
class SimpleTokenizer:
    def __init__(self, training_text):
        self.token_to_id: dict[str, int] = {}
        self.id_to_token: dict[int, str] = {}

    def tokenize(self, text):
        raise NotImplementedError

    def encode(self, text):
        raise NotImplementedError

    def decode(self, token_ids):
        raise NotImplementedError
```

`token_to_id` maps each known token to its integer ID. `id_to_token` is the inverse: each ID maps back to the exact token. Build both maps in the constructor from `training_text`.

## Split text into tokens

Tokenization begins by deciding how raw text should be split into tokens. Only after those tokens are known can the vocabulary assign an ID to each one.

Splitting is the tokenizer's first decision. The same text can be divided into tokens in different ways, and each choice produces a different vocabulary and sequence of token IDs.

At its simplest, tokenization can be approximated by splitting only at whitespace. Python's `str.split()` and NLTK's `WhitespaceTokenizer` both do this, which would, for example, tokenize `hello world` as `["hello", "world"]`.

Actual models, however, use more sophisticated approaches. [GPT-2](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) uses byte-level BPE, [Llama 2](https://ai.meta.com/research/publications/llama-2-open-foundation-and-fine-tuned-chat-models/) uses BPE implemented with SentencePiece, and [BERT](https://github.com/google-research/bert) uses WordPiece. These approaches build vocabularies from reusable subword pieces, allowing them to represent words that were never stored as complete vocabulary entries. We will build toward BPE later. For now, we use a small splitting rule that is less naive than whitespace splitting and less sophisticated than BPE, a middle ground, if you will. Split your text using the following rules:

### The splitting rules

**Keep ordinary text together.** Read from left to right and collect characters until you reach whitespace or punctuation. The collected piece becomes one token. This gives us a simple first approximation of a word.

**Separate punctuation.** Finish the current piece whenever you encounter `, . : ; ? _ ! " ( ) '`, then keep that punctuation mark as its own token. Treat two consecutive hyphen characters as one punctuation token. Punctuation can follow almost any word. If it remains attached, the vocabulary needs separate entries for `hello`, `hello,`, `hello!`, `world,`, and every other combination. Separating it lets the tokenizer store each word once and reuse the same punctuation tokens everywhere. We keep the punctuation because it changes how text is read and must survive encoding and decoding.

**Discard whitespace.** A space, tab, or line break finishes the current piece but does not become a token. Once the pieces are stored in an ordered list, that boundary has already done its job. `hello world`, `hello\tworld`, and `hello\nworld` all become `["hello", "world"]`. This deliberately loses the exact formatting because this first tokenizer only needs to reconstruct normalized readable text. A tokenizer for code or an exact round trip would need to preserve whitespace.

**Preserve case and order.** The vocabulary maps exact token strings to IDs. If the tokenizer lowercases `Apple`, then `Apple` and `apple` receive the same ID. The original capitalization is lost, and `decode` cannot restore it. Tokens must also remain in source order because the model receives a sequence. Sorting them would change the sentence before the model ever sees it.

```python
tokenizer.tokenize("Hello, world! It's me.")
# ["Hello", ",", "world", "!", "It", "'", "s", "me", "."]
```

This is a perfect job for a regular expression, but use whatever approach you prefer. The evaluator checks only the token sequence your method produces.

## Build the vocabulary

Tokenize the entire training corpus and assign one integer ID to every unique token. Repeated tokens share an ID, and the same corpus must always produce the same mappings.

```python
tokenizer = SimpleTokenizer("red blue red")

assert set(tokenizer.token_to_id) == {"red", "blue"}
assert set(tokenizer.id_to_token.values()) == {"red", "blue"}

for token, token_id in tokenizer.token_to_id.items():
    assert tokenizer.id_to_token[token_id] == token
```

## Encode known text

Implement `encode`. Tokenize the input and return the corresponding IDs in the same order.

```python
tokenizer = SimpleTokenizer("Hello, world!")
token_ids = tokenizer.encode("Hello, world!")

assert isinstance(token_ids, list)
assert len(token_ids) == 4
assert all(isinstance(token_id, int) for token_id in token_ids)
```

> **Note**
>
> Unknown tokens may fail for now. You will handle them in the next substage.

## Decode token IDs

Implement `decode`. Convert each ID back to its token and reconstruct readable text. Use single spaces between words and no space before punctuation.

```python
tokenizer.decode(tokenizer.encode("Hello, world!"))
# "Hello, world!"
```

Exact whitespace does not need to survive this version. The decoded text may be normalized.

## Before you submit

- [ ] Your implementation is in `simple_tokenizer.py`.
- [ ] The public class is named `SimpleTokenizer`.
- [ ] Both vocabulary maps are populated and inverse.
- [ ] Known text completes the encode and decode round trip.
- [ ] You use only the Python standard library.

> Ready to submit? [Run the automated evaluation on Crackr](https://app.crackr.dev/projects/build-your-own-tokenizer).

## Stuck?

Try to struggle with the problem first. Open these only when you are genuinely stuck.

### Build the pattern in Regex101

Open [Regex101 in Python mode](https://regex101.com/?flavor=python), paste `Hello, world! It's me.` into the test string, and build a pattern that matches the separators described above. Its live explanation is useful when a quote, parenthesis, or whitespace rule is not matching as expected.

### Inspect a small re.split result first

Before handling every separator, try `re.split(r"([,!]|\s)", "Hello, world!")`. Because the separators are captured, the result includes the comma, exclamation mark, whitespace, and some empty strings. That output shows the final cleanup your `tokenize` method needs: discard empty and whitespace-only pieces, but keep punctuation. Once that works, expand the pattern to the complete separator list from the task.

### Build both maps once in the constructor

Start the constructor with `sorted(set(self.tokenize(training_text)))`. This gives one stable ordered list containing every unique token. Enumerate that list once to populate `token_to_id`, then reverse those exact pairs to populate `id_to_token`. Do not sort or enumerate a second time. For `red blue red`, both maps should contain exactly two entries and point back to each other.

### Encode with the existing vocabulary

`encode` should not build or change the vocabulary. Pass the input through `self.tokenize(text)`, then replace each resulting token with its existing value in `self.token_to_id`, preserving the list order. If an unknown token raises `KeyError`, that is acceptable in this substage.

### Decode in two visible passes

First, use `id_to_token` to recover the tokens and join them with single spaces. For the example in the task, inspect that intermediate string: it should look like `Hello , world !`. Then run a second cleanup pass that removes whitespace immediately before the supported punctuation marks, producing `Hello, world!`. Keeping the passes separate makes a failed lookup easy to distinguish from a spacing bug.

---

[← Previous](01-llms-cant-read.md) · [Guide contents](../../README.md) · [Next →](03-handle-special-tokens.md)
