# Teljes folyamat: Landing chat

Ez a dokumentum bemutatja, hogyan lehet egy teljes chat folyamatot végrehajtani a landing chat endpointon keresztül. A landing chat nyilvános, nincs hitelesítés, és IP alapú rate limitinget használ.

## Lépés 1: Landing chat hívás

A landing chat a `/landing/chat/stream` endpointon keresztül érhető el. Az endpoint nyilvános, nincs hitelesítés, és az "attila" tenant tudásbázisára épül.

### Request

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| **text** | string | Igen | A felhasználó üzenete |
| **session_id** | string | Nem | Opcionális session azonosító |
| **history** | array | Nem | Opcionális chat history (előző üzenetek) |

### Response

```
data: {"event_type":"header","data":{"trace_id":"abc-123-def-456","mode":"DOC","status_code":"OK"}}

data: {"event_type":"delta","data":{"text":"Ez a válasz..."}}

data: {"event_type":"footer","data":{"sources":[],"tool_proposal":null,"internal_debug":null}}
```

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"

url = f"{BASE_URL}/landing/chat/stream"
payload = {
    "text": "Mi a cégetek fő szolgáltatása?",
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
    text: "Mi a cégetek fő szolgáltatása?",
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
  -d '{"text": "Mi a cégetek fő szolgáltatása?", "session_id": "landing-session-123"}'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";

$url = $BASE_URL . "/landing/chat/stream";
$payload = json_encode([
    "text" => "Mi a cégetek fő szolgáltatása?",
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
        echo "$event_type: $event_data\n";
    }
}
?>
```

## Lépés 2: Chat history küldése

A chat history opcióval küldhetsz előző üzeneteket a kontextushoz. Ez segít a hosszabb beszélgetésekben.

### Request

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| **text** | string | Igen | A felhasználó üzenete |
| **session_id** | string | Nem | Opcionális session azonosító |
| **history** | array | Nem | Opcionális chat history (előző üzenetek) |

### History formátum

```json
[
  {"role": "user", "content": "Üdvözlök!"},
  {"role": "assistant", "content": "Szia! Miben segíthetek?"},
  {"role": "user", "content": "Mi a cégetek fő szolgáltatása?"}
]
```

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"

url = f"{BASE_URL}/landing/chat/stream"
payload = {
    "text": "Mi a cégetek fő szolgáltatása?",
    "session_id": "landing-session-123",
    "history": [
        {"role": "user", "content": "Üdvözlök!"},
        {"role": "assistant", "content": "Szia! Miben segíthetek?"}
    ]
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
                print(f"Trace ID: {header_data['data']['trace_id']}")
            
            elif event_type == "delta":
                delta_data = json.loads(event_data)
                print(delta_data['data']['text'], end='', flush=True)
            
            elif event_type == "footer":
                footer_data = json.loads(event_data)
                print(f"\n\n[Válasz készült! Források: {len(footer_data['data']['sources'])}]")
```

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";

const url = `${BASE_URL}/landing/chat/stream`;
const payload = {
    text: "Mi a cégetek fő szolgáltatása?",
    session_id: "landing-session-123",
    history: [
        { role: "user", content: "Üdvözlök!" },
        { role: "assistant", content: "Szia! Miben segíthetek?" }
    ]
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

#### cURL
```bash
curl -X POST "https://<your-api-host>/landing/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "text": "Mi a cégetek fő szolgáltatása?",
    "session_id": "landing-session-123",
    "history": [
      {"role": "user", "content": "Üdvözlök!"},
      {"role": "assistant", "content": "Szia! Miben segíthetek?"}
    ]
  }'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";

$url = $BASE_URL . "/landing/chat/stream";
$payload = json_encode([
    "text" => "Mi a cégetek fő szolgáltatása?",
    "session_id" => "landing-session-123",
    "history" => [
        ["role" => "user", "content" => "Üdvözlök!"],
        ["role" => "assistant", "content" => "Szia! Miben segíthetek?"]
    ]
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
        }
        
        else if ($event_type === "delta") {
            $data = json_decode($event_data, true);
            echo $data['data']['text'] ?? '';
        }
        
        else if ($event_type === "footer") {
            $data = json_decode($event_data, true);
            echo "\n\n[Válasz készült! Források: " . count($data['data']['sources'] ?? []) . "]\n";
        }
    }
}
?>
```

## Teljes folyamat (Python)

Ez a példa mutatja be a teljes folyamatot: landing chat hívás chat historyvel.

```python
import requests
import json

BASE_URL = "https://<your-api-host>"

# 1. Landing chat hívás
chat_url = f"{BASE_URL}/landing/chat/stream"
chat_payload = {
    "text": "Mi a cégetek fő szolgáltatása?",
    "session_id": "landing-session-123",
    "history": [
        {"role": "user", "content": "Üdvözlök!"},
        {"role": "assistant", "content": "Szia! Miben segíthetek?"}
    ]
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

// 1. Landing chat hívás
const chat_url = `${BASE_URL}/landing/chat/stream`;
const chat_payload = {
    text: "Mi a cégetek fő szolgáltatása?",
    session_id: "landing-session-123",
    history: [
        { role: "user", content: "Üdvözlök!" },
        { role: "assistant", content: "Szia! Miben segíthetek?" }
    ]
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

- **Landing chat**: Az endpoint nyilvános, nincs hitelesítés. Csak a landing page-en használható.
- **Session ID**: A session_id-t használhatod a felhasználói sessionok nyomon követéséhez. Ha nincs megadva, a rendszer generál egyet.
- **Chat History**: A history opcióval küldhetsz előző üzeneteket a kontextushoz. Ez segít a hosszabb beszélgetésekben.
- **Rate Limit**: Az endpoint IP alapú rate limitelést alkalmaz. Ha túlléped a limitet, 429-es hivatkozást kapsz.
- **Attilla Tenant**: A landing chat az "attila" tenant tudásbázisára épül.
- **Költség**: A landing chat költsége az "attila" tenant alatt jelenik meg.
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
