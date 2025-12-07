import { $, createElement } from '../utils/utils.js';
import { api } from '../api/api.js';

// DOM Elements
const $signupForm = $('#signup-form');
const $profileImageInput = $('#profile-image');
const $profilePreview = $('#profile-preview');
const $emailInput = $('#email');
const $passwordInput = $('#password');
const $passwordConfirmInput = $('#password-confirm');
const $nicknameInput = $('#nickname');

const $emailError = $('#email-error');
const $passwordError = $('#password-error');
const $passwordConfirmError = $('#password-confirm-error');
const $nicknameError = $('#nickname-error');

// Event Listeners
$signupForm.addEventListener('submit', handleSignup);
$profileImageInput.addEventListener('change', handleProfileImageChange);

$emailInput.addEventListener('input', () => clearError($emailError));
$passwordInput.addEventListener('input', () => clearError($passwordError));
$passwordConfirmInput.addEventListener('input', () => clearError($passwordConfirmError));
$nicknameInput.addEventListener('input', () => clearError($nicknameError));

// Handlers
function handleProfileImageChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            $profilePreview.style.backgroundImage = `url('${e.target.result}')`;
        };
        reader.readAsDataURL(file);
    }
}

async function handleSignup(e) {
    e.preventDefault();

    const email = $emailInput.value.trim();
    const password = $passwordInput.value.trim();
    const passwordConfirm = $passwordConfirmInput.value.trim();
    const nickname = $nicknameInput.value.trim();
    const profileImage = $profileImageInput.files[0];

    if (!validateInput(email, password, passwordConfirm, nickname)) return;

    try {
        let img_id = null;

        // 1. Upload Image if exists
        if (profileImage) {
            const uploadResponse = await api.upload(profileImage);
            if (uploadResponse.success) {
                // Assuming the data contains the file ID or URL. 
                // Spec says "Upload File" returns ApiResponse. 
                // Let's assume data is the ID or an object containing ID.
                // Adjust based on actual response.
                if (uploadResponse.success) {
                    // Response data structure: { file_id: "..." }
                    img_id = uploadResponse.data.file_id;
                }
            }
        }

        // 2. Signup
        const response = await api.post('/user', {
            user_id: email,
            password: password,
            nickname: nickname,
            img_id: img_id || "" // Spec requires img_id
        });

        if (response.success) {
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            window.location.href = 'login.html';
        }
    } catch (error) {
        alert(error.message || '회원가입 중 오류가 발생했습니다.');
        console.error(error);
    }
}


function validateInput(email, password, passwordConfirm, nickname) {
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
    } else if (password.length < 8) {
        showError($passwordError, '비밀번호는 8자 이상이어야 합니다.');
        isValid = false;
    }

    if (password !== passwordConfirm) {
        showError($passwordConfirmError, '비밀번호가 일치하지 않습니다.');
        isValid = false;
    }

    if (!nickname) {
        showError($nicknameError, '닉네임을 입력해주세요.');
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
