// Chat widget modul: sendInfoQuestion public_widget_token-nel

import { apiCall } from './api.js';

async function sendInfoQuestion(text: string, sessionId: string, token: string, mode: 'widget-chat' | 'public-chat'): Promise<any> {
    if (mode === 'widget-chat') {
        // Standard widget chat (uses token_id)
        const response = await apiCall('/widget/chat', {
            method: 'POST',
            body: {
                token_id: token,
                session_id: sessionId,
                text: '/info ' + text,
            },
        });
        return response.json();
    } else {
        // Public chat (uses public_widget_token)
        const response = await apiCall('/chat', {
            method: 'POST',
            body: {
                channel: 'public',
                session_id: sessionId,
                public_widget_token: token,
                text: '/info ' + text,
            },
        });
        return response.json();
    }
}

export { sendInfoQuestion };
