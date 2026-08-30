# Build a Tokenizer from Scratch

Build a byte-level BPE tokenizer from the ground up. You will start with the smallest possible text-to-ID mapping, replace it with byte-level BPE, make training fast enough for a multilingual corpus, save the learned encoding, and put the finished tokenizer online.

The implementation is yours. The guide gives you the concepts, required interfaces, expected behavior, checks to run before each submission, and hints for when you are genuinely stuck.

## What you will build

- A simple tokenizer that maps text to token IDs and back
- A byte-level BPE tokenizer that can encode any UTF-8 text
- An optimized trainer with incremental pair counts, a pair index, parallel pretokenization, and a heap
- A multilingual encoding saved in a loadable tokenizer file
- A small public playground for inspecting token boundaries, IDs, and raw bytes

## Guide

### 1. Project setup

- [Prepare your workspace](guide/01-project-setup/01-project-setup.md)

### 2. Build a simple tokenizer

- LLMs can’t read
- Build the core tokenizer
- Handle special tokens

### 3. Build a BPE tokenizer

- Unicode, UTF-8, and bytes
- How BPE compresses text
- Implement BPE
- Benchmark your BPE implementation

### 4. Make BPE training fast

- Update pair counts
- Pretokenize in parallel
- Build a pair index
- Build a pair heap

### 5. Ship your tokenizer

- Scale up training
- Port your tokenizer
- Build a tokenizer playground
- Where to go from here

## License

This guide is available under the [MIT License](LICENSE).
