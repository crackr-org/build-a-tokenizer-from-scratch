# Prepare your workspace

Create a clean Python project for the tokenizer you will build across the rest of this guide.

Keep the implementation separate from the guide itself. The project starts with two modules: one for the deliberately simple tokenizer and one for the byte-level BPE tokenizer that replaces it later.

## Linux or macOS

```bash
mkdir tokenizer-from-scratch
cd tokenizer-from-scratch

python3 -m venv .venv
source .venv/bin/activate

touch simple_tokenizer.py bpe_tokenizer.py
```

## PowerShell

```powershell
mkdir tokenizer-from-scratch
cd tokenizer-from-scratch

python -m venv .venv
.venv\Scripts\Activate.ps1

New-Item simple_tokenizer.py, bpe_tokenizer.py
```

Commit your work as you finish each implementation chapter. The training corpus and generated tokenizer artifacts can become large, so the guide will point out when those paths should stay out of version control.

---

[Guide contents](../../README.md)
