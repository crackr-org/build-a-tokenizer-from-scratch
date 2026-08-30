import type { ReactNode } from "react";
import { LessonBehaviorExample } from "../../components/LessonBehaviorExample";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonCorpusUrl } from "../../components/LessonCorpusUrl";
import { LessonHints } from "../../components/LessonHints";
import { LessonLead } from "../../components/LessonLead";
import { LessonNote } from "../../components/LessonNote";
import { LessonSubmissionChecklist } from "../../components/LessonSubmissionChecklist";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";

const corpusUrl =
  "https://raw.githubusercontent.com/rasbt/LLMs-from-scratch/main/ch02/01_main-chapter-code/the-verdict.txt";

export function BuildCoreTokenizerPage({
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
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Build a simple tokenizer
            </p>
          </div>
          <p
            className="text-[10px] font-bold text-cr-text-3"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {estimatedMinutes} min
          </p>
        </div>

        <div className="mt-6 h-[2px] bg-cr-border-light">
          <div className="h-[2px] w-32 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Build the core tokenizer
        </h1>

        <p
          className="mt-6 max-w-[680px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Build the mapping that turns text into token IDs and token IDs back
          into readable text.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <LessonLead>
            You already know the core idea: tokenization is a mapping between
            pieces of text, called tokens, and numbers, called token IDs. Your
            task is to implement the simplest version of that mapping. You will
            decide how tokens are found, how their IDs are stored, and how the
            translation works in both directions.
          </LessonLead>

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            Prepare the training corpus
          </h2>

          <p className={bodyClassName}>
            Your tokenizer needs text from which to build its vocabulary. Use
            <a
              href={corpusUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-1 font-semibold text-cr-text underline decoration-cr-accent decoration-2 underline-offset-4"
            >
              The Verdict
            </a>
            {", "}a public-domain short story by Edith Wharton.
          </p>

          <LessonCorpusUrl url={corpusUrl} />

          <p className={bodyClassName}>
            Write the code that downloads the file and loads its{" "}
            <ReferenceLink href="https://www.reedbeta.com/blog/programmers-intro-to-unicode/">
              UTF-8
            </ReferenceLink>{" "}
            contents into a string named <InlineCode>training_text</InlineCode>.
            Keep the corpus-loading code outside{" "}
            <InlineCode>SimpleTokenizer</InlineCode>.
          </p>

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            Create the interface
          </h2>

          <p className={bodyClassName}>
            Create <InlineCode>simple_tokenizer.py</InlineCode> with this public
            shape so the evaluator can import your implementation.
          </p>

          <LessonCodeBlock
            label="simple_tokenizer.py"
            code={String.raw`class SimpleTokenizer:
    def __init__(self, training_text):
        self.token_to_id: dict[str, int] = {}
        self.id_to_token: dict[int, str] = {}

    def tokenize(self, text):
        raise NotImplementedError

    def encode(self, text):
        raise NotImplementedError

    def decode(self, token_ids):
        raise NotImplementedError`}
          />

          <p className={bodyClassName}>
            <InlineCode>token_to_id</InlineCode> maps each known token to its
            integer ID. <InlineCode>id_to_token</InlineCode> is the inverse: each
            ID maps back to the exact token. Build both maps in the constructor
            from <InlineCode>training_text</InlineCode>.
          </p>

          <TaskSection number="01" title="Split text into tokens">
            <p className={bodyClassName}>
              Tokenization begins by deciding how raw text should be split into
              tokens. Only after those tokens are known can the vocabulary
              assign an ID to each one.
            </p>

            <p className={bodyClassName}>
              Splitting is the tokenizer&apos;s first decision. The same text can
              be divided into tokens in different ways, and each choice produces
              a different vocabulary and sequence of token IDs.
            </p>

            <p className={bodyClassName}>
              At its simplest, tokenization can be approximated by splitting
              only at whitespace. Python&apos;s{" "}
              <InlineCode>str.split()</InlineCode>{" "}
              and NLTK&apos;s{" "}
              <InlineCode>WhitespaceTokenizer</InlineCode> both do this, which
              would, for example, tokenize{" "}
              <InlineCode>hello world</InlineCode> as{" "}
              <InlineCode>["hello", "world"]</InlineCode>.
            </p>

            <p className={bodyClassName}>
              Actual models, however, use more sophisticated approaches.{" "}
              <ReferenceLink href="https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf">
                GPT-2
              </ReferenceLink>{" "}
              uses byte-level BPE,{" "}
              <ReferenceLink href="https://ai.meta.com/research/publications/llama-2-open-foundation-and-fine-tuned-chat-models/">
                Llama 2
              </ReferenceLink>{" "}
              uses BPE implemented with SentencePiece, and{" "}
              <ReferenceLink href="https://github.com/google-research/bert">
                BERT
              </ReferenceLink>{" "}
              uses WordPiece.{" "}
              These approaches build vocabularies from reusable subword pieces,
              allowing them to represent words that were never stored as
              complete vocabulary entries. We will build toward BPE later. For
              now, we use a small splitting rule that is less naive than
              whitespace splitting and less sophisticated than BPE, a middle
              ground, if you will. Split your text using the following rules:
            </p>

            <h3 className="pt-2 text-[19px] font-extrabold tracking-[-0.025em] text-cr-text sm:text-[21px]">
              The splitting rules
            </h3>

            <div className="space-y-4 border-l-2 border-cr-accent pl-5">
              <p className={bodyClassName}>
                <strong className="text-cr-text">Keep ordinary text together.</strong>{" "}
                Read from left to right and collect characters until you reach
                whitespace or punctuation. The collected piece becomes one
                token. This gives us a simple first approximation of a word.
              </p>

              <p className={bodyClassName}>
                <strong className="text-cr-text">Separate punctuation.</strong>{" "}
                Finish the current piece whenever you encounter{" "}
                <InlineCode>{`, . : ; ? _ ! " ( ) '`}</InlineCode>, then keep
                that punctuation mark as its own token. Treat two consecutive
                hyphen characters as one punctuation token. Punctuation can
                follow almost any word. If it remains attached, the vocabulary
                needs separate entries for <InlineCode>hello</InlineCode>,{" "}
                <InlineCode>hello,</InlineCode>,{" "}
                <InlineCode>hello!</InlineCode>,{" "}
                <InlineCode>world,</InlineCode>, and every other combination.
                Separating it lets the tokenizer store each word once and reuse
                the same punctuation tokens everywhere. We keep the punctuation
                because it changes how text is read and must survive encoding
                and decoding.
              </p>

              <p className={bodyClassName}>
                <strong className="text-cr-text">Discard whitespace.</strong>{" "}
                A space, tab, or line break finishes the current piece but does
                not become a token. Once the pieces are stored in an ordered
                list, that boundary has already done its job.{" "}
                <InlineCode>hello world</InlineCode>,{" "}
                <InlineCode>{String.raw`hello\tworld`}</InlineCode>, and{" "}
                <InlineCode>{String.raw`hello\nworld`}</InlineCode> all become{" "}
                <InlineCode>["hello", "world"]</InlineCode>. This deliberately
                loses the exact formatting because this first tokenizer only
                needs to reconstruct normalized readable text. A tokenizer for
                code or an exact round trip would need to preserve whitespace.
              </p>

              <p className={bodyClassName}>
                <strong className="text-cr-text">Preserve case and order.</strong>{" "}
                The vocabulary maps exact token strings to IDs. If the tokenizer
                lowercases <InlineCode>Apple</InlineCode>, then{" "}
                <InlineCode>Apple</InlineCode> and{" "}
                <InlineCode>apple</InlineCode> receive the same ID. The original
                capitalization is lost, and <InlineCode>decode</InlineCode>{" "}
                cannot restore it. Tokens must also remain in source order
                because the model receives a sequence. Sorting them would change
                the sentence before the model ever sees it.
              </p>
            </div>

            <LessonBehaviorExample
              input={'tokenizer.tokenize("Hello, world! It\'s me.")'}
              output={'["Hello", ",", "world", "!", "It", "\'", "s", "me", "."]'}
            />

            <p className={bodyClassName}>
              This is a perfect job for a regular expression, but use whatever
              approach you prefer. The evaluator checks only the token sequence
              your method produces.
            </p>
          </TaskSection>

          <TaskSection number="02" title="Build the vocabulary">
            <p className={bodyClassName}>
              Tokenize the entire training corpus and assign one integer ID to
              every unique token. Repeated tokens share an ID, and the same
              corpus must always produce the same mappings.
            </p>

          <LessonCodeBlock
              label="expected properties"
              code={String.raw`tokenizer = SimpleTokenizer("red blue red")

assert set(tokenizer.token_to_id) == {"red", "blue"}
assert set(tokenizer.id_to_token.values()) == {"red", "blue"}

for token, token_id in tokenizer.token_to_id.items():
    assert tokenizer.id_to_token[token_id] == token`}
            />
          </TaskSection>

          <TaskSection number="03" title="Encode known text">
            <p className={bodyClassName}>
              Implement <InlineCode>encode</InlineCode>. Tokenize the input and
              return the corresponding IDs in the same order.
            </p>

          <LessonCodeBlock
              label="expected behavior"
              code={String.raw`tokenizer = SimpleTokenizer("Hello, world!")
token_ids = tokenizer.encode("Hello, world!")

assert isinstance(token_ids, list)
assert len(token_ids) == 4
assert all(isinstance(token_id, int) for token_id in token_ids)`}
            />

            <LessonNote>
              Unknown tokens may fail for now. You will handle them in the next
              substage.
            </LessonNote>
          </TaskSection>

          <TaskSection number="04" title="Decode token IDs">
            <p className={bodyClassName}>
              Implement <InlineCode>decode</InlineCode>. Convert each ID back to
              its token and reconstruct readable text. Use single spaces between
              words and no space before punctuation.
            </p>

            <LessonBehaviorExample
              input={'tokenizer.decode(tokenizer.encode("Hello, world!"))'}
              output={'"Hello, world!"'}
            />

            <p className={bodyClassName}>
              Exact whitespace does not need to survive this version. The
              decoded text may be normalized.
            </p>
          </TaskSection>

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            Before you submit
          </h2>

          <LessonSubmissionChecklist
            items={[
              "Your implementation is in simple_tokenizer.py.",
              "The public class is named SimpleTokenizer.",
              "Both vocabulary maps are populated and inverse.",
              "Known text completes the encode and decode round trip.",
              "You use only the Python standard library.",
            ]}
          />

          <LessonHints
            hints={[
              {
                title: "Build the pattern in Regex101",
                body: (
                  <>
                    Open{" "}
                    <ReferenceLink href="https://regex101.com/?flavor=python">
                      Regex101 in Python mode
                    </ReferenceLink>, paste{" "}
                    <InlineCode>Hello, world! It&apos;s me.</InlineCode>{" "}
                    into the test string, and build a pattern that matches the
                    separators described above. Its live explanation is useful
                    when a quote, parenthesis, or whitespace rule is not matching
                    as expected.
                  </>
                ),
              },
              {
                title: "Inspect a small re.split result first",
                body: (
                  <>
                    Before handling every separator, try{" "}
                    <InlineCode>
                      {String.raw`re.split(r"([,!]|\s)", "Hello, world!")`}
                    </InlineCode>. Because the separators are captured, the result includes
                    the comma, exclamation mark, whitespace, and some empty
                    strings. That output shows the final cleanup your{" "}
                    <InlineCode>tokenize</InlineCode> method needs: discard empty
                    and whitespace-only pieces, but keep punctuation. Once that
                    works, expand the pattern to the complete separator list from
                    the task.
                  </>
                ),
              },
              {
                title: "Build both maps once in the constructor",
                body: (
                  <>
                    Start the constructor with{" "}
                    <InlineCode>
                      {String.raw`sorted(set(self.tokenize(training_text)))`}
                    </InlineCode>
                    . This gives one stable ordered list containing every unique
                    token. Enumerate that list once to populate{" "}
                    <InlineCode>token_to_id</InlineCode>, then reverse those exact
                    pairs to populate <InlineCode>id_to_token</InlineCode>. Do not
                    sort or enumerate a second time. For{" "}
                    <InlineCode>red blue red</InlineCode>, both maps should contain
                    exactly two entries and point back to each other.
                  </>
                ),
              },
              {
                title: "Encode with the existing vocabulary",
                body: (
                  <>
                    <InlineCode>encode</InlineCode> should not build or change the
                    vocabulary. Pass the input through{" "}
                    <InlineCode>self.tokenize(text)</InlineCode>, then replace each
                    resulting token with its existing value in{" "}
                    <InlineCode>self.token_to_id</InlineCode>, preserving the list
                    order. If an unknown token raises{" "}
                    <InlineCode>KeyError</InlineCode>, that is acceptable in this
                    substage.
                  </>
                ),
              },
              {
                title: "Decode in two visible passes",
                body: (
                  <>
                    First, use <InlineCode>id_to_token</InlineCode> to recover the
                    tokens and join them with single spaces. For the example in
                    the task, inspect that intermediate string: it should look
                    like <InlineCode>Hello , world !</InlineCode>. Then run a
                    second cleanup pass that removes whitespace immediately
                    before the supported punctuation marks, producing{" "}
                    <InlineCode>Hello, world!</InlineCode>. Keeping the passes
                    separate makes a failed lookup easy to distinguish from a
                    spacing bug.
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
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
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

function ReferenceLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-cr-text underline decoration-cr-accent decoration-2 underline-offset-4 transition-colors hover:text-cr-text-2"
    >
      {children}
    </a>
  );
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code
      className="mx-1 rounded bg-cr-border-faint px-1.5 py-0.5 text-[0.88em] font-bold text-cr-text"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {children}
    </code>
  );
}
