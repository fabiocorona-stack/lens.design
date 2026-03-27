var CACHE_NAME = 'lens-v1';
var urlsToCache = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(urlsToCache); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(names) {
    return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Don't cache API calls
  if (e.request.url.includes('/api/') || e.request.url.includes('/remove-bg') ||
      e.request.url.includes('/fetch-url') || e.request.url.includes('/fashn') ||
      e.request.url.includes('/stability') || e.request.url.includes('/inpaint') ||
      e.request.url.includes('/health') || e.request.method !== 'GET') {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(response) {
        if (response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      });
    })
  );
});
