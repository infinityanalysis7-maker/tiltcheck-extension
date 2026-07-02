const CACHE_NAME = 'tiltcheck-static-v2';
const PAGES_CACHE = 'tiltcheck-pages-v2';
const STATIC_ASSETS = ['/', '/check', '/log', '/summary', '/onboarding', '/privacy', '/terms', '/about', '/manifest.json', '/sw.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((cacheNames) => Promise.all(cacheNames.filter((name) => name !== CACHE_NAME && name !== PAGES_CACHE).map((name) => caches.delete(name)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event; const url = new URL(request.url);
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image' || request.destination === 'font' || url.pathname.startsWith('/_next/') || url.pathname.startsWith('/icon-') || url.pathname.startsWith('/favicon') || url.pathname === '/manifest.json' || url.pathname === '/sw.js') {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => { if (response.status === 200) { caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone())); } return response; }).catch(() => new Response('Offline', { status: 503 }))));
    return;
  }
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(fetch(request).then((response) => { if (response.status === 200) { caches.open(PAGES_CACHE).then((cache) => cache.put(request, response.clone())); } return response; }).catch(() => caches.match(request).then((cached) => cached || caches.match('/').then((fallback) => fallback || new Response('Offline', { status: 503 })))));
    return;
  }
  event.respondWith(fetch(request).catch(() => caches.match(request).then((cached) => cached || new Response('Offline', { status: 503 }))));
});
