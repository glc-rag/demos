/**
 * Fő beviteli pont - Facebook B2B Comments SPA
 */

import { setToken, removeToken, getToken, apiCall } from './api';
import { appendRetrievalDiagnosticHint, stringifyApiDetail } from './apiErrors';
import { listProfiles, getProfile, createProfile, updateProfile, deleteProfile, listComments, sendReply as sendReplyApi } from './fbAdmin';

// DOM elemek
const tabBtns = document.querySelectorAll('.tab-btn') as NodeListOf<HTMLButtonElement>;
const tabPanels = document.querySelectorAll('.tab-panel') as NodeListOf<HTMLDivElement>;
const globalError = document.getElementById('global-error') as HTMLDivElement;
const authStatusEl = document.getElementById('auth-status') as HTMLSpanElement;

// Auth elemek
const btnRegister = document.getElementById('btn-register') as HTMLButtonElement;
const btnLogin = document.getElementById('btn-login') as HTMLButtonElement;
const btnLogout = document.getElementById('btn-logout') as HTMLButtonElement;
const regEmail = document.getElementById('reg-email') as HTMLInputElement;
const regPassword = document.getElementById('reg-password') as HTMLInputElement;
const regTerms = document.getElementById('reg-terms') as HTMLInputElement;
const legalLink = document.getElementById('legal-link') as HTMLAnchorElement;
const loginUserId = document.getElementById('login-user-id') as HTMLInputElement;
const loginTenantId = document.getElementById('login-tenant-id') as HTMLInputElement;
const loginPassword = document.getElementById('login-password') as HTMLInputElement;

// Auth form elemek
const formAuthRegister = document.getElementById('form-auth-register') as HTMLFormElement;
const formAuthLogin = document.getElementById('form-auth-login') as HTMLFormElement;
const authLoginForm = document.getElementById('auth-login') as HTMLDivElement;
const authRegisterForm = document.getElementById('auth-register') as HTMLDivElement;
const authTabBtns = document.querySelectorAll('.auth-tab-btn') as NodeListOf<HTMLButtonElement>;

// Facebook Profile elemek
const btnNewProfile = document.getElementById('btn-new-profile') as HTMLButtonElement;
const btnPollProfiles = document.getElementById('btn-poll-profiles') as HTMLButtonElement;
const profilesTable = document.getElementById('profiles-table') as HTMLTableElement;
const profileFormCard = document.getElementById('profile-form-card') as HTMLDivElement;
const profileFormLegend = document.getElementById('profile-form-legend') as HTMLLegendElement;
const profileId = document.getElementById('profile-id') as HTMLInputElement;
const profileFbPageId = document.getElementById('profile-fb-page-id') as HTMLInputElement;
const profileName = document.getElementById('profile-name') as HTMLInputElement;
const profileEnabled = document.getElementById('profile-enabled') as HTMLInputElement;
const replyModeGroup = document.getElementById('reply-mode-group') as HTMLDivElement;
const profileReplyMode = document.getElementById('profile-reply-mode') as HTMLSelectElement;
const btnSaveProfile = document.getElementById('btn-save-profile') as HTMLButtonElement;
const btnCancelProfile = document.getElementById('btn-cancel-profile') as HTMLButtonElement;
const profileIdSelect = document.getElementById('profile-id-select') as HTMLSelectElement;

// Comment elemek
const commentStatus = document.getElementById('comment-status') as HTMLSelectElement;
const pageSize = document.getElementById('page-size') as HTMLSelectElement;
const btnListComments = document.getElementById('btn-list-comments') as HTMLButtonElement;
const commentsTable = document.getElementById('comments-table') as HTMLTableElement;
const sendReplyCard = document.getElementById('send-reply-card') as HTMLDivElement;
const sendCommentId = document.getElementById('send-comment-id') as HTMLInputElement;
const sendReplyInput = document.getElementById('send-reply') as HTMLTextAreaElement;
const btnSendReply = document.getElementById('btn-send-reply') as HTMLButtonElement;
const btnCancelSend = document.getElementById('btn-cancel-send') as HTMLButtonElement;
const btnLogoutDashboard = document.getElementById('btn-logout-dashboard') as HTMLButtonElement;

// Legal URL
const legalUrl = (import.meta as any).env.VITE_LEGAL_URL || '#';

// Auth form váltás
authTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const authTabId = (btn as HTMLElement).dataset.authTab;
    
    authTabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    
    authLoginForm.classList.remove('active');
    authRegisterForm.classList.remove('active');
    
    if (authTabId === 'login') {
      authLoginForm.classList.add('active');
    } else {
      authRegisterForm.classList.add('active');
    }
  });
});

// Form mezők
const profileFbPageIdInput = document.getElementById('profile-fb-page-id') as HTMLInputElement;
const profileNameInput = document.getElementById('profile-name') as HTMLInputElement;
const sendReplyInputField = document.getElementById('send-reply') as HTMLTextAreaElement;

// Dashboard panel megjelenítése bejelentkezés után
function showDashboard() {
  const dashboardPanel = document.getElementById('panel-dashboard') as HTMLDivElement;
  const authPanel = document.getElementById('panel-auth') as HTMLDivElement;
  
  if (dashboardPanel) {
    dashboardPanel.hidden = false;
    dashboardPanel.classList.add('active');
  }
  
  // Hide the auth panel
  if (authPanel) {
    authPanel.hidden = true;
    authPanel.classList.remove('active');
  }
}

// Auth panel (mindig látható)
const authPanel = document.getElementById('panel-auth') as HTMLDivElement;
if (authPanel) {
  authPanel.hidden = false;
}

// Dashboard panel (csak bejelentkezve látható)
const dashboardPanel = document.getElementById('panel-dashboard') as HTMLDivElement;

// Form mező validáció és fókusz kezelés
function validateField(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, required: boolean = true): boolean {
  const isValid = required ? input.value.trim().length > 0 : true;
  
  if (isValid) {
    input.classList.remove('invalid');
  } else {
    input.classList.add('invalid');
  }
  
  return isValid;
}

function handleFormFocus(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  input.classList.remove('invalid');
}

// Regisztráció form mezők validálása
regEmail.addEventListener('blur', () => validateField(regEmail, true));
regEmail.addEventListener('focus', () => handleFormFocus(regEmail));
regPassword.addEventListener('blur', () => validateField(regPassword, true));
regPassword.addEventListener('focus', () => handleFormFocus(regPassword));

// Bejelentkezés form mezők validálása
loginUserId.addEventListener('blur', () => validateField(loginUserId, true));
loginUserId.addEventListener('focus', () => handleFormFocus(loginUserId));
loginTenantId.addEventListener('blur', () => validateField(loginTenantId, true));
loginTenantId.addEventListener('focus', () => handleFormFocus(loginTenantId));
loginPassword.addEventListener('blur', () => validateField(loginPassword, true));
loginPassword.addEventListener('focus', () => handleFormFocus(loginPassword));

// Profil form mezők validálása
profileFbPageIdInput.addEventListener('blur', () => validateField(profileFbPageIdInput, true));
profileFbPageIdInput.addEventListener('focus', () => handleFormFocus(profileFbPageIdInput));
profileNameInput.addEventListener('blur', () => validateField(profileNameInput, true));
profileNameInput.addEventListener('focus', () => handleFormFocus(profileNameInput));

// Válasz szöveg mező validálása
sendReplyInputField.addEventListener('blur', () => validateField(sendReplyInputField, true));
sendReplyInputField.addEventListener('focus', () => handleFormFocus(sendReplyInputField));

// Auth form mezők validálása
loginUserId.addEventListener('blur', () => validateField(loginUserId, true));
loginUserId.addEventListener('focus', () => handleFormFocus(loginUserId));
loginTenantId.addEventListener('blur', () => validateField(loginTenantId, true));
loginTenantId.addEventListener('focus', () => handleFormFocus(loginTenantId));
loginPassword.addEventListener('blur', () => validateField(loginPassword, true));
loginPassword.addEventListener('focus', () => handleFormFocus(loginPassword));
regEmail.addEventListener('blur', () => validateField(regEmail, true));
regEmail.addEventListener('focus', () => handleFormFocus(regEmail));
regPassword.addEventListener('blur', () => validateField(regPassword, true));
regPassword.addEventListener('focus', () => handleFormFocus(regPassword));

// Profil form mezők validálása
profileFbPageIdInput.addEventListener('blur', () => validateField(profileFbPageIdInput, true));
profileFbPageIdInput.addEventListener('focus', () => handleFormFocus(profileFbPageIdInput));
profileNameInput.addEventListener('blur', () => validateField(profileNameInput, true));
profileNameInput.addEventListener('focus', () => handleFormFocus(profileNameInput));

// API Base URL lekérése - COMMENTED OUT - nem proxizzuk a glc-rag.hu-t
// async function loadWidgetConfig() {
//   try {
//     const response = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL}/widget/config`);
//     if (response.ok) {
//       const config = await response.json();
//       if (config.api_base_url) {
//         apiBaseUrlEl.textContent = config.api_base_url;
//       }
//     }
//   } catch (error) {
//     console.error('Widget config hiba:', error);
//   }
// }

// Auth státusz frissítése
function updateAuthStatus() {
  const token = getToken();
  if (token) {
    authStatusEl.textContent = 'JWT: bejelentkezve';
    authStatusEl.style.color = '#059669';
    btnLogout.disabled = false;
    btnNewProfile.disabled = false;
    btnPollProfiles.disabled = false;
    btnListComments.disabled = false;
    btnSendReply.disabled = false;
  } else {
    authStatusEl.textContent = 'JWT: nincs token';
    authStatusEl.style.color = '#dc2626';
    btnLogout.disabled = true;
    btnNewProfile.disabled = true;
    btnPollProfiles.disabled = true;
    btnListComments.disabled = true;
    btnSendReply.disabled = true;
  }
}

// Regisztráció (<form> + submit — DOM: jelszómező formban legyen)
formAuthRegister?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Validáció
  const emailValid = validateField(regEmail, true);
  const passwordValid = validateField(regPassword, true);
  const termsValid = regTerms.checked;
  
  if (!emailValid || !passwordValid || !termsValid) {
    showError('Kérjük, töltsd ki az összes mezőt és fogadd el az adatvédelmi szabályzatot.');
    return;
  }

  btnRegister.disabled = true;
  btnRegister.textContent = 'Küldés...';

  try {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: { email: regEmail.value, password: regPassword.value },
    });

    if (!response.ok) {
      const error = await parseError(response);
      throw error || new Error('Regisztráció sikertelen');
    }

    showError('Regisztráció sikeres! Most már bejelentkezhetsz.');
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Regisztráció sikertelen');
  } finally {
    btnRegister.disabled = false;
    btnRegister.textContent = 'Regisztráció';
  }
});

// Bejelentkezés
formAuthLogin?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Validáció
  const userIdValid = validateField(loginUserId, true);
  const tenantIdValid = validateField(loginTenantId, true);
  const passwordValid = validateField(loginPassword, true);
  
  if (!userIdValid || !tenantIdValid || !passwordValid) {
    showError('Kérjük, töltsd ki az összes mezőt.');
    return;
  }

  btnLogin.disabled = true;
  btnLogin.textContent = 'Betöltés...';

  try {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: {
        user_id: loginUserId.value,
        tenant_id: loginTenantId.value,
        password: loginPassword.value,
      },
    });

    if (!response.ok) {
      const error = await parseError(response);
      throw error || new Error('Bejelentkezés sikertelen');
    }

    const data = await response.json();
    if (data.access_token) {
      setToken(data.access_token);
      updateAuthStatus();
      showError('Bejelentkezés sikeres!');
      // Hard refresh to ensure dashboard panel loads properly
      window.location.reload();
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Bejelentkezés sikertelen');
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = 'Bejelentkezés';
  }
});

// Kijelentkezés
function doLogout() {
  removeToken();
  updateAuthStatus();
  showError('Kijelentkezés sikeres!');
  
  // Hide the dashboard panel
  if (dashboardPanel) {
    dashboardPanel.hidden = true;
    dashboardPanel.classList.remove('active');
  }
  
  // Show the auth panel
  if (authPanel) {
    authPanel.hidden = false;
    authPanel.classList.add('active');
  }
  
  // Reset the auth forms
  authLoginForm.classList.add('active');
  authRegisterForm.classList.remove('active');
  authTabBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  authTabBtns[0].classList.add('active');
  authTabBtns[0].setAttribute('aria-selected', 'true');
}

// Kijelentkezés (auth panel)
btnLogout.addEventListener('click', () => {
  doLogout();
});

// Kijelentkezés (dashboard panel)
if (btnLogoutDashboard) {
  btnLogoutDashboard.addEventListener('click', () => {
    doLogout();
  });
}

// Legal link
legalLink.href = legalUrl;

// Új Facebook profil
btnNewProfile.addEventListener('click', () => {
  profileFormCard.hidden = false;
  profileFormLegend.textContent = 'Új Facebook profil';
  profileId.value = '';
  profileFbPageId.value = '';
  profileName.value = '';
  profileEnabled.checked = true;
  replyModeGroup.hidden = true;
  profileReplyMode.value = 'auto';
  btnSaveProfile.textContent = 'Létrehozás';
  btnSaveProfile.classList.remove('btn-secondary');
  btnSaveProfile.classList.add('btn-primary');
});

// Profile form cancel
btnCancelProfile.addEventListener('click', () => {
  profileFormCard.hidden = true;
});

// Profile mentés
btnSaveProfile.addEventListener('click', async () => {
  // Validáció
  const fbPageIdValid = validateField(profileFbPageIdInput, true);
  const nameValid = validateField(profileNameInput, true);
  
  if (!fbPageIdValid || !nameValid) {
    showError('Kérjük, töltsd ki a Facebook Page ID és a név mezőket.');
    return;
  }

  const isEdit = profileId.value !== '';
  const saveBtn = btnSaveProfile;
  saveBtn.disabled = true;
  saveBtn.textContent = isEdit ? 'Mentés...' : 'Létrehozás...';

  try {
    if (isEdit) {
      await updateProfile(profileId.value, profileFbPageId.value, profileName.value, profileEnabled.checked, profileReplyMode.value as 'auto' | 'manual');
      showError('Facebook profil frissítve!');
    } else {
      await createProfile(profileFbPageId.value, profileName.value, profileEnabled.checked);
      showError('Facebook profil létrehozva!');
    }

    // Lista frissítése
    await refreshProfiles();
    profileFormCard.hidden = true;
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Hiba a mentés során');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = isEdit ? 'Frissítés' : 'Mentés';
  }
});

// Profil lista frissítése
async function refreshProfiles() {
  try {
    const items = await listProfiles();
    renderProfilesTable(items);
    renderProfileSelect(items);
  } catch (error) {
    console.error('Profil lista hiba:', error);
  }
}

// Profil táblázat renderelése
function renderProfilesTable(items: any[]) {
  const tbody = profilesTable.querySelector('tbody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Még nincs Facebook profil – adj hozzá újat.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr>
      <td>${escapeHtml(item.id)}</td>
      <td>${escapeHtml(item.fb_page_id)}</td>
      <td>${escapeHtml(item.name)}</td>
      <td><span class="status-badge ${item.enabled ? 'status-posted' : 'status-failed_manual'}">${item.enabled ? 'Aktív' : 'Inaktív'}</span></td>
      <td>
        <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="editProfile('${item.id}')">Szerkeszt</button>
        <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteProfile('${item.id}')">Törlés</button>
      </td>
    </tr>
  `).join('');
}

// Profil select renderelése
function renderProfileSelect(items: any[]) {
  if (!profileIdSelect) return;
  profileIdSelect.innerHTML = items.map(item => `
    <option value="${item.id}">${escapeHtml(item.name)} (${escapeHtml(item.fb_page_id)})</option>
  `).join('');
}

// Profil szerkesztés
(window as any).editProfile = async function(id: string) {
  try {
    const item = await getProfile(id);
    if (!item) {
      showError('A profil nem található.');
      return;
    }

    profileFormCard.hidden = false;
    profileFormLegend.textContent = 'Facebook profil szerkesztése';
    profileId.value = item.id;
    profileFbPageId.value = item.fb_page_id;
    profileName.value = item.name;
    profileEnabled.checked = item.enabled;
    replyModeGroup.hidden = false;
    profileReplyMode.value = item.reply_mode;
    btnSaveProfile.textContent = 'Frissítés';
    btnSaveProfile.classList.remove('btn-primary');
    btnSaveProfile.classList.add('btn-secondary');
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Hiba a betöltés során');
  }
};

// Profil törlés
(window as any).deleteProfile = async function(id: string) {
  if (!confirm('Biztosan törölni szeretnéd ezt a profilt?')) return;

  try {
    await deleteProfile(id);
    showError('Facebook profil törölve.');
    await refreshProfiles();
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Hiba a törlés során');
  }
};

// Profilok polling
btnPollProfiles.addEventListener('click', async () => {
  await refreshProfiles();
});

// Komment listázás
btnListComments.addEventListener('click', async () => {
  const profileId = profileIdSelect.value;
  console.log('Komment listázás:', { profileId, status: commentStatus.value, pageSize: pageSize.value });
  if (!profileId) {
    showError('Kérjük, válassz egy Facebook profilt.');
    return;
  }

  const status = commentStatus.value;
  const page_size = parseInt(pageSize.value);

  btnListComments.disabled = true;
  btnListComments.textContent = 'Betöltés...';
  commentsTable.innerHTML = '<tr><td colspan="7" class="empty-state">Betöltés...</td></tr>';

  try {
    const items = await listComments(profileId, 1, page_size, status);
    console.log('Kommentek:', items);
    renderCommentsTable(items);
  } catch (error) {
    console.error('Kommentek betöltése hiba:', error);
    showError(error instanceof Error ? error.message : 'Hiba történt a betöltés során');
    commentsTable.innerHTML = '<tr><td colspan="7" class="empty-state">Hiba történt a betöltés során.</td></tr>';
  } finally {
    btnListComments.disabled = false;
    btnListComments.textContent = 'Listázás';
  }
});

// Komment táblázat renderelése
function renderCommentsTable(items: any[]) {
  const tbody = commentsTable.querySelector('tbody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nincs komment.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr>
      <td>${escapeHtml(item.id)}</td>
      <td>${escapeHtml(item.fb_comment_id)}</td>
      <td>${escapeHtml(item.fb_post_id)}</td>
      <td>${escapeHtml(item.original_message.substring(0, 100))}${item.original_message.length > 100 ? '...' : ''}</td>
      <td>${escapeHtml(item.our_reply || '-')}</td>
      <td><span class="status-badge status-${item.status.toLowerCase().replace('_', '_')}">${item.status}</span></td>
      <td>
        ${item.status === 'pending_approval' || item.status === 'failed_manual' ? `
          <button class="btn btn-primary" style="padding: 4px 8px; font-size: 12px;" onclick="openSendReply('${item.id}', '${escapeHtml(item.our_reply || '')}')">Válasz küldése</button>
        ` : ''}
      </td>
    </tr>
  `).join('');
}

// Válasz küldés form megnyitása
(window as any).openSendReply = function(commentId: string, currentReply: string) {
  sendReplyCard.hidden = false;
  sendCommentId.value = commentId;
  sendReplyInput.value = currentReply;
  sendReplyInputField.focus();
};

// Válasz küldés form cancel
btnCancelSend.addEventListener('click', () => {
  sendReplyCard.hidden = true;
});

// Válasz küldése Facebookra
btnSendReply.addEventListener('click', async () => {
  const commentId = sendCommentId.value;
  const reply = sendReplyInput.value.trim();
  
  // Validáció
  const replyValid = validateField(sendReplyInputField, true);
  
  if (!commentId || !replyValid) {
    showError('Kérjük, válassz egy kommentet és írd be a választ.');
    return;
  }

  const btn = btnSendReply;
  btn.disabled = true;
  btn.textContent = 'Küldés...';

  try {
    await sendReplyApi(profileIdSelect.value, sendCommentId.value, reply);
    showError('Válasz elküldve Facebookra!');
    sendReplyCard.hidden = true;
    await refreshComments();
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Hiba a küldés során');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Válasz küldése Facebookra';
  }
});

// Kommentek refresh
async function refreshComments() {
  const profileId = profileIdSelect.value;
  if (!profileId) return;
  console.log('Kommentek refresh:', { profileId, status: commentStatus.value, pageSize: pageSize.value });
  await listComments(profileId, 1, parseInt(pageSize.value), commentStatus.value);
}

// Hiba megjelenítése
async function showError(message: string) {
  globalError.textContent = message;
  globalError.hidden = false;
  const ms = message.length > 240 ? 25000 : 5000;
  setTimeout(() => {
    globalError.hidden = true;
  }, ms);
}

// Hiba parsolása
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
      const detailStr = stringifyApiDetail((data as any).detail) || 'Ismeretlen hiba';
      return new Error(appendRetrievalDiagnosticHint(detailStr));
    } catch {
      return new Error('Hibás válasz formátum');
    }
  }

  return null;
}

// HTML escape
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Indítás
// loadWidgetConfig(); // COMMENTED OUT - nem proxizzuk a glc-rag.hu-t
updateAuthStatus();

// Ha be van jelentkezve, mutassuk a dashboardot
if (getToken()) {
  showDashboard();
}

refreshProfiles();