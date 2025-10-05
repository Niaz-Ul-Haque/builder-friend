// Service Worker for Plan6ix Buildtrade Inc
// Version: 1.0.0
// Last Updated: October 5, 2025

const CACHE_NAME = 'plan6ix-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/main.js',
  '/assets/logo-4.png',
  '/assets/new-navbar-logo.png',
  '/assets/mascot-4.png',
  '/assets/social-share-image.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
