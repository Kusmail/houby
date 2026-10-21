/* ============================================================
   nova-v7: VAŠE NÁLEZY A PRÁZDNÉ VYCHÁZKY POSOUVAJÍ CESTY

   Ověřeno na nálezech z GBIF jako náhradě za rodinná data
   (audit-model-2026-10-21.md, v7): nový nález leží do 100 m od
   dřívějšího nálezu téže skupiny hub ve 14 % případů, náhodný les
   v okolí jen v 1 %; do 300 m 24 % proti 8 %, do 750 m 39 % proti
   27 % (AUC 0,636, 758 párů). Podle stáří: 1–2 roky AUC 0,618,
   3–5 let 0,603, 6 a víc let 0,525. (Pozor, oprava: dosavadní
   vahaStari ubírá polovinu za ŠEST let, ne za rok, jak jsem napsal
   nejdřív – změřenému úbytku zhruba odpovídá. Nové váhy jsou jiný,
   podobně silný tvar, ne oprava příliš rychlého stárnutí.)
   Proto:
   – váha nálezu podle vzdálenosti: do 100 m 1, do 300 m 0,6,
     do 750 m 0,1; podle stáří: do 2,5 roku 1, do 5,5 roku 0,7,
     starší 0,3,
   – cesty do 300 m od nálezu rodiny mají na mapě žlutý okraj,
   – cesty, kudy někdo z rodiny v posledních 21 dnech prošel celou
     vycházku bez nálezu („zapsal jsem všechno"), jsou šedé
     a čárkované. Po 7 dnech jejich váha slábne, po 21 dnech zmizí:
     po dalším dešti tam houby být můžou. (Tohle ověřit nejde – na
     prázdné vycházky žádná veřejná data nejsou.)
   ============================================================ */
const NAL_VZD = [[100, 1], [300, 0.6], [750, 0.1]];
const PRAZDNA_DNI = 21, PRAZDNA_PLNE_DNI = 7, PRAZDNA_DOSAH_M = 30;

function vahaStariV7(ts){
  const roky = (Date.now() - (ts || 0)) / (365.25 * 864e5);
  return roky <= 2.5 ? 1 : roky <= 5.5 ? 0.7 : 0.3;
}
/* Součet vah nálezů rodiny kolem bodu [lat, lng]. */
function bonusNalezu(bod, nalezy){
  let bonus = 0, blizko = 0, posledni = 0;
  for (const z of (nalezy || vsechnyNalezy())){
    if (Math.abs(z.lat - bod[0]) > 0.008) continue;
    const d = distM(bod, [z.lat, z.lng]);
    const w = d <= NAL_VZD[0][0] ? NAL_VZD[0][1] : d <= NAL_VZD[1][0] ? NAL_VZD[1][1] : d <= NAL_VZD[2][0] ? NAL_VZD[2][1] : 0;
    if (!w) continue;
    bonus += w * vahaStariV7(z.ts);
    if (d <= 300){ blizko++; posledni = Math.max(posledni, z.ts || 0); }
  }
  return {bonus, blizko, posledni};
}
/* Nedávné úplné vycházky bez nálezu (vlastní i sdílené) jako body [lat, lng] s vahou. */
function prazdneVychazky(){
  const out = [];
  const zpracuj = (t) => {
    if (!t || !Array.isArray(t.body) || !t.body.length) return;
    if (!(t.uplna === true && (t.nalezu || 0) === 0)) return;
    const dny = (Date.now() - (t.ts || 0)) / 864e5;
    if (dny < 0 || dny > PRAZDNA_DNI) return;
    const w = dny <= PRAZDNA_PLNE_DNI ? 1 : 1 - (dny - PRAZDNA_PLNE_DNI) / (PRAZDNA_DNI - PRAZDNA_PLNE_DNI);
    const body = t.body.map(b => [typeof b.a === 'number' ? b.a : b.lat, typeof b.o === 'number' ? b.o : b.lng])
                       .filter(b => typeof b[0] === 'number' && typeof b[1] === 'number');
    if (body.length) out.push({w, dny, ts: t.ts || 0, body});
  };
  ulozeneTrasy().forEach(zpracuj);
  const ciz = state.tracks || {};
  Object.keys(ciz).forEach(uid => { if (uid !== state.uid) Object.keys(ciz[uid] || {}).forEach(id => zpracuj(ciz[uid][id])); });
  return out;
}
/* Rozdělí zvýrazněné cesty (orezCesty) na úseky u nálezů, prošlé naprázdno a ostatní. */
function rozdelCesty(cary, nalezy, prazdne){
  const tridy = {bezne: [], nalez: [], prosle: []};
  const kx = (lat) => 111320 * Math.cos(lat * Math.PI / 180);
  /* nejsilnější prázdná vycházka u úseku – ale jen ta, po které tu nikdo nic nenašel:
     novější nález do 300 m prázdnou vycházku přebije */
  const prosleW = (s, posledniNalez) => {
    let w = 0;
    for (const v of prazdne){
      if (posledniNalez > v.ts) continue;
      for (const b of v.body){
        if (Math.abs(b[0] - s[0]) > 0.0005) continue;
        if (Math.hypot((b[0] - s[0]) * 110540, (b[1] - s[1]) * kx(s[0])) <= PRAZDNA_DOSAH_M){ w = Math.max(w, v.w); break; }
      }
    }
    return w;
  };
  for (const c of cary){
    let tr = null, kus = null;
    for (let i = 1; i < c.length; i++){
      const a = c[i - 1], b = c[i], s = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const bn = nalezy.length ? bonusNalezu(s, nalezy) : {blizko: 0, posledni: 0};
      const t = (prazdne.length && prosleW(s, bn.blizko ? bn.posledni : 0) >= 0.5) ? 'prosle'
              : bn.blizko ? 'nalez' : 'bezne';
      if (t !== tr || !kus){ kus = [a]; tridy[t].push(kus); tr = t; }
      kus.push(b);
    }
  }
  return tridy;
}
let cestyTridy = {bezne: [], nalez: [], prosle: []};

function kresliCestyV7(cary){
  const nalezy = vsechnyNalezy(), prazdne = prazdneVychazky();
  cestyTridy = rozdelCesty(cary, nalezy, prazdne);
  const t = cestyTridy, opt = {renderer: rustPlatno, interactive: false};
  if (t.nalez.length) L.polyline(t.nalez, Object.assign({color: '#f2c200', weight: 11, opacity: .9}, opt)).addTo(rustVrstva);
  const cervene = t.bezne.concat(t.nalez);
  if (cervene.length){
    L.polyline(cervene, Object.assign({color: '#fffdf6', weight: 7, opacity: .85}, opt)).addTo(rustVrstva);
    L.polyline(cervene, Object.assign({color: '#b83a26', weight: 3.5, opacity: .95}, opt)).addTo(rustVrstva);
  }
  if (t.prosle.length){
    L.polyline(t.prosle, Object.assign({color: '#fffdf6', weight: 6, opacity: .7}, opt)).addTo(rustVrstva);
    L.polyline(t.prosle, Object.assign({color: '#6b665c', weight: 3, opacity: .9, dashArray: '3 7'}, opt)).addTo(rustVrstva);
  }
}
/* Podíl cest kolem bodu, které byly nedávno prošlé naprázdno (0–1). */
function podilProsleho(bod){
  const vse = cestyKolem(bod, cestyTridy.bezne.concat(cestyTridy.nalez, cestyTridy.prosle), ZACIT_OKOLI_M);
  return vse ? cestyKolem(bod, cestyTridy.prosle, ZACIT_OKOLI_M) / vse : 0;
}
