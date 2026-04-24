# Info kérdőívek (publikus widget)

Ez a dokumentum az **Info modul kérdőív** funkcióját írja le: rövid űrlapok felajánlása a **publikus Info widget** chatben, beleegyezés után kitöltés, admin szerkesztés, valamint a **widget API** beküldési végpontja.

Kapcsolódó: [Info: chat /info és admin betöltés](./47-info-chat-and-admin) (info tartalom és `/info` parancs), [Publikus widget chat](./21-flow-public-widget), [Widget token admin](./52-admin-public-widget-tokens).

---

## Hol működik, hol nem?

| Környezet | Kérdőív modul |
|-----------|----------------|
| **Publikus widget** (`POST /widget/chat`, `channel: public`, widget token + `session_id`) | Igen, ha a tenantnál be van kapcsolva. |
| **Belső Info chat** (`channel: internal`, JWT) | **Nem** – a rendszer nem kínálja fel ezeket a kérdőíveket. |
| **Landing / egyéb nyilvános chat** | Nem része ennek a modulnak; csak a widgetes Info útvonal. |

A cél: a látogató a **widgetben** kapjon rövid „szeretné kitölteni?” kérdést, majd opcionálisan űrlapot (email, jelölőnégyzetek, szöveg stb.), miközben a válaszok és a beszélgetés másolata **emailben** is megérkezhet (admin + opcionálisan a felhasználó email mezője alapján).

---

## Admin: beállítások és szerkesztő

**Útvonal (UI):** Admin Dashboard → **MODULOK** → **Info.RAG** → **Info kérdőívek** (vagy a tenant menüben ennek megfelelő pont).

### Beállítások (lap teteje)

- **Kérdőívek engedélyezése a publikus Info chatben** – tenant szintű kapcsoló; kikapcsolva a katalógus nem kerül a modell elé, nem indul consent folyamat.
- **Értesítő e-mail felülírás (opcionális)** – ha kitöltöd, a beküldés utáni admin értesítő erre a címre megy; ha üres, a **TENANT_ADMIN** szerepkörű felhasználók kapják a másolatot.

Mentés: a felületen a **Beállítások mentése** gomb (PUT `/admin/survey/settings`).

### Szerkesztő fül: csoport → kérdőív → mezők

1. **Csoport** – belső cím, **felhasználói leírás** (ami a felületen / kontextusban megjelenhet), **LLM leírás (csak szerver)** – szabályok és példamondatok a fő Info modellnek (nem látja közvetlenül a látogató). A súgó és példák a felületen és a csoport dialógusban is elérhetők.
2. **Egy csoportban legfeljebb egy kérdőív** – további kérdőívhez új csoportot hozz létre.
3. **Kérdőív** – cím, aktív jelző, sorrend.
4. **Mezők** – típus: `email`, `boolean`, `checkbox`, `text`; címke, kötelező, sorrend; checkboxnál **opciók** vesszővel.

### Beküldések fül

A kitöltések listája: időpont, kérdőív azonosító, session, e-mail kiküldés jelzők. A sor melletti nyíllal kinyitható:

- **Kitöltés (kérdés – válasz)** – címkézett sorok;
- **Teljes chat** – ugyanabból a sessionből (max. üzenetszám a backend beállítása szerint).

Ha a kérdőív később törlődött, a nyers `answers_json` is megjelenhet.

---

## Felhasználói folyamat (widget)

1. A felhasználó a **publikus Info** módban beszélget a widgettel (`POST /widget/chat`).
2. Ha a rendszer és az LLM szerint érdemes, a válasz **`ux_hints`** részében **beleegyezés** jelenik meg (`survey_consent`): rövid kérdés, elfogadás / elutasítás gombok (a kliens `ui_action`: `info_survey_yes` / `info_survey_no`).
3. Elfogadás után a rendszer **kérdőív ajánlatot** ad (`survey_offer`): mezők, cím, opcionális szöveg; a widget **űrlapot** jelenít meg.
4. **Beküldés** után: `POST /widget/survey-submit` (lásd lent); session állapot frissül (kitöltött kérdőív ne ismétlődjön ugyanabban a sessionben).

---

## LLM és katalógus (röviden)

- A fő **publikus Info** rendszerüzenethez a backend a kérdőív-katalógust **JSON** formában hozzáfűzi (aktív csoportok / kérdőívek / mezők + csoport `llm_description`).
- Külön, rövid LLM hívások döntenek a **consent** szövegéről és a **survey_offer** (melyik kérdőív, teaser) tartalmáról – ezek endpointjai a tenant LLM konfigurációjában (`info_survey_consent`, `info_survey_offer`).

Részletes szabályok és példaszövegek: admin felület **„Segítség – LLM leírás (csak szerver)”** blokkja.

---

## Admin API (JWT)

Prefix: **`/admin/survey`** (ugyanaz a JWT / session, mint a többi admin végpont).

| Végpont | Method | Rövid leírás |
|---------|--------|--------------|
| `/admin/survey/settings` | GET, PUT | `info_surveys_enabled`, `survey_notification_email` |
| `/admin/survey/groups` | GET, POST | Csoportok listája / létrehozás |
| `/admin/survey/groups/{group_id}` | PUT, DELETE | Csoport szerkesztés / törlés |
| `/admin/survey/questionnaires` | POST | Új kérdőív (body: `group_id`, …) |
| `/admin/survey/questionnaires/{qid}` | PUT, DELETE | Kérdőív szerkesztés / törlés |
| `/admin/survey/questionnaires/{qid}/fields` | POST | Új mező |
| `/admin/survey/fields/{field_id}` | PUT, DELETE | Mező szerkesztés / törlés (query: `questionnaire_id`) |
| `/admin/survey/responses` | GET | Beküldések lista (query: `questionnaire_id`, `limit`, `offset`) – válaszban többek között `qa_rows`, `chat_transcript` |

**Szerepkör:** tipikusan **EDITOR**, **TENANT_ADMIN**, **SYSTEM_ADMIN** (a pontos szabály a backend `Role` ellenőrzésével egyezik meg).

### Példa: beállítások lekérése és mentése (Python)

```python
import requests

BASE = "https://<your-api-host>"
headers = {"Authorization": "Bearer <jwt>", "Content-Type": "application/json"}

r = requests.get(f"{BASE}/admin/survey/settings", headers=headers)
print("GET settings:", r.json())

r2 = requests.put(
    f"{BASE}/admin/survey/settings",
    headers=headers,
    json={
        "info_surveys_enabled": True,
        "survey_notification_email": None,  # vagy "admin@pelda.hu"
    },
)
print("PUT settings:", r2.json())
```

### Példa: csoport létrehozása (Python)

```python
body = {
    "title": "Kapcsolatfelvétel – részletes ár",
    "user_description": "Ha részletes ajánlatot szeretne, töltse ki az űrlapot.",
    "llm_description": "Ezt a kérdőívet akkor ajánld fel, ha… (részletes szabályok)",
    "is_active": True,
    "sort_order": 0,
}
r = requests.post(f"{BASE}/admin/survey/groups", headers=headers, json=body)
print("Group:", r.json())  # {"id": "..."}
```

A kérdőív és mezők további `POST`/`PUT` hívásai az OpenAPI (`/openapi.json`) **admin** szekciójában részletezettek.

---

## Widget: kérdőív beküldés (token, JWT nélkül)

**Endpoint:** `POST /widget/survey-submit`  
**Cél:** a böngészőben futó widget a **token_id** + **session_id** párossal küldi el a kitöltött válaszokat (ugyanaz a session, mint a chatnél).

**Request body (JSON):**

| Mező | Kötelező | Leírás |
|------|----------|--------|
| `token_id` | igen | Public widget token azonosító (adminban generált). |
| `session_id` | igen | Ugyanaz, mint a widget chat `POST /widget/chat` hívásoknál. |
| `questionnaire_id` | igen | A `survey_offer` válaszból kapott UUID. |
| `answers` | igen | Objektum: mező-id (string) → érték (szöveg, boolean, lista checkboxnál). |

**Sikeres válasz (példa):** `{ "success": true, "message": "…", "response_id": "<uuid>" }`  
**Hibák:** `400` (validáció), `401` (token), `403` (Origin nem engedélyezett).

### Példa (Python)

```python
import requests

BASE = "https://<your-api-host>"
payload = {
    "token_id": "<public_widget_token_id>",
    "session_id": "<ugyanaz_mint_a_chatnel>",
    "questionnaire_id": "<questionnaire_uuid>",
    "answers": {
        "mezo-email-id": "vendeg@pelda.hu",
        "mezo-boolean-id": True,
        "mezo-szoveg-id": "Rövid üzenet",
    },
}
headers = {"Content-Type": "application/json", "Origin": "https://allowed-origin.example"}  # a tokenhez tartozó engedélyezett origin
r = requests.post(f"{BASE}/widget/survey-submit", json=payload, headers=headers)
print(r.status_code, r.json())
```

**Megjegyzés:** a szerver **Origin** / **Referer** ellenőrzést végezhet a token `allowed_origins` beállítása szerint – fejlesztői tesztnél egyezzen a widget oldal domainje a token konfigurációjával.

### Példa (cURL)

```bash
curl -sS -X POST "$BASE_URL/widget/survey-submit" \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-allowed-origin.example" \
  -d '{
    "token_id": "<token_id>",
    "session_id": "<session_id>",
    "questionnaire_id": "<questionnaire_id>",
    "answers": { "<field_id>": "válasz szöveg" }
  }'
```

---

## E-mail értesítések (összefoglaló)

Ha az SMTP be van állítva a környezetben:

- **Admin(ek)** – tenant TENANT_ADMIN címekre (vagy a felülírt értesítő címre) megy a kitöltés összefoglalója és a chat másolata.
- **Felhasználó** – ha van **email** típusú mező és kitöltötték, opcionális másolat megy a megadott címre (márkázott levél, összefoglaló + chat).

Részletek és fejléc-formátum a backend `send_branded_multipart_email` és a regisztrációs levelekhez igazított sablon szerint.

---

## Gyakori kérdések

- **Miért nem jelenik meg a widgetben?** – Kapcsoló ki; nincs aktív csoport + kérdőív + mező; a session már jelezte a kitöltést; az LLM nem kért consentet.
- **Hol szerkeszthető a szöveg, amit az AI lát?** – Csoport **LLM leírás (csak szerver)** mezője + súgó példák.
- **Hol látom a beküldött válaszokat?** – Admin **Beküldések** fül, vagy GET `/admin/survey/responses`.

---

## További információ

- OpenAPI / Redoc: [openapi.json](/openapi.json), [redoc](/redoc) – `/admin/survey/*`, `/widget/survey-submit`
- Widget chat: [12-api-v1-chat](./12-api-v1-chat) (koncepció), [21-flow-public-widget](./21-flow-public-widget) (folyamat)
- Dokumentációs konvenciók: [39-documentation-conventions](./39-documentation-conventions)
