import { $, createElement } from '../utils/utils.js';
import { api } from '../api/api.js';

const $profileForm = $('#profile-form');
const $nicknameInput = $('#nickname');
const $emailLabel = $('#email');
const $profileImageInput = $('#profile-image');
const $profilePreview = $('#profile-preview');
const $cancelBtn = $('#cancel-btn');
const $deleteAccountBtn = $('#delete-account-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
});

// Event Listeners
$profileForm.addEventListener('submit', handleUpdateProfile);
$profileImageInput.addEventListener('change', handleProfileImageChange);
$cancelBtn.addEventListener('click', () => history.back());
$deleteAccountBtn.addEventListener('click', handleDeleteAccount);

function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    $nicknameInput.value = user.nickname || '';
    $emailLabel.textContent = user.user_id || '';
    if (user.img_id) {
        loadImage(user.img_id, $profilePreview);
    }
}

async function loadImage(fileId, element) {
    const data = await api.download(fileId);
    if (data) {
        element.style.backgroundImage = `url('${data}')`;
    }
}

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

async function handleUpdateProfile(e) {
    e.preventDefault();

    const nickname = $nicknameInput.value.trim();
    const profileImage = $profileImageInput.files[0];

    if (!nickname) {
        alert('닉네임을 입력해주세요.');
        return;
    }

    try {
        let img_id = "";
        const user = JSON.parse(localStorage.getItem('user'));
        img_id = user.img_id || ""; // Keep existing if not changed

        if (profileImage) {
            const uploadResponse = await api.upload(profileImage);
            if (uploadResponse.success) {
                // Response data structure: { file_id: "..." }
                img_id = uploadResponse.data.file_id;
            }
        }

        const response = await api.put('/user', {
            nickname: nickname,
            img_id: img_id
        });

        if (response.success) {
            alert('회원정보가 수정되었습니다.');
            // Update local storage
            const updatedUser = { ...user, nickname, img_id };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.location.reload();
        }
    } catch (error) {
        console.error('Failed to update profile:', error);
        alert('회원정보 수정에 실패했습니다.');
    }
}

async function handleDeleteAccount() {
    if (!confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
        const response = await api.delete('/user');
        if (response.success) {
            alert('회원 탈퇴가 완료되었습니다.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Failed to delete account:', error);
        alert('회원 탈퇴에 실패했습니다.');
    }
}
