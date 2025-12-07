import { $, createElement } from '../utils/utils.js';
import { api } from '../api/api.js';
import { PROJECT_NAME } from '../utils/constants.js';

export function initHeader() {
    const $header = $('#header');
    if (!$header) return;

    const user = JSON.parse(localStorage.getItem('user'));

    $header.className = 'header';

    // Logo
    const $logo = createElement('a', 'header-logo', PROJECT_NAME);
    $header.appendChild($logo);

    if (user) {
        $logo.href = 'index.html';

        // User Profile Area
        const $userContainer = createElement('div', 'header-user');

        const $profileImg = createElement('div', 'header-user-profile');
        if (user.img_id) {
            api.download(user.img_id).then(data => {
                if (data) $profileImg.style.backgroundImage = `url('${data}')`;
            });
        } else if (user.profileImage) {
            $profileImg.style.backgroundImage = `url('${user.profileImage}')`;
        }

        const $dropdown = createElement('div', 'header-user-dropdown');

        const $editProfileBtn = createElement('button', 'dropdown-item', '회원정보 수정');
        const $editPasswordBtn = createElement('button', 'dropdown-item', '비밀번호 수정');
        const $logoutBtn = createElement('button', 'dropdown-item', '로그아웃');

        $dropdown.appendChild($editProfileBtn);
        $dropdown.appendChild($editPasswordBtn);
        $dropdown.appendChild($logoutBtn);

        $userContainer.appendChild($profileImg);
        $userContainer.appendChild($dropdown);
        $header.appendChild($userContainer);

        // Events
        $userContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            $dropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            $dropdown.classList.remove('active');
        });

        $logoutBtn.addEventListener('click', handleLogout);
        $editProfileBtn.addEventListener('click', () => window.location.href = 'profile.html');
        $editPasswordBtn.addEventListener('click', () => window.location.href = 'password.html');

        // If logged in, also show chat button somewhere?
        // Profile is now on the Left.
        // We can put the Chat button on the Right.

        const $chatBtn = createElement('a', 'btn btn--outline', 'AI 채팅');
        $chatBtn.href = 'chat.html';
        $chatBtn.style.position = 'absolute';
        $chatBtn.style.right = 'var(--spacing-xl)';

        $header.appendChild($chatBtn);

    } else {
        // Login/Signup Buttons if not logged in
        const $actions = createElement('div', 'header-actions');

        const $chatBtn = createElement('a', 'btn btn--outline', 'AI 채팅');
        $chatBtn.href = 'chat.html';
        $chatBtn.style.marginRight = '8px';

        $actions.appendChild($chatBtn);
        $header.appendChild($actions);
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Auto-init if script is loaded
document.addEventListener('DOMContentLoaded', initHeader);
