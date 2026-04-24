# Hitelesítés widget tokennel (public)

Widget token alapú hitelesítés publikus widgetek számára. A kérés body-jában a **`public_widget_token`** (a widget titkos tokene) és a **`session_id`** kötelező mezők.

A titkos token **létrehozása** az admin API-n: [52-admin-public-widget-tokens.md](52-admin-public-widget-tokens.md) (POST /admin/public-widget-tokens), vagy az Admin felületen: **Integrációk → Public Widget Tokens**.

## Leírás

- **public_widget_token**: A widgethez tartozó titkos token (a backend ebből azonosítja a tenantet). Ne téveszd össze a nyilvános `token_id`-val.
- **session_id**: Az üzenet session azonosítója; **kötelező** a public csatornán (pl. POST /chat, POST /chat/stream esetén). A kliens generálja (pl. UUID).

A backend a token alapján ellenőrzi a hozzáférést, feloldja a tenantet és alkalmazza a rate limitet. Az origin header-t is validálhatja, ha a tokenhez allowed_origins van beállítva.

### Chat endpointok és hitelesítés

| Endpoint | Hitelesítés |
|----------|-------------|
| POST /chat | JWT (internal) vagy widget token (public) |
| POST /chat/stream | JWT (internal) vagy widget token (public) |
| POST /api/v1/chat | Csak API key (X-API-Key header) |

## Példa: POST /chat (public csatorna)

Chat hívás widget tokennel – body: `public_widget_token`, `session_id`, `channel`, `text`.

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"
PUBLIC_WIDGET_TOKEN = "your-secret-widget-token"
SESSION_ID = "my-session-123"

url = f"{BASE_URL}/chat"
payload = {
    "channel": "public",
    "text": "Szia! Hogyan segíthetek?",
    "session_id": SESSION_ID,
    "public_widget_token": PUBLIC_WIDGET_TOKEN
}

headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";
const PUBLIC_WIDGET_TOKEN = "your-secret-widget-token";
const SESSION_ID = "my-session-123";

const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        channel: "public",
        text: "Szia! Hogyan segíthetek?",
        session_id: SESSION_ID,
        public_widget_token: PUBLIC_WIDGET_TOKEN
    })
});
const result = await response.json();
console.log(result);
```

#### cURL
```bash
curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "public",
    "text": "Szia! Hogyan segíthetek?",
    "session_id": "my-session-123",
    "public_widget_token": "your-secret-widget-token"
  }'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";
$payload = json_encode([
    "channel" => "public",
    "text" => "Szia! Hogyan segíthetek?",
    "session_id" => "my-session-123",
    "public_widget_token" => "your-secret-widget-token"
]);

$ch = curl_init($BASE_URL . "/chat");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>
```

## Alternatíva: POST /widget/chat

A **POST /widget/chat** endpoint egyszerűsített body-t használ: **token_id** (a nyilvános token azonosító), **text**, és opcionális **session_id**. Ha a frontend iframe-ben a widgetet használja, a token_id általában a URL paraméterből érkezik.

#### Python
```python
payload = {
    "text": "Szia! Hogyan segíthetek?",
    "token_id": "your-token-id-uuid",
    "session_id": "my-session-123"
}
response = requests.post(f"{BASE_URL}/widget/chat", json=payload, headers={"Content-Type": "application/json"})
```

(Ugyanaz a kérés TypeScript, cURL és PHP nyelven: body mezők `text`, `token_id`, opcionális `session_id`.)

## Hitelesítési hiba

Ha a token érvénytelen vagy tiltott, a backend 401-et ad; a válasz body általában:

```json
{
    "detail": "Invalid token: ..."
}
```

## Tippek

- **Token tárolás**: A widget token-t biztonságosan tárolja a frontend-en (pl. localStorage vagy cookie-kkal).
- **Token frissítés**: A tokenek idővel lejáratottak lehetnek. Ellenőrizze a token érvényességét.
- **Public csatorna**: A widget token csak a `public` csatornán használható.
- **Tenant izoláció**: Minden token egy adott tenant-hoz van kötve, így a tenantek izoláltak maradnak.
- **Origin validáció**: A tokenekhez `allowed_origins` listát lehet rendelni, amely megadja, mely domainek használhatják a token-t.
- **Rate limiting**: Per token és per tenant kvóta van beállítva a visszaélések megelőzésére.

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
