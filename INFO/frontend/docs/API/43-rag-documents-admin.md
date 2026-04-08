# RAG dokumentumok admin API

Ez a dokumentum a RAG dokumentumok kezeléséhez szükséges **admin** endpointokat mutatja be. Mindegyik JWT hitelesítést igényel.

**OpenAPI:** tag **Admin**, path-ok pl. `GET /admin/documents`, `GET /admin/documents/{document_id}/preview` (openapi.json / Redoc).

## Endpointok áttekintése

| Metódus | Útvonal | Leírás |
|---------|---------|--------|
| GET | /admin/documents | Dokumentum lista (scope, status, search, limit, offset) |
| GET | /admin/documents/{document_id}/preview | Dokumentum előnézet (pl. szöveg) |
| PUT | /admin/documents/{document_id}/scope | Scope módosítás (internal / public) |
| POST | /admin/documents/bulk-delete | Tömeges törlés (document_ids) |
| POST | /admin/documents/bulk-update-scope | Tömeges scope frissítés |
| POST | /admin/documents/indexing-jobs/reset-to-pending | Beragadt (PROCESSING) jobok visszaállítása PENDING-re |

**Szerepkör:** GET listához VIEWER is elég; scope, törlés, reset: EDITOR, TENANT_ADMIN vagy SYSTEM_ADMIN.

## GET /admin/documents – lista

Query paraméterek: `scope` (internal | public), `status` (PENDING | PROCESSING | COMPLETED | FAILED), `search` (fájlnév), `limit`, `offset`.

Válasz példa:

```json
{
  "documents": [
    {
      "job_id": "uuid",
      "file_name": "doc.pdf",
      "file_path": "/uploads/tenant/doc.pdf",
      "status": "COMPLETED",
      "scope": "internal",
      "created_at": "2026-03-09T12:00:00Z",
      "completed_at": "2026-03-09T12:01:00Z",
      "error_message": null
    }
  ],
  "total": 1
}
```

## Példa – lista lekérése

### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/admin/documents"
headers = {"Authorization": "Bearer <token>"}
params = {"scope": "internal", "limit": 20, "offset": 0}
response = requests.get(url, headers=headers, params=params)
print(response.status_code, response.json())
```

### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";
const url = `${BASE_URL}/admin/documents?scope=internal&limit=20&offset=0`;
const response = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
});
const data = await response.json();
console.log(response.status, data);
```

### cURL

```bash
curl -X GET "$BASE_URL/admin/documents?scope=internal&limit=20&offset=0" \
  -H "Authorization: Bearer <token>"
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$url = $BASE_URL . "/admin/documents?scope=internal&limit=20&offset=0";
$ctx = stream_context_create([
    "http" => ["header" => "Authorization: Bearer $token"]
]);
$json = file_get_contents($url, false, $ctx);
echo $json . "\n";
?>
```

## Példa – scope módosítás (PUT)

Body: `{"scope": "internal"}` vagy `{"scope": "public"}`.

### cURL

```bash
curl -X PUT "$BASE_URL/admin/documents/{document_id}/scope" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"scope":"public"}'
```

## Példa – tömeges törlés (POST)

Body: `{"document_ids": ["uuid1", "uuid2"]}`.

### cURL

```bash
curl -X POST "$BASE_URL/admin/documents/bulk-delete" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"document_ids":["uuid1","uuid2"]}'
```

## Példa – indexing jobok reset (POST)

Body: `{"job_ids": ["uuid1"]}`. Csak PROCESSING állapotú jobok állíthatók vissza PENDING-re.

### cURL

```bash
curl -X POST "$BASE_URL/admin/documents/indexing-jobs/reset-to-pending" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"job_ids":["uuid1"]}'
```

---

## Tippek

- A **document_id** a lista `job_id` mezője (indexing_queue job azonosító).
- **Preview:** a GET /admin/documents/{id}/preview a dokumentum szöveges előnézetét adja (admin felülethez).

---

## További információ

- Feltöltés: [42-rag-documents-ingest.md](42-rag-documents-ingest.md)
- Retrieve, reindex, törlés: [44-rag-retrieve-reindex.md](44-rag-retrieve-reindex.md)
- **API dokumentációk**: <a href="/docs">docs</a> (Swagger UI), <a href="/redoc">redoc</a> (Redoc), <a href="/openapi.json">openapi.json</a> (JSON API). Mire való: endpointok böngészése, kipróbálás, sémák, kliensgenerálás.
