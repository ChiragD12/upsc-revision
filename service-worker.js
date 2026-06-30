const CACHE_NAME = 'upsc-revision-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/data.js',
    '/js/subjects.js',
    '/assets/icon1234.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            }
        )
    );
});