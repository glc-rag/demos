// Kotelező exportok
function getBaseUrl(): string {
    const envUrl = (import.meta as any).env.VITE_API_BASE_URL;

    if ((import.meta as any).env.DEV) {
        if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
            return '';
        }
    }

    const baseUrl = envUrl || 'https://glc-rag.hu';
    return baseUrl.replace(/\/+$/, '');
}

function withStatusError(message: string, status: number): Error {
    const error = new Error(message);
    (error as any).status = status;
    return error;
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
        throw new Error('Nem sikerult elerni a szervert. Ellenorizd a kapcsolatot es a VITE_API_BASE_URL beallitast.');
    }

    if (!response.ok) {
        let detail = 'Hibas keres';
        try {
            const errorData = await response.json();
            detail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } catch (e) {
            detail = `Szerver hiba (${response.status})`;
        }

        if (response.status === 401) {
            if (options.auth) {
                sessionStorage.removeItem('glc_jwt');
                throw withStatusError('A munkamenet lejart vagy ervenytelen. Jelentkezz be ujra.', response.status);
            }
            throw withStatusError(detail || 'Ervenytelen widget token vagy hozzaferes megtagadva.', response.status);
        }

        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            throw withStatusError(`Tul sok keres${retryAfter ? `, probald ujra ${retryAfter} mp mulva` : ''}.`, response.status);
        }

        throw withStatusError(detail, response.status);
    }

    return response;
}

export { getBaseUrl, apiCall };
