// Chat internal modul: sendInfoQuestion JWT-vel

import { apiCall } from './api.js';

async function sendInfoQuestion(text: string): Promise<any> {
    const response = await apiCall('/chat', {
        method: 'POST',
        auth: true,
        body: {
            channel: 'internal',
            session_id: crypto.randomUUID(),
            text: '/info ' + text,
        },
    });
    return response.json();
}

export { sendInfoQuestion };
