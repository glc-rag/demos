# Teljes folyamat: Bejelentkezés → token → chat

Ez a dokumentum bemutatja, hogyan lehet egy teljes chat folyamatot végrehajtani a bejelentkezés és chat hívás kombinációjával. A folyamat három lépésből áll:

1. **Bejelentkezés** - JWT token lekérése
2. **Token tárolása** - A token biztonságos tárolása
3. **Chat hívás** - A token használatával chat üzenet küldése

## Lépés 1: Bejelentkezés (JWT token lekérése)

A bejelentkezés a `/auth/login` endpointon keresztül történik.

### Request

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| **user_id** | string | Igen | Felhasználó azonosító |
| **tenant_id** | string | Igen | Tenant azonosító |
| **password** | string | Igen | Felhasználói jelszó |

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "user_123",
  "tenant_id": "tenant_456",
  "role": "editor",
  "expires_in": 86400
}
```

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"

url = f"{BASE_URL}/auth/login"
payload = {
    "user_id": "user_123",
    "tenant_id": "tenant_456",
    "password": "jelszo123"
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

if response.status_code == 200:
    data = response.json()
    access_token = data["access_token"]
    print(f"Token lekérve: {access_token[:50]}...")
    print(f"User ID: {data['user_id']}")
    print(f"Tenant ID: {data['tenant_id']}")
    print(f"Role: {data['role']}")
    print(f"Expires in: {data['expires_in']} seconds")
else:
    print(f"Hiba: {response.status_code} - {response.text}")
```

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";

const url = `${BASE_URL}/auth/login`;
const payload = {
    user_id: "user_123",
    tenant_id: "tenant_456",
    password: "jelszo123"
};

const headers = {
    "Content-Type": "application/json"
};

const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
});

if (response.status === 200) {
    const data = await response.json();
    const access_token = data.access_token;
    console.log(`Token lekérve: ${access_token.substring(0, 50)}...`);
    console.log(`User ID: ${data.user_id}`);
    console.log(`Tenant ID: ${data.tenant_id}`);
    console.log(`Role: ${data.role}`);
    console.log(`Expires in: ${data.expires_in} seconds`);
} else {
    console.error(`Hiba: ${response.status} - ${response.statusText}`);
}
```

#### cURL
```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_123", "tenant_id": "tenant_456", "password": "jelszo123"}'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";

$url = $BASE_URL . "/auth/login";
$payload = json_encode([
    "user_id" => "user_123",
    "tenant_id" => "tenant_456",
    "password" => "jelszo123"
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 10);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    $data = json_decode($response, true);
    $access_token = $data['access_token'];
    echo "Token lekérve: " . substr($access_token, 0, 50) . "...\n";
    echo "User ID: " . $data['user_id'] . "\n";
    echo "Tenant ID: " . $data['tenant_id'] . "\n";
    echo "Role: " . $data['role'] . "\n";
    echo "Expires in: " . $data['expires_in'] . " seconds\n";
} else {
    echo "Hiba: $http_code - $response\n";
}
?>
```

## Lépés 2: Token tárolása

A lekért JWT token biztonságos tárolása szükséges a későbbi használatra.

### Python

```python
import requests
import json
import os

BASE_URL = "https://<your-api-host>"

# 1. Bejelentkezés
login_url = f"{BASE_URL}/auth/login"
login_payload = {
    "user_id": "user_123",
    "tenant_id": "tenant_456",
    "password": "jelszo123"
}

login_response = requests.post(login_url, json=login_payload)
if login_response.status_code == 200:
    data = login_response.json()
    access_token = data["access_token"]
    
    # 2. Token tárolása fájlokba
    token_file = ".token"
    with open(token_file, "w") as f:
        json.dump({"access_token": access_token}, f)
    print("Token tárolva fájlokba.")
else:
    print(f"Bejelentkezés sikertelen: {login_response.status_code}")
    exit(1)
```

### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";

// 1. Bejelentkezés
const login_url = `${BASE_URL}/auth/login`;
const login_payload = {
    user_id: "user_123",
    tenant_id: "tenant_456",
    password: "jelszo123"
};

const login_response = await fetch(login_url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(login_payload)
});

if (login_response.status === 200) {
    const data = await login_response.json();
    const access_token = data.access_token;
    
    // 2. Token tárolása fájlokba
    const token_file = ".token";
    const token_data = { access_token };
    const fs = require('fs');
    fs.writeFileSync(token_file, JSON.stringify(token_data));
    console.log("Token tárolva fájlokba.");
} else {
    console.error(`Bejelentkezés sikertelen: ${login_response.status}`);
    process.exit(1);
}
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";

// 1. Bejelentkezés
$url = $BASE_URL . "/auth/login";
$payload = json_encode([
    "user_id" => "user_123",
    "tenant_id" => "tenant_456",
    "password" => "jelszo123"
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 10);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    $data = json_decode($response, true);
    $access_token = $data['access_token'];
    
    // 2. Token tárolása fájlokba
    $token_file = ".token";
    $token_data = json_encode(["access_token" => $access_token]);
    file_put_contents($token_file, $token_data);
    echo "Token tárolva fájlokba.\n";
} else {
    echo "Hiba: $http_code - $response\n";
}
?>
```

## Lépés 3: Chat hívás JWT tokennel

A lekért JWT token használatával chat üzenet küldhető a `/chat` endpointon keresztül.

### Request

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| **channel** | string | Igen | `internal` (JWT hitelesítés) vagy `public` |
| **text** | string | Igen | A felhasználó üzenete |
| **session_id** | string | Igen | Session azonosító |
| **tenant_id** | string | Nem | Opcionális (JWT-ből jön) |
| **user_id** | string | Nem | Opcionális (JWT-ből jön) |

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

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
import json

BASE_URL = "https://<your-api-host>"

# Token betöltése fájlból
with open(".token", "r") as f:
    token_data = json.load(f)
access_token = token_data["access_token"]

# Chat hívás
chat_url = f"{BASE_URL}/chat"
chat_payload = {
    "channel": "internal",
    "text": "Mi a cégetek fő szolgáltatása?",
    "session_id": "chat-session-123"
}

headers = {
    "Authorization": f"Bearer {access_token}",
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

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";

// Token betöltése fájlból
const fs = require('fs');
const token_data = JSON.parse(fs.readFileSync('.token', 'utf-8'));
const access_token = token_data.access_token;

// Chat hívás
const chat_url = `${BASE_URL}/chat`;
const chat_payload = {
    channel: "internal",
    text: "Mi a cégetek fő szolgáltatása?",
    session_id: "chat-session-123"
};

const headers = {
    "Authorization": `Bearer ${access_token}`,
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

#### cURL
```bash
# Token betöltése fájlból
TOKEN=$(cat .token | jq -r '.access_token')

# Chat hívás
curl -X POST "$BASE_URL/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "channel": "internal",
    "text": "Mi a cégetek fő szolgáltatása?",
    "session_id": "chat-session-123"
  }'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";

// Token betöltése fájlból
$token_data = json_decode(file_get_contents('.token'), true);
$access_token = $token_data['access_token'];

// Chat hívás
$url = $BASE_URL . "/chat";
$payload = json_encode([
    "channel" => "internal",
    "text" => "Mi a cégetek fő szolgáltatása?",
    "session_id" => "chat-session-123"
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $access_token",
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
} else {
    echo "Hiba: $http_code - $response\n";
}
?>
```

## Teljes folyamat (Python)

Ez a példa mutatja be a teljes folyamatot: bejelentkezés → token tárolása → chat hívás.

```python
import requests
import json

BASE_URL = "https://<your-api-host>"

# 1. Bejelentkezés
login_url = f"{BASE_URL}/auth/login"
login_payload = {
    "user_id": "user_123",
    "tenant_id": "tenant_456",
    "password": "jelszo123"
}

login_response = requests.post(login_url, json=login_payload)
if login_response.status_code == 200:
    data = login_response.json()
    access_token = data["access_token"]
    
    # 2. Token tárolása fájlokba
    with open(".token", "w") as f:
        json.dump({"access_token": access_token}, f)
    print("Token tárolva fájlokba.")
else:
    print(f"Bejelentkezés sikertelen: {login_response.status_code}")
    exit(1)

# 3. Chat hívás
chat_url = f"{BASE_URL}/chat"
chat_payload = {
    "channel": "internal",
    "text": "Mi a cégetek fő szolgáltatása?",
    "session_id": "chat-session-123"
}

headers = {
    "Authorization": f"Bearer {access_token}",
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

// 1. Bejelentkezés
const login_url = `${BASE_URL}/auth/login`;
const login_payload = {
    user_id: "user_123",
    tenant_id: "tenant_456",
    password: "jelszo123"
};

const login_response = await fetch(login_url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(login_payload)
});

if (login_response.status === 200) {
    const data = await login_response.json();
    const access_token = data.access_token;
    
    // 2. Token tárolása fájlokba
    const fs = require('fs');
    const token_data = { access_token };
    fs.writeFileSync('.token', JSON.stringify(token_data));
    console.log("Token tárolva fájlokba.");
} else {
    console.error(`Bejelentkezés sikertelen: ${login_response.status}`);
    process.exit(1);
}

// 3. Chat hívás
const chat_url = `${BASE_URL}/chat`;
const chat_payload = {
    channel: "internal",
    text: "Mi a cégetek fő szolgáltatása?",
    session_id: "chat-session-123"
};

const headers = {
    "Authorization": `Bearer ${access_token}`,
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

- **Token élettartam**: A JWT token élettartama általában 24 óra (86400 másodperc). Ha a token lejárt, új bejelentkezést kell végezni.
- **Token tárolás**: A tokenet biztonságosan tárolja, és csak a szükséges folyamatok számára teszi elérhetővé.
- **Session ID**: A session_id-t használhatod a felhasználói sessionok nyomon követéséhez.
- **Channel**: Az `internal` channel JWT token hitelesítést igényel. A `public` channel widget token hitelesítést igényel.
- **Trace ID**: A trace_id-t használhatod a válaszok nyomon követéséhez és hibakereséshez.
- **Rate Limit**: Az endpoint rate limiteltek. Ha túlléped a limitet, 429-es hivatkozást kapsz.

## Hibák

| HTTP kód | Leírás |
|----------|--------|
| **401** | Érvénytelen vagy lejárt JWT token |
| **400** | Hiányzó vagy érvénytelen request body |
| **429** | Rate limit túllépés |
| **503** | Szolgáltatás nem elérhető |

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
