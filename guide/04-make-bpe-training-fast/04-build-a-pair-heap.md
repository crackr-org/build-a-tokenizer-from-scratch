# Build a pair heap

Stop walking the complete pair-frequency table to choose every winner, and understand when the extra heap bookkeeping is worth it.

In [“Build a Pair Index”](03-build-a-pair-index.md) we got rid of one expensive search. We removed the linear scan from every merge round thanks to our reverse index from each pair to the pretokens that contain it. Once the winning pair is selected, we no longer scan the complete pretoken collection to decide which pretokens need updating.

We still have another slow search to deal with. Before we look up our pair index, we of course need to pick a winning pair. Since the counts live in a regular Python dictionary, looking up the count of one pair is, on average, a pretty cheap `O(1)` operation. Finding the pair with the largest count, however, is not as cheap because we have to walk the whole dictionary to find it:

```text
pair-frequency table
(101, 114)  →   4
(105, 110)  →   7
(116, 104)  →  12
(104, 101)  →   9
...

find maximum  →  (116, 104)
```

Since all we want is the pair with the largest count, one immediate instinct is to sort the table by frequency and take the first entry. The problem is that sorting all `P` pairs costs `O(P log P)`, so we would actually be doing more work than our current `O(P)` scan.

But think about what we actually need because we couldn't care less about the ordering that sorting gives us. All we need at each merge round is to know: **which pair has the largest current count?**

This gives us a much narrower set of requirements. We need something that:

- can store a pair together with its frequency as a key/value entry.
- returns the pair with the largest frequency reasonably cheaply.

One tool built around exactly this set of requirements is a **priority queue**.

> **A note on priority queues**
>
> A queue answers a simple question: which item should come out next? In an ordinary queue, the answer is whichever item arrived first. In a priority queue, every item arrives with a priority, and the item with the highest priority comes out first.
>
> Its usual interface is deliberately small: insert an item with a priority, inspect the highest-priority item, and remove that item. Some implementations also support changing the priority of an item already inside the queue. That matches the two operations we need: keep pair-frequency entries and retrieve the pair with the largest frequency without searching through all of them.
>
> One important detail is that a priority queue is not one specific way of arranging data in memory. An unsorted array, a sorted array, a balanced search tree, and a binary heap can all implement its interface. They differ in the cost of each operation. That is to say, choose wisely depending on your requirements.
>
> Priority queues appear anywhere work must be chosen by importance rather than arrival time: operating-system scheduling, network routing, discrete-event simulation, and graph algorithms such as Dijkstra's shortest-path algorithm.
>
> That is enough for what we are building. If priority queues are new to you and you want to dig deeper, these are worth reading:
>
> - Princeton Algorithms — [Priority Queues](https://algs4.cs.princeton.edu/24pq/)
> - Stanford CS106B — [Priority Queues and Binary Heaps](https://web.stanford.edu/class/archive/cs/cs106b/cs106b.1244/lectures/16-pqheap/)
> - Carnegie Mellon University — [Priority Queues and Heaps](https://www.cs.cmu.edu/~rdriley/121/notes/heaps/)
> - Python documentation — [queue.PriorityQueue](https://docs.python.org/3/library/queue.html#queue.PriorityQueue)

Okay, so which priority-queue implementation makes the most sense for our requirements? As we mentioned, what we need is a data structure that keeps the **highest-frequency pair easy to reach as the counts change**.

Remember, we do not need every pair sorted. We only need the current max pair, and once it is removed, the structure needs to do a small amount of work to bring the next winner forward.

A **binary heap** is a perfect fit for this. It keeps the largest entry at the top and maintains only enough order underneath it to repair itself when entries are inserted or removed.

> **A note on heaps**
>
> A heap is a tree-based data structure built around one local rule. In a max-heap, every parent has a priority at least as large as its children. If that rule holds throughout the tree, the largest item must be at the root.
>
> The rest of the heap is not completely sorted. Two siblings do not have to be ordered, and neither do nodes on different branches. The heap maintains only the parent-child relationships needed to keep the next item at the root.
>
> A binary heap gives every node at most two children and fills each level before beginning the next. That shape lets us store the tree compactly inside an array. Reading the root costs O(1), while inserting an item or removing the root costs O(log n).
>
> If heaps are new to you, these are worth reading:
>
> - MIT OpenCourseWare — [6.006 Lecture 8: Binary Heaps](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-8-binary-heaps/)
> - Harisai — [Heaps Demystified](https://iamharisai.in/2025/11/22/heaps/)

```text
valid max-heap:       insert 12:          bubble up:

       9                    9                  12
     /   \                /   \               /  \
    4     7              4     7             9    7
                        /
                       12                   4

12 > 4, then 12 > 9. The inserted value becomes the root.
parent ≥ child · root = max
```

## Build the pair heap

Okay, let's bring this back to our tokenizer. Our trainer maintains a pair-frequency table to map each live pair to its current count. We'll add a heap whose job is to keep our next candidate winner easy to reach.

At the beginning of training, we put every pair and its frequency into the heap once. The root at `heap[0]` then replaces the `max(...)` call that scanned the complete dictionary during every merge round.

Python 3.14 makes this pretty straightforward with [heapq](https://docs.python.org/3/library/heapq.html) and its max-heap API, so we can `heapify_max(...)` our initial pair frequencies, `heappush_max(...)` new entries as counts change, and `heappop_max(...)` whenever we need the max pair. The largest entry is always at `heap[0]`.

Building the initial heap from all `P` live pairs costs `O(P)`. Reading its root costs `O(1)`, while inserting or removing an entry costs `O(log P)`.

Okay! So we got rid of our expensive search, but we introduced one problem: our pair frequencies change. After a merge, we repair the pair-frequency table, but the entries inside the heap do not update themselves.

We could potentially search through the heap, find every old entry, and edit or remove it. But then we would be back to a linear scan.

What we should do is not search for stale entries. **When a pair count changes, we push a new entry with the updated count. When an entry later reaches the root, compare it with the current pair-frequency table before accepting it**:

- If the pair no longer exists, discard the heap entry.
- If its stored count disagrees with the dictionary, discard it.
- If both agree, this is the current max pair.

We remove stale roots to sync our heap with our dictionary. This is known as [lazy deletion](https://en.wikipedia.org/wiki/Lazy_deletion). Instead of spending time finding an old entry when it becomes invalid, we discard it only if it eventually reaches the root. Lazy, but effort-saving.

```text
heap root          pair table                    decision
t + h · 100        missing                       discard
h + e · 95         h + e · 80                    discard
256 + e · 92       256 + e · 92                  current max
```

One important note is that stale entries will accumulate, so the heap cannot grow forever. We need to rebuild it from the live pair-frequency table when it becomes much larger than that table. A practical starting point is to rebuild when the heap contains more than three times as many entries as there are live pairs.

Update `BPETokenizer.train` to build and maintain the heap. Push updated priorities, reject stale roots, and rebuild the heap when stale entries surpass the threshold.

```text
build the heap from the current pair counts

repeat for every merge:
    pop until an entry agrees with the pair-frequency table
    use that valid entry as the winner
    find affected pretokens through the pair index
    repair their counts and index entries
    push fresh candidates for the pairs that changed
    rebuild the heap when stale entries begin to dominate
```

## Benchmark

Run the same benchmark first with a vocabulary size of 1,024. Then raise it to 5,000 and run both versions again. The larger vocabulary is about 4,744 merge rounds, which gives the repeated dictionary scan enough chances to become expensive.

```bash
time python bpe_tokenizer.py
python -m cProfile -s cumulative bpe_tokenizer.py
```

I ran our pair-heap implementation on the same machine three times and kept the median:

```text
vocabulary      pair index    pair heap    speedup
1,024               2.65s         1.98s       1.34x
5,000              10.16s         2.22s       4.57x
```

At 1,024 entries, the heap reduced our runtime from 2.65 seconds to 1.98 seconds, a 1.34x speedup. At 5,000 entries, it dropped from 10.16 seconds to 2.22 seconds, a 4.57x speedup.

The gap grows because our previous pair-index optimization pays a complete dictionary scan on every merge, while the heap does more bookkeeping whenever counts change but avoids repeating that scan thousands of times. This is also why a heap may fail to help on a small vocabulary: there may not be enough later merges to repay its own overhead.

Stepping back for a second, our naive trainer took **16.52 seconds** at **1,024 entries**. Reusing the pair counts brought that down to **9.63 seconds**. Parallel pretokenization landed at **9.70 seconds**. The pair index took us to **2.65 seconds**, and the heap finished the same run in **1.98 seconds**. From our first version to this one, that is **14.54 seconds** removed from the same benchmark, or roughly an **8.34x speedup**.

---

[← Previous](03-build-a-pair-index.md) · [Guide contents](../../README.md)
