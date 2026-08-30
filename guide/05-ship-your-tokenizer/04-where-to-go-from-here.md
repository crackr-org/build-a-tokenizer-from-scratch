# Where to go from here

We will stop building here. The tokenizer is trained, saved, and online. Now you know enough to see where the field is still unfinished.

We started this project with a simple question: how do we turn text into numbers a language model can work with? From there, we built a word tokenizer, ran into its limits, went down to Unicode and UTF-8 bytes, understood why feeding those bytes to a Transformer one by one is too expensive, and found the middle ground in BPE.

Then we trained our tokenizer on Tiny Shakespeare, added GPT-2's pretokenization rules, implemented encoding and decoding, measured where the time went, and worked through the bottlenecks one by one. We reused the pair counts, parallelized the independent work, indexed where each pair appears, and kept the next winner in a heap.

In the final stage, we left Shakespeare behind. We trained on a larger multilingual corpus, preserved the learned ranks in a `.tiktoken` file, loaded them through `tiktoken`, and verified that both implementations produced the same token IDs. Then we wrapped the finished encoding in FastAPI and deployed a playground where anyone can inspect its token boundaries, IDs, and raw bytes.

Although our trainer is reasonable, it is still small. It does not include every feature, safety check, or optimization of a production tokenizer training pipeline. But it can learn a working encoding, save the state `tiktoken` needs, and hand that state to an established runtime. **Things are simply easier to understand once you've built them yourself, and now BPE is one of those things for you.** What used to be a black-box preprocessing step between text and an LLM is now machinery you recognize and can explain. The next time you prompt ChatGPT or Claude, you will know exactly how that text could have been broken into token IDs and then mapped to the vectors the model receives. You now have a tokenizer you can tinker with, inspect, benchmark, and improve.

## Research worth exploring

We will stop our implementation here, but tokenization research certainly does not. The papers below take the ideas we worked with in several different directions: alternative ways to segment text, better ways to evaluate a tokenizer, multilingual efficiency, dynamic compression, and models that try to remove the tokenizer altogether. If you want to keep going, these are good places to start.

### 01 — Alternative segmentation algorithms

BPE commits to one deterministic merge history. The Unigram model starts from a large candidate vocabulary and removes pieces instead, while subword regularization can deliberately expose a model to several valid segmentations of the same text. Implementing either one would force us to rethink both training and encoding rather than merely optimize the loop we already have.

- Kudo — [Subword Regularization](https://aclanthology.org/P18-1007/) · ACL 2018
- Provilkov et al. — [BPE-Dropout](https://aclanthology.org/2020.acl-main.170/) · ACL 2020

### 02 — Tokenizer evaluation beyond compression

We used compression because it is immediate and measurable, but fewer tokens do not automatically produce a better language model. Recent work isolates tokenizer choices while holding the architecture, data, and training budget fixed, then measures robustness and downstream behavior instead of stopping at tokens per byte.

- Schmidt et al. — [Tokenization Is More Than Compression](https://aclanthology.org/2024.emnlp-main.40/) · EMNLP 2024
- Altıntaş et al. — [TokSuite](https://arxiv.org/abs/2512.20757) · 2025

### 03 — Pretokenization boundaries

We used GPT-2's regex to stop merges from crossing character categories. SuperBPE deliberately relaxes one of those old assumptions: it first learns subwords, then allows later merges to cross whitespace and capture recurring multi-word pieces. The wall that saved vocabulary slots in one tokenizer may limit another.

- Liu et al. — [SuperBPE: Space Travel for Language Models](https://arxiv.org/abs/2503.13423) · 2025

### 04 — Multilingual efficiency and fairness

Our max pair always rewards whatever appears most often in the corpus. In multilingual training, dominant languages therefore win more vocabulary slots while other languages fracture into longer sequences. Parity-aware BPE changes the merge objective itself, choosing merges that improve the worst-compressed languages instead of chasing only the global maximum.

- Ahia et al. — [Do All Languages Cost the Same?](https://aclanthology.org/2023.emnlp-main.614/) · EMNLP 2023
- Foroutan et al. — [Parity-Aware Byte-Pair Encoding](https://aclanthology.org/2026.acl-long.342/) · ACL 2026

### 05 — Dynamic, learned compression

Our merge rules are learned once and frozen before the language model sees any data. Dynamic approaches move compression into the model itself: deleting unneeded byte positions, grouping bytes into patches based on local difficulty, or learning context-dependent boundaries end to end. The representation can then change with the text instead of obeying one permanent vocabulary.

- Kallini et al. — [MrT5: Dynamic Token Merging](https://openreview.net/forum?id=VYWBMq1L7H) · ICLR 2025
- Pagnoni et al. — [Byte Latent Transformer](https://aclanthology.org/2025.acl-long.453/) · ACL 2025
- Hwang et al. — [Dynamic Chunking for End-to-End Hierarchical Sequence Modeling](https://arxiv.org/abs/2507.07955) · 2025

### 06 — Tokenizer-free language models

This is the direction we pointed toward when the project began: feed raw bytes to the model and remove the fixed vocabulary entirely. The hard part was never representing the bytes; it was processing and generating their much longer sequences efficiently. State-space models, hierarchical byte models, and newer generation methods are now attacking exactly that cost.

- Wang et al. — [MambaByte](https://openreview.net/forum?id=X1xNsuKssb) · COLM 2024
- Deng et al. — [ByteFlow](https://arxiv.org/abs/2603.03583) · ICLR 2026
- Kallini et al. — [Fast Byte Latent Transformer](https://arxiv.org/abs/2605.08044) · 2026

Expand the multilingual corpus and measure which languages still pay the most. Change the language distribution and watch where the merge budget moves. Swap BPE for Unigram. Let merges cross spaces and inspect what the vocabulary spends its new freedom on. Or train a tiny byte-level model and measure the sequence-length problem directly. Any one of those is a great continuation if you want to keep digging into tokenization.

---

[← Previous](03-build-a-tokenizer-playground.md) · [Guide contents](../../README.md)
