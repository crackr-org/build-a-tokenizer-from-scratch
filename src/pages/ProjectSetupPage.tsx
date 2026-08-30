import { LessonCodeBlock } from "../components/LessonCodeBlock";

const setupCommand = String.raw`mkdir tokenizer-from-scratch
cd tokenizer-from-scratch

python3 -m venv .venv
source .venv/bin/activate

touch simple_tokenizer.py bpe_tokenizer.py`;

const powershellCommand = String.raw`mkdir tokenizer-from-scratch
cd tokenizer-from-scratch

python -m venv .venv
.venv\Scripts\Activate.ps1

New-Item simple_tokenizer.py, bpe_tokenizer.py`;

export function ProjectSetupPage({
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
              Project setup
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

        <h1 className="mt-10 text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]">
          Prepare your workspace
        </h1>
        <p className="mt-6 max-w-[680px] text-[19px] font-medium leading-8 text-cr-text-2 sm:text-[21px]">
          Create a clean Python project for the tokenizer you will build across
          the rest of this guide.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] space-y-6 border-t-2 border-cr-border-light pt-10">
        <p className="text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]">
          Keep the implementation separate from the guide itself. The project
          starts with two modules: one for the deliberately simple tokenizer and
          one for the byte-level BPE tokenizer that replaces it later.
        </p>

        <h2 className="pt-4 text-[26px] font-extrabold tracking-[-0.035em] text-cr-text sm:text-[30px]">
          Linux or macOS
        </h2>
        <LessonCodeBlock label="terminal" code={setupCommand} />

        <h2 className="pt-4 text-[26px] font-extrabold tracking-[-0.035em] text-cr-text sm:text-[30px]">
          PowerShell
        </h2>
        <LessonCodeBlock label="terminal" code={powershellCommand} />

        <p className="text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]">
          Commit your work as you finish each implementation chapter. The
          training corpus and generated tokenizer artifacts can become large,
          so the guide will point out when those paths should stay out of version
          control.
        </p>
      </div>
    </article>
  );
}
