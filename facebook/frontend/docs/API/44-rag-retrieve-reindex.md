# RAG retrieve, reindex, reset-index és törlés

Ez a dokumentum a **POST /retrieve**, **POST /reindex**, **POST /reset-index**, **DELETE /documents/{document_id}** és **GET /api/documents/{document_id}/download** endpointokat mutatja be.

**OpenAPI:** tag **Documents**, path-ok pl. `POST /retrieve`, `POST /reindex`, `POST /reset-index`, `DELETE /documents/{document_id}` (openapi.json / Redoc).

## Áttekintés

| Metódus | Útvonal | Leírás |
|---------|---------|--------|
| POST | /retrieve | Standalone RAG keresés (internal: JWT; public: widget token) |
| POST | /reindex | Dokumentumok újraindexelése (doc_id, scope opcionális) |
| POST | /reset-index | Index törlése doc_id alapján (újra feltölthető); TENANT_ADMIN/EDITOR |
| DELETE | /documents/{document_id} | Egy dokumentum törlése (queue + chunks) |
| GET | /api/documents/{document_id}/download | Dokumentum letöltés |

**Hitelesítés:** JWT (Bearer &lt;token&gt;), kivéve retrieve public scope esetén (widget token a body-ban). Reindex és reset-index: megfelelő szerepkör kell.

---

## POST /retrieve

Standalone RAG keresés: a rendszer a tenant indexelt dokumentumai közül ad vissza találatokat.

**Internal:** JWT kötelező; a `tenant_id` és `user_id` a JWT-ből jön, a body-ban opcionálisak.

**Request body (JSON):**

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| **query** | string | Igen | Kereső szöveg. |
| **scope** | string | Nem | `internal` (alapértelmezett) vagy `public`. |
| **top_k** | int | Nem | Max találat száma (alapértelmezett: 5). |
| **channel** | string | Nem | `internal` vagy `public`. |

**Válasz:** `{"matches": [{"doc_id", "chunk_id", "score", "filename", "file_path"}], "matches_count": N, "passed": bool}`

### Példa – retrieve (internal, JWT)

```python
import requests
BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/retrieve"
headers = {"Authorization": "Bearer <token>", "Content-Type": "application/json"}
body = {"query": "keresett kifejezés", "scope": "internal", "top_k": 5}
response = requests.post(url, json=body, headers=headers)
print(response.json())
```

```bash
curl -X POST "$BASE_URL/retrieve" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"keresett kifejezés","scope":"internal","top_k":5}'
```

---

## POST /reindex

A megadott szűrőknek megfelelő dokumentumok újraindexelése. Body: `{"doc_id": "optional-uuid", "scope": "optional-internal|public"}`. JWT kötelező.

### Példa

```bash
curl -X POST "$BASE_URL/reindex" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"doc_id":"doc-uuid","scope":"internal"}'
```

---

## POST /reset-index

A megadott `doc_id` RAG chunkjainak és a hozzá tartozó indexelési jobok törlése; így a dokumentum újra feltölthető. Body: `{"doc_id": "uuid", "scope": "internal"}`. Szerepkör: SYSTEM_ADMIN, TENANT_ADMIN vagy EDITOR.

### Példa

```bash
curl -X POST "$BASE_URL/reset-index" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"doc_id":"doc-uuid","scope":"internal"}'
```

---

## DELETE /documents/{document_id}

Egy dokumentum teljes törlése (indexing_queue + RAG chunks). A `document_id` a job azonosító (pl. GET /admin/documents listából). JWT, megfelelő szerepkör.

### Példa

```bash
curl -X DELETE "$BASE_URL/documents/{document_id}" \
  -H "Authorization: Bearer <token>"
```

---

## GET /api/documents/{document_id}/download

Dokumentum tartalom letöltése. A `document_id` itt a job id. JWT kell internal scope esetén.

### Példa

```bash
curl -X GET "$BASE_URL/api/documents/{document_id}/download" \
  -H "Authorization: Bearer <token>" \
  -o downloaded.pdf
```

---

## Tippek

- **doc_id vs document_id:** A `doc_id` a RAG belső dokumentum azonosító (chunkok meta mezője). A `document_id` az indexelési job azonosító (job_id), amit a GET /admin/documents listában kapsz.
- **Reset-index:** Ha egy dokumentum indexelése elakadt vagy hibás, a reset-index törli a chunkokat és a jobot, így újra feltöltheted.

---

## További információ

- Feltöltés: [42-rag-documents-ingest.md](42-rag-documents-ingest.md)
- Admin lista: [43-rag-documents-admin.md](43-rag-documents-admin.md)
- **API dokumentációk**: <a href="/docs">docs</a> (Swagger UI), <a href="/redoc">redoc</a> (Redoc), <a href="/openapi.json">openapi.json</a> (JSON API). Mire való: endpointok böngészése, kipróbálás, sémák, kliensgenerálás.
