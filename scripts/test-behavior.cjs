// Local-only tests: fetch is replaced with a stub; no inquiries are sent.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname, '..', 'assets', name), 'utf8');

function language({ lang = 'en', languages = ['en'], saved = null, blocked = false, legacy = false, ua = '', view = '' } = {}) {
  let redirected, ready, stored;
  const links = ['en', 'de', 'zh-Hans'].map(lang => ({ lang, href: ({en:'index.html',de:'de.html','zh-Hans':'zh.html'})[lang], addEventListener(type, fn) { this.click = fn; } }));
  vm.runInNewContext(read('language.js'), {
    URL,
    navigator: legacy ? {language: languages[0],userAgent:ua} : {languages,userAgent:ua},
    window: {
      localStorage: {
        getItem() { if (blocked) throw Error('Blocked'); return saved; },
        setItem(key, value) { if (blocked) throw Error('Blocked'); stored = value; }
      },
      location: {
        href: 'https://example.com/subdir/index.html?ref=test' + (view ? '&view=' + view : '') + '#contact', search: '?ref=test' + (view ? '&view=' + view : ''), hash: '#contact',
        replace(url) { redirected = url; }
      }
    },
    document: {
      documentElement: {lang},
      addEventListener(type, fn) { ready = fn; },
      querySelectorAll() { return links; }
    }
  });
  if (ready) ready();
  return {redirected, choose(index) { links[index].click(); return stored; }};
}

function testLanguages() {
  const base = 'https://example.com/subdir/';
  for (const locale of ['de', 'de-DE', 'de-AT']) assert.equal(language({languages: [locale]}).redirected, base + 'de.html?ref=test#contact');
  for (const locale of ['zh', 'zh-CN', 'zh-SG', 'zh-TW', 'zh-Hant-HK']) assert.equal(language({languages: [locale]}).redirected, base + 'zh.html?ref=test#contact');
  assert.match(language({languages: ['fr-FR', 'de-CH', 'en']}).redirected, /de.html/);
  for (const languages of [['en-US', 'de'], ['fr', 'es'], []]) assert.equal(language({languages}).redirected, undefined);
  assert.equal(language({languages: ['de'], saved: 'en'}).redirected, undefined);
  assert.match(language({languages: ['en'], saved: 'zh'}).redirected, /zh.html/);
  assert.match(language({languages: ['de'], saved: 'invalid'}).redirected, /de.html/);
  assert.match(language({languages: ['de'], blocked: true}).redirected, /de.html/);
  assert.match(language({languages: ['de'], legacy: true}).redirected, /de.html/);
  for (const lang of ['de', 'zh-Hans']) assert.equal(language({lang, saved: 'en'}).redirected, undefined);
  for (const [index, expected] of ['en', 'de', 'zh'].entries()) assert.equal(language().choose(index), expected);
  assert.doesNotThrow(() => language({blocked: true}).choose(0));
  for (const languages of [['en'], ['de-DE'], ['zh-CN']]) {
    const result = language({ua:'MicroMessenger/8.0',languages});
    const target = new URL(result.redirected);
    assert.equal(target.pathname, '/subdir/connect.html');
    assert.equal(target.searchParams.get('view'), 'wechat');
    assert.equal(target.searchParams.get('lang'), languages[0].split('-')[0]);
    assert.equal(target.searchParams.get('ref'), 'test');
  }
  assert.equal(language({ua:'MicroMessenger/8.0',view:'website'}).redirected, undefined);
  assert.match(language({ua:'MicroMessenger/8.0',view:'website',languages:['de']}).redirected, /de.html.*view=website/);
  assert.equal(new URL(language({lang:'de',ua:'MicroMessenger/8.0',languages:['en']}).redirected).searchParams.get('lang'), 'de');
  console.log('Language selection: regional preferences, fallback, persistence, direct URLs, blocked storage and subdirectory URLs passed');
}

function formHarness(lang, valid = true) {
  let handler, resolveFetch, rejectFetch, timer, calls = 0, resets = 0, reported = false;
  const status = {textContent: ''};
  const button = {textContent: 'Original label', disabled: false};
  const attrs = {};
  let focused;
  const fields = Object.fromEntries(['name', 'email', 'company', 'challenge'].map(id => {
    const attributes = {};
    return [id, {
      id, value: valid ? (id === 'email' ? 'person@example.com' : 'Example') : '',
      maxLength: id === 'email' ? 254 : id === 'challenge' ? 10000 : 200,
      validity: {typeMismatch: false},
      checkValidity() { return !this.validity.typeMismatch; },
      setAttribute(key, value) { attributes[key] = value; },
      removeAttribute(key) { delete attributes[key]; }, getAttribute(key) { return attributes[key]; },
      focus() { focused = id; },
      listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; }
    }];
  }));
  const errors = Object.fromEntries(Object.keys(fields).map(id => [id + '-error', {textContent: '', hidden: true}]));
  const form = {
    dataset: {language: lang}, action: 'https://formspree.io/f/xljjpnjz',
    querySelector() { return button; },
    addEventListener(type, fn) { handler = fn; },
    checkValidity() { return valid; }, reportValidity() { reported = true; },
    setAttribute(key, value) { attrs[key] = value; }, removeAttribute(key) { delete attrs[key]; },
    reset() { resets++; }
  };
  vm.runInNewContext(read('contact.js'), {
    document: { getElementById(id) { return {year: {}, brief: form, status, ...fields, ...errors}[id]; } },
    Date, AbortController,
    FormData: class { constructor(input) { assert.equal(input, form); } },
    setTimeout(fn) { timer = fn; return 1; }, clearTimeout() {},
    fetch(url, options) {
      calls++;
      assert.equal(url, form.action);
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.Accept, 'application/json');
      return new Promise((resolve, reject) => {
        resolveFetch = resolve; rejectFetch = reject;
        options.signal.addEventListener('abort', () => reject(Error('Abort')));
      });
    }
  });
  return {
    status, button, attrs, fields, errors, get focused() { return focused; },
    submit() { return handler({preventDefault() {}}); },
    finish(ok) { resolveFetch({ok}); }, reject() { rejectFetch(Error('Offline')); }, timeout() { timer(); },
    get calls() { return calls; }, get resets() { return resets; }, get reported() { return reported; }
  };
}

async function testForms() {
  for (const [lang, sending, success, error] of [
    ['en', 'Sending', 'Thank you', 'could not'],
    ['de', 'Wird gesendet', 'Vielen Dank', 'konnte nicht'],
    ['zh', '正在提交', '感谢', '暂时无法']
  ]) {
    const invalid = formHarness(lang, false);
    await invalid.submit();
    assert.equal(invalid.calls, 0); assert.equal(invalid.focused, 'name');
    assert.equal(invalid.errors['name-error'].hidden, false);
    assert.equal(invalid.fields.name.getAttribute('aria-invalid'), 'true'); assert.ok(invalid.status.textContent);
    const whitespace = formHarness(lang);
    whitespace.fields.company.value = '   ';
    await whitespace.submit();
    assert.equal(whitespace.calls, 0); assert.equal(whitespace.focused, 'company');
    const email = formHarness(lang);
    email.fields.email.value = 'invalid-email'; email.fields.email.validity.typeMismatch = true;
    await email.submit();
    assert.equal(email.calls, 0); assert.equal(email.focused, 'email');
    email.fields.email.value = 'person@example.com'; email.fields.email.validity.typeMismatch = false;
    email.fields.email.listeners.input();
    assert.equal(email.errors['email-error'].hidden, true);
    assert.equal(email.fields.email.getAttribute('aria-invalid'), undefined);
    assert.equal(email.status.textContent, '');
    const long = formHarness(lang);
    long.fields.challenge.value = 'x'.repeat(10001);
    await long.submit();
    assert.equal(long.calls, 0); assert.match(long.errors['challenge-error'].textContent, /10000/);
    const successForm = formHarness(lang);
    successForm.fields.name.value = '  Example  ';
    const pending = successForm.submit();
    assert.equal(successForm.fields.name.value, 'Example');
    assert.equal(successForm.button.disabled, true);
    assert.equal(successForm.attrs['aria-busy'], 'true');
    assert.ok(successForm.status.textContent.includes(sending));
    await successForm.submit(); assert.equal(successForm.calls, 1);
    successForm.finish(true); await pending;
    assert.ok(successForm.status.textContent.includes(success)); assert.equal(successForm.resets, 1);
    assert.equal(successForm.button.disabled, false); assert.equal(successForm.button.textContent, 'Original label');
    assert.equal(successForm.attrs['aria-busy'], undefined);
    for (const failure of ['http', 'offline', 'timeout']) {
      const failed = formHarness(lang);
      const pendingFailure = failed.submit();
      if (failure === 'http') failed.finish(false);
      if (failure === 'offline') failed.reject();
      if (failure === 'timeout') failed.timeout();
      await pendingFailure;
      assert.ok(failed.status.textContent.includes(error)); assert.equal(failed.resets, 0);
      assert.equal(failed.button.disabled, false);
      // A retry is possible after the failure.
      const retry = failed.submit(); failed.finish(true); await retry;
      assert.equal(failed.calls, 2); assert.equal(failed.resets, 1);
    }
  }
  console.log('Forms: localized validation/success/error, duplicate guard, HTTP/network/timeout failures, preserved entries and retries passed (stubbed fetch only)');
}

testLanguages();
testForms().catch(error => { console.error(error); process.exitCode = 1; });
