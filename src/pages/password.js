import { $, createElement } from '../utils/utils.js';
import { api } from '../api/api.js';

const $passwordForm = $('#password-form');
const $newPasswordInput = $('#new-password');
const $newPasswordConfirmInput = $('#new-password-confirm');
const $cancelBtn = $('#cancel-btn');

$passwordForm.addEventListener('submit', handleChangePassword);
$cancelBtn.addEventListener('click', () => history.back());

async function handleChangePassword(e) {
    e.preventDefault();

    const newPassword = $newPasswordInput.value.trim();
    const newPasswordConfirm = $newPasswordConfirmInput.value.trim();

    if (newPassword.length < 8) {
        alert('비밀번호는 8자 이상이어야 합니다.');
        return;
    }

    if (newPassword !== newPasswordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    try {
        const response = await api.put('/user/password', {
            new_password: newPassword
        });

        if (response.success) {
            alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Failed to change password:', error);
        alert('비밀번호 변경에 실패했습니다.');
    }
}
