const cacheName = 'static-v5';

addEventListener('install', event => {
  skipWaiting();
  event.waitUntil(async function() {
    const cache = await caches.open(cacheName);
    await cache.addAll(['./client.js', '/']);
  }());
});

addEventListener('activate', event => {
  event.waitUntil(async function() {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key != cacheName) await caches.delete(key);
    }
    
    for (const client of await clients.matchAll()) {
      client.navigate(client.url);
    }
  }());
});

addEventListener('fetch', event => {
  event.respondWith(async function() {
    const response = await caches.match(event.request);
    if (response) return response;
    return fetch(event.request);
  }());
});
