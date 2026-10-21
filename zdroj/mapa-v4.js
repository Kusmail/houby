/* ============================================================
   nova-v4: MAPA ŘÍKÁ PRAVDU – VHODNÝ POROST A CESTY V NĚM

   Audit 21. 10. 2026 (audit-model-2026-10-21.md): pět stupňů barvy
   tvrdilo „dobré" o 95 % lesa (medián 16 výřezů, filtr Vše). Mapy
   ČÚZK znají jen tři druhy porostu a čtyři výšky, takže porosty
   v okolí od sebe odlišit neumí (AUC 0,57; lesní typ NLI 0,53).
   Jediný silný signál na 1 012 přesných nálezech byla cesta: do
   15 m od ní 2,4× víc nálezů než v okolním lese.

   Mapa proto ukazuje jen to, co ví:
   – světle zelená = porost, kde vybraná houba může růst (druh
     a výška lesa podle ZABAGED, stejné tabulky jako dosud),
   – červená čára = cesta (ZABAGED: cesta, pěšina, neevidovaná
     silnice) UVNITŘ takového porostu. Tudy jít.
   Nevhodný les zůstává bez barvy.
   ============================================================ */
const CESTY_VRSTVY = [83, 82, 80];        // Cesta, Pěšina, Silnice neevidovaná
const cestyCache = new Map();

async function stahniCesty(meze){
  const sw = L.CRS.EPSG3857.project(meze.getSouthWest()), ne = L.CRS.EPSG3857.project(meze.getNorthEast());
  const klic = [sw.x, sw.y, ne.x, ne.y].map(v => Math.round(v / 50)).join(',');
  if (cestyCache.has(klic)) return cestyCache.get(klic);
  const par = {geometry: [sw.x, sw.y, ne.x, ne.y].join(','), geometryType: 'esriGeometryEnvelope',
               maxAllowableOffset: String(6 / 111320), resultRecordCount: '2000'};
  const vysl = await Promise.all(CESTY_VRSTVY.map(v => zabagedDotaz(v, par).catch(() => null)));
  if (vysl.every(x => x === null)) throw new Error('cesty se nenačetly');
  const cary = [];
  for (const fe of vysl) for (const f of (fe || [])){
    const g = f.geometry; if (!g) continue;
    if (g.type === 'LineString') cary.push(g.coordinates);
    else if (g.type === 'MultiLineString') g.coordinates.forEach(c => cary.push(c));
  }
  if (cestyCache.size > 8) cestyCache.clear();
  cestyCache.set(klic, cary);
  return cary;
}

/* bod v polygonu (GeoJSON, [lng, lat]) – paprsek */
function vKruhu(x, y, ring){
  let uvnitr = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++){
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) uvnitr = !uvnitr;
  }
  return uvnitr;
}
function pripravPolygony(features){
  return features.map((f, idx) => {
    const g = f.geometry, polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const p of polys) for (const [x, y] of p[0]){ minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
    return {f, polys, minx, miny, maxx, maxy};
  });
}
function vPorostu(x, y, P){
  for (const p of P){
    if (x < p.minx || x > p.maxx || y < p.miny || y > p.maxy) continue;
    for (const poly of p.polys){
      if (!vKruhu(x, y, poly[0])) continue;
      let dira = false;
      for (let h = 1; h < poly.length; h++) if (vKruhu(x, y, poly[h])){ dira = true; break; }
      if (!dira) return p;
    }
  }
  return null;
}
/* Kusy cest, které leží ve vhodném porostu nebo vedou po jeho okraji.
   Lesní cesta většinou odděluje dva porosty – leží PŘESNĚ na hranici,
   takže test „střed úseku uvnitř" padal střídavě dovnitř a ven a z cesty
   zbyly čárky. Úsek se proto dělí na kusy do 40 m a kus se bere, když je
   uvnitř jeho střed nebo bod 12 m vlevo či vpravo od něj. */
const CESTA_KUS_M = 40, CESTA_OKRAJ_M = 12;
function orezCesty(cary, vhodne){
  const P = pripravPolygony(vhodne);
  const ven = [];
  let celkem = 0;
  for (const c of cary){
    let kus = null;
    for (let i = 1; i < c.length; i++){
      const a = c[i - 1], b = c[i];
      const kx = 111320 * Math.cos(a[1] * Math.PI / 180), ky = 110540;
      const dx = (b[0] - a[0]) * kx, dy = (b[1] - a[1]) * ky, delka = Math.hypot(dx, dy);
      if (!delka) continue;
      const n = Math.max(1, Math.ceil(delka / CESTA_KUS_M));
      const nx = -dy / delka * CESTA_OKRAJ_M / kx, ny = dx / delka * CESTA_OKRAJ_M / ky;   // kolmice ve stupních
      for (let k = 0; k < n; k++){
        const t0 = k / n, t1 = (k + 1) / n, tm = (t0 + t1) / 2;
        const p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0];
        const p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1];
        const mx = a[0] + (b[0] - a[0]) * tm, my = a[1] + (b[1] - a[1]) * tm;
        const p = vPorostu(mx, my, P) || vPorostu(mx + nx, my + ny, P) || vPorostu(mx - nx, my - ny, P);
        if (p){
          const d = delka / n;
          celkem += d;
          p.f.properties._cestyM = (p.f.properties._cestyM || 0) + d;
          if (!kus){ kus = [[p0[1], p0[0]]]; ven.push(kus); }
          kus.push([p1[1], p1[0]]);
        } else kus = null;
      }
    }
  }
  return {cary: ven, delkaM: celkem};
}

function popisVhodnehoPorostu(ft, jmenoHouby){
  const a = ft.properties || {};
  const druh = a.druh_p || 'bez určení', vyska = a.vyska_p || 'bez určení';
  const cesty = a._cestyM || 0;
  return '<div class="pop"><h3>Vhodný porost</h3>' +
    '<div class="sub">pro ' + esc(jeSkupina(FILTR.druh)
      ? ((HOUBY[houbaZaSkore(druh, vyska)] || {}).kratce || jmenoHouby) : jmenoHouby) + '</div>' +
    '<div class="sub">' + druhSlovy(druh) +
      (vyska === 'bez určení' ? ' porost, výška neurčená' : ' porost, ' + esc(vyska)) + '</div>' +
    '<table>' +
    '<tr><td>Cesty v porostu</td><td><b>' + (cesty ? fmtDist(cesty) : 'žádné v mapě') + '</b></td></tr>' +
    '<tr><td>Plocha</td><td>' + (a._ha < 10 ? a._ha.toFixed(1).replace('.', ',') : Math.round(a._ha)) + ' ha</td></tr>' +
    '<tr><td>Co tu bývá</td><td>' + ((CO_TAM_ROSTE[druh] || {})[vyska] || 'podle porostu') + '</td></tr>' +
    '</table>' +
    '<button class="popbtn" data-park="' + a._lat + ',' + a._lng + '" data-obj="' + (a.OBJECTID || '') + '"><svg class="ik"><use href="#i-auto"/></svg>Kde zaparkovat</button>' +
    '<div class="sub">' + (cesty
      ? 'Jdi po <b>červených cestách</b>: u cest se v 1 012 ověřených nálezech našlo 2,4× víc hub než v okolním lese.'
      : 'V mapě tu není žádná cesta. Porost je vhodný podle druhu a výšky lesa, víc o něm mapy neříkají.') +
    '</div></div>';
}
