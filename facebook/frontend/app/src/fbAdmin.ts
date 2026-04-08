/**
 * Facebook Admin modul - Facebook profilok és kommentek kezelése
 */

import { apiCall, getAuthOptions, getApiKey, AuthOptions } from './api';
import {
  appendRetrievalDiagnosticHint,
  detailMentionsApiKeyAuth,
  stringifyApiDetail,
} from './apiErrors';

/**
 * Facebook Profil típus
 */
export interface FacebookProfile {
  id: string;
  fb_page_id: string;
  name: string;
  enabled: boolean;
  reply_mode: 'auto' | 'manual';
  created_at: string;
  updated_at: string;
}

/**
 * Facebook Komment típus
 */
export interface FacebookComment {
  id: string;
  fb_comment_id: string;
  fb_post_id: string;
  original_message: string;
  our_reply?: string;
  status: 'pending_approval' | 'posted' | 'failed_manual' | string;
  processed_at?: string;
}

/**
 * Profilok listázása
 * @param apiKey - Opcionális API kulcs (fb_comment scope)
 * @returns Promise<FacebookProfile[]>
 */
export async function listProfiles(apiKey?: string): Promise<FacebookProfile[]> {
  const auth = apiKey ? ({ type: 'apikey' as const, apiKey } as AuthOptions) : getAuthOptions();
  const response = await apiCall('/admin/fb/profiles', { method: 'GET', auth: auth });
  if (!response.ok) {
    throw await parseError(response);
  }
  const data = await response.json();
  // A válasz lehet { profiles: [...] } vagy { items: [...] } vagy közvetlenül tömb
  return data.profiles || data.items || data || [];
}

/**
 * Egy profil lekérése
 * @param id - Profil ID
 * @param apiKey - Opcionális API kulcs (fb_comment scope)
 * @returns Promise<FacebookProfile | null>
 */
export async function getProfile(id: string, apiKey?: string): Promise<FacebookProfile | null> {
  const auth = apiKey ? ({ type: 'apikey' as const, apiKey } as AuthOptions) : getAuthOptions();
  const response = await apiCall(`/admin/fb/profiles/${id}`, { method: 'GET', auth: auth });
  if (!response.ok) {
    throw await parseError(response);
  }
  const data = await response.json();
  return data;
}

/**
 * Profil létrehozása
 * @param fbPageId - Facebook Page ID
 * @param name - Profil név
 * @param enabled - Aktív (default: true)
 * @param apiKey - Opcionális API kulcs (fb_comment scope)
 * @returns Promise<FacebookProfile>
 */
export async function createProfile(
  fbPageId: string,
  name: string,
  enabled = true,
  apiKey?: string
): Promise<FacebookProfile> {
  const auth = apiKey ? ({ type: 'apikey' as const, apiKey } as AuthOptions) : getAuthOptions();
  const response = await apiCall('/admin/fb/profiles', {
    method: 'POST',
    body: { fb_page_id: fbPageId, name, enabled },
    auth: auth,
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  return await response.json();
}

/**
 * Profil frissítése
 * @param id - Profil ID
 * @param fbPageId - Facebook Page ID (opcionális)
 * @param name - Név (opcionális)
 * @param enabled - Aktív (opcionális)
 * @param replyMode - Válasz mód (opcionális)
 * @param apiKey - Opcionális API kulcs (fb_comment scope)
 * @returns Promise<FacebookProfile>
 */
export async function updateProfile(
  id: string,
  fbPageId?: string,
  name?: string,
  enabled?: boolean,
  replyMode?: 'auto' | 'manual',
  apiKey?: string
): Promise<FacebookProfile> {
  const auth = apiKey ? ({ type: 'apikey' as const, apiKey } as AuthOptions) : getAuthOptions();
  const response = await apiCall(`/admin/fb/profiles/${id}`, {
    method: 'PUT',
    body: { fb_page_id: fbPageId, name, enabled, reply_mode: replyMode },
    auth: auth,
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  return await response.json();
}

/**
 * Profil törlése
 * @param id - Profil ID
 * @param apiKey - Opcionális API kulcs (fb_comment scope)
 */
export async function deleteProfile(id: string, apiKey?: string): Promise<void> {
  const auth = apiKey ? ({ type: 'apikey' as const, apiKey } as AuthOptions) : getAuthOptions();
  const response = await apiCall(`/admin/fb/profiles/${id}`, { method: 'DELETE', auth: auth });
  if (!response.ok) {
    throw await parseError(response);
  }
}

/**
 * Kommentek listázása
 * @param profileId - Profil ID
 * @param page - Lap száma (default: 1)
 * @param pageSize - Lap méret (default: 20)
 * @param status - Státusz szűrés (opcionális)
 * @param search - Keresés (opcionális)
 * @param apiKey - Opcionális API kulcs (fb_comment scope)
 * @returns Promise<FacebookComment[]>
 */
export async function listComments(
  profileId: string,
  page = 1,
  pageSize = 20,
  status?: string,
  search?: string,
  apiKey?: string
): Promise<FacebookComment[]> {
  const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const auth = apiKey ? ({ type: 'apikey' as const, apiKey } as AuthOptions) : getAuthOptions();
  const response = await apiCall(`/admin/fb/profiles/${profileId}/comments?${params}`, {
    method: 'GET',
    auth: auth,
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  const data = await response.json();
  // A válasz lehet { comments: [...] } vagy { items: [...] } vagy közvetlenül tömb
  return data.comments || data.items || data || [];
}

/**
 * Válasz küldése Facebookra
 * @param profileId - Profil ID
 * @param commentId - Komment ID
 * @param reply - Válasz szöveg (opcionális)
 * @param apiKey - Opcionális API kulcs (fb_comment scope)
 * @returns Promise<void>
 */
export async function sendReply(
  profileId: string,
  commentId: string,
  reply?: string,
  apiKey?: string
): Promise<void> {
  const auth = apiKey ? ({ type: 'apikey' as const, apiKey } as AuthOptions) : getAuthOptions();
  const response = await apiCall(`/admin/fb/profiles/${profileId}/comments/${commentId}/send`, {
    method: 'POST',
    body: reply ? { our_reply: reply } : undefined,
    auth: auth,
  });
  if (!response.ok) {
    throw await parseError(response);
  }
}

/**
 * Hiba parsolása
 */
async function parseError(response: Response): Promise<Error> {
  if (response.status === 0) {
    return new Error('Nem elérhető a szerver');
  }

  if (response.status === 401) {
    try {
      const data = await response.json();
      const detailStr = stringifyApiDetail((data as any).detail);
      if (detailMentionsApiKeyAuth(detailStr)) {
        return new Error('Érvénytelen vagy lejárt API kulcs. Ellenőrizze az X-API-Key fejlécet.');
      }
    } catch {
      // JSON parsolás sikertelen
    }
    return new Error('Érvénytelen vagy lejárt hitelesítő adat');
  }

  if (response.status === 403) {
    return new Error('Nincs megfelelő jogosultság');
  }

  if (response.status >= 400) {
    try {
      const data = await response.json();
      const detailStr = stringifyApiDetail((data as any).detail) || 'Ismeretlen hiba';
      return new Error(appendRetrievalDiagnosticHint(detailStr));
    } catch {
      return new Error('Hibás válasz formátum');
    }
  }

  return new Error('Ismeretlen hiba');
}
