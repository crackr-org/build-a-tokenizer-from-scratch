import { Link } from "react-router-dom";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonReadingNote } from "../../components/LessonReadingNote";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

export function UnicodeUtf8AndBytesPage({
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
          <div className="h-[2px] w-16 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[700px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Unicode, UTF-8, and bytes
        </h1>

        <p
          className="mt-6 max-w-[680px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          How Unicode fixed ASCII, how UTF-8 turns Unicode code points into
          bytes, why only 256 byte values are enough to represent any text, and
          why feeding those bytes to a Transformer one by one brings us to BPE.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <UnicodeReadingNote />

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            A short history of text
          </h2>

          <p className={bodyClassName}>
            As we established in{" "}
            <Link
              to="/guide/llms-cant-read"
              relative="path"
              className="font-semibold text-cr-text underline decoration-cr-accent decoration-2 underline-offset-4 transition-colors hover:text-cr-text-2"
            >
              &ldquo;LLMs Can&apos;t Read,&rdquo;
            </Link>
            {" "}our tokenizer translates text into token IDs. These IDs can
            be used as lookup keys in a dictionary. Inside an LLM, a similar
            idea is at work: each ID points to an entry in a fixed table. ML
            engineers call this an{" "}
            <strong className="font-semibold text-cr-text underline decoration-cr-accent decoration-2 underline-offset-4">
              embedding table
            </strong>
            {"."}
          </p>

          <p className={bodyClassName}>
            Because this table has a fixed, predefined size in memory, our
            vocabulary must also of course be fixed. We saw the flaw of this
            constraint in our <LessonInlineCode>SimpleTokenizer</LessonInlineCode>.
            If a word isn&apos;t in the vocabulary, we replace it with{" "}
            <LessonInlineCode>{"<|unk|>"}</LessonInlineCode>. It worked in that
            it gave unfamiliar tokens a valid ID, but it destroyed their original
            contents nonetheless. We cannot fix this by simply making the
            vocabulary infinitely large to catch every new word or misspelling.
            To guarantee that every possible string can be processed without an
            infinite lookup table, LLMs use what is known as{" "}
            <strong className="font-semibold text-cr-text underline decoration-cr-accent decoration-2 underline-offset-4">
              subword tokenization
            </strong>
            {"."} We&apos;ll cover that concept in detail in the next section. For
            now, take a look at this string:
          </p>

          <LessonCodeBlock code={'text = "Aم你👋"'} />

          <p className={bodyClassName}>
            In the early days of computing, text meant English.{" "}
            <LessonReferenceLink href="https://en.wikipedia.org/wiki/ASCII">
              The ASCII standard
            </LessonReferenceLink>
            {", published in 1963, used 7 bits per character, which gave exactly "}
            <strong className="font-semibold text-cr-text">
              128 possible symbols
            </strong>
            {", uppercase and lowercase Latin letters, digits, a handful of "}
            punctuation marks, and some control codes like carriage return. That
            was enough for teletypes and the first generation of terminals, but
            it locked out almost the entire world. You could not write Arabic,
            Chinese, or even accented French in pure ASCII without resorting to
            ad-hoc tricks.
          </p>

          <p className={bodyClassName}>
            Over the 1980s, a patchwork of &ldquo;code pages&rdquo; tried to fill
            the gap.{" "}
            <LessonReferenceLink href="https://en.wikipedia.org/wiki/Code_page_437">
              Code page 437 for DOS
            </LessonReferenceLink>
            {" "}and{" "}
            <LessonReferenceLink href="https://en.wikipedia.org/wiki/ISO/IEC_8859-1">
              ISO-8859-1 for Western Europe
            </LessonReferenceLink>
            {" "}defined extra characters in the 128 to 255 range that ASCII left
            unused.{" "}
            <LessonReferenceLink href="https://en.wikipedia.org/wiki/Shift_JIS">
              Shift-JIS for Japan
            </LessonReferenceLink>
            {" "}used a multibyte encoding instead. A file written in one code
            page turned into gibberish when opened on a system expecting another.
            If you&apos;d sent{" "}
            <LessonInlineCode>{'text = "Aم你👋"'}</LessonInlineCode> through a
            1980s email gateway, the recipient would have seen something
            different.
          </p>

          <p className={bodyClassName}>
            Then, in 1991, the tech industry, in an effort to fix this,
            introduced the first volume of the{" "}
            <LessonReferenceLink href="https://www.unicode.org/standard/standard.html">
              Unicode Standard
            </LessonReferenceLink>
            {". "}It assigns an integer, called a{" "}
            <strong className="font-semibold text-cr-text">code point</strong>,
            to every character it recognises. Version 15.1, for example, defined
            149,813 characters across 161 scripts when it was released in
            September 2023. The standard continues to evolve.
          </p>

          <p className={bodyClassName}>
            In Python for example, the official documentation defines{" "}
            <LessonInlineCode>str</LessonInlineCode> as an immutable sequence of
            these Unicode code points. You can use the{" "}
            <LessonInlineCode>ord()</LessonInlineCode> function to peek at the
            underlying code point of a character, or{" "}
            <LessonInlineCode>chr()</LessonInlineCode> to translate that integer
            back into text.
          </p>

          <LessonCodeBlock
            code={'text = "Aم你👋"\n\n[(character, f"U+{ord(character):04X}") for character in text]'}
            output={'[("A", "U+0041"), ("م", "U+0645"), ("你", "U+4F60"), ("👋", "U+1F44B")]'}
          />

          <div className="mb-9 mt-12 border-l-4 border-cr-accent pl-5 sm:pl-6">
            <div className="flex items-center gap-2.5">
              <span
                className="size-2 border border-cr-brand bg-cr-accent"
                aria-hidden="true"
              />
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-cr-text-2"
                style={monoStyle}
              >
                A natural question
              </p>
            </div>
            <h3 className="mt-2 max-w-[680px] text-[22px] font-extrabold leading-[1.35] tracking-[-0.025em] text-cr-text sm:text-[26px]">
              If the code points are already integers,{" "}
              <span className="bg-cr-accent px-1 text-cr-on-accent">why not</span>{" "}
              feed them directly into a neural network as token IDs?
            </h3>
          </div>

          <p className={bodyClassName}>
            It is a tempting shortcut, but doing so creates two deal-breaking problems.
          </p>

          <p className={bodyClassName}>
            The first reason is{" "}
            <strong className="font-semibold text-cr-text">vocabulary size</strong>.
            While Unicode currently defines around 150,000 characters, the actual
            mathematical space it uses, running from{" "}
            <LessonInlineCode>U+0000</LessonInlineCode> to{" "}
            <LessonInlineCode>U+10FFFF</LessonInlineCode>, allows for over{" "}
            <strong className="font-semibold text-cr-text">
              1.1 million possible positions
            </strong>
            {". "}If we mapped them 1:1, the neural network would have to reserve a
            massive 1.1-million-row embedding table. This would waste gigabytes
            of memory on a code space that is incredibly sparse and mostly empty.
          </p>

          <p className={bodyClassName}>
            The second, more concerning reason is{" "}
            <strong className="font-semibold text-cr-text">instability</strong>.
            As we noted, the Unicode Standard is a living document that constantly
            evolves. If we try to save memory by only reserving embedding rows for
            the 150,000 characters known today, what happens when a new emoji or
            symbol is added next year? Our frozen vocabulary wouldn&apos;t have an ID
            for it. We would be right back to using{" "}
            <LessonInlineCode>{"<|unk|>"}</LessonInlineCode>.
          </p>

          <p className={bodyClassName}>
            These factors necessitate a better approach. To avoid a bloated
            embedding table and the <LessonInlineCode>{"<|unk|>"}</LessonInlineCode>{" "}
            problem, we need a closed, strictly bounded system that never has to
            change, even when new characters are invented.
          </p>

          <p className={bodyClassName}>
            The solution is{" "}
            <strong className="font-semibold text-cr-text">encoding</strong>.
          </p>

          <p className={bodyClassName}>
            Encoding is the process of translating a sequence of Unicode code
            points into a sequence of{" "}
            <strong className="font-semibold text-cr-text">bytes</strong> for
            computers to store and transmit. The{" "}
            <LessonReferenceLink href="https://www.unicode.org/standard/standard.html">
              Unicode Standard
            </LessonReferenceLink>{" "}
            defines three official encoding forms:{" "}
            <strong className="font-semibold text-cr-text">UTF-8</strong>,{" "}
            <strong className="font-semibold text-cr-text">UTF-16</strong>, and{" "}
            <strong className="font-semibold text-cr-text">UTF-32</strong>. All
            three can faithfully round-trip the entire Unicode repertoire; they
            differ only in their memory layout.
          </p>

          <p className={bodyClassName}>
            Open a Python interpreter and try this:
          </p>

          <LessonCodeBlock
            code={'text = "Aم你👋"\n\nutf8  = text.encode("utf-8")    # variable-width\nutf16 = text.encode("utf-16")   # 2 or 4 bytes per code point\nutf32 = text.encode("utf-32")   # always 4 bytes per code point\n\nprint("UTF-8  bytes:", list(utf8))\nprint("UTF-16 bytes:", list(utf16))\nprint("UTF-32 bytes:", list(utf32))'}
            output={'UTF-8  bytes: [65, 217, 133, 228, 189, 160, 240, 159, 145, 139]  # 10 bytes\nUTF-16 bytes: [255, 254, 65, 0, 69, 6, 96, 79, 61, 216, 75, 220]  # 12 bytes\nUTF-32 bytes: [255, 254, 0, 0, 65, 0, 0, 0, 69, 6, 0, 0, 96, 79, 0, 0, 75, 244, 1, 0]  # 20 bytes'}
          />

          <p className={bodyClassName}>
            Comparing these outputs reveals a few trade-offs.
          </p>

          <ul className="my-7 space-y-5 border-l-2 border-cr-accent pl-5 sm:pl-6">
            <li className={bodyClassName}>
              <strong className="font-semibold text-cr-text">UTF-32</strong>{" "}
              always uses exactly 4 bytes per code point.{" "}
              <LessonInlineCode>A</LessonInlineCode> alone becomes{" "}
              <LessonInlineCode>65, 0, 0, 0</LessonInlineCode>. That is four bytes
              for a character that only needed one in ASCII. Character{" "}
              <em>n</em> is at byte offset 4 × <em>n</em>, which makes indexing
              very simple, but it is painfully wasteful.
            </li>
            <li className={bodyClassName}>
              <strong className="font-semibold text-cr-text">UTF-16</strong>{" "}
              uses 2 bytes for most common characters, such as{" "}
              <LessonInlineCode>A</LessonInlineCode>,{" "}
              <LessonInlineCode>م</LessonInlineCode>, and{" "}
              <LessonInlineCode>你</LessonInlineCode>. Characters above{" "}
              <LessonInlineCode>U+FFFF</LessonInlineCode>, such as{" "}
              <LessonInlineCode>👋</LessonInlineCode> at{" "}
              <LessonInlineCode>U+1F44B</LessonInlineCode>, need a{" "}
              <em>surrogate pair</em>, which means two 16-bit units, or 4 bytes.
              The first two bytes in Python&apos;s output,{" "}
              <LessonInlineCode>255, 254</LessonInlineCode>, are a{" "}
              <strong className="font-semibold text-cr-text">
                Byte Order Mark (BOM)
              </strong>{" "}
              telling the decoder that the remaining units use little-endian
              byte order, something we do not have to think about with UTF-8.
            </li>
            <li className={bodyClassName}>
              <strong className="font-semibold text-cr-text">UTF-8</strong>{" "}
              uses a variable number of bytes: 1 for{" "}
              <LessonInlineCode>A</LessonInlineCode>, two for{" "}
              <LessonInlineCode>م</LessonInlineCode>, 3 for{" "}
              <LessonInlineCode>你</LessonInlineCode>, and 4 for{" "}
              <LessonInlineCode>👋</LessonInlineCode>. Python adds no BOM here,
              there is no endianness confusion, and the first 128 values are
              identical to ASCII. That last point means every plain ASCII text is
              already valid UTF-8 without any conversion.
            </li>
          </ul>

          <EncodingComparison />

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            Why do we care about this for tokenization?
          </h2>

          <p className={bodyClassName}>
            If we treated raw bytes as tokens, UTF-8 would give us a tiny, fixed
            vocabulary of exactly{" "}
            <strong className="font-semibold text-cr-text">
              256 possible values
            </strong>
            {". "}The trade-off is that a single character can become up to 4 tokens,
            making sequences longer. Later we&apos;ll fix that with a technique
            called{" "}
            <strong className="font-semibold text-cr-text">merging</strong> in
            BPE, but we first needed a stable byte foundation. UTF-8 gives us a
            universal, byte-native,{" "}
            <LessonReferenceLink href="https://blog.davidvarghese.net/posts/character-encoding-part-2/">
              self-synchronizing
            </LessonReferenceLink>{" "}
            representation with ASCII transparency and no byte-order choice. It
            is also the dominant interchange format on the web.
          </p>

          <p className={bodyClassName}>
            We can now turn that foundation into a vocabulary. Because a byte has
            exactly eight bits, there are{" "}
            <strong className="font-semibold text-cr-text">
              2<sup>8</sup> = 256
            </strong>{" "}
            possible byte values. We can put every single one of them into our
            starting vocabulary and use the values{" "}
            <LessonInlineCode>0</LessonInlineCode> through{" "}
            <LessonInlineCode>255</LessonInlineCode> as their initial token IDs.
            Later, any new tokens we create will receive an ID of 256 or higher.
          </p>

          <p className={bodyClassName}>
            Great, we could theoretically stop here and train a model on one
            token per byte. The vocabulary would be tiny, and every valid Unicode
            string would be representable. The cost, however, would be{" "}
            <strong className="font-semibold text-cr-text">
              extremely long sequences
            </strong>
            {". "}English text takes roughly one token per character, Arabic letters
            commonly take two, Chinese characters commonly take three, and many
            emojis take four. Words and punctuation would be spelled out byte by
            byte, over and over again.
          </p>

          <p className={bodyClassName}>
            For a transformer, which supports only a{" "}
            <strong className="font-semibold text-cr-text">
              finite context length
            </strong>{" "}
            for computational reasons, spending four positions on, say, a single
            emoji leaves less room for the surrounding document. Long sequences
            therefore consume this limited context window quite inefficiently.
          </p>

          <aside className="my-8 border-y border-cr-border-light py-5">
            <div className="flex items-center gap-2.5">
              <span
                className="size-2 border border-cr-brand bg-cr-accent"
                aria-hidden="true"
              />
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-cr-text-3"
                style={monoStyle}
              >
                A note on current research
              </p>
            </div>
            <p className="mt-3 text-[14px] font-medium leading-7 text-cr-text-2 sm:text-[15px]">
              As we established, using one Unicode code point per token gives us
              a massive vocabulary, while using raw bytes gives a Transformer
              much longer sequences than it can handle efficiently. But
              researchers have not given up on using raw bytes directly.{" "}
              <LessonReferenceLink href="https://arxiv.org/abs/2105.13626">
                ByT5
              </LessonReferenceLink>{" "}
              works directly on bytes.{" "}
              <LessonReferenceLink href="https://arxiv.org/abs/2305.07185">
                MEGABYTE
              </LessonReferenceLink>{" "}
              and{" "}
              <LessonReferenceLink href="https://arxiv.org/abs/2412.09871">
                BLT
              </LessonReferenceLink>{" "}
              group bytes into patches.{" "}
              <LessonReferenceLink href="https://arxiv.org/abs/2401.13660">
                MambaByte
              </LessonReferenceLink>{" "}
              replaces attention with a state-space model, and 2026&apos;s{" "}
              <LessonReferenceLink href="https://arxiv.org/abs/2605.08044">
                Fast BLT
              </LessonReferenceLink>{" "}
              tries to make byte-by-byte generation faster. These models show
              that removing tokenization is possible. What researchers have not
              fully solved yet is making byte-level models as practical and
              efficient as the tokenized LLMs we use today.
            </p>
          </aside>

          <p className={bodyClassName}>
            Whoever finally gets rid of tokenization gets the glory. Until that
            happens, we still need a middle ground between whole-word tokens and
            tiny byte units. This is where{" "}
            <strong className="font-semibold text-cr-text">
              Byte-Pair Encoding (BPE)
            </strong>
            {" "}comes in.
          </p>
        </div>
      </div>
    </article>
  );
}

function UnicodeReadingNote() {
  const readings = [
    {
      author: "Nathan Reed",
      title: "A Programmer’s Introduction to Unicode",
      href: "https://www.reedbeta.com/blog/programmers-intro-to-unicode/",
    },
    {
      author: "kunststube",
      title: "Encoding",
      href: "https://kunststube.net/encoding/",
    },
    {
      author: "Joel Spolsky",
      title:
        "The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets",
      href: "https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/",
    },
  ];

  return (
    <LessonReadingNote label="A note before continuing" readings={readings}>
      <p>
        Our topic isn&apos;t Unicode and encoding per se, but we needed this
        foundation. We haven&apos;t dug deeply here, and some prior knowledge
        is assumed. If any of this feels unfamiliar, we highly recommend
        reading:
      </p>
    </LessonReadingNote>
  );
}

function EncodingComparison() {
  const rows = [
    { text: "A", utf8: "41 · 1", utf16: "41 00 · 2", utf32: "41 00 00 00 · 4" },
    { text: "م", utf8: "D9 85 · 2", utf16: "45 06 · 2", utf32: "45 06 00 00 · 4" },
    { text: "你", utf8: "E4 BD A0 · 3", utf16: "60 4F · 2", utf32: "60 4F 00 00 · 4" },
    { text: "👋", utf8: "F0 9F 91 8B · 4", utf16: "3D D8 4B DC · 4", utf32: "4B F4 01 00 · 4" },
  ];

  return (
    <figure className="my-8">
      <div className="overflow-x-auto rounded-xl border-2 border-cr-border bg-cr-card">
        <div className="min-w-[620px]">
          <div
            className="grid grid-cols-[70px_repeat(3,minmax(0,1fr))] border-b-2 border-cr-border bg-cr-border-faint text-[9px] font-extrabold uppercase tracking-[0.1em] text-cr-text-3"
            style={monoStyle}
          >
            <div className="px-4 py-3">Text</div>
            <div className="border-l border-cr-border px-4 py-3">UTF-8</div>
            <div className="border-l border-cr-border px-4 py-3">UTF-16 LE</div>
            <div className="border-l border-cr-border px-4 py-3">UTF-32 LE</div>
          </div>
          {rows.map((row) => (
            <div
              key={row.text}
              className="grid grid-cols-[70px_repeat(3,minmax(0,1fr))] border-b border-cr-border-light last:border-b-0"
            >
              <div className="px-4 py-4 text-center text-[20px] font-bold text-cr-text">
                {row.text}
              </div>
              {[row.utf8, row.utf16, row.utf32].map((value, index) => (
                <div
                  key={value}
                  className={
                    "border-l border-cr-border-light px-4 py-4 text-[10px] font-bold " +
                    (index === 0
                      ? "bg-cr-accent-bg text-cr-text"
                      : "text-cr-text-2")
                  }
                  style={monoStyle}
                >
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 text-[11px] font-medium leading-5 text-cr-text-3">
        Hexadecimal payload bytes followed by total byte count; byte order marks
        are omitted. Little-endian places the least-significant byte of each
        UTF-16 or UTF-32 code unit first.
      </figcaption>
    </figure>
  );
}
