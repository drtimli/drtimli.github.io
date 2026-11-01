# Dr. Tim Li Enterprise AI website

Static, build-free GitHub Pages website. Edit `index.html` (English), `de.html`
(German), and `zh.html` (Simplified Chinese), keeping their content equivalent.
Shared layout styles are in `assets/site.css`.

## Local preview

From this directory, run:

```sh
python3 -m http.server 8913 --bind 127.0.0.1
```

Open `http://127.0.0.1:8913/`. No build or package installation is required.

## Local validation

```sh
python3 scripts/check-site.py
node scripts/test-behavior.cjs
node --check assets/contact.js
node --check assets/language.js
git diff --check
```

The behavior tests use stubbed fetch responses and do not send inquiries.
The form posts to `https://formspree.io/f/xljjpnjz`; its name, sender email,
company, and inquiry fields are required. Local checks do not confirm live
Formspree account configuration or delivery to an inbox. Real test submissions
require the owner's approval.

Browser review covered English, German, and Chinese at 320, 768, and 1440 pixel
viewport widths, FAQ expansion, language switching and remembered choices, and
native required-field validation. There was no horizontal overflow or missing
image at those widths. This is local validation, not a deployment check.

## Language selection

`assets/language.js` negotiates browser preferences on the English entry page,
selecting the first supported language (`en`, `de`, or `zh`, including regional
variants). Unsupported preferences fall back to English. Manual language-link
clicks save `preferred-language` in local storage when available. Direct German
and Chinese URLs retain their requested language. Redirects preserve query
parameters and anchors and work in subdirectories. With JavaScript disabled,
all pages and language links remain available; automatic selection is disabled.

## Branding asset

`assets/logo.png` is the supplied refined TL Enterprise AI logo, reused without
alteration. It retains the smaller handwritten personal name above the spaced
ENTERPRISE AI lettering, navy lettering/T, and ocean-blue L. Its intrinsic
2172 × 724 dimensions are declared on all three pages to reserve the correct
layout space. Page colors use the approved Ocean blue palette: white,
`#082238`, `#455867`, and `#0077A6`.

No publishing or deployment is performed by the validation commands.
