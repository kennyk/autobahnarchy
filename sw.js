const CACHE_NAME = 'autobahnarchy-v11';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/screens.js',
  './js/quiz.js',
  './data/rules.json',
  './data/quiz.json',
  './manifest.json',
  './assets/ui/icon-192.png',
  './assets/ui/icon-512.png',
  './assets/fonts/PressStart2P-Regular.woff2',
  './assets/title-screen-tall.gif',
  './assets/study-time.png',
  './assets/signs/Zeichen_208_-_Dem_Gegenverkehr_Vorrang_gew%C3%A4hren!_600x600,_StVO_1992.png',
  './assets/signs/Zeichen_209-30_-_Vorgeschriebene_Fahrtrichtung,_Geradeaus,_StVO_2017.png',
  './assets/signs/Zeichen_209_-_Vorgeschriebene_Fahrtrichtung,_rechts,_StVO_2017.png',
  './assets/signs/Zeichen_220-10_-_Einbahnstra%C3%9Fe,_linksweisend,_StVO_2017.png',
  './assets/signs/Zeichen_250_-_Verbot_f%C3%BCr_Fahrzeuge_aller_Art,_StVO_1970.png',
  './assets/signs/Zeichen_251_-_Verbot_f%C3%BCr_Kraftwagen_und_sonstige_mehrspurige_Kraftfahrzeuge,_StVO_1992.png',
  './assets/signs/Zeichen_267_-_Verbot_der_Einfahrt,_StVO_1970.png',
  './assets/signs/Zeichen_274-60_-_Zul%C3%A4ssige_H%C3%B6chstgeschwindigkeit,_StVO_2017.png',
  './assets/signs/Zeichen_275-30_-_Vorgeschriebene_Mindestgeschwindigkeit,_StVO_2017.png',
  './assets/signs/Zeichen_276_-_%C3%9Cberholverbot_f%C3%BCr_Kraftfahrzeuge_aller_Art,_StVO_1992.png',
  './assets/signs/Zeichen_278-60_-_Ende_der_zul%C3%A4ssigen_H%C3%B6chstgeschwindigkeit,_StVO_2017.png',
  './assets/signs/Zeichen_282_-_Ende_s%C3%A4mtlicher_Streckenverbote,_StVO_1970.png',
  './assets/signs/Zeichen_283_-_Absolutes_Haltverbot,_StVO_2017.png',
  './assets/signs/Zeichen_286_-_Eingeschr%C3%A4nktes_Halteverbot,_StVO_1970.png',
  './assets/signs/Zeichen_306_-_Vorfahrtstra%C3%9Fe,_StVO_1970.png',
  './assets/signs/Zeichen_330.1_-_Autobahn,_StVO_2013.png',
  './assets/signs/Zeichen_333_-_Pfeilschild_-_Ausfahrt_von_der_Autobahn,_StVO_1980.png',
  './assets/signs/Zeichen_515-11_-_Verschwenkungstafel_-_ohne_Gegenverkehr_mit_integriertem_Zeichen_264_StVO_-_zweistreifig_nach_links_(1600x1250).png',
  './assets/signs/Zeichen_523-30_-_Fahrstreifentafel_-_ohne_Gegenverkehr_mit_integriertem_Zeichen_274_-_zweistreifig_in_Fahrtrichtung_(1600x1250).png',
  './assets/signs/Zeichen_524-30_-_Fahrstreifentafel_-_ohne_Gegenverkehr_mit_integriertem_Zeichen_253_-_zweistreifig_in_Fahrtrichtung_(1600x1250).png',
  './assets/signs/Zeichen_525-31_-_Fahrstreifentafel_-_ohne_Gegenverkehr_mit_integriertem_Zeichen_275_-_dreistreifig_in_Fahrtrichtung_(1600x1250).png',
  './assets/signs/Zeichen_531-11_-_Einengungstafel,_Darstellung_ohne_Gegenverkehr-_noch_zwei_Fahrstreifen_links_in_Fahrtrichtung,_StVO_1992.png',
  './assets/signs/town-entry.png',
  './assets/signs/town-exit.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
