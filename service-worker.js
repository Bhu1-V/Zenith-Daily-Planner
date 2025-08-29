
const CACHE_NAME = 'zenith-planner-v3';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Activate new SW immediately
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Try to get the resource from the cache first.
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. If the resource is not in the cache, try the network.
      try {
        const networkResponse = await fetch(event.request);

        // A. For navigation requests that fail (e.g., 404), serve the app shell.
        if (event.request.mode === 'navigate' && !networkResponse.ok) {
          console.log('HTML request failed, serving app shell from cache.');
          return await cache.match('/index.html');
        }

        // B. For successful requests, cache them and return the response.
        if (networkResponse.ok) {
          // We must clone the response to cache it and serve it.
          const responseToCache = networkResponse.clone();
          if (!event.request.url.startsWith('chrome-extension://')) {
            await cache.put(event.request, responseToCache);
          }
        }

        return networkResponse;
      } catch (error) {
        // 3. If the network request fails (e.g., offline), serve the app shell for navigation.
        console.error('Fetch failed; returning offline fallback.', error);
        if (event.request.mode === 'navigate') {
          const appShell = await cache.match('/index.html');
          if (appShell) {
            return appShell;
          }
        }
        
        // For other failed requests (e.g., scripts, styles), we can't do anything.
        // The browser will handle it as a failed network request.
        throw error;
      }
    })
  );
});


self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Take control of open pages
  );
});
