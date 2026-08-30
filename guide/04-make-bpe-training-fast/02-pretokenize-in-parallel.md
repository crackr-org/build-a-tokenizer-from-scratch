# Pretokenize in parallel

How parallel pretokenization works, where we can safely split the corpus, and when the extra processes are worth it.

Now we want to turn our attention one step before the merge loop: pretokenization. Our program runs the GPT-2 regex over our corpus and builds our pretoken frequency table. And right now, one Python process does all of that.

So, can we divide that work between our CPU cores? We can. Unlike the merge loop, **pretokenization does not have to happen in order. Merge 257 may depend on token 256, which means every merge round must wait for the one before it.** But pretokenizing one part of the corpus does not depend on the result from another part. We can process both pieces at the same time, then add their frequency tables together.

## Okay, but where can we split?

We cannot just cut the text wherever we like, though. Originally, `hello` is one pretoken: `["hello"]`. If we cut it as `hel|lo`, one worker sees `["hel"]` and the other sees `["lo"]`. The adjacent pair `l + l` existed in the original word, but it now sits across the worker boundary, so neither worker counts it. We will be missing naturally occurring pairs.

What we need is to **cut only where the pretokenizer already has to stop**. A safe place is immediately before a run of whitespace: `hello| world`. The left chunk ends before the whitespace, while the right chunk keeps the complete whitespace run and the text that follows it.

Verify the boundary logic locally before benchmarking it. Build the pretoken-frequency dictionary once from the complete corpus and once by combining the dictionaries returned by your workers, then assert that both dictionaries are equal. The merge loop receives this dictionary as its training data, so exact equality means the parallel path has not changed what BPE will learn from.

```python
import os
from pathlib import Path

text = Path("tiny_shakespeare.txt").read_text(encoding="utf-8")

sequential = _pretokenize(text)
parallel = _pretokenize_parallel(text, os.cpu_count() or 1)

assert parallel == sequential
print(f"unique pretokens: {len(parallel):,}")
print(f"total pretokens: {sum(parallel.values()):,}")
```

## Give each process a piece

Now update the pretokenization phase of `BPETokenizer.train`. Try to split the corpus into roughly equal pieces and give each piece to a separate worker process. Each worker runs the GPT-2 regex on its piece of the corpus, and the parent process combines all of its children's work at the end into one pretoken table.

One slightly annoying Python detail is that the worker function must live at module level so it can be sent to another process. Keep the runnable benchmark inside `if __name__ == "__main__":` as well, otherwise every worker may import the file and start the benchmark all over again.

> **A note on parallelism in Python**
>
> Parallelism in Python is a rather deep topic, but the short version is useful here. Concurrency means several tasks can make progress during the same period of time. Parallelism means they are executing at the same time, usually on different CPU cores. They are related, but they are not the same thing.
>
> Threads are relatively cheap and share the same memory, which makes them excellent when a program spends most of its time waiting for files, databases, or the network. But in the default CPython build, the Global Interpreter Lock prevents several threads from executing Python bytecode at the same time. The regex engine may release that lock during parts of a match, but building our Python frequency dictionaries is still CPU-bound Python work. Adding threads would therefore not reliably spread this complete phase across all cores.
>
> Processes get around that by running separate Python interpreters. They can execute on several cores, but they do not share ordinary Python objects. Chunks and frequency tables have to travel between processes, which means serialization, copying, more memory, and startup cost. That overhead can offset some or all of the work saved on a small corpus.
>
> We only need that much to finish this tokenizer. If you want to understand the larger picture properly, these are worth reading:
>
> - Python documentation — [Concurrent Execution](https://docs.python.org/3/library/concurrency.html)
> - Itamar Turner-Trauring — [Python’s multiprocessing performance problem](https://pythonspeed.com/articles/faster-multiprocessing-pickle/)
> - Real Python — [Speed Up Your Python Program With Concurrency](https://realpython.com/python-concurrency/)
> - Victor Skvortsov — [Python behind the scenes #13: the GIL and its effects on Python multithreading](https://tenthousandmeters.com/blog/python-behind-the-scenes-13-the-gil-and-its-effects-on-python-multithreading/)

## Benchmark again!

Enable parallel pretokenization, keep Tiny Shakespeare, the vocabulary size, and everything else unchanged, then run the same commands again:

```bash
time python bpe_tokenizer.py
python -m cProfile -s cumulative bpe_tokenizer.py
```

I did the same thing with my implementation on my machine, with twelve CPU cores. The result was not quite the dramatic speedup we might have hoped for:

```text
                              one process    12 processes
pretokenization only              0.165s           0.154s
complete tokenizer run            9.63s             9.70s
tokens                           459,792          459,792
compression                       2.43x            2.43x
```

Pretokenization itself dropped from roughly 0.165 seconds to 0.154 seconds, a saving of eleven milliseconds. The complete tokenizer, however, went from 9.63 seconds to 9.70 seconds. Yeah, it got slower.

## Wait, what?

Processes let us spread pretokenization across CPU cores, but pretokenization was already less than 2% of the complete run. Even if it became instantaneous, the complete tokenizer could only drop from roughly 9.63 seconds to 9.47 seconds. So why did our tokenizer get slower? Processes are not free. Python has to create the workers, import our module inside each one, serialize and send every text chunk, receive every frequency dictionary, and then combine those dictionaries again in the parent process. We saved eleven milliseconds in the actual pretokenization work, but paid more than that in process startup and moving data between workers. That is why the tokenizer got slower in our benchmark. So for our tiny corpus, parallelism was simply more trouble than it was worth. There was not enough work to offset the overhead. Give it a much larger dataset, though, and this optimization starts to earn its keep.

Tiny Shakespeare is only around 1.1 MB. A production model changes the scale completely. GPT-2, for example, was trained on [40 GB of WebText](https://openai.com/index/better-language-models/). At the 0.165 seconds per 1.1 MB we measured from our single-process pretokenizer, scanning that much text would take roughly 100 minutes. With twelve processes, the absolute best case would be around 8 minutes. Once process startup, copying, and memory bandwidth are included, something closer to 10 to 20 minutes is a more honest estimate.

Of course, OpenAI did not publish this timing, and we are not claiming GPT-2 used our Python implementation. The point is that eleven milliseconds saved on our tiny corpus can become tens of minutes once the same scan reaches production-sized data.

In the next substage, we target another bottleneck: after choosing the winning pair, our trainer still scans every stored pretoken just to find the few that contain it.

---

[← Previous](01-update-pair-counts.md) · [Guide contents](../../README.md) · [Next →](03-build-a-pair-index.md)
