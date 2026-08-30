import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonReadingNote } from "../../components/LessonReadingNote";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";
import { BinaryHeapVisual } from "./BinaryHeapVisual";
import { LazyDeletionHeapVisual } from "./LazyDeletionHeapVisual";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const pairCountExample = [
  "pair-frequency table",
  "(101, 114)  →   4",
  "(105, 110)  →   7",
  "(116, 104)  →  12",
  "(104, 101)  →   9",
  "...",
  "",
  "find maximum  →  (116, 104)",
].join("\n");

const heapLoop = [
  "build the heap from the current pair counts",
  "",
  "repeat for every merge:",
  "    pop until an entry agrees with the pair-frequency table",
  "    use that valid entry as the winner",
  "    find affected pretokens through the pair index",
  "    repair their counts and index entries",
  "    push fresh candidates for the pairs that changed",
  "    rebuild the heap when stale entries begin to dominate",
].join("\n");

const benchmarkCommands = [
  "time python bpe_tokenizer.py",
  "python -m cProfile -s cumulative bpe_tokenizer.py",
].join("\n");

const benchmarkComparison = [
  "vocabulary      pair index    pair heap    speedup",
  "1,024               2.65s         1.98s       1.34x",
  "5,000              10.16s         2.22s       4.57x",
].join("\n");

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-7 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
      {children}
    </h2>
  );
}

export function BuildPairHeapPage({
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
          <div className="h-[2px] w-64 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[700px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Build a pair heap
        </h1>

        <p
          className="mt-6 max-w-[710px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Stop walking the complete pair-frequency table to choose every
          winner, and understand when the extra heap bookkeeping is worth it.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <p className={bodyClassName}>
            In{" "}
            <Link
              to="/guide/build-a-pair-index"
              className="font-bold text-cr-text underline decoration-cr-accent decoration-2 underline-offset-4 transition-colors hover:text-cr-text-2"
            >
              &ldquo;Build a Pair Index&rdquo;
            </Link>
            {" "}we got rid of one expensive search. We removed the linear scan
            from every merge round thanks to our reverse index from each pair
            to the pretokens that contain it. Once the winning pair is
            selected, we no longer scan the complete pretoken collection to
            decide which pretokens need updating.
          </p>

          <p className={bodyClassName}>
            We still have another slow search to deal with. Before we look up
            our pair index, we of course need to pick a winning pair. Since
            the counts live in a regular Python dictionary, looking up the
            count of one pair is, on average, a pretty cheap{" "}
            <LessonInlineCode>O(1)</LessonInlineCode> operation. Finding the
            pair with the largest count, however, is not as cheap because we
            have to walk the whole dictionary to find it:
          </p>

          <LessonCodeBlock
            code={pairCountExample}
            language="text"
            label="The remaining scan"
          />

          <p className={bodyClassName}>
            Since all we want is the pair with the largest count, one immediate
            instinct is to sort the table by frequency and take the first
            entry. The problem is that sorting all{" "}
            <LessonInlineCode>P</LessonInlineCode> pairs costs{" "}
            <LessonInlineCode>O(P log P)</LessonInlineCode>, so we would
            actually be doing more work than our current{" "}
            <LessonInlineCode>O(P)</LessonInlineCode> scan.
          </p>

          <p className={bodyClassName}>
            But think about what we actually need because we couldn&apos;t care less
            about the ordering that sorting gives us. All we need at each merge
            round is to know:{" "}
            <strong className="font-semibold text-cr-text">
              which pair has the largest current count?
            </strong>
          </p>

          <p className={bodyClassName}>
            This gives us a much narrower set of requirements. We need
            something that:
          </p>

          <ul className="space-y-3 pl-1 text-[16px] font-medium leading-[1.75] text-cr-text-2 sm:text-[17px]">
            <li className="flex gap-3">
              <span className="mt-[0.72em] size-1.5 shrink-0 bg-cr-accent" />
              <span>
                can store a pair together with its frequency as a key/value
                entry.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-[0.72em] size-1.5 shrink-0 bg-cr-accent" />
              <span>returns the pair with the largest frequency reasonably cheaply.</span>
            </li>
          </ul>

          <p className={bodyClassName}>
            One tool built around exactly this set of requirements is a{" "}
            <strong className="font-semibold text-cr-text">priority queue</strong>.
          </p>

          <PriorityQueueNote />

          <p className={bodyClassName}>
            Okay, so which priority-queue implementation makes the most sense
            for our requirements? As we mentioned, what we need is a data
            structure that keeps the{" "}
            <strong className="font-semibold text-cr-text">
              highest-frequency pair easy to reach as the counts change
            </strong>
            .
          </p>

          <p className={bodyClassName}>
            Remember, we do not need every pair sorted. We only need the current
            max pair, and once it is removed, the structure needs to do a small
            amount of work to bring the next winner forward.
          </p>

          <p className={bodyClassName}>
            A <strong className="font-semibold text-cr-text">binary heap</strong>{" "}
            is a perfect fit for this. It keeps the largest entry at the top and
            maintains only enough order underneath it to repair itself when
            entries are inserted or removed.
          </p>

          <HeapNote />

          <BinaryHeapVisual />

          <SectionTitle>Build the pair heap</SectionTitle>

          <p className={bodyClassName}>
            Okay, let&apos;s bring this back to our tokenizer. Our trainer maintains
            a pair-frequency table to map each live pair to its current count.
            We&apos;ll add a heap whose job is to keep our next candidate winner
            easy to reach.
          </p>

          <p className={bodyClassName}>
            At the beginning of training, we put every pair and its frequency
            into the heap once. The root at{" "}
            <LessonInlineCode>heap[0]</LessonInlineCode> then replaces the{" "}
            <LessonInlineCode>max(...)</LessonInlineCode> call that scanned the
            complete dictionary during every merge round.
          </p>

          <p className={bodyClassName}>
            Python 3.14 makes this pretty straightforward with{" "}
            <LessonReferenceLink href="https://docs.python.org/3/library/heapq.html">
              heapq
            </LessonReferenceLink>{" "}
            and its max-heap API, so we can{" "}
            <LessonInlineCode>heapify_max(...)</LessonInlineCode> our initial
            pair frequencies, <LessonInlineCode>heappush_max(...)</LessonInlineCode>{" "}
            new entries as counts change, and{" "}
            <LessonInlineCode>heappop_max(...)</LessonInlineCode> whenever we
            need the max pair. The largest entry is always at{" "}
            <LessonInlineCode>heap[0]</LessonInlineCode>.
          </p>

          <p className={bodyClassName}>
            Building the initial heap from all{" "}
            <LessonInlineCode>P</LessonInlineCode> live pairs costs{" "}
            <LessonInlineCode>O(P)</LessonInlineCode>. Reading its root costs{" "}
            <LessonInlineCode>O(1)</LessonInlineCode>, while inserting or
            removing an entry costs{" "}
            <LessonInlineCode>O(log P)</LessonInlineCode>.
          </p>

          <p className={bodyClassName}>
            Okay! So we got rid of our expensive search, but we introduced one
            problem: our pair frequencies change. After a merge, we repair the
            pair-frequency table, but the entries inside the heap do not update
            themselves.
          </p>

          <p className={bodyClassName}>
            We could potentially search through the heap, find every old entry,
            and edit or remove it. But then we would be back to a linear scan.
          </p>

          <p className={bodyClassName}>
            What we should do is not search for stale entries.{" "}
            <strong className="font-semibold text-cr-text">
              When a pair count changes, we push a new entry with the updated
              count. When an entry later reaches the root, compare it with the
              current pair-frequency table before accepting it
            </strong>
            :
          </p>

          <ul className="space-y-3 pl-1 text-[16px] font-medium leading-[1.75] text-cr-text-2 sm:text-[17px]">
            <li className="flex gap-3">
              <span className="mt-[0.72em] size-1.5 shrink-0 bg-cr-accent" />
              <span>If the pair no longer exists, discard the heap entry.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-[0.72em] size-1.5 shrink-0 bg-cr-accent" />
              <span>If its stored count disagrees with the dictionary, discard it.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-[0.72em] size-1.5 shrink-0 bg-cr-accent" />
              <span>If both agree, this is the current max pair.</span>
            </li>
          </ul>

          <p className={bodyClassName}>
            We remove stale roots to sync our heap with our dictionary. This is
            known as{" "}
            <LessonReferenceLink href="https://en.wikipedia.org/wiki/Lazy_deletion">
              lazy deletion
            </LessonReferenceLink>
            .
            Instead of spending time finding an old entry when it becomes
            invalid, we discard it only if it eventually reaches the root.
            Lazy, but effort-saving.
          </p>

          <LazyDeletionHeapVisual />

          <p className={bodyClassName}>
            One important note is that stale entries will accumulate, so the
            heap cannot grow forever. We need to rebuild it from the live
            pair-frequency table when it becomes much larger than that table. A
            practical starting point is to rebuild when the heap contains more
            than three times as many entries as there are live pairs.
          </p>

          <p className={bodyClassName}>
            Update <LessonInlineCode>BPETokenizer.train</LessonInlineCode> to
            build and maintain the heap. Push updated priorities, reject stale
            roots, and rebuild the heap when stale entries surpass the
            threshold.
          </p>

          <LessonCodeBlock
            code={heapLoop}
            language="pseudocode"
            label="The heap-backed merge loop"
          />

          <SectionTitle>Benchmark</SectionTitle>

          <p className={bodyClassName}>
            Run the same benchmark first with a vocabulary size of 1,024. Then
            raise it to 5,000 and run both versions again. The larger vocabulary
            is about 4,744 merge rounds, which gives the repeated dictionary
            scan enough chances to become expensive.
          </p>

          <LessonCodeBlock
            code={benchmarkCommands}
            language="bash"
            label="Terminal"
          />

          <p className={bodyClassName}>
            I ran our pair-heap implementation on the same machine three times
            and kept the median:
          </p>

          <LessonCodeBlock
            code={benchmarkComparison}
            language="text"
            label="My benchmark"
          />

          <p className={bodyClassName}>
            At 1,024 entries, the heap reduced our runtime from 2.65 seconds to
            1.98 seconds, a 1.34x speedup. At 5,000 entries, it dropped from
            10.16 seconds to 2.22 seconds, a 4.57x speedup.
          </p>

          <p className={bodyClassName}>
            The gap grows because our previous pair-index optimization pays a
            complete dictionary scan on every merge, while the heap does more
            bookkeeping whenever counts change but avoids repeating that scan
            thousands of times. This is also why a heap may fail to help on a
            small vocabulary: there may not be enough later merges to repay its
            own overhead.
          </p>

          <p className={bodyClassName}>
            Stepping back for a second, our naive trainer took{" "}
            <strong className="font-semibold text-cr-text">16.52 seconds</strong>{" "}
            at <strong className="font-semibold text-cr-text">1,024 entries</strong>.
            Reusing the pair counts brought that down to{" "}
            <strong className="font-semibold text-cr-text">9.63 seconds</strong>.
            Parallel pretokenization landed at{" "}
            <strong className="font-semibold text-cr-text">9.70 seconds</strong>.
            The pair index took us to{" "}
            <strong className="font-semibold text-cr-text">2.65 seconds</strong>,
            and the heap finished the same run in{" "}
            <strong className="font-semibold text-cr-text">1.98 seconds</strong>.
            From our first version to this one, that is{" "}
            <strong className="font-semibold text-cr-text">14.54 seconds</strong>{" "}
            removed from the same benchmark, or roughly an{" "}
            <strong className="font-semibold text-cr-text">8.34x speedup</strong>.
          </p>

        </div>
      </div>
    </article>
  );
}

function PriorityQueueNote() {
  const readings = [
    {
      author: "Princeton Algorithms",
      title: "Priority Queues",
      href: "https://algs4.cs.princeton.edu/24pq/",
    },
    {
      author: "Stanford CS106B",
      title: "Priority Queues and Binary Heaps",
      href: "https://web.stanford.edu/class/archive/cs/cs106b/cs106b.1244/lectures/16-pqheap/",
    },
    {
      author: "Carnegie Mellon University",
      title: "Priority Queues and Heaps",
      href: "https://www.cs.cmu.edu/~rdriley/121/notes/heaps/",
    },
    {
      author: "Python documentation",
      title: "queue.PriorityQueue",
      href: "https://docs.python.org/3/library/queue.html#queue.PriorityQueue",
    },
  ];

  return (
    <LessonReadingNote label="A note on priority queues" readings={readings}>
      <p>
        A queue answers a simple question: which item should come out next? In
        an ordinary queue, the answer is whichever item arrived first. In a
        priority queue, every item arrives with a priority, and the item with
        the highest priority comes out first.
      </p>

      <p>
        Its usual interface is deliberately small: insert an item with a
        priority, inspect the highest-priority item, and remove that item. Some
        implementations also support changing the priority of an item already
        inside the queue. That matches the two operations we need: keep
        pair-frequency entries and retrieve the pair with the largest frequency
        without searching through all of them.
      </p>

      <p>
        One important detail is that a priority queue is not one specific way
        of arranging data in memory. An unsorted array, a sorted array, a
        balanced search tree, and a binary heap can all implement its interface.
        They differ in the cost of each operation. That is to say, choose wisely
        depending on your requirements.
      </p>

      <p>
        Priority queues appear anywhere work must be chosen by importance rather
        than arrival time: operating-system scheduling, network routing,
        discrete-event simulation, and graph algorithms such as Dijkstra&apos;s
        shortest-path algorithm.
      </p>

      <p>
        That is enough for what we are building. If priority queues are new to
        you and you want to dig deeper, these are worth reading:
      </p>
    </LessonReadingNote>
  );
}

function HeapNote() {
  const readings = [
    {
      author: "MIT OpenCourseWare",
      title: "6.006 Lecture 8: Binary Heaps",
      href: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-8-binary-heaps/",
    },
    {
      author: "Harisai",
      title: "Heaps Demystified",
      href: "https://iamharisai.in/2025/11/22/heaps/",
    },
  ];

  return (
    <LessonReadingNote label="A note on heaps" readings={readings}>
      <p>
        A heap is a tree-based data structure built around one local rule. In a
        max-heap, every parent has a priority at least as large as its children.
        If that rule holds throughout the tree, the largest item must be at the
        root.
      </p>

      <p>
        The rest of the heap is not completely sorted. Two siblings do not have
        to be ordered, and neither do nodes on different branches. The heap
        maintains only the parent-child relationships needed to keep the next
        item at the root.
      </p>

      <p>
        A binary heap gives every node at most two children and fills each level
        before beginning the next. That shape lets us store the tree compactly
        inside an array. Reading the root costs O(1), while inserting an item or
        removing the root costs O(log n).
      </p>

      <p>If heaps are new to you, these are worth reading:</p>
    </LessonReadingNote>
  );
}
