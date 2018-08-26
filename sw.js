const staticCacheName = 'restrev-static-v4';
const contentImgsCache = 'restrev-content-imgs';
const allCaches = [
  staticCacheName,
  contentImgsCache
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        'js/connection_handler.js',
        'js/idb.js',
        'js/main.js',
        'restaurant.html',
        'js/restaurant_info.js',
        'css/styles.css',
        'js/dbhelper.js',
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css',
        '/manifest.json',
        'img/icons/cloud-error.svg',
        'img/icons/heart-solid.svg',
        'img/favicon/apple-touch-icon-57x57.png',
        'img/favicon/apple-touch-icon-114x114.png',
        'img/favicon/apple-touch-icon-72x72.png',
        'img/favicon/apple-touch-icon-144x144.png',
        'img/favicon/apple-touch-icon-60x60.png',
        'img/favicon/apple-touch-icon-120x120.png',
        'img/favicon/apple-touch-icon-76x76.png',
        'img/favicon/apple-touch-icon-152x152.png',
        'img/favicon/favicon-1024x1024.png',
        'img/favicon/favicon-196x196.png',
        'img/favicon/favicon-96x96.png',
        'img/favicon/favicon-32x32.png',
        'img/favicon/favicon-16x16.png',
        'img/favicon/favicon-128.png',
        'img/favicon/mstile-144x144.png',
        'img/favicon/mstile-70x70.png',
        'img/favicon/mstile-150x150.png',
        'img/favicon/mstile-310x150.png',
        'img/favicon/mstile-310x310.png',
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      Promise.all(
        cacheNames.filter(cacheName => {
          cacheName.startsWith('restrev-') && !allCaches.includes(cacheName);
        }).map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);
 
  if (requestURL.origin === location.origin) {
    if (requestURL.pathname === '/restaurant.html') {
      event.respondWith(caches.match('restaurant.html'));
      return;
    }
  }
  
  if (requestURL.origin === 'http://localhost:1337') {
    if (requestURL.pathname.startsWith('/images/')) {
      event.respondWith(serveImages(event.request));
      return;
    }
  }
  
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request)
    })
  );
});

function serveImages(request) {
  const storageUrl = request.url.replace(/_\d+\.jpg$/, '');
  
  return caches.open(contentImgsCache).then(cache => {
    return cache.match(storageUrl).then(response => {
      if (response) return response;

      return fetch(request).then(networkResponse => {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      })
    })
  })
  
}