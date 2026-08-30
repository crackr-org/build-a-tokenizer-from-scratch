# Build a Tokenizer from Scratch

An open project guide for building a byte-level BPE tokenizer from first principles.

The guide starts with a deliberately small word tokenizer, moves through Unicode and UTF-8 bytes, implements byte pair encoding, profiles and optimizes training, then saves and serves the finished encoding.

## Run the guide locally

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

## Connect the hosted evaluator

Implementation chapters include an optional evaluation handoff. Copy `.env.example` to `.env` and set `VITE_EVALUATION_URL` to the hosted project page:

```bash
cp .env.example .env
```

The guide itself is completely readable without an evaluator. The external evaluation only adds automated repository checks and submission history.

## Guide structure

1. Project setup
2. Build a simple tokenizer
3. Build a BPE tokenizer
4. Make BPE training fast
5. Ship your tokenizer

The lesson source lives in `src/content`. Shared visual and code components live in `src/components`.

## Build

```bash
npm run build
```

The static output is written to `dist/`.

## License

The guide source is available under the MIT License.
