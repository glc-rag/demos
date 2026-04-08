/**
 * Info Admin modul - INFO elemek CRUD kezelése
 */

import { apiCall, getBaseUrl } from './api';

/**
 * Info elem típus
 */
export interface InfoItem {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  content: string;
  scope: 'internal' | 'public';
  is_active: boolean;
  indexing_status: 'NOT_INDEXED' | 'PENDING' | 'PROCESSING' | 'INDEXED' | 'FAILED';
  created_at: string;
  updated_at: string;
  doc_id?: string;
}

/**
 * Info elemek listázása
 * @param limit - Limit (default: 100)
 * @param offset - Offset (default: 0)
 * @param scope - Scope szűrés (opcionális)
 * @param status - Status szűrés (opcionális)
 * @param search - Keresés (opcionális)
 * @returns Promise<InfoItem[]>
 */
export async function listInfo(limit = 100, offset = 0, scope?: string, status?: string, search?: string): Promise<InfoItem[]> {
  const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
  if (scope) params.append('scope', scope);
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const response = await apiCall(`/admin/info?${params}`, { method: 'GET' });
  if (!response.ok) {
    throw await parseError(response);
  }
  const data = await response.json();
  return data.items || [];
}

/**
 * Egy info elem lekérése
 * @param id - Info elem ID
 * @returns Promise<InfoItem | null>
 */
export async function getInfo(id: string): Promise<InfoItem | null> {
  const response = await apiCall(`/admin/info/${id}`, { method: 'GET' });
  if (!response.ok) {
    throw await parseError(response);
  }
  const data = await response.json();
  return data;
}

/**
 * Info elem létrehozása
 * @param title - Cím
 * @param content - Tartalom
 * @param description - Leírás (opcionális)
 * @param scope - Scope (default: internal)
 * @param is_active - Aktív (default: true)
 * @returns Promise<InfoItem>
 */
export async function createInfo(title: string, content: string, description?: string, scope: 'internal' | 'public' = 'internal', is_active = true): Promise<InfoItem> {
  const response = await apiCall('/admin/info', {
    method: 'POST',
    body: { title, description, content, scope, is_active },
    auth: true,
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  return await response.json();
}

/**
 * Info elem frissítése
 * @param id - Info elem ID
 * @param title - Cím (opcionális)
 * @param description - Leírás (opcionális)
 * @param content - Tartalom (opcionális)
 * @param scope - Scope (opcionális)
 * @param is_active - Aktív (opcionális)
 * @returns Promise<InfoItem>
 */
export async function updateInfo(id: string, title?: string, description?: string, content?: string, scope?: string, is_active?: boolean): Promise<InfoItem> {
  const response = await apiCall(`/admin/info/${id}`, {
    method: 'PUT',
    body: { title, description, content, scope, is_active },
    auth: true,
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  return await response.json();
}

/**
 * Info elem törlése
 * @param id - Info elem ID
 */
export async function deleteInfo(id: string): Promise<void> {
  const response = await apiCall(`/admin/info/${id}`, { method: 'DELETE', auth: true });
  if (!response.ok) {
    throw await parseError(response);
  }
}

/**
 * Indexelés kézi indítása
 * @param id - Info elem ID
 */
export async function reindexInfo(id: string): Promise<void> {
  const response = await apiCall(`/admin/info/${id}/index`, { method: 'POST', auth: true });
  if (!response.ok) {
    throw await parseError(response);
  }
}

/**
 * Indexelés állapota polling
 * @param id - Info elem ID
 * @param maxAttempts - Max próbálkozások (default: 20)
 * @param interval - Intervallum ms-ben (default: 3000)
 * @returns Promise<'INDEXED' | 'FAILED'>
 */
export async function pollIndexingStatus(id: string, maxAttempts = 20, interval = 3000): Promise<'INDEXED' | 'FAILED'> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const item = await getInfo(id);
    if (!item) {
      return 'FAILED';
    }

    const status = item.indexing_status;
    if (status === 'INDEXED') {
      return 'INDEXED';
    }
    if (status === 'FAILED') {
      return 'FAILED';
    }

    // Várakozás
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  // Ha a max próbálkozás eljutott, utoljára ellenőrizzük
  const item = await getInfo(id);
  return item?.indexing_status === 'INDEXED' ? 'INDEXED' : 'FAILED';
}

/**
 * Hiba parsolása
 */
export async function parseError(response: Response): Promise<Error> {
  if (response.status === 0) {
    return new Error('Nem elérhető a szerver');
  }

  if (response.status === 401) {
    return new Error('Érvénytelen vagy lejárt token');
  }

  if (response.status === 403) {
    return new Error('Nincs megfelelő jogosultság');
  }

  if (response.status >= 400) {
    try {
      const data = await response.json();
      const detail = data.detail || 'Ismeretlen hiba';
      return new Error(detail);
    } catch {
      return new Error('Hibás válasz formátum');
    }
  }

  return new Error('Ismeretlen hiba');
}