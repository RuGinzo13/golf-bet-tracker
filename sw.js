// Golf Bet Tracker — Service Worker
// Cache-first strategy for the app shell; network-first for API calls.

var CACHE = 'golf-bets-v2';
var SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(SHELL); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Pass through non-GET and cross-origin API requests
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if(url.hostname !== self.location.hostname) return;

  e.respondWith(
    caches.match(e.request).then(function(cached){
      var networkFetch = fetch(e.request).then(function(resp){
        if(resp && resp.status === 200 && resp.type === 'basic'){
          var clone = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return resp;
      });
      // Return cached version immediately, update cache in background
      return cached || networkFetch;
    })
  );
});
