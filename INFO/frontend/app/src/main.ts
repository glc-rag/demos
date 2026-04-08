// Fő entry point - tab váltás, init, GET /widget/config induláskor

import { getBaseUrl, apiCall } from './api.js';
import { getToken, register, login, logout } from './auth.js';
import { listInfo, getInfoById, createInfo, updateInfo, deleteInfo, reindexInfo, pollIndexing } from './infoAdmin.js';
import { sendInfoQuestion as sendInternal } from './chatInternal.js';
import { sendInfoQuestion as sendWidget } from './chatWidget.js';

// --- ÁLLAPOT ---
let currentInfoId: string | null = null;

// --- DOM ELEMEK ---
const authView = document.getElementById('auth-view')!;
const appView = document.getElementById('app-view')!;
const loginContainer = document.getElementById('login-container')!;
const registerContainer = document.getElementById('register-container')!;
const showRegisterBtn = document.getElementById('show-register')!;
const showLoginBtn = document.getElementById('show-login')!;

const tabButtons = document.querySelectorAll('#tab-bar button');
const panels = document.querySelectorAll('.tab-panel');
const apiBaseUrlValue = document.getElementById('api-base-url-value')!;
const widgetConfigDebug = document.getElementById('widget-config-debug')!;
const globalError = document.getElementById('global-error')!;
const authError = document.getElementById('auth-error')!;

const displayUserId = document.getElementById('display-user-id')!;
const displayTenantId = document.getElementById('display-tenant-id')!;

// Auth forms
const registerForm = document.getElementById('register-form') as HTMLFormElement;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

// Info
const infoListBody = document.getElementById('info-list-body')!;
const infoFormSection = document.getElementById('info-form-section')!;
const infoFormLegend = document.getElementById('info-form-legend')!;
const infoNewBtn = document.getElementById('info-new-btn') as HTMLButtonElement;
const infoSaveBtn = document.getElementById('info-save') as HTMLButtonElement;
const infoUpdateBtn = document.getElementById('info-update-btn') as HTMLButtonElement;
const infoCancelBtn = document.getElementById('info-cancel') as HTMLButtonElement;
const infoStatusText = document.getElementById('info-status-text')!;

const infoTitle = document.getElementById('info-title') as HTMLInputElement;
const infoDescription = document.getElementById('info-description') as HTMLInputElement;
const infoContent = document.getElementById('info-content') as HTMLTextAreaElement;
const infoScope = document.getElementById('info-scope') as HTMLSelectElement;
const infoIsActive = document.getElementById('info-is-active') as HTMLInputElement;

// Chat Internal
const chatIntSubmit = document.getElementById('chat-int-submit') as HTMLButtonElement;
const chatIntText = document.getElementById('chat-int-text') as HTMLTextAreaElement;
const chatIntResponseArea = document.getElementById('chat-int-response-area')!;

// Chat Widget
const createTokenBtn = document.getElementById('create-token-btn') as HTMLButtonElement;
const createTokenModal = document.getElementById('create-token-modal')!;
const createTokenForm = document.getElementById('create-token-form') as HTMLFormElement;
const cancelCreateTokenBtn = document.getElementById('cancel-create-token') as HTMLButtonElement;

const tokenListContainer = document.getElementById('token-list-container')!;
const widgetMode = document.getElementById('widget-mode') as HTMLSelectElement;
const widgetToken = document.getElementById('widget-token') as HTMLInputElement;
const widgetEmbedCode = document.getElementById('widget-embed-code')!;
const copyEmbedCodeBtn = document.getElementById('copy-embed-code')!;
const widgetSessionDisplay = document.getElementById('widget-session-display')!;
const widgetNewSession = document.getElementById('widget-new-session') as HTMLButtonElement;
const widgetText = document.getElementById('widget-text') as HTMLTextAreaElement;
const widgetSubmit = document.getElementById('widget-submit') as HTMLButtonElement;
const widgetResponseArea = document.getElementById('widget-response-area')!;

// Token Modal
const tokenModal = document.getElementById('token-modal')!;
const modalTokenId = document.getElementById('modal-token-id') as HTMLInputElement;
const modalTokenSecret = document.getElementById('modal-token-secret') as HTMLInputElement;
const modalTokenMeta = document.getElementById('modal-token-meta')!;
const closeTokenModal = document.getElementById('close-token-modal') as HTMLButtonElement;

// --- SEGÉDFÜGGVÉNYEK ---

function showError(message: string, isAuth = false): void {
    const target = isAuth ? authError : globalError;
    target.textContent = message;
    target.classList.remove('hidden');
    if (!isAuth) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
        target.classList.add('hidden');
    }, 10000);
}

function copyToClipboard(text: string, btn?: HTMLElement) {
    navigator.clipboard.writeText(text).then(() => {
        if (btn) {
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<span class="text-green-500">Kész!</span>';
            setTimeout(() => {
                btn.innerHTML = originalContent;
            }, 2000);
        }
    });
}

function updateJwtStatus(): void {
    const token = getToken();
    const isLoggedIn = !!token;
    
    if (isLoggedIn) {
        authView.classList.add('hidden');
        appView.classList.remove('hidden');
        
        // Próbáljuk meg kinyerni az adatokat a tokenből (opcionális, de jó UX)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            displayUserId.textContent = payload.user_id || 'Felhasználó';
            displayTenantId.textContent = payload.tenant_id || '';
        } catch (e) {
            displayUserId.textContent = 'Bejelentkezve';
        }
    } else {
        authView.classList.remove('hidden');
        appView.classList.add('hidden');
    }
}

let currentApiBaseUrl = '';

async function initWidgetConfig(): Promise<void> {
    try {
        const response = await apiCall('/widget/config', {});
        const config = await response.json();
        currentApiBaseUrl = config.api_base_url || getBaseUrl();
        apiBaseUrlValue.textContent = currentApiBaseUrl;
        
        // Show debug info on click
        widgetConfigDebug.addEventListener('click', () => {
            alert('Widget Config:\n' + JSON.stringify(config, null, 2));
        });
        
        const envToken = (import.meta as any).env.VITE_PUBLIC_WIDGET_TOKEN;
        if (envToken && !widgetToken.value) {
            widgetToken.value = envToken;
        }
        updateWidgetEmbedCode();
    } catch (error) {
        currentApiBaseUrl = getBaseUrl();
        apiBaseUrlValue.textContent = currentApiBaseUrl;
        updateWidgetEmbedCode();
    }
}

async function loadWidgetTokens() {
    tokenListContainer.innerHTML = '<p class="text-xs text-gray-400 italic">Betöltés...</p>';
    try {
        const response = await apiCall('/admin/public-widget-tokens', { auth: true });
        const data = await response.json();
        const tokens = data.tokens || [];
        
        tokenListContainer.innerHTML = '';
        if (tokens.length === 0) {
            tokenListContainer.innerHTML = '<p class="text-xs text-gray-400">Nincs még létrehozott token.</p>';
            return;
        }

        tokens.forEach((t: any) => {
            const div = document.createElement('div');
            div.className = 'token-item flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 transition-all cursor-pointer mb-2';
            if (widgetToken.value === t.token_id) {
                div.classList.add('active');
            }
            
            div.innerHTML = `
                <div class="min-w-0">
                    <p class="text-[11px] font-mono truncate text-gray-700 font-bold">${t.token_id}</p>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-[9px] px-1.5 py-0.5 rounded ${t.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} font-bold uppercase tracking-wider">
                            ${t.enabled ? 'Aktív' : 'Tiltott'}
                        </span>
                        <p class="text-[10px] text-gray-400">${new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex items-center">
                    <div class="w-2 h-2 rounded-full ${widgetToken.value === t.token_id ? 'bg-primary' : 'bg-transparent'}"></div>
                </div>
            `;
            
            div.addEventListener('click', () => {
                document.querySelectorAll('.token-item').forEach(item => item.classList.remove('active'));
                div.classList.add('active');
                widgetToken.value = t.token_id;
                updateWidgetEmbedCode();
                
                // Scroll to top of snippet
                widgetEmbedCode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
            
            tokenListContainer.appendChild(div);
        });
    } catch (err: any) {
        tokenListContainer.innerHTML = `<p class="text-xs text-red-500">Hiba: ${err.message}</p>`;
    }
}

async function createWidgetToken(formData: any) {
    try {
        const token = getToken();
        if (!token) throw new Error('Bejelentkezés szükséges');
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const tenantId = payload.tenant_id;

        const body: any = { 
            tenant_id: tenantId,
            allowed_origins: formData.origins,
            rate_limit_policy_id: formData.policyId || null,
            requests_per_minute: formData.rpm || null,
            requests_per_hour: formData.rph || null,
            quota_per_hour: formData.qph || null
        };

        const response = await apiCall('/admin/public-widget-tokens', {
            method: 'POST',
            auth: true,
            body
        });
        
        const data = await response.json();
        
        // Elrejtjük a kitöltő modalt
        createTokenModal.classList.add('hidden');
        createTokenForm.reset();

        // Megjelenítjük a sikeres modalt a titkos adatokkal
        modalTokenId.value = data.token_id;
        modalTokenSecret.value = data.token;
        
        // Meta adatok megjelenítése a modalban
        modalTokenMeta.innerHTML = `
            <p><strong>Originök:</strong> ${data.allowed_origins && data.allowed_origins.length > 0 ? data.allowed_origins.join(', ') : 'Nincs szűrés'}</p>
            ${data.requests_per_minute ? `<p><strong>RPM:</strong> ${data.requests_per_minute}</p>` : ''}
            ${data.requests_per_hour ? `<p><strong>RPH:</strong> ${data.requests_per_hour}</p>` : ''}
            ${data.quota_per_hour ? `<p><strong>Kvóta:</strong> ${data.quota_per_hour}</p>` : ''}
        `;
        
        tokenModal.classList.remove('hidden');
        
        loadWidgetTokens();
    } catch (err: any) {
        showError('Nem sikerült a token létrehozása: ' + err.message);
    }
}

function updateWidgetEmbedCode() {
    const baseUrl = currentApiBaseUrl;
    const token = widgetToken.value;
    const mode = widgetMode.value;
    
    if (!token) {
        widgetEmbedCode.textContent = 'Válasszon tokent a listából vagy írjon be egyet...';
        widgetEmbedCode.classList.add('italic', 'text-gray-500');
        copyEmbedCodeBtn.classList.add('hidden');
        return;
    }

    widgetEmbedCode.classList.remove('italic', 'text-gray-500');

    if (mode === 'widget-chat') {
        const snippet = `<!-- GLC-RAG Widget -->
<div id="glc-rag-widget-${token}"></div>
<style>
  #glc-rag-widget-root-${token} { 
    position: fixed; 
    bottom: 20px; 
    right: 20px; 
    z-index: 999999; 
    font-family: sans-serif; 
  }
  .glc-rag-bubble-btn { 
    width: 56px; height: 56px; 
    border-radius: 50%; border: none; 
    cursor: pointer; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
    display: flex; flex-direction: column; 
    align-items: center; justify-content: center; 
    background: #2196F3; color: #fff; 
    transition: transform 0.2s; 
  }
  .glc-rag-bubble-btn:hover { transform: scale(1.05); }
  .glc-rag-panel { 
    position: absolute; bottom: 70px; right: 0; 
    width: 400px; max-width: calc(100vw - 40px); height: 500px; 
    border-radius: 12px; overflow: hidden; 
    box-shadow: 0 8px 24px rgba(0,0,0,0.15); 
    border: 1px solid #e0e0e0; background: #fff; 
    display: none; 
  }
  .glc-rag-panel iframe { width: 100%; height: 100%; border: none; }
</style>
<script>
(function() {
  var TOKEN_ID = "${token}";
  var FRONTEND_URL = "${baseUrl}";
  var url = FRONTEND_URL + "/widget?token_id=" + encodeURIComponent(TOKEN_ID) + "&embed=1&default_mode=info&hide_mode_selector=1";
  var container = document.getElementById("glc-rag-widget-" + TOKEN_ID);
  if (!container) return;
  var root = document.createElement("div"); root.id = "glc-rag-widget-root-" + TOKEN_ID;
  var panel = document.createElement("div"); panel.className = "glc-rag-panel";
  var iframe = document.createElement("iframe"); iframe.src = url;
  panel.appendChild(iframe);
  var bubble = document.createElement("button"); bubble.className = "glc-rag-bubble-btn";
  bubble.innerHTML = "Eli";
  bubble.onclick = function() {
    var isOpen = panel.style.display === "block";
    panel.style.display = isOpen ? "none" : "block";
    bubble.innerHTML = isOpen ? "Eli" : "✕";
  };
  root.appendChild(panel); root.appendChild(bubble); container.appendChild(root);
})();
</script>`;
        widgetEmbedCode.textContent = snippet;
    } else {
        const snippet = `<!-- Public Chat API example -->
fetch("${baseUrl}/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    channel: "public",
    public_widget_token: "YOUR_SECRET_TOKEN",
    text: "/info your question"
  })
});`;
        widgetEmbedCode.textContent = snippet;
    }
    
    copyEmbedCodeBtn.classList.remove('hidden');
}

// --- AUTH UI VÁLTÁS ---
showRegisterBtn.addEventListener('click', () => {
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
});

showLoginBtn.addEventListener('click', () => {
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'none';
});

// --- TAB KEZELÉS ---
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tab = (button as HTMLElement).dataset.tab;
        tabButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        panels.forEach(panel => panel.classList.add('hidden'));
        document.getElementById(`panel-${tab}`)?.classList.remove('hidden');
        
        if (tab === 'info') loadInfoList();
        if (tab === 'chat-widget') loadWidgetTokens();
    });
});

// --- AUTH MODUL ---
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('button')!;
    btn.disabled = true;
    btn.textContent = 'Küldés...';
    
    try {
        const username = (document.getElementById('register-username') as HTMLInputElement).value;
        const tenantId = (document.getElementById('register-tenant-id') as HTMLInputElement).value;
        const email = (document.getElementById('register-email') as HTMLInputElement).value;
        const password = (document.getElementById('register-password') as HTMLInputElement).value;
        const passwordConfirm = (document.getElementById('register-password-confirm') as HTMLInputElement).value;
        const acceptedTerms = (document.getElementById('register-terms') as HTMLInputElement).checked;

        if (password !== passwordConfirm) {
            throw new Error('A két jelszó nem egyezik!');
        }

        await register(username, tenantId, email, password, passwordConfirm, acceptedTerms);
        alert('Regisztráció elküldve – nézd meg az emailt a megerősítő linkért.');
        registerForm.reset();
        showLoginBtn.click();
    } catch (err: any) {
        showError(err.message, true);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Fiók létrehozása';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button')!;
    btn.disabled = true;
    btn.textContent = 'Belépés...';
    
    try {
        const tenantId = (document.getElementById('login-tenant-id') as HTMLInputElement).value;
        const userId = (document.getElementById('login-user-id') as HTMLInputElement).value;
        const password = (document.getElementById('login-password') as HTMLInputElement).value;
        
        await login(tenantId, userId, password);
        updateJwtStatus();
        loginForm.reset();
    } catch (err: any) {
        showError(err.message, true);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Bejelentkezés';
    }
});

logoutBtn.addEventListener('click', async () => {
    await logout();
    updateJwtStatus();
});

// --- INFO ADMIN MODUL ---
async function loadInfoList() {
    infoListBody.textContent = '';
    const loadingRow = document.createElement('tr');
    const loadingCell = document.createElement('td');
    loadingCell.colSpan = 4;
    loadingCell.className = 'text-center py-8 text-gray-500';
    loadingCell.textContent = 'Betöltés...';
    loadingRow.appendChild(loadingCell);
    infoListBody.appendChild(loadingRow);

    try {
        if (!getToken()) return;
        const data = await listInfo();
        infoListBody.textContent = '';

        const items = Array.isArray(data) ? data : (data.items || []);
        
        if (items.length === 0) {
            loadingCell.textContent = 'Még nincs info elem – adj hozzá újat.';
            infoListBody.appendChild(loadingRow);
            return;
        }
        
        items.forEach((item: any) => {
            const tr = document.createElement('tr');
            
            const titleTd = document.createElement('td');
            titleTd.className = 'font-medium';
            titleTd.textContent = item.title;
            
            const scopeTd = document.createElement('td');
            scopeTd.innerHTML = `<span class="text-xs px-2 py-1 rounded bg-gray-100">${item.scope}</span>`;
            
            const statusTd = document.createElement('td');
            const statusSpan = document.createElement('span');
            statusSpan.className = `status-tag status-${item.indexing_status.toLowerCase()}`;
            statusSpan.textContent = item.indexing_status;
            statusTd.appendChild(statusSpan);
            
            const actionsTd = document.createElement('td');
            actionsTd.className = 'text-right space-x-2';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'text-primary hover:underline text-sm font-semibold';
            editBtn.dataset.id = item.id;
            editBtn.dataset.action = 'edit';
            editBtn.textContent = 'Szerkeszt';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'text-error hover:underline text-sm font-semibold';
            deleteBtn.dataset.id = item.id;
            deleteBtn.dataset.action = 'delete';
            deleteBtn.textContent = 'Törlés';
            
            const reindexBtn = document.createElement('button');
            reindexBtn.className = 'text-gray-500 hover:underline text-sm font-semibold';
            reindexBtn.dataset.id = item.id;
            reindexBtn.dataset.action = 'reindex';
            reindexBtn.textContent = 'Reindex';
            
            actionsTd.append(editBtn, reindexBtn, deleteBtn);
            tr.append(titleTd, scopeTd, statusTd, actionsTd);
            infoListBody.appendChild(tr);
        });
    } catch (err: any) {
        showError(err.message);
        loadingCell.textContent = 'Hiba történt a betöltéskor.';
    }
}

infoListBody.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const id = target.dataset.id;
    const action = target.dataset.action;
    if (!id || !action) return;

    if (action === 'edit') {
        await editInfo(id);
    } else if (action === 'delete') {
        if (confirm('Biztosan törli ezt az elemet?')) {
            try {
                await deleteInfo(id);
                loadInfoList();
            } catch (err: any) { showError(err.message); }
        }
    } else if (action === 'reindex') {
        try {
            await reindexInfo(id);
            alert('Indexelés elindítva.');
            loadInfoList();
        } catch (err: any) { showError(err.message); }
    }
});

async function editInfo(id: string) {
    try {
        const item = await getInfoById(id);
        currentInfoId = id;
        infoTitle.value = item.title;
        infoDescription.value = item.description || '';
        infoContent.value = item.content || '';
        infoScope.value = item.scope;
        infoIsActive.checked = item.is_active;
        
        infoFormLegend.textContent = 'Info elem szerkesztése';
        infoSaveBtn.classList.add('hidden');
        infoUpdateBtn.classList.remove('hidden');
        infoFormSection.classList.remove('hidden');
        infoFormSection.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) { showError(err.message); }
}

function resetInfoForm() {
    currentInfoId = null;
    infoTitle.value = '';
    infoDescription.value = '';
    infoContent.value = '';
    infoScope.value = 'internal';
    infoIsActive.checked = true;
    infoFormLegend.textContent = 'Új elem létrehozása';
    infoSaveBtn.classList.remove('hidden');
    infoUpdateBtn.classList.add('hidden');
    infoFormSection.classList.add('hidden');
}

infoNewBtn.addEventListener('click', () => {
    resetInfoForm();
    infoFormSection.classList.remove('hidden');
    infoFormSection.scrollIntoView({ behavior: 'smooth' });
});
infoCancelBtn.addEventListener('click', resetInfoForm);

infoSaveBtn.addEventListener('click', async () => {
    infoSaveBtn.disabled = true;
    infoSaveBtn.textContent = 'Mentés...';
    try {
        const res = await createInfo(infoTitle.value, infoDescription.value, infoContent.value, infoScope.value, infoIsActive.checked);
        alert('Létrehozva!');
        resetInfoForm();
        loadInfoList();
        if (res.indexing_status !== 'INDEXED') {
            startPolling(res.id);
        }
    } catch (err: any) { showError(err.message); }
    finally {
        infoSaveBtn.disabled = false;
        infoSaveBtn.textContent = 'Mentés';
    }
});

infoUpdateBtn.addEventListener('click', async () => {
    if (!currentInfoId) return;
    infoUpdateBtn.disabled = true;
    infoUpdateBtn.textContent = 'Frissítés...';
    try {
        await updateInfo(currentInfoId, infoTitle.value, infoDescription.value, infoContent.value, infoScope.value, infoIsActive.checked);
        alert('Frissítve!');
        resetInfoForm();
        loadInfoList();
        startPolling(currentInfoId);
    } catch (err: any) { showError(err.message); }
    finally {
        infoUpdateBtn.disabled = false;
        infoUpdateBtn.textContent = 'Frissítés';
    }
});

async function startPolling(id: string) {
    infoStatusText.textContent = 'Indexelés folyamatban...';
    const ok = await pollIndexing(id);
    infoStatusText.textContent = ok ? 'Indexelés kész.' : 'Indexelés időtúllépés.';
    loadInfoList();
}

// --- CHAT INTERNAL ---
chatIntSubmit.addEventListener('click', async () => {
    const text = chatIntText.value.trim();
    if (!text) return;

    addChatMessage(chatIntResponseArea, 'user', text);
    chatIntText.value = '';
    
    chatIntSubmit.disabled = true;
    const loadingMsg = addChatMessage(chatIntResponseArea, 'ai', 'Gondolkodom...');

    try {
        const res = await sendInternal(text);
        loadingMsg.remove();
        addChatMessage(chatIntResponseArea, 'ai', res);
    } catch (err: any) {
        loadingMsg.remove();
        addChatMessage(chatIntResponseArea, 'ai', { text: `Hiba történt: ${err.message}` });
    } finally {
        chatIntSubmit.disabled = false;
    }
});

// --- CHAT WIDGET ---
createTokenBtn.addEventListener('click', () => {
    createTokenModal.classList.remove('hidden');
});

cancelCreateTokenBtn.addEventListener('click', () => {
    createTokenModal.classList.add('hidden');
    createTokenForm.reset();
});

createTokenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = createTokenForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Létrehozás...';

    const origins = (document.getElementById('ct-origins') as HTMLInputElement).value
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);
    
    const formData = {
        origins,
        policyId: (document.getElementById('ct-policy') as HTMLInputElement).value,
        rpm: parseInt((document.getElementById('ct-rpm') as HTMLInputElement).value) || null,
        rph: parseInt((document.getElementById('ct-rph') as HTMLInputElement).value) || null,
        qph: parseInt((document.getElementById('ct-qph') as HTMLInputElement).value) || null,
    };

    await createWidgetToken(formData);
    
    btn.disabled = false;
    btn.textContent = 'Token Létrehozása';
});

widgetMode.addEventListener('change', () => {
    const mode = widgetMode.value;
    if (mode === 'public-chat') {
        widgetToken.placeholder = 'Titkos token megadása (public_widget_token)';
        widgetToken.type = 'password';
    } else {
        widgetToken.placeholder = 'Pl. widget_token_abc123 (token_id)';
        widgetToken.type = 'text';
    }
    updateWidgetEmbedCode();
});

widgetToken.addEventListener('input', updateWidgetEmbedCode);

copyEmbedCodeBtn.addEventListener('click', () => {
    copyToClipboard(widgetEmbedCode.textContent || '', copyEmbedCodeBtn);
});

widgetNewSession.addEventListener('click', () => {
    const newSid = crypto.randomUUID();
    widgetSessionDisplay.textContent = newSid.split('-')[0] + '...';
    (widgetNewSession as any)._sid = newSid;
});

widgetSubmit.addEventListener('click', async () => {
    const text = widgetText.value.trim();
    const sid = (widgetNewSession as any)._sid || crypto.randomUUID();
    const mode = widgetMode.value as 'widget-chat' | 'public-chat';
    const token = widgetToken.value;
    
    if (!text || !token) {
        showError('Hiányzó adatok: kérdés vagy token.');
        return;
    }

    addChatMessage(widgetResponseArea, 'user', text);
    widgetText.value = '';
    
    widgetSubmit.disabled = true;
    const loadingMsg = addChatMessage(widgetResponseArea, 'ai', 'Gondolkodom...');

    try {
        const res = await sendWidget(text, sid, token, mode);
        loadingMsg.remove();
        addChatMessage(widgetResponseArea, 'ai', res);
    } catch (err: any) {
        loadingMsg.remove();
        addChatMessage(widgetResponseArea, 'ai', { text: `Hiba történt: ${err.message}` });
    } finally {
        widgetSubmit.disabled = false;
    }
});

// --- TOKEN MODAL ---
closeTokenModal.addEventListener('click', () => {
    tokenModal.classList.add('hidden');
});

document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
        const inputId = (btn as HTMLElement).dataset.copy!;
        const input = document.getElementById(inputId) as HTMLInputElement;
        copyToClipboard(input.value, btn as HTMLElement);
    });
});

function addChatMessage(container: HTMLElement, role: 'user' | 'ai', data: any): HTMLElement {
    const msg = document.createElement('div');
    msg.className = `chat-bubble ${role === 'user' ? 'chat-user' : 'chat-ai shadow-sm'}`;
    
    if (typeof data === 'string') {
        msg.textContent = data;
    } else {
        const textPara = document.createElement('p');
        textPara.className = 'response-text';
        textPara.textContent = data.text;
        msg.appendChild(textPara);

        if (data.sources && data.sources.length > 0) {
            const sourcesDiv = document.createElement('div');
            sourcesDiv.className = 'sources mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500';
            sourcesDiv.innerHTML = `<strong>Források:</strong> ` + data.sources.map((s: any) => s.title || s.id).join(', ');
            msg.appendChild(sourcesDiv);
        }
        
        if (data.trace_id) {
            const tracePara = document.createElement('div');
            tracePara.className = 'text-[10px] text-gray-400 mt-1';
            tracePara.textContent = `trace: ${data.trace_id}`;
            msg.appendChild(tracePara);
        }
    }
    
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg;
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    const initialSid = crypto.randomUUID();
    widgetSessionDisplay.textContent = initialSid.split('-')[0] + '...';
    (widgetNewSession as any)._sid = initialSid;
    initWidgetConfig();
    updateJwtStatus();
});
