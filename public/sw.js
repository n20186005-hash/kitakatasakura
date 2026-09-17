/* 日中線しだれ桜並木ガイド - Service Worker（オフライン対応） */
const VERSION = "v1-2026-09";
const STATIC_CACHE = `kitakata-static-${VERSION}`;
const PAGE_CACHE = `kitakata-pages-${VERSION}`;

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./en/",
  "./en/index.html",
  "./styles.css",
  "./script.js",
  "./i18n.js",
  "./manifest.webmanifest",
  "./assets/sakura-mark.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-512-maskable.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/images/nitchu-sakura-08.jpg",
  "./assets/images/nitchu-sakura-06.jpg",
  "./assets/images/nitchu-sakura-03.jpg",
  "./assets/images/nitchu-sakura-01.jpg",
  "./assets/images/sl-c11-63.jpg",
  "./assets/images/kitakata-ramen.jpg",
  "./assets/images/kitakata-kura.jpg",
  "./assets/images/atsushio-station.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("kitakata-") && key !== STATIC_CACHE && key !== PAGE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const isNavigation = (request) =>
  request.mode === "navigate" || (request.method === "GET" && (request.headers.get("accept") || "").includes("text/html"));

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("./index.html").then((fallback) => fallback || Response.error())),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          }
          return response;
        })
        .catch(() => cached || Response.error());
    }),
  );
});
