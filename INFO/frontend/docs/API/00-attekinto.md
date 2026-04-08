# GLC-RAG API - Általános áttekintés

Ez a dokumentum általános áttekintést nyújt a GLC-RAG API működéséről, formátumairól és elérhetőségéről. Nincs kód, csak szöveges leírás és linkek a további dokumentációhoz.

---

## Alapvető információk

### Base URL

A GLC-RAG API példákban a `$BASE_URL` helykitöltőt használja. Ne hardkódoljon konkrét domain-t.

```
$BASE_URL = https://<your-api-host>/
```

### Kérés és válasz formátum

**JSON formátum**: Minden kérés és válasz JSON formátumban van.

**Content-Type**: `application/json` minden JSON body-hoz.

**SSE (Server-Sent Events)**: A streaming endpointok (pl. `/chat/stream`, `/landing/chat/stream`) a `text/event-stream` formátumban küldik a választ.

---

## API Referencia

### Interaktív dokumentáció

- **Redoc**: <a href="/redoc">redoc</a>
  - Interaktív API dokumentáció
  - Képes kérések tesztelésére
  - Request/Response sémák

### OpenAPI specifikáció

- **OpenAPI JSON**: <a href="/openapi.json">openapi.json</a>
  - OpenAPI 3.0 specifikáció
  - Teljes endpoint lista
  - Request/Response sémák részletei

**Integration source of truth:** Az integrációs contract minden esetben az OpenAPI specifikáció (openapi.json / Redoc). A quickstart és a flow oldalak magyarázó, oktató célú dokumentumok. Eltérés esetén az OpenAPI az irányadó.

---

## Hitelesítési módok

A GLC-RAG API három hitelesítési módot támogat:

### 1. JWT (internal)

- **Header**: `Authorization: Bearer <token>`
- **Leírás**: Belső felhasználók számára, JWT token alapú hitelesítés
- **Token tartalma**: `user_id`, `tenant_id`, `role`, `exp`
- **Dokumentáció**: [01-auth-jwt.md](./01-auth-jwt.md)

### 2. Widget token (public)

- **Body**: `public_widget_token` és `session_id`
- **Leírás**: Public widgetek számára, token alapú hitelesítés
- **Tenant ID**: A tokenből oldódik fel (kliens által küldött érték ignorálva)
- **Dokumentáció**: [02-auth-widget-token.md](./02-auth-widget-token.md)

### 3. API kulcs

- **Body**: `api_key` – a kérés JSON body-jában
- **Leírás**: Backend-to-backend kommunikációhoz
- **Dokumentáció**: [03-auth-api-key.md](./03-auth-api-key.md)

---

## Chat endpointok

A **POST /chat** és **POST /chat/stream** JWT-tel (internal csatorna) vagy widget tokennel (public csatorna) használhatók. A **POST /api/v1/chat** kizárólag **API Key** (X-API-Key header) hitelesítéssel, backend-to-backend célra. Az API Key a /chat és /chat/stream endpointokon nem használható.

| Endpoint | Hitelesítés |
|----------|-------------|
| POST /chat | JWT (internal) vagy widget token (public) |
| POST /chat/stream | JWT (internal) vagy widget token (public) |
| POST /api/v1/chat | Csak API key (X-API-Key header) |

### Szinkron chat

- **POST /chat**: Szinkron chat hívás – JWT (internal) vagy widget token (public)
- **Dokumentáció**: [10-chat-sync.md](./10-chat-sync.md)

### Streamelt chat

- **POST /chat/stream**: Streamelt chat válasz (SSE) – JWT (internal) vagy widget token (public)
- **Dokumentáció**: [11-chat-stream.md](./11-chat-stream.md)

### Egyszerűsített API (backend-to-backend)

- **POST /api/v1/chat**: Egyszerűsített chat API (text, session_id, mode) – **csak API Key** (X-API-Key header)
- **Válasz**: `trace_id`, `text`, `sources`, `products`
- **Dokumentáció**: [12-api-v1-chat.md](./12-api-v1-chat.md)

### Landing chat

- **POST /landing/chat/stream**: Nyilvános landing chat (nincs auth)
- **Rate limit**: IP alapú
- **Dokumentáció**: [13-landing-chat-stream.md](./13-landing-chat-stream.md)

### Widget chat

- **POST /widget/chat**: Widget token alapú chat
- **Dokumentáció**: [21-flow-public-widget.md](./21-flow-public-widget.md)

### Info mód (slash /info)

- Az internal chat (POST /chat, POST /chat/stream) és a **POST /api/v1/chat** támogatja a **/info** slash parancsot: a `text` mező elején `/info kérdés` (pl. `/info mi az ÁSZF?`). A válasz az indexelt „info” elemekből (FAQ, segítség) generálódik. Az info tartalom az **/admin/info** API-n keresztül tölthető fel és indexelhető.
- **Dokumentáció**: [47-info-chat-and-admin.md](./47-info-chat-and-admin.md)

---

## Teljes folyamatok (Flows)

### Flow 1: Chat egy hívással JWT-val

- **Leírás**: Token feltételezve, egy POST /chat (vagy POST /chat/stream) hívás JWT-val
- **Dokumentáció**: [20-flow-chat-jwt.md](./20-flow-chat-jwt.md)

### Flow 2: Public widget chat

- **Leírás**: Token + session_id, POST /chat vagy /chat/stream
- **Dokumentáció**: [21-flow-public-widget.md](./21-flow-public-widget.md)

### Flow 3: Landing chat (nyilvános)

- **Leírás**: POST /landing/chat/stream, rate limit figyelembevétele
- **Dokumentáció**: [22-flow-landing-chat.md](./22-flow-landing-chat.md)

### Flow 4: Bejelentkezés → token → chat

- **Leírás**: Auth endpoint és chat hívás
- **Dokumentáció**: [23-flow-login-then-chat.md](./23-flow-login-then-chat.md)

---

## Hibák és limiték

### HTTP kódok

| Kód | Leírás |
|-----|--------|
| 400 | Helytelen kérés (pl. hiányzó mező) |
| 401 | Érvénytelen vagy lejárt hitelesítés |
| 403 | Hozzáférés megtagadva |
| 429 | Rate limit túllépés (Retry-After header) |
| 503 | Szolgáltatás nem elérhető |

### Rate Limiting

- **Per IP**: Minden public channelen IP alapú rate limiting
- **Per token**: Widget token alapú rate limiting
- **Per tenant**: Tenant kvóta (ha van rate_limit_policy_id a token-ben)

**Dokumentáció**: [30-hibak-es-limitek.md](./30-hibak-es-limitek.md)

---

## ResponseEnvelope

Minden válasz a `ResponseEnvelope` sémát követi:

- **trace_id**: Unique trace identifier
- **mode**: DOC | HISTORY | CREATIVE | TOOL_PROPOSAL | SHOPPING | SCRIPT | TASKS
- **status_code**: OK | NO_RESULT_DOC | NO_RESULT_PUBLIC | POLICY_DENY | stb.
- **text**: Válasz szövege
- **sources**: Forrás dokumentumok
- **tool_proposal**: Tool javaslatok
- **ux_hints**: UX tippek
- **blocked_reason**: Blokkolás oka (ha van)
- **products**: Termék kártyák (shopping)

---

## Tippek és megjegyzések

- **Public csatornán** a `session_id` kötelező
- **Landing chat** csak demó célokra használható
- **Internal csatornán** JWT token kötelező
- Minden válasz tartalmazza a `trace_id` nyomon követéshez
- Rate limit esetén a `Retry-After` header tartalmazza a várakozási időt

---

## További információk

- **Quickstart index**: [README.md](./README.md)
- **Dokumentációs konvenciók**: [39-documentation-conventions.md](./39-documentation-conventions.md) – endpoint elnevezések és leírásformátum
- **Miért bízhatnak a fejlesztők az API-ban**: [50-why-trust-this-api.md](./50-why-trust-this-api.md)
- **Production readiness**: [51-production-readiness.md](./51-production-readiness.md)
- **Hitelesítés JWT-val**: [01-auth-jwt.md](./01-auth-jwt.md)
- **Hitelesítés widget tokennel**: [02-auth-widget-token.md](./02-auth-widget-token.md)
- **Hitelesítés API kulccsal**: [03-auth-api-key.md](./03-auth-api-key.md)

---

**API dokumentációk**:
- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció, kérések kipróbálása. Mire való: chat, streaming, hitelesítés, RAG és admin API tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható API leírás sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0). Mire való: kliensgenerálás, automatizált tesztek, dokumentációs eszközök.
