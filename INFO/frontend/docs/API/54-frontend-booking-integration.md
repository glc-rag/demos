# Frontend és külső integráció: booking API és intake

Ez az oldal **külső fejlesztőknek** (web, mobil, más backend) ad irányt: hogyan illeszkedik a **booking** folyamat az **OpenAPI** dokumentációhoz, és hol **nem** elég önmagában az `openapi.json`.

---

## Forrás: OpenAPI vs. quickstart

| Forrás | Szerep |
|--------|--------|
| **`/openapi.json`** (vagy Redoc) | A hivatalos **request/response mezőnevek és típusok** a generált sémák szerint. |
| **Quickstart** | Magyarázat, folyamat, gyakori hibák; **nem** írja felül az OpenAPI-t. |

Eltérés esetén mindig az **OpenAPI** az irányadó.

---

## Mit ír le az OpenAPI a booking intake-nél?

A nyilvános intake lépés tipikusan:

- **`POST /api/v1/booking/intake/step`**

A request/response **felső szintű** szerkezete a sémában megjelenik, például:

- **Request:** `booking_type_id`, `answers` (kulcs–érték párok).
- **Response:** `done`, opcionálisan `outcome`, `message_key`, `next_question`, `unit_filter`, stb.

---

## Hol „laza” a séma (fontos külső fejlesztőnek)

A backend egyes mezőket **általános JSON objektumként** (`object` / `additionalProperties`) ad meg a generált OpenAPI-ban, mert a Pydantic modell **`Dict[str, Any]`** szinten van megadva. Ilyenek lehetnek többek között:

- **`next_question`** – a következő kérdés teljes szerkezete (típus, szöveg, opciók, stb.).
- **`unit_filter`** (ahol szerepel) – szűrési feltételek.
- Admin oldalon az intake definíció **`schema_json`** mezője.
- Foglalás létrehozásakor **`intake_responses`** elemek, ha `Dict` listaként van modellezve.

**Következmény:** az `openapi.json` **nem ad teljes, típusos leírást** arról, hogy egy adott tenantnál pontosan milyen mezők jelennek meg a `next_question`-ben. Ez **nem hiba** a dokumentációban, hanem a **dinamikus, tenant- és sémafüggő** intake modell következménye.

---

## Hogyan lehet így is biztonságosan integrálni?

1. **Élő API válaszok** – fejlesztés közben hívd a `POST .../intake/step` végpontot (megfelelő auth: pl. `X-Panel-Token` vagy a környezeted szerinti JWT), és a **visszakapott JSON** alapján építs UI-t vagy validációt.
2. **Tenant intake séma** – ha van hozzáférésed admin API-hoz, az intake definíció **`schema_json`** mezője tartalmazza a logikai sémát; ezt érdemes összevetni a futó válaszokkal.
3. **Generált kliens** – OpenAPI-ból generált kliens a fenti `Dict` / `object` részekre gyakran csak „bármilyen objektumot” ad; **TypeScript típusok** ehhez kézzel vagy futás idejű validációval (pl. JSON Schema, ha exportálható) egészíthetők ki.
4. **Tesztek** – snapshot vagy contract teszt a tipikus `next_question` alakokra a saját tenantodra.

---

## Összefoglalás

| Kérdés | Válasz |
|--------|--------|
| Fejleszthető-e külső app csak OpenAPI + quickstart alapján? | **Igen**, ha elfogadod, hogy az intake **kérdés-szerkezete** futás közben derül ki részletesen. |
| Elég-e az `openapi.json` egy teljesen típusos intake UI generálásához? | **Gyakran nem** – a `next_question` szintű mezők általános objektumként jelennek meg. |
| Mi a minimum, ami kell a biztos integrációhoz? | **Base URL + auth**, `openapi.json` a top-level contracthoz, és **élő válaszok** vagy **admin `schema_json`** a részletes kérdőív viselkedéséhez. |

---

## Kapcsolódó dokumentumok

- [00-attekinto.md](./00-attekinto.md) – Base URL, Redoc / openapi.json
- [53-booking-api.md](./53-booking-api.md) – teljes booking folyamat, auth, panel token
- [41-endpoint-matrix.md](./41-endpoint-matrix.md) – végpontok áttekintése
- [39-documentation-conventions.md](./39-documentation-conventions.md) – dokumentációs konvenciók
- [40-best-practices.md](./40-best-practices.md) – integrációs jó gyakorlatok

Ennek az oldalnak a fókusza az **OpenAPI korlát** és a **külső fejlesztői stratégia**; a booking viselkedés részletei: [53-booking-api.md](./53-booking-api.md).
