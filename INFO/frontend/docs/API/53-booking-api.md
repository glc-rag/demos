# Booking API (PLAN-05)

Ez a dokumentum a **foglalási** REST API-t írja le. A végpontok két prefix alatt futnak:

| Prefix | Szerep |
|--------|--------|
| `/api/v1/booking` | Foglalástípusok, elérhetőség, intake, foglalások, admin CRUD |
| `/api/v1/booking/panel` | **Booking Panel token** admin CRUD (nem azonos a Public Widget tokennel) |

**Integration source of truth:** az OpenAPI spec (`openapi.json` / Redoc); eltérés esetén az OpenAPI az irányadó. A tag nevek: **Booking**, **booking-panel-token**.

**Kapcsolódó kód (áttekintés):**

| Terület | Fő fájlok / modulok |
|---------|---------------------|
| HTTP router | `src/modules/booking/router.py` |
| Panel token router | `src/modules/booking/panel_token_router.py` |
| Tenant / booking engedélyezés / kredit | `src/modules/booking/deps.py` |
| Idő normalizálás (tenant TZ → UTC) | `src/modules/booking/datetime_normalization.py` |
| Ütemezés, foglalás létrehozás/módosítás | `src/modules/booking/scheduling_service.py` |
| Szabad slotok | `src/modules/booking/availability_service.py` |
| Policy (előrefoglalás, létszám, buffer) | `src/modules/booking/policies.py` |
| Intake (kérdőív) | `src/modules/booking/intake_engine.py` |
| Request/response sémák | `src/modules/booking/schemas.py` |
| Domain hibák | `src/modules/booking/errors.py` (`BookingErrorCode`) |

---

## Előfeltételek: `booking_enabled` és token egyenleg

Minden `/api/v1/booking/...` hívás előtt a backend ellenőrzi, hogy a tenantnál **bekapcsolt** legyen a booking modul (`require_booking_enabled`). Ha nem, válasz: **403**, `detail.error_code`: `BOOKING_DISABLED`.

**Új foglalás** (`POST /api/v1/booking/reservations`): emellett **pozitív token egyenleg** kell a tenantnak (`require_booking_enabled_with_credit`). Ha nincs, válasz: **402**, `BOOKING_CREDIT_EXHAUSTED`.

---

## Tenant azonosítás és hitelesítés

A `tenant_id` feloldása a **`get_current_tenant_id`** logikáját követi (`deps.py`):

1. **JWT** (`Authorization: Bearer ...`): a tokenben lévő `tenant_id` az alapértelmezett céltenant.
2. **SYSTEM_ADMIN**: céltenant felülírható **`X-Tenant-ID`** headerrel vagy **`tenant_id` query** paraméterrel.
3. **JWT nélkül**, ha van **`X-Tenant-ID`** vagy **`tenant_id` query** → ezek használhatók (pl. beágyazott panel).
4. **Booking Panel token**: header **`X-Panel-Token`** (vagy `x-panel-token`) **vagy** query **`panel_token`**. A nyers token hash-sel egyezik a `booking_panel_token` táblában; érvénytelen token → **401**, `PANEL_TOKEN_INVALID`.

**Fontos:** a **Public Widget chat token** (`02-auth-widget-token.md`, `52-admin-public-widget-tokens.md`) **nem** ugyanaz, mint a **Booking Panel token**. Utóbbit a tenant admin a **`/api/v1/booking/panel/tokens`** végpontokon hozza létre.

**Admin végpontok** ( `/api/v1/booking/admin/...` ): **JWT** kötelező, és a szerepkör **`require_role`** szerint (lásd táblázatok). A tenant általában **`get_current_tenant_id`** + JWT-ből jön; SYSTEM_ADMIN + `X-Tenant-ID` / `tenant_id` más tenant admin adatait éri el.

**Bejelentkezett ügyfél / belső felhasználó** (JWT): egyes foglalás-műveletek **kifejezetten JWT-t** kérnek (`get_current_user`), nem elég a panel token – lásd „JWT kötelező” alább.

Kapcsolódó általános auth: [01-auth-jwt.md](01-auth-jwt.md).

---

## Idő, időzóna, tárolás

| Fogalom | Viselkedés a kódban |
|---------|---------------------|
| **Tenant időzóna** | `booking_tenant_config.timezone`; ha hiányzik vagy érvénytelen, **`Europe/Budapest`** (és rossz TZ név esetén az értelmezés **`UTC`** felé esik vissza a `ZoneInfo` hibánál). |
| **Naive datetime** | Ha a kérésben `start_time` / `end_time` **nincs időzónával**, a szerver **tenant helyi időként** értelmezi, majd **UTC-re** konvertál (`datetime_normalization.to_utc_aware`). |
| **Aware datetime** | Ha van `tzinfo`, **nincs dupla értelmezés**: közvetlenül UTC-re konvertálódnak. |
| **Tárolás** | Foglalás időpontjai **UTC-ben** (`ReservationDB.start_time` / `end_time`). |
| **`target_date` (slot lista)** | **`date`** típus (napi naptár nap); a szerver a tenant naptárában számolja a szabad slotokat az adott napon. |

**Fejlesztői javaslat:** integrációnál mindig küldj **explicit offsetet vagy Z-t** (`2026-04-08T10:00:00+02:00` vagy `...Z`), ha a kliens nem a tenant TZ-ben számol; így elkerülhető a félreértés naive idő esetén.

---

## Foglalástípus (`BookingType`): mi van implementálva

A **`GET /api/v1/booking/types`** csak **aktív** típusokat ad vissza. A válasz **`BookingTypeResponse`** mezői a policy + meta összefoglalói.

### `time_model` (kötelező értelmezés)

| Érték | Jelentés |
|-------|----------|
| **`slot`** | Diszkrét kezdő időpontok (tipikusan fix hossz vagy `default_duration_min`). A slot payloadban az **`available_capacity`** gyakran üres. |
| **`interval`** | Időintervallum-alapú modell; az egységhez tartozó **`available_capacity`** a séma szerint az **egy foglalásra vonatkozó max. létszám** (nem „maradék hely” más foglalásnak). |

### Policy mezők (válaszban)

| Mező | Szerep |
|------|--------|
| `min_advance_hours` | Minimum hány órával korábban foglalhat a **vendég** (admin felvitel részben felülírható – lásd admin create). |
| `max_advance_days` | Maximum hány napra előre foglalható. |
| `min_party_size` / `max_party_size` | Létszám korlát. |
| `buffer_before_min` / `buffer_after_min` | Foglalás előtti/utáni buffer (perc) – ütközés- és policy számításokban. |
| `slot_step_min` | Kezdő időpontok lépésköze a slot/interval listában; **hiány vagy nem pozitív** esetén a szerver **15 percet** használ. |
| `cancellation_window_hours` | Lemondási ablak (ügyfél/admin szabályok – a tényleges ellenőrzés a `SchedulingService` / policy rétegben történik). |

### Egyéb viselkedés

| Mező | Leírás |
|------|--------|
| `default_duration_min` | Alapértelmezett időtartam (perc). |
| `pool_occupancy_mode` | `exclusive` \| `cross_reference` \| `shared_capacity` – pool/időablak foglaltság szabályai (bináris vs. létszámösszeg). |
| `requires_capacity` | Ha `true`, a foglalás létszáma nem haladhatja meg a kiválasztott egység kapacitását. |
| `requires_intake` | Intake kötelező-e. |
| `confirmation_mode` | `auto` \| `manual` – jóváhagyási mód. |
| `config` | Típus-specifikus JSON (pl. multi-unit / táblás split – lásd slot `listing_mode` és `panel_multi_unit_*` mezők). |
| `active_intake_definition_id`, `intake_version`, `intake_question_count`, `intake_first_question_preview` | Aktív intake séma meta (LLM + UI). |

**Csak azt írjuk le integrációban / AI instrukcióban, ami a fenti mezőkben és a kapcsolódó végpontokban megjelenik** – ne vegyünk fel nem implementált „jó lenne” viselkedést.

---

## Szabad helyek: `GET /availability/slots`

**Query paraméterek (lényeg):** `booking_type_id`, `target_date`, `party_size` (default 1), opcionálisan `unit_filter_key` + `unit_filter_value`, **`unit_filter_attributes`** (JSON string: több attribútum **AND**), **`listing_mode`**: `default` \| `per_resource` \| `auto` (röviden: `per_resource` ≈ egy sor egy erőforrás; `auto` a foglalástípus `config` + létszám alapján dönt).

**Admin változat:** `GET /api/v1/booking/admin/availability/slots` – **ugyanaz a logika**, JWT + EDITOR+ szerepkör; explicit „admin útvonal”.

Válasz: `SlotAvailabilityResponse` – `slots`: `SlotDTO[]` (`start_time`, `end_time`, `duration_min`, `unit_ids`, opcionálisan `unit_labels`, `booking_type_id`, `available_capacity`, ár mezők).

---

## Intake (kérdőív)

- **`POST /api/v1/booking/intake/step`**: body `booking_type_id` + `answers` (kulcs–érték stringek). Válasz: `done`, `next_question` vagy befejezés, `outcome`, `unit_filter` (slot API-hoz), `message_key` elutasításnál.
- Ha nincs aktív intake séma → azonnali `done=true`, `outcome=booking_allowed`.

Admin oldalon az intake definíciók: **`/admin/booking-types/{booking_type_id}/intake-definitions`** és **`/admin/intake-definitions/...`** (lista, létrehozás, GET/PUT, deaktiválás, opcionális hard delete).

---

## Foglalás létrehozása és csatornák

**`POST /api/v1/booking/reservations`** – body: `CreateReservationRequest`:

- Kötelező: `booking_type_id`; ügyfél: **`customer_id`** **vagy** **`customer_email`** (név/telefon opcionális – hiányzó emailnél a szerver létrehoz/keres ügyfelet).
- Idő: **`start_time` / `end_time`** slot/interval modellnél (normalizálás: fent).
- `party_size`, `unit_ids`, `intake_responses`, `channel`: `web` \| `chat` \| `phone` \| `panel` \| `voice` \| `in_person`.
- **Panel multi-unit folyamat:** `panel_multi_unit_session_id` – **csak** `channel=panel` mellett; a session érvényesítése és a válasz `panel_multi_unit_*` mezők a `panel_multi_unit_session` modulban vannak.

Sikeres út: intake validáció → policy check → `SchedulingService.create_reservation`. Ütközés: **409** `BOOKING_CONFLICT`; policy: **422** `BOOKING_POLICY_VIOLATION`; intake tiltás: **422** `BOOKING_INTAKE_DENIED`.

---

## Publikus / email-alapú műveletek (JWT nélkül is)

| Metódus | Útvonal | Megjegyzés |
|---------|---------|------------|
| GET | `/reservations/lookup` | `email` + `reservation_id` – részletes foglalás |
| DELETE | `/reservations/self-cancel` | Ugyanígy email + id; ügyfél szerepkörrel törlés |
| PATCH | `/reservations/self-modify` | Body: `start_time`, `end_time` (opcionális); csak `confirmed` / `tentative` |
| GET | `/reservations/{id}/ics` | Naptár letöltés; email ellenőrzés |

---

## JWT kötelező (nem elég a panel token)

| Metódus | Útvonal | Szerep |
|---------|---------|--------|
| GET | `/reservations/{reservation_id}` | Foglalás részletek – `tenant_id` a JWT-ből |
| DELETE | `/reservations/{reservation_id}` | Lemondás – `actor` ügyfél |
| PATCH | `/reservations/{reservation_id}/confirm` | Megerősítés, ha a policy engedi |

---

## Admin végpontok (összefoglaló)

**Prefix:** `/api/v1/booking/admin/...` – JWT + **`require_booking_enabled`** + szerepkör.

| Csoport | Szerepkör (tipikus) | Példa útvonalak |
|---------|---------------------|-----------------|
| Sablonok | EDITOR+ lista; **TENANT_ADMIN** apply | `GET /templates`, `POST /templates/apply` |
| Foglalások | EDITOR+ | `POST /reservations`, `PUT /reservations/{id}`, `DELETE /reservations/{id}`, `GET /reservations`, `GET /reservations/{id}/detail`, `POST /reservations/bulk-cancel`, `GET /reservations/export`, `POST .../confirm`, `POST .../no-show` |
| Ügyfelek | EDITOR+; merge: **TENANT_ADMIN+** | `GET /customers`, `GET /customers/search`, `GET /customers/{id}`, `POST /customers/merge` |
| Statisztika | EDITOR+ | `GET /stats/summary`, `/stats/by-type`, `/stats/by-channel` |
| Egység ütemezés | EDITOR+ | `GET /units/{unit_id}/schedule` |
| Elérhetőségi szabályok | EDITOR+ | `GET|POST /rules`, `PUT|DELETE /rules/{rule_id}` (egyszerre csak `unit_id` **vagy** `booking_type_id` szűrő listánál) |
| Foglalástípusok | Változó: create/deactivate/hard delete **TENANT_ADMIN+** | `GET /booking-types`, `POST /booking-types`, `PUT /booking-types/{bt_id}`, `DELETE ...`, `DELETE .../permanent` |
| Egységek típusonként | EDITOR+ | `GET|POST /booking-types/{bt_id}/units`, `PATCH|DELETE .../units/{unit_id}` |
| Tenant LLM szöveg | GET: EDITOR+; PATCH: **TENANT_ADMIN+** | `GET|PATCH /booking-tenant-llm` – `llm_assistant_instructions` (asszisztens / AI kontextus) |
| Intake admin | EDITOR+ | `.../intake-definitions` (lásd fent) |

**Admin foglalás létrehozás (`POST /admin/reservations`):** slot/interval esetén **`start_time` és `end_time` kötelező**. Van **`skip_policy_check`** (tenant/system admin korlátozással – részletek a routerben); ha nincs skip, a **vendég előrefoglalási ablak** (`skip_advance_window=True` policy check adminnál), de létszám-policy továbbra is érvényes.

---

## Admin: foglalások listázása (`GET /api/v1/booking/admin/reservations`)

Lapozott lista a tenant foglalásairól (szűréssel). **JWT** kötelező; szerepkör: **EDITOR**, **TENANT_ADMIN** vagy **SYSTEM_ADMIN**. A `tenant_id` a tokenből jön; **SYSTEM_ADMIN** más tenant listájához küldd a **`X-Tenant-ID`** headert vagy a **`tenant_id`** query paramétert (részletek a dokumentum elején: *Tenant azonosítás és hitelesítés*). A booking modulnak be kell lennie kapcsolva (`403` + `BOOKING_DISABLED` egyébként).

### Query paraméterek

| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| `status` | string | Opcionális státusz szűrés (pl. `confirmed`, `tentative`) |
| `date_from` | date (`YYYY-MM-DD`) | Időintervallum kezdete (nap) |
| `date_to` | date | Időintervallum vége (nap) |
| `booking_type_id` | string | Foglalástípus UUID |
| `unit_id` | string | Foglalási egység UUID |
| `channel` | string | Csatorna (pl. `web`, `panel`, `chat`) |
| `customer_name` | string | Ügyfélnév részleges egyezés |
| `customer_email` | string | Email szűrés |
| `page` | int | Oldalszám (alapértelmezés: **1**) |
| `page_size` | int | Elemek száma oldalanként, max. **200** (alapértelmezés: **50**) |

### Válasz (`PaginatedReservationResponse`)

| Mező | Típus | Leírás |
|------|-------|--------|
| `items` | tömb | `ReservationResponse` objektumok (id, státusz, időpontok, ügyfél, típusnév, `unit_summary`, stb.) |
| `total` | int | Összes találat a szűréssel |
| `page` | int | Aktuális oldal |
| `page_size` | int | Oldalméret |

### Példa JSON válasz (struktúra)

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "tenant_id": "tenant-uuid",
      "booking_type_id": "type-uuid",
      "customer_id": "cust-uuid",
      "status": "confirmed",
      "payment_status": "none",
      "start_time": "2026-04-10T08:00:00Z",
      "end_time": "2026-04-10T09:00:00Z",
      "party_size": 2,
      "channel": "web",
      "created_at": "2026-04-08T12:00:00Z",
      "booking_type_name": "Asztal foglalás",
      "customer_name": "Kiss Anna",
      "customer_email": "anna@example.com",
      "unit_summary": "Terasz 1"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 50
}
```

### Példa hívások (négy nyelv)

A következő példák a **mai + 14 nap** intervallumra kérnek listát (`date_from` / `date_to`), első oldallal. Cseréld a `BASE_URL`, `JWT_TOKEN` és szükség esetén a `TENANT_ID` értékeket.

#### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
JWT_TOKEN = "your-jwt-token"

# SYSTEM_ADMIN más tenantjához: headers["X-Tenant-ID"] = "cél-tenant-uuid"
url = f"{BASE_URL}/api/v1/booking/admin/reservations"
params = {
    "date_from": "2026-04-08",
    "date_to": "2026-04-22",
    "page": 1,
    "page_size": 25,
    # "status": "confirmed",
    # "booking_type_id": "uuid-a-foglalastipusnak",
}

headers = {
    "Authorization": f"Bearer {JWT_TOKEN}",
    "Accept": "application/json",
}

response = requests.get(url, params=params, headers=headers, timeout=30)
response.raise_for_status()
data = response.json()

for row in data.get("items", []):
    print(row.get("id"), row.get("start_time"), row.get("customer_email"))

print("total:", data.get("total"), "page:", data.get("page"))
```

#### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";
const JWT_TOKEN = "your-jwt-token";

const params = new URLSearchParams({
  date_from: "2026-04-08",
  date_to: "2026-04-22",
  page: "1",
  page_size: "25",
});

const url = `${BASE_URL}/api/v1/booking/admin/reservations?${params.toString()}`;

const response = await fetch(url, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${JWT_TOKEN}`,
    Accept: "application/json",
    // "X-Tenant-ID": "cél-tenant-uuid", // SYSTEM_ADMIN: más tenant
  },
});

if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${await response.text()}`);
}

const data = await response.json();
for (const row of data.items ?? []) {
  console.log(row.id, row.start_time, row.customer_email);
}
console.log("total:", data.total, "page:", data.page);
```

#### cURL

```bash
curl -s -X GET "$BASE_URL/api/v1/booking/admin/reservations?date_from=2026-04-08&date_to=2026-04-22&page=1&page_size=25" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Accept: application/json"
# SYSTEM_ADMIN más tenant:
#   -H "X-Tenant-ID: cél-tenant-uuid"
```

#### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$JWT_TOKEN = "your-jwt-token";

$query = http_build_query([
    "date_from" => "2026-04-08",
    "date_to" => "2026-04-22",
    "page" => 1,
    "page_size" => 25,
]);

$url = $BASE_URL . "/api/v1/booking/admin/reservations?" . $query;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $JWT_TOKEN",
    "Accept: application/json",
    // "X-Tenant-ID: cél-tenant-uuid", // SYSTEM_ADMIN: más tenant
]);

$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code !== 200) {
    throw new RuntimeException("HTTP $code: $body");
}

$data = json_decode($body, true);
foreach ($data["items"] ?? [] as $row) {
    echo ($row["id"] ?? "") . " " . ($row["start_time"] ?? "") . "\n";
}
echo "total: " . ($data["total"] ?? 0) . "\n";
```

---

## Booking Panel token API (`/api/v1/booking/panel`)

**Nem** a Public Widget token. Csak **TENANT_ADMIN** (JWT + `get_current_tenant_id`).

| Metódus | Útvonal | Leírás |
|---------|---------|--------|
| GET | `/tokens` | Token lista (titkos érték nélkül) |
| POST | `/tokens` | Új token; válaszban egyszer **`raw_token`** |
| PUT | `/tokens/{token_id}` | Meta frissítés (pl. `booking_type_ids`, `is_active`, megjelenés) |
| DELETE | `/tokens/{token_id}` | Törlés |
| POST | `/tokens/{token_id}/rotate` | Új nyers token |

A nyers tokent a kliens **`X-Panel-Token`** vagy **`panel_token`** formában küldi a fő booking API-hoz.

---

## Gyakori hibakódok (`detail`)

| `error_code` | HTTP | Jelentés |
|--------------|------|----------|
| `BOOKING_DISABLED` | 403 | Booking modul ki van kapcsolva |
| `BOOKING_CREDIT_EXHAUSTED` | 402 | Nincs token egyenleg (új foglalás) |
| `BOOKING_NOT_FOUND` | 404 | Entitás nem található |
| `BOOKING_CONFLICT` | 409 | Ütközés / foglalás nem hozható létre |
| `BOOKING_POLICY_VIOLATION` | 422 | Policy vagy állapot sértés |
| `BOOKING_INTAKE_DENIED` | 422 | Intake elutasítás |
| `BOOKING_INVALID_REQUEST` | 400/422 | Érvénytelen kérés |
| `PANEL_TOKEN_INVALID` | 401 | Booking panel token hibás |

---

## Javasolt integrációs sorrend (panel / embed)

1. Tenant: booking bekapcsolva + token egyenleg.
2. **Booking Panel token** létrehozása (`/api/v1/booking/panel/tokens`) – ha embed auth így történik.
3. `GET /api/v1/booking/types` – aktív típusok és policy meta.
4. Ha `requires_intake`: `POST /intake/step` iteráció → opcionális `unit_filter` átadása a slot API-nak.
5. `GET /availability/slots` – `target_date`, `party_size`, szűrők.
6. `POST /reservations` – időpont + intake válaszok + csatorna.
7. Státusz: `GET /reservations/{id}/status` vagy email alapú `lookup`.

---

## OpenAPI megfeleltetés

| Dokumentum / tag | OpenAPI |
|------------------|---------|
| Fő booking végpontok | tag **Booking**, path prefix `/api/v1/booking` |
| Panel token CRUD | tag **booking-panel-token**, prefix `/api/v1/booking/panel` |

Részletes séma: [41-endpoint-matrix.md](41-endpoint-matrix.md) és a környezet **Redoc** / **openapi.json** fájlja.
