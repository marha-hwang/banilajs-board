import { $, createElement } from '../utils/utils.js';
import { api } from '../api/api.js';

const $chatForm = $('#chat-form');
const $chatInput = $('#chat-input');
const $chatMessages = $('#chat-messages');

$chatForm.addEventListener('submit', handleSendMessage);

async function handleSendMessage(e) {
    e.preventDefault();
    const message = $chatInput.value.trim();
    if (!message) return;

    // Add User Message
    addMessage(message, 'user');
    $chatInput.value = '';

    // Add AI Placeholder
    const $aiMessageContent = addMessage('...', 'ai');

    try {
        const reader = await api.chatStream(message);
        const decoder = new TextDecoder();
        let aiResponse = '';
        $aiMessageContent.textContent = ''; // Clear placeholder

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            // The chunk might be JSON or raw text depending on how the backend streams.
            // Spec says "Chat Stream" returns 200.
            // Usually streaming endpoints return chunks of text or SSE.
            // Let's assume raw text for now or simple JSON lines.
            // If it's JSON lines, we need to parse.
            // If it's raw text, just append.

            // NOTE: If the backend returns standard JSON response at the end, this might break.
            // But "stream" implies streaming.

            aiResponse += chunk;
            $aiMessageContent.textContent = aiResponse;
            $chatMessages.scrollTop = $chatMessages.scrollHeight;
        }
    } catch (error) {
        console.error('Chat error:', error);
        $aiMessageContent.textContent = '오류가 발생했습니다.';
    }
}

function addMessage(text, type) {
    const $message = createElement('div', `message message--${type}`);
    const $content = createElement('div', 'message-content', text);
    $message.appendChild($content);
    $chatMessages.appendChild($message);
    $chatMessages.scrollTop = $chatMessages.scrollHeight;
    return $content;
}
