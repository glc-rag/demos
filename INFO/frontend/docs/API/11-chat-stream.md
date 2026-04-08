# Modul: POST /chat/stream

Streaming chat endpoint a GLC-RAG API-hoz. Ez az endpoint SSE (Server-Sent Events) formátumban küld vissza a választ, így a kliens azonnal láthatja a válasz generálását.

## Leírás

A **POST /chat/stream** ugyanazt a request body-t használja, mint a POST /chat (channel, text, session_id; internal = JWT, public = public_widget_token). A válasz **SSE** (Server-Sent Events), Content-Type: `text/event-stream`. Internal esetén a tenant_id és user_id a JWT-ből jönnek (body-ban opcionálisak).

## SSE válasz formátum

A streaming válasz három típusú eseményt tartalmaz:

### 1. Header event
A válasz metaadatait tartalmazza:

```
data: {"event_type":"header","data":{"trace_id":"...","mode":"DOC","status_code":"OK","ux_hints":{},"blocked_reason":null}}
```

Mezők:
- **trace_id**: Egyedi nyomon követési azonosító
- **mode**: Válasz típusa (DOC, CREATIVE, SHOPPING, stb.)
- **status_code**: Válasz státusz (OK, NO_RESULT_DOC, POLICY_DENY, stb.)
- **ux_hints**: UX tippek és beállítások
- **blocked_reason**: Blokkolási ok (ha van)

### 2. Delta eventek
A szöveg chunkok érkezését jelzik:

```
data: {"event_type":"delta","data":{"text":"...szöveg chunk..."}}
```

Mezők:
- **text**: A szöveg chunk tartalma

Fontos: A delta eventekben **NEM** lehet `sources` mező! A források csak a footer eventben jelenhetnek meg.

### 3. Footer event
A válasz végén érkezik, tartalmazza a forrásokat:

```
data: {"event_type":"footer","data":{"sources":[...],"tool_proposal":null,"internal_debug":null}}
```

Mezők:
- **sources**: Forrás dokumentumok listája
- **tool_proposal**: Tool javaslatok (ha vannak)
- **internal_debug**: Debug információk (opcionális)

## Példa

Egy egyszerű streaming chat hívás internal csatornával:

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"
JWT_TOKEN = "your-jwt-token"

url = f"{BASE_URL}/chat/stream"
payload = {
    "channel": "internal",
    "text": "Szia! Hogyan segíthetek?",
    "session_id": "my-session-123"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {JWT_TOKEN}",
    "Accept": "text/event-stream"
}

response = requests.post(url, json=payload, headers=headers, stream=True)

# Stream feldolgozás
for line in response.iter_lines():
    if line:
        data = line.decode('utf-8')
        if data.startswith("data: "):
            # Esemény típus kinyerése
            event_type = data[6:].split(":")[0]  # "header", "delta", "footer"
            event_data = data[6:].split(":")[1]   # Az adatok JSON része
            print(f"{event_type}: {event_data}")
```

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";
const JWT_TOKEN = "your-jwt-token";

const url = `${BASE_URL}/chat/stream`;
const payload = {
    channel: "internal",
    text: "Szia! Hogyan segíthetek?",
    session_id: "my-session-123"
};

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${JWT_TOKEN}`,
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
            const event_part = line.substring(6);  // "data: " előtag eltávolítása
            const event_type = event_part.split(":")[0];  // "header", "delta", "footer"
            const event_data = event_part.split(":")[1];   // Az adatok JSON része
            console.log(`${event_type}: ${event_data}`);
        }
    }
}
```

#### cURL
```bash
curl -X POST "$BASE_URL/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Accept: text/event-stream" \
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

$url = $BASE_URL . "/chat/stream";
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
    "Authorization: Bearer $JWT_TOKEN",
    "Accept: text/event-stream"
]);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 10);

$response = curl_exec($ch);
curl_close($ch);

// Stream feldolgozás
$lines = explode("\n", $response);
foreach ($lines as $line) {
    if (strpos($line, 'data: ') === 0) {
        $event_part = substr($line, 6);  // "data: " előtag eltávolítása
        $event_type = explode(":", $event_part)[0];  // "header", "delta", "footer"
        $event_data = explode(":", $event_part)[1];   // Az adatok JSON része
        echo "$event_type: $event_data\n";
    }
}
?>
```

## Public channel példa

Egy egyszerű streaming chat hívás public csatornával (widget token):

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"
WIDGET_TOKEN = "your-widget-token-id"

url = f"{BASE_URL}/chat/stream"
payload = {
    "channel": "public",
    "text": "Szia! Hogyan segíthetek?",
    "session_id": "my-session-123",
    "public_widget_token": WIDGET_TOKEN
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
const WIDGET_TOKEN = "your-widget-token-id";

const url = `${BASE_URL}/chat/stream`;
const payload = {
    channel: "public",
    text: "Szia! Hogyan segíthetek?",
    session_id: "my-session-123",
    public_widget_token: WIDGET_TOKEN
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
curl -X POST "$BASE_URL/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
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

$url = $BASE_URL . "/chat/stream";
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
    "Content-Type: application/json",
    "Accept: text/event-stream"
]);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 10);

$response = curl_exec($ch);
curl_close($ch);

// Stream feldolgozás
$lines = explode("\n", $response);
foreach ($lines as $line) {
    if (strpos($line, 'data: ') === 0) {
        $event_part = substr($line, 6);
        $event_type = explode(":", $event_part)[0];
        $event_data = explode(":", $event_part)[1];
        echo "$event_type: $event_data\n";
    }
}
?>
```

## Tippek

- **Stream feldolgozás**: A streamet soronként olvasd ki, és minden `data:` előtagot kezelj külön.
- **Események kezelése**: Az eseményeket (`header`, `delta`, `footer`) külön-külön kezeld, ha szükséges.
- **Hiba kezelés**: Ha a stream hiba esetén leáll, ellenőrizd a HTTP státuszkódot.
- **Rate limiting**: A streaming endpointok is rate limiteltek, ha túlléped a limitet, 429-es hivatkozást kapsz.
- **Session ID**: Kötelező mindkét csatornán; a kliens generálja (pl. UUID).
- **Tenant ID / User ID (internal)**: A backend a JWT-ből veszi; body-ban opcionálisak. Public esetén a tenant a widget tokenből oldódik fel.
- **Válasz feldolgozás**: A válasz JSON formátumban érkezik minden sorban, parse-eld és kezelj a mezők alapján.
- **Trace ID**: A trace_id-t használhatod a válaszok nyomon követéséhez és hibakereséshez.
- **Mode**: A mode mező megadja, milyen típusú válasz érkezett (pl. DOC, CREATIVE, SHOPPING).
- **Sources csak footerben**: A forrásdokumentumok csak a footer eventben jelenhetnek meg, nem a delta eventekben!

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
