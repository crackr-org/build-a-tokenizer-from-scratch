# LLMs can’t read

Language models work with numbers. Tokenization is the translation layer that translates text into a numerical representation the model understands.

Large language models such as ChatGPT are often described as systems that take the current sequence of words and predict what comes next. That is a useful description, but it begins one step too late.

An LLM, like any deep neural network, cannot process raw text directly. Before it can calculate or predict anything, our language must be translated into numbers.

## LLMs don’t understand text

Text is categorical. A sentence is made of discrete symbols: words, word pieces, punctuation marks, and spaces. These symbols have identities, but they do not carry useful numerical values.

We cannot add words or matrix-multiply punctuation. Those operations require of course numbers, and raw text is not compatible with the mathematics used to implement and train a neural network.

> We need a layer that translates our language into something a model can compute with.

That translation layer is called **tokenization**.

## A mapping: numbers ↔ pieces of text

At its core, tokenization is a mapping between pieces of text and numbers. Text becomes numbers so the model can perform its calculations. The numbers it predicts become text again so we can read the result.

```text
Text  →  Token IDs  →  Model  →  Text
```

## Tokens and vocabulary

We call each unit in this mapping a **token**. For now, imagining one word as one token is a useful simplification. Real tokenizers are more flexible: a token may be a whole word, part of a word, punctuation, or whitespace.

A token is the smallest piece of information the model is allowed to see at one time. Before the neural network does any math or any “thinking”, raw text must become a sequence of tokens.

The tokenizer stores this mapping in a **vocabulary**: a fixed dictionary that assigns every known token a unique number, called a token ID.

### Example mapping

```text
["hello", ",", " world", "!"]  →  [1842, 11, 995, 0]
```

The token IDs themselves are arbitrary labels. The number 1842 does not mean “hello” on its own. It only works because the tokenizer assigns that ID to “hello” and the model was trained using the same assignment. Those IDs are then used to retrieve the numerical representations the model actually processes.

> **The core idea**
>
> A tokenizer translates between human-readable text and the numerical language of a neural network.

---

[← Previous](../01-project-setup/01-project-setup.md) · [Guide contents](../../README.md) · [Next →](02-build-core-tokenizer.md)
