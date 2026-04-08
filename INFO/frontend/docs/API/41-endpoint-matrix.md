# Endpoint Matrix

A GLC-RAG API endpointjainak áttekintése.

**Integration source of truth:** az OpenAPI spec (openapi.json / Redoc); eltérés esetén az OpenAPI az irányadó.

## Auth Endpoints

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/auth/login` | POST | Nincs | Bejelentkezés (email, password) |
| `/auth/logout` | POST | JWT | Kijelentkezés |
| `/auth/refresh` | POST | JWT | Token frissítés |

## Chat Endpoints

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/chat` | POST | JWT (internal) / Widget token (public) | Chat (sync) |
| `/chat/stream` | POST | JWT (internal) / Widget token (public) | Chat (streaming) |
| `/api/v1/chat` | POST | API Key (X-API-Key) | Chat (egyszerűsített, backend-to-backend) |
| `/landing/chat/stream` | POST | Nincs | Landing chat (streaming) |

## Tool Endpoints

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/chat/tool/confirm` | POST | JWT | Tool megerősítés (tool_run_id a chat válasz tool_proposal-ból) |

## Widget Endpoints

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/widget/config` | GET | Nincs | Widget konfiguráció |

## Transcribe Endpoints

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/chat/transcribe` | POST | JWT | Speech-to-Text (Whisper API) |

## Pricing Endpoints

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/landing/pricing` | GET | Nincs | Árazási táblázat |

## Tasks Endpoints (prefix: /admin/tasks)

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/admin/tasks/projects` | GET | JWT / X-API-Key | Projekt lista |
| `/admin/tasks/projects` | POST | JWT / X-API-Key | Projekt létrehozás |
| `/admin/tasks/projects/{project_id}` | GET | JWT / X-API-Key | Egy projekt lekérése |
| `/admin/tasks/projects/{project_id}` | PATCH | JWT / X-API-Key | Projekt módosítása |
| `/admin/tasks/projects/{project_id}` | DELETE | JWT / X-API-Key | Projekt törlése |
| `/admin/tasks/tasks` | GET | JWT / X-API-Key | Feladat lista |
| `/admin/tasks/tasks` | POST | JWT / X-API-Key | Feladat létrehozás |
| `/admin/tasks/tasks/{task_id}` | GET | JWT / X-API-Key | Feladat részletek |
| `/admin/tasks/tasks/{task_id}` | PATCH | JWT / X-API-Key | Feladat módosítása |
| `/admin/tasks/tasks/{task_id}` | DELETE | JWT / X-API-Key | Feladat törlése |
| `/admin/tasks/task-categories` | GET | JWT / X-API-Key | Feladatkategóriák listája |
| `/admin/tasks/users` | GET | JWT / X-API-Key | Tenant felhasználók listája |

További Tasks endpointok (clients, budget, cost, client-forms, messages, workflow, export stb.): lásd OpenAPI / [17-tasks-api.md](17-tasks-api.md) – További Tasks API endpointok.

## Info Endpoints (prefix: /admin/info)

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| /admin/info | GET | JWT | Info elemek listája (scope, status, search) |
| /admin/info/{item_id} | GET | JWT | Egy info elem (teljes tartalom) |
| /admin/info | POST | JWT (EDITOR+) | Info elem létrehozása (→ indexelés) |
| /admin/info/{item_id} | PUT | JWT (EDITOR+) | Info elem szerkesztése (→ indexelés) |
| /admin/info/{item_id} | DELETE | JWT (EDITOR+) | Info elem törlése |
| /admin/info/{item_id}/index | POST | JWT (EDITOR+) | Indexelés indítása |

A chatben a **/info** slash parancs (POST /chat, POST /api/v1/chat) az itt indexelt tartalmat használja; lásd [47-info-chat-and-admin.md](47-info-chat-and-admin.md).

## Shopping Endpoints

| Endpoint | Method | Hitelesítés | Leírás |
|----------|--------|-------------|--------|
| `/shopping` | POST | Widget Token / Token ID | Termékajánlás |

## OpenAPI

| Endpoint | Method | Leírás |
|----------|--------|--------|
| <a href="/openapi.json">openapi.json</a> | GET | OpenAPI specifikáció |
| <a href="/redoc">redoc</a> | GET | Redoc dokumentáció |

## Hibak

| HTTP Kód | Leírás |
|----------|--------|
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Rate Limiting

| Endpoint | Rate Limit |
|----------|------------|
| `/landing/chat/stream` | IP alapú |
| `/widget/config` | Nincs |
| `/shopping` | Token alapú |
| `/chat/transcribe` | Token alapú |

## Response Envelope

Minden válasz tartalmazza a `ResponseEnvelope` struktúrát:

```json
{
  "trace_id": "abc-123",
  "status_code": "OK",
  "text": "Válasz szöveg",
  "sources": [],
  "products": [],
  "mode": "rag"
}
```

## Streaming Response

A streaming endpointok SSE (Server-Sent Events) formátumban adják vissza a választ:

```
event: header
data: {...}

event: delta
data: {...}

event: footer
data: {...}
```

## Quickstart ↔ OpenAPI megfeleltetés (RAG / admin)

A quickstart útmutató és az OpenAPI spec ugyanazt a contractet írja le. Az alábbi táblázat segít az OpenAPI (Redoc / openapi.json) tag és path megkeresésében:

| Quickstart útvonal / leírás | OpenAPI tag | OpenAPI path |
|-----------------------------|-------------|--------------|
| POST /ingest | Documents | `/ingest` |
| POST /retrieve | Documents | `/retrieve` |
| POST /reindex | Documents | `/reindex` |
| POST /reset-index | Documents | `/reset-index` |
| DELETE /documents/{document_id} | Documents | `/documents/{document_id}` |
| GET /admin/documents | Admin | `/admin/documents` |
| GET /admin/documents/{id}/preview | Admin | `/admin/documents/{document_id}/preview` |
| PUT /admin/documents/{id}/scope | Admin | `/admin/documents/{document_id}/scope` |
| POST /admin/documents/bulk-delete | Admin | `/admin/documents/bulk-delete` |
| POST /admin/documents/bulk-update-scope | Admin | `/admin/documents/bulk-update-scope` |
| POST /admin/documents/indexing-jobs/reset-to-pending | Admin | `/admin/documents/indexing-jobs/reset-to-pending` |

A végpontok és paraméterek hivatalos forrása az OpenAPI spec (openapi.json / Redoc).
