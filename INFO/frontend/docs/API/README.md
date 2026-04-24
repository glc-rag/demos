# GLC-RAG API Quickstart

Ez a dokumentáció a GLC-RAG API használatát mutatja be lépésről lépésre. A dokumentáció négy nyelven tartalmaz kódpéldákat: **Python**, **TypeScript**, **cURL** és **PHP**.

## Gyors kezdés

A GLC-RAG API egy determinisztikus RAG (Retrieval-Augmented Generation) rendszer, amely API-first és headless AI backendet biztosít.

### Alapvető információk

- **Base URL**: `$BASE_URL` (pl. `https://<your-api-host>/`)
- **JSON formátum**: Minden kérés és válasz JSON formátumban
- **SSE streaming**: A streaming endpointok Server-Sent Events (text/event-stream) formátumban küldik a választ

**Integration source of truth:** Az integrációs contract minden esetben az OpenAPI specifikáció (openapi.json / Redoc). A quickstart és a flow oldalak magyarázó, oktató célú dokumentumok. Eltérés esetén az OpenAPI az irányadó.

**Forrás vs. build:** A szerkesztendő Markdown fájlok a **`quickstart/`** mappában vannak; a `docs-quickstart` alatti **`npm run build`** / **`npm run dev`** előtt automatikusan bemásolódnak a **`content/`** mappába (VitePress `srcDir`), majd onnan épül a **`dist/`**. Részletek: [docs-quickstart/README.md](../docs-quickstart/README.md), [41-endpoint-matrix.md](./41-endpoint-matrix.md) (első fejezet).

### Dokumentáció

A következő dokumentumok részletesen leírják az API használatát:

| Dokumentum | Leírás |
|------------|--------|
| [00-attekinto.md](./00-attekinto.md) | Általános áttekintés: Base URL, JSON/SSE formátum, API referencia linkek |
| [01-auth-jwt.md](./01-auth-jwt.md) | Hitelesítés JWT-val (internal): `Authorization: Bearer <token>` |
| [02-auth-widget-token.md](./02-auth-widget-token.md) | Hitelesítés widget tokennel (public): `public_widget_token` + `session_id` |
| [03-auth-api-key.md](./03-auth-api-key.md) | Hitelesítés API kulccsal: X-API-Key header (POST /api/v1/chat) |
| [04-auth-register.md](./04-auth-register.md) | Regisztráció: POST /auth/register, email megerősítés, login |
| [10-chat-sync.md](./10-chat-sync.md) | Modul: POST /chat (sync) - szinkron chat hívás |
| [11-chat-stream.md](./11-chat-stream.md) | Modul: POST /chat/stream - streamelt chat válasz |
| [12-api-v1-chat.md](./12-api-v1-chat.md) | Modul: POST /api/v1/chat - egyszerűsített chat API |
| [13-landing-chat-stream.md](./13-landing-chat-stream.md) | Modul: POST /landing/chat/stream - nyilvános landing chat |
| [20-flow-chat-jwt.md](./20-flow-chat-jwt.md) | Teljes folyamat: Chat egy hívással JWT-val |
| [21-flow-public-widget.md](./21-flow-public-widget.md) | Teljes folyamat: Public widget chat |
| [22-flow-landing-chat.md](./22-flow-landing-chat.md) | Teljes folyamat: Landing chat (nyilvános) |
| [23-flow-login-then-chat.md](./23-flow-login-then-chat.md) | Teljes folyamat: Bejelentkezés → token → chat |
| [30-hibak-es-limitek.md](./30-hibak-es-limitek.md) | Hibák és limiték: HTTP kódok, rate limiting |
| [14-widget-config.md](./14-widget-config.md) | Widget konfiguráció: GET /widget/config |
| [15-chat-transcribe.md](./15-chat-transcribe.md) | Speech-to-Text: POST /chat/transcribe |
| [16-landing-pricing.md](./16-landing-pricing.md) | Árazás: GET /landing/pricing |
| [17-tasks-api.md](./17-tasks-api.md) | Tasks API: projekt- és feladatkezelés |
| [24-flow-tool-confirm.md](./24-flow-tool-confirm.md) | Tool megerősítés: tool proposal → confirm |
| [25-flow-shopping.md](./25-flow-shopping.md) | Shopping: termékek ajánlása |
| [47-info-chat-and-admin.md](./47-info-chat-and-admin.md) | Info: chat /info és admin info betöltés (GET/POST/PUT/DELETE /admin/info, index) |
| [48-info-web-crawl-from-url.md](./48-info-web-crawl-from-url.md) | Info: weboldal felderítése URL-ről (web crawl → Info) |
| [49-info-surveys-public-widget.md](./49-info-surveys-public-widget.md) | Info kérdőívek: publikus widget, admin /admin/survey, beküldés POST /widget/survey-submit |
| [52-admin-public-widget-tokens.md](./52-admin-public-widget-tokens.md) | Admin: Public Widget Tokens – token létrehozás, lista, rotáció, embed snippet |
| [53-booking-api.md](./53-booking-api.md) | Booking API: foglalástípusok, slotok, intake, foglalások, booking panel token, admin |
| [54-frontend-booking-integration.md](./54-frontend-booking-integration.md) | Booking külső integráció: intake vs. OpenAPI, `next_question`, javasolt fejlesztési stratégia |
| [39-documentation-conventions.md](./39-documentation-conventions.md) | Dokumentációs konvenciók: endpoint elnevezések és leírásformátum |
| [40-best-practices.md](./40-best-practices.md) | Best practices: legjobb gyakorlatok |
| [41-endpoint-matrix.md](./41-endpoint-matrix.md) | Endpoint matrix: API áttekintés, quickstart forrás/build, OpenAPI megfeleltetés |
| [50-why-trust-this-api.md](./50-why-trust-this-api.md) | Miért bízhatnak a fejlesztők az API-ban |
| [51-production-readiness.md](./51-production-readiness.md) | Production readiness: publikus/belső, auth, retry, SSE, rate limit |

### API Referencia

- **Redoc**: <a href="/redoc">redoc</a> – interaktív API dokumentáció
- **OpenAPI spec**: <a href="/openapi.json">openapi.json</a> – OpenAPI 3.0 specifikáció (URL a környezettől függ)

### Példa: Egyszerű chat hívás

```bash
# cURL példa (JWT hitelesítéssel)
curl -X POST $BASE_URL/chat \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "internal",
    "text": "Szia, hogyan segíthetek?",
    "session_id": "unique-session-id"
  }'
```

## Hitelesítés

A GLC-RAG API három hitelesítési módot támogat:

1. **JWT (internal)**: `Authorization: Bearer <token>` headerrel
2. **Widget token (public)**: `public_widget_token` és `session_id` body-ben
3. **API kulcs**: request body mező: `api_key`

## Chat endpointok

| Endpoint | Leírás |
|----------|--------|
| POST /chat | Szinkron chat hívás (JWT vagy widget token) |
| POST /chat/stream | Streamelt chat válasz (SSE) |
| POST /api/v1/chat | Egyszerűsített chat API (text, session_id, mode) |
| POST /landing/chat/stream | Nyilvános landing chat (nincs auth) |
| POST /widget/chat | Widget token alapú chat |

## Rate Limiting

- **Per IP**: Minden public channelen IP alapú rate limiting
- **Per token**: Widget token alapú rate limiting
- **Per tenant**: Tenant kvóta (ha van rate_limit_policy_id a token-ben)

## Hibák

A következő HTTP kódok használhatók:

| Kód | Leírás |
|-----|--------|
| 400 | Helytelen kérés (pl. hiányzó mező) |
| 401 | Érvénytelen vagy lejárt hitelesítés |
| 403 | Hozzáférés megtagadva |
| 429 | Rate limit túllépés (Retry-After header) |
| 503 | Szolgáltatás nem elérhető |

## Tippek

- **Public csatornán** a `session_id` kötelező
- **Landing chat** csak demó célokra használható
- **Internal csatornán** JWT token kötelező
- Minden válasz tartalmazza a `trace_id` nyomon követéshez

---

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
