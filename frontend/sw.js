const CACHE_NAME = 'trendora-cache-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/api.js',
    '/login.js',
    '/manifest.json',
    '/pages/home.html',
    '/pages/home.js',
    '/pages/products.html',
    '/pages/products.js',
    '/pages/cart.html',
    '/pages/cart.js',
    '/pages/orders.html',
    '/pages/orders.js'
];

// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Fetch Event (Network-First Fallback-to-Cache Strategy)
self.addEventListener('fetch', event => {
    // Only cache GET requests (prevents MoMo and API mutations breaking)
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
