# Houby – naše mapa

Sdílená aplikace pro dva: houbařské lokality kolem Mratína, **zaparkované auto** a **poloha obou** na mapě.
Otevírá se v prohlížeči, přidá se na plochu telefonu jako ikona. Žádný App Store, žádné poplatky.

---

## Co appka umí a co ne — přečti si to jako první

| Funkce | Jak to funguje |
|---|---|
| Mapa 16 houbařských lokalit | ✅ Vždy, i bez signálu (pokud sis oblast stáhla) |
| **Označení zaparkovaného auta** | ✅ Spolehlivě. Jeden zápis, druhý to vidí do sekundy |
| Navigace zpět k autu (vzdálenost + šipka) | ✅ Funguje i bez signálu, GPS signál stačí |
| Poloha druhého na mapě | ⚠️ **Jen dokud má appku otevřenou na displeji** |

### Proč to poslední omezení

**Safari na iPhonu zastaví sledování polohy ve chvíli, kdy zamkneš telefon nebo přepneš do jiné aplikace.** Apple to webovým aplikacím nedovolí, žádná webová appka to neobejde a nejde to zaplatit ani obejít trikem.

Prakticky: když má manželka telefon v kapse, její poloha se v appce **neaktualizuje**. Proto je u cizí polohy vždy napsané, jak je stará, a po pěti minutách bod zešedne a napíše „naposledy před 23 min". Nikdy nevěř šedému bodu jako aktuální pozici.

**Rozdělení rolí, se kterým to funguje:**

| | Na co |
|---|---|
| **Tahle appka** | Lokality, zaparkované auto, poloha když ji máte otevřenou v ruce |
| **Najít (Find My)** | Průběžné sledování na pozadí — kde je ten druhý, když má telefon v kapse |

Sdílení polohy v Najít si zapněte jednou: **Najít → Lidé → Sdílet moji polohu → vybrat druhého → Sdílet neomezeně**. Je to zdarma, běží na pozadí a je optimalizované na baterii — přesně to, co web na iOS neumí. V appce je na to tlačítko **Najít** vpravo dole.

---

# Nastavení — jednorázově, cca 30 minut

Postupuj shora dolů. Po každém kroku je napsané, co máš vidět.

## Krok 1 — Firebase projekt (10 min)

Firebase je databáze od Googlu, přes kterou si vaše dva telefony předávají pozici auta a polohy. Bezplatný tarif nám bohatě stačí.

1. Jdi na **https://console.firebase.google.com** a přihlas se Google účtem.
2. Klikni **Vytvořit projekt** (Create a project).
3. Název: třeba `houby-mratin`. Klikni **Pokračovat**.
4. Google Analytics **vypni** (přepínač doleva) — nepotřebujeme. **Vytvořit projekt**.
5. Počkej, až se projekt vytvoří, a klikni **Pokračovat**.

**Zapni databázi:**

6. V levém menu **Sestavení (Build) → Realtime Database**.
7. Klikni **Vytvořit databázi**.
8. Umístění: vyber **europe-west1 (Belgie)** — je nejblíž, bude to nejrychlejší.
9. Bezpečnostní pravidla: vyber **Spustit v uzamčeném režimu (locked mode)**. Pravidla nastavíme správně v kroku 4.
10. **Povolit / Enable.**

> ✅ Máš vidět prázdnou databázi a nahoře adresu ve tvaru
> `https://houby-mratin-default-rtdb.europe-west1.firebasedatabase.app`

**Zapni anonymní přihlašování:**

11. V levém menu **Sestavení → Authentication → Začít (Get started)**.
12. Karta **Sign-in method** → v seznamu najdi **Anonymní (Anonymous)** → klikni na něj.
13. Přepni na **Povoleno (Enable)** → **Uložit**.

> ✅ V seznamu má být u „Anonymní" stav **Povoleno**.

## Krok 2 — Zkopírovat údaje do `config.js` (5 min)

1. V levém horním rohu klikni na **⚙ (ozubené kolo) → Nastavení projektu**.
2. Sjeď dolů na **Vaše aplikace**. Klikni na ikonu **`</>`** (Web).
3. Přezdívka aplikace: `houby`. **Zaregistrovat aplikaci.**
4. Zobrazí se blok kódu `const firebaseConfig = { ... }`.
5. Otevři soubor **`config.js`** v textovém editoru a přepiš hodnoty. Přepisuješ **jen text mezi uvozovkami**, uvozovky a čárky nech být:

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

> ⚠️ **`databaseURL` ve Firebase konzoli u webové aplikace často chybí.** Vezmi ji z **Realtime Database** (krok 1, bod 9) a doplň ji ručně. Bez ní appka nesdílí nic.

> ✅ V `config.js` už nesmí zůstat žádné `SEM_VLOZ_`.

> **Je bezpečné mít tyhle údaje veřejně?** Ano. Firebase klíče nejsou heslo — jsou to jen adresy. Přístup hlídají pravidla databáze, která nastavíme v kroku 4.

## Krok 3 — Nahrát na web (10 min)

1. Založ si účet na **https://github.com** (pokud ho nemáš).
2. Vpravo nahoře **+ → New repository**.
3. Název: `houby`. Zvol **Public**. **Create repository.**

> Public znamená, že kód je viditelný. Vaše polohy ale v kódu nejsou — ty jsou v databázi, kterou zamkneme v kroku 4.

4. Na stránce nového repozitáře klikni **uploading an existing file**.
5. Přetáhni **všech 7 souborů**: `index.html`, `config.js`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `README.md`.
6. Dole klikni **Commit changes**.
7. Nahoře **Settings → Pages** (levé menu).
8. V sekci **Build and deployment → Source** vyber **Deploy from a branch**, Branch **main**, složka **/ (root)**, **Save**.
9. Počkej 1–2 minuty a stránku obnov.

> ✅ Nahoře uvidíš zelený rámeček s adresou ve tvaru
> **`https://tvojejmeno.github.io/houby/`**
> To je odkaz, který pošleš manželce. Otevři ho a měl bys vidět mapu.

## Krok 4 — Zamknout databázi na vaše dva telefony (5 min)

Zatím je databáze v uzamčeném režimu a nikdo do ní nesmí. Teď do ní pustíme přesně vás dva.

1. **Otevři odkaz na svém telefonu.** Appka se sama anonymně přihlásí.
2. Klepni vpravo nahoře na **ℹ️**. Dole v okně uvidíš **Tvoje UID** — dlouhý řetězec písmen a čísel. Zkopíruj ho (třeba si ho pošli sám sobě do zprávy).
3. **To samé udělá manželka** na svém telefonu a UID ti pošle.
4. Ve Firebase konzoli jdi na **Realtime Database → karta Pravidla (Rules)**.
5. Smaž, co tam je, a vlož tohle. **Nahraď `UID_MATEJ` a `UID_MANZELKA` skutečnými UID** (uvozovky nech):

```json
{
  "rules": {
    ".read":  "auth != null && (auth.uid === 'UID_MATEJ' || auth.uid === 'UID_MANZELKA')",
    ".write": "auth != null && (auth.uid === 'UID_MATEJ' || auth.uid === 'UID_MANZELKA')"
  }
}
```

6. Klikni **Publikovat (Publish)**.

> ✅ V appce se má tečka vlevo nahoře (vedle jména) rozsvítit **zeleně** = jsi připojený. Když je šedá, nemáš signál. Když je červená, něco není v pořádku — viz Řešení problémů.

> **Proč to takhle:** anonymní přihlášení dá každému telefonu trvalé UID. Pravidla pouští dovnitř jen ta dvě vyjmenovaná. Kdokoli jiný odkaz otevře, uvidí mapu lokalit, ale k vaší poloze ani k autu se nedostane.

## Krok 5 — Přidat na plochu iPhonu (2 min, každý zvlášť)

1. Otevři odkaz **v Safari** (ne v Chrome — na iOS to musí být Safari).
2. Klepni na ikonu **Sdílet** (čtvereček se šipkou nahoru, dole uprostřed).
3. Sjeď dolů → **Přidat na plochu**.
4. Název nech `Houby` → **Přidat**.

> ✅ Na ploše máš ikonu s houbou. Po klepnutí se appka otevře na celou obrazovku bez adresního řádku.

---

## Jaká povolení telefon vyžádá

| Povolení | Kdy se zeptá | Co to dělá | Když odmítneš |
|---|---|---|---|
| **Poloha** | Při zapnutí přepínače *Sdílím polohu* nebo při označení auta | GPS pro tvoji pozici a pro pozici auta | Nefunguje označení auta ani navigace zpátky |
| **Kompas / pohyb** | Při klepnutí na kolečko se šipkou | Otáčení šipky podle toho, kam se díváš | Šipka se netočí, ale ukáže se azimut ve stupních a vzdálenost |

Poloha se sdílí **jen když je přepínač *Sdílím polohu* zapnutý**. Po zavření appky se přepínač vždycky vrátí na vypnuto — nikdo tě nesleduje na pozadí, ani omylem.

---

## Jak se to používá v lese

1. **Doma na Wi-Fi**: přibliž mapu na oblast, kam jedete, a klepni **Offline**. Stáhnou se dlaždice mapy pro ten výřez, takže mapa pojede i bez signálu.
2. **U auta**: klepni na velké oranžové **🚗 Zaparkoval jsem tady**. Objeví se oranžový pin a manželka ho hned vidí.
3. **V lese**: zapni **Sdílím polohu**. Panel nahoře ukazuje vzdálenost k autu a šipku k němu. Chceš-li, aby displej nezhasínal, zapni **Displej svítí** (bere to baterku).
4. **Zpátky u auta**: klepni na koš 🗑 v panelu, aby se pozice smazala a příště tě nemátla.

---

## Řešení problémů

**Mapa je prázdná / šedá**
Nemáš signál a tenhle výřez není stažený offline. Doma na Wi-Fi otevři appku, najdi oblast a klepni **Offline**. Mimo stažený výřez mapa prostě nebude — je to omezení pravidel OpenStreetMap, hromadné stahování map není povolené.

**Nevidím svoji polohu**
Zkontroluj tři věci: (1) přepínač *Sdílím polohu* je zapnutý, (2) Nastavení → Ochrana soukromí → Polohové služby je zapnuté, (3) Nastavení → Safari → Poloha je *Zeptat se* nebo *Povolit*. V hustém lese může první GPS fix trvat i minutu — vyjdi na světlejší místo.

**Nevidím manželku**
Nejčastěji proto, že **nemá appku otevřenou na displeji** — viz vysvětlení na začátku. Zkontroluj taky, že má zapnutý svůj přepínač *Sdílím polohu* a že je její UID v pravidlech databáze (krok 4). U jejího jména je vždycky napsané, co se děje.

**Tečka vlevo nahoře je červená**
Appka se nepřipojila k Firebase. Buď je chyba v `config.js` (nejčastěji chybějící `databaseURL`), nebo nejsou obě UID v pravidlech. Klepni na ℹ️ a zkontroluj, že tam UID vůbec je — když tam není, přihlášení neproběhlo.

**Šipka k autu se netočí**
Nedal jsi povolení ke kompasu. Klepni na kolečko se šipkou a povol to. Když povolení nedáš, appka místo toho píše azimut ve stupních — 0° je sever, 90° východ, 180° jih, 270° západ.

**Vzdálenost k autu skáče**
Normální. GPS má v lese pod korunami přesnost klidně ±30 m. Když je přesnost horší než 20 m, appka to napíše. Na posledních pár desítek metrů se řiď spíš terénem než šipkou.

**Appka se neaktualizovala po nahrání změn na GitHub**
Service worker drží starou verzi. Zavři appku úplně (vytáhni ji z přepínače aplikací) a otevři znovu. Případně Nastavení → Safari → Vymazat historii a data.

---

## Náklady

| Položka | Tarif | Co spotřebujeme | Cena |
|---|---|---|---|
| GitHub Pages | Free | pár set kB, 1 GB limit | **0 Kč** |
| Firebase Realtime Database | Spark (free) | viz níže | **0 Kč** |
| Mapové podklady | OpenStreetMap | dlaždice, cache v telefonu | **0 Kč** |

**Propočet Firebase.** Bezplatný tarif Spark dává 1 GB uložených dat, 10 GB stažených dat měsíčně a 100 současných připojení.

Poloha se zapisuje maximálně jednou za 10 sekund, jeden zápis má kolem 150 bajtů. Dva lidé, kteří appku aktivně používají 8 hodin denně osm dnů v měsíci:

`2 osoby × 6 zápisů/min × 60 min × 8 h × 8 dní ≈ 46 000 zápisů ≈ 7 MB přenosu měsíčně`

To je **necelé promile** bezplatného limitu. Uložených dat je v databázi trvale pár set bajtů — jedna pozice auta a dva záznamy o lidech. Ani při mnohem intenzivnějším používání se do placeného tarifu nedostanete.

Jediný způsob, jak by se limit vyčerpal, je zveřejnit odkaz a nechat databázi otevřenou pro kohokoli. Proto krok 4 — s pravidly omezenými na dvě UID to nehrozí.

---

## Ochrana soukromí

- V databázi je uložené: jméno, které si každý zvolil, poslední souřadnice, přesnost a čas. Nic víc. Žádná historie pohybu, žádné ukládání trasy.
- Data vidí jen ty dvě UID v pravidlech. Firebase konzole je pod tvým Google účtem.
- Přepínač sdílení je po každém otevření appky **vypnutý**. Sdílení musí být pokaždé vědomé rozhodnutí.
- Když chceš skončit: ve Firebase konzoli **Realtime Database → Data → smazat vše**, nebo rovnou celý projekt v Nastavení projektu.
