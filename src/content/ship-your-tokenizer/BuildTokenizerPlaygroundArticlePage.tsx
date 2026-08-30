import type { ReactNode } from "react";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonFilePreview } from "../../components/LessonFilePreview";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonNote } from "../../components/LessonNote";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";
import { LessonRepositoryLink } from "../../components/LessonRepositoryLink";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const cloneCommands = `git clone https://github.com/<your-github-name>/crackr-build-tokenizer-from-scratch-demo.git
cd crackr-build-tokenizer-from-scratch-demo`;

const runCommands = `python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn backend.app.main:app --reload`;

const renderBlueprint = `services:
  - type: web
    name: tokenizer-playground
    runtime: docker
    plan: free
    healthCheckPath: /api/health`;

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-7 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
      {children}
    </h2>
  );
}

export function BuildTokenizerPlaygroundPage({
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
          <div className="h-[2px] w-52 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[720px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Build a tokenizer playground
        </h1>

        <p
          className="mt-6 max-w-[710px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Serve your trained tokenizer through FastAPI and deploy a browser
          playground for it.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <p className={bodyClassName}>
            It is finally time to ship our tokenizer. You built a BPE tokenizer
            from scratch, optimized it, scaled its training to a larger
            multilingual corpus, and made it compatible with{" "}
            <LessonInlineCode>tiktoken</LessonInlineCode>. But a GitHub repo is
            not a demo, and{" "}
            <strong className="font-bold text-cr-text">
              every respectable side project eventually earns itself a URL.
            </strong>{" "}
            ;)
          </p>

          <p className={bodyClassName}>
            So for the last task, we’ll put a small web interface and serve your
            tokenizer through an API, so that you can add it to your portfolio,
            send it to a potential employer, or just for the joy of putting
            something you built on the internet.
          </p>

          <p className={bodyClassName}>
            This is not a frontend or backend project, so I’m not going to make
            you spend the final task building a web app. I prepared the demo
            skeleton for you. It includes the UI interface, a small FastAPI
            backend, and the plumbing for loading a{" "}
            <LessonInlineCode>tiktoken</LessonInlineCode> encoding. You will
            bring the model you trained in the previous task and wire it in.
          </p>

          <SectionTitle>Set up your demo</SectionTitle>

          <p className={bodyClassName}>
            Our playground is pretty simple. You type some text and it shows
            how the tokenizer breaks it into tokens, their IDs, and the bytes
            for each token. You can see what the finished playground looks like
            in the{" "}
            <LessonReferenceLink href="https://tokenizer-playground.onrender.com/">
              live demo
            </LessonReferenceLink>
            .
          </p>

          <LessonRepositoryLink
            href="https://github.com/crackr-org/crackr-build-tokenizer-from-scratch-demo"
            label="Demo repository"
            repository="crackr-org / crackr-build-tokenizer-from-scratch-demo"
          />

          <p className={bodyClassName}>
            Fork the{" "}
            <LessonReferenceLink href="https://github.com/crackr-org/crackr-build-tokenizer-from-scratch-demo">
              playground repository
            </LessonReferenceLink>{" "}
            into your GitHub account, then clone your fork:
          </p>

          <LessonCodeBlock
            code={cloneCommands}
            language="bash"
            label="Terminal"
          />

          <p className={bodyClassName}>
            Copy the <LessonInlineCode>.tiktoken</LessonInlineCode> file from the
            previous substage into <LessonInlineCode>artifacts/</LessonInlineCode>.
            As long as the directory contains exactly one encoding file, the
            filename does not matter.
          </p>

          <p className={bodyClassName}>
            Install the dependencies and start the application:
          </p>

          <LessonCodeBlock
            code={runCommands}
            language="bash"
            label="Terminal"
          />

          <p className={bodyClassName}>
            Open{" "}
            <LessonReferenceLink href="http://localhost:8000">
              http://localhost:8000
            </LessonReferenceLink>
            . You should see your encoding filename and vocabulary size at the
            top. Try every language you trained on and inspect the token IDs,
            boundaries, and bytes that are generated by your tokenizer.
          </p>

          <SectionTitle>Put it online</SectionTitle>

          <p className={bodyClassName}>
            You can use your favorite cloud provider to deploy your demo:{" "}
            <LessonReferenceLink href="https://railway.com/">
              Railway
            </LessonReferenceLink>
            ,{" "}
            <LessonReferenceLink href="https://fly.io/">
              Fly.io
            </LessonReferenceLink>
            ,{" "}
            <LessonReferenceLink href="https://cloud.google.com/run">
              Google Cloud Run
            </LessonReferenceLink>
            , or any other host that accepts a Dockerfile.{" "}
            <LessonReferenceLink href="https://vercel.com/docs/frameworks/backend/fastapi">
              Vercel
            </LessonReferenceLink>{" "}
            can host FastAPI as well.
          </p>

          <p className={bodyClassName}>
            We will use{" "}
            <LessonReferenceLink href="https://render.com/docs/deploy-fastapi">
              Render
            </LessonReferenceLink>
            {" "}(we are not affiliated). It can build the Dockerfile we already
            set up and connect directly to GitHub. Most importantly, we tried
            to keep this whole project free, and Render&apos;s free web service is
            enough for this demo.
          </p>

          <p className={bodyClassName}>
            If you choose Render, create{" "}
            <LessonInlineCode>render.yaml</LessonInlineCode> in the root of your
            playground repository:
          </p>

          <LessonFilePreview
            content={renderBlueprint}
            filename="render.yaml"
          />

          <p className={bodyClassName}>
            Commit and push <LessonInlineCode>render.yaml</LessonInlineCode>{" "}
            together with your <LessonInlineCode>.tiktoken</LessonInlineCode>{" "}
            file. Then open Render, choose{" "}
            <strong className="font-bold text-cr-text">New → Blueprint</strong>,
            connect your fork, and apply the Blueprint. Render will build the
            Docker image and give you a public{" "}
            <LessonInlineCode>onrender.com</LessonInlineCode> URL.
          </p>

          <LessonNote label="The cost of free">
            <LessonReferenceLink href="https://render.com/docs/free#spinning-down-on-idle">
              Render&apos;s free web services
            </LessonReferenceLink>{" "}
            spin down after 15 minutes without traffic. The first visit after
            that can take about a minute while the service wakes up. That is a
            reasonable compromise for a portfolio demo.
          </LessonNote>

          <p className={bodyClassName}>
            Once it is live, try it a couple of times, copy the URL, and put it
            somewhere worth keeping. You built the tokenizer.
          </p>
        </div>
      </div>
    </article>
  );
}
