# Teljes folyamat: Public widget chat

Ez a dokumentum bemutatja, hogyan lehet egy teljes chat folyamatot végrehajtani public widget token hitelesítéssel. A folyamat két lépésből áll:

1. **Widget token lekérése** - Adminisztrációs felületen vagy API-n keresztül
2. **Chat hívás** - A token használatával chat üzenet küldése

## Lépés 1: Widget token lekérése

A widget token **Admin → Integrációk → Public Widget Tokens** menüben, vagy **JWT-vel** a [52-admin-public-widget-tokens.md](52-admin-public-widget-tokens.md) szerinti **POST /admin/public-widget-tokens** hívással hozható létre. A válaszban kapod a titkos tokent (`token`) és a nyilvános `token_id`-t; a chathez a titkos érték kell (`public_widget_token` a body-ban), az embed URL-ben a `token_id`.

### Token lekérése

A token metaadatai listázhatók admin API-n (GET /admin/public-widget-tokens); a **titkos** token csak létrehozáskor és rotációkor látható. A token tartalmazza / metaadatai:

- **token_id**: A token egyedi azonosítója
- **tenant_id**: A tenant azonosítója
- **allowed_origins**: Engedélyezett origin listája (opcionális)
- **enabled**: A token aktív-e
- **requests_per_minute**: Rate limit per perc
- **requests_per_hour**: Rate limit per óra
- **quota_per_hour**: Órai kvóta

### Token struktúra

```json
{
  "token_id": "widget_token_abc123",
  "tenant_id": "tenant_456",
  "allowed_origins": ["https://example.com", "https://*.example.com"],
  "enabled": true,
  "requests_per_minute": 60,
  "requests_per_hour": 1000,
  "quota_per_hour": 1000000
}
```

## Lépés 2: Chat hívás widget tokennel

A lekért widget token használatával chat üzenet küldhető a `/widget/chat` endpointon keresztül.

### Request

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| **text** | string | Igen | A felhasználó üzenete |
| **token_id** | string | Igen | Widget token azonosító |
| **session_id** | string | Nem | Opcionális session azonosító |

### Response

```json
{
  "event_type": "header",
  "data": {
    "trace_id": "abc-123-def-456",
    "mode": "DOC",
    "status_code": "OK"
  }
}

data: {"event_type":"delta","data":{"text":"Ez a válasz..."}}

data: {"event_type":"footer","data":{"sources":[],"tool_proposal":null,"internal_debug":null}}
```

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"

# Widget token lekérés (admin felületen keresztül)
widget_token_id = "widget_token_abc123"

url = f"{BASE_URL}/widget/chat"
payload = {
    "text": "Mi a cégetek fő szolgáltatása?",
    "token_id": widget_token_id,
    "session_id": "widget-session-123"
}

headers = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream"
}

response = requests.post(url, json=payload, headers=headers, stream=True)

# Stream feldolgozás
for line in response.iter_lines():
    if line:
        data = line.decode('utf-8')
        if data.startswith("data: "):
            event_type = data[6:].split(":")[0]
            event_data = data[6:].split(":")[1]
            print(f"{event_type}: {event_data}")
```

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";

// Widget token lekérés (admin felületen keresztül)
const widget_token_id = "widget_token_abc123";

const url = `${BASE_URL}/widget/chat`;
const payload = {
    text: "Mi a cégetek fő szolgáltatása?",
    token_id: widget_token_id,
    session_id: "widget-session-123"
};

const headers = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream"
};

const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
});

// Stream feldolgozás
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value, { stream: true }).split('\n');
    for (const line of lines) {
        if (line.startsWith('data: ')) {
            const event_part = line.substring(6);
            const event_type = event_part.split(":")[0];
            const event_data = event_part.split(":")[1];
            console.log(`${event_type}: ${event_data}`);
        }
    }
}
```

#### cURL
```bash
curl -X POST "$BASE_URL/widget/chat" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"text": "Mi a cégetek fő szolgáltatása?", "token_id": "widget_token_abc123", "session_id": "widget-session-123"}'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";

// Widget token lekérés (admin felületen keresztül)
$widget_token_id = "widget_token_abc123";

$url = $BASE_URL . "/widget/chat";
$payload = json_encode([
    "text" => "Mi a cégetek fő szolgáltatása?",
    "token_id" => $widget_token_id,
    "session_id" => "widget-session-123"
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Accept: text/event-stream"
]);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 10);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    // Stream feldolgozás
    $lines = explode("\n", $response);
    foreach ($lines as $line) {
        if (strpos($line, 'data: ') === 0) {
            $event_part = substr($line, 6);
            $parts = explode(":", $event_part, 2);
            $event_type = $parts[0];
            $event_data = $parts[1] ?? '';
            echo "$event_type: $event_data\n";
        }
    }
} else {
    echo "Hiba: $http_code - $response\n";
}
?>
```

## Teljes folyamat (Python)

Ez a példa mutatja be a teljes folyamatot: widget token lekérése → chat hívás.

```python
import requests
import json

BASE_URL = "https://<your-api-host>"

# 1. Widget token lekérése (admin felületen keresztül)
# Ez a példa feltételezi, hogy a token_id már ismert
widget_token_id = "widget_token_abc123"

# 2. Chat hívás
chat_url = f"{BASE_URL}/widget/chat"
chat_payload = {
    "text": "Mi a cégetek fő szolgáltatása?",
    "token_id": widget_token_id,
    "session_id": "widget-session-123"
}

headers = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream"
}

chat_response = requests.post(chat_url, json=chat_payload, headers=headers, stream=True)

# Stream feldolgozás
for line in chat_response.iter_lines():
    if line:
        data = line.decode('utf-8')
        if data.startswith("data: "):
            event_type = data[6:].split(":")[0]
            event_data = data[6:].split(":")[1]
            
            if event_type == "header":
                header_data = json.loads(event_data)
                print(f"Trace ID: {header_data['data']['trace_id']}")
            
            elif event_type == "delta":
                delta_data = json.loads(event_data)
                print(delta_data['data']['text'], end='', flush=True)
            
            elif event_type == "footer":
                footer_data = json.loads(event_data)
                print(f"\n\n[Válasz készült! Források: {len(footer_data['data']['sources'])}]")
```

## Teljes folyamat (TypeScript)

```typescript
const BASE_URL = "https://<your-api-host>";

// 1. Widget token lekérés (admin felületen keresztül)
// Ez a példa feltételezi, hogy a token_id már ismert
const widget_token_id = "widget_token_abc123";

// 2. Chat hívás
const chat_url = `${BASE_URL}/widget/chat`;
const chat_payload = {
    text: "Mi a cégetek fő szolgáltatása?",
    token_id: widget_token_id,
    session_id: "widget-session-123"
};

const headers = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream"
};

const chat_response = await fetch(chat_url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(chat_payload)
});

// Stream feldolgozás
const reader = chat_response.body.getReader();
const decoder = new TextDecoder();

while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value, { stream: true }).split('\n');
    for (const line of lines) {
        if (line.startsWith('data: ')) {
            const event_part = line.substring(6);
            const event_type = event_part.split(":")[0];
            const event_data = JSON.parse(event_part);
            
            if (event_type === "header") {
                console.log(`Trace ID: ${event_data.data.trace_id}`);
            }
            
            else if (event_type === "delta") {
                process.stdout.write(event_data.data.text);
            }
            
            else if (event_type === "footer") {
                console.log(`\n\n[Válasz készült! Források: ${event_data.data.sources.length}]`);
            }
        }
    }
}
```

## Tippek

- **Token lekérés**: A widget token adminisztrációs felületen keresztül kérhető le. A token tartalmazza a tenant_id-t és az allowed_origins listát.
- **Session ID**: A session_id-t használhatod a felhasználói sessionok nyomon követéséhez. Ha nincs megadva, a rendszer generál egyet.
- **Allowed Origins**: A token allowed_origins mezője tartalmazza az engedélyezett origin listát. Ha nincs megadva, minden origin engedélyezett.
- **Rate Limit**: Az endpoint rate limiteltek per token. Ha túlléped a limitet, 429-es hivatkozást kapsz.
- **Quota**: A token tartalmazza az órai kvótát. Ha a kvóta kimerült, 403-as hivatkozást kapsz.
- **Trace ID**: A trace_id-t használhatod a válaszok nyomon követéséhez és hibakereséshez.

## Hibák

| HTTP kód | Leírás |
|----------|--------|
| **401** | Érvénytelen vagy nem létező token_id |
| **403** | Token disabled vagy origin nem engedélyezett |
| **400** | Hiányzó vagy érvénytelen request body |
| **429** | Rate limit túllépés |
| **402** | Kvóta kimerült |
| **503** | Szolgáltatás nem elérhető |

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
