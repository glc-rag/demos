# Felhasználó regisztráció (POST /auth/register)

Ez a dokumentum az **új tenant admin** nyilvános regisztrációját mutatja be. A végpont **nem** igényel JWT-t; IP alapú rate limit vonatkozik rá (mint más publikus auth végpontokra).

**Teljes útvonal:** `POST /auth/register` (a router prefixe `/auth`, tehát a gyökérben **nincs** külön `/register` – csak `/auth/register`).

**OpenAPI:** tag **Auth** (openapi.json / Redoc).

## Folyamat röviden

1. **POST /auth/register** – felhasználónév, új **tenant_id**, email, jelszó + ÁSZF/adatvédelem elfogadás.
2. A szerver emailt küld megerősítő linkkel (a link a **FRONTEND_URL** beállítástól függ, pl. `{FRONTEND_URL}/auth/confirm-email?token=...`).
3. **GET /auth/confirm-email?token=...** (vagy POST ugyanezzel a query parammal) – fiók aktiválása.
4. **POST /auth/login** – bejelentkezés: a body **`user_id`** mezője itt a regisztrációkor megadott **felhasználónév** (`username`), plusz `tenant_id` és `password`. Részletek: [01-auth-jwt.md](01-auth-jwt.md), [23-flow-login-then-chat.md](23-flow-login-then-chat.md).

Amíg az email nincs megerősítve, a login **403**-at ad: *„A fiókod még nincs aktiválva…”*.

## Szerepkör és tenant

- A regisztráció egyetlen felhasználót hoz létre **TENANT_ADMIN** szerepkörrel.
- A **tenant_id** egy új, még nem használt azonosító kell legyen (a rendszer ellenőrzi, hogy ne legyen már user ugyanazzal a tenanttal).
- A **felhasználónév** (`username`) a későbbi login **`user_id`** mezője; egy tenanton belül egyedinek kell lennie.

## POST /auth/register – kérés

**HTTP 201** sikeres regisztráció esetén.

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| `username` | string | Igen | Felhasználónév (login: `user_id`) |
| `tenant_id` | string | Igen | Új tenant azonosító: 3–50 karakter, csak `a-z`, `0-9`, `_`, `-` (kisre normalizálódik) |
| `email` | string | Igen | Érvényes email |
| `password` | string | Igen | Min. 8 karakter, legalább 1 speciális karakter (`!@#$%` …) |
| `password_confirm` | string | Igen | Meg kell egyeznie a `password` mezővel |
| `accepted_privacy_and_terms` | bool | Igen | **`true`** kell legyen, különben 400 |

**Sikeres válasz (201):**

```json
{
  "message": "Regisztráció sikeres. A megadott emailben megkaptad a megerősítő linket."
}
```

**Gyakori hibák:**

| HTTP | Példa |
|------|--------|
| 400 | Hiányzó/hibás mezők, jelszó nem egyezik, ÁSZF nincs elfogadva |
| 409 | Tenant azonosító foglalt, felhasználónév foglalt a tenantban, email már használatban a tenantban |
| 429 | Túl sok kérés (Retry-After header) |

## Példa – regisztráció

### Python

```python
import requests

BASE_URL = "https://<your-api-host>"
url = f"{BASE_URL}/auth/register"
payload = {
    "username": "admin_janos",
    "tenant_id": "acme-corp",
    "email": "janos@example.com",
    "password": "S3cret!pass",
    "password_confirm": "S3cret!pass",
    "accepted_privacy_and_terms": True,
}

response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
print(response.status_code, response.json())
```

### TypeScript

```typescript
const BASE_URL = "https://<your-api-host>";

const response = await fetch(`${BASE_URL}/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "admin_janos",
    tenant_id: "acme-corp",
    email: "janos@example.com",
    password: "S3cret!pass",
    password_confirm: "S3cret!pass",
    accepted_privacy_and_terms: true,
  }),
});
console.log(response.status, await response.json());
```

### cURL

```bash
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_janos",
    "tenant_id": "acme-corp",
    "email": "janos@example.com",
    "password": "S3cret!pass",
    "password_confirm": "S3cret!pass",
    "accepted_privacy_and_terms": true
  }'
```

### PHP

```php
<?php
$BASE_URL = "https://<your-api-host>";
$payload = json_encode([
    "username" => "admin_janos",
    "tenant_id" => "acme-corp",
    "email" => "janos@example.com",
    "password" => "S3cret!pass",
    "password_confirm" => "S3cret!pass",
    "accepted_privacy_and_terms" => true,
]);

$ch = curl_init($BASE_URL . "/auth/register");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);

$response = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo $code . " " . $response . "\n";
?>
```

## Email megerősítés

- A megerősítő token **24 óráig** érvényes.
- **GET** (böngésző, az emailben lévő link): `GET /auth/confirm-email?token=<token>`  
  Böngészőből gyakran **HTML** oldal érkezik; **curl** / script alapértelmezett fejléccel általában **JSON** válasz.
- **POST:** `POST /auth/confirm-email?token=<token>` (token query paraméterben).

Sikeres aktiválás – példa válasz (JSON):

```json
{ "message": "Aktiválva. Most bejelentkezhetsz." }
```

### cURL – megerősítés

```bash
curl -X GET "$BASE_URL/auth/confirm-email?token=<token-from-email>"
```

## Megerősítő email újraküldése

**POST /auth/resend-confirmation** – body:

| Mező | Kötelező | Leírás |
|------|----------|--------|
| `email` | Ajánlott | Regisztrált email |
| `tenant_id` | Nem | Ha megadod, pontosabb egyezés; ha kihagyod, a backend megpróbálja email alapján (bármely tenant) |

A válasz **mindig** ugyanaz (biztonság): nem árulja el, létezik-e a fiók.

```json
{
  "message": "Ha a megadott címen van még nem aktivált fiók, új megerősítő emailt küldtünk."
}
```

### cURL

```bash
curl -X POST "$BASE_URL/auth/resend-confirmation" \
  -H "Content-Type: application/json" \
  -d '{"email":"janos@example.com","tenant_id":"acme-corp"}'
```

## Bejelentkezés regisztráció után

A login body **`user_id`** = regisztráció **`username`**, **`tenant_id`** = regisztráció **`tenant_id`** (mindkettő kisbetűsített tenant esetén a szerver által tárolt formátumban).

```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"admin_janos","tenant_id":"acme-corp","password":"S3cret!pass"}'
```

---

## Tippek

- **SMTP / email:** Ha az email nem érkezik meg, ellenőrizd a szerver SMTP beállításait és a spam mappát. **FRONTEND_URL** hiányában a megerősítő link hibás lehet.
- **Tenant azonosító:** Válassz egyedi, stabil azonosítót (pl. cégnév rövidítése); ez később is azonosítja a tenantot a loginban.
- **Regisztrációs ajándék:** Ha a környezetben be van kapcsolva, sikeres regisztráció után jóváírás történhet – részletek a szerver konfigurációban (`ajandek_kredit`).

## További információ

- JWT és védett API hívások: [01-auth-jwt.md](01-auth-jwt.md)
- Bejelentkezés → chat folyamat: [23-flow-login-then-chat.md](23-flow-login-then-chat.md)
- Hibák, rate limit: [30-hibak-es-limitek.md](30-hibak-es-limitek.md)
- **API dokumentációk**: <a href="/docs">docs</a> (Swagger UI), <a href="/redoc">redoc</a> (Redoc), <a href="/openapi.json">openapi.json</a> (JSON API).
