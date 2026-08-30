import type { ReactNode } from "react";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonReadingNote } from "../../components/LessonReadingNote";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const benchmarkCommands = [
  "time python bpe_tokenizer.py",
  "python -m cProfile -s cumulative bpe_tokenizer.py",
].join("\n");

const boundaryCheck = [
  "import os",
  "from pathlib import Path",
  "",
  'text = Path("tiny_shakespeare.txt").read_text(encoding="utf-8")',
  "",
  "sequential = _pretokenize(text)",
  "parallel = _pretokenize_parallel(text, os.cpu_count() or 1)",
  "",
  "assert parallel == sequential",
  'print(f"unique pretokens: {len(parallel):,}")',
  'print(f"total pretokens: {sum(parallel.values()):,}")',
].join("\n");

const benchmarkComparison = [
  "                              one process    12 processes",
  "pretokenization only              0.165s           0.154s",
  "complete tokenizer run            9.63s             9.70s",
  "tokens                           459,792          459,792",
  "compression                       2.43x            2.43x",
].join("\n");

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-7 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
      {children}
    </h2>
  );
}

export function ParallelPretokenizationPage({
  estimatedMinutes,
}: {
  estimatedMinutes: number;
}) {
  return (
    <article className="mx-auto w-full max-w-[920px] pb-20 pt-4 sm:pt-8">
      <header className="mx-auto max-w-[740px] pb-12 sm:pb-14">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="size-2 border border-cr-brand bg-cr-accent" />
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cr-text-3"
              style={monoStyle}
            >
              Make BPE training fast
            </p>
          </div>
          <p className="text-[10px] font-bold text-cr-text-3" style={monoStyle}>
            {estimatedMinutes} min
          </p>
        </div>

        <div className="mt-6 h-[2px] bg-cr-border-light">
          <div className="h-[2px] w-40 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[700px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Pretokenize in parallel
        </h1>

        <p
          className="mt-6 max-w-[710px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          How parallel pretokenization works, where we can safely split the
          corpus, and when the extra processes are worth it.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <p className={bodyClassName}>
            Now we want to turn our attention one step before the merge loop:
            pretokenization. Our program runs the GPT-2 regex over our corpus
            and builds our pretoken frequency table. And right now, one Python
            process does all of that.
          </p>

          <p className={bodyClassName}>
            So, can we divide that work between our CPU cores? We can. Unlike the
            merge loop,{" "}
            <strong className="font-semibold text-cr-text">
              pretokenization does not have to happen in order. Merge 257 may
              depend on token 256, which means every merge round must wait for
              the one before it.
            </strong>{" "}
            But pretokenizing one part of the corpus does not depend on the
            result from another part. We can process both pieces at the same
            time, then add their frequency tables together.
          </p>

          <SectionTitle>Okay, but where can we split?</SectionTitle>

          <p className={bodyClassName}>
            We cannot just cut the text wherever we like, though. Originally,{" "}
            <LessonInlineCode>hello</LessonInlineCode> is one pretoken:{" "}
            <LessonInlineCode>[&quot;hello&quot;]</LessonInlineCode>. If we cut it
            as <LessonInlineCode>hel|lo</LessonInlineCode>, one worker sees{" "}
            <LessonInlineCode>[&quot;hel&quot;]</LessonInlineCode> and the other sees{" "}
            <LessonInlineCode>[&quot;lo&quot;]</LessonInlineCode>. The adjacent pair{" "}
            <LessonInlineCode>l + l</LessonInlineCode> existed in the original
            word, but it now sits across the worker boundary, so neither worker
            counts it. We will be missing naturally occurring pairs.
          </p>

          <p className={bodyClassName}>
            What we need is to{" "}
            <strong className="font-semibold text-cr-text">
              cut only where the pretokenizer already has to stop
            </strong>
            . A safe place is immediately before a run of whitespace:{" "}
            <LessonInlineCode>hello| world</LessonInlineCode>. The left chunk
            ends before the whitespace, while the right chunk keeps the
            complete whitespace run and the text that follows it.
          </p>

          <p className={bodyClassName}>
            Verify the boundary logic locally before benchmarking it. Build the
            pretoken-frequency dictionary once from the complete corpus and
            once by combining the dictionaries returned by your workers, then
            assert that both dictionaries are equal. The merge loop receives
            this dictionary as its training data, so exact equality means the
            parallel path has not changed what BPE will learn from.
          </p>

          <LessonCodeBlock
            code={boundaryCheck}
            language="python"
            label="Python"
          />

          <SectionTitle>Give each process a piece</SectionTitle>

          <p className={bodyClassName}>
            Now update the pretokenization phase of{" "}
            <LessonInlineCode>BPETokenizer.train</LessonInlineCode>. Try to split
            the corpus into roughly equal pieces and give each piece to a
            separate worker process. Each worker runs the GPT-2 regex on its
            piece of the corpus, and the parent process combines all of its
            children&apos;s work at the end into one pretoken table.
          </p>

          <p className={bodyClassName}>
            One slightly annoying Python detail is that the worker function
            must live at module level so it can be sent to another process.
            Keep the runnable benchmark inside{" "}
            <LessonInlineCode>
              if __name__ == &quot;__main__&quot;:
            </LessonInlineCode>{" "}
            as well, otherwise every worker may import the file and start the
            benchmark all over again.
          </p>

          <PythonParallelismNote />

          <SectionTitle>Benchmark again!</SectionTitle>

          <p className={bodyClassName}>
            Enable parallel pretokenization, keep Tiny Shakespeare, the
            vocabulary size, and everything else unchanged, then run the same
            commands again:
          </p>

          <LessonCodeBlock
            code={benchmarkCommands}
            language="bash"
            label="Terminal"
          />

          <p className={bodyClassName}>
            I did the same thing with my implementation on my machine, with
            twelve CPU cores. The result was not quite the dramatic speedup we
            might have hoped for:
          </p>

          <LessonCodeBlock
            code={benchmarkComparison}
            language="text"
            label="My benchmark"
          />

          <p className={bodyClassName}>
            Pretokenization itself dropped from roughly 0.165 seconds to 0.154
            seconds, a saving of eleven milliseconds. The complete tokenizer,
            however, went from 9.63 seconds to 9.70 seconds. Yeah, it got
            slower.
          </p>

          <SectionTitle>Wait, what?</SectionTitle>

          <p className={bodyClassName}>
            Processes let us spread pretokenization across CPU cores, but
            pretokenization was already less than 2% of the complete run. Even
            if it became instantaneous, the complete tokenizer could only drop
            from roughly 9.63 seconds to 9.47 seconds. So why did our tokenizer
            get slower? Processes are not free. Python has to create the
            workers, import our module inside each one, serialize and send every
            text chunk, receive every frequency dictionary, and then combine
            those dictionaries again in the parent process. We saved eleven
            milliseconds in the actual pretokenization work, but paid more than
            that in process startup and moving data between workers. That is why
            the tokenizer got slower in our benchmark. So for our tiny corpus,
            parallelism was simply more trouble than it was worth. There was not
            enough work to offset the overhead. Give it a much larger dataset,
            though, and this optimization starts to earn its keep.
          </p>

          <p className={bodyClassName}>
            Tiny Shakespeare is only around 1.1 MB. A production model changes
            the scale completely. GPT-2, for example, was trained on{" "}
            <LessonReferenceLink href="https://openai.com/index/better-language-models/">
              40 GB of WebText
            </LessonReferenceLink>
            . At the 0.165 seconds per 1.1 MB we measured from our
            single-process pretokenizer, scanning that much text would take
            roughly 100 minutes. With twelve processes, the absolute best case
            would be around 8 minutes. Once process startup, copying, and memory
            bandwidth are included, something closer to 10 to 20 minutes is a
            more honest estimate.
          </p>

          <p className={bodyClassName}>
            Of course, OpenAI did not publish this timing, and we are not
            claiming GPT-2 used our Python implementation. The point is that eleven
            milliseconds saved on our tiny corpus can become tens of minutes
            once the same scan reaches production-sized data.
          </p>

          <p className={bodyClassName}>
            In the next substage, we target another bottleneck: after choosing
            the winning pair, our trainer still scans every stored pretoken
            just to find the few that contain it.
          </p>
        </div>
      </div>
    </article>
  );
}

function PythonParallelismNote() {
  const readings = [
    {
      author: "Python documentation",
      title: "Concurrent Execution",
      href: "https://docs.python.org/3/library/concurrency.html",
    },
    {
      author: "Itamar Turner-Trauring",
      title: "Python’s multiprocessing performance problem",
      href: "https://pythonspeed.com/articles/faster-multiprocessing-pickle/",
    },
    {
      author: "Real Python",
      title: "Speed Up Your Python Program With Concurrency",
      href: "https://realpython.com/python-concurrency/",
    },
    {
      author: "Victor Skvortsov",
      title:
        "Python behind the scenes #13: the GIL and its effects on Python multithreading",
      href: "https://tenthousandmeters.com/blog/python-behind-the-scenes-13-the-gil-and-its-effects-on-python-multithreading/",
    },
  ];

  return (
    <LessonReadingNote
      label="A note on parallelism in Python"
      readings={readings}
    >
        <p>
          Parallelism in Python is a rather deep topic, but the short version
          is useful here. Concurrency means several tasks can make progress
          during the same period of time. Parallelism means they are
          executing at the same time, usually on different CPU cores. They are
          related, but they are not the same thing.
        </p>

        <p>
          Threads are relatively cheap and share the same memory, which makes
          them excellent when a program spends most of its time waiting for
          files, databases, or the network. But in the default CPython build,
          the Global Interpreter Lock prevents several threads from executing
          Python bytecode at the same time. The regex engine may release that
          lock during parts of a match, but building our Python frequency
          dictionaries is still CPU-bound Python work. Adding threads would
          therefore not reliably spread this complete phase across all cores.
        </p>

        <p>
          Processes get around that by running separate Python interpreters.
          They can execute on several cores, but they do not share ordinary
          Python objects. Chunks and frequency tables have to travel between
          processes, which means serialization, copying, more memory, and
          startup cost. That overhead can offset some or all of the work saved
          on a small corpus.
        </p>

        <p>
          We only need that much to finish this tokenizer. If you want to
          understand the larger picture properly, these are worth reading:
        </p>
    </LessonReadingNote>
  );
}
