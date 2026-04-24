import { apiCall } from './api.js';

interface SurveySettings {
    info_surveys_enabled: boolean;
    survey_notification_email: string | null;
}

async function postWithPayloadVariants(path: string, payloads: any[]): Promise<any> {
    let lastError: any = null;
    for (const payload of payloads) {
        try {
            const response = await apiCall(path, {
                method: 'POST',
                auth: true,
                body: payload,
            });
            return response.json();
        } catch (err: any) {
            lastError = err;
            if (err?.status !== 400 && err?.status !== 422) {
                throw err;
            }
        }
    }
    throw lastError || new Error('A kérés feldolgozása sikertelen.');
}

async function getSurveySettings(): Promise<SurveySettings> {
    const response = await apiCall('/admin/survey/settings', { method: 'GET', auth: true });
    return response.json();
}

async function updateSurveySettings(payload: SurveySettings): Promise<SurveySettings> {
    const response = await apiCall('/admin/survey/settings', {
        method: 'PUT',
        auth: true,
        body: payload,
    });
    return response.json();
}

async function listSurveyResponses(limit: number = 25, offset: number = 0): Promise<any> {
    const response = await apiCall(`/admin/survey/responses?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        auth: true,
    });
    return response.json();
}

async function listSurveyGroups(): Promise<any> {
    const response = await apiCall('/admin/survey/groups', { method: 'GET', auth: true });
    return response.json();
}

async function createSurveyGroup(payload: {
    title: string;
    user_description?: string;
    llm_description?: string;
    is_active?: boolean;
    sort_order?: number;
}): Promise<any> {
    return postWithPayloadVariants('/admin/survey/groups', [
        payload,
        {
            title: payload.title,
            user_description: payload.user_description,
            llm_description: payload.llm_description,
            active: payload.is_active,
            sort_order: payload.sort_order,
        },
        {
            name: payload.title,
            user_description: payload.user_description,
            llm_description: payload.llm_description,
            is_active: payload.is_active,
            sort_order: payload.sort_order,
        },
    ]);
}

async function updateSurveyGroup(
    groupId: string,
    payload: {
        title: string;
        user_description?: string;
        llm_description?: string;
        is_active?: boolean;
        sort_order?: number;
    }
): Promise<any> {
    let lastError: any = null;
    const variants = [
        payload,
        {
            title: payload.title,
            user_description: payload.user_description,
            llm_description: payload.llm_description,
            active: payload.is_active,
            sort_order: payload.sort_order,
        },
        {
            name: payload.title,
            user_description: payload.user_description,
            llm_description: payload.llm_description,
            is_active: payload.is_active,
            sort_order: payload.sort_order,
        },
    ];

    for (const body of variants) {
        try {
            const response = await apiCall(`/admin/survey/groups/${groupId}`, {
                method: 'PUT',
                auth: true,
                body,
            });
            return response.json();
        } catch (err: any) {
            lastError = err;
            if (err?.status !== 400 && err?.status !== 422) throw err;
        }
    }
    throw lastError || new Error('A csoport frissítése sikertelen.');
}

async function deleteSurveyGroup(groupId: string): Promise<any> {
    const response = await apiCall(`/admin/survey/groups/${groupId}`, {
        method: 'DELETE',
        auth: true,
    });
    return response.json();
}

async function createSurveyQuestionnaire(payload: {
    group_id: string;
    title: string;
    is_active?: boolean;
    sort_order?: number;
}): Promise<any> {
    return postWithPayloadVariants('/admin/survey/questionnaires', [
        payload,
        {
            group_id: payload.group_id,
            name: payload.title,
            is_active: payload.is_active,
            sort_order: payload.sort_order,
        },
        {
            group_id: payload.group_id,
            title: payload.title,
            active: payload.is_active,
            sort_order: payload.sort_order,
        },
    ]);
}

async function updateSurveyQuestionnaire(
    questionnaireId: string,
    payload: {
        group_id?: string;
        title: string;
        is_active?: boolean;
        sort_order?: number;
    }
): Promise<any> {
    let lastError: any = null;
    const variants = [
        payload,
        {
            group_id: payload.group_id,
            name: payload.title,
            is_active: payload.is_active,
            sort_order: payload.sort_order,
        },
        {
            group_id: payload.group_id,
            title: payload.title,
            active: payload.is_active,
            sort_order: payload.sort_order,
        },
    ];

    for (const body of variants) {
        try {
            const response = await apiCall(`/admin/survey/questionnaires/${questionnaireId}`, {
                method: 'PUT',
                auth: true,
                body,
            });
            return response.json();
        } catch (err: any) {
            lastError = err;
            if (err?.status !== 400 && err?.status !== 422) {
                throw err;
            }
        }
    }
    throw lastError || new Error('A kérdőív frissítése sikertelen.');
}

async function deleteSurveyQuestionnaire(questionnaireId: string): Promise<any> {
    const response = await apiCall(`/admin/survey/questionnaires/${questionnaireId}`, {
        method: 'DELETE',
        auth: true,
    });
    return response.json();
}

async function createSurveyField(
    questionnaireId: string,
    payload: {
        field_type: 'email' | 'boolean' | 'checkbox' | 'text';
        label: string;
        is_required?: boolean;
        sort_order?: number;
        options?: string[];
    }
): Promise<any> {
    const cleanedOptions = Array.isArray(payload.options)
        ? payload.options.map((option) => String(option).trim()).filter(Boolean)
        : [];
    const optionsPayload = payload.field_type === 'checkbox' ? cleanedOptions : undefined;

    const variants = [
        {
            ...payload,
            options: optionsPayload,
        },
        {
            type: payload.field_type,
            label: payload.label,
            required: payload.is_required,
            sort_order: payload.sort_order,
            options: optionsPayload,
        },
        {
            field_type: payload.field_type,
            title: payload.label,
            is_required: payload.is_required,
            sort_order: payload.sort_order,
            checkbox_options: optionsPayload,
        },
        {
            kind: payload.field_type,
            label: payload.label,
            is_required: payload.is_required,
            position: payload.sort_order,
            choices: optionsPayload,
        },
    ];

    try {
        return await postWithPayloadVariants(`/admin/survey/questionnaires/${questionnaireId}/fields`, variants);
    } catch (err: any) {
        if (err?.status !== 404) throw err;
        return postWithPayloadVariants('/admin/survey/fields', variants.map((body) => ({
            questionnaire_id: questionnaireId,
            ...body,
        })));
    }
}

async function updateSurveyField(
    fieldId: string,
    questionnaireId: string,
    payload: {
        field_type: 'email' | 'boolean' | 'checkbox' | 'text';
        label: string;
        is_required?: boolean;
        sort_order?: number;
        options?: string[];
    }
): Promise<any> {
    const cleanedOptions = Array.isArray(payload.options)
        ? payload.options.map((option) => String(option).trim()).filter(Boolean)
        : [];
    const optionsPayload = payload.field_type === 'checkbox' ? cleanedOptions : undefined;

    let lastError: any = null;
    const variants = [
        {
            field_type: payload.field_type,
            label: payload.label,
            is_required: payload.is_required,
            sort_order: payload.sort_order,
            options: optionsPayload,
        },
        {
            type: payload.field_type,
            label: payload.label,
            required: payload.is_required,
            sort_order: payload.sort_order,
            options: optionsPayload,
        },
        {
            field_type: payload.field_type,
            title: payload.label,
            is_required: payload.is_required,
            sort_order: payload.sort_order,
            checkbox_options: optionsPayload,
        },
    ];

    for (const body of variants) {
        try {
            const response = await apiCall(`/admin/survey/fields/${fieldId}?questionnaire_id=${encodeURIComponent(questionnaireId)}`, {
                method: 'PUT',
                auth: true,
                body,
            });
            return response.json();
        } catch (err: any) {
            lastError = err;
            if (err?.status !== 400 && err?.status !== 404 && err?.status !== 422) {
                throw err;
            }
        }
    }

    throw lastError || new Error('A mező frissítése sikertelen.');
}

async function deleteSurveyField(fieldId: string, questionnaireId: string): Promise<any> {
    try {
        const response = await apiCall(`/admin/survey/fields/${fieldId}?questionnaire_id=${encodeURIComponent(questionnaireId)}`, {
            method: 'DELETE',
            auth: true,
        });
        return response.json();
    } catch (err: any) {
        if (err?.status === 404) {
            const response = await apiCall(`/admin/survey/fields/${fieldId}`, {
                method: 'DELETE',
                auth: true,
                body: { questionnaire_id: questionnaireId },
            });
            return response.json();
        }
        throw err;
    }
}

export {
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
};
