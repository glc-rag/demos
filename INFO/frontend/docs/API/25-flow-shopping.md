# Teljes folyamat: Shopping

A `/shopping` endpoint terméket ajánl webshop látogatóknak. A felhasználó üzenet alapján keres termékeket, kategóriákat listáz, vagy ár-érzékeny keresést végez.

## Hitelesítés

- **public_widget_token**: Widget token alapú hitelesítés (nyilvános widget)
- **token_id**: Token ID alapú hitelesítés (internal)

## Request

```json
{
  "text": "ajánlj órát",
  "session_id": "user-session-123",
  "public_widget_token": "widget-token-abc",
  "token_id": "internal-token-xyz"
}
```

## Response

```json
{
  "trace_id": "abc-123",
  "status_code": "OK",
  "body": {
    "text": "A keresésed alapján a következő terméket ajánlom: Doxa Karóra (1 200 000 Ft).",
    "products": [
      {
        "product_id": "prod-123",
        "name": "Doxa Karóra",
        "price": "1 200 000",
        "currency": "HUF",
        "image_url": "https://example.com/image.jpg",
        "product_url": "https://example.com/product/123",
        "description": "Elegáns karóra",
        "category": "óra",
        "in_stock": true,
        "score": 0.95
      }
    ]
  },
  "ux_context": {}
}
```

## Példa

### Python

```python
import requests

BASE_URL = "https://<your-api-host>/"

response = requests.post(
    f"{BASE_URL}/shopping",
    json={
        "text": "ajánlj órát",
        "session_id": "user-session-123",
        "public_widget_token": "widget-token-abc",
    },
    headers={"Content-Type": "application/json"},
)

print(response.json())
```

### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>/";

const response = await fetch(`${BASE_URL}/shopping`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "ajánlj órát",
    session_id: "user-session-123",
    public_widget_token: "widget-token-abc",
  }),
});

const result = await response.json();
console.log(result);
```

### cURL

```bash
curl -X POST "${BASE_URL}/shopping" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "ajánlj órát",
    "session_id": "user-session-123",
    "public_widget_token": "widget-token-abc"
  }'
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>/";

$response = file_get_contents($BASE_URL . "/shopping", [
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\r\n",
        'content' => json_encode([
            "text" => "ajánlj órát",
            "session_id" => "user-session-123",
            "public_widget_token" => "widget-token-abc",
        ])
    ]
]);

$result = json_decode($response, true);
print_r($result);
?>
```

## Kategória listázás (opcionális)

A felhasználó kérdezheti a termékkategóriákat. Az LLM felismeri a kategória listázás kérését és a backend automatikusan listázza a kategóriákat.

### Példa

```json
{
  "text": "milyen kategóriák vannak?",
  "session_id": "user-session-123"
}
```

## Ár-érzékeny keresés (opcionális)

A felhasználó ár-érzékeny keresést végezhet: legolcsóbb, legdrágább, ár tartomány, vagy konkrét összeg körül.

### Példák

#### Legolcsóbb

```json
{
  "text": "legolcsóbb aranyórát",
  "session_id": "user-session-123"
}
```

#### Legdrágább

```json
{
  "text": "legdrágább Rolex",
  "session_id": "user-session-123"
}
```

#### Ár tartomány

```json
{
  "text": "doxa órát keresek 400000 és 800000 forint között",
  "session_id": "user-session-123"
}
```

#### Konkrét összeg körül

```json
{
  "text": "keress órát 500000 Ft körül",
  "session_id": "user-session-123"
}
```

## Mechanizmus

A `/shopping` endpoint a következő lépéseket követi:

1. **Request parsing**: A felhasználó üzenetét (`text`) és az opcionális paramétereket (`session_id`, `public_widget_token`, `token_id`) feldolgozza.

2. **Shopping intent felismerés**: Az LLM felismeri a shopping intent típusát:
   - **Kategória listázás**: A felhasználó a termékkategóriák listázását kéri
   - **Ár-érzékeny keresés**: Ár intent (cheapest, most_expensive, cheaper, more_expensive, price_range)
   - **Normál keresés**: Termék keresés

3. **Tool kiválasztás**: Az LLM kiválasztja a megfelelő shopping tool-t:
   - `get_vector_products`: Vector találatok lekérése
   - `search_products`: Termékek név/leírás alapján
   - `search_products_by_price_range`: Ártartomány
   - `search_products_cheapest`: Legolcsóbb N db
   - `search_products_most_expensive`: Legdrágább N db
   - `search_products_by_single_amount`: Konkrét összeg körül
   - `search_products_hybrid`: Hybrid keresés (vector + text/ár)
   - `answer`: Válasz szöveg

4. **4-list search**: Minden search tool esetén 4 keresés történik:
   - `vector_ids_orig`: Vector találatok eredeti formában (max 5)
   - `vector_ids_lemma`: Vector találatok lemmatizált formában (max 5)
   - `search_terms`: Text keresés (max 5)
   - `search_terms_lemma`: Text keresés lemmatizált formában (max 5)

5. **Merge és deduplikáció**: A 4 lista össze van merge-elve, product_id szerint deduplikálva, majd max 20 elemet tartalmazó lista jön létre.

6. **Szűrés**: A keresés eredményét szűrik:
   - `search_terms`: A termék name/description tartalmazza a search_terms minden szavát
   - `must_contain_in_products`: A kérésben szereplő márka minden termékben szerepel

7. **Rendezés**: Cheapest/most_expensive esetén ár szerinti rendezés történik.

8. **SQL generálás**: A backend építi a SQL query-t a tool alapján.

9. **Válasz generálás**: Az LLM generál egy szöveges összefoglalót a termékek alapján.

10. **Response**: A válasz tartalmazza a szöveget és a termékek listáját (ShoppingProductCard).

## Tip

- A `/shopping` endpoint a termékek közvetlen lekérdezésére szolgál a `product_meta` táblából.
- A termékek NEM kerülnek a RAG DocumentStore-ba.
- Az ár konvertálása Ft-ba történik, az LLM a szövegben lévő számokat értelmezi (pl. "100 ezer" = 100000).
- A 4-list search biztosítja a pontos és releváns találatokat.
