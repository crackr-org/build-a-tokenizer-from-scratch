# Scale up training

Give BPE more than Shakespeare to learn from.

So far, our tokenizer has been a learning model at best. We used Tiny Shakespeare and a vocab of 1024, which was quite small. We still managed to make it bulletproof to unknown text.

If we feed it Arabic, Mandarin, modern web text, or pretty much anything else, it will still encode every byte. **It just may not do so efficiently.** Our training corpus did not contain enough examples or patterns, and thus our BPE did not learn a lot of useful merges. Hence, a lot of text during inference might stay **much closer to raw UTF-8 bytes and take more tokens.**

We spent the previous stage making training fast for a reason so that now we can spend that speed on a larger vocabulary and a corpus that looks a little more like actual reasonable training data.

## A larger training corpus

This still will not be the corpus we use for our final tokenizer. In the next substage, we will train once more and save what the tokenizer learns so it can be loaded again without training. To avoid paying for two large runs, we will keep this demonstration small and use it to see what changes when BPE learns from something much more varied than Shakespeare.

The corpus decides which byte patterns are worth merging. More bytes give the trainer better frequency estimates, while more variety exposes it to patterns from different languages and writing systems.

For this run, we will build roughly **3 MiB of training data from [mC4](https://huggingface.co/datasets/allenai/c4)**, a multilingual dataset containing more than 100 languages. We’ll take **1 MiB each of English, Arabic, and Mandarin**.

As you can see, this is much larger than our Tiny Shakespeare corpus of 11 kB. However, it is still very small. 3 MiB does not produce anything like a real tokenizer. It gives us enough data to see how a more varied corpus changes what BPE learns while keeping this demonstration to a few minutes.

## Build the corpus

Create `build_corpus.py`. The script streams the language configurations in `SOURCES` from mC4 and writes them into a single UTF-8 text file. Each entry contains the language label, its mC4 configuration, and the number of MiB to collect. For this run, all three are set to 1 MiB.

```python
from pathlib import Path

from datasets import load_dataset


MEBIBYTE = 1024 * 1024
DATASET = "allenai/c4"

SOURCES = (
    ("English", "en-multi", 1),
    ("Arabic", "ar", 1),
    ("Mandarin", "zh", 1),
)


def collect(subset, byte_target):
    rows = load_dataset(
        DATASET,
        name=subset,
        split="train",
        streaming=True,
    )
    documents = []
    byte_count = 0

    for row in rows:
        text = row["text"].strip()
        if not text:
            continue

        documents.append(text)
        byte_count += len(text.encode("utf-8"))

        if byte_count >= byte_target:
            break

    return "\n\n".join(documents)


sections = []
for language, subset, size_mib in SOURCES:
    print(f"Collecting {language}")
    sections.append(collect(subset, size_mib * MEBIBYTE))

corpus = "\n\n".join(sections)
total_mib = sum(size_mib for _, _, size_mib in SOURCES)
output = Path(f"data/mc4-multilingual-{total_mib}mib.txt")
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(corpus, encoding="utf-8")

print(f"Saved {len(corpus.encode('utf-8')):,} bytes to {output}")
```

For convenience, we used [`datasets`](https://huggingface.co/docs/datasets/index), Hugging Face's Python library for downloading and streaming datasets. Install it if you don't already have it:

```bash
python -m pip install datasets
```

> Don’t forget to add `data/` to `.gitignore` if it is not there already to not bloat your git history.

## Train your tokenizer

We’ll train this tokenizer with a vocabulary of 2,048 tokens. The first 256 are the raw byte tokens, leaving BPE 1,792 new tokens to learn from our corpus.

Use the optimized `BPETokenizer` you built in the previous stage and train it on the corpus we just created:

```python
import os
from pathlib import Path
from time import perf_counter

from bpe_tokenizer import BPETokenizer


text = Path("data/mc4-multilingual-3mib.txt").read_text(
    encoding="utf-8"
)

tokenizer = BPETokenizer(process_count=os.cpu_count() or 1)
started = perf_counter()
tokenizer.train(text, vocab_size=2048)
training_seconds = perf_counter() - started

ids = tokenizer.encode(text)
byte_count = len(text.encode("utf-8"))

print(f"training: {training_seconds:.2f}s")
print(f"tokens: {len(ids):,}")
print(f"compression: {byte_count / len(ids):.2f}x")

assert tokenizer.decode(ids) == text
```

> In the next section, you will choose the corpus size, languages, and vocabulary for the final training run based on your machine and how long you are willing to wait. That run will be saved instead of discarded when the process ends.

Test your tokenizer’s multilingual capabilities. Give it text in all three languages we trained on:

```python
examples = (
    (
        "English",
        "A tokenizer should handle fresh text, punctuation, and numbers like 2026.",
    ),
    (
        "Arabic",
        "يجب أن يتعامل المحلل مع نص عربي جديد، وعلامات الترقيم، والأرقام ٢٠٢٦.",
    ),
    (
        "Mandarin",
        "分词器应该能够处理新的中文文本、标点符号和数字 2026。",
    ),
)

for language, example in examples:
    ids = tokenizer.encode(example)
    assert tokenizer.decode(ids) == example
    byte_count = len(example.encode("utf-8"))

    print(f"{language}: {example}")
    print(f"{byte_count} bytes -> {len(ids)} tokens")
```

Try a few inputs of your own and see what BPE learned from the new corpus. Compare different languages, code, and text with lots of punctuation. In the next section, we will choose a larger final run, save the learned encoding, and load that exact tokenizer through `tiktoken` without training it again.

> **About the corpus**
>
> mC4 is far larger than the three small slices we use here. Read [the mC4 dataset card](https://huggingface.co/datasets/allenai/c4) to understand where the text came from, how it was filtered, and what limitations remain.

---

[← Previous](../04-make-bpe-training-fast/04-build-a-pair-heap.md) · [Guide contents](../../README.md) · [Next →](02-port-your-tokenizer-to-tiktoken.md)
