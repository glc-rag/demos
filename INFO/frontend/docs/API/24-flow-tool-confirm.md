# Tool Megerősítés

Ez a dokumentum a tool megerősítés folyamatát mutatja be.

## Leírás

Ha a chat válaszban `tool_proposal` van, a felhasználónak megerősítenie kell a tool végrehajtását. A tool megerősítés `POST /chat/tool/confirm` endpointon keresztül történik.

**Fontos:** Csak side-effect tool-okat (külső rendszer módosítás) kell megerősíteni.

## State Machine

A tool run state machine:

```
PENDING_CONFIRMATION → CONFIRMED → RUNNING → DONE/FAILED
```

## Hitelesítés

Az API JWT token hitelesítést igényel.

### Headers

| Header | Érték | Leírás |
|--------|-------|--------|
| **Authorization** | Bearer &lt;token&gt; | JWT token hitelesítés. |
| **Content-Type** | application/json | JSON body. |

## Request Body

```json
{
  "tool_run_id": "uuid",
  "modified_parameters": {
    "key": "value"
  }
}
```

### Mezők

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| **tool_run_id** | string | Igen | Tool run identifier (tool_run_id a tool_proposal-ból). |
| **modified_parameters** | object | Nem | Opcionális: módosított paraméterek (ha a tool_run PENDING_CONFIRMATION állapotban van). |

## Válasz

### Sikeres megerősítés

```json
{
  "success": true,
  "result": {
    "tool_id": "send_email",
    "to": "user@example.com",
    "subject": "Üzenet",
    "message_id": "1234567890@example.com"
  },
  "error_message": null,
  "tool_run_id": "uuid"
}
```

### Már futó tool

Ha a tool_run már RUNNING állapotban van:

```json
{
  "success": true,
  "result": null,
  "error_message": null,
  "status": "already_running",
  "tool_run_id": "uuid"
}
```

### Hiba

Ha a tool_run nem található vagy érvénytelen állapotban van:

```json
{
  "success": false,
  "result": null,
  "error_message": "Tool run not found"
}
```

## Példa

### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
url_confirm = f"{BASE_URL}/chat/tool/confirm"

headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

# Tool proposal a chat válaszban
tool_proposal = {
    "tool_run_id": "tool_run_uuid",
    "tool_id": "send_email",
    "tool_name": "Email küldés",
    "parameters": {
        "to": "user@example.com",
        "subject": "Üzenet",
        "body": "Üzenet tartalma"
    }
}

# Tool megerősítése
confirm_data = {
    "tool_run_id": tool_proposal["tool_run_id"]
}
response = requests.post(url_confirm, json=confirm_data, headers=headers)
print(f"Confirm Status: {response.status_code}")
print(f"Confirm Response: {response.json()}")

# Tool megerősítése módosított paraméterekkel
modified_data = {
    "tool_run_id": tool_proposal["tool_run_id"],
    "modified_parameters": {
        "subject": "Módosított tárgy"
    }
}
response = requests.post(url_confirm, json=modified_data, headers=headers)
print(f"Modified Confirm Status: {response.status_code}")
print(f"Modified Confirm Response: {response.json()}")
```

### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";
const url_confirm = `${BASE_URL}/chat/tool/confirm`;

const token = "<token>";

const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
};

// Tool proposal a chat válaszban
const toolProposal = {
    "tool_run_id": "tool_run_uuid",
    "tool_id": "send_email",
    "tool_name": "Email küldés",
    "parameters": {
        "to": "user@example.com",
        "subject": "Üzenet",
        "body": "Üzenet tartalma"
    }
};

// Tool megerősítése
const confirmData = {
    "tool_run_id": toolProposal.tool_run_id
};
const response = await fetch(url_confirm, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(confirmData)
});
console.log("Confirm Status:", response.status);
console.log("Confirm Response:", await response.json());

// Tool megerősítése módosított paraméterekkel
const modifiedData = {
    "tool_run_id": toolProposal.tool_run_id,
    "modified_parameters": {
        "subject": "Módosított tárgy"
    }
};
const modifiedResponse = await fetch(url_confirm, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(modifiedData)
});
console.log("Modified Confirm Status:", modifiedResponse.status);
console.log("Modified Confirm Response:", await modifiedResponse.json());
```

### cURL

```bash
# Tool megerősítése
curl -X POST "$BASE_URL/chat/tool/confirm" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tool_run_id":"tool_run_uuid"}'

# Tool megerősítése módosított paraméterekkel
curl -X POST "$BASE_URL/chat/tool/confirm" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tool_run_id":"tool_run_uuid","modified_parameters":{"subject":"Módosított tárgy"}}'
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$url_confirm = $BASE_URL . "/chat/tool/confirm";

$token = "<token>";

$headers = [
    "Authorization: Bearer $token",
    "Content-Type: application/json"
];

// Tool proposal a chat válaszban
$toolProposal = [
    "tool_run_id" => "tool_run_uuid",
    "tool_id" => "send_email",
    "tool_name" => "Email küldés",
    "parameters" => [
        "to" => "user@example.com",
        "subject" => "Üzenet",
        "body" => "Üzenet tartalma"
    ]
];

// Tool megerősítése
$confirmData = [
    "tool_run_id" => $toolProposal["tool_run_id"]
];
$response = file_get_contents($url_confirm, [
    'http' => [
        'header' => join("\r\n", $headers),
        'method' => 'POST',
        'content' => json_encode($confirmData)
    ]
]);
echo "Confirm Status: " . http_response_code() . "\n";
echo "Confirm Response: " . print_r(json_decode($response, true), true);

// Tool megerősítése módosított paraméterekkel
$modifiedData = [
    "tool_run_id" => $toolProposal["tool_run_id"],
    "modified_parameters" => [
        "subject" => "Módosított tárgy"
    ]
];
$response = file_get_contents($url_confirm, [
    'http' => [
        'header' => join("\r\n", $headers),
        'method' => 'POST',
        'content' => json_encode($modifiedData)
    ]
]);
echo "Modified Confirm Status: " . http_response_code() . "\n";
echo "Modified Confirm Response: " . print_r(json_decode($response, true), true);
?>
```

---

## Tippek

- **Tool proposal**: A chat válaszban `tool_proposal` mezővel érkezik, ha side-effect tool-t kell végrehajtani.
- **Megerősítés**: A tool_run_id a tool_proposal-ból származik.
- **Módosított paraméterek**: Ha a tool_run PENDING_CONFIRMATION állapotban van, módosíthatod a paramétereket.
- **State machine**: PENDING_CONFIRMATION → CONFIRMED → RUNNING → DONE/FAILED
- **Idempotency**: Ugyanazt a tool_run_id-t használva ismételt hívás nem okoz hiba.

---

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
