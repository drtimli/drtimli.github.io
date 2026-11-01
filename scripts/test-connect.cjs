'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/connect.js'), 'utf8');
function run({ua = '', query = '', languages = ['en'], saved = null, blocked = false} = {}) {
  let redirect;
  const nodes = Object.fromEntries(['title','help','note','website','save'].map(key => ['connect-' + key, {}]));
  nodes['wechat-image'] = {};
  const document = {documentElement: {}, getElementById(id) { return nodes[id]; }, querySelector() { return {}; }, querySelectorAll() { return []; }};
  vm.runInNewContext(source, {URL, URLSearchParams, navigator: {userAgent: ua, languages}, document,
    window: {location: {search: query, href: 'https://example.com/sub/connect.html' + query, replace(value) { redirect = value; }}, localStorage: {getItem() { if (blocked) throw Error(); return saved; }}}});
  return {redirect, document, nodes};
}
assert.equal(run().redirect, 'https://example.com/sub/index.html');
for (const ua of ['MicroMessenger/8.0', 'micromessenger/8.0']) {
  const result = run({ua}); assert.equal(result.redirect, undefined); assert.equal(result.nodes['connect-website'].href, 'index.html?view=website');
}
for (const [lang, page] of [['en','index.html'],['de','de.html'],['zh','zh.html']]) {
  assert.equal(run({query:'?view=wechat&lang='+lang}).nodes['connect-website'].href, page + '?view=website');
  assert.equal(run({ua:'MicroMessenger',saved:lang}).nodes['connect-website'].href, page + '?view=website');
}
assert.equal(run({query:'?view=wechat',languages:['fr','de-DE']}).document.documentElement.lang, 'de');
assert.equal(run({ua:'MicroMessenger',languages:['fr'],blocked:true}).document.documentElement.lang, 'en');
assert.equal(run({query:'?view=wechat&lang=invalid',languages:['zh-CN']}).document.documentElement.lang, 'zh-Hans');
console.log('Combined QR routing: WeChat, ordinary browser, explicit view, subdirectory paths, localization, saved language and blocked storage passed.');
