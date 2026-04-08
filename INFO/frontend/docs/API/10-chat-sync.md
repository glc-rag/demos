# Modul: POST /chat (sync)

Szinkron chat endpoint a GLC-RAG API-hoz. Ez az endpoint szöveges kéréseket fogad és szinkron módon küld vissza választ.

## Leírás

A **POST /chat** endpoint két csatornát támogat:
- **Internal channel**: Belső felhasználói csatorna; **JWT** kötelező (`Authorization: Bearer <token>`). A `tenant_id` és `user_id` a JWT-ből kerülnek be (a body-ban opcionálisak).
- **Public channel**: Publikus widget; a body-ban kötelező a **`public_widget_token`** és **`session_id`**.

Kötelező mezők mindkét esetben: **channel**, **text**, **session_id**. A válasz egy **ResponseEnvelope** (trace_id, mode, status_code, text, sources).

## Példa

Egy egyszerű szinkron chat hívás internal csatornával:

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"
JWT_TOKEN = "your-jwt-token"

url = f"{BASE_URL}/chat"
# tenant_id és user_id a JWT-ből jönnek; opcionálisan megadhatók a body-ban is
payload = {
    "channel": "internal",
    "text": "Szia! Hogyan segíthetek?",
    "session_id": "my-session-123"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {JWT_TOKEN}"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";
const JWT_TOKEN = "your-jwt-token";

const url = `${BASE_URL}/chat`;
// tenant_id és user_id a JWT-ből jönnek
const payload = {
    channel: "internal",
    text: "Szia! Hogyan segíthetek?",
    session_id: "my-session-123"
};

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${JWT_TOKEN}`
};

const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
});
const result = await response.json();
console.log(result);
```

#### cURL
```bash
curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "channel": "internal",
    "text": "Szia! Hogyan segíthetek?",
    "session_id": "my-session-123"
  }'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";
$JWT_TOKEN = "your-jwt-token";

$url = $BASE_URL . "/chat";
$payload = json_encode([
    "channel" => "internal",
    "text" => "Szia! Hogyan segíthetek?",
    "session_id" => "my-session-123"
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer $JWT_TOKEN"
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
```

## Public channel példa

Egy egyszerű szinkron chat hívás public csatornával (widget token):

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"
WIDGET_TOKEN = "your-widget-token-id"

url = f"{BASE_URL}/chat"
payload = {
    "channel": "public",
    "text": "Szia! Hogyan segíthetek?",
    "session_id": "my-session-123",
    "public_widget_token": WIDGET_TOKEN
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";
const WIDGET_TOKEN = "your-widget-token-id";

const url = `${BASE_URL}/chat`;
const payload = {
    channel: "public",
    text: "Szia! Hogyan segíthetek?",
    session_id: "my-session-123",
    public_widget_token: WIDGET_TOKEN
};

const headers = {
    "Content-Type": "application/json"
};

const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
});
const result = await response.json();
console.log(result);
```

#### cURL
```bash
curl -X POST "https://<your-api-host>/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "public",
    "text": "Szia! Hogyan segíthetek?",
    "session_id": "my-session-123",
    "public_widget_token": "your-widget-token-id"
  }'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";
$WIDGET_TOKEN = "your-widget-token-id";

$url = $BASE_URL . "/chat";
$payload = json_encode([
    "channel" => "public",
    "text" => "Szia! Hogyan segíthetek?",
    "session_id" => "my-session-123",
    "public_widget_token" => $WIDGET_TOKEN
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
```

## Válasz struktúra

A válasz egy `ResponseEnvelope` objektum, amely a következő mezőket tartalmazza:

| Mező | Típus | Leírás |
|------|-------|--------|
| trace_id | string | Egyedi trace azonosító |
| mode | string | Mód: DOC, HISTORY, CREATIVE, TOOL_PROPOSAL, SHOPPING, SCRIPT, TASKS |
| status_code | string | Status: OK, NO_RESULT_DOC, NO_RESULT_PUBLIC, POLICY_DENY, stb. |
| text | string | A chat válasz szövege |
| sources | array | Forrás dokumentumok/chunkok |
| tool_proposal | object | Tool javaslat (opcionális) |
| ux_hints | object | UX tippek (opcionális) |
| blocked_reason | string | Blokkolás oka (opcionális) |

## Tippek

- **Internal vs Public**: Az internal csatorna JWT token hitelesítést igényel, a public csatorna widget token hitelesítést.
- **Session ID**: A session_id kötelező mindkét csatornán; a kliens generálja (pl. UUID).
- **Tenant ID / User ID (internal)**: A backend a JWT-ből veszi őket; a body-ban opcionálisak. Public csatornán a tenant a widget tokenből oldódik fel, a user_id-t a backend generálja ha hiányzik.
- **Válasz feldolgozás**: A válasz JSON formátumban érkezik, parse-eld és kezelj a mezők alapján.
- **Trace ID**: A trace_id-t használhatod a válaszok nyomon követéséhez és hibakereséshez.
- **Mode**: A mode mező megadja, milyen típusú válasz érkezett (pl. DOC, CREATIVE, SHOPPING).

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
