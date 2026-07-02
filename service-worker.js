const CACHE_VERSION = 'v2';
const CACHE_NAME = `upsc-revision-${CACHE_VERSION}`;
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/data.js',
    '/js/subjects.js',
    '/assets/icon1234.png'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames
                .filter(cacheName => cacheName.startsWith('upsc-revision-') && cacheName !== CACHE_NAME)
                .map(cacheName => caches.delete(cacheName))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(request)
            .then(networkResponse => {
                const responseClone = networkResponse.clone();
                const cache = caches.open(CACHE_NAME);
                return cache.then(cacheStorage => {
                    cacheStorage.put(request, responseClone);
                    return networkResponse;
                });
            })
            .catch(() => caches.match(request))
    );
});