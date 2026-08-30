# Port your tokenizer to tiktoken

Preserve the merges your trainer learned, then make the finished tokenizer loadable through tiktoken.

Right now, our trained vocabulary lives in memory inside the `BPETokenizer` object, so when our Python process terminates, the trained state disappears with it. That's not great, and we'll try to **separate what the tokenizer learned from the code that learned it**. Recovering the learned merges by retraining was acceptable while our corpus was tiny. It is, however, a terrible loading strategy, and we'll fix this before we port our tokenizer to tiktoken.

There are several reasonable ways we could preserve the result. We could serialize the complete Python object with [pickle](https://docs.python.org/3/library/pickle.html). We could, with questionable confidence, design a JSON schema for the vocabulary and merges.

Saving the complete object would be the quickest option. It would, however, also preserve implementation details. The file would depend on our Python class and could break as that class changes. A custom format gives us more control, at the modest cost[^modest] of having a format of our own to maintain.

[^modest]: Yes, I am joking. Maintaining your own format is anything but modest.

> **A note on saving training state**
>
> Saving the result of expensive work is something you will see throughout machine learning. Neural networks, for example, can train for hours or days, so training is saved to disk as [**checkpoints**](https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html#saving-loading-a-general-checkpoint-for-inference-and-or-resuming-training) at intervals. A checkpoint records enough state, usually the model parameters, optimizer state, and current training step, to resume after an interruption.
>
> That is not quite what we are doing here. We are saving a finished tokenizer so we can use it later, not checkpointing an ongoing training run. But the habit is the same: once computation becomes expensive, you start thinking carefully about what needs to survive after the process exits.

## Understand the tiktoken encoding

[Tiktoken](https://github.com/openai/tiktoken/blob/main/README.md) is OpenAI's open source BPE tokenizer library. It supports OpenAI's official, publicly available encodings, such as [`cl100k_base`](https://openaipublic.blob.core.windows.net/encodings/cl100k_base.tiktoken) and [`o200k_base`](https://openaipublic.blob.core.windows.net/encodings/o200k_base.tiktoken), out of the box. Its `Encoding` interface can also construct a custom encoding from mergeable token ranks and a pretokenization pattern, which, as you might have guessed, we'll make use of.

Porting our tokenizer to tiktoken is a satisfying final step. Our implementation is intentionally small and does not have all the features or optimizations of a production tokenizer, but it can learn a working BPE encoding. We can now hand those learned token bytes and ranks to an established tokenizer library like tiktoken, making the encoding we built compatible with a real tokenizer runtime.

When training finishes, most of the trainer can be left behind. We won't need the corpus, pretokens, pair counts, etc. Remember, the end result for a tokenizer is to be able to encode and decode text to and from a transformer. Encoding does not need that part of the training state. It only needs to know **which bytes each token represents and the order in which the learned tokens take priority.** Of course, it also needs the same pretokenization pattern used to produce the same pretokens.

Luckily, we do not need to invent how to package this state. [tiktoken](https://github.com/openai/tiktoken/blob/main/README.md) uses a `.tiktoken` file to store and retrieve this learned state. The file content is simple: a table of token bytes and ranks, which our vocabulary already represents after training. Our current mapping points in the opposite direction from what tiktoken expects, so we will need to flip it.

tiktoken calls that finished table [`mergeable_ranks`](https://github.com/openai/tiktoken/blob/main/tiktoken/core.py#L16-L36). It maps each token's bytes to its integer rank. As we mentioned, our vocabulary contains the same information in the opposite direction: it maps each token ID to its bytes. If you remember, we chose this direction because it was more convenient for our trainer, which assigns IDs in learning order.

When tiktoken saves this dictionary, it writes one token and rank per line. The token bytes are encoded with Base64 so the file can safely represent any byte sequence. An example learned section could look like this:

`artifacts/crackr_multilingual.tiktoken`

```text
dGg= 256
aW4= 257
ZXI= 258
YW4= 259
cmU= 260
b24= 261
dGhl 262
aW5n 263
aW9u 264
YW5k 265
IHRoZQ== 266
```

`dGg=` represents `b"th"`, and `dGhl` represents `b"the"`. tiktoken's [loader](https://github.com/openai/tiktoken/blob/main/tiktoken/load.py#L146-L158) turns the file back into `mergeable_ranks`.

> A `.tiktoken` file saves only the token bytes and ranks. The encoding name, pretokenization pattern, and other encoding settings are kept separately in code.

After training finishes and our rank table is ready, we can construct tiktoken's [Encoding class](https://github.com/openai/tiktoken/blob/main/tiktoken/core.py), which accepts the rank table together with the pretokenization pattern and special tokens, then uses our custom definition to encode and decode text. Needless to say, we need to provide the same regex our trainer used. We can choose a name for the encoding and provide its special token mapping:

A thing to be aware of is that OpenAI open sourced tiktoken's inference code. That is, no production training code was open sourced. We do not know, for example, exactly how[^exactly] the `cl100k_base` and `o200k_base` merges were learned. The repository includes a small [educational trainer](https://github.com/openai/tiktoken/blob/main/tiktoken/_educational.py), but our `BPETokenizer` remains responsible for learning the ranks. tiktoken will load and apply the learned merges.

[^exactly]: Well, we know the algorithm. What we do not know for sure is every optimization and production detail OpenAI used.

## How beefyyy is your machine?

The 3 MiB corpus from the previous task kept the demonstration short. For our final tokenizer, we'll use a more reasonable final run. Reasonable comes with an asterisk here. It is a moving target that depends on how beefyyy your machine is and what your time budget is.

For me, with a 12 core M2 Pro MacBook Pro and 32 GB of memory, I built a 100 MiB corpus from the same mC4 dataset, with 20 MiB of English, 15 MiB each of Arabic and Mandarin, and 10 MiB each of Hindi, Russian, Japanese, Korean, and Thai. I used a vocabulary of 8,192 tokens, which took about one hour of training time.

You need to decide a proper corpus and vocabulary size given how beefyyy your machine is or how disposable your free time is.

Use the `build_corpus.py` script from the previous substage and modify its `SOURCES` tuple with the languages and corpus size you decided on:

```python
SOURCES = (
    ("English", "en-multi", 20),
    ("Arabic", "ar", 15),
    ("Mandarin", "zh", 15),
    ("Hindi", "hi", 10),
    ("Russian", "ru", 10),
    ("Japanese", "ja", 10),
    ("Korean", "ko", 10),
    ("Thai", "th", 10),
)
```

## 01 — Reverse your vocab mapping

As we mentioned earlier, tiktoken expects `mergeable_ranks` in the opposite direction from how we currently store our vocabulary: `token bytes → rank` instead of `token ID → token bytes`, so we'll need to flip that.

There are several reasonable ways we could do this. We could simply wait until training finishes and reverse the complete vocabulary in one `O(V)` pass. That works, but it means every time training finishes, we still have one more conversion to do.

Or we can do it while we train. Every time BPE learns a new token, we can add the reverse entry right there in `O(1)`, and by the time training finishes, `mergeable_ranks` will contain everything it should. We do pay `O(V)` extra space for keeping both mappings, `vocab` and `mergeable_ranks`, around, but that is a tradeoff we can comfortably make here.

In `bpe_tokenizer.py`, add `self.mergeable_ranks` to `BPETokenizer` and initialize it with the 256 byte tokens. Then, whenever training learns a new token and adds it to `vocab`, add the reverse entry to `mergeable_ranks` at the same time.

## 02 — Save and load your tokenizer

Create `tiktoken_adapter.py` with two functions. `save_encoding` receives a trained `BPETokenizer` and writes its `mergeable_ranks` to a `.tiktoken` file using [`dump_tiktoken_bpe`](https://github.com/openai/tiktoken/blob/main/tiktoken/load.py#L135-L144).

`load_encoding` reads those ranks back with [`load_tiktoken_bpe`](https://github.com/openai/tiktoken/blob/main/tiktoken/load.py#L146-L158), combines them with the same `PRE_TOKEN_REGEX`, and returns a tiktoken `Encoding`. Both functions receive the artifact path from the caller, so the file can be named and stored wherever the caller chooses.

```python
def save_encoding(tokenizer, path) -> Path:
    ...


def load_encoding(path) -> tiktoken.Encoding:
    ...
```

Install tiktoken and the small dependency used by its file writer:

```bash
python -m pip install tiktoken blobfile
```

## Test your port

With that in place, train your tokenizer on the multilingual corpus with the vocabulary size you chose above, save the learned ranks, then load the finished encoding with tiktoken. As always, verify that both implementations produce the same token IDs and decode the example back to the original text:

```python
import os

from bpe_tokenizer import BPETokenizer
from tiktoken_adapter import load_encoding, save_encoding


tokenizer = BPETokenizer(process_count=os.cpu_count() or 1)
tokenizer.train(training_text, vocab_size=8192)

path = "artifacts/crackr_multilingual.tiktoken"
save_encoding(tokenizer, path)
encoding = load_encoding(path)

example = "English · العربية · 中文 · हिन्दी · Русский · 日本語 · 한국어 · ไทย"
original_ids = tokenizer.encode(example)
ported_ids = encoding.encode(example)

assert ported_ids == original_ids
assert encoding.decode(ported_ids) == example
```

## Before you submit

- [ ] `mergeable_ranks` contains the 256 byte tokens and every token learned during training.
- [ ] `save_encoding` and `load_encoding` use the artifact path supplied by the caller.
- [ ] `BPETokenizer` and tiktoken produce the same IDs for fresh multilingual text.
- [ ] The saved encoding loads without the corpus and survives an encode and decode round trip.

> Ready to submit? [Run the automated evaluation on Crackr](https://app.crackr.dev/projects/build-your-own-tokenizer).

## Stuck?

Try to struggle with the problem first. Open these only when you are genuinely stuck.

### Build the reverse table inside train

Start `mergeable_ranks` with `bytes([token_id]) → token_id` for IDs 0 through 255. Inside the merge loop, add the reverse entry immediately after you add the new token to `vocab`. Do not forget to assign the finished table to `self.mergeable_ranks` at the end of training.

### Pass the rank table directly to the writer

You do not need to encode the bytes yourself or write the file line by line. Call `dump_tiktoken_bpe` with `tokenizer.mergeable_ranks` and the caller's path. If you converted the path to a `Path`, pass `str(path)` to tiktoken's file helpers.

### The file is only the ranks

After `load_tiktoken_bpe` gives you the ranks, construct a `tiktoken.Encoding` with those ranks and the exact same `PRE_TOKEN_REGEX` used by your trainer. You can use the file stem as the encoding name. If decoding works but the IDs differ, check the regex first. A different pretoken boundary produces a different merge sequence.

---

[← Previous](01-scale-up-training.md) · [Guide contents](../../README.md) · [Next →](03-build-a-tokenizer-playground.md)
