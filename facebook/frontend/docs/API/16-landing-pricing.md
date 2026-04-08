# Landing árazási táblázat

Ez a dokumentum a GET /landing/pricing endpointet mutatja be.

## Leírás

A GET /landing/pricing endpoint az összes (globális) végpont neve és az éles/fallback input és output árakat (Ft / 1M token, HUF) tartalmazza. Ez az endpoint nyilvános, nincs hitelesítve.

Az adat az adatbázisból (global_config) jön: `llm_endpoint_prices`, `llm_endpoint_fallback1_prices`.

## Válasz struktúra

Az endpoint JSON formátumban adja vissza az árlistát:

```json
{
  "endpoints": [
    {
      "name": "chat",
      "input_live": 50.5,
      "output_live": 75.25,
      "input_fallback": 45.0,
      "output_fallback": 67.5
    },
    {
      "name": "landing_chat",
      "input_live": 30.0,
      "output_live": 45.0,
      "input_fallback": null,
      "output_fallback": null
    }
  ]
}
```

### Mezők

| Mező | Típus | Leírás |
|------|-------|--------|
| **endpoints** | array | Az endpointok listája. Minden endpoint tartalmazza: |
| **name** | string | Az endpoint neve (pl. "chat", "landing_chat", "shopping"). |
| **input_live** | float | Éles input ár Ft / 1M token. |
| **output_live** | float | Éles output ár Ft / 1M token. |
| **input_fallback** | float | Fallback input ár Ft / 1M token. |
| **output_fallback** | float | Fallback output ár Ft / 1M token. |

## Példa

### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/landing/pricing"

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
const url = `${BASE_URL}/landing/pricing`;

const headers = {
    "Accept": "application/json"
};

const response = await fetch(url, {
    method: "GET",
    headers: headers
});

const pricing = await response.json();
console.log("Status:", response.status);
console.log("Response:", pricing);
```

### cURL

```bash
curl -X GET "$BASE_URL/landing/pricing" \
  -H "Accept: application/json"
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$url = $BASE_URL . "/landing/pricing";

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

$pricing = json_decode($response, true);
echo "Status: " . http_response_code() . "\n";
echo "Response: " . print_r($pricing, true);
?>
```

---

## Tippek

- **Nyilvános endpoint**: A GET /landing/pricing nincs hitelesítve, nyilvánosan elérhető.
- **Éles árak**: Az `input_live` és `output_live` mezők az éles árakat tartalmazzák.
- **Fallback árak**: Az `input_fallback` és `output_fallback` mezők a fallback árakat tartalmazzák (ha az éles árak nem elérhetők).
- **Null értékek**: Ha nincs beállítva az ár, a mező `null` értéket kap.
- **Árlista oldal**: Az árlista oldal ezt az endpointot használja az árak megjelenítéséhez.

---

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
