// Auth modul: register, login, logout, getToken, setToken

import { apiCall } from './api.js';

function getToken(): string | null {
    return sessionStorage.getItem('glc_jwt');
}

function setToken(token: string): void {
    sessionStorage.setItem('glc_jwt', token);
}

function removeToken(): void {
    sessionStorage.removeItem('glc_jwt');
}

async function register(
    username: string, 
    tenantId: string, 
    email: string, 
    password: string, 
    passwordConfirm: string, 
    acceptedTerms: boolean
): Promise<boolean> {
    await apiCall('/auth/register', {
        method: 'POST',
        body: { 
            username, 
            tenant_id: tenantId, 
            email, 
            password, 
            password_confirm: passwordConfirm,
            accepted_privacy_and_terms: acceptedTerms 
        },
    });
    return true;
}

async function login(tenantId: string, userId: string, password: string): Promise<string> {
    const response = await apiCall('/auth/login', {
        method: 'POST',
        body: { tenant_id: tenantId, user_id: userId, password },
    });
    
    const data = await response.json();
    const token = data.access_token;
    setToken(token);
    return token;
}

async function logout(): Promise<void> {
    removeToken();
}

export { getToken, setToken, removeToken, register, login, logout };
