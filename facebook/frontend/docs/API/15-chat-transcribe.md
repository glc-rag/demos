# Hangfelvétel transzkripciója

Ez a dokumentum a hangfelvétel transzkripcióját mutatja be a POST /chat/transcribe endpointtel.

## Leírás

A POST /chat/transcribe endpoint Speech-to-Text (Whisper API) szolgáltatást nyújt. A hangfájlt feltöltve a rendszer transzkripciót végez, és a szöveget a chat input mezőbe helyezi (nem küldi automatikusan).

**Fontos:** Ez az endpoint JWT hitelesítést igényel.

## Request

### Endpoint

```
POST /chat/transcribe
```

### Request body (Form data)

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| **audio** | File | Igen | Hangfájl (max. 25 MB). Támogatott formátumok: mp3, wav, m4a, webm, opus. |
| **duration_seconds** | float | Nem | Opcionális: a hangfájl hossza másodpercben. Ha nincs megadva, a rendszer becsüli a fájlméret alapján (~1 KB/sec webm opus beszéd). |

### Headers

| Header | Érték | Leírás |
|--------|-------|--------|
| **Authorization** | Bearer &lt;token&gt; | JWT token hitelesítés. |
| **Content-Type** | multipart/form-data | Form data request. |

## Válasz struktúra

Az endpoint JSON formátumban adja vissza a transzkripció eredményét:

```json
{
  "text": "Ez egy transzkribált szöveg...",
  "duration_seconds": 10.5,
  "virtual_tokens": 1050
}
```

### Mezők

| Mező | Típus | Leírás |
|------|-------|--------|
| **text** | string | A transzkribált szöveg. |
| **duration_seconds** | float | A hangfájl hossza másodpercben. |
| **virtual_tokens** | number | A transzkripció költsége (virtuális tokenek, számlázáshoz). |

## Példa

### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/chat/transcribe"

# Hangfájl feltöltése
with open("audio.mp3", "rb") as audio_file:
    files = {"audio": ("audio.mp3", audio_file, "audio/mp3")}
    data = {"duration_seconds": 10.5}  # Opcionális

headers = {
    "Authorization": "Bearer <token>",
}

response = requests.post(url, files=files, data=data, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";
const url = `${BASE_URL}/chat/transcribe`;
const token = "<token>";

// Böngészőben: formData.append("audio", fileInput.files[0]);
const formData = new FormData();
formData.append("audio", audioFile);  // File objektum (input.files[0] vagy new File())
formData.append("duration_seconds", "10.5");  // Opcionális

const response = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
});
const result = await response.json();
console.log("Status:", response.status);
console.log("Response:", result);
```

### cURL

```bash
curl -X POST "$BASE_URL/chat/transcribe" \
  -H "Authorization: Bearer <token>" \
  -F "audio=@audio.mp3" \
  -F "duration_seconds=10.5"
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$url = $BASE_URL . "/chat/transcribe";
$token = "<token>";
$audioPath = "audio.mp3";

$cfile = new CURLFile($audioPath, "audio/mpeg", "audio.mp3");
$postFields = [
    "audio" => $cfile,
    "duration_seconds" => "10.5"
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
echo "Response: " . json_encode(json_decode($response, true), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
?>
```

---

## Tippek

- **JWT hitelesítés**: Ez az endpoint JWT hitelesítést igényel. A token-t a bejelentkezés után kell lekérni.
- **Fájlméret**: A hangfájl maximum 25 MB lehet.
- **Támogatott formátumok**: mp3, wav, m4a, webm, opus.
- **Duration**: A duration_seconds opcionális. Ha nincs megadva, a rendszer becsüli a fájlméret alapján.
- **Egyenleg**: A transzkripció költséges, ellenőrizze az egyenlegét!

---

## Hibák

### 400 Bad Request

- Üres hangfájl
- Túl nagy fájl (max. 25 MB)
- Érvénytelen fájlformátum

### 401 Unauthorized

- Hiányzó vagy érvénytelen JWT token

### 402 Payment Required

- Az egyenleg kimerült

---

## További információ

### API dokumentációk

- <a href="/docs">docs</a> – Swagger UI. Interaktív API dokumentáció: endpointok böngészése, kérések kipróbálása a böngészőből. Mire való: chat, streaming, hitelesítés, RAG és admin API gyors tesztelése.
- <a href="/redoc">redoc</a> – Redoc. Olvasható, struktúrált API leírás request/response sémákkal. Mire való: endpointok és adatmodellek áttekintése, integráció tervezése.
- <a href="/openapi.json">openapi.json</a> – JSON API (OpenAPI 3.0 specifikáció). Géppel feldolgozható séma: endpointok, paraméterek, sémák. Mire való: kliensgenerálás, automatizált tesztek, dokumentáció- és integrációs eszközök.
