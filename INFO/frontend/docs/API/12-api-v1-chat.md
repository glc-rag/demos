# Modul: POST /api/v1/chat

Backend-to-Backend Chat API a GLC-RAG-hoz. Ez az endpoint kifejezetten backend rendszerek számára készült, API key hitelesítéssel.

## Leírás

A `/api/v1/chat` endpoint egy egyszerűsített chat API, amelynek célja a backend-to-backend integrációk megkönnyítése. Az endpoint API key hitelesítést igényel, és támogatja a különböző módokat (rag, shopping, creative, archive).

**Fontos**: Ez az endpoint backend rendszerek számára készült, nem közvetlen felhasználói felületekhez.

## Hitelesítés

Az endpoint **csak** **X-API-Key** headerrel hitelesít. Az API keynek `rak_` prefixel kell rendelkeznie. JWT vagy widget token ezen az endpointon nem használható (a /chat és /chat/stream azokhoz a csatornához valók).

## Példa

Egy egyszerű shopping kérés:

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"
API_KEY = "rak_your_api_key_here"

url = f"{BASE_URL}/api/v1/chat"
payload = {
    "text": "Keresek piros női cipőt",
    "session_id": "shopping-session-123",
    "mode": "shopping"
}

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

response = requests.post(url, json=payload, headers=headers)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")
```

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";
const API_KEY = "rak_your_api_key_here";

const url = `${BASE_URL}/api/v1/chat`;
const payload = {
    text: "Keresek piros női cipőt",
    session_id: "shopping-session-123",
    mode: "shopping"
};

const headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
};

const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
});

const data = await response.json();
console.log(`Status Code: ${response.status}`);
console.log(`Response:`, data);
```

#### cURL
```bash
curl -X POST "$BASE_URL/api/v1/chat" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: rak_your_api_key_here" \
  -d '{
    "text": "Keresek piros női cipőt",
    "session_id": "shopping-session-123",
    "mode": "shopping"
  }'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";
$API_KEY = "rak_your_api_key_here";

$url = $BASE_URL . "/api/v1/chat";
$payload = json_encode([
    "text" => "Keresek piros női cipőt",
    "session_id" => "shopping-session-123",
    "mode" => "shopping"
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "X-API-Key: $API_KEY"
]);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 10);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status Code: $http_code\n";
echo "Response: $response\n";
?>
```

## Request body

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| **text** | string | Igen | A felhasználó üzenete |
| **session_id** | string | Nem | Opcionális session azonosító (ha nincs, generálunk) |
| **mode** | string | Nem | Opcionális mód: `rag`, `shopping`, `creative`, `archive` |

## Response

Az endpoint `ApiChatResponse` formátumban válaszol:

| Mező | Típus | Leírás |
|------|-------|--------|
| **trace_id** | string | Nyomkövetési azonosító |
| **status_code** | string | Válasz státusz (OK, NO_RESULT_DOC, NO_PRODUCTS, stb.) |
| **text** | string | AI válasz szövege |
| **sources** | array | RAG források (ha releváns) |
| **products** | array | Termékek (shopping mód esetén) |
| **mode** | string | Használt mód |

## Példa válasz

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"
API_KEY = "rak_your_api_key_here"

url = f"{BASE_URL}/api/v1/chat"
payload = {
    "text": "Keresek piros női cipőt",
    "session_id": "shopping-session-123",
    "mode": "shopping"
}

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

print(f"Trace ID: {data['trace_id']}")
print(f"Status Code: {data['status_code']}")
print(f"Text: {data['text']}")
print(f"Sources: {data['sources']}")
print(f"Products: {data['products']}")
print(f"Mode: {data['mode']}")
```

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";
const API_KEY = "rak_your_api_key_here";

const url = `${BASE_URL}/api/v1/chat`;
const payload = {
    text: "Keresek piros női cipőt",
    session_id: "shopping-session-123",
    mode: "shopping"
};

const headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
};

const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
});

const data = await response.json();

console.log(`Trace ID: ${data.trace_id}`);
console.log(`Status Code: ${data.status_code}`);
console.log(`Text: ${data.text}`);
console.log(`Sources: ${JSON.stringify(data.sources)}`);
console.log(`Products: ${JSON.stringify(data.products)}`);
console.log(`Mode: ${data.mode}`);
```

#### cURL
```bash
curl -X POST "$BASE_URL/api/v1/chat" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: rak_your_api_key_here" \
  -d '{
    "text": "Keresek piros női cipőt",
    "session_id": "shopping-session-123",
    "mode": "shopping"
  }' | jq '.'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";
$API_KEY = "rak_your_api_key_here";

$url = $BASE_URL . "/api/v1/chat";
$payload = json_encode([
    "text" => "Keresek piros női cipőt",
    "session_id" => "shopping-session-123",
    "mode" => "shopping"
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "X-API-Key: $API_KEY"
]);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 10);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);

echo "Trace ID: " . ($data['trace_id'] ?? 'N/A') . "\n";
echo "Status Code: " . ($data['status_code'] ?? 'N/A') . "\n";
echo "Text: " . ($data['text'] ?? 'N/A') . "\n";
echo "Sources: " . (is_array($data['sources']) ? count($data['sources']) . ' források' : 'N/A') . "\n";
echo "Products: " . (is_array($data['products']) ? count($data['products']) . ' termékek' : 'N/A') . "\n";
echo "Mode: " . ($data['mode'] ?? 'N/A') . "\n";
?>
```

## Mode opciók

Az endpoint támogatja a következő módokat:

| Mode | Leírás |
|------|--------|
| **rag** | Dokumentum keresés és válasz generálás |
| **shopping** | Termék keresés és ajánlások |
| **creative** | Kreatív tartalom generálás |
| **archive** | Archívum keresés |

Ha nincs megadva a mode, az endpoint alapértelmezetten `chat` módban működik.

## Tippek

- **API Key**: Az API key-t biztonságosan tárold, és soha ne hardkódold a kódba. Használj környezeti változókat vagy titokkezelő rendszereket.
- **Session ID**: A session_id-t használhatod a felhasználói sessionok nyomon követéséhez. Ha nincs megadva, a rendszer generál egyet.
- **Mode**: A mode opciókat használhatod a különböző típusú kérésekhez. Ha nincs megadva, az endpoint alapértelmezetten chat módban működik.
- **Rate Limiting**: Az endpoint rate limiteltek. Ha túlléped a limitet, 429-es hivatkozást kapsz.
- **API Key validálás**: Az API key-nek `rak_` prefixel kell rendelkeznie. Ha érvénytelen, 401-es hivatkozást kapsz.
- **Shopping mode**: A shopping módban az endpoint termékekkel is válaszolhat. A `products` mező tartalmazza a találatokat.
- **RAG mode**: A RAG módban az endpoint dokumentumokból keres választ. A `sources` mező tartalmazza a használt forrásokat.

## Hibák

| HTTP kód | Leírás |
|----------|--------|
| **401** | Érvénytelen vagy hiányzó API key |
| **429** | Rate limit túllépés |
| **500** | Belső szerver hiba |

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
