const cacheName = 'js13kPWA-v1';
const contentToCache = [
'/',
'/login',
'static/css/main.css',
'static/css/design.css',
'static/css/design.css',
'static/js/app.js',
'static/js/main.js',
'static/js/controller/boardsManager.js',
'static/js/controller/cardsManager.js',
'static/js/controller/statusesManager.js',
'static/js/data/dataHandler.js',
'static/js/view/domManager.js',
'static/js/view/htmlFactory.js',
];

self.addEventListener('fetch', async e => {
e.respondWith((async () => {
    const r = await caches.match(e.request);
    if (r) { return r; }
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    cache.put(e.request, response.clone());
    return response;
  })());
});


self.addEventListener("beforeinstallprompt", e => {

});


self.addEventListener("install", e => {
 e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(contentToCache);
  })());
});

