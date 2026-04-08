# Hitelesítés JWT-val (internal)

Ez a dokumentum bemutatja, hogyan használható a GLC-RAG API JWT (JSON Web Token) alapú hitelesítéssel. A JWT hitelesítés az **internal csatornára** (`channel: "internal"`) kötelező.

---

## Leírás

A JWT hitelesítés a belső felhasználók számára van tervezve. A bejelentkezéskor kapott token-t minden API kérésnél az `Authorization` headerben kell elküldeni.

### Chat endpointok és hitelesítés

| Endpoint | Hitelesítés |
|----------|-------------|
| POST /chat | JWT (internal) vagy widget token (public) |
| POST /chat/stream | JWT (internal) vagy widget token (public) |
| POST /api/v1/chat | Csak API key (X-API-Key header) |

### Token tartalom

A JWT token tartalmazza:
- `user_id`: Felhasználó azonosító
- `tenant_id`: Tenant azonosító
- `role`: Felhasználói szerepkör (pl. "editor", "viewer")
- `exp`: Lejárati idő (Unix timestamp)
- `iat`: Kiállítási idő (Unix timestamp)

### Token élettartam

A JWT token élettartama **24 óra**. Lejárat után újra be kell jelentkezni.

---

## Példa: GET kérés JWT hitelesítéssel

Ez a példa mutatja be, hogyan hívható egy egyszerű GET endpoint JWT tokennel.

### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
JWT_TOKEN = "your-jwt-token-here"

# GET kérés benchmark státusz lekéréséhez
response = requests.get(
    f"{BASE_URL}/admin/benchmark/status/your-job-id",
    headers={
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Content-Type": "application/json"
    }
)

print(response.status_code)
print(response.json())
```

### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";
const JWT_TOKEN = "your-jwt-token-here";

// GET kérés benchmark státusz lekéréséhez
const response = await fetch(
  `${BASE_URL}/admin/benchmark/status/your-job-id`,
  {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${JWT_TOKEN}`,
      "Content-Type": "application/json"
    }
  }
);

const data = await response.json();
console.log(data);
```

### cURL

```bash
# GET kérés benchmark státusz lekéréséhez
curl -X GET "$BASE_URL/admin/benchmark/status/your-job-id" \
  -H "Authorization: Bearer your-jwt-token-here" \
  -H "Content-Type: application/json"
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$JWT_TOKEN = "your-jwt-token-here";

// GET kérés benchmark státusz lekéréséhez
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $BASE_URL . "/admin/benchmark/status/your-job-id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $JWT_TOKEN,
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
echo "Response: " . $response . "\n";
?>
```

---

## Példa: POST kérés JWT hitelesítéssel

Ez a példa mutatja be, hogyan hívható egy POST endpoint JWT tokennel.

### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
JWT_TOKEN = "your-jwt-token-here"

# POST kérés benchmark indításhoz
data = {
    "test_count": 10,
    "benchmark_type": "default"
}

response = requests.post(
    f"{BASE_URL}/admin/benchmark/start",
    json=data,
    headers={
        "Authorization": f"Bearer {JWT_TOKEN}",
        "Content-Type": "application/json"
    }
)

print(response.status_code)
print(response.json())
```

### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";
const JWT_TOKEN = "your-jwt-token-here";

// POST kérés benchmark indításhoz
const data = {
  test_count: 10,
  benchmark_type: "default"
};

const response = await fetch(
  `${BASE_URL}/admin/benchmark/start`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${JWT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }
);

const result = await response.json();
console.log(result);
```

### cURL

```bash
# POST kérés benchmark indításhoz
curl -X POST "$BASE_URL/admin/benchmark/start" \
  -H "Authorization: Bearer your-jwt-token-here" \
  -H "Content-Type: application/json" \
  -d '{"test_count": 10, "benchmark_type": "default"}'
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$JWT_TOKEN = "your-jwt-token-here";

// POST kérés benchmark indításhoz
$data = json_encode([
    "test_count" => 10,
    "benchmark_type" => "default"
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $BASE_URL . "/admin/benchmark/start");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $JWT_TOKEN,
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
echo "Response: " . $response . "\n";
?>
```

---

## Hitelesítési hiba

Ha érvénytelen vagy lejárt token van, a szerver 401-es hibát dob:

```json
{
  "detail": "Invalid or expired token"
}
```

### Python

```python
try:
    response = requests.get(
        f"{BASE_URL}/admin/benchmark/status/your-job-id",
        headers={
            "Authorization": f"Bearer invalid-token",
            "Content-Type": "application/json"
        }
    )
    if response.status_code == 401:
        print("Hiba: Érvénytelen vagy lejárt token")
except requests.exceptions.RequestException as e:
    print(f"Hiba: {e}")
```

### TypeScript

```typescript
try {
  const response = await fetch(
    `${BASE_URL}/admin/benchmark/status/your-job-id`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer invalid-token`,
        "Content-Type": "application/json"
      }
    }
  );

  if (response.status === 401) {
    const error = await response.json();
    console.error("Hiba:", error.detail);
  }
} catch (error) {
  console.error("Hiba:", error);
}
```

### cURL

```bash
# Érvénytelen token esetén 401-es hiba
curl -X GET "$BASE_URL/admin/benchmark/status/your-job-id" \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json"
```

### PHP

```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $BASE_URL . "/admin/benchmark/status/your-job-id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer invalid-token",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($httpCode === 401) {
    $error = json_decode($response, true);
    echo "Hiba: " . $error['detail'] . "\n";
}

curl_close($ch);
?>
```

---

## Tippek

- **Token tárolás**: A tokent biztonságosan tárolja (pl. cookie-ben, environment variable-ban)
- **Token frissítés**: 24 óra után újra kell jelentkezni
- **Internal csatorna**: JWT token kötelező az internal csatornán
- **Tenant izoláció**: A token tartalmazza a tenant_id-t, ami biztosítja a tenant izolációt

---

**További dokumentáció:**
- [02-auth-widget-token.md](./02-auth-widget-token.md) - Hitelesítés widget tokennel
- [03-auth-api-key.md](./03-auth-api-key.md) - Hitelesítés API kulccsal
