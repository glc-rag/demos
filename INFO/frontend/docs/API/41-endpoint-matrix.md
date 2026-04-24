# Endpoint Matrix

A GLC-RAG API főbb végpontjainak áttekintése. **Nem** teljes path-lista: a részletes séma és az összes tag mindig az OpenAPI-ban van.

**Integration source of truth:** [openapi.json](/openapi.json) / [Redoc](/redoc). Eltérés esetén az OpenAPI az irányadó.

---

## Hol van a quickstart dokumentáció?

| Hely | Szerep |
|------|--------|
| **`quickstart/`** (repo gyökér) | **Forrás:** Markdown (`.md`) fájlok – ezt szerkesztjük. Fájlnév: **`NN-téma.md`** (pl. `49-info-surveys-public-widget.md`), hogy a VitePress oldalsáv számozott sorrendben jelenjen meg. |
| **`docs-quickstart/content/`** | **Másolat** a `quickstart/` mappából – `.gitignore`; minden `npm run build` / `npm run dev` a `docs-quickstart` mappában automatikusan frissíti (`sync-quickstart.mjs`). **Ne** szerkeszd kézzel. |
| **`docs-quickstart/dist/`** | **Build kimenet:** a VitePress generálja – **nem** szerkesztendő kézzel; deploy / statikus host erre mehet. |
| **`docs-quickstart/.vitepress/config.js`** | `srcDir: ./content`, `outDir: ./dist`, `base: /quickstart`. A **bal oldali menü** a `content/*.md` fájlok **fájlnév szerinti rendezésé** alapján épül (lásd `getSidebarItems`). |

Új oldal: hozz létre egy `NN-*.md` fájlt a **`quickstart/`** mappában; a `README.md` táblázatába és az `index.md` linklistájába érdemes felvenni.

**Build (fejlesztői gép):**

```bash
cd docs-quickstart && npm run build
```

---

## Auth

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/auth/register` | POST | Nincs | Új tenant admin regisztráció; email megerősítés kötelező |
| `/auth/confirm-email` | GET / POST | Nincs | Email aktiválás (`token` query) |
| `/auth/resend-confirmation` | POST | Nincs | Megerősítő link újraküldése |
| `/auth/login` | POST | Nincs | Bejelentkezés → JWT |
| `/auth/logout` | POST | JWT | Kijelentkezés |
| `/auth/refresh` | POST | JWT | Token frissítés |

Részletes regisztráció: [04-auth-register.md](04-auth-register.md).

---

## Chat

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/chat` | POST | JWT (internal) / Widget token (public) | Szinkron chat |
| `/chat/stream` | POST | JWT / Widget token | SSE stream |
| `/api/v1/chat` | POST | API Key (`X-API-Key`) | Egyszerűsített B2B chat |
| `/landing/chat/stream` | POST | Nincs | Landing chat (SSE) – lásd Landing |

---

## Documents & RAG (prefix: gyökér)

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/ingest` | POST | API Key / JWT (lásd OpenAPI) | Dokumentum feltöltés / indexelés |
| `/retrieve` | POST | API Key / JWT | Lekérdezés |
| `/reindex` | POST | API Key / JWT | Újraindexelés |
| `/reset-index` | POST | API Key / JWT | Index reset |
| `/documents/{document_id}` | DELETE | API Key / JWT | Dokumentum törlés |
| `/api/documents/{document_id}/download` | GET | JWT (lásd OpenAPI) | Letöltés |
| `/api/chunks/{chunk_id}/content` | GET | JWT (lásd OpenAPI) | Chunk tartalom |

Részletes quickstart: [42-rag-documents-ingest.md](42-rag-documents-ingest.md), [44-rag-retrieve-reindex.md](44-rag-retrieve-reindex.md), [43-rag-documents-admin.md](43-rag-documents-admin.md), [45-rag-chat-overview.md](45-rag-chat-overview.md).

---

## Admin – dokumentumok, info, widget tokenek (JWT)

Az **`/admin`** alatt több modul fut (OpenAPI **Admin** tag és társai). Gyakori példák:

| Terület | Példa útvonalak | Quickstart |
|---------|-----------------|------------|
| Dokumentumok admin | `GET /admin/documents`, `PUT .../scope`, bulk műveletek, indexing jobs | [43-rag-documents-admin.md](43-rag-documents-admin.md) |
| Info (chat /info) | `GET|POST|PUT|DELETE /admin/info`, `.../index` | [47-info-chat-and-admin.md](47-info-chat-and-admin.md) |
| Public widget tokenek | `/admin/public-widget-tokens`, `.../rotate`, `.../embed-snippet` | [52-admin-public-widget-tokens.md](52-admin-public-widget-tokens.md) |

---

## Tool & Widget & Transcribe & Shopping

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/chat/tool/confirm` | POST | JWT | Tool megerősítés |
| `/widget/config` | GET | Nincs | Widget konfiguráció |
| `/chat/transcribe` | POST | JWT | Speech-to-Text |
| `/shopping` | POST | Widget token / token id | Termékajánlás |

---

## Landing (prefix: `/landing`)

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/landing/chat/stream` | POST | Nincs (IP rate limit) | Nyitóoldal chat SSE |
| `/landing/content` | GET | Nincs | Tartalom / HTML blokkok |
| `/landing/pricing` | GET | Nincs | Árazási táblázat |

---

## Tasks (prefix: `/admin/tasks`)

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/admin/tasks/projects` | GET, POST | JWT / X-API-Key | Projektek |
| `/admin/tasks/projects/{project_id}` | GET, PATCH, DELETE | JWT / X-API-Key | Egy projekt |
| `/admin/tasks/tasks` | GET, POST | JWT / X-API-Key | Feladatok |
| `/admin/tasks/tasks/{task_id}` | GET, PATCH, DELETE | JWT / X-API-Key | Egy feladat |
| `/admin/tasks/task-categories` | GET | JWT / X-API-Key | Kategóriák |
| `/admin/tasks/users` | GET | JWT / X-API-Key | Tenant felhasználók |

További Tasks útvonalak (clients, budget, workflow, export, …): [17-tasks-api.md](17-tasks-api.md) és OpenAPI.

---

## Info (prefix: `/admin/info`)

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/admin/info` | GET, POST | JWT (POST: EDITOR+) | Lista / létrehozás |
| `/admin/info/{item_id}` | GET, PUT, DELETE | JWT (módosítás: EDITOR+) | CRUD |
| `/admin/info/{item_id}/index` | POST | JWT (EDITOR+) | Indexelés |

---

## Booking – áttekintés

| Prefix / modul | OpenAPI tag (tipikus) | Quickstart |
|----------------|------------------------|------------|
| `/api/v1/booking` | Booking | [53-booking-api.md](53-booking-api.md) |
| `/api/v1/booking/panel` | booking-panel-token | [53-booking-api.md](53-booking-api.md) |
| `/api/v1/booking/display` | booking-display-token | [53-booking-api.md](53-booking-api.md) (kijelző token + `GET /schedule`) |
| `/api/v1/booking/voice` | booking-voice | OpenAPI (Twilio/VAPI – telefonos integráció) |
| `/api/v1/system/booking` | system-booking | OpenAPI (SYSTEM_ADMIN – iparági sablonok) |

### Publikus / panel (`/api/v1/booking`)

| Endpoint | Method | Megjegyzés |
|----------|--------|------------|
| `/api/v1/booking/types` | GET | Aktív foglalástípusok |
| `/api/v1/booking/availability/slots` | GET | Szabad slotok |
| `/api/v1/booking/admin/availability/slots` | GET | Ugyanaz, JWT EDITOR+ |
| `/api/v1/booking/intake/step` | POST | Intake lépés |
| `/api/v1/booking/reservations` | POST | Új foglalás (+ token egyenleg) |
| `/api/v1/booking/reservations/lookup` | GET | Email + id |
| `/api/v1/booking/reservations/self-cancel` | DELETE | Önlemondás |
| `/api/v1/booking/reservations/self-modify` | PATCH | Önmódosítás |
| `/api/v1/booking/reservations/{id}/ics` | GET | Naptár export |
| `/api/v1/booking/reservations/{id}/status` | GET | Státusz |
| `/api/v1/booking/reservations/{id}` | GET, DELETE | JWT kötelező (GET részletek, DELETE lemondás) |
| `/api/v1/booking/reservations/{id}/confirm` | PATCH | JWT |

Admin rész (`/api/v1/booking/admin/...`): sablonok, foglalások CRUD, ügyfelek, statisztika, szabályok, foglalástípusok, intake, tenant LLM szöveg – részletesen: [53-booking-api.md](53-booking-api.md).

### Booking Panel token (`/api/v1/booking/panel`)

| Endpoint | Method | Hitelesítés |
|----------|--------|-------------|
| `/api/v1/booking/panel/tokens` | GET, POST | JWT TENANT_ADMIN |
| `/api/v1/booking/panel/tokens/{token_id}` | PUT, DELETE | JWT TENANT_ADMIN |
| `/api/v1/booking/panel/tokens/{token_id}/rotate` | POST | JWT TENANT_ADMIN |

A nyers token a fő booking API-n **`X-Panel-Token`** vagy `panel_token` query formában.

### Kijelző (TV) token (`/api/v1/booking/display`)

| Endpoint | Method | Hitelesítés |
|----------|--------|-------------|
| `/api/v1/booking/display/tokens` | GET, POST | JWT TENANT_ADMIN / SYSTEM_ADMIN |
| `/api/v1/booking/display/tokens/{token_id}` | PUT, DELETE | JWT |
| `/api/v1/booking/display/tokens/{token_id}/rotate` | POST | JWT |
| `/api/v1/booking/display/schedule` | GET | **`X-Display-Token`** header (nyilvános kijelző) |

---

## LLM modellek (prefix: `/api/llm-models`)

| Endpoint | Method | Leírás |
|----------|--------|--------|
| `/api/llm-models` | GET | Endpoint lista, árak |
| `/api/llm-models/{endpoint_id}/status` | GET | Státusz |
| `/api/llm-models/prices` | PUT | Árak (SYSTEM_ADMIN) |

Részletek: OpenAPI tag **LLM Models**.

---

## Facebook – B2B kommentek (`/admin/fb`)

Külső rendszerrel (CRM, ticketing) komment audit: válaszmód, lista, jóváhagyásos küldés. **Részletes folyamat, scope, példák:** [26-flow-facebook-b2b-comments.md](26-flow-facebook-b2b-comments.md).

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/admin/fb/profiles` | GET | JWT (tenant admin) | Profilok listája (`profile_id` lekéréshez) |
| `/admin/fb/profiles/{profile_id}` | GET | JWT (tenant / system admin) | Profil, `reply_mode` |
| `/admin/fb/profiles/{profile_id}` | PUT | JWT | Válaszmód (`reply_mode`: auto / manual) |
| `/admin/fb/profiles/{profile_id}/comments` | GET | JWT **vagy** `X-API-Key` (scope `fb_comment`) | Kommentek listája |
| `/admin/fb/profiles/{profile_id}/comments/{comment_id}/send` | POST | JWT **vagy** `X-API-Key` (scope `fb_comment`) | Válasz küldése a Facebookra |

**OAuth és webhook** (Meta összekötés, nem a B2B tábla része):

| Prefix | Megjegyzés |
|--------|------------|
| `/fb` | OAuth callback (publikus) |
| `/api/fb` | Webhook |

További Facebook admin végpontok (data-groups, tartalom, OAuth start, diagnostic, …): **OpenAPI** / Redoc, tag **Facebook**.

---

## Egyéb admin / integráció (lásd OpenAPI)

| Prefix | Megjegyzés |
|--------|------------|
| `/admin/companies` | Cégek |
| `/admin/script-patterns` | Script minták |
| `/admin` + scraping/indexing queue | Scraping & indexelés sor |
| `/api` + client form | Ügyfél űrlap (publikus) |
| `/system-admin` | Rendszer admin |
| `/debug` | Debug (környezetfüggő) |

**Facebook:** B2B komment végpontok fent; OAuth/webhook sorok a Facebook szekcióban.

---

## OpenAPI / Redoc

| Endpoint | Method | Leírás |
|----------|--------|--------|
| [openapi.json](/openapi.json) | GET | OpenAPI 3.0 spec |
| [redoc](/redoc) | GET | Redoc UI |

---

## HTTP hibakódok (általános)

| HTTP | Leírás |
|------|--------|
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 402 | Payment / credit (pl. booking token egyenleg) |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Rate limiting (példák)

| Terület | Megjegyzés |
|---------|------------|
| `/landing/chat/stream` | IP alapú |
| `/widget/config` | Nincs / enyhe |
| `/shopping` | Token alapú |
| `/chat/transcribe` | Token / policy |

Részletek: [30-hibak-es-limitek.md](30-hibak-es-limitek.md).

---

## Chat válasz: ResponseEnvelope

A **chat** endpointok (pl. `POST /chat`, `POST /api/v1/chat`) válasza tipikusan **`ResponseEnvelope`** szerkezetű (pl. `trace_id`, `text`, `sources`, `mode`). A **többi REST** végpont (dokumentumok, admin CRUD, booking JSON) **közvetlen JSON** sémát ad vissza a válasz típus szerint – mindig az OpenAPI a mérvadó.

---

## Streaming (SSE)

A streamelő endpointok **SSE** (`text/event-stream`): események `event: header` / `delta` / `footer` formában. Részlet: [11-chat-stream.md](11-chat-stream.md).

---

## Quickstart ↔ OpenAPI megfeleltetés (keresőtábla)

| Quickstart / modul | OpenAPI tag (tipikus) | Példa path |
|--------------------|------------------------|------------|
| RAG ingest | Documents | `/ingest` |
| RAG retrieve | Documents | `/retrieve` |
| Admin dokumentumok | Admin | `/admin/documents` |
| Public widget tokenek | Admin | `/admin/public-widget-tokens` |
| Booking típusok / foglalás | Booking | `/api/v1/booking/types`, `/api/v1/booking/reservations` |
| Booking panel token | booking-panel-token | `/api/v1/booking/panel/tokens` |
| Booking kijelző | booking-display-token | `/api/v1/booking/display/schedule` |
| Tasks | Tasks | `/admin/tasks/tasks` |
| Info | Admin | `/admin/info` |
| LLM modellek | LLM Models | `/api/llm-models` |
| Facebook B2B kommentek | Facebook | `/admin/fb/profiles`, `.../comments`, `.../send` |

A teljes path lista: **openapi.json** vagy Redoc.
