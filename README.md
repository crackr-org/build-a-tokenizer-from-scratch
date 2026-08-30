# Build a Tokenizer from Scratch

You will start with a small word tokenizer, run into its limits, and work your way up to byte-level BPE. Then you will make training fast enough for a multilingual corpus, save the learned encoding in a `.tiktoken` file, load it with `tiktoken`, and ship a playground where anyone can inspect its token boundaries, IDs, and raw bytes.

By the end, you will have a tokenizer you trained yourself, a finished encoding that can be loaded without training again, and a live demo you can put in your portfolio.

## This guide is from Crackr

This repository is the open-source version of the [Build a Tokenizer from Scratch](https://app.crackr.dev/projects/build-your-own-tokenizer) project from Crackr. You can follow the complete guide here, but for the best experience, use it inside the platform. You will get the interactive playgrounds, progress tracking, and the test infrastructure that evaluates your implementation as you build it.

The complete project is free, including the guide and every automated evaluation.

## Project setup

- [Prepare your workspace](guide/01-project-setup/01-project-setup.md)

## Build a simple tokenizer

- LLMs can’t read
- Build the core tokenizer
- Handle special tokens

## Build a BPE tokenizer

- Unicode, UTF-8, and bytes
- How BPE compresses text
- Implement BPE
- Benchmark your BPE implementation

## Make BPE training fast

- Update pair counts
- Pretokenize in parallel
- Build a pair index
- Build a pair heap

## Ship your tokenizer

- Scale up training
- Port your tokenizer
- Build a tokenizer playground
- Where to go from here

## License

This guide is available under the [MIT License](LICENSE).
