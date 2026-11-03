(function () {
  var languages = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language || ''];
  var chineseLanguage = languages.some(function (value) {
    var tag = String(value).toLowerCase().replace(/_/g, '-');
    return tag === 'zh' || tag.indexOf('zh-') === 0;
  });
  var chinaTimezone = false;
  try {
    var zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    chinaTimezone = zone === 'Asia/Shanghai' || zone === 'Asia/Urumqi' || zone === 'Asia/Chongqing' || zone === 'Asia/Harbin';
  } catch (_) {
    // A missing timezone leaves the optional location hidden.
  }
  if (!chineseLanguage && !chinaTimezone) return;
  document.querySelectorAll('.china-presence').forEach(function (item) {
    item.hidden = false;
  });
}());
