# Build a Tokenizer from Scratch

Build a byte-level BPE tokenizer from scratch, starting with a simple word tokenizer and working up to a trained multilingual encoding compatible with tiktoken.

Along the way, you’ll implement BPE, optimize training, train your own tokenizer, save it as a .tiktoken model, and ship it in a small web playground.

This repository contains the complete open-source guide. You can also build the project on [Crackr](https://app.crackr.dev/projects/build-your-own-tokenizer), where each step comes with automated evaluations, progress tracking, and interactive playgrounds.

The full project and all evaluations are free.

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
