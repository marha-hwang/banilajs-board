import { $, createElement } from '../utils/utils.js';
import { api } from '../api/api.js';

// DOM Elements
const $loginForm = $('#login-form');
const $emailInput = $('#email');
const $passwordInput = $('#password');
const $emailError = $('#email-error');
const $passwordError = $('#password-error');

// Event Listeners
$loginForm.addEventListener('submit', handleLogin);
$emailInput.addEventListener('input', () => clearError($emailError));
$passwordInput.addEventListener('input', () => clearError($passwordError));

// Handlers
async function handleLogin(e) {
    e.preventDefault();

    const email = $emailInput.value.trim();
    const password = $passwordInput.value.trim();

    if (!validateInput(email, password)) return;

    try {
        // Real login
        const response = await api.post('/auth/login', {
            user_id: email,
            password: password
        });

        if (response.success) {
            // The API spec says data contains the response. 
            // Assuming response.data has token and user info.
            // If the API only returns token, we might need to fetch user info separately.
            // However, usually login returns user info. 
            // Let's assume response.data = { access_token: "...", ... } or similar.
            // Wait, spec says ApiResponse { data: Any }.
            // Standard JWT auth usually returns access_token.

            // Let's inspect the data. For now assume standard structure.
            // If the backend follows FastAPI security, it might return { access_token, token_type }.
            // But the spec says it returns ApiResponse.

            const { access_token, user } = response.data || {};

            if (access_token) {
                localStorage.setItem('token', access_token);
            } else if (typeof response.data === 'string') {
                // Sometimes simple tokens are returned as string
                localStorage.setItem('token', response.data);
            }

            // If user info is not in login response, we might need to decode token or fetch /user/me
            // But there is no /user/me in the spec.
            // There is /user PUT/DELETE/POST.
            // Maybe the login response includes user details.
            // For now, let's store what we have.
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                // Fallback: create a dummy user object from email if not provided
                localStorage.setItem('user', JSON.stringify({ email: email, nickname: 'User' }));
            }

            window.location.href = 'index.html';
        }
    } catch (error) {
        showError($passwordError, error.message || '로그인에 실패했습니다.');
    }
}


function validateInput(email, password) {
    let isValid = true;

    if (!email) {
        showError($emailError, '이메일을 입력해주세요.');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError($emailError, '올바른 이메일 형식이 아닙니다.');
        isValid = false;
    }

    if (!password) {
        showError($passwordError, '비밀번호를 입력해주세요.');
        isValid = false;
    }

    return isValid;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError($element, message) {
    $element.textContent = message;
}

function clearError($element) {
    $element.textContent = '';
}
