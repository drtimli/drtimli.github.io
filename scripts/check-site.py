"""Check static page structure and local links without network access."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids, self.links, self.controls, self.labels = set(), [], {}, set()
        self.headings, self.sections, self.faqs = 0, 0, 0
        self.lang = None
        self.form = None
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'Duplicate ID: {attrs["id"]}'
            self.ids.add(attrs['id'])
        if tag == 'html':
            self.lang = attrs.get('lang')
        if tag == 'h1':
            self.headings += 1
        if tag == 'section':
            self.sections += 1
            assert attrs.get('aria-labelledby'), 'Section needs an accessible name'
        if tag == 'details':
            self.faqs += 1
        if tag == 'img':
            assert attrs.get('alt'), 'Image needs alternative text'
        if tag == 'form':
            self.form = attrs
        if tag in ('input', 'textarea') and attrs.get('id'):
            self.controls[attrs['id']] = attrs
        if tag == 'label':
            self.labels.add(attrs.get('for'))
        if tag in ('a', 'link'):
            self.links.append(attrs.get('href', ''))
        if tag in ('script', 'img'):
            self.links.append(attrs['src'])


for name, lang in [('index.html', 'en'), ('de.html', 'de'), ('zh.html', 'zh-Hans')]:
    path = ROOT / name
    page = Page(path)
    assert page.lang == lang and page.headings == 1
    assert page.sections == 5 and page.faqs == 4
    assert page.form['action'] == 'https://formspree.io/f/xljjpnjz'
    assert page.form['method'] == 'POST'
    for id in ('name', 'email', 'company', 'challenge'):
        assert id in page.labels and 'required' in page.controls[id]
    assert page.controls['email']['type'] == 'email'
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        assert not url.path.startswith('/'), f'Asset or page path is not relative: {link}'
        target = ROOT / url.path if url.path else path
        assert target.exists(), f'Missing local target: {link}'
        if url.fragment:
            assert url.fragment in Page(target).ids, f'Missing anchor: {link}'
    text = path.read_text()
    for expected in ('tel:+4915129115588', 'https://wa.me/4915129115588', 'mailto:drtimli@hotmail.com', 'aria-live="polite"', 'aria-current="page"'):
        assert expected in text, f'Missing {expected}'
    assert 'download=' not in text
    print(f'{name}: structure, fields, local assets, anchors, and contact links passed')

connect_path = ROOT / 'connect.html'
connect = Page(connect_path)
assert connect.headings == 1
for link in connect.links:
    url = urlsplit(link)
    if not url.scheme and not url.netloc:
        assert (ROOT / url.path if url.path else connect_path).exists(), f'Missing QR page target: {link}'
assert (ROOT / 'assets/website-wechat-qr.png').exists()
print('connect.html: structure and local links/assets passed')
