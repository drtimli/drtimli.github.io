(function () {
  'use strict';

  var pages = { en: 'index.html', de: 'de.html', zh: 'zh.html' };
  var preferenceKey = 'preferred-language';
  var currentLanguage = document.documentElement.lang.split('-')[0];
  var preference;

  // Storage may be unavailable when browser privacy settings block it.
  try {
    preference = window.localStorage.getItem(preferenceKey);
  } catch (error) {}

  var currentUrl = new URL(window.location.href);
  var websiteView = currentUrl.searchParams.get('view') === 'website';
  var browserLanguages = navigator.languages || [navigator.language || 'en'];
  var preferredLanguage = Object.prototype.hasOwnProperty.call(pages, preference) ? preference : null;
  for (var i = 0; !preferredLanguage && i < browserLanguages.length; i++) {
    var candidate = browserLanguages[i].toLowerCase().split(/[-_]/)[0];
    if (Object.prototype.hasOwnProperty.call(pages, candidate)) preferredLanguage = candidate;
  }
  // The original homepage QR can stay unchanged: route after the URL opens.
  // A website-view link lets WeChat visitors browse without a redirect loop.
  if (/MicroMessenger/i.test(navigator.userAgent || '') && !websiteView) {
    var contactPage = new URL('connect.html', currentUrl);
    contactPage.search = currentUrl.search;
    contactPage.searchParams.set('view', 'wechat');
    contactPage.searchParams.set('lang', currentLanguage === 'en' ? preferredLanguage || 'en' : currentLanguage);
    window.location.replace(contactPage.href);
    return;
  }

  // Only the default entry page negotiates language; translated URLs stay shareable.
  if (currentLanguage === 'en') {
    var language = preferredLanguage;
    if (language && language !== currentLanguage) {
      var destination = new URL(pages[language], window.location.href);
      destination.search = window.location.search;
      destination.hash = window.location.hash;
      window.location.replace(destination.href);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.languages a[lang]').forEach(function (link) {
      if (websiteView) {
        var websiteLink = new URL(link.href, window.location.href);
        websiteLink.searchParams.set('view', 'website');
        link.href = websiteLink.href;
      }
      link.addEventListener('click', function () {
        var language = link.lang.split('-')[0];
        if (Object.prototype.hasOwnProperty.call(pages, language)) {
          try {
            window.localStorage.setItem(preferenceKey, language);
          } catch (error) {}
        }
      });
    });
  });
}());
