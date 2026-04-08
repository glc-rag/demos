# Modul: POST /landing/chat/stream

Nyitóoldal chat endpoint a GLC-RAG API-hoz. Ez az endpoint nyilvános, nincs hitelesítés, és a landing oldal tudásbázisára épül.

## Leírás

A `/landing/chat/stream` endpoint a landing (nyitóoldal) chat funkciója. Az endpoint SSE (Server-Sent Events) formátumban küld vissza a választ, és a válasz a landing oldal tudásbázisára épül.

**Fontos**: Ez az endpoint nyilvános, nincs hitelesítés. A válasz az "attila" tenant tudásbázisára épül.

## Rate Limiting

Az endpoint **IP alapú rate limitelést** alkalmaz. A rendszer figyelembe veszi a kliens IP címét (vagy az `X-Forwarded-For` header-t, ha van).

Ha túlléped a rate limitet, 429-es hivatkozást kapsz `Retry-After` headerrel.

## Példa

Egy egyszerű landing chat hívás:

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"

url = f"{BASE_URL}/landing/chat/stream"
payload = {
    "text": "Mi a vállalat fő szolgáltatása?",
    "session_id": "landing-session-123"
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

const url = `${BASE_URL}/landing/chat/stream`;
const payload = {
    text: "Mi a vállalat fő szolgáltatása?",
    session_id: "landing-session-123"
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
curl -X POST "$BASE_URL/landing/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"text": "Mi a vállalat fő szolgáltatása?", "session_id": "landing-session-123"}'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";

$url = $BASE_URL . "/landing/chat/stream";
$payload = json_encode([
    "text" => "Mi a vállalat fő szolgáltatása?",
    "session_id" => "landing-session-123"
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

## Request body

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| **text** | string | Igen | A felhasználó üzenete |
| **session_id** | string | Nem | Opcionális session azonosító. Ha nincs megadva, a rendszer generál egyet. |
| **history** | array | Nem | Opcionális chat history (előző üzenetek). Formátum: `[{role: "user"|"assistant", content: string}]` |

## Response

Az endpoint SSE (Server-Sent Events) formátumban válaszol. A válasz három típusú eseményt tartalmaz:

### 1. Header event
```
data: {"event_type":"header","data":{"trace_id":"...","mode":"DOC","status_code":"OK"}}
```

Mezők:
- **trace_id**: Egyedi nyomon követési azonosító
- **mode**: Válasz típusa (DOC)
- **status_code**: Válasz státusz (OK)

### 2. Delta eventek
```
data: {"event_type":"delta","data":{"text":"...szöveg chunk..."}}
```

Mezők:
- **text**: A szöveg chunk tartalma

### 3. Footer event
```
data: {"event_type":"footer","data":{"sources":[],"tool_proposal":null,"internal_debug":null}}
```

Mezők:
- **sources**: Forrás dokumentumok listája (landing chat esetén üres)
- **tool_proposal**: Tool javaslatok (landing chat esetén null)
- **internal_debug**: Debug információk (landing chat esetén null)

## Példa válasz

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"

url = f"{BASE_URL}/landing/chat/stream"
payload = {
    "text": "Mi a vállalat fő szolgáltatása?",
    "session_id": "landing-session-123"
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
            
            if event_type == "header":
                import json
                header_data = json.loads(event_data)
                print(f"Trace ID: {header_data['trace_id']}")
                print(f"Mode: {header_data['mode']}")
                print(f"Status Code: {header_data['status_code']}")
            
            elif event_type == "delta":
                import json
                delta_data = json.loads(event_data)
                print(delta_data['text'], end='', flush=True)
            
            elif event_type == "footer":
                import json
                footer_data = json.loads(event_data)
                print(f"\n\n[Footer: {len(footer_data['sources'])} forrás]")
```

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";

const url = `${BASE_URL}/landing/chat/stream`;
const payload = {
    text: "Mi a vállalat fő szolgáltatása?",
    session_id: "landing-session-123"
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
            const event_data = JSON.parse(event_part);
            
            if (event_type === "header") {
                console.log(`Trace ID: ${event_data.data.trace_id}`);
                console.log(`Mode: ${event_data.data.mode}`);
                console.log(`Status Code: ${event_data.data.status_code}`);
            }
            
            else if (event_type === "delta") {
                process.stdout.write(event_data.data.text);
            }
            
            else if (event_type === "footer") {
                console.log(`\n\n[Footer: ${event_data.data.sources.length} forrás]`);
            }
        }
    }
}
```

#### cURL
```bash
curl -X POST "$BASE_URL/landing/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"text": "Mi a vállalat fő szolgáltatása?", "session_id": "landing-session-123"}' | while IFS= read -r line; do
    if [[ $line == data:* ]]; then
        event_type=$(echo "$line" | cut -d':' -f2 | tr -d ' ')
        event_data=$(echo "$line" | cut -d':' -f3-)
        
        if [ "$event_type" = "header" ]; then
            echo "Trace ID: $event_data"
        elif [ "$event_type" = "delta" ]; then
            echo "$event_data"
        elif [ "$event_type" = "footer" ]; then
            echo "[Footer]"
        fi
    fi
  done
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";

$url = $BASE_URL . "/landing/chat/stream";
$payload = json_encode([
    "text" => "Mi a vállalat fő szolgáltatása?",
    "session_id" => "landing-session-123"
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
        $parts = explode(":", $event_part, 2);
        $event_type = $parts[0];
        $event_data = $parts[1] ?? '';
        
        if ($event_type === "header") {
            $data = json_decode($event_data, true);
            echo "Trace ID: " . ($data['data']['trace_id'] ?? 'N/A') . "\n";
            echo "Mode: " . ($data['data']['mode'] ?? 'N/A') . "\n";
            echo "Status Code: " . ($data['data']['status_code'] ?? 'N/A') . "\n";
        }
        
        else if ($event_type === "delta") {
            $data = json_decode($event_data, true);
            echo $data['data']['text'] ?? '';
        }
        
        else if ($event_type === "footer") {
            $data = json_decode($event_data, true);
            echo "\n\n[Footer: " . count($data['data']['sources'] ?? []) . " forrás]\n";
        }
    }
}
?>
```

## Tippek

- **Session ID**: A session_id-t használhatod a felhasználói sessionok nyomon követéséhez. Ha nincs megadva, a rendszer generál egyet.
- **Chat History**: A history mezővel küldhetsz előző üzeneteket a kontextushoz. Formátum: `[{role: "user"|"assistant", content: string}]`.
- **Rate Limit**: Az endpoint IP alapú rate limitelést alkalmaz. Ha túlléped a limitet, 429-es hivatkozást kapsz.
- **Landing Tudás**: A válasz az "attila" tenant landing tudásbázisára épül. Ha nincs releváns információ, a rendszer azt jelzi.
- **Költség**: A landing chat költsége az "attila" tenant alatt jelenik meg.
- **SSE Streaming**: A válasz SSE formátumban érkezik. Minden sor egy eseményt tartalmaz (`data: {...}`).
- **Trace ID**: A trace_id-t használhatod a válaszok nyomon követéséhez és hibakereséshez.

## Hibák

| HTTP kód | Leírás |
|----------|--------|
| **400** | Hiányzó vagy üres text mező |
| **503** | Landing chat nem engedélyezett vagy nincs konfigurálva |
| **429** | Rate limit túllépés |

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
