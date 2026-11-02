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

  // Only the default entry page negotiates language; translated URLs stay shareable.
  if (currentLanguage === 'en') {
    var language = Object.prototype.hasOwnProperty.call(pages, preference) ? preference : null;
    var browserLanguages = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; !language && i < browserLanguages.length; i++) {
      var candidate = browserLanguages[i].toLowerCase().split(/[-_]/)[0];
      if (Object.prototype.hasOwnProperty.call(pages, candidate)) language = candidate;
    }
    if (language && language !== currentLanguage) {
      var destination = new URL(pages[language], window.location.href);
      destination.search = window.location.search;
      destination.hash = window.location.hash;
      window.location.replace(destination.href);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.languages a[lang]').forEach(function (link) {
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
