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

`assets/logo.png` is the supplied refined TL Enterprise AI logo. The pages use
`assets/logo-small.png`, a 600 × 200 pixel copy resized for the header. It retains the smaller handwritten personal name above the spaced
ENTERPRISE AI lettering, navy lettering/T, and ocean-blue L. The optimized copy’s intrinsic
600 × 200 dimensions are declared on all three pages to reserve the correct
layout space. Page colors use the approved Ocean blue palette: white,
`#082238`, `#455867`, and `#0077A6`.

No publishing or deployment is performed by the validation commands.

## Combined website / WeChat QR

`assets/website-wechat-qr.png` encodes `https://drtimli.github.io/connect.html`.
The original supplied WeChat card is preserved as `assets/wechat-contact.jpg`.
Both images were successfully decoded locally with macOS Vision.

With JavaScript enabled, `connect.html` detects the WeChat user agent and shows
the contact code with localized recognition instructions. Other browsers go to
the main website, which retains its existing language negotiation. The contact
sections link to `connect.html?view=wechat&lang=en` (or `de` / `zh`) to show the
WeChat card in any browser. Without JavaScript the contact card and website link
remain available. No automatic friend addition or direct profile-opening is
claimed. Long-press recognition and adding a contact still need testing on an
actual phone in WeChat.

Run `node scripts/test-connect.cjs` for local routing/localization tests. This
combined QR is ready for review but requires publication of the new page and
assets before its public URL will work. No deployment has been performed.

On macOS, regenerate and decode-check the combined QR with:

```sh
swift scripts/generate-qr.swift assets/website-wechat-qr.png assets/wechat-contact.jpg
```

## Website and combined QR entry points

The homepage and its language variants always show the website, including when
opened in WeChat. Language selection and remembered manual choices are retained.
Only `connect.html`, encoded in `assets/website-wechat-qr.png`, detects WeChat:
it shows the WeChat contact card there and redirects ordinary browsers to the
website. The contact card's website links lead directly to the localized site;
no bypass parameter is required. The latest compact QR layout is retained.
WhatsApp is not part of this combined QR flow; the website's ordinary WhatsApp
contact link remains available. Actual phone behavior still requires checking
after publication. These local changes do not push or deploy anything.
