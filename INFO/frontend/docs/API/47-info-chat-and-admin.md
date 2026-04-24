# Info: chat /info és admin betöltés

Ez a dokumentum két dolgot mutat be: (1) az **info a chatben** – a /info slash parancs használata; (2) az **info betöltését** – az /admin/info API-n keresztül, hogy a tartalom elérhetővé váljon a /info válaszaiban.

---

## Info a chatben

### Mi az /info?

A chatben (POST /chat, POST /chat/stream, POST /api/v1/chat) a felhasználó **slash parancsként** küldi: **/info** + szóköz + kérdés vagy téma. Példa: `"/info Pergel Attila"`, `"/info mi az ÁSZF?"`. A rendszer az **info módot** választja; a válasz az adott tenant **indexelt info elemekből** (FAQ, segítség, szabályzat stb.) generálódik.

Nincs külön endpoint – ugyanaz a chat endpoint, a `text` mező elején lévő **/info** prefix határozza meg a módot.

### Hitelesítés

- **Internal:** JWT (POST /chat, POST /chat/stream) vagy X-API-Key (POST /api/v1/chat).
- **Widget:** POST /chat, body: public_widget_token, session_id.

### Példa kérés (POST /chat)

```python
import requests

BASE_URL = "https://<your-api-host>"
JWT_TOKEN = "your-jwt-token"

url = f"{BASE_URL}/chat"
payload = {
    "channel": "internal",
    "text": "/info Hogyan kell regisztrálni?",
    "session_id": "my-session-123"
}
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {JWT_TOKEN}"
}
response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### Példa (POST /api/v1/chat)

```python
payload = {
    "text": "/info mi a szállítási idő?",
    "session_id": "my-session-123"
}
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "rak_your_api_key_here"
}
response = requests.post(f"{BASE_URL}/api/v1/chat", json=payload, headers=headers)
print(response.json())
```

### Válasz

A válasz egy **ResponseEnvelope** (trace_id, mode, status_code, text, sources). A `text` az info tartalom alapján generált válasz; a `sources` az info kontextusra hivatkozhat. Ha nincs indexelt info vagy nincs releváns találat, a rendszer ezt jelezni fogja a válaszban.

---

## Info betöltése (admin API)

### Mi az info betöltés?

Az **info elemek** szöveges tartalmak (cím, leírás, content), amelyeket az admin API-n keresztül hozunk létre és **indexelünk**. Ha az indexelés kész (INDEXED), a chat **/info** válasza ezekből a tartalmakból ad választ.

### Endpointok (prefix: /admin/info)

| Endpoint | Method | Leírás | Szerepkör |
|----------|--------|--------|-----------|
| /admin/info | GET | Info elemek listája (query: limit, offset, scope, status, search) | JWT, VIEWER is listázhat |
| /admin/info/{item_id} | GET | Egy elem teljes tartalommal (szerkesztéshez) | JWT |
| /admin/info | POST | Info elem létrehozása; mentés után PENDING index job | EDITOR, TENANT_ADMIN, SYSTEM_ADMIN |
| /admin/info/{item_id} | PUT | Info elem szerkesztése; mentés után PENDING index job | EDITOR, TENANT_ADMIN, SYSTEM_ADMIN |
| /admin/info/{item_id} | DELETE | Info elem törlése (és document_store chunkok) | EDITOR, TENANT_ADMIN, SYSTEM_ADMIN |
| /admin/info/{item_id}/index | POST | Indexelés kézi indítása (ha nincs már PENDING job) | EDITOR, TENANT_ADMIN, SYSTEM_ADMIN |

### GET /admin/info – lista

**Query paraméterek:** limit (default 100), offset, scope (internal/public), status (NOT_INDEXED, PENDING, PROCESSING, INDEXED, FAILED), search.

**Válasz:** `{ "items": [ ... ], "total": N }`. Minden item: id, tenant_id, title, description, content (rövidítve 500 karig a listában), scope, is_active, indexing_status, created_at, updated_at, doc_id.

### POST /admin/info – létrehozás

**Request body:**

```json
{
  "title": "Gyakori kérdések",
  "description": "Regisztráció és bejelentkezés",
  "content": "Hogyan regisztrálok? A Regisztráció menüpontból...",
  "scope": "internal",
  "is_active": true
}
```

- **title:** kötelező.
- **description:** opcionális.
- **content:** opcionális, max **100 000** karakter.
- **scope:** "internal" vagy "public", default "internal".
- **is_active:** default true.

**Válasz:** `{ "id": "uuid", "message": "Az indexelés hamarosan indul." }`. Mentés után automatikusan **PENDING** index job kerül a sorba; az indexelés háttérben fut, az **indexing_status** majd INDEXED lesz.

### PUT /admin/info/{item_id} – szerkesztés

**Request body:** title, description, content, scope, is_active (mind opcionális; csak a megadott mezők frissülnek). A content max 100 000 karakter. scope csak "internal" vagy "public".

**Válasz:** `{ "message": "Az indexelés hamarosan indul." }` – új PENDING index job.

### DELETE /admin/info/{item_id}

Törli az info elemet és a hozzá tartozó chunkokat (doc_type=info). Válasz: `{ "message": "Deleted" }`.

### POST /admin/info/{item_id}/index

Indexelés kézi indítása. Ha már van PENDING job ehhez az elemhez, nem ad hozzá újat. Válasz: üzenet az indexelés indításáról.

### Flow: létrehozás → indexelés → chat

1. **Login** – POST /auth/login, JWT token.
2. **Info elem létrehozása** – POST /admin/info (title, content, scope).
3. **Indexelés állapota** – GET /admin/info; keressük az elem **indexing_status** mezőjét (PENDING → PROCESSING → INDEXED). INDEXED után a tartalom használható a /info chatben.
4. **Chat /info** – POST /chat vagy POST /api/v1/chat, text: "/info &lt;kérdés&gt;".

### Python példa: info létrehozás + lista

```python
import requests

BASE_URL = "https://<your-api-host>"
token = "your-jwt-token"
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Létrehozás
r = requests.post(f"{BASE_URL}/admin/info", json={
    "title": "ÁSZF",
    "description": "Általános szerződési feltételek",
    "content": "1. A szolgáltatás használata...",
    "scope": "internal"
}, headers=headers)
data = r.json()
print("Created:", data.get("id"), data.get("message"))

# Lista (indexing_status ellenőrzés)
r2 = requests.get(f"{BASE_URL}/admin/info", headers=headers, params={"limit": 10})
items = r2.json().get("items", [])
for it in items:
    print(it["title"], "- status:", it.get("indexing_status"))
```

---

## További információ

- **Info kérdőívek (publikus widget):** [49-info-surveys-public-widget.md](./49-info-surveys-public-widget.md) – admin szerkesztő, widget beküldés, API összefoglaló
- Chat sync: [10-chat-sync.md](10-chat-sync.md)
- API v1 chat: [12-api-v1-chat.md](12-api-v1-chat.md)
- RAG dokumentumok admin (hasonló állapotkezelés): [43-rag-documents-admin.md](43-rag-documents-admin.md)
- **OpenAPI / Redoc:** <a href="/openapi.json">openapi.json</a>, <a href="/redoc">redoc</a> – /admin/info endpointok részletei.
