# Widget konfiguráció lekérése

Ez a dokumentum a widget konfiguráció lekérését mutatja be a GET /widget/config endpointtel.

## Leírás

A GET /widget/config endpoint a widget beágyazáshoz szükséges konfigurációs adatokat szolgáltat. Ez az endpoint nyilvános, nincs hitelesítve.

A válasz tartalmazza az API base URL-t, amelyet a widget és az embed snippet használ a backend elérhetőségéhez.

## Válasz struktúra

Az endpoint JSON formátumban adja vissza a konfigurációt:

```json
{
  "api_base_url": "https://<your-api-host>"
}
```

### Mezők

| Mező | Típus | Leírás |
|------|-------|--------|
| **api_base_url** | string | Az API base URL, amelyet a widget használ a backend elérhetőségéhez. A `BACKEND_URL` environment változóból származik. |

## Példa

### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/widget/config"

headers = {
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";
const url = `${BASE_URL}/widget/config`;

const headers = {
    "Accept": "application/json"
};

const response = await fetch(url, {
    method: "GET",
    headers: headers
});

const config = await response.json();
console.log("Status:", response.status);
console.log("Response:", config);
```

### cURL

```bash
curl -X GET "$BASE_URL/widget/config" \
  -H "Accept: application/json"
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$url = $BASE_URL . "/widget/config";

$headers = [
    "Accept: application/json"
];

$response = file_get_contents($url, [
    'http' => [
        'header' => join("\r\n", $headers),
        'method' => 'GET',
        'content' => ''
    ]
]);

$config = json_decode($response, true);
echo "Status: " . http_response_code() . "\n";
echo "Response: " . print_r($config, true);
?>
```

---

## Tippek

- **Nyilvános endpoint**: A GET /widget/config nincs hitelesítve, nyilvánosan elérhető.
- **API base URL**: A válaszban található `api_base_url`-t használja a widget a backend elérhetőségéhez.
- **Embed snippet**: A widget embed snippet automatikusan lekéri ezt az endpointot a konfigurációhoz.
- **Same-origin**: Mivel a widget same-origin-ban fut, a /widget oldal és az embed snippet mindig a helyes base URL-t használják.

---

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
