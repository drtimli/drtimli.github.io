(function () {
  'use strict';
  var params = new URLSearchParams(window.location.search);
  var userAgent = navigator.userAgent || '';
  var app = /MicroMessenger/i.test(userAgent) ? 'wechat' : /WhatsApp/i.test(userAgent) ? 'whatsapp' : 'browser';
  // Scanner identity is only available when the app exposes it. Ordinary
  // browsers retain both choices rather than guessing from language or device.
  var messages = {
    en: {
      title: 'Connect with Dr. Tim Li',
      intro: 'Visit our website or get in touch through WhatsApp or WeChat.',
      whatsapp: 'Chat on WhatsApp ↗', 'whatsapp-summary': 'Show WhatsApp QR code',
      'whatsapp-help': 'Scan this code with WhatsApp, or use the WhatsApp button above on this phone.',
      'whatsapp-save': 'Save WhatsApp QR code', whatsappAlt: 'Dr. Tim Li’s WhatsApp contact QR code', 'wechat-heading': 'WeChat',
      help: 'In WeChat, press and hold the image and choose the QR recognition option. Otherwise, scan it with WeChat or save it and select it from your album in WeChat’s scanner.',
      note: 'Adding a contact or sending a message requires your action in the chosen app.',
      website: 'Visit the website ↗', save: 'Save WeChat QR code', alt: 'Tim Li’s WeChat contact QR code', page: 'index.html'
    },
    de: {
      title: 'Kontakt mit Dr. Tim Li',
      intro: 'Besuchen Sie unsere Website oder kontaktieren Sie uns über WhatsApp oder WeChat.',
      whatsapp: 'Chat auf WhatsApp ↗', 'whatsapp-summary': 'WhatsApp-QR-Code anzeigen',
      'whatsapp-help': 'Scannen Sie diesen Code mit WhatsApp oder nutzen Sie auf diesem Telefon die WhatsApp-Schaltfläche oben.',
      'whatsapp-save': 'WhatsApp-QR-Code speichern', whatsappAlt: 'WhatsApp-Kontakt-QR-Code von Dr. Tim Li', 'wechat-heading': 'WeChat',
      help: 'Halten Sie in WeChat das Bild gedrückt und wählen Sie die QR-Erkennung. Alternativ scannen Sie es mit WeChat oder speichern es und wählen es im WeChat-Scanner aus Ihrem Album aus.',
      note: 'Das Hinzufügen eines Kontakts oder Senden einer Nachricht erfordert Ihre Aktion in der jeweiligen App.',
      website: 'Zur Website ↗', save: 'WeChat-QR-Code speichern', alt: 'WeChat-Kontakt-QR-Code von Tim Li', page: 'de.html'
    },
    zh: {
      title: '联系 Dr. Tim Li',
      intro: '访问我们的网站，或通过 WhatsApp、微信与我们联系。',
      whatsapp: '通过 WhatsApp 聊天 ↗', 'whatsapp-summary': '显示 WhatsApp 二维码',
      'whatsapp-help': '使用 WhatsApp 扫描此二维码，或在当前手机上点击上方的 WhatsApp 按钮。',
      'whatsapp-save': '保存 WhatsApp 二维码', whatsappAlt: 'Dr. Tim Li 的 WhatsApp 联系二维码', 'wechat-heading': '微信',
      help: '在微信内长按图片，选择识别二维码。也可使用微信扫一扫，或保存图片后在微信扫一扫中从相册选择。',
      note: '添加联系人或发送消息仍需您在相应应用中操作。',
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
  ['title', 'intro', 'help', 'note', 'website', 'save', 'whatsapp', 'whatsapp-summary', 'whatsapp-help', 'whatsapp-save', 'wechat-heading'].forEach(function (key) {
    document.getElementById('connect-' + key).textContent = copy[key];
  });
  var appIntros = {
    en: { wechat: 'Connect through WeChat, or visit our website.', whatsapp: 'Connect through WhatsApp, or visit our website.' },
    de: { wechat: 'Kontaktieren Sie uns über WeChat oder besuchen Sie unsere Website.', whatsapp: 'Kontaktieren Sie uns über WhatsApp oder besuchen Sie unsere Website.' },
    zh: { wechat: '通过微信联系我们，或访问我们的网站。', whatsapp: '通过 WhatsApp 联系我们，或访问我们的网站。' }
  };
  if (app !== 'browser') document.getElementById('connect-intro').textContent = appIntros[lang][app];
  document.getElementById('connect-whatsapp').hidden = app === 'wechat';
  document.getElementById('whatsapp-option').hidden = app === 'wechat';
  document.getElementById('wechat-option').hidden = app === 'whatsapp';
  document.getElementById('whatsapp-option').open = app === 'whatsapp';
  document.documentElement.dataset.scannerApp = app;
  document.getElementById('connect-website').href = copy.page;
  document.getElementById('wechat-image').alt = copy.alt;
  document.getElementById('whatsapp-image').alt = copy.whatsappAlt;
  document.querySelectorAll('.languages a').forEach(function (link) {
    if (link.lang.split('-')[0] === lang) link.setAttribute('aria-current', 'page');
  });
}());
