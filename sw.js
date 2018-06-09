var staticCacheName = 'restrev-static-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/index.html',
        'js/main.js',
        'restaurant.html',
        'js/restaurant_info.js',
        'css/styles.css',
        'js/dbhelper.js',
        'data/restaurants.json',
        'img/1_320.jpg',
        'img/2_320.jpg',
        'img/3_320.jpg',
        'img/4_320.jpg',
        'img/5_320.jpg',
        'img/6_320.jpg',
        'img/7_320.jpg',
        'img/8_320.jpg',
        'img/9_320.jpg',
        'img/10_320.jpg',
        'img/1_640.jpg',
        'img/2_640.jpg',
        'img/3_640.jpg',
        'img/4_640.jpg',
        'img/5_640.jpg',
        'img/6_640.jpg',
        'img/7_640.jpg',
        'img/8_640.jpg',
        'img/9_640.jpg',
        'img/10_640.jpg',
        'img/1_800.jpg',
        'img/2_800.jpg',
        'img/3_800.jpg',
        'img/4_800.jpg',
        'img/5_800.jpg',
        'img/6_800.jpg',
        'img/7_800.jpg',
        'img/8_800.jpg',
        'img/9_800.jpg',
        'img/10_800.jpg',
        'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restrev-') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});