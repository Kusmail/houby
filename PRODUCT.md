# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Rodina, která chodí na houby po Česku. Primárně zadavatel a jeho manželka, dále další členové rodiny včetně starších lidí a dětí (potřebují větší písmo a jednoduché ovládání).
- Situace 1 – v lese: telefon v jedné ruce, košík v druhé, často na slunci nebo v šeru pod stromy, slabý nebo žádný signál.
- Situace 2 – doma: vsedě plánují, kam vyrazit (filtry, „Kam dnes na houby", oblíbená místa).

## Product Purpose

Osobní mapa na houbaření v ČR. Ukazuje, kde a kdy jsou pro houby podmínky (porosty z map ČÚZK, počasí, sezóna), navrhuje, kam dnes vyrazit autem, naviguje k zaparkovanému autu, ukládá vlastní nálezy a sdílí polohu, auto a nálezy v rámci rodiny. Úspěch: v lese rychle najít vhodný porost a cestu zpět k autu; doma během minuty vědět, jestli a kam jet.

## Positioning

Jediná appka, která spojuje porostní mapu ČÚZK, počasí a sezónu podle skutečných nálezů (GBIF) s rodinným sdílením auta a nálezů – a umí to i bez signálu v lese.

## Operating Context

- iPhone, appka přidaná na plochu (standalone PWA); sekundárně desktop Chrome.
- V lese bez signálu: mapa, porosty a podmínky ze zálohy, záznam trasy, ukládání nálezů do fronty.
- Rodinné sdílení přes Firebase (anonymní účty, rodinný odkaz s kódem).

## Capabilities and Constraints

- Jeden soubor `index.html` (HTML + CSS + JS, Leaflet inlinovaný), žádný build, žádné závislosti z CDN kromě knihovny Firebase. Identifikátory v češtině.
- Terminologie v UI: „podmínky" (ne „šance"), stupně dobré / průměrné / slabé / mizivé.
- Funkce: mapa s porosty a podmínkami, filtry (houba, porost, dojezd, rezervace), Kde je nejblíž, Kam dnes na houby, Najdi les kolem mě, Určit houbu (Google Lens), označení auta a navigace k němu, nálezy, trasy, oblíbená místa, sdílení polohy, displej svítí, offline mapy, nastavení, diagnostika.
- Každá změna se měří před a po a nasazuje jako samostatná verze.

## Evidence on Hand

- 7 656 parkovišť u lesa (`mista.json`), 1 802 nálezů z GBIF (`nalezy-gbif.json`).
- Měření modelu: porosty vybírají místo s AUC 0,561 (s konkrétní houbou), „Vše" 0,542 (od v122).
- Žádné recenze, uživatelé ani reference mimo rodinu – nevymýšlet.

## Product Principles

1. Mapa je hlavní; ovládání jí ustupuje.
2. V lese musí jít všechno jednou rukou, na slunci a bez signálu.
3. Říct pravdu: žádné „šance", jen podmínky a čísla, která jsou změřená.
4. Méně textu v ovládání; vysvětlení až na vyžádání.

## Accessibility & Inclusion

- Čitelnost pro starší členy rodiny: dostatečně velké písmo, kontrast ≥ 4,5 : 1 ve světlém i tmavém režimu.
- Dotykové cíle ≥ 44 px, ovladatelné palcem jedné ruky.
