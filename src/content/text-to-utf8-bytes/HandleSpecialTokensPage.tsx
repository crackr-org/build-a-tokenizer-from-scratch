import { LessonBehaviorExample } from "../../components/LessonBehaviorExample";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonHints } from "../../components/LessonHints";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonLead } from "../../components/LessonLead";
import { LessonNote } from "../../components/LessonNote";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";
import { LessonSubmissionChecklist } from "../../components/LessonSubmissionChecklist";
import { LessonTaskSection } from "../../components/LessonTaskSection";
import { LessonTerm } from "../../components/LessonTerm";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";

export function HandleSpecialTokensPage({
  estimatedMinutes,
}: {
  estimatedMinutes: number;
}) {
  const usernameExample = "learner_builds_2026";

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
          <div className="h-[2px] w-48 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Handle special tokens
        </h1>

        <p
          className="mt-6 max-w-[680px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Extend a fixed vocabulary so unfamiliar text and document boundaries
          have a defined representation.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <LessonLead>
            Your tokenizer learned a fixed vocabulary from The Verdict, but the
            text it will receive is not fixed. A new username, misspelling, or
            code identifier can introduce a token the corpus never contained.
            The tokenizer still has to return IDs the model understands.
          </LessonLead>

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            When a token has no ID
          </h2>

          <p className={bodyClassName}>
            A larger training corpus reduces the number of unfamiliar tokens,
            but it cannot anticipate every future input. Someone can type a new
            username such as
            {" "}
            <LessonInlineCode>{usernameExample}</LessonInlineCode>, misspell
            {" "}
            <LessonInlineCode>tokenization</LessonInlineCode> as
            {" "}
            <LessonInlineCode>tokenizashun</LessonInlineCode>, or introduce a code
            identifier such as <LessonInlineCode>parseUtf8Chunk</LessonInlineCode>
            {" "}
            after the vocabulary has already been
            {" "}
            <LessonTerm
              definition="Fixed after tokenizer training. Changing the token-to-ID map later would also require resizing and retraining the model."
            >
              frozen
            </LessonTerm>{"."}
          </p>

          <p className={bodyClassName}>
            Historically, models solved this{" "}
            <strong className="font-semibold text-cr-text">
              “Out of Vocabulary”
            </strong>{" "}
            problem by assigning an
            {" "}
            <LessonInlineCode>{"<UNK>"}</LessonInlineCode> fallback ID to
            unrecognized words, effectively blinding the model to their actual
            contents.
          </p>

          <p className={bodyClassName}>
            Modern Large Language Models solve this elegantly using{" "}
            <strong className="font-semibold text-cr-text">
              subword tokenization
            </strong>
            , popularized by{" "}
            <LessonReferenceLink href="https://arxiv.org/abs/1508.07909">
              Sennrich et al. (2015)
            </LessonReferenceLink>
            {" "}
            and later refined into{" "}
            <strong className="font-semibold text-cr-text">
              Byte-Level Byte-Pair Encoding
            </strong>{" "}
            for models like GPT-4 through OpenAI&apos;s{" "}
            <LessonReferenceLink href="https://github.com/openai/tiktoken">
              tiktoken
            </LessonReferenceLink>{"."} In Byte-Level BPE, the base vocabulary
            includes all 256 raw UTF-8
            bytes. If an unfamiliar word cannot be matched to a known subword,
            the tokenizer fractures it down to individual bytes.
          </p>

          <p className={bodyClassName}>
            Our current <LessonInlineCode>SimpleTokenizer</LessonInlineCode> has
            no such mechanism. It attempts exact string matching. Because The
            Verdict never contained the exact word
            {" "}
            <LessonInlineCode>Hello</LessonInlineCode>, it was never assigned an
            ID, causing our program to crash:
          </p>

          <LessonCodeBlock
            code={String.raw`tokenizer = SimpleTokenizer(training_text)
tokenizer.encode("Hello")`}
            output={String.raw`Traceback (most recent call last):
  ...
KeyError: 'Hello'`}
            outputTone="error"
          />

          <p className={bodyClassName}>
            Tokenization succeeds in splitting the string, but
            {" "}
            <LessonInlineCode>encode</LessonInlineCode> fails because
            {" "}
            <LessonInlineCode>Hello</LessonInlineCode> does not exist in the
            {" "}
            <LessonInlineCode>token_to_id</LessonInlineCode> dictionary. To handle
            production data without crashing, a tokenizer must be able to fall
            back to smaller known sub-components or raw bytes.
          </p>

          <p className={bodyClassName}>
            We are not adding{" "}
            <strong className="font-semibold text-cr-text">
              subword tokenization
            </strong>{" "}
            yet, so{" "}
            <LessonInlineCode>SimpleTokenizer</LessonInlineCode> will use the
            simpler fallback described above. An unfamiliar token is represented
            by a reserved <LessonInlineCode>{"<|unk|>"}</LessonInlineCode> ID.
            Encoding can then continue without inventing a new ID or crashing.
            The tradeoff is{" "}
            <strong className="font-semibold text-cr-text">
              information loss: every unfamiliar token becomes the same ID, so
              its original identity cannot be recovered.
            </strong>
          </p>

          <p className={bodyClassName}>
            <LessonInlineCode>{"<|unk|>"}</LessonInlineCode> is a special token.
            Ordinary vocabulary entries are extracted from The Verdict because
            they appear in the corpus. The unknown token is included deliberately
            even when its literal string never appears there. Its ID means that
            the vocabulary could not represent the original token. Like every
            other entry, it participates in the same
            {" "}
            <LessonInlineCode>token_to_id</LessonInlineCode> and
            {" "}
            <LessonInlineCode>id_to_token</LessonInlineCode> maps.
          </p>

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            Separate unrelated tokens
          </h2>

          <p className={bodyClassName}>
            An unfamiliar word is not the only information a plain token stream
            can fail to represent. A pretraining corpus is assembled from many
            independent books, articles, and web pages. To prepare batches
            efficiently, those documents are often joined into long token
            streams. Joining them removes the boundary between sources: the last
            token of one document now sits directly beside the first token of an
            unrelated document.
          </p>

          <p className={bodyClassName}>
            Imagine one document ends with
            {" "}
            <LessonInlineCode>The spacecraft landed on Mars.</LessonInlineCode>
            {" "}
            and the next begins with
            {" "}
            <LessonInlineCode>Whisk the eggs until smooth.</LessonInlineCode>
            {" "}
            Without a boundary, next-token training asks the model to predict
            {" "}
            <LessonInlineCode>Whisk</LessonInlineCode> immediately after
            {" "}
            <LessonInlineCode>Mars.</LessonInlineCode>. That transition came from
            the way the dataset was assembled, not from any relationship between
            space travel and a recipe.
          </p>

          <LessonBehaviorExample
            input={'"The spacecraft landed on Mars. Whisk the eggs until smooth."'}
            output={'"The spacecraft landed on Mars. <|endoftext|> Whisk the eggs until smooth."'}
            inputLabel="Without boundary"
            outputLabel="With boundary"
          />

          <p className={bodyClassName}>
            <LessonInlineCode>{"<|endoftext|>"}</LessonInlineCode> reserves an ID
            for that missing boundary. Instead of learning
            {" "}
            <LessonInlineCode>Mars. → Whisk</LessonInlineCode>, the model learns
            {" "}
            <LessonInlineCode>{"Mars. → <|endoftext|>"}</LessonInlineCode> and
            {" "}
            <LessonInlineCode>{"<|endoftext|> → Whisk"}</LessonInlineCode>. The
            model can also learn that producing this ID means the current
            document is complete.
          </p>

          <LessonNote label="What the token actually does">
            <LessonInlineCode>{"<|endoftext|>"}</LessonInlineCode> does not erase
            context or improve the model by itself. It gives the training data an
            explicit boundary signal. The model learns how to use that signal
            from the examples it sees during training.
          </LessonNote>

          <LessonTaskSection number="01" title="Give unknown tokens a fallback">
            <p className={bodyClassName}>
              Extend the constructor so
              {" "}
              <LessonInlineCode>{"<|unk|>"}</LessonInlineCode> always has a unique
              ID in both vocabulary maps. Add it after the ordinary corpus
              vocabulary has been sorted and assigned its IDs.
            </p>

            <p className={bodyClassName}>
              Update <LessonInlineCode>encode</LessonInlineCode> so a missing token
              uses that reserved ID instead of raising
              {" "}
              <LessonInlineCode>KeyError</LessonInlineCode>. Known tokens must
              continue to use their existing IDs, and the vocabulary must not
              change while encoding.
            </p>

            <LessonBehaviorExample
              input={'tokenizer.decode(tokenizer.encode("Hello, do you like tea?"))'}
              output={'"<|unk|>, do you like tea?"'}
            />
          </LessonTaskSection>

          <LessonTaskSection number="02" title="Separate unrelated documents">
            <p className={bodyClassName}>
              Add <LessonInlineCode>{"<|endoftext|>"}</LessonInlineCode> to both
              vocabulary maps. The code preparing the corpus decides where
              documents end and inserts the marker between them.
              {" "}
              <LessonInlineCode>SimpleTokenizer</LessonInlineCode> must preserve
              the complete marker as one token, encode its reserved ID, and
              decode that ID back to the same marker.
            </p>

            <LessonBehaviorExample
              input={'tokenizer.decode(tokenizer.encode("It was. <|endoftext|> It was."))'}
              output={'"It was. <|endoftext|> It was."'}
            />
          </LessonTaskSection>

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            Before you submit
          </h2>

          <LessonSubmissionChecklist
            items={[
              "Both special tokens have unique IDs in both vocabulary maps.",
              "Encoding an unknown token does not change the vocabulary.",
              "Unknown tokens encode and decode as <|unk|>.",
              "The complete <|endoftext|> marker is treated as one token.",
              "Known text and document boundaries complete the round trip.",
            ]}
          />

          <LessonHints
            hints={[
              {
                title: "Trace the failing dictionary lookup",
                body: (
                  <>
                    Print the result of
                    {" "}
                    <LessonInlineCode>{'tokenize("Hello")'}</LessonInlineCode>
                    {" "}
                    before calling <LessonInlineCode>encode</LessonInlineCode>.
                    If it contains one token, splitting worked. The failure is
                    the following lookup in
                    {" "}
                    <LessonInlineCode>token_to_id</LessonInlineCode>, which needs
                    a fallback for missing keys.
                  </>
                ),
              },
              {
                title: "Resolve the fallback ID once",
                body: (
                  <>
                    Read the ID belonging to
                    {" "}
                    <LessonInlineCode>{"<|unk|>"}</LessonInlineCode> before mapping
                    the input tokens. For every token, use its known ID when one
                    exists and that fallback ID otherwise. Python dictionary
                    lookups support this behavior directly.
                  </>
                ),
              },
              {
                title: "Add reserved entries after corpus tokens",
                body: (
                  <>
                    First build the same sorted ordinary vocabulary as the
                    previous substage. Then add the two reserved strings and
                    build both maps from that final list. This preserves the IDs
                    of corpus tokens while giving each special token a distinct
                    ID.
                  </>
                ),
              },
              {
                title: "Match the complete boundary marker first",
                body: (
                  <>
                    Test
                    {" "}
                    <LessonInlineCode>{'tokenize("one.<|endoftext|>two.")'}</LessonInlineCode>.
                    The marker should be one list item even without surrounding
                    spaces. If you use a regular expression, recognize the full
                    special-token string before applying the ordinary punctuation
                    and whitespace boundaries.
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
