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
company, and inquiry fields are required. Before submission, localized inline
validation rejects blank/whitespace-only entries, malformed email addresses, and
values exceeding field length limits. Leading/trailing whitespace is trimmed.
Errors are linked to fields for assistive technology, the first invalid field
receives focus, and errors clear when corrected. Native HTML validation remains
available when JavaScript is disabled. Local checks do not confirm live
Formspree account configuration or delivery to an inbox. Real test submissions
require the owner's approval.

Browser review covered English, German, and Chinese at 320, 768, and 1440 pixel
viewport widths, FAQ expansion, language switching and remembered choices, and
localized inline validation (with native HTML validation as a no-JavaScript fallback). There was no horizontal overflow or missing
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

## Combined website / WeChat / WhatsApp QR

`assets/website-wechat-qr.png` encodes `https://drtimli.github.io/connect.html`.
The original supplied WeChat card is preserved as `assets/wechat-contact.jpg`.
Both images were successfully decoded locally with macOS Vision.

With JavaScript enabled, `connect.html` uses the scanner's user agent:

- `MicroMessenger`: show WeChat only.
- `WhatsApp` (when exposed): show WhatsApp only, with its QR expanded.
- Any unrecognized browser: show both contact options and the website link.

Language affects translation only; it does not choose the contact platform.
The page does not redirect unknown browsers, since scanners may hand off to an
ordinary browser without preserving app identity. App detection is best-effort,
not a guarantee. No automatic friend addition or message sending is performed.
Real phone handoff still needs testing in both apps.

The website contact sections link to `connect.html?view=contacts&lang=en` (or
`de` / `zh`); legacy `view=wechat` links remain valid. The `view` parameter does
not override detected app identity. Without JavaScript both contact options and
the website link remain available.

Run `node scripts/test-connect.cjs` for local routing/localization tests. This
combined QR is ready for review but requires publication of the new page and
assets before its public URL will work. No deployment has been performed.

On macOS, regenerate and decode-check the combined QR with:

```sh
swift scripts/generate-qr.swift assets/website-wechat-qr.png assets/wechat-contact.jpg
```

The contact page also provides a WhatsApp button using the exact payload decoded
from the supplied `WhatsQR.png`: `https://wa.me/qr/KZ5XFY6Q5C63J1?s=r`.
The supplied screenshot is preserved as `assets/whatsapp-original.png`. A clean
QR with the same payload is available as `assets/whatsapp-contact-qr.png`, shown
in an expandable section with a download link. The saved PNG and original code
were successfully decoded locally. WhatsApp handoff still needs testing on a
phone; no message or contact request was sent. The existing combined QR URL and
image remain unchanged. The website's existing phone-based WhatsApp link remains
available too.

Regenerate the clean WhatsApp QR on macOS with:

```sh
swift scripts/generate-qr.swift assets/whatsapp-contact-qr.png assets/whatsapp-original.png 'https://wa.me/qr/KZ5XFY6Q5C63J1?s=r'
```
