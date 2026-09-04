/* ============================================================
   Service worker – offline provoz
   - skořápka aplikace: cache first, na pozadí se obnoví
   - dlaždice mapy: cache first, ukládají se jen ty, které
     uživatel reálně projde (nebo si je stáhne tlačítkem Offline)
   - Firebase: nikdy necachujeme, musí jít vždy na síť
   ============================================================ */
const VER        = 'houby-v97';
const SHELL      = VER + '-shell';

/* Audit 3: tohle jméno dřív obsahovalo číslo verze, takže úklid při
   aktivaci nové verze smazal i mapy, které si člověk stáhl doma na Wi-Fi.
   Appka ho k tomu stahování sama vede – a pak mu je vzala při první
   opravě překlepu. Dlaždice proto verzi nemají a maže je jen uživatel
   tlačítkem „Smazat uložené mapy". */
const TILES      = 'houby-tiles';

/* Audit 3: strop byl 4 000 dlaždic a počítal se v KUSECH. Jenže dlaždice
   jsou z cizích domén, ukládají se jako neprůhledné odpovědi (opaque) a
   prohlížeč u nich neví, jak jsou velké – do kvóty si je proto účtuje
   paušálem. Naměřeno na živé appce: 3 073 620 430 bajtů na 439 položek,
   tedy 7,0 MB na dlaždici, která má ve skutečnosti 24 kB. Strop 4 000
   tak znamenal 27 GB kvóty, zatímco prohlížeč jich dává 13 – a na
   telefonu mnohem míň. Teď se strop odvozuje z kvóty, kterou prohlížeč
   opravdu nabízí, a dlaždicím se z ní dá nejvýš polovina. */
const TILE_UCTOVANO = 7 * 1024 * 1024;   // co si prohlížeč naúčtuje za jednu opaque dlaždici
const TILE_PODIL    = 0.5;               // kolik z kvóty smí zabrat mapa
const TILE_MIN      = 150;               // ať appka funguje i na skoro plném telefonu
const TILE_MAX_ABS  = 1500;              // ~10 GB kvóty, přes to nejdeme ani na počítači

/* Audit 32: v tomhle seznamu byly dvě adresy na cdnjs – CSS a JS
   Leafletu. Předukládání má osmivteřinový limit a chybu tiše spolkne,
   takže když se knihovna nestihla stáhnout, appka spuštěná z ikonky se
   otevřela bez mapy ("L is not defined") a zbyla z ní holá stránka.
   V Safari se to neprojevilo: tam knihovna ležela v běžné cache
   prohlížeče, kterou appka z plochy nesdílí. Leaflet je teď vložený
   přímo v index.html, takže tenhle seznam neobsahuje nic cizího a
   skořápka buď je celá, nebo není vůbec. */
const SHELL_FILES = [
  './',
  './index.html',
  './config.js',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './nalezy-gbif.json',
  /* Audit 65: mista.json (73 kB po gzipu) se stahovalo az ve chvili,
     kdy si clovek rekl o "Kam vyrazit" nebo "Kde je nejbliz". Kdo to
     poprve otevrel az v lese bez signalu, nedostal zadne parkoviste. */
  './mista.json'
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
      .then(keys => Promise.all(keys
        .filter(k => k !== TILES && !k.startsWith(VER))
        .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Kromě dlaždic OSM ukládáme i obrázky lesů z ČÚZK a chráněných území
   z AOPK – mění se jednou za rok a cache je svázaná s verzí appky,
   takže se s každou aktualizací stejně natáhnou znovu.

   Dotazy na druh porostu (/query) tu schválně NEJSOU. Každý posun mapy
   je jiná adresa a jedna odpověď má i sto kilobajtů – během jedné
   vycházky by to sežralo místo, které jinde hlídáme. Detail porostu
   je bonus pro chvíle, kdy je signál; offline zůstane zelený podklad. */
function isTile(url){
  /* Maska lesa pro mapu růstu (hb=rust) se neukládá. Je pokaždé jiná –
     jiný výřez, jiná adresa – a jako opaque odpověď by si každá ukousla
     7 MB z kvóty a vytlačila dlaždice, které si člověk stáhl na cestu. */
  if (/[?&]hb=rust/.test(url)) return false;
  return /tile\.openstreetmap\.org/.test(url)
      || /\/\d+\/\d+\/\d+\.png($|\?)/.test(url)
      || /ags\.cuzk\.gov\.cz\/arcgis\/rest\/services\/.*\/export\?/.test(url)
      || /gis\.nature\.cz\/arcgis\/rest\/services\/.*\/export\?/.test(url);
}

async function stropDlazdic(){
  try {
    const e = await navigator.storage.estimate();
    if (e && e.quota){
      const n = Math.floor(e.quota * TILE_PODIL / TILE_UCTOVANO);
      return Math.max(TILE_MIN, Math.min(TILE_MAX_ABS, n));
    }
  } catch(err){}
  return 400;                             // když se kvóta zjistit nedá, buďme opatrní
}

let trimBezi = false;
async function trimTiles(){
  if (trimBezi) return;
  trimBezi = true;
  try {
    const c = await caches.open(TILES);
    const keys = await c.keys();
    const strop = await stropDlazdic();
    if (keys.length > strop){
      for (let i = 0; i < keys.length - strop; i++) await c.delete(keys[i]);
    }
  } catch(err){} finally { trimBezi = false; }
}

/* Appka se ptá, kolik místa mapa doopravdy zabírá – v účtované, ne
   ve skutečné velikosti, protože prohlížeč hlídá tu účtovanou. */
self.addEventListener('message', async e => {
  if (e.data !== 'kolik-map' || !e.source) return;
  try {
    const c = await caches.open(TILES);
    const n = (await c.keys()).length;
    e.source.postMessage({typ:'kolik-map', dlazdic:n, uctovano:n * TILE_UCTOVANO,
                          strop: await stropDlazdic(), naDlazdici: TILE_UCTOVANO});
  } catch(err){}
});

/* Audit 5 – nejhorší chyba, jakou tahle appka měla.
   Skořápka se hledala v cache s ignoreSearch:true, tedy „na dotazu za
   otazníkem nezáleží". To je správně pro ./index.html?t=31, ale tenhle
   blok dostával VŠECHNO, co nebylo dlaždice – včetně dotazů na
   Open-Meteo, OSRM, ÚHÚL i AOPK. První odpověď se uložila a od té chvíle
   dostávala appka na každý další dotaz na tu adresu tu první, bez ohledu
   na souřadnice, filtry i počet bodů.

   Co to působilo: „pořád stejné tři návrhy, ať měním filtry jak chci" –
   OSRM vracel pokaždé první spočítané dojezdy. A po přidání mapy růstu
   i tvrdý pád: mapa si vyžádala počasí pro 8 bodů mřížky, doporučení pak
   pro 30 míst a dostalo zpátky těch osm – odtud „undefined is not an
   object (evaluating 'pocasi[i].daily')".

   Reprodukováno v prohlížeči: druhý dotaz na stejnou cestu s jiným
   dotazem dostal odpověď prvního (3 místo 30 položek).

   Nové pravidlo: v cache skořápky je jen to, co je z naší domény, plus
   výslovně předuložené soubory z CDN. Cizí služby jdou vždy na síť. */
const CIZI_SKORAPKA = SHELL_FILES.filter(u => /^https?:\/\//.test(u));

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

  /* Cizí služba, která není dlaždice ani předuložený soubor z CDN:
     nikdy neukládat, nikdy nepodstrkávat starou odpověď. */
  const nase = url.startsWith(self.location.origin + '/');
  if (!nase && CIZI_SKORAPKA.indexOf(url) === -1) return;

  // skořápka aplikace
  e.respondWith((async () => {
    const c = await caches.open(SHELL);
    /* ignoreSearch smí platit jen pro otevření stránky (./index.html?t=31).
       U ostatních souborů musí adresa sedět přesně. */
    const jeStranka = req.mode === 'navigate';
    const hit = await c.match(req, jeStranka ? {ignoreSearch: true} : undefined);
    const net = fetch(req).then(res => {
      if (res && res.ok) c.put(req, res.clone());
      return res;
    }).catch(() => null);

    /* Audit 32: samotná stránka se bere přednostně ze sítě, ostatní
       soubory z cache. Důvod: appka z ikonky má vlastní cache a při
       „cache first" ukazovala starou verzi tak dlouho, dokud service
       worker nepřevzal řízení – tedy nejmíň jedno spuštění navíc.
       Aby to nezdrželo start v lese, čeká se na síť nejvýš dvě vteřiny
       a pak se bez řečí vezme uložená verze. Offline se nečeká vůbec. */
    if (jeStranka){
      if (!hit) return (await net) || new Response('Offline a stránka není uložená.', {status: 503});
      const zeSite = await Promise.race([
        net,
        new Promise(res => setTimeout(() => res(null), 2000))
      ]);
      return (zeSite && zeSite.ok) ? zeSite : hit;
    }

    return hit || (await net) || new Response('Offline a stránka není uložená.', {status: 503});
  })());
});
