/**
 * API modul - GLC-RAG API hívások
 */

// Base URL lekérése environment változóból
export function getBaseUrl(): string {
  const baseUrl = (import.meta as any).env.VITE_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL environment változó nincs beállítva');
  }
  return baseUrl.trim().replace(/\/$/, '');
}

/**
 * API hívás wrapper
 * @param path - API útvonal (pl. '/auth/login', '/admin/fb/profiles')
 * @param options - Opcionális hívási opciók
 * @returns Promise<Response>
 */
export async function apiCall(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    auth?: boolean | AuthOptions;
    headers?: Record<string, string>;
  } = {}
): Promise<Response> {
  const { method = 'GET', body, auth = false, headers = {} } = options;
  const baseUrl = getBaseUrl();

  const fullUrl = `${baseUrl}${path}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Hitelesítés kezelése
  if (auth === true) {
    // JWT token használata (auth === true esetén)
    const jwtToken = getToken();
    if (jwtToken) {
      requestHeaders['Authorization'] = `Bearer ${jwtToken}`;
    }
  } else if (auth === false) {
    // Nincs hitelesítés
  } else if (typeof auth === 'object' && auth !== null && Object.keys(auth).length > 0) {
    // AuthOptions használata (nem üres objektum)
    if (auth.type === 'jwt' && auth.token) {
      requestHeaders['Authorization'] = `Bearer ${auth.token}`;
    } else if (auth.type === 'apikey' && auth.apiKey) {
      requestHeaders['X-API-Key'] = auth.apiKey;
    }
  } else if (typeof auth === 'object' && auth !== null) {
    // Üres AuthOptions objektum - próbáljuk meg automatikusan lekérni
    const autoAuth = getAuthOptions();
    if (autoAuth.type === 'jwt' && autoAuth.token) {
      requestHeaders['Authorization'] = `Bearer ${autoAuth.token}`;
    } else if (autoAuth.type === 'apikey' && autoAuth.apiKey) {
      requestHeaders['X-API-Key'] = autoAuth.apiKey;
    }
  }

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if ((import.meta as any).env?.DEV && !response.ok) {
      const logPrefix = `[API ${response.status}] ${method} ${fullUrl}`;
      response
        .clone()
        .text()
        .then((raw) => {
          try {
            console.warn(logPrefix, raw ? JSON.parse(raw) : '(üres törzs)');
          } catch {
            console.warn(logPrefix, raw || '(üres törzs)');
          }
        })
        .catch(() => console.warn(logPrefix, '(válasz törzs nem olvasható)'));
    }

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba';
    throw new ApiError('network', `Hálózati hiba: ${errorMessage}`);
  }
}

/**
 * Hiba parsolása
 * @param response - Fetch Response
 * @returns Error objektum vagy null
 */
async function parseError(response: Response): Promise<Error | null> {
  if (response.status === 0) {
    return new ApiError('network', 'Nem elérhető a szerver');
  }

  if (response.status === 401) {
    return new ApiError('unauthorized', 'Érvénytelen vagy lejárt token');
  }

  if (response.status === 403) {
    return new ApiError('forbidden', 'Nincs megfelelő jogosultság');
  }

  if (response.status === 409) {
    return new ApiError('conflict', 'Konfliktus történt');
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const message = retryAfter
      ? `Túl sok kérés – próbáld újra ${retryAfter} mp múlva.`
      : 'Túl sok kérés – próbáld újra később.';
    return new ApiError('rate_limit', message);
  }

  if (response.status >= 400) {
    const error = await parseErrorResponse(response);
    return error || null;
  }

  return null;
}

/**
 * Hibaüzenet parsolása JSON response-ból
 */
async function parseErrorResponse(response: Response): Promise<Error> {
  try {
    const data = await response.json();
    const detail = (data as any).detail || 'Ismeretlen hiba';
    return new ApiError('unknown', typeof detail === 'string' ? detail : 'Ismeretlen hiba');
  } catch {
    return new ApiError('unknown', 'Hibás válasz formátum');
  }
}

/**
 * API Error osztály
 */
export class ApiError extends Error {
  constructor(
    public readonly type: string,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Response wrapper típus
 */
export interface ResponseEnvelope {
  trace_id: string;
  mode: string;
  status_code: string;
  text: string;
  sources?: Array<{ doc_id: string; chunk_id: string; score: number }>;
  tool_proposal?: unknown;
  ux_hints?: unknown;
  blocked_reason?: string;
  products?: unknown[];
}

/**
 * JWT token lekérése sessionStorage-ból
 */
export function getToken(): string | null {
  return sessionStorage.getItem('glc_jwt');
}

/**
 * JWT token mentése sessionStorage-ba
 */
export function setToken(token: string): void {
  sessionStorage.setItem('glc_jwt', token);
}

/**
 * JWT token törlése sessionStorage-ból
 */
export function removeToken(): void {
  sessionStorage.removeItem('glc_jwt');
}

/**
 * Facebook B2B API kulcs: először localStorage, majd VITE_FB_COMMENT_API_KEY (.env).
 */
export function getApiKey(): string | null {
  const stored = localStorage.getItem('fb_comment_api_key');
  if (stored != null && stored.trim() !== '') {
    return stored.trim();
  }
  const fromEnv = (import.meta as any).env?.VITE_FB_COMMENT_API_KEY as string | undefined;
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.trim();
  }
  return null;
}

/**
 * Facebook B2B API kulcs mentése localStorage-ba
 * @param key API kulcs
 */
export function setApiKey(key: string): void {
  localStorage.setItem('fb_comment_api_key', key);
}

/**
 * Facebook B2B API kulcs törlése localStorage-ból
 */
export function removeApiKey(): void {
  localStorage.removeItem('fb_comment_api_key');
}

/**
 * API kulcs típusa: 'jwt' (JWT token) vagy 'apikey' (X-API-Key)
 */
export type AuthType = 'jwt' | 'apikey';

/**
 * Hitelesítési opciók
 */
export interface AuthOptions {
  type?: AuthType;
  token?: string;
  apiKey?: string;
}

/**
 * Hitelesítési opciók lekérése (JWT token vagy API kulcs)
 * @returns AuthOptions
 */
export function getAuthOptions(): AuthOptions {
  // Először próbáljuk meg JWT token-t használni
  const jwtToken = getToken();
  if (jwtToken) {
    return { type: 'jwt', token: jwtToken };
  }
  
  // Ha nincs JWT, próbáljuk meg API kulcsot
  const apiKey = getApiKey();
  if (apiKey) {
    return { type: 'apikey', apiKey: apiKey };
  }
  
  // Ha egyik sincs, üres objektumot adunk vissza (az apiCall kezeli)
  return {};
}