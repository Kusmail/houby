/* Zkušební adresa nova/ skončila, nová appka je na hlavní adrese.
   Tenhle service worker nahradí starý: smaže skořápky nova-v*, odhlásí se
   a otevřené okno pošle na hlavní adresu. Dlaždice a ostatní cache nechá. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (/^nova-v[0-9a-z]+-/.test(k)) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({type: 'window'})) c.navigate('../').catch(() => {});
})()));
