# GLC-RAG demos

Ez a repository a GLC-RAG-hoz készült mintaanyagokat tartalmazza, modulonként rendezve.
A cél, hogy egy helyen legyenek a frontend és backend demo projektek, gyors áttekintéssel.

## API szolgáltatás — regisztráció

A **GLC-RAG API szolgáltatás** (minták futtatása, frontend az éles API-val) **regisztrációt igényel** a **[https://glc-rag.hu/](https://glc-rag.hu/)** oldalon. Először ott hozz létre fiókot (vagy kérj hozzáférést), utána kövesd a modul README-jét (token, környezeti változók). Külső fejlesztőknek ez a kötelező első lépés.

## Tartalom

| Könyvtár | Leírás |
|----------|--------|
| [INFO](./INFO/) | Info modul minták (API és frontend) |
| [facebook](./facebook/) | Facebook komment B2B frontend minta |

## Részletes bontás

### INFO

Az `INFO` könyvtár az info funkciókhoz tartalmaz mintákat:

- [INFO/python](./INFO/python/) - Python minta
- [INFO/php](./INFO/php/) - PHP minta
- [INFO/frontend](./INFO/frontend/) - Info frontend demo

Az `INFO` modul rövid leírása külön is megtalálható itt:
- [INFO/README.md](./INFO/README.md)

### Facebook

A `facebook` könyvtár jelenleg a Facebook kommentfolyam B2B frontend mintáját tartalmazza:

- [facebook/frontend](./facebook/frontend/) - Facebook frontend demo

## Használat

1. Nyisd meg a kívánt modul könyvtárát.
2. Kövesd az adott minta saját `README.md` leírását.
3. Frontend projektek esetén telepítsd a függőségeket és indítsd a fejlesztői szervert.

## Megjegyzés

A repository-ban csak forrásfájlok vannak; ideiglenes/build állományok (`node_modules`, `dist`, cache mappák) nincsenek feltöltve.
