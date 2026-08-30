import type { ReactNode } from "react";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonNote } from "../../components/LessonNote";
import { LessonReadingNote } from "../../components/LessonReadingNote";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const installCommand = "python -m pip install datasets";

const corpusBuilder = `from pathlib import Path

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

    return "\\n\\n".join(documents)


sections = []
for language, subset, size_mib in SOURCES:
    print(f"Collecting {language}")
    sections.append(collect(subset, size_mib * MEBIBYTE))

corpus = "\\n\\n".join(sections)
total_mib = sum(size_mib for _, _, size_mib in SOURCES)
output = Path(f"data/mc4-multilingual-{total_mib}mib.txt")
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(corpus, encoding="utf-8")

print(f"Saved {len(corpus.encode('utf-8')):,} bytes to {output}")`;

const trainingRun = `import os
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

assert tokenizer.decode(ids) == text`;

const unseenTextCheck = `examples = (
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
    print(f"{byte_count} bytes -> {len(ids)} tokens")`;

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-7 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
      {children}
    </h2>
  );
}

export function ScaleUpTrainingPage({
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
              Ship your tokenizer
            </p>
          </div>
          <p className="text-[10px] font-bold text-cr-text-3" style={monoStyle}>
            {estimatedMinutes} min
          </p>
        </div>

        <div className="mt-6 h-[2px] bg-cr-border-light">
          <div className="h-[2px] w-24 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[700px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Scale up training
        </h1>

        <p
          className="mt-6 max-w-[710px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Give BPE more than Shakespeare to learn from.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <p className={bodyClassName}>
            So far, our tokenizer has been a learning model at best. We used
            Tiny Shakespeare and a vocab of 1024, which was quite small. We
            still managed to make it bulletproof to unknown text.
          </p>

          <p className={bodyClassName}>
            If we feed it Arabic, Mandarin, modern web text, or pretty much
            anything else, it will still encode every byte. {" "}
            <strong className="font-bold text-cr-text">
              It just may not do so efficiently.
            </strong>{" "}
            Our training corpus did not contain enough examples or patterns,
            and thus our BPE did not learn a lot of useful merges. Hence, a lot
            of text during inference might stay {" "}
            <strong className="font-bold text-cr-text">
              much closer to raw UTF-8 bytes and take more tokens.
            </strong>
          </p>

          <p className={bodyClassName}>
            We spent the previous stage making training fast for a reason so
            that now we can spend that speed on a larger vocabulary and a
            corpus that looks a little more like actual reasonable training
            data.
          </p>

          <SectionTitle>A larger training corpus</SectionTitle>

          <p className={bodyClassName}>
            This still will not be the corpus we use for our final tokenizer.
            In the next substage, we will train once more and save what the
            tokenizer learns so it can be loaded again without training. To
            avoid paying for two large runs, we will keep this demonstration
            small and use it to see what changes when BPE learns from something
            much more varied than Shakespeare.
          </p>

          <p className={bodyClassName}>
            The corpus decides which byte patterns are worth merging. More
            bytes give the trainer better frequency estimates, while more
            variety exposes it to patterns from different languages and
            writing systems.
          </p>

          <p className={bodyClassName}>
            For this run, we will build roughly{" "}
            <strong className="font-bold text-cr-text">
              3 MiB of training data from{" "}
              <LessonReferenceLink href="https://huggingface.co/datasets/allenai/c4">
                mC4
              </LessonReferenceLink>
            </strong>
            {", a multilingual dataset containing more than 100 languages. We’ll take "}
            <strong className="font-bold text-cr-text">
              1 MiB each of English, Arabic, and Mandarin
            </strong>
            {"."}
          </p>

          <p className={bodyClassName}>
            As you can see, this is much larger than our Tiny Shakespeare
            corpus of 11 kB. However, it is still very small. 3 MiB does not
            produce anything like a real tokenizer. It gives us enough data to
            see how a more varied corpus changes what BPE learns while keeping
            this demonstration to a few minutes.
          </p>

          <SectionTitle>Build the corpus</SectionTitle>

          <p className={bodyClassName}>
            Create <LessonInlineCode>build_corpus.py</LessonInlineCode>. The
            script streams the language configurations in{" "}
            <LessonInlineCode>SOURCES</LessonInlineCode> from mC4 and writes
            them into a single UTF-8 text file. Each entry contains the
            language label, its mC4 configuration, and the number of MiB to
            collect. For this run, all three are set to 1 MiB.
          </p>

          <LessonCodeBlock
            code={corpusBuilder}
            language="python"
            label="build_corpus.py"
          />

          <p className={bodyClassName}>
            For convenience, we used{" "}
            <LessonReferenceLink href="https://huggingface.co/docs/datasets/index">
              <LessonInlineCode>datasets</LessonInlineCode>
            </LessonReferenceLink>
            , Hugging Face&apos;s Python library for downloading and streaming
            datasets. Install it if you don&apos;t already have it:
          </p>

          <LessonCodeBlock
            code={installCommand}
            language="bash"
            label="Terminal"
          />

          <LessonNote>
            Don’t forget to add{" "}
            <LessonInlineCode>data/</LessonInlineCode> to{" "}
            <LessonInlineCode>.gitignore</LessonInlineCode> if it is not there
            already to not bloat your git history.
          </LessonNote>

          <SectionTitle>Train your tokenizer</SectionTitle>

          <p className={bodyClassName}>
            We’ll train this tokenizer with a vocabulary of 2,048 tokens. The
            first 256 are the raw byte tokens, leaving BPE 1,792 new tokens to
            learn from our corpus.
          </p>

          <p className={bodyClassName}>
            Use the optimized <LessonInlineCode>BPETokenizer</LessonInlineCode>{" "}
            you built in the previous stage and train it on the corpus we just
            created:
          </p>

          <LessonCodeBlock
            code={trainingRun}
            language="python"
            label="Train your tokenizer"
          />

          <LessonNote>
            In the next section, you will choose the corpus size, languages,
            and vocabulary for the final training run based on your machine and
            how long you are willing to wait. That run will be saved instead of
            discarded when the process ends.
          </LessonNote>

          <p className={bodyClassName}>
            Test your tokenizer’s multilingual capabilities. Give it text in
            all three languages we trained on:
          </p>

          <LessonCodeBlock
            code={unseenTextCheck}
            language="python"
            label="Test English, Arabic, and Mandarin"
          />

          <p className={bodyClassName}>
            Try a few inputs of your own and see what BPE learned from the new
            corpus. Compare different languages, code, and text with lots of
            punctuation. In the next section, we will choose a larger final
            run, save the learned encoding, and load that exact tokenizer
            through <LessonInlineCode>tiktoken</LessonInlineCode> without
            training it again.
          </p>

          <LessonReadingNote
            label="About the corpus"
            readings={[
              {
                title: "The mC4 dataset",
                author: "AllenAI and Google",
                href: "https://huggingface.co/datasets/allenai/c4",
              },
            ]}
          >
            <p>
              mC4 is far larger than the three small slices we use here. Read its
              dataset card to understand where the text came from, how it was
              filtered, and what limitations remain.
            </p>
          </LessonReadingNote>

        </div>
      </div>
    </article>
  );
}
