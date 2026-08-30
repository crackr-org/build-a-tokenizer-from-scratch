import type { ReactNode } from "react";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonFilePreview } from "../../components/LessonFilePreview";
import { LessonHints } from "../../components/LessonHints";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonNote } from "../../components/LessonNote";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";
import { LessonSubmissionChecklist } from "../../components/LessonSubmissionChecklist";
import { LessonTaskSection } from "../../components/LessonTaskSection";
import { LessonTerm } from "../../components/LessonTerm";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const installCommand = "python -m pip install tiktoken blobfile";

const tiktokenFileExample = `dGg= 256
aW4= 257
ZXI= 258
YW4= 259
cmU= 260
b24= 261
dGhl 262
aW5n 263
aW9u 264
YW5k 265
IHRoZQ== 266`;

const corpusSources = `SOURCES = (
    ("English", "en-multi", 20),
    ("Arabic", "ar", 15),
    ("Mandarin", "zh", 15),
    ("Hindi", "hi", 10),
    ("Russian", "ru", 10),
    ("Japanese", "ja", 10),
    ("Korean", "ko", 10),
    ("Thai", "th", 10),
)`;

const tiktokenAdapter = `def save_encoding(tokenizer, path) -> Path:
    ...


def load_encoding(path) -> tiktoken.Encoding:
    ...`;

const trainAndTest = `import os

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
assert encoding.decode(ported_ids) == example`;

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-7 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
      {children}
    </h2>
  );
}

export function PortToTiktokenPage({
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
          <div className="h-[2px] w-40 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[720px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Port your tokenizer to tiktoken
        </h1>

        <p
          className="mt-6 max-w-[710px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Preserve the merges your trainer learned, then make the finished
          tokenizer loadable through tiktoken.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <p className={bodyClassName}>
            Right now, our trained vocabulary lives in memory inside the{" "}
            <LessonInlineCode>BPETokenizer</LessonInlineCode> object, so when our
            Python process terminates, the trained state disappears with it.
            That&apos;s not great, and we&apos;ll try to{" "}
            <strong className="font-bold text-cr-text">
              separate what the tokenizer learned from the code that learned it
            </strong>
            . Recovering the learned merges by retraining was acceptable while
            our corpus was tiny. It is, however, a terrible loading strategy,
            and we&apos;ll fix this before we port our tokenizer to tiktoken.
          </p>

          <p className={bodyClassName}>
            There are several reasonable ways we could preserve the result. We
            could serialize the complete Python object with{" "}
            <LessonReferenceLink href="https://docs.python.org/3/library/pickle.html">
              pickle
            </LessonReferenceLink>
            . We could, with questionable confidence, design a JSON schema for
            the vocabulary and merges.
          </p>

          <p className={bodyClassName}>
            Saving the complete object would be the quickest option. It would,
            however, also preserve implementation details. The file would
            depend on our Python class and could break as that class changes. A
            custom format gives us more control, at the{" "}
            <LessonTerm definition="Yes, I am joking. Maintaining your own format is anything but modest.">
              modest cost
            </LessonTerm>{" "}
            of having a format of our own to maintain.
          </p>

          <LessonNote label="A note on saving training state">
            <div className="space-y-3">
              <p>
                Saving the result of expensive work is something you will see
                throughout machine learning. Neural networks, for example, can
                train for hours or days, so training is saved to disk as{" "}
                <LessonReferenceLink href="https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html#saving-loading-a-general-checkpoint-for-inference-and-or-resuming-training">
                  <strong className="font-bold">checkpoints</strong>
                </LessonReferenceLink>{" "}
                at intervals. A checkpoint records enough state, usually the
                model parameters, optimizer state, and current training step,
                to resume after an interruption.
              </p>

              <p>
                That is not quite what we are doing here. We are saving a
                finished tokenizer so we can use it later, not checkpointing an
                ongoing training run. But the habit is the same: once
                computation becomes expensive, you start thinking carefully
                about what needs to survive after the process exits.
              </p>
            </div>
          </LessonNote>

          <SectionTitle>Understand the tiktoken encoding</SectionTitle>

          <p className={bodyClassName}>
            <LessonReferenceLink href="https://github.com/openai/tiktoken/blob/main/README.md">
              Tiktoken
            </LessonReferenceLink>{" "}
            is OpenAI&apos;s open source BPE tokenizer library. It supports
            OpenAI&apos;s official, publicly available encodings, such as {" "}
            <LessonReferenceLink href="https://openaipublic.blob.core.windows.net/encodings/cl100k_base.tiktoken">
              <LessonInlineCode>cl100k_base</LessonInlineCode>
            </LessonReferenceLink>{" "}
            and {" "}
            <LessonReferenceLink href="https://openaipublic.blob.core.windows.net/encodings/o200k_base.tiktoken">
              <LessonInlineCode>o200k_base</LessonInlineCode>
            </LessonReferenceLink>
            {", out of the box. Its "}
            <LessonInlineCode>Encoding</LessonInlineCode> interface can also
            construct a custom encoding from mergeable token ranks and a
            pretokenization pattern, which, as you might have guessed,
            we&apos;ll make use of.
          </p>

          <p className={bodyClassName}>
            Porting our tokenizer to tiktoken is a satisfying final step. Our
            implementation is intentionally small and does not have all the
            features or optimizations of a production tokenizer, but it can
            learn a working BPE encoding. We can now hand those learned token
            bytes and ranks to an established tokenizer library like tiktoken,
            making the encoding we built compatible with a real tokenizer
            runtime.
          </p>

          <p className={bodyClassName}>
            When training finishes, most of the trainer can be left behind. We
            won&apos;t need the corpus, pretokens, pair counts, etc. Remember, the
            end result for a tokenizer is to be able to encode and decode text
            to and from a transformer. Encoding does not need that part of the
            training state. It only needs to know {" "}
            <strong className="font-bold text-cr-text">
              which bytes each token represents and the order in which the
              learned tokens take priority.
            </strong>{" "}
            Of course, it also needs the same pretokenization pattern used to
            produce the same pretokens.
          </p>

          <p className={bodyClassName}>
            Luckily, we do not need to invent how to package this state. {" "}
            <LessonReferenceLink href="https://github.com/openai/tiktoken/blob/main/README.md">
              tiktoken
            </LessonReferenceLink>{" "}
            uses a <LessonInlineCode>.tiktoken</LessonInlineCode> file to store
            and retrieve this learned state. The file content is simple: a table
            of token bytes and ranks, which our vocabulary already represents
            after training. Our current mapping points in the opposite direction
            from what tiktoken expects, so we will need to flip it.
          </p>

          <p className={bodyClassName}>
            tiktoken calls that finished table {" "}
            <LessonReferenceLink href="https://github.com/openai/tiktoken/blob/main/tiktoken/core.py#L16-L36">
              <LessonInlineCode>mergeable_ranks</LessonInlineCode>
            </LessonReferenceLink>
            {". It maps each token's bytes to its integer rank. As we mentioned, our vocabulary "}
            contains the same information in the opposite direction: it maps
            each token ID to its bytes. If you remember, we chose this direction
            because it was more convenient for our trainer, which assigns IDs
            in learning order.
          </p>

          <p className={bodyClassName}>
            When tiktoken saves this dictionary, it writes one token and rank
            per line. The token bytes are encoded with Base64 so the file can
            safely represent any byte sequence. An example learned section
            could look like this:
          </p>

          <LessonFilePreview
            content={tiktokenFileExample}
            directory="artifacts"
            filename="crackr_multilingual.tiktoken"
          />

          <p className={bodyClassName}>
            <LessonInlineCode>dGg=</LessonInlineCode> represents{" "}
            <LessonInlineCode>b&quot;th&quot;</LessonInlineCode>, and{" "}
            <LessonInlineCode>dGhl</LessonInlineCode> represents{" "}
            <LessonInlineCode>b&quot;the&quot;</LessonInlineCode>. tiktoken&apos;s{" "}
            <LessonReferenceLink href="https://github.com/openai/tiktoken/blob/main/tiktoken/load.py#L146-L158">
              loader
            </LessonReferenceLink>{" "}
            turns the file back into {" "}
            <LessonInlineCode>mergeable_ranks</LessonInlineCode>.
          </p>

          <LessonNote>
            A <LessonInlineCode>.tiktoken</LessonInlineCode> file saves only the
            token bytes and ranks. The encoding name, pretokenization pattern,
            and other encoding settings are kept separately in code.
          </LessonNote>

          <p className={bodyClassName}>
            After training finishes and our rank table is ready, we can
            construct tiktoken&apos;s{" "}
            <LessonReferenceLink href="https://github.com/openai/tiktoken/blob/main/tiktoken/core.py">
              Encoding class
            </LessonReferenceLink>
            {", which accepts the rank table together with the pretokenization pattern and special tokens, then uses our custom definition to encode and decode text. Needless to say, we need to provide the same regex our trainer used. We can choose a name for the encoding and provide its special token mapping:"}
          </p>

          <p className={bodyClassName}>
            A thing to be aware of is that OpenAI open sourced tiktoken&apos;s
            inference code. That is, no production training code was open
            sourced. We do not know, for example,{" "}
            <LessonTerm definition="Well, we know the algorithm. What we do not know for sure is every optimization and production detail OpenAI used.">
              exactly how the
            </LessonTerm>{" "}
            <LessonInlineCode>cl100k_base</LessonInlineCode> and{" "}
            <LessonInlineCode>o200k_base</LessonInlineCode> merges were learned.
            The repository includes a small{" "}
            <LessonReferenceLink href="https://github.com/openai/tiktoken/blob/main/tiktoken/_educational.py">
              educational trainer
            </LessonReferenceLink>
            , but our <LessonInlineCode>BPETokenizer</LessonInlineCode> remains
            responsible for learning the ranks. tiktoken will load and apply
            the learned merges.
          </p>

          <SectionTitle>How beefyyy is your machine?</SectionTitle>

          <p className={bodyClassName}>
            The 3 MiB corpus from the previous task kept the demonstration
            short. For our final tokenizer, we&apos;ll use a more reasonable final
            run. Reasonable comes with an asterisk here. It is a moving target
            that depends on how beefyyy your machine is and what your time
            budget is.
          </p>

          <p className={bodyClassName}>
            For me, with a 12 core M2 Pro MacBook Pro and 32 GB of memory, I
            built a 100 MiB corpus from the same mC4 dataset, with 20 MiB of
            English, 15 MiB each of Arabic and Mandarin, and 10 MiB each of
            Hindi, Russian, Japanese, Korean, and Thai. I used a vocabulary of
            8,192 tokens, which took about one hour of training time.
          </p>

          <p className={bodyClassName}>
            You need to decide a proper corpus and vocabulary size given how
            beefyyy your machine is or how disposable your free time is.
          </p>

          <p className={bodyClassName}>
            Use the <LessonInlineCode>build_corpus.py</LessonInlineCode> script
            from the previous substage and modify its{" "}
            <LessonInlineCode>SOURCES</LessonInlineCode> tuple with the languages
            and corpus size you decided on:
          </p>

          <LessonCodeBlock
            code={corpusSources}
            language="python"
            label="Update SOURCES"
          />

          <LessonTaskSection
            number="01"
            title="Reverse your vocab mapping"
          >
            <div className="space-y-4">
              <p className={bodyClassName}>
                As we mentioned earlier, tiktoken expects{" "}
                <LessonInlineCode>mergeable_ranks</LessonInlineCode> in the
                opposite direction from how we currently store our vocabulary:{" "}
                <LessonInlineCode>token bytes → rank</LessonInlineCode> instead
                of <LessonInlineCode>token ID → token bytes</LessonInlineCode>,
                so we&apos;ll need to flip that.
              </p>

              <p className={bodyClassName}>
                There are several reasonable ways we could do this. We could
                simply wait until training finishes and reverse the complete
                vocabulary in one <LessonInlineCode>O(V)</LessonInlineCode> pass.
                That works, but it means every time training finishes, we still
                have one more conversion to do.
              </p>

              <p className={bodyClassName}>
                Or we can do it while we train. Every time BPE learns a new
                token, we can add the reverse entry right there in{" "}
                <LessonInlineCode>O(1)</LessonInlineCode>, and by the time
                training finishes,{" "}
                <LessonInlineCode>mergeable_ranks</LessonInlineCode> will contain
                everything it should. We do pay{" "}
                <LessonInlineCode>O(V)</LessonInlineCode> extra space for keeping
                both mappings, <LessonInlineCode>vocab</LessonInlineCode> and{" "}
                <LessonInlineCode>mergeable_ranks</LessonInlineCode>, around, but
                that is a tradeoff we can comfortably make here.
              </p>

              <p className={bodyClassName}>
                In <LessonInlineCode>bpe_tokenizer.py</LessonInlineCode>, add{" "}
                <LessonInlineCode>self.mergeable_ranks</LessonInlineCode> to{" "}
                <LessonInlineCode>BPETokenizer</LessonInlineCode> and initialize
                it with the 256 byte tokens. Then, whenever training learns a
                new token and adds it to <LessonInlineCode>vocab</LessonInlineCode>,
                add the reverse entry to{" "}
                <LessonInlineCode>mergeable_ranks</LessonInlineCode> at the same
                time.
              </p>
            </div>
          </LessonTaskSection>

          <LessonTaskSection number="02" title="Save and load your tokenizer">
            <div className="space-y-4">
              <p className={bodyClassName}>
                Create <LessonInlineCode>tiktoken_adapter.py</LessonInlineCode>{" "}
                with two functions. <LessonInlineCode>save_encoding</LessonInlineCode>{" "}
                receives a trained <LessonInlineCode>BPETokenizer</LessonInlineCode>{" "}
                and writes its{" "}
                <LessonInlineCode>mergeable_ranks</LessonInlineCode> to a{" "}
                <LessonInlineCode>.tiktoken</LessonInlineCode> file using{" "}
                <LessonReferenceLink href="https://github.com/openai/tiktoken/blob/main/tiktoken/load.py#L135-L144">
                  <LessonInlineCode>dump_tiktoken_bpe</LessonInlineCode>
                </LessonReferenceLink>
                .
              </p>

              <p className={bodyClassName}>
                <LessonInlineCode>load_encoding</LessonInlineCode> reads those
                ranks back with{" "}
                <LessonReferenceLink href="https://github.com/openai/tiktoken/blob/main/tiktoken/load.py#L146-L158">
                  <LessonInlineCode>load_tiktoken_bpe</LessonInlineCode>
                </LessonReferenceLink>
                , combines
                them with the same{" "}
                <LessonInlineCode>PRE_TOKEN_REGEX</LessonInlineCode>, and returns
                a tiktoken <LessonInlineCode>Encoding</LessonInlineCode>. Both
                functions receive the artifact path from the caller, so the file
                can be named and stored wherever the caller chooses.
              </p>

              <LessonCodeBlock
                code={tiktokenAdapter}
                language="python"
                label="tiktoken_adapter.py interface"
              />

              <p className={bodyClassName}>
                Install tiktoken and the small dependency used by its file
                writer:
              </p>

              <LessonCodeBlock
                code={installCommand}
                language="bash"
                label="Terminal"
              />
            </div>
          </LessonTaskSection>

          <SectionTitle>Test your port</SectionTitle>

          <p className={bodyClassName}>
            With that in place, train your tokenizer on the multilingual corpus
            with the vocabulary size you chose above, save the learned ranks,
            then load the finished encoding with tiktoken. As always, verify
            that both implementations produce the same token IDs and decode the
            example back to the original text:
          </p>

          <LessonCodeBlock
            code={trainAndTest}
            language="python"
            label="Python"
          />

          <SectionTitle>Before you submit</SectionTitle>

          <LessonSubmissionChecklist
            items={[
              "mergeable_ranks contains the 256 byte tokens and every token learned during training.",
              "save_encoding and load_encoding use the artifact path supplied by the caller.",
              "BPETokenizer and tiktoken produce the same IDs for fresh multilingual text.",
              "The saved encoding loads without the corpus and survives an encode and decode round trip.",
            ]}
          />

          <LessonHints
            hints={[
              {
                title: "Build the reverse table inside train",
                body: (
                  <>
                    Start <LessonInlineCode>mergeable_ranks</LessonInlineCode>{" "}
                    with <LessonInlineCode>bytes([token_id]) → token_id</LessonInlineCode>{" "}
                    for IDs 0 through 255. Inside the merge loop, add the reverse
                    entry immediately after you add the new token to{" "}
                    <LessonInlineCode>vocab</LessonInlineCode>. Do not forget to
                    assign the finished table to{" "}
                    <LessonInlineCode>self.mergeable_ranks</LessonInlineCode> at
                    the end of training.
                  </>
                ),
              },
              {
                title: "Pass the rank table directly to the writer",
                body: (
                  <>
                    You do not need to encode the bytes yourself or write the
                    file line by line. Call{" "}
                    <LessonInlineCode>dump_tiktoken_bpe</LessonInlineCode> with{" "}
                    <LessonInlineCode>tokenizer.mergeable_ranks</LessonInlineCode>{" "}
                    and the caller&apos;s path. If you converted the path to a{" "}
                    <LessonInlineCode>Path</LessonInlineCode>, pass{" "}
                    <LessonInlineCode>str(path)</LessonInlineCode> to tiktoken&apos;s
                    file helpers.
                  </>
                ),
              },
              {
                title: "The file is only the ranks",
                body: (
                  <>
                    After <LessonInlineCode>load_tiktoken_bpe</LessonInlineCode>{" "}
                    gives you the ranks, construct a{" "}
                    <LessonInlineCode>tiktoken.Encoding</LessonInlineCode> with
                    those ranks and the exact same{" "}
                    <LessonInlineCode>PRE_TOKEN_REGEX</LessonInlineCode> used by
                    your trainer. You can use the file stem as the encoding
                    name. If decoding works but the IDs differ, check the regex
                    first. A different pretoken boundary produces a different
                    merge sequence.
                  </>
                ),
              },
            ]}
          />
        </div>
      </div>
    </article>
  );
}
