async function najdiLesTady(){   // nova-v8: proč takhle, viz komentář pod funkcí
  const b = $('btnSber');
  b.disabled = true;
  const puvodni = b.innerHTML;
  b.innerHTML = '<svg class="ik"><use href="#i-les"/></svg>Hledám les s cestami…';
  try {
    /* Na GPS se čeká nejvýš tři vteřiny, pak se bere střed mapy. */
    const zaloha = map.getZoom() >= 10 ? map.getCenter() : L.latLng(HOME[0], HOME[1]);
    const stred = await Promise.race([
      getPositionOnce().then(p => L.latLng(p.lat, p.lng)).catch(() => zaloha),
      new Promise(res => setTimeout(() => res(zaloha), 3000))
    ]);
    const bod = [stred.lat, stred.lng];
    const vyber = kandidatiNajdi(await nactiMista(), bod);
    if (!vyber.length){
      map.setView(stred, 14);
      banner('<b>Do ' + Math.round(LES_OKOLI_M / 1000) + ' km nemám parkoviště u lesa, který by té houbě seděl.</b> ' +
             'Podívej se na mapě po tabulkách 1, 2, 3, nebo zkus „Kam dnes na houby" – ta hledá po celé ČR.', false, 12000);
      return;
    }
    let i = 0;
    const prac = async () => { while (i < vyber.length){ const x = vyber[i++];
      try { x.cestyM = await cestyUMista(x.m); } catch(e){ x.cestyM = null; } } };
    await Promise.all([prac(), prac(), prac()]);
    for (const x of vyber){
      const c = x.cestyM == null ? 0.5 : 0.15 + 0.85 * Math.min(x.cestyM, ZACIT_CESTY_STROP_M) / ZACIT_CESTY_STROP_M;
      x.poradi = x.zaklad * c;
    }
    vyber.sort((a, b) => b.poradi - a.poradi);
    const nej = vyber[0], m = nej.m;

    if (parkVrstva) map.removeLayer(parkVrstva);
    const cestyTxt = nej.cestyM == null ? 'cesty se nepodařilo načíst'
                   : nej.cestyM >= ZACIT_CESTY_STROP_M ? '3+ km cest ve vhodném lese'
                   : (nej.cestyM / 1000).toFixed(1).replace('.', ',') + ' km cest ve vhodném lese';
    const nalTxt = nej.nalezy.blizko ? ' · vaše nálezy: ' + nej.nalezy.blizko + ' do 300 m' : '';
    parkVrstva = L.layerGroup([
      /* špendlík, ne kolečko: kolečko leželo pod fialovou tečkou parkoviště a nebylo vidět */
      L.marker([m.lat, m.lng], {icon: pinIcon('park', 'P', 30), zIndexOffset: 400})
        .bindPopup('<div class="pop"><h3>Zaparkuj tady</h3>' +
          '<div class="sub">Parkoviště u lesa · ' + fmtDist(nej.km * 1000) + ' odsud vzdušnou čarou</div>' +
          '<table><tr><td>Do 750 m</td><td><b>' + cestyTxt + '</b></td></tr>' +
          (nej.nalezy.blizko ? '<tr><td>Vaše nálezy</td><td><b>' + nej.nalezy.blizko + '</b> do 300 m</td></tr>' : '') +
          '</table><div class="sub">Červené čáry jsou cesty ve vhodném lese – tudy jít. Jestli je u parkoviště ' +
          'zákaz vjezdu nebo závora, appka o něm neví.</div></div>', POPOPT)
    ]).addTo(map);
    document.getElementById('btnZrusPark').hidden = false;
    map.setView([m.lat, m.lng], 15);
    banner('<b>Zaparkuj u P, ' + fmtDist(nej.km * 1000) + ' odsud.</b> Do 750 m ' + cestyTxt + nalTxt +
           '. Jdi po červených.', false, 12000);
  } catch(e){
    banner('<b>Les se nepodařilo najít.</b> ' + e.message + ' Zkus to, až budeš mít signál.', true, 9000);
  } finally {
    b.disabled = false;
    b.innerHTML = puvodni;
  }
}

/* ============================================================
   nova-v8: NAJDI LES KOLEM MĚ – STEJNÉ MĚŘÍTKO JAKO „KDE ZAČÍT"

   Dřív: 40 největších vhodných porostů do 15 km (řazeno podle plochy),
   z nich ten s nejlepším druhem, výškou a okrajem, a skok doprostřed
   porostu – často kilometr od silnice, bez ohledu na cesty. Právě
   druh a výška porostu se na nálezech nepotvrdily (AUC 0,57), cesty
   ano (2,4×) a vaše dřívější nálezy taky (14× do 100 m).

   Teď: evidovaná parkoviště u lesa do 15 km (stejná jako v Kam dnes),
   předřazená podle porostu kolem, blízkosti, vašich nálezů a oblíbených;
   u dvanácti nejlepších se stáhnou cesty ve vhodném lese do 750 m
   (jedna vycházka) a o pořadí rozhodnou ony. Mapa skočí na parkoviště,
   kde je auto u lesa a cesty hned vedle; tabulky „kde začít" se
   dokreslí samy.
   ============================================================ */
const NAJDI_KANDIDATU = 12;

/* Hodnota parkoviště bez počasí (počasí je v okolí 15 km stejné). */
function zakladNajdi(m, stred){
  const podil = FILTR.druh === 'bedly' ? m.list
              : FILTR.druh === 'vse' ? Math.max(m.jehl, m.list)
              : (preferujeListnate(FILTR.druh) ? m.list : m.jehl);
  const porost = 0.25 + 0.75 * Math.min(1, podil / 85);
  const km = distM(stred, [m.lat, m.lng]) / 1000;
  const blizko = 1 - Math.min(0.5, km / 30);
  const nalezy = bonusNalezu([m.lat, m.lng]);
  const obl = jeOblibene('bod:' + m.id) ? 0.15 : 0;
  const v = vychazkyOkolo(m.lat, m.lng, 700);
  const prazdno = (!nalezy.blizko && v.naprazdno >= 2) ? 1 - Math.min(0.2, (v.naprazdno - 1) * 0.07) : 1;
  return {m, km, nalezy, zaklad: porost * blizko * (1 + Math.min(0.6, 0.4 * nalezy.bonus) + obl) * prazdno};
}

/* Kandidáti do LES_OKOLI_M, filtry porostu a houby jako v Kam dnes. */
function kandidatiNajdi(vse, stred){
  return vse.filter(m => m.cest >= 1 && sedíPorost(m) && sedíDruh(m) && distM(stred, [m.lat, m.lng]) <= LES_OKOLI_M)
            .map(m => zakladNajdi(m, stred))
            .sort((a, b) => b.zaklad * (0.7 + 0.3 * Math.min(1, b.m.cest / 8)) - a.zaklad * (0.7 + 0.3 * Math.min(1, a.m.cest / 8)))
            .slice(0, NAJDI_KANDIDATU);
}
