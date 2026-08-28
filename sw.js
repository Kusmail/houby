/* ============================================================
   Service worker – offline provoz
   - skořápka aplikace: cache first, na pozadí se obnoví
   - dlaždice mapy: cache first, ukládají se jen ty, které
     uživatel reálně projde (nebo si je stáhne tlačítkem Offline)
   - Firebase: nikdy necachujeme, musí jít vždy na síť
   ============================================================ */
const VER        = 'houby-v6';
const SHELL      = VER + '-shell';
const TILES      = VER + '-tiles';
const TILE_MAX   = 3000;          // strop uložených dlaždic

const SHELL_FILES = [
  './',
  './index.html',
  './config.js',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
];

/* Předuložení skořápky nesmí instalaci zaseknout. Když je síť pomalá
   nebo CDN nedostupné, jednotlivé soubory se prostě nepředuloží –
   ale nová verze se musí nainstalovat, jinak by uživateli nikdy
   nedošlo, že nějaká je. */
const PRECACHE_TIMEOUT = 8000;
function pridejSCasovymLimitem(c, url){
  return Promise.race([
    c.add(url),
    new Promise(res => setTimeout(res, PRECACHE_TIMEOUT))
  ]).catch(() => {});
}

self.addEventListener('install', e => {
  // Záměrně tu NENÍ skipWaiting. Nová verze počká, dokud uživatel
  // neklepne na „Načíst" – jinak by se stránka mohla přenačíst
  // uprostřed cesty k autu.
  e.waitUntil(
    caches.open(SHELL).then(c => Promise.all(SHELL_FILES.map(u => pridejSCasovymLimitem(c, u))))
  );
});

// appka řekne, že je vhodná chvíle přepnout na novou verzi
self.addEventListener('message', e => {
  if (e.data === 'prevzit-rizeni') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !k.startsWith(VER)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isTile(url){
  return /tile\.openstreetmap\.org/.test(url) || /\/\d+\/\d+\/\d+\.png($|\?)/.test(url);
}

async function trimTiles(){
  const c = await caches.open(TILES);
  const keys = await c.keys();
  if (keys.length > TILE_MAX){
    // smaž nejstarší přebytek
    for (let i = 0; i < keys.length - TILE_MAX; i++) await c.delete(keys[i]);
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;

  // Firebase a Google API vždy ze sítě
  if (/gstatic\.com\/firebasejs|firebaseio\.com|firebasedatabase\.app|googleapis\.com/.test(url)) return;

  // dlaždice mapy
  if (isTile(url)){
    e.respondWith((async () => {
      const c = await caches.open(TILES);
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')){ c.put(req, res.clone()); trimTiles(); }
        return res;
      } catch(err){
        return hit || new Response('', {status: 504, statusText: 'Dlaždice není uložená offline'});
      }
    })());
    return;
  }

  // skořápka aplikace
  e.respondWith((async () => {
    const c = await caches.open(SHELL);
    const hit = await c.match(req, {ignoreSearch: true});
    const net = fetch(req).then(res => {
      if (res && res.ok) c.put(req, res.clone());
      return res;
    }).catch(() => null);
    return hit || (await net) || new Response('Offline a stránka není uložená.', {status: 503});
  })());
});
