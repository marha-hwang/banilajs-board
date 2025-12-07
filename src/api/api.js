// API Helper

import { BASE_URL } from '../utils/constants.js';

export const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                headers: getHeaders(),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    async post(endpoint, body) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(body),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },

    async put(endpoint, body) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(body),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    },

    async delete(endpoint, body) {
        try {
            const options = {
                method: 'DELETE',
                headers: getHeaders(),
            };
            if (body) {
                options.body = JSON.stringify(body);
            }
            const response = await fetch(`${BASE_URL}${endpoint}`, options);
            return handleResponse(response);
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    },

    async upload(file) {
        try {
            const formData = new FormData();
            formData.append('request', file);

            const response = await fetch(`${BASE_URL}/file/upload`, {
                method: 'POST',
                headers: {
                    ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
                },
                body: formData,
            });
            return handleResponse(response);
        } catch (error) {
            console.error('API Upload Error:', error);
            throw error;
        }
    },

    async download(fileId) {
        try {
            const response = await fetch(`${BASE_URL}/file/download`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ file_id: fileId })
            });

            // Check if response is JSON (ApiResponse) or Blob
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const res = await response.json();
                if (!res.success) throw new Error(res.message);

                // If data contains file_url, return full URL
                if (res.data && res.data.file_url) {
                    // Assuming file_url is relative path like "images/..."
                    // We need to prepend BASE_URL or handle it if it's absolute
                    // Based on example: "images/..."
                    return `${BASE_URL}/${res.data.file_url}`;
                }
                return res.data;
            } else {
                // If it's a blob/stream
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            }
        } catch (error) {
            console.error('API Download Error:', error);
            return null;
        }
    },

    async chatStream(message, model = "Qwen/Qwen2.5-32B-Instruct-AWQ") {
        try {
            const response = await fetch(`${BASE_URL}/chat/stream`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ message, model })
            });

            if (!response.ok) throw new Error('Chat failed');

            // Return the reader for streaming
            return response.body.getReader();
        } catch (error) {
            console.error('API Chat Error:', error);
            throw error;
        }
    },

    // Mock function removed as we are connecting to real API
    mock(data, delay = 500) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true, data }), delay);
        });
    }
};

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse(response) {
    // API returns { success, code, message, data }
    const res = await response.json();

    if (!response.ok) {
        throw new Error(res.message || res.detail || `HTTP error! status: ${response.status}`);
    }

    // Check backend specific success flag if present, or just return res
    // Based on spec: ApiResponse { success: boolean, ... }
    if (res.success === false) {
        throw new Error(res.message || 'API Error');
    }

    return res;
}
