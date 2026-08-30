# Unicode, UTF-8, and bytes

How Unicode fixed ASCII, how UTF-8 turns Unicode code points into bytes, why only 256 byte values are enough to represent any text, and why feeding those bytes to a Transformer one by one brings us to BPE.

> **A note before continuing**
>
> Our topic isn't Unicode and encoding per se, but we needed this foundation. We haven't dug deeply here, and some prior knowledge is assumed. If any of this feels unfamiliar, we highly recommend reading:
>
> - Nathan Reed — [A Programmer’s Introduction to Unicode](https://www.reedbeta.com/blog/programmers-intro-to-unicode/)
> - kunststube — [Encoding](https://kunststube.net/encoding/)
> - Joel Spolsky — [The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/)

## A short history of text

As we established in [“LLMs Can't Read,”](../02-build-a-simple-tokenizer/01-llms-cant-read.md) our tokenizer translates text into token IDs. These IDs can be used as lookup keys in a dictionary. Inside an LLM, a similar idea is at work: each ID points to an entry in a fixed table. ML engineers call this an **embedding table**.

Because this table has a fixed, predefined size in memory, our vocabulary must also of course be fixed. We saw the flaw of this constraint in our `SimpleTokenizer`. If a word isn't in the vocabulary, we replace it with `<|unk|>`. It worked in that it gave unfamiliar tokens a valid ID, but it destroyed their original contents nonetheless. We cannot fix this by simply making the vocabulary infinitely large to catch every new word or misspelling. To guarantee that every possible string can be processed without an infinite lookup table, LLMs use what is known as **subword tokenization**. We'll cover that concept in detail in the next section. For now, take a look at this string:

```python
text = "Aم你👋"
```

In the early days of computing, text meant English. [The ASCII standard](https://en.wikipedia.org/wiki/ASCII), published in 1963, used 7 bits per character, which gave exactly **128 possible symbols**, uppercase and lowercase Latin letters, digits, a handful of punctuation marks, and some control codes like carriage return. That was enough for teletypes and the first generation of terminals, but it locked out almost the entire world. You could not write Arabic, Chinese, or even accented French in pure ASCII without resorting to ad-hoc tricks.

Over the 1980s, a patchwork of “code pages” tried to fill the gap. [Code page 437 for DOS](https://en.wikipedia.org/wiki/Code_page_437) and [ISO-8859-1 for Western Europe](https://en.wikipedia.org/wiki/ISO/IEC_8859-1) defined extra characters in the 128 to 255 range that ASCII left unused. [Shift-JIS for Japan](https://en.wikipedia.org/wiki/Shift_JIS) used a multibyte encoding instead. A file written in one code page turned into gibberish when opened on a system expecting another. If you'd sent `text = "Aم你👋"` through a 1980s email gateway, the recipient would have seen something different.

Then, in 1991, the tech industry, in an effort to fix this, introduced the first volume of the [Unicode Standard](https://www.unicode.org/standard/standard.html). It assigns an integer, called a **code point**, to every character it recognises. Version 15.1, for example, defined 149,813 characters across 161 scripts when it was released in September 2023. The standard continues to evolve.

In Python for example, the official documentation defines `str` as an immutable sequence of these Unicode code points. You can use the `ord()` function to peek at the underlying code point of a character, or `chr()` to translate that integer back into text.

```python
text = "Aم你👋"

[(character, f"U+{ord(character):04X}") for character in text]
```

```text
[("A", "U+0041"), ("م", "U+0645"), ("你", "U+4F60"), ("👋", "U+1F44B")]
```

> **A natural question**
>
> If the code points are already integers, **why not** feed them directly into a neural network as token IDs?

It is a tempting shortcut, but doing so creates two deal-breaking problems.

The first reason is **vocabulary size**. While Unicode currently defines around 150,000 characters, the actual mathematical space it uses, running from `U+0000` to `U+10FFFF`, allows for over **1.1 million possible positions**. If we mapped them 1:1, the neural network would have to reserve a massive 1.1-million-row embedding table. This would waste gigabytes of memory on a code space that is incredibly sparse and mostly empty.

The second, more concerning reason is **instability**. As we noted, the Unicode Standard is a living document that constantly evolves. If we try to save memory by only reserving embedding rows for the 150,000 characters known today, what happens when a new emoji or symbol is added next year? Our frozen vocabulary wouldn't have an ID for it. We would be right back to using `<|unk|>`.

These factors necessitate a better approach. To avoid a bloated embedding table and the `<|unk|>` problem, we need a closed, strictly bounded system that never has to change, even when new characters are invented.

The solution is **encoding**.

Encoding is the process of translating a sequence of Unicode code points into a sequence of **bytes** for computers to store and transmit. The [Unicode Standard](https://www.unicode.org/standard/standard.html) defines three official encoding forms: **UTF-8**, **UTF-16**, and **UTF-32**. All three can faithfully round-trip the entire Unicode repertoire; they differ only in their memory layout.

Open a Python interpreter and try this:

```python
text = "Aم你👋"

utf8  = text.encode("utf-8")    # variable-width
utf16 = text.encode("utf-16")   # 2 or 4 bytes per code point
utf32 = text.encode("utf-32")   # always 4 bytes per code point

print("UTF-8  bytes:", list(utf8))
print("UTF-16 bytes:", list(utf16))
print("UTF-32 bytes:", list(utf32))
```

```text
UTF-8  bytes: [65, 217, 133, 228, 189, 160, 240, 159, 145, 139]  # 10 bytes
UTF-16 bytes: [255, 254, 65, 0, 69, 6, 96, 79, 61, 216, 75, 220]  # 12 bytes
UTF-32 bytes: [255, 254, 0, 0, 65, 0, 0, 0, 69, 6, 0, 0, 96, 79, 0, 0, 75, 244, 1, 0]  # 20 bytes
```

Comparing these outputs reveals a few trade-offs.

- **UTF-32** always uses exactly 4 bytes per code point. `A` alone becomes `65, 0, 0, 0`. That is four bytes for a character that only needed one in ASCII. Character *n* is at byte offset 4 × *n*, which makes indexing very simple, but it is painfully wasteful.
- **UTF-16** uses 2 bytes for most common characters, such as `A`, `م`, and `你`. Characters above `U+FFFF`, such as `👋` at `U+1F44B`, need a *surrogate pair*, which means two 16-bit units, or 4 bytes. The first two bytes in Python's output, `255, 254`, are a **Byte Order Mark (BOM)** telling the decoder that the remaining units use little-endian byte order, something we do not have to think about with UTF-8.
- **UTF-8** uses a variable number of bytes: 1 for `A`, two for `م`, 3 for `你`, and 4 for `👋`. Python adds no BOM here, there is no endianness confusion, and the first 128 values are identical to ASCII. That last point means every plain ASCII text is already valid UTF-8 without any conversion.

| Text | UTF-8 | UTF-16 LE | UTF-32 LE |
| --- | --- | --- | --- |
| A | `41 · 1` | `41 00 · 2` | `41 00 00 00 · 4` |
| م | `D9 85 · 2` | `45 06 · 2` | `45 06 00 00 · 4` |
| 你 | `E4 BD A0 · 3` | `60 4F · 2` | `60 4F 00 00 · 4` |
| 👋 | `F0 9F 91 8B · 4` | `3D D8 4B DC · 4` | `4B F4 01 00 · 4` |

*Hexadecimal payload bytes followed by total byte count; byte order marks are omitted. Little-endian places the least-significant byte of each UTF-16 or UTF-32 code unit first.*

## Why do we care about this for tokenization?

If we treated raw bytes as tokens, UTF-8 would give us a tiny, fixed vocabulary of exactly **256 possible values**. The trade-off is that a single character can become up to 4 tokens, making sequences longer. Later we'll fix that with a technique called **merging** in BPE, but we first needed a stable byte foundation. UTF-8 gives us a universal, byte-native, [self-synchronizing](https://blog.davidvarghese.net/posts/character-encoding-part-2/) representation with ASCII transparency and no byte-order choice. It is also the dominant interchange format on the web.

We can now turn that foundation into a vocabulary. Because a byte has exactly eight bits, there are **2<sup>8</sup> = 256** possible byte values. We can put every single one of them into our starting vocabulary and use the values `0` through `255` as their initial token IDs. Later, any new tokens we create will receive an ID of 256 or higher.

Great, we could theoretically stop here and train a model on one token per byte. The vocabulary would be tiny, and every valid Unicode string would be representable. The cost, however, would be **extremely long sequences**. English text takes roughly one token per character, Arabic letters commonly take two, Chinese characters commonly take three, and many emojis take four. Words and punctuation would be spelled out byte by byte, over and over again.

For a transformer, which supports only a **finite context length** for computational reasons, spending four positions on, say, a single emoji leaves less room for the surrounding document. Long sequences therefore consume this limited context window quite inefficiently.

> **A note on current research**
>
> As we established, using one Unicode code point per token gives us a massive vocabulary, while using raw bytes gives a Transformer much longer sequences than it can handle efficiently. But researchers have not given up on using raw bytes directly. [ByT5](https://arxiv.org/abs/2105.13626) works directly on bytes. [MEGABYTE](https://arxiv.org/abs/2305.07185) and [BLT](https://arxiv.org/abs/2412.09871) group bytes into patches. [MambaByte](https://arxiv.org/abs/2401.13660) replaces attention with a state-space model, and 2026's [Fast BLT](https://arxiv.org/abs/2605.08044) tries to make byte-by-byte generation faster. These models show that removing tokenization is possible. What researchers have not fully solved yet is making byte-level models as practical and efficient as the tokenized LLMs we use today.

Whoever finally gets rid of tokenization gets the glory. Until that happens, we still need a middle ground between whole-word tokens and tiny byte units. This is where **Byte-Pair Encoding (BPE)** comes in.

---

[← Previous](../02-build-a-simple-tokenizer/03-handle-special-tokens.md) · [Guide contents](../../README.md) · [Next →](02-how-bpe-compresses-text.md)
