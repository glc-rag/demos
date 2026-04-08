/**
 * Auth modul - Regisztráció, bejelentkezés, kijelentkezés
 */

import { apiCall } from './api';

export function getToken(): string | null {
  return sessionStorage.getItem('glc_jwt');
}

export function setToken(token: string): void {
  sessionStorage.setItem('glc_jwt', token);
}

export function removeToken(): void {
  sessionStorage.removeItem('glc_jwt');
}

/**
 * Regisztráció
 * @param email - Email cím
 * @param password - Jelszó
 * @returns Promise<boolean> - Sikeres vagy nem
 */
export async function register(email: string, password: string): Promise<boolean> {
  try {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: { email, password },
    });

    if (!response.ok) {
      const error = await parseError(response);
      throw error || new Error('Regisztráció sikertelen');
    }

    return true;
  } catch (error) {
    console.error('Regisztráció hiba:', error);
    throw error;
  }
}

/**
 * Bejelentkezés
 * @param userId - User ID
 * @param tenantId - Tenant ID
 * @param password - Jelszó
 * @returns Promise<string | null> - JWT token vagy null
 */
export async function login(userId: string, tenantId: string, password: string): Promise<string | null> {
  try {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: { userId, tenantId, password },
    });

    if (!response.ok) {
      const error = await parseError(response);
      throw error || new Error('Bejelentkezés sikertelen');
    }

    const data = await response.json();
    const token = data.access_token;

    if (token) {
      setToken(token);
    }

    return token;
  } catch (error) {
    console.error('Bejelentkezés hiba:', error);
    throw error;
  }
}

/**
 * Kijelentkezés
 */
export async function logout(): Promise<void> {
  removeToken();
}

/**
 * Hiba parsolása
 * @param response - Fetch Response
 * @returns Error objektum vagy null
 */
async function parseError(response: Response): Promise<Error | null> {
  if (response.status === 0) {
    return new Error('Nem elérhető a szerver');
  }

  if (response.status === 401) {
    return new Error('Érvénytelen vagy lejárt token');
  }

  if (response.status === 403) {
    return new Error('Nincs megfelelő jogosultság');
  }

  if (response.status === 409) {
    return new Error('Konfliktus történt');
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const message = retryAfter
      ? `Túl sok kérés – próbáld újra ${retryAfter} mp múlva.`
      : 'Túl sok kérés – próbáld újra később.';
    return new Error(message);
  }

  if (response.status >= 400) {
    try {
      const data = await response.json();
      const detail = (data as any).detail || 'Ismeretlen hiba';
      return new Error(typeof detail === 'string' ? detail : 'Ismeretlen hiba');
    } catch {
      return new Error('Hibás válasz formátum');
    }
  }

  return null;
}