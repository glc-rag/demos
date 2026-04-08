# Miért bízhatnak a fejlesztők az API-ban

Ez az oldal összefoglalja a GLC-RAG API bizalomépítő jellemzőit: stabil contract, nyomon követhetőség, szerepkörök és rate limiting. Ezek mutatják, hogy nem csak „válaszol valamit az LLM”, hanem operational discipline van a háttérben.

---

## Stable envelope

Minden válasz a **ResponseEnvelope** sémát követi: `trace_id`, `mode`, `status_code`, `text`, `sources`, `tool_proposal`, `ux_hints`, `blocked_reason`, `products`. Konzisztens formátum minden endpointon; a részletek az [áttekintésben](00-attekinto.md#responseenvelope) és az OpenAPI specban.

---

## Traceable responses

Minden válasz tartalmaz **trace_id**-t. Support és debug esetén egyértelműen azonosítható a kérés; a naplózás és a reprodukálható integráció megkönnyített.

---

## Async job model

Az **ingest** (dokumentum feltöltés) aszinkron: a válasz `job_id`-t és `queued` státuszt ad; az indexelés állapota a **GET /admin/documents** listán ellenőrizhető. Részletek: [42-rag-documents-ingest.md](42-rag-documents-ingest.md), [46-flow-rag-upload-index-chat.md](46-flow-rag-upload-index-chat.md).

---

## Role-based access

Szerepkörök (pl. VIEWER, EDITOR, TENANT_ADMIN) és ahol igény van rá, pozitív egyenleg követelmény is dokumentálva van (pl. ingestnél). Részletek az [auth](01-auth-jwt.md) és [RAG admin](43-rag-documents-admin.md) oldalakon.

---

## Explicit public/internal separation

- **Internal**: JWT kötelező (POST /chat, POST /chat/stream, internal csatorna).
- **Public**: widget token (body: `public_widget_token`, `session_id`).
- **Landing chat**: demó célra, rate limit figyelembevételével.

Az [Endpoint Matrix](41-endpoint-matrix.md) és az [áttekintés](00-attekinto.md#chat-endpointok) pontosan leírják, melyik endpointon melyik auth használható.

---

## Rate limiting

Dokumentált viselkedés: IP alapú (pl. landing chat), token alapú (widget, transcribe), tenant kvóta ahol van. A `Retry-After` header jelzi a várakozási időt. Részletek: [30-hibak-es-limitek.md](30-hibak-es-limitek.md).

---

## Reproducible integration patterns

- **$BASE_URL** helykitöltő a példákban; ne hardkódolj domaint.
- **OpenAPI = source of truth**: az integrációs contract minden esetben az OpenAPI spec (openapi.json / Redoc); a quickstart és a flow oldalak magyarázó, oktató célú dokumentumok. Eltérés esetén az OpenAPI az irányadó.

---

## Kapcsolódó dokumentumok

- [00-attekinto.md](00-attekinto.md) – Általános áttekintés
- [30-hibak-es-limitek.md](30-hibak-es-limitek.md) – Hibák és limiték
- [41-endpoint-matrix.md](41-endpoint-matrix.md) – Endpoint matrix
- [42-rag-documents-ingest.md](42-rag-documents-ingest.md), [43-rag-documents-admin.md](43-rag-documents-admin.md), [44-rag-retrieve-reindex.md](44-rag-retrieve-reindex.md) – RAG dokumentumok
- [51-production-readiness.md](51-production-readiness.md) – Production readiness
