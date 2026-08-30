# Benchmark your BPE implementation

Before we make the trainer fast, we need to know exactly what is slow. Work out the cost of the current loop, measure it on Tiny Shakespeare, and keep the result as our baseline.

In the previous substage, as an example, we asked our tokenizer to learn 20 merges. That is small enough to hide a bad algorithm. If you have not tried it yet, increase the vocabulary size. A good target for Tiny Shakespeare is 1,024. That should make the problem much easier to see.

Needless to say, our algorithm is pretty slow. In the next stage, we'll try to optimize it. But before making any changes to the implementation, **we need a baseline**. The corpus, vocabulary size, Python environment, and correctness check must stay fixed. Otherwise, it is hard to tell whether a change actually made the tokenizer faster.

## Terminology

Let's give names to the values that control the current trainer:

| Symbol | Name | Meaning |
| --- | --- | --- |
| `n` | Corpus size | The size of the training text, measured here in UTF-8 bytes. Pretokenization processes it once before the merge loop begins. |
| `Sᵢ` | Stored token positions | At merge round i, add up the current lengths of all unique pretokens. Repeated pretokens are stored once, so they do not add positions to Sᵢ, but their frequency still weights the pair counts. |
| `Pᵢ` | Distinct adjacent pairs | The number of keys in the pair-frequency table at round i. Every key must occur at an adjacent position, so Pᵢ cannot be larger than Sᵢ. |
| `M` | Requested merges | The target vocabulary size minus the 256 starting byte tokens. The trainer may learn fewer only if no adjacent pair remains. |

Pretokenization processes the corpus once, so it costs `O(n)`. During merge round i, the trainer counts every adjacent pair in `O(Sᵢ)`, scans the pair table to choose the winner in `O(Pᵢ)`, and walks every stored pretoken again to apply that winner in `O(Sᵢ)`.

We can see that waste in the first Tiny Shakespeare merge. The trainer stores 15,057 unique pretokens and checks every one of them during replacement, even though only 543 contain the winning pair. In other words, 96.4% of those checks cannot change anything. After applying the merge, this implementation throws away the entire pair-frequency table. The next round rebuilds it by scanning every stored pretoken again.

### Training complexity

*Actual run · Tiny Shakespeare. Counted visits, not seconds.*

| Target vocabulary size | Cumulative visits |
| ---: | ---: |
| 256 | 0 |
| 276 | 3.810M |
| 320 | 10.786M |
| 384 | 19.711M |
| 512 | 35.723M |
| 768 | 64.626M |
| 1,024 | 91.513M |

These are not points generated from the complexity formula. At 276 vocabulary entries, the real 20-merge run performs about **3.8 million** adjacent position, token position, and pair-table visits.

At 1,024 entries, the real 768-merge run pushes the same corpus past **91 million**. This graph counts work, not machine-dependent seconds.

In round i, pair counting visits fewer than Sᵢ adjacent positions, replacement visits Sᵢ token positions, and choosing the winner visits Pᵢ pair-table entries. The scanning work for that round is therefore bounded by `2Sᵢ + Pᵢ`. The sequences shrink as merges are applied, so later rounds can be a little cheaper. But because `Pᵢ ≤ Sᵢ ≤ S₀`, the useful worst-case bound is **O(M · S₀)**. Add pretokenization and the whole training run is **O(n + M · S₀)**.

This is the expensive part: after one pair is merged, most pairs in the corpus have not changed, yet we throw the entire frequency table away and rebuild it. Then we walk every pretoken, including the ones that never contained the winning pair. The next stage will remove that repeated work. For now, we want to see it clearly.

## What about encode and decode?

Training is our obvious slowdown, but nonetheless our encoder repeats a smaller version of the same work. For example, take one pre-token containing L byte IDs. The encoder scans its current pairs to find the learned merge with the lowest rank. If it finds one, it walks the sequence again to apply that merge, then starts over with the shorter result.

There can be at most `min(M, L - 1)` successful rounds, followed by one last scan that finds nothing else to merge. The resulting upper bound is **O(L · (1 + min(M, L)))**. When the number of learned merges is at least as large as the pretoken, that approaches **O(L²)**.

Each token ID already points to its original bytes, so the decoder looks up those bytes, joins them in order, and decodes the complete UTF-8 stream once. If that stream contains B bytes, decoding costs **O(B)**.

### Encoding/Decoding complexity

*Actual run · Tiny Shakespeare · vocab 1,024. Counted visits, not seconds.*

| Tiny Shakespeare prefix | Encoding visits | Decoding visits |
| ---: | ---: | ---: |
| 0 bytes | 0 | 0 |
| 128 KiB | 879,003 | 185,122 |
| 256 KiB | 1,773,999 | 369,463 |
| 384 KiB | 2,676,640 | 554,233 |
| 512 KiB | 3,531,177 | 739,505 |
| 640 KiB | 4,393,997 | 924,369 |
| 768 KiB | 5,270,671 | 1,109,133 |
| 896 KiB | 6,135,615 | 1,294,057 |
| 1 MiB | 7,007,108 | 1,479,590 |

Every point comes from the actual tokenizer after training it on Tiny Shakespeare with 1,024 vocabulary entries.

Encoding counts pair positions, candidate-pair checks, and merge-pass positions. Decoding counts token lookups and reconstructed bytes.

The trainer's working memory holds the pretokens and their frequencies, the pair table, the merge table, and the vocabulary. That is roughly `O(S + P + M)` entries. Remember that vocabulary entries contain byte strings of different lengths, so counting dictionary entries alone does not describe every byte allocated.

## Benchmark the program

Use a vocabulary size of 1,024 in `bpe_tokenizer.py` to benchmark your tokenizer. Then run these commands using the training example from the previous substage.

The first command runs the Tiny Shakespeare training example once and reports how long the complete run takes. The second repeats that same run through [cProfile](https://docs.python.org/3/library/profile.html) and sorts the result by cumulative time. This is a deliberately simple benchmark, but enough to give us a baseline.

```bash
time python bpe_tokenizer.py
python -m cProfile -s cumulative bpe_tokenizer.py
```

I ran the complete program three times against our actual tokenizer on my MacBook Pro (12-core Apple M2 Pro, 32 GB of memory) and kept the median. Needless to say, your time will differ because it depends on your machine, but the token count and compression should match.

```text
tokens: 459,792
compression: 2.43x
median of 3 complete runs: 16.517s
```

The profiler produces a much longer table. These are the relevant rows that we care about:

```text
ncalls    tottime  cumtime  function
1           5.378   44.103  bpe_tokenizer.py:116(train)
1           0.607    3.591  bpe_tokenizer.py:163(encode)
1           0.000    0.069  bpe_tokenizer.py:184(decode)
```

In our run, training owns 44.103 seconds of cumulative time, while encoding is much smaller and decoding is almost negligible.

> **Implementation details may differ**
>
> Everything below `train` depends on how you designed the implementation. Pair counting and replacement may be methods, standalone helpers, local functions, or code written directly inside `train`. If they are helpers, inspect the rows with the largest `cumtime` and `ncalls`. If the work is inline, it remains inside `train`'s `tottime`.

Save the benchmark somewhere, copy it or take a screenshot. We'll need it later to compare with future benchmarks when we optimize our algorithm.

---

[← Previous](03-implement-bpe.md) · [Guide contents](../../README.md) · [Next →](../04-make-bpe-training-fast/01-update-pair-counts.md)
