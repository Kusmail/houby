# Houbař – naše mapa

Rodinná mapa na houby po celé ČR: **kde hledat, kudy jít, kde zaparkovat**, zaparkované **auto** a **poloha** rodiny. Otevírá se v prohlížeči a přidá se na plochu telefonu jako ikona. Žádný App Store, žádné poplatky.

> **Dvě verze vedle sebe (říjen 2026).**
> **Nová appka** běží na zkušební adrese **`…/houby/nova/`** (na ploše jako **„Houbař N"**). Tenhle návod popisuje ji.
> **Stará appka** na **`…/houby/`** zůstává beze změny, dokud novou neodsouhlasíme. Obě sdílejí stejná data (jméno, rodinný kód, auto, nálezy, oblíbená, stažené mapy).

---

## Co appka umí a co ne — přečti si to jako první

| Funkce | Jak to funguje |
|---|---|
| **Mapa: vhodný les a cesty v něm** | ✅ Porosty a cesty z map ČÚZK, se signálem. Bez signálu jen zelený podklad |
| **Kde začít** (tři tabulky na mapě) | ✅ Podle cest ve vhodném lese u silnice a podle vašich nálezů |
| **Kde zaparkovat** | ✅ Nejbližší silnice k okraji lesa, se signálem |
| **Kam dnes na houby** | ✅ Místa po celé ČR podle cest, dojezdu a nálezů; počasí řekne, jestli jet vůbec |
| **Označení auta a navigace zpět** | ✅ Spolehlivě, i bez signálu (stačí GPS) |
| **Zápis nálezu s fotkou** | ✅ I bez signálu, odešle se, až signál bude |
| **Záznam trasy** | ✅ Jen dokud máš appku na displeji — díry se kreslí tečkovaně |
| Poloha ostatních na mapě | ⚠️ **Jen dokud mají appku otevřenou na displeji** |
| **Kolik lidí** | Libovolně z rodiny — připojí se každý, kdo dostane rodinný odkaz |

**Co appka neumí:** říct, ve kterém porostu v okolí houby jsou. Mapy znají jen tři druhy lesa a čtyři výšky; smrk od borovice ani dub od buku nerozliší. Proto appka ukazuje **kudy jít** (cesty ve vhodném lese, vaše nálezy), ne „tady rostou". Podrobně v části [Co je ověřené a co ne](#co-je-ověřené-a-co-ne).

### Proč to omezení s polohou

**Safari na iPhonu zastaví sledování polohy ve chvíli, kdy zamkneš telefon nebo přepneš do jiné aplikace.** Apple to webovým aplikacím nedovolí a nejde to obejít.

Prakticky: když má manželka telefon v kapse, její poloha se v appce **neaktualizuje**. U cizí polohy je proto vždy napsané, jak je stará, a po pěti minutách bod zešedne. **Šedému bodu nevěř jako aktuální pozici.**

| | Na co |
|---|---|
| **Tahle appka** | Kde hledat, auto, nálezy, poloha když ji máte otevřenou v ruce |
| **Najít (Find My)** | Průběžné sledování na pozadí — kde je ten druhý, když má telefon v kapse |

Sdílení v Najít si zapněte jednou: **Najít → Lidé → Sdílet moji polohu → vybrat druhého → Sdílet neomezeně**.

---

# Jak to vypadá a jak se to ovládá

**Nahoře** je lišta **podmínek**: slovo (dobré / průměrné / slabé / mizivé) a číslo zakroužkované červeně. Pod ním je, pro jakou houbu to platí a kolik kilometrů cest ve vhodném lese je ve výřezu. Klepnutím se otevře karta **Co hledáme** (filtry). Vedle lišty je dlaždice **Vrstvy**.

**Dole** jsou tři tlačítka, podle důležitosti:

- **Menu** (velké tmavé) — Kam dnes na houby, Najdi les kolem mě, sdílení polohy, displej svítí, kdo z rodiny je na mapě, a dlaždice **Na mě · Nález · Trasa · Nastavení**;
- **Auto** — označit zaparkované auto. Když je auto označené, je tu **žlutá tabulka se vzdáleností a šipkou**;
- **lupa** (malé kulaté) — Určit houbu: vyfotit nebo vybrat fotku a poslat ji do Google Lens.

Všechna okna vyjíždějí zespodu a zavřou se klepnutím vedle. **Co hledáme** a **Vrstvy** jsou karty pod horní lištou.

---

# Co mapa ukazuje

Od přiblížení zhruba na obec (zoom 13) se kreslí porosty a cesty. Na oddálené mapě jsou místo nich **kolečka krajů s procentem** — to je jen počasí a sezóna, kam v republice vůbec má cenu jet.

| na mapě | co to je |
|---|---|
| **světle zelený les** | porost, kde vybraná houba **může růst** — podle druhu (listnatý / smíšený / jehličnatý) a výšky lesa z map ČÚZK. Les bez barvy jí nesedí |
| **červená čára** | cesta, pěšina nebo neevidovaná silnice (ZABAGED) **uvnitř nebo na okraji vhodného porostu**. **Tudy jít.** |
| **žlutý okraj červené čáry** | do 300 m od nálezu někoho z rodiny |
| **šedá čárkovaná** | tudy někdo z vás v posledních 3 týdnech prošel celou vycházku a nic nenašel |
| **tabulky 1, 2, 3** (č. 1 žlutá a zakroužkovaná) | **kde začít** — vstup do lesa u silnice (viz níž) |
| fialové tečky | evidovaná parkoviště u lesa |
| hnědé / okrové tečky | ověřené nálezy z veřejné databáze GBIF (hřibovité / bedly) |
| hnědé kolečko s houbou | váš nález |
| žluté kolečko s autem | zaparkované auto |
| tmavé kolečko s domem | domov |

Klepnutím na zelený porost se ukáže, kolik metrů cest v něm vede, jak je velký a tlačítko **Kde zaparkovat**.

---

# Jak appka vybírá místa

### Kde začít (tabulky 1, 2, 3 na mapě)

U každého vhodného porostu s cestami se najde **vstup do lesa** — místo na okraji nejblíž veřejné silnici nebo ulici. Tam stojí tabulka. Pořadí rozhoduje:

1. **kolik červených cest je do 750 m od vstupu** (na jednu vycházku; počítá se nejvýš 3 km, víc stejně neujdeš) — na tabulce je ta délka („3+ km");
2. **jak blízko je silnice**: do 150 m plná váha, do 1 km klesá na 40 %, dál se místo nenabízí;
3. **vaše nálezy u vstupu** zvednou místo až 2,5×, **nedávno prošlé cesty bez nálezu** ho sníží až na polovinu.

**Velikost lesa nerozhoduje.** Tabulky jsou jen na viditelné části mapy.

### Kde zaparkovat

Tlačítko v bublině porostu nebo tabulky. Appka vezme obrys porostu a najde **nejbližší bod veřejné silnice nebo ulice k jeho okraji**. Evidované parkoviště vybere jen tehdy, když je nejvýš o 300 m dál než ta silnice. Oranžová čárkovaná vede od auta k **zelené tečce**, kde do lesa vejdeš. Zákazy vjezdu a závory appka nezná — to uvidíš na místě.

### Kam dnes na houby

Menu → žlutá tabulka **Kam dnes na houby**. Appka projde **7 656 parkovišť u lesa** po celé ČR, prožene je filtry, spočítá **skutečný dojezd autem** (router OSRM) a stáhne počasí.

- **Pořadí míst** dělá totéž měřítko jako mapa: **cesty ve vhodném lese do 750 m od parkoviště**, k tomu dojezd, porost kolem, vaše nálezy, oblíbená místa a prázdné vycházky.
- **Počasí a sezóna** rozhodují, **jestli jet vůbec**. Když jsou mizerné, appka napíše „Dnes nikam." a poradí, kdy to zkusit. Jednotlivé místo počasí jen sesadí, když tam vyloženě nepršelo.
- Na kartě: dojezd, **počasí a sezóna**, déšť za 3 týdny, **cesty ve vhodném lese**, vaše nálezy. Nejlepší místo je zakroužkované, prohledané naprázdno přeškrtnuté. Pod „Víc o místě" je zbytek.

### Najdi les kolem mě

Menu → **Najdi les kolem mě**. Vezme tvou polohu (nebo střed mapy) a projde **parkoviště u lesa do 15 km**. Předřadí je podle porostu kolem, vzdálenosti, vašich nálezů a oblíbených; u dvanácti nejlepších stáhne **cesty ve vhodném lese do 750 m** a podle nich vybere. Mapa skočí na parkoviště (oranžové **P**), kolem se dokreslí červené cesty a tabulky „kde začít". Velikost lesa nerozhoduje.

Na 16 zkušebních místech: cíl u silnice (do 100 m) dřív 1×, teď 16×; vždy aspoň 2,7 km cest ve vhodném lese od místa, kde zaparkuješ. Cenou je, že parkoviště bývá dál (medián 4,8 km vzdušnou čarou místo 1 km) — dřív appka posílala doprostřed lesa, kam autem nedojedeš.

### Lišta nahoře (podmínky)

Číslo je **počasí a sezóna ve výřezu** (déšť vážený podle toho, kdy po něm houby lezou, teplota, sezónní křivka houby z filtru), vynásobené vhodností nejlepšího porostu ve výřezu — ta je skoro vždy 100 %. Říká tedy hlavně **kdy**, ne kde.

---

# Co je ověřené a co ne

Ověřeno na skutečných nálezech z veřejné databáze GBIF (houby z ČR s přesnými souřadnicemi). **AUC** = pravděpodobnost, že místo nebo den nálezu dostane od appky vyšší hodnocení než náhodné srovnání; 0,5 je náhoda, 1 dokonalost. Podrobnosti, skripty a data: `audit-model-2026-10-21.md` a složka `audit-model/` (mimo tenhle repozitář, u Matěje).

| otázka | výsledek | co z toho appka dělá |
|---|---|---|
| Pozná druh a výška porostu, **který les v okolí** (do 1,5 km) je ten pravý? | **ne** — AUC 0,57 (1 012 nálezů) | porost jen jako „může tu růst", ne jako hodnocení |
| Pozná to **lesní typ** ÚHÚL/NLI (živnost a vlhkost půdy)? | **ne** — AUC 0,53 | nepoužívá se k výběru |
| Pomáhá **blízkost cesty**? | **ano** — do 15 m od cesty 2,4× víc nálezů než v okolním lese (AUC 0,60) | červené cesty, kde začít |
| Leží nové nálezy **u starých**? | **ano** — do 100 m od dřívějšího nálezu 14× víc, do 300 m 3× víc (AUC 0,64, 758 párů) | žlutý okraj, kde začít, Kam dnes |
| Záleží na stáří nálezu? | trochu — 1–2 roky AUC 0,62, 3–5 let 0,60, 6+ let 0,53 | váha 1 / 0,7 / 0,3 |
| Pozná počasí a sezóna, **kdy jet**? | **ano** — AUC 0,75 (399 nálezů, srovnání s jinými dny sezóny na stejném místě) | lišta nahoře, „dnes nikam" |
| Pozná počasí, **kam jet** (místa do hodiny jízdy, týž den)? | **skoro ne** — AUC 0,53 | počasí místa neřadí, jen sesadí suchá |

**Neověřeno:**

- že místa vybraná podle cest dají **víc nálezů** (opora je nepřímá — cesty 2,4×);
- **prázdné vycházky** (šedé čárkované) — na ně žádná veřejná data nejsou;
- **pěšiny a neevidované silnice** — ověřovala se jen vrstva „Cesta", ty další jsou v mapě navíc;
- že **vaše rodinné nálezy** fungují stejně jako GBIF (ty jsou od různých lidí, často opakovaně na stejných místech — rodině podobné, ale ne stejné);
- zkreslení GBIF: lidé fotí tam, kde chodí, takže část vlivu cest je umělá. Pro houbaře je to ale ta užitečná pravda.

---

# Nastavení — jednorázově, cca 30 minut

Postupuj shora dolů. Po každém kroku je napsané, co máš vidět.

## Krok 1 — Firebase projekt (10 min)

Firebase je databáze od Googlu, přes kterou si telefony předávají auto, polohy a nálezy. Bezplatný tarif bohatě stačí.

1. Jdi na **https://console.firebase.google.com** a přihlas se Google účtem.
2. Klikni **Vytvořit projekt** (Create a project).
3. Název: třeba `houby-mratin`. Klikni **Pokračovat**.
4. Google Analytics **vypni** (přepínač doleva) — nepotřebujeme. **Vytvořit projekt**.
5. Počkej, až se projekt vytvoří, a klikni **Pokračovat**.

**Zapni databázi:**

6. V levém menu **Sestavení (Build) → Realtime Database**.
7. Klikni **Vytvořit databázi**.
8. Umístění: vyber **europe-west1 (Belgie)**.
9. Bezpečnostní pravidla: vyber **Spustit v uzamčeném režimu (locked mode)**. Pravidla nastavíme v kroku 4.
10. **Povolit / Enable.**

> ✅ Máš vidět prázdnou databázi a nahoře adresu ve tvaru
> `https://houby-mratin-default-rtdb.europe-west1.firebasedatabase.app`

**Zapni anonymní přihlašování:**

11. V levém menu **Sestavení → Authentication → Začít (Get started)**.
12. Karta **Sign-in method** → **Anonymní (Anonymous)** → klikni na něj.
13. Přepni na **Povoleno (Enable)** → **Uložit**.

## Krok 2 — Zkopírovat údaje do `config.js` (5 min)

1. Vlevo nahoře **⚙ → Nastavení projektu**.
2. Sjeď na **Vaše aplikace**, klikni na **`</>`** (Web).
3. Přezdívka: `houby`. **Zaregistrovat aplikaci.**
4. Otevři **`config.js`** a přepiš hodnoty — **jen text mezi uvozovkami**:

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",
  authDomain:        "houby-mratin.firebaseapp.com",
  databaseURL:       "https://houby-mratin-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "houby-mratin",
  storageBucket:     "houby-mratin.appspot.com",
  messagingSenderId: "123456789012",
  appId:             "1:123456789012:web:abc123"
};
```

> ⚠️ **`databaseURL` u webové aplikace často chybí.** Vezmi ji z **Realtime Database** a doplň ručně. Bez ní appka nesdílí nic.

> **Je bezpečné mít tyhle údaje veřejně?** Ano. Firebase klíče nejsou heslo — přístup hlídají pravidla databáze (krok 4).

## Krok 3 — Nahrát na web (10 min)

1. Účet na **https://github.com**, vpravo nahoře **+ → New repository**, název `houby`, **Public**.
2. Nahraj **všechny soubory z repozitáře** včetně složky `nova/` (nová appka), `mista.json` (parkoviště) a `nalezy-gbif.json` (ověřené nálezy).
3. **Settings → Pages → Deploy from a branch → main → / (root) → Save.**

> ✅ Za 1–2 minuty je appka na `https://tvojejmeno.github.io/houby/` (stará) a `https://tvojejmeno.github.io/houby/nova/` (nová).

## Krok 4 — Pravidla databáze (5 min)

1. Firebase konzole → **Realtime Database → Pravidla (Rules)**.
2. Označ všechno a vlož obsah souboru **`pravidla-databaze.json`** (ten je jen u Matěje — obsahuje rodinný kód, do repozitáře nepatří).
3. **Publikovat** (modrý pruh nahoře).

> ✅ V appce: Menu → Nastavení → „Kdo jsi na mapě" — tečka u jména svítí **zeleně**.

| Uzel | Kdo čte | Kdo zapisuje |
|---|---|---|
| `owners` | každý jen svůj řádek | jen správce |
| `allowed` | celý seznam správce, ostatní jen svůj řádek | **sám sebe jen s platným kódem** z rodinného odkazu; správce kohokoliv |
| `users` | jen člen | každý jen svůj záznam; správce smí cizí záznam **smazat** |
| `car` | jen člen | kdokoli z členů, včetně mazání |
| `finds` | jen člen | každý jen svoje nálezy; správce smí smazat záznamy odebraného |
| `finds_foto` | jen člen | každý jen svoje fotky, nejvýš 60 kB |
| `tracks` | jen člen | každý jen svoje trasy; správce smí smazat záznamy odebraného |

**Správci jsou natvrdo v pravidlech** (UID Matějových zařízení). **Kód z rodinného odkazu** je součástí zápisu, který pravidla porovnají — odkaz je klíč: koho v rodině nechceš, tomu ho neposílej.

## Krok 4b — Přidat člověka do rodiny (10 sekund)

1. Pošli mu **rodinný odkaz** (končí `#k=…`). Najdeš ho v **Menu → Nastavení → Rodinný odkaz**.
2. Otevře ho, zadá jméno. Hotovo.
3. Ať si appku hned **přidá na plochu** (krok 5).

Kdo přijde na holou adresu bez `#k=…`, uvidí jen mapu a nic víc. Odebrat člověka jde v Nastavení tlačítkem **Odebrat** u jeho jména; sám může odejít tlačítkem **Odejít z rodinné mapy**.

## Krok 5 — Přidat na plochu iPhonu (2 min, každý zvlášť)

1. Otevři odkaz **v Safari**.
2. **Sdílet** (čtvereček se šipkou) → **Přidat na plochu** → **Přidat**.
3. Appka z ikonky má vlastní paměť: pokud nahoře uvidíš **„Nemáš přístupový odkaz"**, klepni **Vložit odkaz** a vlož rodinný odkaz ještě jednou. Jen poprvé.

---

## Jaká povolení telefon vyžádá

| Povolení | Kdy se zeptá | Co to dělá | Když odmítneš |
|---|---|---|---|
| **Poloha** | Při zapnutí *Sdílím polohu*, označení auta, „Najdi les kolem mě" nebo zápisu nálezu | GPS pro tebe, auto a nález | Nefunguje auto ani navigace zpátky |
| **Kompas** | Při klepnutí na šipku v žlutém listu auta | Šipka se otáčí podle toho, kam se díváš | Šipka se netočí, appka napíše azimut ve stupních |

Poloha se sdílí **jen když je *Sdílím polohu* zapnuté**. Po zavření appky se vždycky vypne.

---

## Jak se to používá v lese

1. **Doma na Wi-Fi**: přibliž mapu na oblast, kam jedete → **Menu → Nastavení → Stáhnout výřez**. Mapa pak pojede i bez signálu (bez barevných porostů a cest — ty se neukládají).
2. **Plánování**: **Menu → Kam dnes na houby**, nebo přímo na mapě tabulky **1, 2, 3** → bublina → **Kde zaparkovat**.
3. **U auta**: **Auto → Označit auto**. Rodina ho hned vidí. Dole se objeví **žlutá tabulka se vzdáleností**.
4. **V lese**: jdi po **červených cestách**. Zapni **Menu → Sdílím polohu**, ať tě rodina vidí; **Displej svítí** drží displej rozsvícený (bere baterku).
5. **Když něco najdeš**: **Menu → Nález** — druh, kolik, případně fotka. Cesty kolem hned zežloutnou.
6. **Trasa**: **Menu → Trasa** na začátku a na konci. Když jsi nic nenašla, dej **„Nic jsem nenašel"** (s „Zapsal jsem všechno") — prošlé cesty na 3 týdny zešednou a appka je nebude tlačit.
7. **Zpátky k autu**: klepni na žlutou tabulku → velká šipka a vzdálenost, **Navigovat v Mapách**. U auta **Auto mám** (zeptá se, ať to nesmažeš omylem).

---

## Trasy a nálezy — co je čí

**Nález** se ukládá do databáze a vidí ho celá rodina. Fotka (zmenšená na 320 px) se stáhne, až na nález klepneš. **Bez signálu** se nález uloží do telefonu, hned se ukáže v mapě a odešle se, až bude signál. **Smazat** jde v bublině nálezu (dvě klepnutí). Mazat smíš jen svoje.

> 🍄 **Appka neurčuje, co je jedlé.** Pošle fotku do Google Lens, ale rozhodnutí je jenom tvoje.

**Trasa** se ukládá **do telefonu**; ostatním ji ukážeš přepínačem **„Ukázat trasu ostatním"** po ukončení. Appka si pamatuje posledních 30 vycházek. Díry (appka byla na pozadí) se kreslí tečkovaně. **Kde jsme už hledali** (Nastavení) kreslí staré trasy do mapy.

**Jak nálezy a vycházky mění mapu:**
- nález kohokoli z rodiny → cesty do 300 m od něj **žlutě**, místo „kde začít" i v „Kam dnes" výš. Váha podle vzdálenosti (do 100 m plně, do 300 m 0,6, do 750 m 0,1) a stáří (do 2,5 roku plně, do 5,5 roku 0,7, starší 0,3);
- celá vycházka bez nálezu → cesty do 30 m od trasy **šedě čárkovaně** na 21 dní (prvních 7 dní plně, pak slábne). Novější nález u té cesty to přebije.

---

## Filtry (karta Co hledáme)

Klepnutím na horní lištu:

- **Houba** — Vše, nebo jeden z osmi druhů (bedly, hřib smrkový, hřib dubový, hřib žlutomasý, křemenáč, kozák, klouzky, masák). „Vše" hodnotí les podle hub, které teď rostou.
- **Porost** — vše / listnatý / smíšený / jehličnatý.
- **Dojezd z domova** — 20, 45, 60, 90 nebo 150 minut, **skutečné minuty za volantem** (jen pro Kam dnes).
- **Rezervace** — Vynechat / Nevadí (jen pro Kam dnes; ověřuje se u AOPK).
- **Kde je nejblíž?** — konkrétní houba: nejbližší nahlášené nálezy a vhodná místa podle vzdálenosti.

## Vrstvy

Dlaždice **Vrstvy** vedle horní lišty: **Podklad** mapa / letecká (ČÚZK) a přepínače **Kde sbírat** (porosty a cesty), **Ověřené nálezy** (GBIF), **Parkoviště u lesa**. Další vrstvy jsou v **Nastavení**: **Lesy** (porosty podle druhu), **Chráněná území** (AOPK), **Kde jsme už hledali**, **Nejlepší místa** (čtverce 500 × 500 m podle vašich nálezů).

> ⚠️ **V rezervacích a v klidových územích národních parků se houby sbírat nesmí.** Vrstva chráněných území ukáže, kde si to ověřit — není to povolenka.

## Oblíbená místa

Hvězdička v bublině místa nebo na kartě Kam dnes; vlastní místo **podržením prstu na mapě** nebo v **Nastavení → Přidat střed mapy**. Vidí je celá rodina a v Kam dnes mají přednost.

---

## Řešení problémů

**Mapa je šrafovaná** — tuhle dlaždici telefon nemá: buď jsi bez signálu a oblast není stažená, nebo server s mapou neodpovídá. Doma: **Nastavení → Stáhnout výřez**.

**Nejsou vidět zelené porosty ani červené cesty** — kreslí se od přiblížení zhruba na obec a potřebují signál (ČÚZK). Bez signálu zůstane zelený podklad. Zkontroluj taky, že ve **Vrstvách** je zapnuté **Kde sbírat**.

**Červená čára vede mimo les** — jsou to cesty po okraji vhodného porostu (do 12 m). Mapa cest je z ČÚZK a nemusí znát každou novou svážnici; v terénu má přednost to, co vidíš.

**Auto je jinde, než jsem ho nechal** — pozici má ten, kdo označil naposledy. Přepsání cizího auta a smazání chce potvrzení.

**Ve spodní liště jsem dvakrát** — každý prohlížeč má vlastní UID, takže iPhone a MacBook jsou dva uživatelé.

**Nevidím svoji polohu** — (1) *Sdílím polohu* zapnuté, (2) Nastavení iPhonu → Soukromí → Polohové služby, (3) Safari → Poloha *Zeptat se* nebo *Povolit*. V hustém lese může první GPS fix trvat minutu.

**Nevidím ostatní** — vidíš jen ty, kdo mají zapnuté sdílení a appku otevřenou na displeji, a kdo se připojil rodinným odkazem s `#k=…`.

**Tečka u jména (Nastavení) je červená** — appka se nepřipojila k Firebase: chyba v `config.js` (často chybí `databaseURL`) nebo v pravidlech.

**Šipka k autu se netočí** — klepni na šipku v žlutém listu auta a povol kompas. Bez povolení appka píše azimut (0° sever, 90° východ…).

**Appka se neaktualizovala** — nahoře se ukáže „Je připravená nová verze" → **Načíst**. Když ne, zavři appku úplně a otevři znovu.

**Diagnostika** — Menu → Nastavení → dole. Když něco nesedí se zobrazením, vyfoť ji Matějovi.

---

## Náklady

| Položka | Tarif | Cena |
|---|---|---|
| GitHub Pages | Free | **0 Kč** |
| Firebase Realtime Database | Spark (free) | **0 Kč** |
| Mapové podklady a data | OpenStreetMap, ČÚZK, AOPK, NLI, Open-Meteo, OSRM, GBIF | **0 Kč** |

Pět lidí, aktivně 8 hodin denně osm dní v měsíci: zhruba 115 000 zápisů polohy a 70 MB přenosu měsíčně, tedy **0,7 % z 10GB limitu** Firebase. Placený tarif nepotřebujete.

---

## Ochrana soukromí

- V databázi je: jméno, poslední souřadnice a čas — plus **nálezy** a **trasy, které někdo vědomě nasdílel**. Nesdílené trasy zůstávají v telefonu.
- Data vidí jen členové rodiny (rodinný odkaz s kódem).
- Mapové služby (ČÚZK, AOPK, NLI) dostávají jen výřez mapy, na který se díváš, Open-Meteo jen souřadnice míst, pro která se počítá počasí, OSRM jen body pro výpočet dojezdu. Žádné jméno, žádný nález.
- **Živé sdílení polohy** je po každém otevření appky **vypnuté** — pokaždé vědomé rozhodnutí.
- Kdo chce pryč: **Nastavení → Odejít z rodinné mapy** (smažou se i jeho sdílené trasy a nálezy).
