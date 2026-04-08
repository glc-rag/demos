// Info admin modul: lista, get one, create, update, delete, reindex, pollIndexing

import { apiCall } from './api.js';

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

export { listInfo, getInfoById, createInfo, updateInfo, deleteInfo, reindexInfo, pollIndexing };
