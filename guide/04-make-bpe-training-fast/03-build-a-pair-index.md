# Build a pair index

Stop searching every stored pretoken after each merge and go directly to the few that contain the winning pair.

In our simple optimization, [“Update Pair Counts”](01-update-pair-counts.md), we stopped throwing away the pair-frequency table after every merge. We kept it and repaired only the contributions of pretokens that changed. So we stopped doing a lot of repeated counting, and that, courtesy of this optimization, dropped our runtime from 16.52 seconds to 9.63 seconds. We'll happily take that. But still, there is room for improvement, as our trainer is still doing a rather expensive search operation.

Taking the same example again, say the pair `(t, h)` wins in round `i`. The pair-frequency table tells us how many times that pair appears across the corpus, but it does not tell us which pretokens contain it. To find them, our current trainer still walks every stored pretoken:

```text
for pretoken in all_pretokens:
    if winner not in adjacent_pairs(pretoken):
        continue

    repair_counts_and_merge(pretoken)
```

Update Pair Counts removed the repeated counting, but it did not remove the search. A pretoken that does not contain the winning pair no longer has all of its adjacent pairs counted again. But our trainer still has to inspect that pretoken to ask whether it contains the winner. That is to say, if **we have 15,000 stored pretokens and only 500 contain the winning pair, we still perform 15,000 checks just to discover those 500.**

## Build an index

There is this famous maxim in CS, grandly known as the [“Fundamental Theorem of Software Engineering”](https://en.wikipedia.org/wiki/Fundamental_theorem_of_software_engineering) usually attributed to [David Wheeler](https://www2.dmst.aueb.gr/dds/pubs/inbook/beautiful_code/html/Spi07g.html), a maxim that I find amusing at times:

> All problems in computer science can be solved by another level of indirection.
>
> — Attributed to David Wheeler

It fits our optimization unusually well, so we might as well cash it in for some intellectual credibility without sounding pretentious.

A level of indirection simply means putting something in the middle that tells us where to go. One simple way to visualize it, if you are not familiar with an index, is to think of the index at the back of a book. Instead of searching every page for a word, you look up the word in the index, and it gives you the relevant page numbers. We'll do the same thing with our pretokens.

Right now, when the pair from our example, `(t, h)`, wins, we search every pretoken to find the ones containing it:

```text
(t, h) → inspect 0 → inspect 1 → inspect 2 → inspect 3
```

Suppose only pretokens `0` and `2` contain the pair. The core idea is that we can remember that ahead of time by using another dictionary to store these locations:

```text
pair_index[(t, h)] → {0, 2}
```

That dictionary is our **pair index**. It sits between the pair and the pretokens containing it, which is the extra level of indirection Wheeler's quote is talking about. And so, when `(t, h)` wins, we look it up in the index and go directly to pretokens `0` and `2`.

The index, of course, should describe the pretokens as they exist right now, so it must change with them. When a pair wins, copy its affected IDs before modifying the index. For each of those pretokens, remove its old pairs from both dictionaries, apply the merge, then add its new pairs back:

```text
affected_ids = pair_index[winner]

for pretoken_id in affected_ids:
    remove the pretoken's old pairs from the counts and index
    apply the winning merge
    add the pretoken's new pairs to the counts and index
```

With the index, finding the affected set should be one dictionary lookup. We still have to update the pretokens that actually contain the winner, of course.

Update `BPETokenizer.train` to build and maintain this pair index. Keep the incremental count updates from the first substage.

## Benchmark again!

Keep Tiny Shakespeare, the vocabulary size of 1,024, your Python environment, and the parallel pretokenization path unchanged. Run the same benchmark again and compare it with the result you saved from the previous substage:

```bash
time python bpe_tokenizer.py
python -m cProfile -s cumulative bpe_tokenizer.py
```

I ran the version from the previous substage and the new pair-index version on the same machine. Here is the comparison:

```text
                         before     pair index
complete run              9.70s          2.71s
tokens                   459,792        459,792
compression                2.43x          2.43x
```

The complete run dropped from `9.70s` to `2.71s`, a **3.58x speedup**.

We can now choose the winning pair and go directly to the pretokens that contain it. But we still have to decide which pair won. Our pair-frequency table is a dictionary from each pair to its current count, which it stores unsorted. So at every merge round, we call `max(...)` and linearly walk the dictionary again to rediscover the pair with the largest count. That repeated search is our last bottleneck.

---

[← Previous](02-pretokenize-in-parallel.md) · [Guide contents](../../README.md) · [Next →](04-build-a-pair-heap.md)
