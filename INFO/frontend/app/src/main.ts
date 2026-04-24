// FĹ‘ entry point - tab vĂˇltĂˇs, init, GET /widget/config indulĂˇskor

import { getBaseUrl, apiCall } from './api.js';
import { getToken, register, login, logout } from './auth.js';
import {
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
} from './infoAdmin.js';
import { sendInfoQuestion as sendInternal } from './chatInternal.js';
import { sendInfoQuestion as sendWidget } from './chatWidget.js';
import {
    getSurveySettings,
    updateSurveySettings,
    listSurveyResponses,
    listSurveyGroups,
    createSurveyGroup,
    updateSurveyGroup,
    deleteSurveyGroup,
    createSurveyQuestionnaire,
    updateSurveyQuestionnaire,
    deleteSurveyQuestionnaire,
    createSurveyField,
    updateSurveyField,
    deleteSurveyField,
} from './surveys.js';

// --- ĂLLAPOT ---
let currentInfoId: string | null = null;
let currentCrawlJobId: string | null = null;
let crawlPollTimer: number | null = null;

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
const infoCrawlUrls = document.getElementById('info-crawl-urls') as HTMLTextAreaElement;
const infoCrawlDepth = document.getElementById('info-crawl-depth') as HTMLInputElement;
const infoCrawlMaxPages = document.getElementById('info-crawl-max-pages') as HTMLInputElement;
const infoCrawlScope = document.getElementById('info-crawl-scope') as HTMLSelectElement;
const infoCrawlStartBtn = document.getElementById('info-crawl-start') as HTMLButtonElement;
const infoCrawlCancelBtn = document.getElementById('info-crawl-cancel') as HTMLButtonElement;
const infoCrawlStatusText = document.getElementById('info-crawl-status-text')!;
const infoCrawlJobId = document.getElementById('info-crawl-job-id')!;
const infoCrawlEvents = document.getElementById('info-crawl-events')!;
const surveyEnabled = document.getElementById('survey-enabled') as HTMLInputElement;
const surveyNotificationEmail = document.getElementById('survey-notification-email') as HTMLInputElement;
const surveySettingsStatus = document.getElementById('survey-settings-status')!;
const surveySettingsLoadBtn = document.getElementById('survey-settings-load') as HTMLButtonElement;
const surveySettingsSaveBtn = document.getElementById('survey-settings-save') as HTMLButtonElement;
const surveyResponsesRefreshBtn = document.getElementById('survey-responses-refresh') as HTMLButtonElement;
const surveyResponsesBody = document.getElementById('survey-responses-body')!;
const surveyTabEditor = document.getElementById('survey-tab-editor') as HTMLButtonElement;
const surveyTabResponses = document.getElementById('survey-tab-responses') as HTMLButtonElement;
const surveyEditorView = document.getElementById('survey-editor-view')!;
const surveyResponsesView = document.getElementById('survey-responses-view')!;
const surveyGroupsContainer = document.getElementById('survey-groups-container')!;
const surveyGroupTitle = document.getElementById('survey-group-title') as HTMLInputElement;
const surveyGroupUserDescription = document.getElementById('survey-group-user-description') as HTMLTextAreaElement;
const surveyGroupLlmDescription = document.getElementById('survey-group-llm-description') as HTMLTextAreaElement;
const surveyGroupSortOrder = document.getElementById('survey-group-sort-order') as HTMLInputElement;
const surveyGroupActive = document.getElementById('survey-group-active') as HTMLInputElement;
const surveyGroupPanelTitle = document.getElementById('survey-group-panel-title')!;
const surveyGroupCreateBtn = document.getElementById('survey-group-create-btn') as HTMLButtonElement;
const surveyGroupOpenBtn = document.getElementById('survey-group-open-btn') as HTMLButtonElement;
const surveyGroupCancelBtn = document.getElementById('survey-group-cancel-btn') as HTMLButtonElement;
const surveyGroupCreatePanel = document.getElementById('survey-group-create-panel')!;
const surveyBuilderStatus = document.getElementById('survey-builder-status')!;
const surveyQuestionnaireModal = document.getElementById('survey-questionnaire-modal')!;
const surveyQuestionnaireModalTitle = document.getElementById('survey-questionnaire-modal-title')!;
const surveyQuestionnaireModalContext = document.getElementById('survey-questionnaire-modal-context')!;
const surveyQuestionnaireTitle = document.getElementById('survey-questionnaire-title') as HTMLInputElement;
const surveyQuestionnaireSortOrder = document.getElementById('survey-questionnaire-sort-order') as HTMLInputElement;
const surveyQuestionnaireActive = document.getElementById('survey-questionnaire-active') as HTMLInputElement;
const surveyQuestionnaireCancelBtn = document.getElementById('survey-questionnaire-cancel-btn') as HTMLButtonElement;
const surveyQuestionnaireSaveBtn = document.getElementById('survey-questionnaire-save-btn') as HTMLButtonElement;
const surveyFieldModal = document.getElementById('survey-field-modal')!;
const surveyFieldModalTitle = document.getElementById('survey-field-modal-title')!;
const surveyFieldModalContext = document.getElementById('survey-field-modal-context')!;
const surveyFieldType = document.getElementById('survey-field-type') as HTMLSelectElement;
const surveyFieldSortOrder = document.getElementById('survey-field-sort-order') as HTMLInputElement;
const surveyFieldLabel = document.getElementById('survey-field-label') as HTMLInputElement;
const surveyFieldOptionsWrap = document.getElementById('survey-field-options-wrap')!;
const surveyFieldOptions = document.getElementById('survey-field-options') as HTMLInputElement;
const surveyFieldRequired = document.getElementById('survey-field-required') as HTMLInputElement;
const surveyFieldCancelBtn = document.getElementById('survey-field-cancel-btn') as HTMLButtonElement;
const surveyFieldSaveBtn = document.getElementById('survey-field-save-btn') as HTMLButtonElement;
let cachedSurveyGroups: any[] = [];
let editingSurveyGroupId: string | null = null;
let editingQuestionnaireGroupId: string | null = null;
let editingQuestionnaireId: string | null = null;
let editingFieldQuestionnaireId: string | null = null;
let editingFieldId: string | null = null;

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

// --- SEGĂ‰DFĂśGGVĂ‰NYEK ---

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
            btn.innerHTML = '<span class="text-green-500">KĂ©sz!</span>';
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
        
        // PrĂłbĂˇljuk meg kinyerni az adatokat a tokenbĹ‘l (opcionĂˇlis, de jĂł UX)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            displayUserId.textContent = payload.user_id || 'FelhasznĂˇlĂł';
            displayTenantId.textContent = payload.tenant_id || '';
        } catch (e) {
            displayUserId.textContent = 'Bejelentkezve';
        }
    } else {
        if (crawlPollTimer) {
            clearInterval(crawlPollTimer);
            crawlPollTimer = null;
        }
        currentCrawlJobId = null;
        setCrawlIdleState();
        infoCrawlJobId.textContent = '-';
        infoCrawlStatusText.textContent = 'MĂ©g nem indult web crawl.';
        infoCrawlEvents.innerHTML = '<p class="muted small">EsemĂ©nyek itt jelennek meg futĂˇs kĂ¶zben.</p>';
        authView.classList.remove('hidden');
        appView.classList.add('hidden');
    }
}

function setCrawlIdleState(): void {
    infoCrawlStartBtn.disabled = false;
    infoCrawlCancelBtn.classList.add('hidden');
}

function setCrawlRunningState(): void {
    infoCrawlStartBtn.disabled = true;
    infoCrawlCancelBtn.classList.remove('hidden');
}

function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function firstNonEmpty(...values: any[]): string {
    for (const value of values) {
        if (value === null || value === undefined) continue;
        if (typeof value === 'string' && value.trim().length === 0) continue;
        if (typeof value === 'object') continue;
        return String(value);
    }
    return '';
}

function stringifyBrief(value: unknown): string {
    try {
        const raw = JSON.stringify(value);
        if (!raw) return '';
        return raw.length > 220 ? `${raw.slice(0, 220)}...` : raw;
    } catch {
        return '';
    }
}

function parseEventTime(event: any): string {
    const raw = firstNonEmpty(event.ts, event.timestamp, event.created_at, event.time, event.at);
    if (!raw) return '-';
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return raw;
    return dt.toLocaleString();
}

function parseEventType(event: any): string {
    return firstNonEmpty(
        event.type,
        event.event_type,
        event.kind,
        event.name,
        event.event,
        event.action,
        event.payload?.type,
        event.payload?.event_type,
        event.data?.type,
        event.data?.event_type,
        'event'
    );
}

function parseEventStatus(event: any): string {
    const explicit = firstNonEmpty(
        event.status,
        event.state,
        event.job_status,
        event.job?.status,
        event.job?.state,
        event.value?.status,
        event.value?.state,
        event.payload?.status,
        event.payload?.state,
        event.data?.status,
        event.data?.state,
        event.meta?.status
    );
    if (explicit) return explicit;

    const type = parseEventType(event).toLowerCase();
    if (type === 'done') return 'DONE';
    if (type === 'error' || type === 'failed') return 'FAILED';
    if (type === 'cancel' || type === 'cancelled') return 'CANCELLED';
    if (type === 'heartbeat' || type === 'status' || type === 'page') return 'RUNNING';
    return '-';
}

function parseEventPage(event: any): string {
    const page = firstNonEmpty(
        event.page_url,
        event.url,
        event.path,
        event.value?.url,
        event.value?.page_url,
        event.value?.path,
        event.payload?.page_url,
        event.payload?.url,
        event.data?.page_url,
        event.data?.url
    );
    if (page) return page;

    const nestedPage =
        event.page ||
        event.payload?.page ||
        event.data?.page ||
        event.value?.page ||
        event.payload?.url_data ||
        event.data?.url_data ||
        event.value?.url_data;
    if (nestedPage && typeof nestedPage === 'object') {
        const extracted = firstNonEmpty(
            nestedPage.url,
            nestedPage.page_url,
            nestedPage.path,
            nestedPage.location,
            nestedPage.href,
            nestedPage.canonical_url,
            nestedPage.title
        );
        if (extracted) return extracted;
        return stringifyBrief(nestedPage) || '-';
    }
    return '-';
}

function parseEventMessage(event: any): string {
    const explicit = firstNonEmpty(
        event.message,
        event.detail,
        event.error,
        event.reason,
        event.text,
        event.value?.message,
        event.value?.detail,
        event.value?.error,
        event.payload?.message,
        event.payload?.detail,
        event.payload?.error,
        event.data?.message,
        event.data?.detail,
        event.data?.error
    );
    if (explicit) return explicit;

    const details = stringifyBrief(event.payload) || stringifyBrief(event.data) || stringifyBrief(event.value);
    return details || '-';
}

function renderCrawlEvents(events: any[]): void {
    if (!Array.isArray(events) || events.length === 0) {
        infoCrawlEvents.innerHTML = '<p class="muted small">MĂ©g nincs esemĂ©ny.</p>';
        return;
    }

    const latest = events.slice(-25);
    infoCrawlEvents.innerHTML = latest.map((event: any) => {
        const time = escapeHtml(parseEventTime(event));
        const type = escapeHtml(parseEventType(event));
        const status = escapeHtml(parseEventStatus(event));
        const page = escapeHtml(parseEventPage(event));
        const message = escapeHtml(parseEventMessage(event));
        return `<p class="crawl-event">[${time}] type=${type} | status=${status} | page=${page} | msg=${message}</p>`;
    }).join('');
}

async function refreshWebCrawlStatus(): Promise<void> {
    if (!currentCrawlJobId) return;

    const data = await getInfoWebCrawlJob(currentCrawlJobId);
    const job: any = (data as any).job || data;
    const dataAny: any = data as any;
    const statusRaw = firstNonEmpty(
        job.status,
        dataAny.status,
        job.state,
        dataAny.state,
        job.data?.status,
        dataAny.data?.status,
        'RUNNING'
    );
    const status = statusRaw.toUpperCase();
    const stats = job.stats || data.stats || {};
    const crawled = firstNonEmpty(
        stats.pages_crawled,
        stats.crawled_pages,
        stats.pages,
        stats.pages_count,
        stats.visited_pages,
        stats.total_pages,
        '-'
    );
    const created = firstNonEmpty(
        stats.created_info_items,
        stats.info_items_created,
        stats.created_items,
        stats.result_count,
        stats.saved_items,
        '-'
    );

    infoCrawlStatusText.textContent = `Ăllapot: ${status} | Oldalak: ${crawled} | LĂ©trehozott Info elemek: ${created}`;
    const events = Array.isArray((data as any).events)
        ? (data as any).events
        : Array.isArray((data as any).job?.events)
            ? (data as any).job.events
            : Array.isArray((data as any).events?.items)
                ? (data as any).events.items
                : [];
    renderCrawlEvents(events);

    if (status === 'DONE' || status === 'FAILED' || status === 'CANCELLED') {
        if (crawlPollTimer) {
            clearInterval(crawlPollTimer);
            crawlPollTimer = null;
        }
        setCrawlIdleState();
        loadInfoList();
    }
}

function startCrawlPolling(): void {
    if (crawlPollTimer) {
        clearInterval(crawlPollTimer);
    }
    crawlPollTimer = window.setInterval(() => {
        refreshWebCrawlStatus().catch((err: any) => {
            if (crawlPollTimer) {
                clearInterval(crawlPollTimer);
                crawlPollTimer = null;
            }
            setCrawlIdleState();
            showError(`Web crawl stĂˇtusz lekĂ©rĂ©si hiba: ${err.message}`);
        });
    }, 2500);
}

async function loadSurveySettings(): Promise<void> {
    surveySettingsStatus.textContent = 'Beallitasok betoltese...';
    try {
        const data = await getSurveySettings();
        surveyEnabled.checked = !!data.info_surveys_enabled;
        surveyNotificationEmail.value = data.survey_notification_email || '';
        surveySettingsStatus.textContent = 'Beallitasok betoltve.';
    } catch (err: any) {
        surveySettingsStatus.textContent = 'Beallitasok betoltese sikertelen.';
        showError(err.message);
    }
}

async function saveSurveySettings(): Promise<void> {
    surveySettingsSaveBtn.disabled = true;
    surveySettingsSaveBtn.textContent = 'Mentes...';
    surveySettingsStatus.textContent = 'Mentes folyamatban...';
    try {
        await updateSurveySettings({
            info_surveys_enabled: surveyEnabled.checked,
            survey_notification_email: surveyNotificationEmail.value.trim() || null,
        });
        surveySettingsStatus.textContent = 'Beallitasok elmentve.';
    } catch (err: any) {
        surveySettingsStatus.textContent = 'Mentes sikertelen.';
        showError(err.message);
    } finally {
        surveySettingsSaveBtn.disabled = false;
        surveySettingsSaveBtn.textContent = 'Beállítások mentése';
    }
}

function setSurveyBuilderStatus(text: string): void {
    surveyBuilderStatus.textContent = `Szerkeszto allapot: ${text}`;
}

function escapeText(value: unknown): string {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function showErrorNoScroll(message: string, isAuth = false): void {
    const target = isAuth ? authError : globalError;
    target.textContent = message;
    target.classList.remove('hidden');
    setTimeout(() => {
        target.classList.add('hidden');
    }, 4500);
}

function getGroupId(entity: any, fallback = ''): string {
    if (!entity || typeof entity !== 'object') return fallback;
    const id = entity.group_id ?? entity.group_uuid ?? entity.id ?? entity.uuid;
    return String(id ?? fallback);
}

function getQuestionnaireId(entity: any, fallback = ''): string {
    if (!entity || typeof entity !== 'object') return fallback;
    const id = entity.questionnaire_id ?? entity.questionnaire_uuid ?? entity.id ?? entity.uuid;
    return String(id ?? fallback);
}

function getFieldId(entity: any, fallback = ''): string {
    if (!entity || typeof entity !== 'object') return fallback;
    const id = entity.field_id ?? entity.field_uuid ?? entity.id ?? entity.uuid;
    return String(id ?? fallback);
}

function getQuestionnairesForGroup(group: any): any[] {
    const list: any[] = [];
    if (Array.isArray(group?.questionnaires)) list.push(...group.questionnaires);
    if (group?.questionnaire && typeof group.questionnaire === 'object') list.push(group.questionnaire);
    return list.sort((a, b) => Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0));
}

function normalizeFieldType(value: any): 'email' | 'boolean' | 'checkbox' | 'text' {
    const raw = String(value || 'text').toLowerCase();
    if (raw === 'email') return 'email';
    if (raw === 'boolean' || raw === 'bool' || raw === 'switch') return 'boolean';
    if (raw === 'checkbox' || raw === 'multi' || raw === 'multiple_choice' || raw === 'choices') return 'checkbox';
    return 'text';
}

function extractFieldOptions(field: any): string[] {
    if (!field || typeof field !== 'object') return [];
    const raw = field.options ?? field.checkbox_options ?? field.choices ?? field.items;
    if (!raw) return [];
    if (Array.isArray(raw)) {
        return raw.map((o: any) => String(o?.label ?? o?.value ?? o ?? '').trim()).filter(Boolean);
    }
    if (typeof raw === 'string') {
        return raw.split(',').map((o: string) => o.trim()).filter(Boolean);
    }
    return [];
}

function getFieldsForQuestionnaire(questionnaire: any): any[] {
    const rawFields = questionnaire?.fields ?? questionnaire?.questions ?? questionnaire?.questionnaire_fields ?? [];
    if (!Array.isArray(rawFields)) return [];
    return rawFields.map((field: any, idx: number) => ({
        id: getFieldId(field, `field-${idx + 1}`),
        type: normalizeFieldType(field.field_type ?? field.type ?? field.kind),
        label: String(field.label ?? field.title ?? field.name ?? `Mezo ${idx + 1}`),
        required: Boolean(field.is_required ?? field.required ?? false),
        sort_order: Number(field.sort_order ?? field.position ?? idx),
        options: extractFieldOptions(field),
    }));
}

function normalizeGroups(data: any): any[] {
    const raw = Array.isArray(data) ? data : (data.items || data.groups || []);
    if (!Array.isArray(raw)) return [];
    return raw.sort((a, b) => Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0));
}

function openSurveyGroupPanel(editGroup?: any): void {
    surveyGroupCreatePanel.classList.remove('hidden');
    surveyGroupOpenBtn.classList.add('hidden');

    if (editGroup) {
        editingSurveyGroupId = getGroupId(editGroup);
        surveyGroupPanelTitle.textContent = 'Csoport szerkesztese';
        surveyGroupTitle.value = editGroup.title || editGroup.name || '';
        surveyGroupUserDescription.value = editGroup.user_description || '';
        surveyGroupLlmDescription.value = editGroup.llm_description || '';
        surveyGroupSortOrder.value = String(editGroup.sort_order ?? 0);
        surveyGroupActive.checked = editGroup.is_active ?? editGroup.active ?? true;
        surveyGroupCreateBtn.textContent = 'Mentes';
    } else {
        editingSurveyGroupId = null;
        surveyGroupPanelTitle.textContent = 'Uj csoport';
        surveyGroupTitle.value = '';
        surveyGroupUserDescription.value = '';
        surveyGroupLlmDescription.value = '';
        surveyGroupSortOrder.value = '0';
        surveyGroupActive.checked = true;
        surveyGroupCreateBtn.textContent = 'Letrehozas';
    }
}

function closeSurveyGroupPanel(): void {
    surveyGroupCreatePanel.classList.add('hidden');
    surveyGroupOpenBtn.classList.remove('hidden');
    editingSurveyGroupId = null;
}

function renderGroupsEditor(): void {
    if (cachedSurveyGroups.length === 0) {
        surveyGroupsContainer.innerHTML = '<p class="muted small">Meg nincs csoport. Hozz letre egyet az Uj csoport gombbal.</p>';
        return;
    }

    surveyGroupsContainer.innerHTML = cachedSurveyGroups.map((group: any) => {
        const groupId = getGroupId(group);
        if (!groupId) {
            return `
                <article class="survey-group-card">
                    <p class="text-error">A csoport azonosítója hiányzik, ezért nem szerkeszthető.</p>
                </article>
            `;
        }
        const questionnaires = getQuestionnairesForGroup(group);
        const questionnaire = questionnaires[0] || null;

        const questionnaireHtml = questionnaire
            ? (() => {
                const qid = getQuestionnaireId(questionnaire);
                if (!qid) {
                    return `
                        <div class="survey-questionnaire-empty">
                            <p class="text-error small">A kérdőív azonosítója hiányzik, ezért mező nem adható hozzá.</p>
                        </div>
                    `;
                }
                const fields = getFieldsForQuestionnaire(questionnaire).sort((a, b) => a.sort_order - b.sort_order);
                const fieldRows = fields.length === 0
                    ? '<tr><td colspan="4" class="muted small">A kerdoivben meg nincs mezo.</td></tr>'
                    : fields.map((field: any) => {
                        const optionsText = field.type === 'checkbox' && field.options.length > 0 ? ` | ${field.options.join(', ')}` : '';
                        return `
                            <tr>
                                <td>${escapeText(field.type)}</td>
                                <td>${escapeText(field.label)}${escapeText(optionsText)}</td>
                                <td>${field.required ? 'igen' : 'nem'}</td>
                                <td class="text-right">
                                    <button type="button" class="link-btn" data-action="field-edit" data-group-id="${groupId}" data-questionnaire-id="${qid}" data-field-id="${field.id}">Szerkeszt</button>
                                    <button type="button" class="link-btn text-error" data-action="field-delete" data-group-id="${groupId}" data-questionnaire-id="${qid}" data-field-id="${field.id}">Torles</button>
                                </td>
                            </tr>
                        `;
                    }).join('');

                return `
                    <div class="survey-questionnaire-block" data-group-id="${groupId}" data-questionnaire-id="${qid}">
                        <div class="survey-q-head">
                            <strong>${escapeText(questionnaire.title || questionnaire.name || 'Kerdoiv')}</strong>
                            <div>
                                <button type="button" class="link-btn" data-action="questionnaire-edit" data-group-id="${groupId}" data-questionnaire-id="${qid}">Szerkeszt</button>
                                <button type="button" class="link-btn text-error" data-action="questionnaire-delete" data-group-id="${groupId}" data-questionnaire-id="${qid}">Torles</button>
                            </div>
                        </div>
                        <p class="muted small">Mezok: ${fields.length}</p>
                        <button type="button" class="btn-secondary" data-action="field-add" data-group-id="${groupId}" data-questionnaire-id="${qid}">+ Mezo hozzaadasa</button>
                        <div class="table-wrapper">
                            <table class="data">
                                <thead><tr><th>Tipus</th><th>Cimke</th><th>Kotelezo</th><th class="text-right">Muvelet</th></tr></thead>
                                <tbody>${fieldRows}</tbody>
                            </table>
                        </div>
                    </div>
                `;
            })()
            : `
                <div class="survey-questionnaire-empty">
                    <p class="muted small">Ehhez a csoporthoz meg nincs kerdoiv.</p>
                    <button type="button" class="btn-secondary" data-action="questionnaire-create" data-group-id="${groupId}">+ Kerdoiv letrehozasa</button>
                </div>
            `;

        return `
            <article class="survey-group-card">
                <div class="survey-group-head">
                    <h3>${escapeText(group.title || group.name || 'Csoport')}</h3>
                    <div>
                        <button type="button" class="link-btn" data-action="group-edit" data-group-id="${groupId}">Szerkeszt</button>
                        <button type="button" class="link-btn text-error" data-action="group-delete" data-group-id="${groupId}">Torles</button>
                    </div>
                </div>
                <p class="muted small">Aktiv: ${(group.is_active ?? group.active ?? true) ? 'igen' : 'nem'} • sorrend: ${escapeText(group.sort_order ?? 0)}</p>
                <p class="muted">Felhasznaloi leiras: ${escapeText(group.user_description || '-')}</p>
                <hr>
                <div class="survey-group-body">
                    <h4>Kerdoiv (csoportonkent legfeljebb egy)</h4>
                    ${questionnaireHtml}
                </div>
            </article>
        `;
    }).join('');
}

async function loadSurveyBuilderData(): Promise<void> {
    setSurveyBuilderStatus('Csoportok betoltese...');
    try {
        const data = await listSurveyGroups();
        cachedSurveyGroups = normalizeGroups(data);
        renderGroupsEditor();
        setSurveyBuilderStatus(`Betoltve (${cachedSurveyGroups.length} csoport).`);
    } catch (err: any) {
        cachedSurveyGroups = [];
        renderGroupsEditor();
        setSurveyBuilderStatus('Betoltes sikertelen.');
        showError(err.message);
    }
}

async function saveSurveyGroup(): Promise<void> {
    const title = surveyGroupTitle.value.trim();
    if (!title) {
        showError('A csoport cim kotelezo.');
        return;
    }

    surveyGroupCreateBtn.disabled = true;
    surveyGroupCreateBtn.textContent = 'Mentes...';
    try {
        const payload = {
            title,
            user_description: surveyGroupUserDescription.value.trim() || undefined,
            llm_description: surveyGroupLlmDescription.value.trim() || undefined,
            is_active: surveyGroupActive.checked,
            sort_order: Number(surveyGroupSortOrder.value) || 0,
        };

        if (editingSurveyGroupId) {
            await updateSurveyGroup(editingSurveyGroupId, payload);
            setSurveyBuilderStatus('Csoport mentve.');
        } else {
            await createSurveyGroup(payload);
            setSurveyBuilderStatus('Csoport letrehozva.');
        }

        closeSurveyGroupPanel();
        await loadSurveyBuilderData();
    } catch (err: any) {
        showError(err.message);
    } finally {
        surveyGroupCreateBtn.disabled = false;
        surveyGroupCreateBtn.textContent = editingSurveyGroupId ? 'Mentes' : 'Letrehozas';
    }
}

function updateFieldOptionsVisibility(): void {
    const isCheckbox = normalizeFieldType(surveyFieldType.value) === 'checkbox';
    surveyFieldOptionsWrap.classList.toggle('hidden', !isCheckbox);
}

function getGroupById(groupId: string): any | null {
    return cachedSurveyGroups.find((g: any) => getGroupId(g) === groupId) || null;
}

function getQuestionnaireById(groupId: string, questionnaireId: string): any | null {
    const group = getGroupById(groupId);
    if (!group) return null;
    return getQuestionnairesForGroup(group).find((q: any) => getQuestionnaireId(q) === questionnaireId) || null;
}

function getFieldById(groupId: string, questionnaireId: string, fieldId: string): any | null {
    const questionnaire = getQuestionnaireById(groupId, questionnaireId);
    if (!questionnaire) return null;
    const fields = getFieldsForQuestionnaire(questionnaire);
    return fields.find((f: any) => String(f.id) === fieldId) || null;
}

function openQuestionnaireModal(groupId: string, existing?: any): void {
    const group = getGroupById(groupId);
    editingQuestionnaireGroupId = groupId;
    editingQuestionnaireId = existing ? getQuestionnaireId(existing) : null;
    surveyQuestionnaireModalTitle.textContent = editingQuestionnaireId ? 'Kérdőív szerkesztése' : 'Kérdőív létrehozása';
    surveyQuestionnaireModalContext.textContent = `Csoport: ${group?.title || group?.name || groupId}`;
    surveyQuestionnaireTitle.value = existing?.title || existing?.name || '';
    surveyQuestionnaireSortOrder.value = String(existing?.sort_order ?? 0);
    surveyQuestionnaireActive.checked = Boolean(existing ? (existing.is_active ?? existing.active ?? true) : true);
    surveyQuestionnaireSaveBtn.textContent = editingQuestionnaireId ? 'Mentés' : 'Létrehozás';
    surveyQuestionnaireModal.classList.remove('hidden');
    surveyQuestionnaireTitle.focus();
}

function closeQuestionnaireModal(): void {
    surveyQuestionnaireModal.classList.add('hidden');
    editingQuestionnaireGroupId = null;
    editingQuestionnaireId = null;
}

function openFieldModal(groupId: string, questionnaireId: string, existing?: any): void {
    const group = getGroupById(groupId);
    const questionnaire = getQuestionnaireById(groupId, questionnaireId);
    editingFieldQuestionnaireId = questionnaireId;
    editingFieldId = existing ? String(existing.id ?? '') : null;
    surveyFieldModalTitle.textContent = editingFieldId ? 'Mező szerkesztése' : 'Mező hozzáadása';
    surveyFieldModalContext.textContent = `Csoport: ${group?.title || group?.name || groupId} • Kérdőív: ${questionnaire?.title || questionnaire?.name || questionnaireId}`;
    surveyFieldType.value = normalizeFieldType(existing?.field_type ?? existing?.type ?? existing?.kind ?? 'text');
    surveyFieldLabel.value = existing?.label || existing?.title || existing?.name || '';
    surveyFieldSortOrder.value = String(existing?.sort_order ?? existing?.position ?? 0);
    surveyFieldRequired.checked = Boolean(existing?.is_required ?? existing?.required ?? false);
    surveyFieldOptions.value = extractFieldOptions(existing).join(', ');
    surveyFieldSaveBtn.textContent = editingFieldId ? 'Mentés' : 'Hozzáadás';
    updateFieldOptionsVisibility();
    surveyFieldModal.classList.remove('hidden');
    surveyFieldLabel.focus();
}

function closeFieldModal(): void {
    surveyFieldModal.classList.add('hidden');
    editingFieldQuestionnaireId = null;
    editingFieldId = null;
}

async function saveQuestionnaireFromModal(): Promise<void> {
    if (!editingQuestionnaireGroupId) return;
    const title = surveyQuestionnaireTitle.value.trim();
    if (!title) {
        showError('A kérdőív cím kötelező.');
        return;
    }

    const payload = {
        group_id: editingQuestionnaireGroupId,
        title,
        sort_order: Number(surveyQuestionnaireSortOrder.value) || 0,
        is_active: surveyQuestionnaireActive.checked,
    };

    surveyQuestionnaireSaveBtn.disabled = true;
    surveyQuestionnaireSaveBtn.textContent = 'Mentés...';
    try {
        if (editingQuestionnaireId) {
            await updateSurveyQuestionnaire(editingQuestionnaireId, payload);
            setSurveyBuilderStatus('Kérdőív mentve.');
        } else {
            await createSurveyQuestionnaire(payload);
            setSurveyBuilderStatus('Kérdőív létrehozva.');
        }
        closeQuestionnaireModal();
        await loadSurveyBuilderData();
    } catch (err: any) {
        showError(err.message);
    } finally {
        surveyQuestionnaireSaveBtn.disabled = false;
        surveyQuestionnaireSaveBtn.textContent = editingQuestionnaireId ? 'Mentés' : 'Létrehozás';
    }
}

async function saveFieldFromModal(): Promise<void> {
    if (!editingFieldQuestionnaireId) {
        showError('Hiányzik a kérdőív azonosító, a mező nem menthető.');
        return;
    }
    const label = surveyFieldLabel.value.trim();
    if (!label) {
        showError('A mező címke kötelező.');
        return;
    }

    const fieldType = normalizeFieldType(surveyFieldType.value);
    let options: string[] | undefined = undefined;
    if (fieldType === 'checkbox') {
        options = surveyFieldOptions.value.split(',').map((o) => o.trim()).filter(Boolean);
        if (options.length === 0) {
            showError('Checkbox típusnál legalább egy opció kötelező.');
            return;
        }
    }

    const payload = {
        field_type: fieldType,
        label,
        sort_order: Number(surveyFieldSortOrder.value) || 0,
        is_required: surveyFieldRequired.checked,
        options,
    };

    surveyFieldSaveBtn.disabled = true;
    surveyFieldSaveBtn.textContent = 'Mentés...';
    try {
        if (editingFieldId) {
            await updateSurveyField(editingFieldId, editingFieldQuestionnaireId, payload);
            setSurveyBuilderStatus('Mező mentve.');
        } else {
            await createSurveyField(editingFieldQuestionnaireId, payload);
            setSurveyBuilderStatus('Mező hozzáadva.');
        }
        closeFieldModal();
        await loadSurveyBuilderData();
    } catch (err: any) {
        showError(err.message);
    } finally {
        surveyFieldSaveBtn.disabled = false;
        surveyFieldSaveBtn.textContent = editingFieldId ? 'Mentés' : 'Hozzáadás';
    }
}

async function handleSurveyEditorAction(target: HTMLElement): Promise<void> {
    const action = target.dataset.action;
    const source = target.closest('[data-group-id], [data-questionnaire-id]') as HTMLElement | null;
    const groupId = target.dataset.groupId || source?.dataset?.groupId;
    const questionnaireId = target.dataset.questionnaireId || source?.dataset?.questionnaireId;
    const fieldId = target.dataset.fieldId;

    if (!action) return;

    if (action === 'group-edit' && groupId) {
        const group = getGroupById(groupId);
        if (group) openSurveyGroupPanel(group);
        return;
    }

    if (action === 'group-delete' && groupId) {
        if (!confirm('Biztosan torlod a csoportot?')) return;
        await deleteSurveyGroup(groupId);
        await loadSurveyBuilderData();
        return;
    }

    if (action === 'questionnaire-create' && groupId) {
        openQuestionnaireModal(groupId);
        return;
    }

    if (action === 'questionnaire-edit' && groupId && questionnaireId) {
        const questionnaire = getQuestionnaireById(groupId, questionnaireId);
        if (!questionnaire) {
            showError('A kérdőív nem található.');
            return;
        }
        openQuestionnaireModal(groupId, questionnaire);
        return;
    }

    if (action === 'questionnaire-delete' && questionnaireId) {
        if (!confirm('Biztosan torlod a kerdoivet?')) return;
        await deleteSurveyQuestionnaire(questionnaireId);
        await loadSurveyBuilderData();
        return;
    }

    if (action === 'field-add' && groupId && questionnaireId) {
        openFieldModal(groupId, questionnaireId);
        return;
    }

    if (action === 'field-add') {
        if (!groupId) {
            setSurveyBuilderStatus('Mező hozzáadás nem indult: hiányzó csoport azonosító.');
            showErrorNoScroll('A mező hozzáadásához hiányzik a csoport azonosító.');
            return;
        }
        const fallbackGroup = getGroupById(groupId);
        const fallbackQuestionnaire = fallbackGroup ? getQuestionnairesForGroup(fallbackGroup)[0] : null;
        const fallbackQuestionnaireId = getQuestionnaireId(fallbackQuestionnaire);
        if (fallbackQuestionnaireId) {
            openFieldModal(groupId, fallbackQuestionnaireId);
            return;
        }
        setSurveyBuilderStatus('Mező hozzáadás nem indult: hiányzó kérdőív azonosító.');
        showErrorNoScroll('A mező hozzáadásához hiányzik a kérdőív azonosító.');
    }

    if (action === 'field-edit' && groupId && questionnaireId && fieldId) {
        const field = getFieldById(groupId, questionnaireId, fieldId);
        if (!field) {
            showError('A mező nem található.');
            return;
        }
        openFieldModal(groupId, questionnaireId, field);
        return;
    }

    if (action === 'field-delete' && questionnaireId && fieldId) {
        if (!confirm('Biztosan torlod a mezot?')) return;
        await deleteSurveyField(fieldId, questionnaireId);
        await loadSurveyBuilderData();
    }
}

function showSurveyTab(tab: 'editor' | 'responses'): void {
    const editor = tab === 'editor';
    surveyEditorView.classList.toggle('hidden', !editor);
    surveyResponsesView.classList.toggle('hidden', editor);
    surveyTabEditor.classList.toggle('active', editor);
    surveyTabResponses.classList.toggle('active', !editor);
}

function renderSurveyResponses(items: any[]): void {
    surveyResponsesBody.textContent = '';
    if (!Array.isArray(items) || items.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center py-8 text-gray-500">Nincs bekuldes.</td>';
        surveyResponsesBody.appendChild(row);
        return;
    }

    items.forEach((item: any) => {
        const tr = document.createElement('tr');
        const createdAt = item.created_at || item.created || item.timestamp;
        const createdText = createdAt ? new Date(createdAt).toLocaleString() : '-';
        const questionnaireId = item.questionnaire_id || item.questionnaire?.id || '-';
        const sessionId = item.session_id || '-';
        const emailStatus = item.admin_email_sent === true
            ? 'Admin email: igen'
            : item.admin_email_sent === false
                ? 'Admin email: nem'
                : 'Email statusz: -';

        tr.innerHTML = `
            <td>${createdText}</td>
            <td><code>${escapeText(questionnaireId)}</code></td>
            <td><code>${escapeText(sessionId)}</code></td>
            <td>${emailStatus}</td>
        `;
        surveyResponsesBody.appendChild(tr);
    });
}

async function loadSurveyResponses(): Promise<void> {
    surveyResponsesBody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-500">Bekuldesek betoltese...</td></tr>';
    try {
        const data = await listSurveyResponses(25, 0);
        const items = Array.isArray(data) ? data : (data.items || data.responses || []);
        renderSurveyResponses(items);
    } catch (err: any) {
        surveyResponsesBody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-error">Hiba tortent a betolteskor.</td></tr>';
        showError(err.message);
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
    tokenListContainer.innerHTML = '<p class="text-xs text-gray-400 italic">BetĂ¶ltĂ©s...</p>';
    try {
        const response = await apiCall('/admin/public-widget-tokens', { auth: true });
        const data = await response.json();
        const tokens = data.tokens || [];
        
        tokenListContainer.innerHTML = '';
        if (tokens.length === 0) {
            tokenListContainer.innerHTML = '<p class="text-xs text-gray-400">Nincs mĂ©g lĂ©trehozott token.</p>';
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
                            ${t.enabled ? 'AktĂ­v' : 'Tiltott'}
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
        if (!token) throw new Error('BejelentkezĂ©s szĂĽksĂ©ges');
        
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
        
        // ElrejtjĂĽk a kitĂ¶ltĹ‘ modalt
        createTokenModal.classList.add('hidden');
        createTokenForm.reset();

        // MegjelenĂ­tjĂĽk a sikeres modalt a titkos adatokkal
        modalTokenId.value = data.token_id;
        modalTokenSecret.value = data.token;
        
        // Meta adatok megjelenĂ­tĂ©se a modalban
        modalTokenMeta.innerHTML = `
            <p><strong>OriginĂ¶k:</strong> ${data.allowed_origins && data.allowed_origins.length > 0 ? data.allowed_origins.join(', ') : 'Nincs szĹ±rĂ©s'}</p>
            ${data.requests_per_minute ? `<p><strong>RPM:</strong> ${data.requests_per_minute}</p>` : ''}
            ${data.requests_per_hour ? `<p><strong>RPH:</strong> ${data.requests_per_hour}</p>` : ''}
            ${data.quota_per_hour ? `<p><strong>KvĂłta:</strong> ${data.quota_per_hour}</p>` : ''}
        `;
        
        tokenModal.classList.remove('hidden');
        
        loadWidgetTokens();
    } catch (err: any) {
        showError('Nem sikerĂĽlt a token lĂ©trehozĂˇsa: ' + err.message);
    }
}

function updateWidgetEmbedCode() {
    const baseUrl = currentApiBaseUrl;
    const token = widgetToken.value;
    const mode = widgetMode.value;
    
    if (!token) {
        widgetEmbedCode.textContent = 'VĂˇlasszon tokent a listĂˇbĂłl vagy Ă­rjon be egyet...';
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
    bubble.innerHTML = isOpen ? "Eli" : "âś•";
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

// --- AUTH UI VĂLTĂS ---
showRegisterBtn.addEventListener('click', () => {
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
});

showLoginBtn.addEventListener('click', () => {
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'none';
});

// --- TAB KEZELĂ‰S ---
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tab = (button as HTMLElement).dataset.tab;
        tabButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        panels.forEach(panel => panel.classList.add('hidden'));
        document.getElementById(`panel-${tab}`)?.classList.remove('hidden');
        
        if (tab === 'info') loadInfoList();
        if (tab === 'surveys') {
            showSurveyTab('editor');
            loadSurveySettings();
            loadSurveyBuilderData();
        }
        if (tab === 'chat-widget') loadWidgetTokens();
    });
});

// --- AUTH MODUL ---
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('button')!;
    btn.disabled = true;
    btn.textContent = 'KĂĽldĂ©s...';
    
    try {
        const username = (document.getElementById('register-username') as HTMLInputElement).value;
        const tenantId = (document.getElementById('register-tenant-id') as HTMLInputElement).value;
        const email = (document.getElementById('register-email') as HTMLInputElement).value;
        const password = (document.getElementById('register-password') as HTMLInputElement).value;
        const passwordConfirm = (document.getElementById('register-password-confirm') as HTMLInputElement).value;
        const acceptedTerms = (document.getElementById('register-terms') as HTMLInputElement).checked;

        if (password !== passwordConfirm) {
            throw new Error('A kĂ©t jelszĂł nem egyezik!');
        }

        await register(username, tenantId, email, password, passwordConfirm, acceptedTerms);
        alert('RegisztrĂˇciĂł elkĂĽldve â€“ nĂ©zd meg az emailt a megerĹ‘sĂ­tĹ‘ linkĂ©rt.');
        registerForm.reset();
        showLoginBtn.click();
    } catch (err: any) {
        showError(err.message, true);
    } finally {
        btn.disabled = false;
        btn.textContent = 'FiĂłk lĂ©trehozĂˇsa';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button')!;
    btn.disabled = true;
    btn.textContent = 'BelĂ©pĂ©s...';
    
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
        btn.textContent = 'BejelentkezĂ©s';
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
    loadingCell.textContent = 'BetĂ¶ltĂ©s...';
    loadingRow.appendChild(loadingCell);
    infoListBody.appendChild(loadingRow);

    try {
        if (!getToken()) return;
        const data = await listInfo();
        infoListBody.textContent = '';

        const items = Array.isArray(data) ? data : (data.items || []);
        
        if (items.length === 0) {
            loadingCell.textContent = 'MĂ©g nincs info elem â€“ adj hozzĂˇ Ăşjat.';
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
            deleteBtn.textContent = 'TĂ¶rlĂ©s';
            
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
        loadingCell.textContent = 'Hiba tĂ¶rtĂ©nt a betĂ¶ltĂ©skor.';
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
        if (confirm('Biztosan tĂ¶rli ezt az elemet?')) {
            try {
                await deleteInfo(id);
                loadInfoList();
            } catch (err: any) { showError(err.message); }
        }
    } else if (action === 'reindex') {
        try {
            await reindexInfo(id);
            alert('IndexelĂ©s elindĂ­tva.');
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
        
        infoFormLegend.textContent = 'Info elem szerkesztĂ©se';
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
    infoFormLegend.textContent = 'Ăšj elem lĂ©trehozĂˇsa';
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
    infoSaveBtn.textContent = 'MentĂ©s...';
    try {
        const res = await createInfo(infoTitle.value, infoDescription.value, infoContent.value, infoScope.value, infoIsActive.checked);
        alert('LĂ©trehozva!');
        resetInfoForm();
        loadInfoList();
        if (res.indexing_status !== 'INDEXED') {
            startPolling(res.id);
        }
    } catch (err: any) { showError(err.message); }
    finally {
        infoSaveBtn.disabled = false;
        infoSaveBtn.textContent = 'MentĂ©s';
    }
});

infoUpdateBtn.addEventListener('click', async () => {
    if (!currentInfoId) return;
    infoUpdateBtn.disabled = true;
    infoUpdateBtn.textContent = 'FrissĂ­tĂ©s...';
    try {
        await updateInfo(currentInfoId, infoTitle.value, infoDescription.value, infoContent.value, infoScope.value, infoIsActive.checked);
        alert('FrissĂ­tve!');
        resetInfoForm();
        loadInfoList();
        startPolling(currentInfoId);
    } catch (err: any) { showError(err.message); }
    finally {
        infoUpdateBtn.disabled = false;
        infoUpdateBtn.textContent = 'FrissĂ­tĂ©s';
    }
});

infoCrawlStartBtn.addEventListener('click', async () => {
    const raw = infoCrawlUrls.value.trim();
    if (!raw) {
        showError('Adj meg legalĂˇbb egy URL-t a web crawl indĂ­tĂˇsĂˇhoz.');
        return;
    }

    const urls = raw
        .split(/[\s,]+/)
        .map(u => u.trim())
        .filter(Boolean);

    const depth = Math.min(10, Math.max(1, Number(infoCrawlDepth.value) || 2));
    const maxPages = Math.min(2000, Math.max(1, Number(infoCrawlMaxPages.value) || 50));
    const scope = infoCrawlScope.value === 'internal' ? 'internal' : 'public';

    const payload: any = { depth, max_pages: maxPages, scope };
    if (urls.length > 1) {
        payload.urls = urls;
    } else {
        payload.url = urls[0];
    }

    infoCrawlEvents.innerHTML = '<p class="muted small">Crawl indĂ­tĂˇsa...</p>';
    infoCrawlStatusText.textContent = 'Web crawl indĂ­tĂˇsa folyamatban...';

    try {
        const result = await startInfoWebCrawl(payload);
        currentCrawlJobId = result.job_id;
        infoCrawlJobId.textContent = result.job_id || '-';
        infoCrawlStatusText.textContent = result.message || 'Web crawl elindĂ­tva.';
        setCrawlRunningState();
        await refreshWebCrawlStatus();
        startCrawlPolling();
    } catch (err: any) {
        setCrawlIdleState();
        showError(`Nem sikerĂĽlt elindĂ­tani a web crawl folyamatot: ${err.message}`);
    }
});

infoCrawlCancelBtn.addEventListener('click', async () => {
    if (!currentCrawlJobId) return;
    infoCrawlCancelBtn.disabled = true;

    try {
        const result = await cancelInfoWebCrawl(currentCrawlJobId);
        infoCrawlStatusText.textContent = result.message || 'MegszakĂ­tĂˇs kĂ©rve.';
        await refreshWebCrawlStatus();
    } catch (err: any) {
        showError(`Nem sikerĂĽlt megszakĂ­tani a crawl folyamatot: ${err.message}`);
    } finally {
        infoCrawlCancelBtn.disabled = false;
    }
});

surveySettingsLoadBtn.addEventListener('click', () => {
    loadSurveySettings();
});

surveySettingsSaveBtn.addEventListener('click', () => {
    saveSurveySettings();
});

surveyResponsesRefreshBtn.addEventListener('click', () => {
    loadSurveyResponses();
});

surveyGroupCreateBtn.addEventListener('click', () => {
    saveSurveyGroup();
});

surveyGroupOpenBtn.addEventListener('click', () => {
    openSurveyGroupPanel();
});

surveyGroupCancelBtn.addEventListener('click', () => {
    closeSurveyGroupPanel();
});

surveyQuestionnaireCancelBtn.addEventListener('click', () => {
    closeQuestionnaireModal();
});

surveyQuestionnaireSaveBtn.addEventListener('click', () => {
    saveQuestionnaireFromModal();
});

surveyFieldCancelBtn.addEventListener('click', () => {
    closeFieldModal();
});

surveyFieldSaveBtn.addEventListener('click', () => {
    saveFieldFromModal();
});

surveyFieldType.addEventListener('change', () => {
    updateFieldOptionsVisibility();
});

surveyQuestionnaireModal.addEventListener('click', (e) => {
    if (e.target === surveyQuestionnaireModal) closeQuestionnaireModal();
});

surveyFieldModal.addEventListener('click', (e) => {
    if (e.target === surveyFieldModal) closeFieldModal();
});

surveyGroupsContainer.addEventListener('click', (e) => {
    const rawTarget = e.target as HTMLElement;
    const actionTarget = rawTarget?.closest?.('[data-action]') as HTMLElement | null;
    if (!actionTarget?.dataset?.action) return;
    e.preventDefault();
    e.stopPropagation();
    handleSurveyEditorAction(actionTarget).catch((err: any) => {
        const msg = err?.message || 'Ismeretlen hiba a kérdőív műveletben.';
        setSurveyBuilderStatus(`Hiba: ${msg}`);
        showErrorNoScroll(msg);
    });
});

surveyTabEditor.addEventListener('click', () => {
    showSurveyTab('editor');
});

surveyTabResponses.addEventListener('click', () => {
    showSurveyTab('responses');
    loadSurveyResponses();
});

async function startPolling(id: string) {
    infoStatusText.textContent = 'IndexelĂ©s folyamatban...';
    const ok = await pollIndexing(id);
    infoStatusText.textContent = ok ? 'IndexelĂ©s kĂ©sz.' : 'IndexelĂ©s idĹ‘tĂşllĂ©pĂ©s.';
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
        addChatMessage(chatIntResponseArea, 'ai', { text: `Hiba tĂ¶rtĂ©nt: ${err.message}` });
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
    btn.textContent = 'LĂ©trehozĂˇs...';

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
    btn.textContent = 'Token LĂ©trehozĂˇsa';
});

widgetMode.addEventListener('change', () => {
    const mode = widgetMode.value;
    if (mode === 'public-chat') {
        widgetToken.placeholder = 'Titkos token megadĂˇsa (public_widget_token)';
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
        showError('HiĂˇnyzĂł adatok: kĂ©rdĂ©s vagy token.');
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
        addChatMessage(widgetResponseArea, 'ai', { text: `Hiba tĂ¶rtĂ©nt: ${err.message}` });
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
            sourcesDiv.innerHTML = `<strong>ForrĂˇsok:</strong> ` + data.sources.map((s: any) => s.title || s.id).join(', ');
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
    closeSurveyGroupPanel();
    closeQuestionnaireModal();
    closeFieldModal();
    updateFieldOptionsVisibility();
    showSurveyTab('editor');
    initWidgetConfig();
    updateJwtStatus();
});
