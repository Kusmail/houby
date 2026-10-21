/* ============================================================
   nova-v6: KAM DNES – MÍSTO PODLE CEST, POČASÍ ROZHODNE „JESTLI"

   Ověřeno na nálezech s přesným dnem (audit-model-2026-10-21.md, v6):
   – KDY: na 399 nálezech (2015–2025) mají „podmínky" (déšť × teplota ×
     sezóna) v den nálezu vyšší hodnotu než jiné dny sezóny na stejném
     místě s AUC 0,747 (95% CI 0,719–0,771); samotný déšť 0,644.
   – KAM: týž den proti parkovištím u lesa 20–80 km od nálezu jen
     0,527 (0,501–0,558) – skoro náhoda. Počasí neumí vybrat místo
     v dosahu hodiny jízdy; umí říct, jestli vůbec jet.
   Pořadí míst proto dělá totéž měřítko jako mapa a tabulky „kde
   začít": kolik cest ve vhodném lese je do 750 m od parkoviště (nejvýš
   3 km), k tomu dojezd, porost kolem, vaše nálezy, oblíbená a prázdné
   vycházky (sMisto). Počasí a sezóna rozhodují, jestli jet vůbec,
   a místo jen sesadí, když tam vyloženě nepršelo.
   ============================================================ */
const KAM_KANDIDATU = 12;            // u kolika nejlepších míst se dopočítají cesty (4 dotazy na ČÚZK za místo)
const KAM_SUCHO = 0.3;               // index vlhkosti, pod kterým je místo „suché"
const mistoCestyCache = new Map();

async function cestyUMista(m){
  const klic = (m.id || (m.lat.toFixed(4) + ',' + m.lng.toFixed(4))) + '|' + FILTR.druh + '|' + FILTR.porost;
  if (mistoCestyCache.has(klic)) return mistoCestyCache.get(klic);
  const p = L.CRS.EPSG3857.project(L.latLng(m.lat, m.lng));
  const r = (ZACIT_OKOLI_M + 250) / Math.cos(m.lat * Math.PI / 180);
  const por = await zabagedDotaz(144, {geometry: [p.x - r, p.y - r, p.x + r, p.y + r].join(','), geometryType: 'esriGeometryEnvelope',
    where: 'Shape_Area > 2000', outFields: 'OBJECTID,druh_p,vyska_p,Shape_Area,Shape_Length', maxAllowableOffset: String(8 / 111320)});
  const vhodne = por.filter(f => {
    const a = f.properties || {}, druh = a.druh_p || 'bez určení', vyska = a.vyska_p || 'bez určení';
    if (!porostSedi(druh) || !(a.Shape_Area > 0)) return false;
    const okraj = Math.max(0, Math.min(1, (a.Shape_Length || 0) * 25 / a.Shape_Area));
    return vhodnostPorostu(druh, vyska) * vahaOkraje(okraj) >= 0.7;
  });
  const meze = L.latLngBounds(L.CRS.EPSG3857.unproject(L.point(p.x - r, p.y - r)), L.CRS.EPSG3857.unproject(L.point(p.x + r, p.y + r)));
  const o = orezCesty(await stahniCesty(meze), vhodne);
  const v = cestyKolem([m.lat, m.lng], o.cary, ZACIT_OKOLI_M);
  if (mistoCestyCache.size > 300) mistoCestyCache.clear();
  mistoCestyCache.set(klic, v);
  return v;
}

/* Pořadí: sMisto (porost, dojezd, nálezy…) × cesty; sucho místo sesadí na polovinu.
   Bez cest (server neodpověděl) má místo neutrální váhu 0,5, ať nevypadne. */
async function seradKamDnes(hodnocena){
  const vyber = hodnocena.slice().sort((a, b) => b.sMisto - a.sMisto).slice(0, KAM_KANDIDATU);
  let i = 0;
  const prac = async () => { while (i < vyber.length){ const x = vyber[i++];
    try { x.cestyM = await cestyUMista(x.m); } catch(e){ x.cestyM = null; } } };
  await Promise.all([prac(), prac(), prac()]);
  for (const x of vyber){
    const c = x.cestyM == null ? 0.5 : 0.15 + 0.85 * Math.min(x.cestyM, ZACIT_CESTY_STROP_M) / ZACIT_CESTY_STROP_M;
    x.sucho = x.vlhkost < KAM_SUCHO;
    x.poradiSkore = x.sMisto * c * (x.sucho ? 0.5 : 1);
  }
  return vyber.sort((a, b) => b.poradiSkore - a.poradiSkore);
}
function medianPocasi(hodnocena){
  const v = hodnocena.map(x => x.sPocasi).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : 0;
}
