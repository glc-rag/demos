# Hitelesítés API kulccsal

API key alapú hitelesítés backend-to-backend kommunikációhoz. **Chat esetén** az egyetlen dokumentált és támogatott módszer: **POST /api/v1/chat** + **X-API-Key** header. Az API kulcsot **ne** body-ban add meg a chatnál; a header az elsődleges és egyetlen dokumentált.

## Leírás

### Chat endpointok és hitelesítés

| Endpoint | Hitelesítés |
|----------|-------------|
| POST /chat | JWT (internal) vagy widget token (public) |
| POST /chat/stream | JWT (internal) vagy widget token (public) |
| POST /api/v1/chat | Csak API key (X-API-Key header) |

- **X-API-Key header**: A backend-to-backend chat (POST /api/v1/chat) esetén az API kulcsot a **X-API-Key** headerben kell elküldeni. A kulcsnak `rak_` prefixel kell rendelkeznie.
- **Tenant ID**: Az API key-ből feloldott tenant identitás; a kliensnek nem kell megadnia.
- Az API key hitelesítés szerver oldali használatra tervezett, ne böngészőből használd.
- Részletes chat API leírás: [12-api-v1-chat.md](./12-api-v1-chat.md).

## Példa

Egy egyszerű chat hívás API key hitelesítéssel (POST /api/v1/chat, **X-API-Key** header):

#### Python
```python
import requests

BASE_URL = "https://<your-api-host>"
API_KEY = "rak_your_api_key_here"

url = f"{BASE_URL}/api/v1/chat"
payload = {
    "text": "Szia! Hogyan segíthetek?",
    "session_id": "my-session-123",
    "mode": "rag"
}

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

#### TypeScript
```typescript
const BASE_URL = "https://<your-api-host>";
const API_KEY = "rak_your_api_key_here";

const response = await fetch(`${BASE_URL}/api/v1/chat`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    },
    body: JSON.stringify({
        text: "Szia! Hogyan segíthetek?",
        session_id: "my-session-123",
        mode: "rag"
    })
});
const result = await response.json();
console.log(result);
```

#### cURL
```bash
curl -X POST "$BASE_URL/api/v1/chat" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: rak_your_api_key_here" \
  -d '{
    "text": "Szia! Hogyan segíthetek?",
    "session_id": "my-session-123",
    "mode": "rag"
  }'
```

#### PHP
```php
<?php
$BASE_URL = "https://<your-api-host>";
$API_KEY = "rak_your_api_key_here";

$payload = json_encode([
    "text" => "Szia! Hogyan segíthetek?",
    "session_id" => "my-session-123",
    "mode" => "rag"
]);

$ch = curl_init($BASE_URL . "/api/v1/chat");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "X-API-Key: " . $API_KEY
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>
```

## Hitelesítési hiba (401)

Egyes kliensek vagy köztes rétegek **magyar** szöveget is megjeleníthetnek (pl. „Érvénytelen vagy lejárt API kulcs. Ellenőrizze az X-API-Key fejlécet.”) — ez ugyanarra a hibakörre utal, mint az alábbi **angol** `detail` üzenetek; a futó backend tipikusan JSON-ban ezeket adja vissza.

| `detail` (szerver) | Gyakori ok | Mit ellenőrizz |
|--------------------|------------|----------------|
| `API key is required` / `X-API-Key header is required` | Nincs kulcs, vagy üres a fejléc. | Minden kéréshez: `X-API-Key: rak_...` (lásd példák fent). |
| `Invalid API key format` | A kulcs nem `rak_` előtaggal kezdődik. | Az adminból generált kulcsot másold ki egyben; ne vágj le prefixet. |
| `Invalid API key` | Nincs ilyen kulcs az adatbázisban (elírás, rossz környezet, **rotate** után még a régi kulcs). | Admin → API Keys: friss kulcs az integrációban; jó tenant / jó szerver URL. |
| `API key is disabled` | A kulcs ki van kapcsolva. | **Enabled** vissza, vagy új kulcs. |
| `API key has expired` | A kulcs `expires_at` dátuma elmúlt. | Adminban hosszabbítás / új kulcs lejárat nélkül. |
| `API key does not have '<scope>' scope` | Hiányzik a kért jogosultság (pl. Facebook komment B2B: **`fb_comment`**). | A kulcs **Scopes** listájához add hozzá a szükséges scope-ot. |
| `X-API-Key or Bearer token required` | Adott végponton nincs sem kulcs, sem JWT (pl. egyes `/admin/fb/...` útvonalak). | Küldj `X-API-Key`-t megfelelő scope-pal, vagy érvényes Bearer JWT-t. |

**Gyakori véletlen:** szóköz vagy rejtett karakter a kulcs végén; kulcs **body**-ban küldése header helyett; **proxy** / API gateway eldobja vagy felülírja az `X-API-Key` fejlécet.

Facebook komment integráció (`fb_comment`) konkrét hibái: [26-flow-facebook-b2b-comments.md](./26-flow-facebook-b2b-comments.md).

## Tippek

- **API key tárolás**: Az API key-t biztonságosan tárolja a szerveren (pl. environment variable, secret manager). Ne tárolja a böngészőben vagy kliens oldalon.
- **X-API-Key header**: A chat B2B hívásnál (POST /api/v1/chat) mindig a **X-API-Key** headerben add meg a kulcsot; ne használj body `api_key` mezőt a chatnál.
- **Backend-to-backend**: Az API key hitelesítés szerver oldali használatra tervezett, nem böngészőből.
- **Tenant izoláció**: Minden API key egy adott tenant-hoz van kötve; a tenantet a backend a kulcsból oldja fel.

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
