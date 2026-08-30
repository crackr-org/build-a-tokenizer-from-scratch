import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";
import { LessonTerm } from "../../components/LessonTerm";
import { BpeCompressionPlayground } from "./BpeCompressionPlayground";
import { BpeMergeAnimation } from "./BpeMergeAnimation";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const pseudocode = `vocabulary = every byte from 0 to 255
tokens = training_text_as_utf8_bytes()

while vocabulary.size < target_size:
    pair_counts = count_adjacent_pairs(tokens)
    pair = most_frequent(pair_counts)

    new_token = vocabulary.add(pair)
    merge_rules.append(pair, new_token)

    tokens = replace_non_overlapping(
        tokens,
        pair,
        new_token,
    )

save(vocabulary, merge_rules)`;

export function HowBpeCompressesTextPage({
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
          <div className="h-[2px] w-24 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[700px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          How BPE compresses text
        </h1>

        <p
          className="mt-6 max-w-[680px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Why raw bytes are too expensive for a Transformer, how BPE compresses
          them one repeated pair at a time, what the tokenizer keeps after
          training, and how many merges are enough.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <p className={bodyClassName}>
            We learned that, ideally, we would just feed raw byte sequences
            directly into the model. But that would stretch our sequences to a
            length that the transformer cannot computationally afford. Because
            a transformer&apos;s{" "}
            <LessonReferenceLink href="https://www.codecademy.com/article/transformer-architecture-self-attention-mechanism">
              self-attention mechanism
            </LessonReferenceLink>{" "}
            scales quadratically, <LessonInlineCode>O(N²)</LessonInlineCode>,
            doubling the sequence length quadruples the attention work and the
            size of its attention matrix.
          </p>

          <p className={bodyClassName}>
            If we feed the model uncompressed byte streams, the sequence length
            explodes, exhausting the GPU&apos;s VRAM or forcing us to truncate the
            text so severely that the model cannot reason over long contexts.
            There is ongoing research into tokenization-free architectures,
            including{" "}
            <LessonReferenceLink href="https://arxiv.org/abs/2105.13626">
              ByT5
            </LessonReferenceLink>
            {", "}
            <LessonReferenceLink href="https://arxiv.org/abs/2305.07185">
              MEGABYTE
            </LessonReferenceLink>
            {", and "}
            <LessonReferenceLink href="https://arxiv.org/abs/2412.09871">
              BLT
            </LessonReferenceLink>
            {". "}But until those architectures are proven at scale, raw byte
            streams are simply too expensive for standard transformers to
            process. We must compress them.
          </p>

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            Compress them, you say?
          </h2>

          <p className={bodyClassName}>
            Yes. The algorithm called{" "}
            <LessonReferenceLink href="https://www.derczynski.com/papers/archive/BPE_Gage.pdf">
              Byte Pair Encoding
            </LessonReferenceLink>
            {", used by the tokenizers for models such as "}
            <LessonReferenceLink href="https://cdn.openai.com/better-language-models/language-models.pdf">
              GPT-2
            </LessonReferenceLink>
            {" and "}
            <LessonReferenceLink href="https://openai.com/index/language-models-are-few-shot-learners/">
              GPT-3
            </LessonReferenceLink>
            {", and the "}
            <LessonReferenceLink href="https://openai.com/index/chatgpt/">
              original model behind ChatGPT
            </LessonReferenceLink>
            {", wasn't invented with artificial intelligence in mind. It was "}
            published in 1994 by a programmer named Philip Gage as a simple,
            general-purpose algorithm for compressing text files. For two
            decades, it was just a data compression trick.
          </p>

          <p className={bodyClassName}>
            Then, in 2015, a team of researchers led by{" "}
            <LessonReferenceLink href="https://aclanthology.org/P16-1162/">
              Rico Sennrich
            </LessonReferenceLink>{" "}
            realized this algorithm could solve a major headache in AI
            translation models: the out-of-vocabulary problem, the same problem
            we handled with the <LessonInlineCode>{"<|unk|>"}</LessonInlineCode>{" "}
            token in our <LessonInlineCode>SimpleTokenizer</LessonInlineCode>.
          </p>

          <p className={bodyClassName}>
            Sennrich&apos;s team proved that Gage&apos;s compression loop offered the
            perfect compromise. It allowed the system to store common words as
            highly efficient single tokens, but when it encountered a rare or
            misspelled word, it fell back to reading the unknown word in smaller,
            recognizable subword chunks. OpenAI later pushed that fallback layer
            all the way down to our 256 raw UTF-8 bytes for GPT-2. Today, BPE
            stands as one of the industry standards for LLM tokenization.
          </p>

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            So, how does BPE work?
          </h2>

          <p className={bodyClassName}>
            We understand what BPE is trying to do: compress text, or in our
            case, tokens. So how does BPE compress a token sequence?
          </p>

          <p className={bodyClassName}>
            The algorithm begins with a sequence containing only tokens from its
            base vocabulary. For us, those are UTF-8 byte IDs from{" "}
            <LessonInlineCode>0</LessonInlineCode> through{" "}
            <LessonInlineCode>255</LessonInlineCode>. It loops through the
            training corpus and{" "}
            <strong className="font-semibold text-cr-text">
              counts every pair of adjacent tokens, and identifies the pair that
              occurs most often. That pair is assigned, or minted, a new token
              ID, and every nonoverlapping occurrence of the pair is replaced by
              the new token.
            </strong>
          </p>

          <p className={bodyClassName}>
            Let&apos;s walk through a little example to visualise the algorithm. Say
            our training text is just the string{" "}
            <LessonInlineCode>aaabdaaabac</LessonInlineCode>, and we pretend the
            alphabet is <LessonInlineCode>{"{a, b, c, d}"}</LessonInlineCode> with
            a vocabulary size of four.
          </p>

          <p className={bodyClassName}>
            The algorithm starts by scanning the sequence and counting every
            adjacent pair. <LessonInlineCode>aa</LessonInlineCode> is the most
            frequent. It occupies four adjacent positions, but only two can be
            replaced without overlapping. We create a new token, say{" "}
            <LessonInlineCode>Z = aa</LessonInlineCode>, and replace those two
            occurrences. Our sequence shrinks:
          </p>

          <LessonCodeBlock
            language="text"
            label="Merge 1"
            code={"aaabdaaabac  →  Zabdaaabac  →  ZabdZabac"}
          />

          <p className={bodyClassName}>
            Now we have five unique tokens:{" "}
            <LessonInlineCode>a, b, c, d, Z</LessonInlineCode>. We repeat the same
            process for round two. The pair <LessonInlineCode>ab</LessonInlineCode>{" "}
            appears twice, so we mint <LessonInlineCode>Y = ab</LessonInlineCode>{" "}
            and replace both occurrences:
          </p>

          <LessonCodeBlock
            language="text"
            label="Merge 2"
            code={"ZabdZabac  →  ZYdZYac"}
          />

          <p className={bodyClassName}>
            The vocabulary size is now six, and our sequence is down to seven
            tokens. We do another round. The pair we created,{" "}
            <LessonInlineCode>ZY</LessonInlineCode>, appears twice, so we create{" "}
            <LessonInlineCode>X = ZY</LessonInlineCode> and the sequence becomes:
          </p>

          <LessonCodeBlock
            language="text"
            label="Merge 3"
            code={"ZYdZYac  →  XdXac"}
          />

          <p className={bodyClassName}>
            We started with 11 characters. After three merges, we have 5 tokens
            and a vocabulary of seven elements. That&apos;s the core idea of BPE.
            Take a look at the animated visual below to see the mechanism in
            action.
          </p>

          <BpeMergeAnimation />

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            What BPE actually learns
          </h2>

          <p className={bodyClassName}>
            Training BPE is just that same merge loop we explained, but repeated
            on a pretty large body of text. You take a training corpus, count
            adjacent token pairs, merge the most frequent pair, add the new token
            to the vocabulary, and repeat until the vocabulary reaches the target
            size.
          </p>

          <p className={bodyClassName}>
            <LessonReferenceLink href="https://cdn.openai.com/better-language-models/language-models.pdf">
              GPT-2
            </LessonReferenceLink>{" "}
            learned 50,000 merge rules from{" "}
            <LessonReferenceLink href="https://openai.com/index/better-language-models/">
              WebText
            </LessonReferenceLink>
            , a corpus containing slightly over eight million documents and 40
            gigabytes of text. Those merges, together with the 256 base byte
            tokens and one{" "}
            <LessonInlineCode>&lt;|endoftext|&gt;</LessonInlineCode> token, produced
            its vocabulary of{" "}
            <strong className="font-semibold text-cr-text">
              50,257 tokens
            </strong>
            {"."}
          </p>

          <p className={bodyClassName}>
            <LessonReferenceLink href="https://huggingface.co/bigscience/bloom">
              BLOOM
            </LessonReferenceLink>{" "}
            gives us a much more multilingual example. Its byte-level BPE
            tokenizer was trained on an alpha-weighted subset of an early version
            of the{" "}
            <LessonReferenceLink href="https://papers.nips.cc/paper_files/paper/2022/hash/ce9e92e3de2372a4b93353eb7f3dc0bd-Abstract-Datasets_and_Benchmarks.html">
              ROOTS corpus
            </LessonReferenceLink>
            , which covered 46 natural languages and 13 programming languages. It
            produced a vocabulary of{" "}
            <strong className="font-semibold text-cr-text">
              250,680 tokens
            </strong>
            {"."}
          </p>

          <p className={bodyClassName}>
            After training, the artifact we end up with is an{" "}
            <strong className="font-semibold text-cr-text">
              ordered list of merge rules
            </strong>
            {"."} Each one says: “replace token A followed by token B with token C.”
            The order is rather important because later rules often depend on
            tokens that earlier rules created.
          </p>

          <p className={bodyClassName}>
            That is to say, BPE training and encoding are separate. Training
            applies the algorithm to the corpus to learn the rules. It is a
            one-time job. When new text arrives, the tokenizer uses the saved
            merge ranks without relearning any frequencies from that text. It
            repeatedly applies the highest-priority merge currently available.
            The same text therefore becomes the same token IDs during model
            training and later when somebody uses the model.
          </p>

          <p className={bodyClassName}>
            So, the algorithm in pseudocode looks like this:
          </p>

          <LessonCodeBlock
            code={pseudocode}
            language="pseudocode"
            label="Pseudocode"
          />

          <p className={bodyClassName}>
            Now try it yourself. Enter a sequence, choose how many merge rounds
            to allow, and start the compression. The demo exposes the pair table,
            the winning pair, the new token, and the rules learned at every step.
          </p>

          <BpeCompressionPlayground />

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            How many merges are enough?
          </h2>

          <p className={bodyClassName}>
            We kept mentioning merges but never actually answered a rather
            important question:{" "}
            <strong className="font-semibold text-cr-text">
              how many merges do we need to apply?
            </strong>
          </p>

          <p className={bodyClassName}>
            And the answer is of the type we humans don&apos;t like:{" "}
            <strong className="font-semibold text-cr-text">it depends!</strong>{" "}
            It&apos;s a trade-off that you need to make based on the model&apos;s goal and
            the resources you have in hand.
          </p>

          <p className={bodyClassName}>
            For example, say you&apos;re training a tokenizer for some large language
            model and you decide your number will be 5,000 merges.{" "}
            <strong className="font-semibold text-cr-text">
              Your vocabulary will probably be small.
            </strong>{" "}
            Yes, the embedding table will consume relatively little memory, but{" "}
            <strong className="font-semibold text-cr-text">
              your compression will be weak
            </strong>
            . Common words and patterns will still fracture into several separate
            tokens. This stretches the sequence length, causing the
            Transformer&apos;s O(N²) attention mechanism to burn through compute and
            fill up the finite context window before the model can{" "}
            <LessonTerm definition="The model never reads text directly. Here, “read” means how much of the original text can be represented inside its fixed number of token positions.">
              &ldquo;read&rdquo;
            </LessonTerm>{" "}
            a meaningful amount of text.
          </p>

          <p className={bodyClassName}>
            If you run too many merges, say 1,000,000, the trade-off moves in the
            other direction. Frequent long strings, and possibly entire phrases
            from the training corpus, can compress into single tokens. But the
            penalty shifts to the embedding table, which{" "}
            <strong className="font-semibold text-cr-text">
              balloons to a massive size and eats up gigabytes of VRAM
            </strong>{" "}
            before the model even reaches its first Transformer block. A single
            one-million-row embedding table with 4,096 values per row, stored with
            two bytes per value, already takes about 8 GB.
          </p>

          <p className={bodyClassName}>
            Running too many merges also makes poor use of the vocabulary. Once
            the common patterns have already been captured, later rounds start
            minting tokens for increasingly rare, highly specific strings. Every
            one of those tokens still needs a full row in the embedding table,
            despite appearing only a handful of times in the corpus. The model
            then gets fewer examples from which to learn a useful embedding for
            each rare token, while every extra merge buys less and less useful
            compression on new text.
          </p>

          <p className={bodyClassName}>
            So where do real models land on this curve?{" "}
            <LessonReferenceLink href="https://openaipublic.blob.core.windows.net/gpt-2/encodings/main/vocab.bpe">
              GPT-2
            </LessonReferenceLink>{" "}
            learned <strong className="font-semibold text-cr-text">50,000</strong>{" "}
            merges.{" "}
            <LessonReferenceLink href="https://github.com/openai/tiktoken/blob/main/tiktoken/model.py">
              GPT-4
            </LessonReferenceLink>
            &apos;s{" "}
            <LessonReferenceLink href="https://openaipublic.blob.core.windows.net/encodings/cl100k_base.tiktoken">
              cl100k_base
            </LessonReferenceLink>{" "}
            encoding contains <strong className="font-semibold text-cr-text">100,000</strong>{" "}
            learned merges above the 256 starting bytes.{" "}
            <LessonReferenceLink href="https://huggingface.co/meta-llama/Meta-Llama-3-8B/blob/main/original/tokenizer.model">
              Llama 3
            </LessonReferenceLink>{" "}
            goes to <strong className="font-semibold text-cr-text">127,744</strong>{" "}
            learned merges.{" "}
            <LessonReferenceLink href="https://github.com/openai/tiktoken/blob/main/tiktoken/model.py">
              GPT-4o
            </LessonReferenceLink>
            &apos;s{" "}
            <LessonReferenceLink href="https://openaipublic.blob.core.windows.net/encodings/o200k_base.tiktoken">
              o200k_base
            </LessonReferenceLink>{" "}
            encoding contains <strong className="font-semibold text-cr-text">199,742</strong>{" "}
            learned merges. At the high end,{" "}
            <LessonReferenceLink href="https://huggingface.co/bigscience/bloom/blob/main/tokenizer.json">
              BLOOM&apos;s tokenizer artifact
            </LessonReferenceLink>{" "}
            records <strong className="font-semibold text-cr-text">250,434</strong>{" "}
            merge rules.
          </p>

          <p className={bodyClassName}>
            There is no universal sweet spot. The right number depends on the
            languages and domains in the corpus, the model&apos;s size, the available
            memory, and how much sequence length you are willing to spend.
          </p>

          <aside className="relative mt-10 overflow-hidden border-2 border-cr-brand bg-cr-accent px-6 py-6 shadow-[4px_4px_0px_0px_var(--cr-shadow)] dark:border-cr-border dark:bg-cr-card-accent sm:px-7">
            <div className="absolute right-0 top-0 h-3 w-3 border-b-2 border-l-2 border-cr-brand bg-cr-card dark:border-cr-border dark:bg-cr-accent" />
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cr-brand/60 dark:text-cr-accent"
              style={monoStyle}
            >
              The core idea
            </p>
            <p className="mt-3 max-w-[650px] text-[19px] font-extrabold leading-8 tracking-[-0.02em] text-cr-brand dark:text-cr-text sm:text-[22px]">
              Start with bytes. Find the most common adjacent pair. Give it one
              new token. Replace every nonoverlapping occurrence. Repeat, and
              keep the rules in order.
            </p>
          </aside>
        </div>
      </div>
    </article>
  );
}
