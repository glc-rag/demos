# Info: weboldal felderítése (web crawl → Info elemek)

Ez a dokumentum az **Info modul webes betöltését** írja le: egy vagy több URL-ről a rendszer **feltérképezi a weboldalt**, majd a talált oldalakból **Info elemeket** hoz létre (oldalanként 1 rekord), és elindítja az indexelést.

---

## Mit csinál a web crawl?

- **Bemenet:** 1 vagy több seed URL (csak http/https).
- **Felderítés:** max `depth` mélységig, max `max_pages` oldal.
- **Eredmény:** **minden letöltött (tartalmat adó) oldalból** külön **Info item** készül.
- **LLM feldolgozás:** a rekord mentése előtt lefut (cím/leírás/markdown), így az Info elemek nem “nyers” HTML tartalommal kerülnek elmentésre.
- **Biztonság:** URL validáció (localhost / private IP tiltás), allowlist/denylist domain és regex opciók.
- **Fail-safe:** max futási idő (timeout), és biztos megszakítás (`cancel`).

---

## Endpointok

### 1) Web crawl indítása

- **path:** `POST /api/admin/info/from-url/`
- **auth:** JWT
- **required role:** `SYSTEM_ADMIN`, `TENANT_ADMIN`, `EDITOR`

**Request body (példa):**

```json
{
  "url": "https://example.com",
  "depth": 2,
  "max_pages": 50,
  "scope": "public"
}
```

**Mezők:**

- **url**: string – kötelező (ha `urls` nincs megadva). Tipp: ide be lehet paste-elni több URL-t is (újsor/szóköz/vessző alapján szétszedjük).
- **urls**: string[] – opcionális seed lista (ha több belépő URL kell).
- **depth**: number – 1..10.
- **max_pages**: number – 1..2000.
- **scope**: `"internal"` vagy `"public"` – az így létrejövő Info elemek scope-ja.

**Response:**

```json
{
  "job_id": "uuid",
  "message": "Web crawl elindítva..."
}
```

---

### 2) Job státusz és események lekérése (poll)

- **path:** `GET /api/admin/info/from-url/{job_id}/`
- **auth:** JWT
- **required role:** `SYSTEM_ADMIN`, `TENANT_ADMIN`, `EDITOR`, `VIEWER`

**Query paraméterek:**

- **events_limit**: default 200, max 1000
- **events_offset**: default 0
- **include_page_text**: default false – csak debug esetén kapcsold be, mert nagy lehet.

**Response (vázlat):**

- `job.status`: `RUNNING | DONE | FAILED | CANCELLED`
- `job.stats`: statisztika + extra mezők (pl. `result_info_item_ids`)
- `events[]`: job események (státusz, heartbeat, page, error, done)

Megjegyzés: a UI alapból **nem kapja meg a teljes letöltött oldal szövegét** (a `page.text` ki van szedve), hogy ne fagyjon le nagy crawl esetén.

---

### 3) Megszakítás (cancel)

- **path:** `POST /api/admin/web-crawl/{job_id}/cancel`
- **auth:** JWT
- **required role:** `SYSTEM_ADMIN`, `TENANT_ADMIN`, `EDITOR`

**Response:**

```json
{
  "cancelled": true,
  "task_cancelled": true,
  "message": "Cancel requested."
}
```

---

## Konfiguráció (env / settings)

Az alábbi változók a web crawl viselkedését szabályozzák:

- **`WEB_CRAWL_MAX_CONCURRENT_PER_TENANT`**: 0 = nincs limit; >0 esetén tenantonként ennyi párhuzamos crawl futhat.
- **`WEB_CRAWL_MAX_RUNTIME_SECONDS`**: max futási idő (pl. 1200 = 20 perc).
- **`WEB_CRAWL_ALLOWED_DOMAINS`**: vesszővel elválasztott allowlist (üres = nincs allowlist).
- **`WEB_CRAWL_DENIED_DOMAINS`**: vesszővel elválasztott denylist.
- **`WEB_CRAWL_ALLOWED_URL_REGEX`**: regex (üres = nincs).
- **`WEB_CRAWL_DENIED_URL_REGEX`**: regex (üres = nincs).

---

## Tipikus flow (admin)

1. Indítás: `POST /api/admin/info/from-url/` → `job_id`.
2. Poll: `GET /api/admin/info/from-url/{job_id}/` amíg `status` terminal (`DONE/FAILED/CANCELLED`).
3. A létrejött Info elemek a listában megjelennek; az indexelés automatikusan indul (PENDING → PROCESSING → INDEXED).

---

## Kapcsolódó dokumentumok

- Info admin + /info chat: [47-info-chat-and-admin.md](./47-info-chat-and-admin.md)
- Dokumentációs konvenciók: [39-documentation-conventions.md](./39-documentation-conventions.md)

