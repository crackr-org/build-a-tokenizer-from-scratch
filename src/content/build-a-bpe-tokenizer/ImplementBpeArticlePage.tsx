import type { ReactNode } from "react";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonCorpusUrl } from "../../components/LessonCorpusUrl";
import { LessonHints } from "../../components/LessonHints";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";
import { LessonSubmissionChecklist } from "../../components/LessonSubmissionChecklist";
import { Gpt2PaperQuote } from "./Gpt2PaperQuote";
import { Gpt2PretokenizerExplorer } from "./Gpt2PretokenizerExplorer";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const publicContract = [
  "class BPETokenizer:",
  "    def __init__(self):",
  "        ...",
  "",
  "    def train(self, text, vocab_size):",
  "        ...",
  "",
  "    def encode(self, text):",
  "        ...",
  "",
  "    def decode(self, ids):",
  "        ...",
].join("\n");

const gpt2PretokenizerPattern = [
  "import regex as re",
  "",
  'pat = re.compile(r"""\'s|\'t|\'re|\'ve|\'m|\'ll|\'d| ?\\p{L}+| ?\\p{N}+| ?[^\\s\\p{L}\\p{N}]+|\\s+(?!\\S)|\\s+""")',
].join("\n");

const tinyShakespeareUrl =
  "https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt";

const trainOnCorpus = [
  "from pathlib import Path",
  "from bpe_tokenizer import BPETokenizer",
  "",
  'training_text = Path("tiny_shakespeare.txt").read_text(encoding="utf-8")',
  "",
  "tokenizer = BPETokenizer()",
  "tokenizer.train(training_text, vocab_size=276)",
  "",
  "ids = tokenizer.encode(training_text)",
  'original_size = len(training_text.encode("utf-8"))',
  "",
  'print(f"tokens: {len(ids):,}")',
  'print(f"compression: {original_size / len(ids):.2f}x")',
  'assert tokenizer.decode(ids) == training_text',
].join("\n");

const trainingOutput = [
  "tokens: 911,120",
  "compression: 1.22x",
].join("\n");

const roundTripCheck = [
  "examples = [",
  '    "",',
  '    "?",',
  '    "Hello world!!!",',
  '    "Aم你👋",',
  '    "tokenizzzzer",',
  "]",
  "",
  "for text in examples:",
  "    assert tokenizer.decode(tokenizer.encode(text)) == text",
].join("\n");

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-7 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
      {children}
    </h2>
  );
}

function TaskSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="pt-7">
      <div className="mb-5 flex items-center gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center border-2 border-cr-brand bg-cr-accent text-[10px] font-extrabold text-cr-on-accent"
          style={monoStyle}
        >
          {number}
        </span>
        <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
          {title}
        </h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function ImplementBpePage({
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
              Build a BPE tokenizer
            </p>
          </div>
          <p className="text-[10px] font-bold text-cr-text-3" style={monoStyle}>
            {estimatedMinutes} min
          </p>
        </div>

        <div className="mt-6 h-[2px] bg-cr-border-light">
          <div className="h-[2px] w-32 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[700px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Implement BPE
        </h1>

        <p
          className="mt-6 max-w-[700px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Put the whole thing together: pretokenize the corpus, train BPE on its
          bytes, then use the learned merges to encode and decode new text.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <p className={bodyClassName}>
            In the previous substage we understood how BPE works. Now we are
            going to build it. Create a new file called{" "}
            <LessonInlineCode>bpe_tokenizer.py</LessonInlineCode> and define a
            new class called{" "}
            <LessonInlineCode>BPETokenizer</LessonInlineCode>.
          </p>

          <p className={bodyClassName}>
            We&apos;ll keep this first version deliberately naive. Making it fast
            will be the concern of the next substage. For now, let&apos;s keep it
            simple: pretokenize, count pair frequencies, choose the max, merge
            it everywhere it appears, and repeat.
          </p>

          <SectionTitle>Prepare the training corpus</SectionTitle>

          <p className={bodyClassName}>
            We will train this tokenizer on{" "}
            <LessonReferenceLink href={tinyShakespeareUrl}>
              Tiny Shakespeare
            </LessonReferenceLink>
            . We picked this corpus since it is large enough for the pair
            statistics to feel real, but still small enough for this
            intentionally slow implementation. Download it once and keep it.
          </p>

          <LessonCorpusUrl url={tinyShakespeareUrl} />

          <SectionTitle>Create the interface</SectionTitle>

          <p className={bodyClassName}>
            The evaluator will create your class, train it on text, encode new
            text, and decode the resulting IDs. This is the public interface:
          </p>

          <LessonCodeBlock code={publicContract} language="python" />

          <p className={bodyClassName}>
            <LessonInlineCode>train</LessonInlineCode> discovers merge rules from
            a corpus. <LessonInlineCode>encode</LessonInlineCode> uses those rules
            without learning anything new.{" "}
            <LessonInlineCode>decode</LessonInlineCode> reverses the token IDs
            back into text. Pair counting, pair replacement, and pretokenization
            will still of course have to exist, but how you implement and where
            you put them is your decision.
          </p>

          <TaskSection number="01" title="Pretokenize">

          <p className={bodyClassName}>
            The{" "}
            <LessonReferenceLink href="https://cdn.openai.com/better-language-models/language-models.pdf">
              GPT-2 paper
            </LessonReferenceLink>{" "}
            from 2019 introduces an important twist to its BPE implementation.
            The paper covers concepts consistent with what we discussed
            earlier, but introduces an important divergence. The authors{" "}
            <strong className="font-bold text-cr-text">
              do not apply the BPE algorithm directly
            </strong>
            .
          </p>

          <p className={bodyClassName}>
            The authors noticed an inefficiency that you would eventually run
            into if you ran the merge loop straight on raw text. Take, for
            example, the word <em className="text-cr-text">dog</em>. In actual
            sentences, it almost never shows up alone. It comes glued to
            punctuation: {" "}
            <em className="text-cr-text">dog.</em>,{" "}
            <em className="text-cr-text">dog!</em>,{" "}
            <em className="text-cr-text">dog?</em>,{" "}
            <em className="text-cr-text">dog,</em>, and so on. If{" "}
            <em className="text-cr-text">dog</em> sits beside a period often
            enough, the algorithm will cheerfully mint a token for the entire
            chunk: <em className="text-cr-text">dog.</em>
          </p>

          <p className={bodyClassName}>
            By itself, that might seem harmless. But multiply it across the
            whole vocabulary: <em className="text-cr-text">cat.</em>,{" "}
            <em className="text-cr-text">cat!</em>,{" "}
            <em className="text-cr-text">cat?</em>.{" "}
            <em className="text-cr-text">house.</em>,{" "}
            <em className="text-cr-text">house!</em>,{" "}
            <em className="text-cr-text">house?</em>, and so on. Common nouns,
            verbs, and adjectives start producing this family of{" "}
            <strong className="font-bold text-cr-text">
              “punctuation-inflected tokens”
            </strong>
            , each taking up a slot in the fixed merge budget.
          </p>

          <p className={bodyClassName}>
            GPT-2, for example, had{" "}
            <LessonReferenceLink href="https://cdn.openai.com/better-language-models/language-models.pdf">
              50,000 merges
            </LessonReferenceLink>{" "}
            to spend. Do we really want to waste thousands of them on identical
            stems that differ only by the punctuation mark beside them? That is
            a rather terrible allocation of limited vocabulary capacity. It
            also binds the word and punctuation into one unit:{" "}
            <em className="text-cr-text">dog</em> and{" "}
            <em className="text-cr-text">dog.</em> now require different token
            representations instead of reusing the same word piece.
          </p>

          <p className={bodyClassName}>
            The GPT-2 authors saw this clearly. They write:
          </p>

          <Gpt2PaperQuote />

          <p className={bodyClassName}>
            So they introduced a step before BPE: split the text into chunks
            based on character categories, then run BPE only inside each chunk.
            That step is{" "}
            <strong className="text-cr-text">pretokenization</strong>: manually
            enforced rules prevent certain character types from merging,
            placing constraints on top of the byte-pair encoding algorithm.
          </p>

          <p className={bodyClassName}>
            We can inspect the GPT-2 repository&apos;s{" "}
            <LessonReferenceLink href="https://github.com/openai/gpt-2/blob/master/src/encoder.py">
              encoder.py
            </LessonReferenceLink>{" "}
            to see the exact regex pattern used in its tokenizer. It uses a
            complex regular expression to chop up text before BPE. One important
            detail is the import:{" "}
            <LessonInlineCode>import regex as re</LessonInlineCode>. It uses the{" "}
            <LessonReferenceLink href="https://pypi.org/project/regex/">
              regex package
            </LessonReferenceLink>{" "}
            rather than Python&apos;s built-in <LessonInlineCode>re</LessonInlineCode>{" "}
            module. The package extends <LessonInlineCode>re</LessonInlineCode>{" "}
            with additional functionality, most notably Unicode category
            matching such as{" "}
            <LessonInlineCode>\p{"{L}"}</LessonInlineCode> for any letter and{" "}
            <LessonInlineCode>\p{"{N}"}</LessonInlineCode> for any number, which
            makes the pretokenizer work across writing systems.
          </p>

          <LessonCodeBlock code={gpt2PretokenizerPattern} language="python" />

          <p className={bodyClassName}>
            Breaking this pattern apart reveals a few interesting bits:
          </p>

          <Gpt2PretokenizerExplorer />

          <p className={bodyClassName}>
            For our BPE tokenizer implementation, we&apos;ll use the exact same
            regex pattern used by GPT-2. Make sure you understand it down to the
            smallest detail, then use it in both training and encoding. Every
            regex match is a separate pretoken. BPE may merge bytes inside that
            pretoken, but never across its boundary. The{" "}
            <LessonInlineCode>regex</LessonInlineCode> package is allowed in this
            submission.
          </p>
          </TaskSection>

          <TaskSection number="02" title="Train the tokenizer">
            <p className={bodyClassName}>
              Implement <LessonInlineCode>train</LessonInlineCode>. It receives
              the training text and the{" "}
              <LessonInlineCode>vocab_size</LessonInlineCode>. The vocabulary
              already begins with 256 byte tokens, whose IDs run from 0 through
              255. So if <LessonInlineCode>vocab_size</LessonInlineCode> is 276,
              <LessonInlineCode>train</LessonInlineCode> should learn 20 merges
              and mint IDs 256 through 275.
            </p>

            <p className={bodyClassName}>
              Pretokenize the corpus, count pairs, choose the pair with the
              largest total, mint the next ID beginning at 256, and replace all
              of its nonoverlapping occurrences inside every pretoken.
            </p>

            <p className={bodyClassName}>
              Save each merge in learning order and store the bytes represented
              by its new ID. If two pairs have the same count, compare the bytes
              represented by their left tokens and then their right tokens to
              break the tie. Stop when the{" "}
              <LessonInlineCode>vocab_size</LessonInlineCode> is reached or no
              adjacent pair remains.
            </p>
          </TaskSection>

          <TaskSection number="03" title="Encode and decode text">
            <p className={bodyClassName}>
              Implement <LessonInlineCode>encode</LessonInlineCode>. Pretokenize
              new text with the same regex, treat each chunk as UTF-8 bytes, and
              apply the merges learned during training. Return the IDs from
              every chunk in their original order.
            </p>

            <p className={bodyClassName}>
              Encoding must not, of course, redo any training. That is, it
              should not count frequencies, learn another rule, or change the
              tokenizer. When several learned pairs are available, apply the one
              learned earliest.
            </p>
            <p className={bodyClassName}>
              Implement <LessonInlineCode>decode</LessonInlineCode>. Look up the
              bytes represented by every ID, concatenate the byte stream in
              order, then decode it as UTF-8 using{" "}
              <LessonInlineCode>errors=&quot;replace&quot;</LessonInlineCode>. A model can
              generate token IDs whose bytes do not form valid UTF-8. In that
              case, Python returns the replacement character{" "}
              <LessonInlineCode>�</LessonInlineCode> instead of raising a{" "}
              <LessonInlineCode>UnicodeDecodeError</LessonInlineCode>.
            </p>
          </TaskSection>

          <SectionTitle>Run it on Tiny Shakespeare</SectionTitle>
            <p className={bodyClassName}>
              Train your tokenizer on Tiny Shakespeare.
            </p>

            <LessonCodeBlock code={trainOnCorpus} language="python" />

            <p className={bodyClassName}>
              You should see:
            </p>

            <LessonCodeBlock
              code={trainingOutput}
              language="text"
              label="Output"
            />

            <p className={bodyClassName}>
              Try a few larger vocabulary sizes. Print the learned merges,
              inspect the tokens they create, and see how the training corpus
              is tokenized.
            </p>

            <p className={bodyClassName}>
              Now check the round trip on text that did not appear in Tiny
              Shakespeare:
            </p>

            <LessonCodeBlock code={roundTripCheck} language="python" />

          <SectionTitle>Before you submit</SectionTitle>

          <LessonSubmissionChecklist
            items={[
              "bpe_tokenizer.py defines BPETokenizer with train, encode, and decode.",
              "Training begins with the 256 byte tokens and respects the supplied vocab_size.",
              "Training and encoding use the GPT-2 regex and never merge across its pretokens.",
              "Encoding applies the saved merges in learning order without training again.",
              "Unseen Unicode text survives decode(encode(text)) unchanged.",
              "The solution uses only the Python standard library and the provided regex package.",
            ]}
          />

          <LessonHints
            hints={[
              {
                title: "Keep the learned state small",
                body: (
                  <>
                    One mapping can store each learned pair and its new ID. A
                    second can map every ID back to the bytes it represents.
                    Begin the second mapping with{" "}
                    <LessonInlineCode>bytes([token_id])</LessonInlineCode> for
                    IDs 0 through 255, then extend it whenever a merge is
                    learned.
                  </>
                ),
              },
              {
                title: "Count repeated pretokens once",
                body: (
                  <>
                    Store each unique pretoken as a tuple of byte IDs alongside
                    the number of times it appears. When counting a pair inside
                    that tuple, add the pretoken&apos;s frequency instead of one.
                  </>
                ),
              },
              {
                title: "Reuse one merge helper",
                body: (
                  <>
                    Write one function that replaces a pair from left to right.
                    Move the cursor by two positions after a match and one after
                    anything else. The same helper can be used by training and{" "}
                    <LessonInlineCode>encode</LessonInlineCode>.
                  </>
                ),
              },
              {
                title: "Find the first merge that differs",
                body: (
                  <>
                    If your result does not match, print each learned pair, its
                    frequency, and the ID assigned to it. Compare the runs one
                    round at a time. The first round that differs tells you to
                    inspect training; if every learned merge matches but the
                    final token count does not, inspect{" "}
                    <LessonInlineCode>encode</LessonInlineCode> instead.
                  </>
                ),
              },
              {
                title: "Use the merge IDs as ranks",
                body: (
                  <>
                    New IDs are minted in learning order. During encoding, the
                    available learned pair with the smallest assigned ID is
                    therefore the one that should be applied next.
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
