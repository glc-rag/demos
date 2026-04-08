# GLC-RAG INFO – Intelligens Tudáskezelő Rendszere

> **glc-rag.hu** – A modern mesterséges intelligencia alapú keresési és tudáskezelő megoldás

---

## 🎯 Rendszer Áttekintés

A **GLC-RAG INFO** egy haladó szintű, **Retrieval-Augmented Generation (RAG)** technológiára épülő alkalmazás, amely a mesterséges intelligencia (AI) és a nagy nyelvi modellek (LLM) erejét kombinálja a pontos, forrásra hivatkozó információkérés és tudáskezelés érdekében.

Ez a rendszer nem csupán egy chatbot – egy teljes körű **intelligens tudásplatform**, amely képes:
- **Dokumentumok indexelésére és kezelésére**
- **Kontextusértes keresésre** a saját tudásbázison
- **Widget integrációnak** weboldalakba
- **Biztonságos, skálázható API** szolgáltatásoknak

---

## 🚀 Miért Kiváló a GLC-RAG INFO?

### 🤖 Mesterséges Intelligencia Alapú Keresés

A hagyományos kulcsszó-alapú keresés helyett a GLC-RAG INFO **vektoros keresést** alkalmaz, amely:
- **Kontextust érthetővé teszi**: A rendszer nem csak kulcsszavakat keres, hanem a kérdés jelentését
- **Pontos válaszokat generál**: A válaszok közvetlenül a dokumentumok tartalmából származnak
- **Forrásra hivatkozik**: Minden válasz tartalmazza a forrásdokumentumokat, így ellenőrizhető és megbízható

### 📚 RAG (Retrieval-Augmented Generation) Technológia

A RAG technológia forradalmasítja az információkérést:
- **Retrieval (Keresés)**: A rendszer először keresi meg a releváns dokumentumokat a kérdés alapján
- **Augmented (Kiegészítés)**: A talált dokumentumok kontextust adnak a kérdéshez
- **Generation (Generálás)**: Az LLM (Large Language Model) a kontextus alapján generál pontos, forrásra hivatkozó válaszokat

### 🔐 Biztonság és Hitelesítés

A rendszer több rétegű biztonsági mechanizmusokkal rendelkezik:
- **JWT (JSON Web Token)** alapú hitelesítés adminisztrációs funkciókhoz
- **Public Widget Tokenek** nyilvános widgetek biztonságos futtatásához
- **API Key** támogatás programozott integrációkhoz
- **Rate Limiting** és kvótakezelés a visszaélések megelőzésére

---

## ✨ Fő Funkciók

### 1️⃣ Adminisztrációs Felület

Az adminisztrátori felülettel a felhasználók:

#### 📝 Info Elemek Kezelése (CRUD)
- **Létrehozás**: Új információelemek definiálása címmel, leírással, tartalommal és hatókörrel
- **Szerkesztés**: Meglévő elemek frissítése
- **Törlés**: Nem szükséges elemek eltávolítása
- **Aktiválás/Deaktiválás**: Elemek állapotának kezelése

#### 🔍 Indexelés és Polling
- Automatikus **indexelés** a dokumentumok feldolgozásához
- **Polling mechanizmus** az indexelési státusz monitoringjához
- **Reindexelés** lehetőség frissített tartalmakhoz

#### 👤 Felhasználókezelés
- **Regisztráció**: Új felhasználók létrehozása
- **Bejelentkezés**: JWT token alapú hitelesítés
- **Kijelentkezés**: Biztonságos munkamenet lezárás

### 2️⃣ Chat Funkciók

#### 💬 Internal Chat (Hitelesített Keresés)
A hitelesített felhasználók:
- Kérdezhetik a saját dokumentumtárujukat
- Kapnak **kontextusértes válaszokat** a saját információik alapján
- Láthatják a **forrásdokumentumokat** minden válaszhoz

#### 🎨 Widget Chat (Nyilvános Integráció)
A nyilvános widget tokenek lehetővé teszik:
- **Weboldal integrációt** anélkül, hogy adatokat kellene tárolni
- **Korlátozott hozzáférést** specifikus oldalakhoz vagy funkciókhoz
- **Rate limiting** beállításait a widget szintjén
- **Multi-origin támogatást** több weboldalhoz

### 3️⃣ Widget Konfiguráció

A widget konfigurációs felülettel:
- **Token létrehozása**: Új nyilvános widget tokenek generálása
- **Origin szűrés**: Meghatározás, mely weboldalak használhatják a tokent
- **Rate Limiting**: Kérések per perc (RPM), per óra (RPH) és kvóta (QPH) beállítás
- **Embed kód generálása**: Kész HTML snippet a widget beágyazásához

---

## 🛠️ Technológiai Stack

### Frontend
- **Vite**: Gyors fejlesztői szervert és build eszközt
- **TypeScript**: Statikus típusellenőrzés és jobb kódminőség
- **CSS3**: Natív Flexbox és Grid layoutok
- **Fetch API**: Modern HTTP kliens

### Backend (API)
- **GLC-RAG API**: RESTful API szolgáltatások
- **JWT Hitelesítés**: Biztonságos autentikáció
- **Rate Limiting**: Kérés korlátozás
- **CORS**: Cross-Origin Resource Sharing támogatás

### Dokumentáció
- **API Dokumentáció**: Teljes API leírás a `docs/API` mappában
- **Best Practices**: Ajánlott gyakorlatok és konvenciók
- **Production Readiness**: Üzemelésre készítés útmutató

---

## 📦 Telepítés és Használat

### 1. Függőségek Telepítése

```bash
npm install
```

### 2. Környezeti Változók Beállítása

Másold le a `.env.example` fájlt `.env` néven:

```bash
cp .env.example .env
```

### 3. API URL Beállítás

Állítsd be a `VITE_API_BASE_URL` változót:

```env
VITE_API_BASE_URL=https://glc-rag.hu
```

### 4. Fejlesztői Szerver Indítása

```bash
npm run dev
```

### 5. Éles Build

```bash
npm run build
```

---

## 🔧 Környezeti Változók

| Változó | Leírás |
|---------|--------|
| `VITE_API_BASE_URL` | A GLC-RAG API alap URL-je (alapértelmezett: `https://glc-rag.hu`) |
| `VITE_PUBLIC_WIDGET_TOKEN` | (Opcionális) Alapértelmezett widget token a Widget fülhöz |
| `DEV` | Fejlesztői mód (ha be van állítva, a proxyt használja) |

---

## 🌐 API Dokumentáció

A teljes API dokumentáció a `docs/API` mappában található:

- **00-attekinto.md**: Áttekintés
- **01-auth-jwt.md**: JWT hitelesítés
- **02-auth-widget-token.md**: Widget tokenek
- **03-auth-api-key.md**: API kulcsok
- **04-auth-register.md**: Regisztráció
- **10-chat-sync.md**: Chat szinkronizáció
- **11-chat-stream.md**: Streamelési chat
- **12-api-v1-chat.md**: API v1 chat
- **13-landing-chat-stream.md**: Landing chat stream
- **14-widget-config.md**: Widget konfiguráció
- **15-chat-transcribe.md**: Chat átirat
- **16-landing-pricing.md**: Árazás
- **17-tasks-api.md**: Feladat API
- **20-26 flow dokumentációk**: Különböző workflow-ok
- **30-hibak-es-limitek.md**: Hibák és limitok
- **42-47 RAG dokumentációk**: Dokumentum kezelés
- **50-52 bizalom és production**: Bizalom és üzemelésre készítés

---

## 🎯 UX Checklist

A rendszer teljesíti a modern felhasználói élmény követelményeit:

- ✅ **Dokumentum és eszköz**: `lang="hu"`, viewport meta, egyértelmű title/description
- ✅ **Visszajelzés**: Gombok letiltva betöltés alatt, szöveges visszajelzés
- ✅ **Üres állapotok**: Üzenet, ha a lista üres vagy nincs válasz
- ✅ **Hibaüzenetek**: Felhasználóbarát hálózati és API hibaüzenetek (401, 429, 4xx)
- ✅ **Akadálymentesség**: Label-ek, logikus tab sorrend, kontrasztos színek
- ✅ **Biztonság**: `textContent` használata az API válaszoknál XSS ellen
- ✅ **Segítség**: Rövid leírások a funkciókhoz

---

## 🔒 Biztonsági Megjegyzések

### Éles Környezet
- **HTTPS kötelező** a tokenek biztonságos továbbításához
- **Tokenek soha ne legyenek commitolva** a gitbe
- **Rate limiting** beállítása a visszaélések megelőzésére

### Proxy Konfiguráció
Fejlesztés során a `vite.config.ts` tartalmaz proxy beállítást a `/auth`, `/admin`, `/chat`, `/widget` utakra, hogy elkerülje a CORS hibákat.

---

## 📊 RAG Működési Elv

### 1. Dokumentum Indexelés
```
Dokumentum → Tokenizálás → Vektorizálás → Embedding → Index
```

### 2. Kérés Folyamat
```
Kérdés → Embedding → Vektor Keresés → Releváns Dokumentumok → Kontextus → LLM Generálás → Válasz
```

### 3. Forrás Hivatkozás
Minden válasz tartalmazza a használt dokumentumok azonosítóit, így a felhasználók ellenőrizhetik a válasz hitelességét.

---

## 🚀 Előnyök és Használati Területek

### 🏢 Vállalati Felhasználók
- **Tudásbázis kezelése**: Dokumentumok centralizált kezelése
- **Munkatársak támogatása**: Belépő felhasználók kérdezhetik a belső dokumentumokat
- **Biztonság**: JWT hitelesítés és korlátozott hozzáférés

### 🌐 Weboldal Integráció
- **Widget beágyazás**: Könnyen integrálható widgetek weboldalakba
- **Korlátozott hozzáférés**: Specifikus oldalakhoz vagy funkciókhoz
- **Rate limiting**: Kérés korlátozás widget szinten

### 🤖 Fejlesztők
- **API Key támogatás**: Programozott integrációkhoz
- **Dokumentáció**: Teljes API dokumentáció
- **Best practices**: Ajánlott gyakorlatok

---

## 📞 Kapcsolat

- **Weboldal**: [glc-rag.hu](https://glc-rag.hu)
- **API Dokumentáció**: `info/docs/API/` mappa
- **Support**: A rendszerben elérhető segítség szekció

---

## 📄 Licenc

Ez a projekt a GLC-RAG rendszer része. Minden jog fenntartva.

---

## 🙏 Köszönetnyilvánítás

Köszönjük a GLC-RAG csapatnak, hogy ezt a modern RAG technológiát fejlesztették, amely forradalmasítja az információkérést és a tudáskezelést!

---

**glc-rag.hu** – A jövő intelligens keresése már itt.
