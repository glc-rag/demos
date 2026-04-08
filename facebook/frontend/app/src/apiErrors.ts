/**
 * API hibaválaszok normalizálása (FastAPI: detail lehet string vagy validációs tömb).
 */

export function stringifyApiDetail(detail: unknown): string {
  if (detail === undefined || detail === null) {
    return '';
  }
  if (typeof detail === 'string') {
    return detail;
  }
  try {
    return JSON.stringify(detail);
  } catch {
    return String(detail);
  }
}

export function detailMentionsApiKeyAuth(detailStr: string): boolean {
  const d = detailStr.toLowerCase();
  return d.includes('api key') || d.includes('x-api-key');
}

/** Ha a szerver detail RAG / retrieve jellegű, fűzzünk hozzá rövid diagnosztikai tippet (backend / env). */
export function appendRetrievalDiagnosticHint(detailStr: string): string {
  const d = detailStr.toLowerCase();
  const looksLikeRetrieveFailure =
    d.includes('retrieval failed') ||
    (d.includes('retrieve') && (d.includes('fail') || d.includes('error'))) ||
    d.includes('document store');

  if (!looksLikeRetrieveFailure) {
    return detailStr;
  }

  const hint =
    '\n\n──\n' +
    '[Diagnózis • RAG / retrieve] A fenti szerver-üzenet gyakran retrieve vagy retrieve-products belső hibára utal (embedding, document store, index, környezeti config) — nem „rossz komment szöveg”.\n\n' +
    'Ellenőrzés: ugyanazzal a BASE_URL-lel, mint az admin — curl vagy Postman: POST …/admin/fb/profiles/{profile_id}/comments/retrieve, header X-API-Key, body {"query":"teszt"}. Ha így is 500 → backend / környezet; ha OK, a kliens URL / header / body eltérhet.\n\n' +
    'Érdemes összevetni dev és prod env-t (embedding, vektor DB / OpenSearch stb.). Biztos diagnózis: szerver log (exception + traceback) ugyanarra az időpontra.';

  return detailStr + hint;
}
