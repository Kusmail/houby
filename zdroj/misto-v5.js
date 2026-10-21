/* ============================================================
   nova-v5: KDE ZAČÍT – PODLE CEST A PŘÍSTUPU, NE PODLE PLOCHY

   Audit 21. 10. 2026, bod 2: porostů se stejným nejvyšším skóre
   bylo ve výřezu v mediánu 30 a č. 1 byl ze shodných vždycky ten
   největší – rozhodovala plocha. Teď rozhoduje to, co měření
   podpořilo, a to, co houbař potřebuje:
   – kolik cest ve vhodném lese je do 750 m od místa, kde do lesa
     vejdeš (u cest 2,4× víc nálezů). Počítá se jen okolí vstupu, ne
     celý porost: první verze brala cesty celého porostu a č. 1 byl
     pak největší vhodný les ve 13 ze 16 výřezů – plocha rozhodovala
     ještě víc než dřív,
     započítají se nejvýš 3 km – víc za jednu vycházku neujdeš
     (bez stropu vyhrávala místa se 7 km cest 370 m od silnice),
   – jak daleko je k lesu od veřejné silnice: do 150 m plná váha,
     do 1 km klesá na 40 %, dál se místo nenabízí. Při shodě
     vyhraje bližší.
   Tabulka stojí u vstupu do lesa od silnice.
   ============================================================ */
const ZACIT_OKOLI_M = 750, ZACIT_CESTY_STROP_M = 3000, ZACIT_PLNY_PRISTUP_M = 150, ZACIT_MAX_PRISTUP_M = 1000;
let cestyVhodne = [];      // zvýrazněné cesty z posledního kreslení (orezCesty)
const silniceCache = new Map();

async function stahniSilnice(meze){
  const sw = L.CRS.EPSG3857.project(meze.getSouthWest()), ne = L.CRS.EPSG3857.project(meze.getNorthEast());
  const kolem = 1200 / Math.cos(meze.getCenter().lat * Math.PI / 180);
  const klic = [sw.x, sw.y, ne.x, ne.y].map(v => Math.round(v / 50)).join(',');
  if (silniceCache.has(klic)) return silniceCache.get(klic);
  const par = {geometry: [sw.x - kolem, sw.y - kolem, ne.x + kolem, ne.y + kolem].join(','),
               geometryType: 'esriGeometryEnvelope', maxAllowableOffset: String(8 / 111320), resultRecordCount: '2000'};
  const [s, u] = await Promise.all([zabagedDotaz(79, par), zabagedDotaz(84, par)]);
  const vysl = s.concat(u);
  if (silniceCache.size > 8) silniceCache.clear();
  silniceCache.set(klic, vysl);
  return vysl;
}

/* délka zvýrazněných cest do r metrů od bodu (kus se počítá, když v okruhu leží jeho střed) */
function cestyKolem(bod, cary, r){
  let m = 0;
  for (const c of cary) for (let i = 1; i < c.length; i++){
    const a = c[i - 1], b = c[i], s = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (Math.abs(s[0] - bod[0]) > r / 110540 || distM(bod, s) > r) continue;
    m += distM(a, b);
  }
  return m;
}
/* Vybere až tři místa. vhodne: porosty s _cestyM (z orezCesty), cary: zvýrazněné cesty [[lat,lng]…].
   silnice: GeoJSON features nebo null (nenačtené – pak se bere jen okolí okraje).
   Vrací [{f, cestyM, pristupM, vstup:[lat,lng], hodnota}]. */
function vyberMistaZacit(vhodne, silnice, lat0, cary, vidno){
  const R = rovina(lat0);
  const silCary = [];
  if (silnice) for (const f of silnice) for (const c of caryZGeometrie(f.geometry, R)){
    let a = Infinity, b = Infinity, x = -Infinity, y = -Infinity;
    for (const [px, py] of c){ a = Math.min(a, px); b = Math.min(b, py); x = Math.max(x, px); y = Math.max(y, py); }
    silCary.push({c, a, b, x, y});
  }
  const kandidati = vhodne.filter(f => (f.properties._cestyM || 0) >= 150)
    .sort((p, q) => (q.properties._cestyM || 0) - (p.properties._cestyM || 0)).slice(0, 60);
  const hodnocene = [];
  for (const f of kandidati){
    const okraj = caryZGeometrie(f.geometry, R);
    let a = Infinity, b = Infinity, x = -Infinity, y = -Infinity;
    for (const c of okraj) for (const [px, py] of c){ a = Math.min(a, px); b = Math.min(b, py); x = Math.max(x, px); y = Math.max(y, py); }
    let pristupM = null, vstup = null;
    if (silnice){
      const blizke = silCary.filter(s => s.x >= a - ZACIT_MAX_PRISTUP_M && s.a <= x + ZACIT_MAX_PRISTUP_M &&
                                      s.y >= b - ZACIT_MAX_PRISTUP_M && s.b <= y + ZACIT_MAX_PRISTUP_M).map(s => s.c);
      const d = blizke.length ? nejblizDvojice(okraj, blizke) : null;
      if (!d || d.d > ZACIT_MAX_PRISTUP_M) continue;              // k lesu se autem nedostaneš
      pristupM = d.d; vstup = R.zpet(d.a[0], d.a[1]);
    } else {
      vstup = R.zpet(okraj[0][0][0], okraj[0][0][1]);
    }
    const vaha = pristupM === null || pristupM <= ZACIT_PLNY_PRISTUP_M ? 1
      : 1 - 0.6 * (pristupM - ZACIT_PLNY_PRISTUP_M) / (ZACIT_MAX_PRISTUP_M - ZACIT_PLNY_PRISTUP_M);
    if (vidno && !vidno.contains(vstup)) continue;          // tabulka musí být na obrazovce
    const cestyM = cestyKolem(vstup, cary, ZACIT_OKOLI_M);
    hodnocene.push({f, cestyM, pristupM, vstup, hodnota: Math.min(cestyM, ZACIT_CESTY_STROP_M) * vaha});
  }
  hodnocene.sort((p, q) => q.hodnota - p.hodnota || (p.pristupM || 0) - (q.pristupM || 0));
  const vybrana = [];
  for (const m of hodnocene){
    if (vybrana.length >= 3) break;
    if (vybrana.some(z => distM(z.vstup, m.vstup) < 400)) continue;
    vybrana.push(m);
  }
  return vybrana;
}

function kresliMistaZacit(vybrana, jmenoHouby){
  const km = (m) => m < 1000 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toFixed(1).replace('.', ',') + ' km';
  vybrana.forEach((m, i) => {
    const a = m.f.properties, druh = a.druh_p || 'bez určení', vyska = a.vyska_p || 'bez určení';
    L.marker(m.vstup, {
      icon: L.divIcon({className:'', iconSize:[104,44], iconAnchor:[52,22],
        html:'<div class="cilmapa' + (i === 0 ? ' prvni' : '') + '">' +
          (i === 0 ? '<svg class="krouzek" viewBox="0 0 120 60" preserveAspectRatio="none" aria-hidden="true"><path d="M8 32 C 6 12,40 4,80 6 C 106 8,118 18,116 32 C 114 50,70 58,36 54 C 14 52,4 44,10 24"/></svg>' : '') +
          '<span class="tab"><b>' + (i + 1) + '</b>' + (m.cestyM >= ZACIT_CESTY_STROP_M ? '3+ km' : km(m.cestyM)) + '</span></div>'}),
      zIndexOffset: 950
    }).bindPopup('<div class="pop"><h3>' + (i + 1) + '. místo, kde začít</h3>' +
      '<div class="sub">' + druhSlovy(druh) + (vyska === 'bez určení' ? ' porost' : ' porost, ' + esc(vyska)) +
        ' · vhodný pro ' + esc(jeSkupina(FILTR.druh) ? ((HOUBY[houbaZaSkore(druh, vyska)] || {}).kratce || jmenoHouby) : jmenoHouby) + '</div>' +
      '<table>' +
      '<tr><td>Cesty ve vhodném lese</td><td><b>' + km(m.cestyM) + '</b> do 750 m od vstupu</td></tr>' +
      '<tr><td>Od silnice</td><td>' + (m.pristupM === null ? 'nezjištěno' : m.pristupM < 15 ? '<b>les začíná u silnice</b>' : '<b>' + km(m.pristupM) + '</b> k okraji lesa') + '</td></tr>' +
      '<tr><td>Plocha porostu</td><td>' + (a._ha < 10 ? a._ha.toFixed(1).replace('.', ',') : Math.round(a._ha)) + ' ha</td></tr>' +
      '</table>' +
      '<button class="popbtn" data-park="' + m.vstup[0] + ',' + m.vstup[1] + '" data-obj="' + (a.OBJECTID || '') + '"><svg class="ik"><use href="#i-auto"/></svg>Kde zaparkovat</button>' +
      '<p class="pozn" style="margin:10px 0 0">Pořadí: kolik cest ve vhodném lese je do 750 m od vstupu ' +
      'a jak blízko je k lesu od silnice. Velikost lesa nerozhoduje.</p></div>', POPOPT)
      .addTo(zacniTadyVrstva);
  });
}
