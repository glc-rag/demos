// Info admin modul: lista, get one, create, update, delete, reindex, pollIndexing

import { apiCall } from './api.js';

type CrawlStatus = 'RUNNING' | 'DONE' | 'FAILED' | 'CANCELLED';

interface StartWebCrawlPayload {
    url?: string;
    urls?: string[];
    depth: number;
    max_pages: number;
    scope: 'internal' | 'public';
}

interface WebCrawlJobResponse {
    job?: {
        status?: CrawlStatus | string;
        stats?: Record<string, any>;
    };
    status?: CrawlStatus | string;
    stats?: Record<string, any>;
    events?: Array<Record<string, any>>;
}

async function apiCallWithFallback(
    primaryPath: string,
    fallbackPath: string,
    options: {
        method?: string;
        body?: unknown;
        auth?: boolean;
        headers?: Record<string, string>;
    }
): Promise<Response> {
    try {
        return await apiCall(primaryPath, options);
    } catch (err: any) {
        if (err?.status === 404 || (typeof err?.message === 'string' && err.message.includes('(404)'))) {
            return apiCall(fallbackPath, options);
        }
        throw err;
    }
}

async function listInfo(limit: number = 50): Promise<any> {
    const response = await apiCall(`/admin/info?limit=${limit}`, { auth: true });
    return response.json();
}

async function getInfoById(id: string): Promise<any> {
    const response = await apiCall(`/admin/info/${id}`, { auth: true });
    return response.json();
}

async function createInfo(title: string, description: string, content: string, scope: string, isActive: boolean): Promise<any> {
    const response = await apiCall('/admin/info', {
        method: 'POST',
        auth: true,
        body: { title, description, content, scope, is_active: isActive },
    });
    return response.json();
}

async function updateInfo(id: string, title: string, description: string, content: string, scope: string, isActive: boolean): Promise<boolean> {
    await apiCall(`/admin/info/${id}`, {
        method: 'PUT',
        auth: true,
        body: { title, description, content, scope, is_active: isActive },
    });
    return true;
}

async function deleteInfo(id: string): Promise<boolean> {
    await apiCall(`/admin/info/${id}`, {
        method: 'DELETE',
        auth: true,
    });
    return true;
}

async function reindexInfo(id: string): Promise<boolean> {
    await apiCall(`/admin/info/${id}/index`, {
        method: 'POST',
        auth: true,
    });
    return true;
}

async function pollIndexing(id: string, maxAttempts: number = 20, intervalMs: number = 3000): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
        const info = await getInfoById(id);
        if (info.indexing_status === 'INDEXED') {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    return false;
}

async function startInfoWebCrawl(payload: StartWebCrawlPayload): Promise<{ job_id: string; message?: string }> {
    const response = await apiCallWithFallback('/api/admin/info/from-url/', '/admin/info/from-url/', {
        method: 'POST',
        auth: true,
        body: payload,
    });
    return response.json();
}

async function getInfoWebCrawlJob(jobId: string): Promise<WebCrawlJobResponse> {
    const response = await apiCallWithFallback(
        `/api/admin/info/from-url/${jobId}/`,
        `/admin/info/from-url/${jobId}/`,
        {
        method: 'GET',
        auth: true,
        }
    );
    return response.json();
}

async function cancelInfoWebCrawl(jobId: string): Promise<{ cancelled?: boolean; message?: string }> {
    const response = await apiCallWithFallback(
        `/api/admin/web-crawl/${jobId}/cancel`,
        `/admin/web-crawl/${jobId}/cancel`,
        {
        method: 'POST',
        auth: true,
        }
    );
    return response.json();
}

export {
    listInfo,
    getInfoById,
    createInfo,
    updateInfo,
    deleteInfo,
    reindexInfo,
    pollIndexing,
    startInfoWebCrawl,
    getInfoWebCrawlJob,
    cancelInfoWebCrawl,
};
