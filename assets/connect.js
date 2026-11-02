(function () {
  'use strict';
  var params = new URLSearchParams(window.location.search);
  var isWeChat = /MicroMessenger/i.test(navigator.userAgent || '');
  // A normal camera/browser goes to the website; the explicit view is also
  // available from the website's WeChat link and with JavaScript disabled.
  if (!isWeChat && params.get('view') !== 'wechat') {
    window.location.replace(new URL('index.html', window.location.href).href);
    return;
  }
  var messages = {
    en: {
      title: 'Connect on WeChat',
      help: 'In WeChat, press and hold the code to recognize it. Or scan it with WeChat, or save the image and select it in WeChat’s scanner.',
      note: 'Adding a contact requires your confirmation in WeChat.',
      website: 'Visit the website ↗', save: 'Save WeChat QR code', alt: 'Tim Li’s WeChat contact QR code', page: 'index.html'
    },
    de: {
      title: 'Kontakt über WeChat',
      help: 'In WeChat: Code gedrückt halten und erkennen. Oder mit WeChat scannen bzw. das gespeicherte Bild im Scanner aus dem Album wählen.',
      note: 'Das Hinzufügen eines Kontakts erfordert Ihre Bestätigung in WeChat.',
      website: 'Zur Website ↗', save: 'WeChat-QR-Code speichern', alt: 'WeChat-Kontakt-QR-Code von Tim Li', page: 'de.html'
    },
    zh: {
      title: '通过微信联系',
      help: '在微信内长按图片，选择识别二维码。也可使用微信扫一扫，或保存图片后在微信扫一扫中从相册选择。',
      note: '添加好友仍需您在微信中确认。',
      website: '访问网站 ↗', save: '保存微信二维码', alt: 'Tim Li 的微信好友二维码', page: 'zh.html'
    }
  };
  var saved;
  try { saved = window.localStorage.getItem('preferred-language'); } catch (error) {}
  var lang = params.get('lang') || saved;
  if (!Object.prototype.hasOwnProperty.call(messages, lang)) {
    lang = (navigator.languages || [navigator.language || 'en'])
      .map(function (value) { return value.toLowerCase().split('-')[0]; })
      .find(function (value) { return Object.prototype.hasOwnProperty.call(messages, value); }) || 'en';
  }
  var copy = messages[lang];
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
  document.title = copy.title + ' | Dr. Tim Li Enterprise AI';
  ['title', 'help', 'note', 'website', 'save'].forEach(function (key) {
    document.getElementById('connect-' + key).textContent = copy[key];
  });
  document.getElementById('connect-website').href = copy.page;
  document.querySelector('.brand').href = copy.page;
  document.getElementById('wechat-image').alt = copy.alt;
  document.querySelectorAll('.languages a').forEach(function (link) {
    if (link.lang.split('-')[0] === lang) link.setAttribute('aria-current', 'page');
  });
}());
