'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/connect.js'), 'utf8');
function run({ua = '', query = '', languages = ['en'], saved = null, blocked = false} = {}) {
  let redirect;
  const nodes = Object.fromEntries(['title','intro','help','note','website','save','whatsapp','whatsapp-summary','whatsapp-help','whatsapp-save','wechat-heading'].map(key => ['connect-' + key, {}]));
  nodes['wechat-image'] = {};
  nodes['whatsapp-image'] = {};
  nodes['whatsapp-option'] = {};
  nodes['wechat-option'] = {};
  const document = {documentElement: {dataset: {}}, getElementById(id) { return nodes[id]; }, querySelectorAll() { return []; }};
  vm.runInNewContext(source, {URL, URLSearchParams, navigator: {userAgent: ua, languages}, document,
    window: {location: {search: query, href: 'https://example.com/sub/connect.html' + query, replace(value) { redirect = value; }}, localStorage: {getItem() { if (blocked) throw Error(); return saved; }}}});
  return {redirect, document, nodes};
}
const html = fs.readFileSync(path.join(__dirname, '../connect.html'), 'utf8');
assert.ok(html.includes('href="https://wa.me/qr/KZ5XFY6Q5C63J1?s=r"'));
assert.ok(html.includes('src="assets/whatsapp-contact-qr.png"'));
assert.equal(run({query:'?view=contacts'}).redirect, undefined);
assert.equal(run().redirect, undefined);
for (const ua of ['MicroMessenger/8.0', 'micromessenger/8.0']) {
  const result = run({ua}); assert.equal(result.redirect, undefined); assert.equal(result.nodes['connect-website'].href, 'index.html');
}
for (const [lang, page] of [['en','index.html'],['de','de.html'],['zh','zh.html']]) {
  for (const view of ['wechat', 'contacts']) {
    const result = run({query:'?view='+view+'&lang='+lang});
    assert.equal(result.nodes['connect-website'].href, page);
    assert.ok(result.nodes['connect-whatsapp'].textContent.includes('WhatsApp'));
    assert.ok(result.nodes['whatsapp-image'].alt.includes('WhatsApp'));
    assert.ok(result.nodes['connect-whatsapp-save'].textContent.includes('WhatsApp'));
  }
  assert.equal(run({ua:'MicroMessenger',saved:lang}).nodes['connect-website'].href, page);
}
assert.equal(run({query:'?view=wechat',languages:['fr','de-DE']}).document.documentElement.lang, 'de');
assert.equal(run({ua:'MicroMessenger',languages:['fr'],blocked:true}).document.documentElement.lang, 'en');
assert.equal(run({query:'?view=wechat&lang=invalid',languages:['zh-CN']}).document.documentElement.lang, 'zh-Hans');
console.log('Combined QR routing: WeChat, ordinary browser, explicit view, subdirectory paths, localization, saved language and blocked storage passed.');

for (const lang of ['en', 'de', 'zh']) {
  for (const view of ['', 'contacts', 'wechat']) {
    const query = '?lang=' + lang + '&view=' + view;
    const wechat = run({ua: 'MicroMessenger/8.0', query});
    assert.equal(wechat.nodes['connect-whatsapp'].hidden, true);
    assert.equal(wechat.nodes['whatsapp-option'].hidden, true);
    assert.equal(wechat.nodes['wechat-option'].hidden, false);
    const whatsapp = run({ua: 'WhatsApp/2.0', query});
    assert.equal(whatsapp.nodes['connect-whatsapp'].hidden, false);
    assert.equal(whatsapp.nodes['whatsapp-option'].hidden, false);
    assert.equal(whatsapp.nodes['whatsapp-option'].open, true);
    assert.equal(whatsapp.nodes['wechat-option'].hidden, true);
    const browser = run({ua: 'Mozilla/5.0 Safari/605', query});
    assert.equal(browser.nodes['connect-whatsapp'].hidden, false);
    assert.equal(browser.nodes['whatsapp-option'].hidden, false);
    assert.equal(browser.nodes['wechat-option'].hidden, false);
  }
}
console.log('Scanner-specific visibility passed in EN, DE and ZH; unknown browsers keep both choices.');
