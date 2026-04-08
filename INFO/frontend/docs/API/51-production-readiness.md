# Production readiness

Ez az oldal a production integrátor számára összerendezi: mely endpointok publikusak vagy belsők, melyik auth hol használható, hibakódok, retry és SSE kezelés, trace_id, async job polling, rate limit stratégia és ajánlott integrációs minták. A részletek több quickstart oldalon is megtalálhatók; itt egy helyen áttekinthetők.

---

## Publikus vs belső endpointok

**Publikus (auth nélkül vagy limitált auth):**

- **POST /landing/chat/stream** – nyilvános landing chat (rate limit: IP alapú)
- **GET /widget/config** – widget konfiguráció
- **GET /landing/pricing** – árazási táblázat
- **POST /auth/login** – bejelentkezés

**Belső (JWT vagy API key / widget token):**

- Chat: POST /chat, POST /chat/stream (JWT vagy widget token), POST /api/v1/chat (X-API-Key)
- RAG: POST /ingest, POST /retrieve, GET /admin/documents, stb. (JWT, szerepkörkövetelmény)
- Admin, tasks, shopping, transcribe: JWT vagy a dokumentált auth

Teljes lista: [41-endpoint-matrix.md](41-endpoint-matrix.md).

---

## Auth mód per endpoint

| Endpoint | Hitelesítés |
|----------|-------------|
| POST /chat | JWT (internal) vagy widget token (public) |
| POST /chat/stream | JWT (internal) vagy widget token (public) |
| POST /api/v1/chat | Csak API key (X-API-Key header) |

Részletes auth: [01-auth-jwt.md](01-auth-jwt.md), [02-auth-widget-token.md](02-auth-widget-token.md), [03-auth-api-key.md](03-auth-api-key.md).

---

## Hibaosztályok

| HTTP kód | Jelentés |
|----------|----------|
| 400 | Bad Request – hibás vagy hiányos kérés |
| 401 | Unauthorized – hiányzó vagy érvénytelen hitelesítés |
| 402 | Payment Required – pl. egyenleg kimerült (ingest) |
| 403 | Forbidden – nincs jogosultság |
| 429 | Too Many Requests – rate limit túllépés (Retry-After header) |
| 503 | Service Unavailable – szolgáltatás nem elérhető |

Részletek és példák: [30-hibak-es-limitek.md](30-hibak-es-limitek.md).

---

## Idempotencia / retry

- **Non-idempotent műveleteknél** (pl. POST /chat, POST /ingest) kerüljük a naiv újrapróbálkozást ugyanazzal a body-val; a kliens oldali idempotencia (pl. session_id, egyedi id) segíthet.
- **Ingest**: job_id alapú polling – POST /ingest visszaadja a job_id-t, az állapot a GET /admin/documents listán lekérdezhető (PENDING, PROCESSING, COMPLETED, FAILED). Részlet: [42-rag-documents-ingest.md](42-rag-documents-ingest.md), [46-flow-rag-upload-index-chat.md](46-flow-rag-upload-index-chat.md).

---

## SSE megszakadás kezelése

A **POST /chat/stream** és **POST /landing/chat/stream** SSE (Server-Sent Events) választ adnak. Megszakadás esetén:

- Reconnect és **session_id** (és opcionálisan **history**) használata a kontextus megőrzéséhez.
- Részletek: [11-chat-stream.md](11-chat-stream.md), [13-landing-chat-stream.md](13-landing-chat-stream.md).

---

## trace_id használata

Minden válasz tartalmaz **trace_id**-t. Support és debug esetén naplózd a trace_id-t a kliens oldalon; így a szerver oldali logokkal egyértelműen párosítható a kérés.

---

## Async job polling minta (ingest)

1. **POST /ingest** – multipart (file, scope); válasz: `job_id`, `status: "queued"`.
2. **GET /admin/documents** – query: scope=internal (és opcionálisan limit, offset); a documents listában keresd a job_id-hoz tartozó elemet.
3. Ismételd a GET-et, amíg a **status** nem COMPLETED vagy FAILED.

Részletek: [42-rag-documents-ingest.md](42-rag-documents-ingest.md), [43-rag-documents-admin.md](43-rag-documents-admin.md), [46-flow-rag-upload-index-chat.md](46-flow-rag-upload-index-chat.md).

---

## Rate limit és backoff

- **Retry-After** header: rate limit (429) esetén a válaszban vagy headerben jelzi a várakozási időt.
- **Ajánlás**: exponenciális backoff a retry-nál; ne bombázzuk a szervert azonnali ismétlésekkel.
- Részletek: [30-hibak-es-limitek.md](30-hibak-es-limitek.md).

---

## Ajánlott integrációs minták

- **Backend-to-backend**: **POST /api/v1/chat** + **X-API-Key** header. Egyszerűsített body: text, session_id, mode (rag, shopping, creative, archive). Flow: [12-api-v1-chat.md](12-api-v1-chat.md), [20-flow-chat-jwt.md](20-flow-chat-jwt.md) (JWT helyett API key).
- **Widget**: **POST /chat** vagy **POST /chat/stream** + body: `public_widget_token`, `session_id`, `channel: "public"`, `text`. Flow: [21-flow-public-widget.md](21-flow-public-widget.md).
- **Landing (demó)**: **POST /landing/chat/stream**, auth nélkül; figyelembe venni az IP alapú rate limitet. Flow: [22-flow-landing-chat.md](22-flow-landing-chat.md).
- **Shopping**: [25-flow-shopping.md](25-flow-shopping.md) – POST /shopping vagy POST /api/v1/chat mode=shopping.

---

## Kapcsolódó dokumentumok

- [00-attekinto.md](00-attekinto.md) – Általános áttekintés
- [30-hibak-es-limitek.md](30-hibak-es-limitek.md) – Hibák és limiték
- [41-endpoint-matrix.md](41-endpoint-matrix.md) – Endpoint matrix
- [50-why-trust-this-api.md](50-why-trust-this-api.md) – Miért bízhatnak a fejlesztők az API-ban
