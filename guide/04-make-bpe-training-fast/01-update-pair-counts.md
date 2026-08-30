# Update pair counts

Keep one pair-frequency table alive throughout training, and update only the counts changed by each merge.

> **Before we start**
>
> Performance work is hard to test without forcing everyone into the same implementation. This stage therefore has no automated evaluation. We'll explain one optimization at a time, but how you structure it is up to you. Add the optimization trick, rerun the benchmark, then complete each substage manually.

Let's first identify the problem we're trying to solve. Currently, our algorithm pretokenizes the corpus, counts every adjacent pair, and stores those counts in a pair-frequency table. That table is what we use to choose the most frequent pair. We merge it, then calculate the complete table again before choosing the next winner.

But since we already calculated the table, why not just keep it and use it for every merge round? It is a simple but important question we might ask. The reason is that once we apply a merge, that table no longer describes the pretokens we have.

## Why do we count again?

Take one tiny pretoken: `[a, b, a, b]`. Its pair table says that `(a, b)` appears twice and `(b, a)` appears once. So `(a, b)` wins. We mint token `256` for it and replace both nonoverlapping occurrences. The pretoken becomes `[256, 256]`.

```text
[a, b, a, b]  -- (a, b) → 256 -->  [256, 256]
```

The old table would still say that `(a, b)` and `(b, a)` exist, but after the merge neither exists anymore. It also knows nothing about the new pair `(256, 256)`. It is an old snapshot of the trainer's state, per se. That is why we need to calculate the table again after every merge in our implementation. It is correct, but rather wasteful.

## Reuse what we counted

Now our optimization is pretty simple. We keep the same table. When a pretoken is modified, we subtract the pairs contributed by its old form, apply the merge, then add the pairs contributed by its new form. So we **only repair the counts contributed by pretokens that actually changed**. Pretokens that did not change do not need to be counted again because their existing counts are still correct.

Update `BPETokenizer.train` to do this. How you organize the update is up to you.

## Run the benchmark again

After you implement the optimization, open the benchmark you saved in the previous substage and run the same benchmarks against the optimized tokenizer. Keep the Tiny Shakespeare corpus, vocabulary size of 1,024, and Python environment unchanged. Both versions should, of course, produce `459,792` tokens and `2.43x` compression.

```bash
time python bpe_tokenizer.py
python -m cProfile -s cumulative bpe_tokenizer.py
```

I ran the original version and the optimized version on the same machine. Here is the comparison:

```text
                         before     after
complete run             16.52s      9.63s
tokens                   459,792    459,792
compression                2.43x      2.43x
```

The complete run dropped from `16.52s` to `9.63s`. That is 6.89 seconds saved, about 42% less time, or a **1.71x speedup**.

Compare your new result with the baseline you saved rather than with ours, of course. We stopped rebuilding the entire pair table, but training still scans every stored pretoken to find the few that contain the winning pair and can change. That is a separate piece of unnecessary work, and we will remove it shortly. First, the next substage takes one independent piece of work, the initial pretokenization pass, and spreads it across CPU processes.

---

[← Previous](../03-build-a-bpe-tokenizer/04-benchmark-your-bpe.md) · [Guide contents](../../README.md) · [Next →](02-pretokenize-in-parallel.md)
