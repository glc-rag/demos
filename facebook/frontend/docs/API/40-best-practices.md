# Best Practices

A GLC-RAG API használatával kapcsolatos legjobb gyakorlatok és ajánlások.

## Hitelesítés

### JWT Token (Internal)

- **Token lekérése**: A backend adminisztrátor által generált JWT token használata.
- **Authorization header**: `Authorization: Bearer &lt;token&gt;`
- **Token élettartam**: A tokenok korlátozott élettartammal rendelkeznek (pl. 24 óra).
- **Token frissítés**: Lejáró tokenek helyett új tokenek lekérése.

### Widget Token (Public)

- **Widget token**: Nyilvános widgetekhez használt token.
- **Token lekérés**: Adminisztrációs felületen vagy API hívással.
- **Token élettartam**: Hosszabb élettartamú tokenek (pl. 30 nap).
- **Token korlátozás**: IP cím alapú korlátozás lehetséges.

### API Kulcs

- **API kulcs**: Backend integrációkhoz használt kulcs.
- **Chat B2B**: POST /api/v1/chat, **X-API-Key** header. Ne használj body `api_key`-t a chatnál.
- **X-API-Key header**: `X-API-Key: &lt;api_key&gt;`
- **Kulcs biztonság**: A kulcsokat biztonságosan tárolni kell (pl. environment variable).
- **Kulcs forgatás**: Reguláris időközönként frissíteni kell a kulcsokat.

## Chat Endpointok

### POST /chat (sync)

- **Kötelező mezők**: `text`, `session_id`, `channel` (internal vagy public)
- **Opcionális mezők**: `public_widget_token`, `token_id`, `history`
- **Válasz**: `ResponseEnvelope` (trace_id, text, sources)
- **Streaming**: Nem támogatott (használd a `/chat/stream` endpointot)

### POST /chat/stream

- **Kötelező mezők**: `text`, `session_id`, `channel` (internal vagy public)
- **Opcionális mezők**: `public_widget_token`, `token_id`, `history`
- **Válasz**: SSE (Server-Sent Events)
- **Események**: `event: header`, `event: delta`, `event: footer`
- **Streaming feldolgozás**:
  ```python
  async for event in response.aiter_lines():
      event = event.split("data:", 1)[1].strip()
      if event.startswith("event:"):
          event_type = event.split(" ", 1)[1]
          data = json.loads(event.split("data:", 1)[1].strip())
  ```

### POST /api/v1/chat

- **Egyszerűsített request**: `text`, `session_id`, `mode` (opcionális)
- **Válasz**: `ApiChatResponse` (trace_id, status_code, text, sources, products, mode)
- **Mode értékek**: `rag`, `shopping`, `creative`, `archive`
- **Használat**: Egyszerű integrációkhoz, ahol a válasz struktúrája nem kritikus

### POST /landing/chat/stream

- **Nincs hitelesítés**: Nyilvános endpoint
- **Kötelező mezők**: `text`, `session_id`
- **Opcionális mezők**: `history`
- **Rate limit**: IP cím alapú korlátozás
- **Válasz**: SSE (Server-Sent Events)
- **Használat**: Nyilvános widgetekhez, demo célokra

## Tool Megerősítés

### Tool Proposal Flow

1. **Tool proposal**: Az LLM tool proposal-ot ad vissza (tool_run_id, modified_parameters)
2. **Tool confirm request**: A felhasználó megerősíti a tool hívást
3. **Tool confirm response**: A backend visszaadja a megerősített tool_run_id-t
4. **Tool execution**: A tool végrehajtása
5. **Tool response**: A tool válasza

### Tool Confirm Példa

```python
# Tool proposal
proposal = {
    "tool_run_id": "tool-run-123",
    "modified_parameters": {
        "search_terms": "óra",
        "price_min": 100000,
        "price_max": 500000
    }
}

# Tool confirm
response = requests.post(
    f"{BASE_URL}/chat/tool/confirm",
    json={
        "tool_run_id": "tool-run-123",
        "modified_parameters": proposal["modified_parameters"]
    }
)
```

## Shopping Endpoint

### POST /shopping

- **Kötelező mezők**: `text`, `session_id`
- **Opcionális mezők**: `public_widget_token`, `token_id`
- **Válasz**: `ShoppingResponse` (trace_id, status_code, body, ux_context)
- **Body**: `text`, `products` (ShoppingProductCard lista)
- **Mechanizmus**: Tool-alapú keresés, 4-list search, text-to-SQL

### Ár-érzékeny keresés

- **Legolcsóbb**: "legolcsóbb aranyórát"
- **Legdrágább**: "legdrágább Rolex"
- **Ár tartomány**: "doxa órát keresek 400000 és 800000 forint között"
- **Konkrét összeg**: "keress órát 500000 Ft körül"

## Tasks API

A Tasks API prefixe: **/admin/tasks**. Példák: GET/POST /admin/tasks/projects, GET/POST /admin/tasks/tasks, GET /admin/tasks/tasks/{task_id}.

- **Hitelesítés**: JWT vagy X-API-Key (egyik kötelező)
- **Projektek**: GET /admin/tasks/projects (lista), POST /admin/tasks/projects (létrehozás)
- **Feladatok**: GET /admin/tasks/tasks (lista), POST /admin/tasks/tasks (létrehozás), GET /admin/tasks/tasks/{task_id} (részletek)
- **Részletek**: [17-tasks-api.md](17-tasks-api.md)

## Hibakezelés

### HTTP Kódok

- **200 OK**: Sikeres válasz
- **400 Bad Request**: Érvénytelen request
- **401 Unauthorized**: Hitelesítés hiányos
- **403 Forbidden**: Nincs jogosultság
- **404 Not Found**: Az erőforrás nem található
- **409 Conflict**: Konfliktus (pl. duplikált resource)
- **429 Too Many Requests**: Rate limit túllépés
- **500 Internal Server Error**: Szerver hiba
- **503 Service Unavailable**: Szerver nem elérhető

### Rate Limiting

- **IP rate limit**: Landing/widget endpointokhoz
- **Token rate limit**: Public widget tokenokhoz
- **Retry-After header**: 429 válaszban a várakozási idő

## Tippek

- **Session ID**: Mindig küldd a `session_id` mezőt a chat endpointokhoz.
- **Trace ID**: A válaszokban szereplő `trace_id` nyomon követéshez.
- **History**: Az előző üzenetek küldése a kontextushoz.
- **Streaming**: A streaming endpointokhoz használj `requests` vagy `fetch` stream mode-t.
- **Error handling**: Mindig kezeld a hibákat megfelelően (pl. try-catch).
- **Logging**: A `trace_id` alapján nyomon követheted a kéréseket.
