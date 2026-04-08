// Kötelező exportok (szignatúra jellegű leírás)
function getBaseUrl(): string {
    // Ha dev módban vagyunk, a proxy-t használjuk relatív utakkal, 
    // kivéve ha a VITE_API_BASE_URL kifejezetten egy külső URL-re mutat.
    const envUrl = (import.meta as any).env.VITE_API_BASE_URL;
    
    if ((import.meta as any).env.DEV) {
        // Ha dev módban nincs megadva URL, vagy localhost-ra mutat, maradjunk relatívon a proxy miatt
        if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
            return '';
        }
    }
    
    const baseUrl = envUrl || 'https://glc-rag.hu';
    return baseUrl.replace(/\/+$/, '');
}

async function apiCall(
    path: string,
    options: {
        method?: string;
        body?: unknown;
        auth?: boolean;
        headers?: Record<string, string>;
    }
): Promise<Response> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${path}`;
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (options.auth) {
        const token = sessionStorage.getItem('glc_jwt');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    let response: Response;
    try {
        response = await fetch(url, {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
    } catch (err) {
        throw new Error('Nem sikerült elérni a szervert – ellenőrizd a kapcsolatot és a VITE_API_BASE_URL beállítást.');
    }
    
    if (!response.ok) {
        let detail = 'Hibás kérés';
        try {
            const errorData = await response.json();
            detail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } catch (e) {
            // Nem JSON hiba
            detail = `Szerver hiba (${response.status})`;
        }

        if (response.status === 401) {
            if (options.auth) {
                sessionStorage.removeItem('glc_jwt');
                throw new Error('A munkamenet lejárt vagy érvénytelen – jelentkezz be újra.');
            } else {
                throw new Error(detail || 'Érvénytelen widget token vagy hozzáférés megtagadva.');
            }
        }
        
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            throw new Error(`Túl sok kérés${retryAfter ? ` – próbáld újra ${retryAfter} mp múlva` : ''}.`);
        }

        throw new Error(detail);
    }
    
    return response;
}

export { getBaseUrl, apiCall };
