/* Payvyn service worker — app-shell cache, network-first for navigations */
var CACHE = 'payvyn-v8';
var SHELL = ['/', '/index.html', '/banks-us.js', '/manifest.webmanifest',
  '/assets/payvyn-mark.png', '/assets/favicon.png', '/assets/icon-192.png', '/assets/icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL).catch(function(){}); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(function(r){ var cp=r.clone(); caches.open(CACHE).then(function(c){c.put(req,cp);}); return r; }).catch(function(){ return caches.match('/index.html').then(function(m){return m||caches.match('/');}); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(r){ return r || fetch(req).then(function(resp){ var cp=resp.clone(); caches.open(CACHE).then(function(c){c.put(req,cp);}); return resp; }).catch(function(){return r;}); }));
});
