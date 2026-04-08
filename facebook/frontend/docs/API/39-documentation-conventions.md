# Dokumentációs konvenciók

Ez a dokumentum a quickstart és az API dokumentumok stíluskonvencióit írja le: endpoint leírásformátum és kanonikus elnevezések. Cél: konzisztens, könnyen kereshető dokumentáció az integrátorok számára.

---

## Endpoint leírásformátum

Minden endpoint leírásnál használandó mezők (ahol releváns):

| Mező | Leírás |
|------|--------|
| **path** | Metódus + útvonal (pl. POST /ingest, GET /admin/documents) |
| **auth** | JWT / widget token / API key (X-API-Key) – melyik endpointon melyik |
| **required role** | Ha van (pl. EDITOR, TENANT_ADMIN) |
| **request schema** | Rövid felsorolás vagy link az OpenAPI specifikációra |
| **response schema** | Rövid felsorolás vagy link (pl. ResponseEnvelope, job_id) |
| **error codes** | Pl. 400, 401, 403, 429, 503 |
| **notes** | Pl. async job, rate limit, SSE |

A hivatalos forrás az OpenAPI spec (openapi.json / Redoc); a quickstart oldalak ezt a struktúrát tükrözik.

---

## Kanonikus elnevezések

Egy endpointot mindenhol ugyanazzal a rövid névvel hivatkozunk. Gyakori endpointok:

| Kanonikus név | Path |
|---------------|------|
| Ingest | POST /ingest |
| Retrieve | POST /retrieve |
| Reindex | POST /reindex |
| Reset-index | POST /reset-index |
| Admin documents (lista) | GET /admin/documents |
| Dokumentum letöltés | GET /api/documents/{document_id}/download |
| Chat (sync) | POST /chat |
| Chat (stream) | POST /chat/stream |
| API v1 chat (B2B) | POST /api/v1/chat |
| Landing chat stream | POST /landing/chat/stream |

Részletes lista és hitelesítés: [41-endpoint-matrix.md](./41-endpoint-matrix.md). Quickstart ↔ OpenAPI megfeleltetés: ugyanott, „Quickstart ↔ OpenAPI megfeleltetés” szekció.

---

## Kapcsolódó dokumentumok

- [00-attekinto.md](./00-attekinto.md) – Általános áttekintés
- [41-endpoint-matrix.md](./41-endpoint-matrix.md) – Endpoint matrix és OpenAPI megfeleltetés
- [40-best-practices.md](./40-best-practices.md) – Legjobb gyakorlatok
