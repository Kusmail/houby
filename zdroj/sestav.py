#!/usr/bin/env python3
# Sestaví appku na hlavní adresu (index.html, sw.js, manifest.json v kořeni
# repozitáře) ze staré appky v134 (zdroj/zaklad/): hlavička a Leaflet beze
# změny, styly a kostra nové, logika převzatá s úpravami.
# Navíc vyrobí zálohu staré appky na stara/ a z nova/ udělá přesměrování.
# Použití: python3 zdroj/sestav.py houby-v135
import os, re, sys
TU = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.join(TU, '..')
ZAKLAD = os.path.join(TU, 'zaklad')
VERZE = sys.argv[1]
assert re.fullmatch(r'houby-v\d+[a-z]?', VERZE), 'verze ve tvaru houby-v135'
s = open(os.path.join(ZAKLAD, 'index.html'), encoding='utf-8').read()
ZAKLAD_HTML = s
css = open(os.path.join(TU, 'styl.css'), encoding='utf-8').read()
kostra = open(os.path.join(TU, 'kostra.html'), encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:100])
    s = s.replace(a, b)

def mezi(zacatek, konec, nove, vcetneKonce=False):
    global s
    i = s.index(zacatek); j = s.index(konec, i)
    if vcetneKonce: j += len(konec)
    s = s[:i] + nove + s[j:]

# ---------- hlavička ----------
rep('<meta name="theme-color" content="#2e5c3a">', '<meta name="theme-color" content="#f6f2e9" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#1f1d1a" media="(prefers-color-scheme: dark)">')

# ---------- styly: hlavní blok nahradit novým ----------
i = s.index('//# sourceMappingURL=leaflet.js.map</script>') + len('//# sourceMappingURL=leaflet.js.map</script>')
j = s.index('<style>', i); k = s.index('</style>', j) + len('</style>')
s = s[:j] + '<style>\n' + css + '</style>' + s[k:]

# ---------- kostra ----------
i = s.index('<div id="map"></div>')
j = s.index('<div class="modal" role="dialog" aria-modal="true" id="nameModal">')
s = s[:i] + kostra + s[j:]
rep(' <symbol id="i-foto" viewBox="0 0 24 24">', ' <symbol id="i-nahoru" viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></symbol>\n <symbol id="i-foto" viewBox="0 0 24 24">')

rep("const APP_VERZE = 'houby-v134';", "const APP_VERZE = '" + VERZE + "';")
assert re.search(r"const APP_VERZE = '" + re.escape(VERZE) + "'", s)

# ---------- ozubené kolo už není na mapě, je v menu ----------
mezi("const OvladacNastaveni = L.Control.extend({", "const OvladacZrus = L.Control.extend({",
     "/* Nová appka: Nastavení je dlaždice v menu, na mapě zůstávají jen Vrstvy. */\n")

# ---------- auto: dok a žlutý list ----------
rep("""    $('btnPark').style.display = '';
    $('carNav').style.display = 'none';
    if (typeof prepocitatPanel === 'function') prepocitatPanel(true);
    return;""", """    $('btnPark').hidden = false;
    $('btnAutoTab').hidden = true;
    $('autoModal').classList.remove('show');
    if (typeof prepocitatPanel === 'function') prepocitatPanel(true);
    return;""")
rep("""  $('btnPark').style.display = 'none';
  $('carNav').style.display = 'block';
  if (typeof renderPeopleList === 'function') renderPeopleList();""", """  $('btnPark').hidden = true;
  $('btnAutoTab').hidden = false;
  $('carNavOdkaz').href = 'https://www.google.com/maps/dir/?api=1&destination=' + c.lat + ',' + c.lng + '&travelmode=walking';
  if (typeof renderPeopleList === 'function') renderPeopleList();""")
rep("""    $('carDist').textContent = 'Auto';
    $('carDist').dataset.bez = '1';""", """    $('carDist').textContent = 'Auto';
    $('carDist').dataset.bez = '1';
    $('carDistDok').textContent = 'Auto';""")
rep("""  $('carDist').textContent = fmtDist(d);
  delete $('carDist').dataset.bez;""", """  $('carDist').textContent = fmtDist(d);
  delete $('carDist').dataset.bez;
  $('carDistDok').textContent = fmtDist(d);""")
rep("""  $('arrow').style.transform = 'rotate(' + rot + 'deg)';""", """  $('arrow').style.transform = 'rotate(' + rot + 'deg)';
  $('arrowDok').style.transform = 'rotate(' + rot + 'deg)';""")
rep("""  b.innerHTML = '<svg class="ik"><use href="#i-auto"/></svg><span class="pop2 autoKratky">Auto</span><span class="autoDlouhy">Označit auto</span>';""",
    """  b.innerHTML = '<svg class="ik"><use href="#i-auto"/></svg>Auto';""")
rep("""b.innerHTML = '<svg class="ik"><use href="#i-zamer"/></svg><span class="pop2">Zaměřuju</span>';""",
    """b.innerHTML = '<svg class="ik"><use href="#i-zamer"/></svg>Zaměřuju…';""")
rep("""$('btnPark').onclick = () => oznacAuto();""", """/* Nová appka: Auto v doku se nejdřív zeptá – klepnutí omylem by jinak
   přepsalo auto celé rodině. Se značkou auta dok ukazuje žlutou tabulku
   se vzdáleností a ta otevře žlutý list s šipkou. */
$('btnPark').onclick = () => $('autoOtazka').classList.add('show');
$('btnOznacit').onclick = () => { $('autoOtazka').classList.remove('show'); oznacAuto(); };
$('btnOznacitNe').onclick = () => $('autoOtazka').classList.remove('show');
$('btnAutoTab').onclick = () => { $('autoModal').classList.add('show'); initCompass(); if (state.car) updateCarNav(); };
$('autoZavrit').onclick = () => $('autoModal').classList.remove('show');""")
rep("""$('btnCar').onclick = () => {
  if (state.car) map.setView([state.car.lat, state.car.lng], 16);""", """$('btnCar').onclick = () => {
  $('autoModal').classList.remove('show');
  if (state.car) map.setView([state.car.lat, state.car.lng], 16);""")
rep("""    state.car = null; LS.del('car'); renderCar(); pushCar(null);""", """    state.car = null; LS.del('car'); renderCar(); pushCar(null);
    $('autoModal').classList.remove('show');""")
rep("""    $('btnCarAgain').dataset.jistota = '1';""", """    $('btnCarAgain').dataset.jistota = '1';
    /* otázka se ukáže v žlutém listu, ten zůstává otevřený */""")
rep("""  oznacAuto();
};

/* Audit 8: dřív se koš""", """  $('autoModal').classList.remove('show');
  oznacAuto();
};

/* Audit 8: dřív se koš""")

# ---------- tahací panel → menu jako list ----------
i = s.index('/* ============================================================\n   VYTAHOVACÍ SPODNÍ PANEL')
j = s.index('/* ============================================================\n   NÁLEZY')
blok = s[i:j]
a = blok.index('/* Mezera mezi spodní hranou plochy stránky a spodkem displeje.')
b = blok.index('function measureSheet(plne){')
zachovat = blok[a:b]
nove = """/* ============================================================
   NOVÁ APPKA: MENU JE LIST, NE TAHACÍ PANEL
   Starý panel se skládal, vytahoval a měřil – čtyři sta řádků
   a desítky oprav podle snímků z telefonu. Tady je menu obyčejný
   list zespodu jako všechna ostatní okna: klepnutí na Menu ho
   otevře, klepnutí vedle nebo na úchyt zavře. Dok dole má pevnou
   výšku, nic se nepočítá z obsahu.
   Ze starého bloku zůstalo jen měření spodního pruhu u starších
   instalací z ikonky (--dno), na které stojí mapa.
   ============================================================ */
let sheetPeek = true;               // „menu zavřené" – čte to Diagnostika
let headVyska = 0, peekOffset = 0;  // zůstaly kvůli Diagnostice
function isWide(){ return window.innerWidth >= 820; }
""" + zachovat + """/* Dok: měřítko a tiráž mapy musí sedět nad ním. Měří se skutečná
   poloha doku vůči spodku mapy, ne odhad. */
function merDok(){
  const d = document.getElementById('dok'), m = document.getElementById('map');
  if (!d || !m) return;
  const r = d.getBoundingClientRect();
  headVyska = Math.round(r.height);
  const dok = Math.max(0, Math.round(m.getBoundingClientRect().bottom - r.top + 6));
  document.documentElement.style.setProperty('--dok', dok + 'px');
}
function measureSheet(){ nastavDno(); merDok(); }
function applySheet(){}
let prepocetCeka = false;
function prepocitatPanel(){
  if (prepocetCeka) return;
  prepocetCeka = true;
  requestAnimationFrame(() => { prepocetCeka = false; measureSheet(); });
}
function otevriMenu(){
  sheetPeek = false;
  renderPeopleList();
  $('menuModal').classList.add('show');
  $('grab').setAttribute('aria-expanded', 'true');
}
function zavriMenu(){
  sheetPeek = true;
  $('menuModal').classList.remove('show');
  $('grab').setAttribute('aria-expanded', 'false');
}
function setSheetPeek(v){ if (v) zavriMenu(); else otevriMenu(); }
$('grab').onclick = () => otevriMenu();
/* Položky menu, které někam vedou, menu zavřou; přepínače ne. */
$('menuModal').addEventListener('click', e => { if (e.target.closest('.zavira')) zavriMenu(); });
/* Klepnutí vedle listu ho zavře – u všech oken kromě jména, to je povinné. */
document.addEventListener('click', e => {
  const m = e.target;
  if (!m.classList || !m.classList.contains('modal') || m.id === 'nameModal') return;
  m.classList.remove('show');
  if (m.id === 'menuModal') zavriMenu();
});

window.addEventListener('resize', () => { prepocitatPanel(); bannerOffset(); });
if (document.fonts && document.fonts.ready){
  document.fonts.ready.then(() => { prepocitatPanel(); bannerOffset(); });
}
window.addEventListener('load', () => { prepocitatPanel(); bannerOffset(); });
window.addEventListener('pageshow', () => { prepocitatPanel(); bannerOffset(); });
if (window.visualViewport){
  const prepocitat = () => { prepocitatPanel(); bannerOffset(); };
  window.visualViewport.addEventListener('resize', prepocitat);
}
window.addEventListener('orientationchange', () => setTimeout(() => prepocitatPanel(), 300));

"""
s = s[:i] + nove + s[j:]

# ---------- lišty nahoře: Vrstvy sedí vedle lišty podmínek ----------
rep("""  st.setProperty('--bannerH', (hu + hb + hr + hm) + 'px');""", """  st.setProperty('--bannerH', (hu + hb + hr + hm) + 'px');
  st.setProperty('--nadListou', (hu + hb + hr) + 'px');""")
i = s.index('function stropMenu(){')
j = s.index('\n}\n', i) + 3
s = s[:i] + "function stropMenu(){}   // nová appka: menu je list, strop počítá CSS\n" + s[j:]

# ---------- bubliny: dole uhnout doku, ne panelu ----------
rep("""  const sh = document.querySelector('.sheet');
  const dole = sh ? Math.min(360, Math.round(sh.getBoundingClientRect().height -
              (parseFloat((getComputedStyle(sh).transform.match(/,\\s*([-\\d.]+)\\)$/)||[0,0])[1]) || 0) + 24)) : 240;""",
"""  const dk = document.getElementById('dok');
  const dole = dk ? Math.round(window.innerHeight - dk.getBoundingClientRect().top + 24) : 120;""")

# ---------- diagnostika ----------
i = s.index("    const sh = document.querySelector('.sheet');\n    const r  = sh.getBoundingClientRect();")
j = s.index("    return '<h3>Diagnostika</h3>", i)
s = s[:i] + "    const r = document.getElementById('dok').getBoundingClientRect();\n" + s[j:]
i = s.index("      'panel: výška ' + Math.round(r.height)")
j = s.index("      '<br>plocha stránky končí '", i)
s = s[:i] + "      'dok: výška ' + Math.round(r.height) + ' · menu ' + (sheetPeek ? 'zavřené' : 'otevřené') +\n" + s[j:]
rep("""      ' · spodek panelu ' + Math.round(r.bottom) + ' z ' + window.innerHeight +""",
    """      ' · spodek doku ' + Math.round(r.bottom) + ' z ' + window.innerHeight +""")

# ---------- filtry: kratší popisky dojezdu a houby do segmentů ----------
rep("""'" data-f="minuty" data-v="' + v + '">do ' + v + ' min</button>'""", """'" data-f="minuty" data-v="' + v + '">' + v + ' min</button>'""")
rep("""'<button class="fchip' + (FILTR.chranena ? ' on' : '') + '" data-f="chranena" data-v="1">Vynechat rezervace</button>'""",
    """'<button class="fchip' + (FILTR.chranena ? ' on' : '') + '" data-f="chranena" data-v="1">Vynechat</button>'""")
rep("""'<button class="fchip' + (!FILTR.chranena ? ' on' : '') + '" data-f="chranena" data-v="0">Je mi to jedno</button>'""",
    """'<button class="fchip' + (!FILTR.chranena ? ' on' : '') + '" data-f="chranena" data-v="0">Nevadí</button>'""")
rep("""'<div class="fr"><span>Dojezd</span><div>'""", """'<div class="fr"><span>Dojezd z domova · jen pro Kam dnes</span><div>'""")
rep("""'<div class="fr"><span>Chráněná</span><div>'""", """'<div class="fr"><span>Rezervace · jen pro Kam dnes</span><div>'""")

rep("""      '<p class="pozn popisHouby">' + popisHouby() + '</p>' +
      '<button class="ghost" id="btnKdeNejbliz" style="margin:6px 0 0"><svg class="ik"><use href="#i-spendlik"/></svg>Kde je nejblíž?</button>' +
    '</div></div>' +""", """    '</div>' +
      '<p class="pozn popisHouby">' + popisHouby() + '</p>' +
      '<button class="ghost" id="btnKdeNejbliz"><svg class="ik"><use href="#i-spendlik"/></svg>Kde je nejblíž?</button>' +
    '</div>' +""")

# ---------- vrstvy: vlastní karta místo ovladače Leafletu ----------
rep("""<div class="modal" role="dialog" aria-modal="true" id="filtrModal">""", """<div class="modal karta" role="dialog" aria-modal="true" id="filtrModal">""")
rep(' <symbol id="i-nahoru" viewBox="0 0 24 24">', ' <symbol id="i-vrstvy" viewBox="0 0 24 24"><path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 12.5 9 5 9-5"/><path d="m3 17 9 5 9-5"/></symbol>\n <symbol id="i-nahoru" viewBox="0 0 24 24">')
mezi("L.control.layers({", "map.on('overlayadd overlayremove', ulozVrstvy);", """/* Nová appka: vrstvy nejsou rozbalovací seznam Leafletu, ale stejná
   karta jako „Co hledáme". Události overlayadd / overlayremove /
   baselayerchange se posílají stejně, jako je posílal ovladač Leafletu,
   takže zbytek appky (ukládání, překreslení, nálezy GBIF) se nemění. */
const PREKRYVY = {rust: rustVrstva, gbif: gbifVrstva, mista: mistaVrstva};
function vykresliVrstvy(){
  const let_ = map.hasLayer(ortofoto);
  $('vrPodkladMapa').classList.toggle('on', !let_);
  $('vrPodkladLetecka').classList.toggle('on', let_);
  Object.keys(PREKRYVY).forEach(k => {
    const t = $('vr_' + k), on = map.hasLayer(PREKRYVY[k]);
    t.classList.toggle('on', on); t.setAttribute('aria-checked', on ? 'true' : 'false');
  });
}
function dejPodklad(letecka){
  const novy = letecka ? ortofoto : tiles, stary = letecka ? tiles : ortofoto;
  if (!map.hasLayer(novy)){
    map.removeLayer(stary); map.addLayer(novy);
    if (novy.bringToBack) novy.bringToBack();
    map.fire('baselayerchange', {layer: novy, name: letecka ? 'Letecká (ČÚZK)' : 'Mapa'});
  }
  vykresliVrstvy();
}
function prepniVrstvu(k){
  const vr = PREKRYVY[k];
  if (map.hasLayer(vr)){ map.removeLayer(vr); map.fire('overlayremove', {layer: vr, name: k}); }
  else { map.addLayer(vr); map.fire('overlayadd', {layer: vr, name: k}); }
  vykresliVrstvy();
}
$('vrPodkladMapa').onclick = () => dejPodklad(false);
$('vrPodkladLetecka').onclick = () => dejPodklad(true);
Object.keys(PREKRYVY).forEach(k => $('vr_' + k).onclick = () => prepniVrstvu(k));
const OvladacVrstvy = L.Control.extend({
  options: {position:'topright'},
  onAdd(){ const el = document.getElementById('btnVrstvy');
           L.DomEvent.disableClickPropagation(el);
           return el; }
});
map.addControl(new OvladacVrstvy());
$('btnVrstvy').onclick = () => {
  const m = $('vrstvyModal'), otevrit = !m.classList.contains('show');
  m.classList.toggle('show', otevrit);
  $('btnVrstvy').setAttribute('aria-expanded', otevrit ? 'true' : 'false');
  if (otevrit) vykresliVrstvy();
};
new MutationObserver(() => {
  if (!$('vrstvyModal').classList.contains('show')) $('btnVrstvy').setAttribute('aria-expanded', 'false');
}).observe($('vrstvyModal'), {attributes: true, attributeFilter: ['class']});

""")
rep("""obnovVrstvy();

/* Na letecké mapě""", """obnovVrstvy();
vykresliVrstvy();

/* Na letecké mapě""")

# ---------- nova-v4: mapa říká pravdu – vhodný porost jednou barvou, cesty v něm ----------
mapa4 = open(os.path.join(TU, 'mapa-v4.js'), encoding='utf-8').read()
rep("async function kresliSber(b){", mapa4 + "\nasync function kresliSber(b){")
mezi("  podleStupne.forEach((prvky, st) => {", "  const zalohy = [odpoved.zeZalohy, mr.zeZalohy].filter(Boolean);", """  /* nova-v4: místo pěti stupňů jen vhodné porosty (≥ 70 %) jednou barvou
     a cesty v nich červeně – viz blok MAPA ŘÍKÁ PRAVDU výš. */
  const vhodne = [];
  podleStupne.forEach(prvky => prvky.forEach(f => { if (f.properties._skore >= 0.7) vhodne.push(f); }));
  if (vhodne.length){
    L.geoJSON({type: 'FeatureCollection', features: vhodne}, {
      renderer: rustPlatno,
      style: {color: '#3d6b35', weight: 1.2, opacity: .6, fillColor: '#5f9a52', fillOpacity: .38},
      onEachFeature: (ft, vrstva) => vrstva.bindPopup(() => popisVhodnehoPorostu(ft, jmenoHouby), POPOPT)
    }).addTo(rustVrstva);
  }
  let kmCest = null;
  try {
    const cary = await stahniCesty(meze);
    const o = orezCesty(cary, vhodne);
    kmCest = o.delkaM / 1000;
    cestyVhodne = o.cary;
    if (o.cary.length && rustZapnuty()){
      L.polyline(o.cary, {renderer: rustPlatno, color: '#fffdf6', weight: 7, opacity: .85, interactive: false}).addTo(rustVrstva);
      L.polyline(o.cary, {renderer: rustPlatno, color: '#b83a26', weight: 3.5, opacity: .95, interactive: false}).addTo(rustVrstva);
    }
  } catch(e){ kmCest = null; }   // bez cest (offline, server) zůstanou aspoň porosty
""")
rep("  return {celyKlic, pocet: kusy.length, kreslenych, zahozeno, haCelkem, haNej, nejlepsi, haBedly, haHriby, meze, strop,",
    "  return {celyKlic, pocet: kusy.length, kreslenych, zahozeno, haCelkem, haNej, nejlepsi, haBedly, haHriby, meze, strop, kmCest,")
rep("    (v.haNej >= 0.5 ? ha(v.haNej) + ' ha vhodného lesa' : 'nic vhodného v dohledu') +",
    "    (v.haNej < 0.5 ? 'nic vhodného v dohledu'\n      : v.kmCest ? (v.kmCest < 10 ? v.kmCest.toFixed(1).replace('.', ',') : Math.round(v.kmCest)) + ' km cest ve vhodném lese'\n      : ha(v.haNej) + ' ha vhodného lesa') +")
rep("""    '<p><b>Obarvený les</b> = mapa růstu. Pět stupňů od cihlové (mizerně) ' +
    'přes okrovou (středně) po tmavě zelenou (výborně). Barvu má jen les.<br><br>' +""",
    """    '<p><b>Světle zelený les</b> = porost, kde vybraná houba může růst (podle druhu a výšky lesa z map ČÚZK). ' +
    'Les bez barvy jí nesedí.<br><br>' +
    '<b>Červená čára</b> = cesta nebo pěšina uvnitř vhodného porostu. Tudy jít – u cest se v 1 012 ověřených ' +
    'nálezech našlo 2,4× víc hub než v okolním lese. Který porost v okolí je lepší, mapy neřeknou.<br><br>' +""")

# ---------- nova-v5: kde začít podle cest a přístupu, ne podle plochy ----------
misto5 = open(os.path.join(TU, 'misto-v5.js'), encoding='utf-8').read()
rep("async function kresliSber(b){", misto5 + "\nasync function kresliSber(b){")
mezi("  zacniTadyVrstva.clearLayers();\n  if (!rustZapnuty()) return;\n  const kandidati", "  /* nova-v4: místo pěti stupňů",
     "  if (!rustZapnuty()) return;\n")
rep("  } catch(e){ kmCest = null; }   // bez cest (offline, server) zůstanou aspoň porosty\n",
    """  } catch(e){ kmCest = null; }   // bez cest (offline, server) zůstanou aspoň porosty
  /* nova-v5: místa, kde začít – podle cest ve vhodném lese a přístupu od silnice (blok KDE ZAČÍT výš) */
  zacniTadyVrstva.clearLayers();
  if (rustZapnuty() && kmCest){
    let silnice = null;
    try { silnice = await stahniSilnice(meze); } catch(e){ /* bez silnic rozhoduje jen délka cest */ }
    if (rustZapnuty()) kresliMistaZacit(vyberMistaZacit(vhodne, silnice, meze.getCenter().lat, cestyVhodne, map.getBounds().pad(-0.16)), jmenoHouby);
  }
""")

# ---------- nova-v6: Kam dnes – místo podle cest, počasí rozhodne „jestli" ----------
kam6 = open(os.path.join(TU, 'kam-v6.js'), encoding='utf-8').read()
rep("async function kamDnes(){", kam6 + "\nasync function kamDnes(){")
rep("""    const poradi = sPocasim.map(z => skoreMista(z.m, z.den)).sort((a,b) => b.sance - a.sance);
    const nej = poradi[0];
    const sl = slovniSance(nej.sance);
    const sucho = nej.sance < 0.15;""", """    /* nova-v6: pořadí podle cest ve vhodném lese a místa, počasí jen „jestli" (blok KAM DNES výš) */
    const hodnocena = sPocasim.map(z => skoreMista(z.m, z.den));
    const poradi = await seradKamDnes(hodnocena);
    if (zastaraly()) return;
    const nej = poradi[0];
    const sl = slovniSance(nej.sPocasi);
    const sucho = medianPocasi(hodnocena) < 0.15;""")
rep("""
  const s = slovniSance(x.sance);
  const r = (a, b) =>""", """
  const s = slovniSance(x.sPocasi);
  const r = (a, b) =>""")
rep("""  k.push(r('Podmínky', '<i class="tecka" style="background:' + s.c + '"></i>' + s.t + ' · ' + proc(x.sance)));""",
    """  k.push(r('Počasí a sezóna', '<i class="tecka" style="background:' + s.c + '"></i>' + s.t + ' · ' + proc(x.sPocasi)));""")
rep("""  k.push(r('Porost', !m.jehl && !m.list ? 'neurčený' : (m.jehl >= m.list ? 'spíš jehličnatý' : 'spíš listnatý')));""",
    """  k.push(r('Cesty ve vhodném lese', x.cestyM == null ? 'nezjištěno' : fmtDist(x.cestyM) + ' do 750 m'));
  if (x.sucho) k.push(r('Pozor', 'tady málo pršelo'));""")
rep("""      const s = slovniSance(x.sance);""", """      const s = slovniSance(x.sPocasi);""")
rep("""' nejlepší z ' + celkem.toLocaleString('cs-CZ') + '</p>';""", """' nejlepší z ' + celkem.toLocaleString('cs-CZ') + ' · pořadí podle cest a dojezdu</p>';""")
rep("""            '<b>Tohle není jistota, je to počasí a statistika.</b> ' +""",
    """            '<b>Pořadí</b> dělají cesty ve vhodném lese do 750 m od parkoviště, dojezd, porost kolem a vaše nálezy. ' +
            '<b>Počasí a sezóna</b> říkají, jestli jet vůbec; místo jen sesadí, když tam vyloženě nepršelo. ' +
            'Ověřeno na 399 nálezech: počasí trefí <b>kdy</b> jet (AUC 0,75), ale místa do hodiny jízdy od sebe skoro neodliší (0,53).<br><br>' +
            '<b>Tohle není jistota, je to počasí a statistika.</b> ' +""")

# ---------- nova-v7: vaše nálezy a prázdné vycházky posouvají cesty ----------
nal7 = open(os.path.join(TU, 'nalezy-v7.js'), encoding='utf-8').read()
rep("async function kresliSber(b){", nal7 + "\nasync function kresliSber(b){")
rep("""    if (o.cary.length && rustZapnuty()){
      L.polyline(o.cary, {renderer: rustPlatno, color: '#fffdf6', weight: 7, opacity: .85, interactive: false}).addTo(rustVrstva);
      L.polyline(o.cary, {renderer: rustPlatno, color: '#b83a26', weight: 3.5, opacity: .95, interactive: false}).addTo(rustVrstva);
    }""", """    if (o.cary.length && rustZapnuty()) kresliCestyV7(o.cary);   // nova-v7: žlutě u nálezů, šedě prošlé""")
rep("""    hodnocene.push({f, cestyM, pristupM, vstup, hodnota: Math.min(cestyM, ZACIT_CESTY_STROP_M) * vaha});""",
    """    /* nova-v7: nálezy rodiny kolem vstupu (až 2,5×) a nedávno prošlé cesty bez nálezu (až o polovinu) */
    const nalezy = bonusNalezu(vstup), prosle = podilProsleho(vstup);
    hodnocene.push({f, cestyM, pristupM, vstup, nalezy, prosle,
      hodnota: Math.min(cestyM, ZACIT_CESTY_STROP_M) * vaha * (1 + Math.min(1.5, nalezy.bonus)) * (1 - 0.5 * prosle)});""")
rep("""      '<tr><td>Plocha porostu</td><td>' + (a._ha < 10 ? a._ha.toFixed(1).replace('.', ',') : Math.round(a._ha)) + ' ha</td></tr>' +""",
    """      (m.nalezy && m.nalezy.blizko ? '<tr><td>Vaše nálezy</td><td><b>' + m.nalezy.blizko + '</b> do 300 m, naposledy ' + fmtTime(m.nalezy.posledni) + '</td></tr>' : '') +
      (m.prosle >= 0.1 ? '<tr><td>Prošli jste</td><td>' + Math.round(m.prosle * 100) + ' % cest v posledních 3 týdnech, bez nálezu</td></tr>' : '') +
      '<tr><td>Plocha porostu</td><td>' + (a._ha < 10 ? a._ha.toFixed(1).replace('.', ',') : Math.round(a._ha)) + ' ha</td></tr>' +""")
rep("""      'a jak blízko je k lesu od silnice. Velikost lesa nerozhoduje.</p></div>', POPOPT)""",
    """      'a jak blízko je k lesu od silnice; vaše nálezy u cest ho zvednou, nedávno prošlé cesty bez nálezu sníží. Velikost lesa nerozhoduje.</p></div>', POPOPT)""")
rep("  const nalezBonus = Math.min(0.6, n.skore * 0.2);",
    "  const nalezBonus = Math.min(0.6, 0.4 * bonusNalezu([m.lat, m.lng]).bonus);   // nova-v7: změřené váhy vzdálenosti a stáří")
rep("""  renderFinds();
  kresliNejlepsi();

  /* v101:""", """  renderFinds();
  kresliNejlepsi();
  rustPokryti = null; prekresliRustBrzy();      // nova-v7: cesty u nového nálezu hned zežloutnou

  /* v101:""")
rep("""  if (!historieZap){ historieZap = true; LS.set('historie', true); }
  kresliHistorii();
""", """  if (!historieZap){ historieZap = true; LS.set('historie', true); }
  kresliHistorii();
  rustPokryti = null; prekresliRustBrzy();      // nova-v7: prošlé cesty bez nálezu hned zešednou
""")
rep("""    'nálezech našlo 2,4× víc hub než v okolním lese. Který porost v okolí je lepší, mapy neřeknou.<br><br>' +""",
    """    'nálezech našlo 2,4× víc hub než v okolním lese. Který porost v okolí je lepší, mapy neřeknou.<br><br>' +
    '<b>Žlutý okraj cesty</b> = do 300 m od vašeho nálezu. Nové nálezy leží u starých: do 100 m od dřívějšího nálezu jich je 14×, ' +
    'do 300 m 3× víc než v okolním lese.<br><br>' +
    '<b>Šedá čárkovaná</b> = tudy někdo z vás v posledních 3 týdnech prošel celou vycházku a nic nenašel. Po dalším dešti to může být jinak.<br><br>' +""")

# ---------- nova-v8: Najdi les kolem mě podle cest a parkoviště, ne podle plochy ----------
najdi8 = open(os.path.join(TU, 'najdi-v8.js'), encoding='utf-8').read()
mezi("async function najdiLesTady(){", "/* Když nezbylo nic, je rozdíl", najdi8 + "\n")

# ---------- přepnutí na hlavní adresu: stará appka jako záloha ----------
rep("""    '<button class="ghost" id="btnSmazMapy" style="margin-bottom:12px">Smazat uložené mapy</button>' +""",
    """    '<button class="ghost" id="btnSmazMapy" style="margin-bottom:12px">Smazat uložené mapy</button>' +
    '<h3>Stará verze</h3>' +
    '<button class="ghost" onclick="location.href=\\'stara/\\'" style="margin-bottom:6px">Otevřít starou verzi appky</button>' +
    '<p style="color:var(--muted);margin:0 0 12px">Záloha, kdyby v nové něco chybělo. Data jsou společná.</p>' +""")
rep("/* Když nezbylo nic, je rozdíl", """/* Při prvním spuštění po přepnutí z hlavní adresy: jednou říct, že je to nová podoba
   a kde zůstala stará. Data (jméno, auto, nálezy, oblíbená) jsou v obou stejná.
   Když zrovna svítí jiná hláška (bez signálu, chybí odkaz), počká se, ať ji nepřebije. */
function uvitejNovou(pokus){
  if (LS.get('novaUvitana', false)) return;
  if ($('banner').classList.contains('show') && pokus < 6) return setTimeout(() => uvitejNovou(pokus + 1), 8000);
  LS.set('novaUvitana', true);
  banner('<b>Houbař má novou podobu.</b> Mapa ukazuje vhodný les a cesty v něm, tabulky 1, 2, 3 říkají, kde začít. ' +
         'Stará verze zůstala v Menu → Nastavení.', false, 15000);
}
setTimeout(() => uvitejNovou(0), 2500);

/* Když nezbylo nic, je rozdíl""")

# ---------- nova-v3: parkování k okraji lesa, adresa NLI ----------
park = open(os.path.join(TU, 'parkovani.js'), encoding='utf-8').read()
i = s.index('/* ============================================================\n   Audit 17') if '/* ============================================================\n   Audit 17' in s else None
z = s.index('const PARK_OKOLI_M = 2500;')
z = s.rfind('/* ====', 0, z)          # celý starý blok i s úvodním komentářem
k = s.index('async function najdiLesTady(')
s = s[:z] + park + '\n' + s[k:]
rep("const UHUL_WMS = 'https://geoportal.uhul.cz/wms_oprl/service.svc/get';",
    "/* nova-v3: ÚHÚL je od roku 2025 Národní lesnický institut; stará adresa má cizí\n   certifikát a prohlížeč ji odmítne. */\nconst UHUL_WMS = 'https://geoportal.nli.gov.cz/wms_oprl/service.svc/get';")
assert 'geoportal.uhul.cz' not in s
rep("outFields: 'druh_p,vyska_p,Shape_Area,Shape_Length'", "outFields: 'OBJECTID,druh_p,vyska_p,Shape_Area,Shape_Length'", 1)   # nova-v8: druhý výskyt (starý Najdi les) je pryč
# (v5: starý výběr míst i s jeho bublinou je pryč – nová bublina má číslo porostu sama)
rep("kdeZaparkovat(la, ln, b.dataset.jmeno || '');", "kdeZaparkovat(la, ln, b.dataset.jmeno || '', b.dataset.obj || '');")

# ---------- kontrola: na starý panel už nic nesahá ----------
for zakazane in ["querySelector('.sheet')", "sheetEl", '.hlavniradek', "'carNav').style", 'lensDlouhy', 'autoDlouhy']:
    assert zakazane not in s, zakazane

open(os.path.join(REPO, 'index.html'), 'w', encoding='utf-8').write(s)
print('index.html', len(s.splitlines()), 'řádků,', len(s.encode()), 'bajtů')

# ---------- service worker nové appky (hlavní adresa) ----------
w0 = open(os.path.join(ZAKLAD, 'sw.js'), encoding='utf-8').read()
def wrep(a, b, n=1):
    global w
    c = w.count(a); assert c == n, (c, a[:80]); w = w.replace(a, b)
w = re.sub(r"const VER\s*=\s*'houby-v\d+';", "const VER        = '" + VERZE + "';", w0)
assert ("'" + VERZE + "'") in w
# úklid: jen staré skořápky hlavní adresy (houby-v*); kopie na nova/ (nova-v*), záloha stara-v*,
# dlaždice, knihovna Firebase a záloha porostů zůstávají
wrep(""".filter(k => k !== TILES && k !== SDK && k !== 'houby-zaloha' && !k.startsWith(VER))""",
     """.filter(k => /^houby-v\\d+[a-z]?-/.test(k) && !k.startsWith(VER + '-'))   // jen vlastní staré skořápky; nova-v*, stara-v* a sdílené cache zůstávají""")
wrep("/^houby-v\\d+-shell$/", "/^houby-v\\d+[a-z]?-shell$/")
open(os.path.join(REPO, 'sw.js'), 'w', encoding='utf-8').write(w)
import json
man0 = json.load(open(os.path.join(ZAKLAD, 'manifest.json'), encoding='utf-8'))
man = json.loads(json.dumps(man0))
man['start_url'] = './index.html'; man['scope'] = './'      # stejné jako dřív: ikona na ploše otevře novou appku
man['background_color'] = '#efe9da'; man['theme_color'] = '#f6f2e9'
json.dump(man, open(os.path.join(REPO, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('sw.js, manifest.json')

# ---------- záloha: stará appka v134 na stara/ ----------
STARA = 'stara-v134'
z = ZAKLAD_HTML
def zrep(a, b, n=1):
    global z
    c = z.count(a); assert c == n, (c, a[:80]); z = z.replace(a, b)
zrep('<meta name="apple-mobile-web-app-title" content="Houbař">', '<meta name="apple-mobile-web-app-title" content="Houbař S">')
zrep('<title>Houbař</title>', '<title>Houbař – stará verze</title>')
zrep('<link rel="apple-touch-icon" sizes="180x180" href="icon-180.png">', '<link rel="apple-touch-icon" sizes="180x180" href="../icon-180.png">')
zrep('<link rel="apple-touch-icon" sizes="192x192" href="icon-192.png">', '<link rel="apple-touch-icon" sizes="192x192" href="../icon-192.png">')
zrep('<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">', '<link rel="icon" type="image/png" sizes="192x192" href="../icon-192.png">')
zrep('<script src="config.js"></script>', '<script src="../config.js"></script>')
zrep("await fetch('nalezy-gbif.json'", "await fetch('../nalezy-gbif.json'")
zrep("const MISTA_URL = 'mista.json';", "const MISTA_URL = '../mista.json';")
zrep("const APP_VERZE = 'houby-v134';", "const APP_VERZE = '" + STARA + "';")
os.makedirs(os.path.join(REPO, 'stara'), exist_ok=True)
open(os.path.join(REPO, 'stara', 'index.html'), 'w', encoding='utf-8').write(z)
w = re.sub(r"const VER\s*=\s*'houby-v\d+';", "const VER        = '" + STARA + "';", w0)
wrep("""  './config.js',""", """  '../config.js',""")
wrep("""  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './nalezy-gbif.json',""", """  '../icon-180.png',
  '../icon-192.png',
  '../icon-512.png',
  '../nalezy-gbif.json',""")
wrep("""  './mista.json'
];""", """  '../mista.json'
];""")
wrep("/^houby-v\\d+-shell$/", "/^stara-v\\d+-shell$/")
wrep(""".filter(k => k !== TILES && k !== SDK && k !== 'houby-zaloha' && !k.startsWith(VER))""",
     """.filter(k => /^stara-v\\d+-/.test(k) && !k.startsWith(VER + '-'))   // záloha maže jen své staré skořápky, nikdy cache hlavní appky""")
open(os.path.join(REPO, 'stara', 'sw.js'), 'w', encoding='utf-8').write(w)
mz = json.loads(json.dumps(man0))
mz['name'] = 'Houbař (stará verze)'; mz['short_name'] = 'Houbař S'; mz['start_url'] = './'; mz['scope'] = './'
for ic in mz.get('icons', []): ic['src'] = '../' + ic['src'].lstrip('./')
json.dump(mz, open(os.path.join(REPO, 'stara', 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('stara/index.html, stara/sw.js, stara/manifest.json')

# ---------- nova/: stejná appka i pro ikonu „Houbař N" ----------
# Přesměrování na hlavní adresu vedlo mimo rozsah té ikony a iOS pak appku ukázal
# s lištou prohlížeče. Proto tu běží stejná appka, jen se soubory o patro výš.
NOVA = VERZE.replace('houby-', 'nova-')
n = s
def nrep(a, b, k=1):
    global n
    c = n.count(a); assert c == k, (c, a[:80]); n = n.replace(a, b)
nrep('<meta name="apple-mobile-web-app-title" content="Houbař">', '<meta name="apple-mobile-web-app-title" content="Houbař N">')
nrep('<link rel="apple-touch-icon" sizes="180x180" href="icon-180.png">', '<link rel="apple-touch-icon" sizes="180x180" href="../icon-180.png">')
nrep('<link rel="apple-touch-icon" sizes="192x192" href="icon-192.png">', '<link rel="apple-touch-icon" sizes="192x192" href="../icon-192.png">')
nrep('<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">', '<link rel="icon" type="image/png" sizes="192x192" href="../icon-192.png">')
nrep('<script src="config.js"></script>', '<script src="../config.js"></script>')
nrep("await fetch('nalezy-gbif.json'", "await fetch('../nalezy-gbif.json'")
nrep("const MISTA_URL = 'mista.json';", "const MISTA_URL = '../mista.json';")
nrep("location.href=\\'stara/\\'", "location.href=\\'../stara/\\'")
os.makedirs(os.path.join(REPO, 'nova'), exist_ok=True)
open(os.path.join(REPO, 'nova', 'index.html'), 'w', encoding='utf-8').write(n)
w = re.sub(r"const VER\s*=\s*'houby-v\d+';", "const VER        = '" + NOVA + "';", w0)
wrep("""  './config.js',""", """  '../config.js',""")
wrep("""  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './nalezy-gbif.json',""", """  '../icon-180.png',
  '../icon-192.png',
  '../icon-512.png',
  '../nalezy-gbif.json',""")
wrep("""  './mista.json'
];""", """  '../mista.json'
];""")
wrep("/^houby-v\\d+-shell$/", "/^nova-v[0-9a-z]+-shell$/")
wrep(""".filter(k => k !== TILES && k !== SDK && k !== 'houby-zaloha' && !k.startsWith(VER))""",
     """.filter(k => /^nova-v[0-9a-z]+-/.test(k) && !k.startsWith(VER + '-'))   // jen vlastní staré skořápky nova-v*""")
open(os.path.join(REPO, 'nova', 'sw.js'), 'w', encoding='utf-8').write(w)
mn = json.loads(json.dumps(man))
mn['name'] = 'Houbař (nová)'; mn['short_name'] = 'Houbař N'; mn['start_url'] = './'; mn['scope'] = './'
for ic in mn.get('icons', []): ic['src'] = '../' + ic['src'].lstrip('./')
json.dump(mn, open(os.path.join(REPO, 'nova', 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('nova/index.html, nova/sw.js, nova/manifest.json (' + NOVA + ')')
