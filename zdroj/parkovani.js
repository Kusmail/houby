/* ============================================================
   nova-v3: KDE ZAPARKOVAT – K OKRAJI LESA, NE K BODU NA OBRYSU

   Audit 21. 10. 2026 (audit-model-2026-10-21.md, bod 3): ve 12
   výřezech appka nabídla parkování v mediánu 1 174 m od porostu,
   zatímco nejbližší silnice vedla v mediánu 66 m od jeho okraje.
   Dvě chyby:
   1) Evidované parkoviště do 2,5 km mělo vždy přednost – i když
      silnice vedla 22 m od lesa a parkoviště 1 371 m.
   2) Vzdálenost se měřila od prvního lomového bodu obrysu porostu,
      ne od jeho nejbližšího okraje. U porostu o 138 ha je to klidně
      kilometr navíc.
   Teď: stáhne se obrys porostu, najde se bod veřejné silnice nebo
   ulice nejblíž jeho OKRAJI a evidované parkoviště vyhraje jen
   tehdy, když je nejvýš o 300 m dál než ta silnice. Čára vede od
   auta k místu, kde se do lesa vchází.
   ============================================================ */
const PARK_OKOLI_M = 2500;     // dál parkoviště nehledáme
const PARK_NAVIC_M = 300;      // o kolik smí být evidované parkoviště dál než silnice
let parkVrstva = null;

/* rovinné souřadnice v metrech kolem dané šířky – na pár kilometrů přesné dost */
function rovina(lat0){
  const kx = 111320 * Math.cos(lat0 * Math.PI / 180), ky = 110540;
  return { tam: (lat, lng) => [lng * kx, lat * ky], zpet: (x, y) => [y / ky, x / kx] };
}
function naUsecce(p, a, b){
  const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
  let t = l ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l : 0;
  t = Math.max(0, Math.min(1, t));
  const x = a[0] + t * dx, y = a[1] + t * dy;
  return [x, y, Math.hypot(p[0] - x, p[1] - y)];
}
/* nejbližší bod lomených čar k bodu p */
function nejblizNaCarach(p, cary){
  let nej = null;
  for (const c of cary){
    if (c.length === 1){ const d = Math.hypot(p[0] - c[0][0], p[1] - c[0][1]); if (!nej || d < nej[2]) nej = [c[0][0], c[0][1], d]; continue; }
    for (let i = 1; i < c.length; i++){ const q = naUsecce(p, c[i - 1], c[i]); if (!nej || q[2] < nej[2]) nej = q; }
  }
  return nej;
}
/* nejbližší dvojice bodů mezi dvěma sadami čar: {a: bod na A, b: bod na B, d} */
function nejblizDvojice(A, B){
  let nej = null;
  for (const c of A) for (const p of c){ const q = nejblizNaCarach(p, B); if (q && (!nej || q[2] < nej.d)) nej = {a: p, b: [q[0], q[1]], d: q[2]}; }
  for (const c of B) for (const p of c){ const q = nejblizNaCarach(p, A); if (q && (!nej || q[2] < nej.d)) nej = {a: [q[0], q[1]], b: p, d: q[2]}; }
  return nej;
}
/* GeoJSON geometrie → lomené čáry v metrech (obrysy polygonů i čáry) */
function caryZGeometrie(g, R){
  const out = [];
  const zpracuj = (c) => { if (typeof c[0][0] === 'number') out.push(c.map(b => R.tam(b[1], b[0]))); else c.forEach(zpracuj); };
  if (g && g.coordinates) zpracuj(g.type === 'Point' ? [[g.coordinates]] : g.coordinates);
  return out;
}
/* Rozhodnutí bez sítě – kvůli měření je oddělené od stahování.
   okraj: čáry obrysu lesa, silnice: čáry, parkoviste: body [x,y]. */
function vyberParkovani(okraj, silnice, parkoviste){
  const s = silnice.length ? nejblizDvojice(okraj, silnice) : null;
  let p = null;
  for (const b of parkoviste){
    const q = nejblizNaCarach(b, okraj);
    if (q && q[2] <= PARK_OKOLI_M && (!p || q[2] < p.d)) p = {b, vstup: [q[0], q[1]], d: q[2]};
  }
  if (p && (!s || p.d <= s.d + PARK_NAVIC_M)) return {auto: p.b, vstup: p.vstup, d: p.d, zdroj: 'evidované parkoviště'};
  if (s) return {auto: s.b, vstup: s.a, d: s.d, zdroj: 'okraj veřejné silnice nebo ulice'};
  return null;
}

async function zabagedDotaz(vrstva, par){
  const q = new URLSearchParams(Object.assign({
    inSR: '3857', outSR: '4326', spatialRel: 'esriSpatialRelIntersects', where: '1=1',
    outFields: 'OBJECTID', returnGeometry: 'true', resultRecordCount: '1500', f: 'geojson'
  }, par));
  const stop = new AbortController();
  const cas = setTimeout(() => stop.abort(), RUST_CEKANI);
  try {
    const res = await fetch(ZABAGED + vrstva + '/query?' + q.toString(), {signal: stop.signal});
    if (!res.ok) throw new Error('ČÚZK HTTP ' + res.status);
    const g = await res.json();
    return (g && g.features) || [];
  } finally { clearTimeout(cas); }
}

async function kdeZaparkovat(lat, lng, jmenoPorostu, idPorostu){
  banner('Hledám, kde se dá zaparkovat…', false, 20000);
  try {
    const R = rovina(lat);
    const bod = L.CRS.EPSG3857.project(L.latLng(lat, lng));
    /* 1) obrys porostu, ze kterého se ptáš. Podle čísla porostu, ne podle bodu:
       bod je první lomový bod obrysu, leží na hranici se sousedem a dotaz bodem
       vracel sousední porost (měřeno: 1,1 ha místo 138 ha). */
    let okraj = [[R.tam(lat, lng)]];
    try {
      const por = await zabagedDotaz(144, idPorostu
        ? {objectIds: String(idPorostu), maxAllowableOffset: String(4 / 111320)}
        : {geometry: bod.x + ',' + bod.y, geometryType: 'esriGeometryPoint', maxAllowableOffset: String(4 / 111320)});
      if (por.length && por[0].geometry) okraj = caryZGeometrie(por[0].geometry, R);
    } catch(e){ /* bez obrysu počítáme od bodu */ }
    /* 2) silnice a ulice kolem celého porostu */
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of okraj) for (const [x, y] of c){
      const [la, ln] = R.zpet(x, y); const p = L.CRS.EPSG3857.project(L.latLng(la, ln));
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
    }
    const kolem = 1500 / Math.cos(lat * Math.PI / 180);   // metry na mapě Mercatoru jsou natažené
    const obdelnik = {geometry: [minX - kolem, minY - kolem, maxX + kolem, maxY + kolem].join(','),
                      geometryType: 'esriGeometryEnvelope', maxAllowableOffset: String(8 / 111320)};
    const [silnice, ulice] = await Promise.all([
      zabagedDotaz(79, obdelnik).catch(() => []),
      zabagedDotaz(84, obdelnik).catch(() => [])
    ]);
    const cary = [];
    for (const f of silnice.concat(ulice)) cary.push(...caryZGeometrie(f.geometry, R));
    /* 3) evidovaná parkoviště, která má appka v telefonu */
    let parkoviste = [];
    try {
      const vse = await nactiMista();
      parkoviste = vse.filter(m => distM([lat, lng], [m.lat, m.lng]) <= PARK_OKOLI_M + 3000).map(m => R.tam(m.lat, m.lng));
    } catch(e){}
    const v = vyberParkovani(okraj, cary, parkoviste);
    if (!v){
      banner('<b>Poblíž tohohle porostu nemám ani parkoviště, ani veřejnou silnici.</b> ' +
             'Zkus jiný porost – k tomuhle se autem nedostaneš.', true, 12000);
      return;
    }
    const auto = R.zpet(v.auto[0], v.auto[1]), vstup = R.zpet(v.vstup[0], v.vstup[1]);
    if (parkVrstva) map.removeLayer(parkVrstva);
    parkVrstva = L.layerGroup([
      L.polyline([auto, vstup], {color:'#c2701a', weight:3, dashArray:'6,6', opacity:.9}),
      L.circleMarker(vstup, {radius:6, color:'#fff', weight:2, fillColor:'#2e7d4f', fillOpacity:1}),
      L.circleMarker(auto, {radius:9, color:'#fff', weight:3, fillColor:'#c2701a', fillOpacity:1})
        .bindPopup('<div class="pop"><h3>Zaparkuj tady</h3>' +
          '<div class="sub">' + v.zdroj + '</div>' +
          '<table><tr><td>K okraji lesa</td><td><b>' + fmtDist(v.d) + '</b> vzdušnou čarou</td></tr></table>' +
          '<div class="sub">Zelená tečka je místo, kde do lesa vejdeš. Jestli je tam zákaz vjezdu nebo závora, ' +
          'appka o něm neví – to uvidíš na místě.</div></div>', POPOPT)
    ]).addTo(map);
    document.getElementById('btnZrusPark').hidden = false;
    map.fitBounds(L.latLngBounds([auto, vstup]).pad(0.6), {maxZoom: 17});
    banner('<b>Zaparkuj ' + fmtDist(v.d) + ' od okraje lesa</b> · ' + v.zdroj +
           (jmenoPorostu ? ' (' + jmenoPorostu + ')' : '') +
           '. Čárkovaná vede od auta ke vstupu do lesa, zrušíš ji křížkem vpravo nahoře.', false, 12000);
  } catch(e){
    banner('<b>Parkování se nepodařilo najít.</b> ' + e.message, true, 9000);
  }
}
