import { $, createElement } from '../utils/utils.js';
import { api } from '../api/api.js';

const $writeForm = $('#write-form');
const $titleInput = $('#title');
const $contentInput = $('#content');
const $imageInput = $('#image');
const $pageTitle = $('#page-title');
const $submitBtn = $('#submit-btn');
const $cancelBtn = $('#cancel-btn');

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');
const isEditMode = !!postId;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (isEditMode) {
        setupEditMode();
    }
});

$writeForm.addEventListener('submit', handleSubmit);
$cancelBtn.addEventListener('click', () => history.back());

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = 'login.html';
    }
}

async function setupEditMode() {
    $pageTitle.textContent = '게시글 수정';
    $submitBtn.textContent = '수정완료';

    try {
        const response = await api.get(`/post/${postId}`);

        if (response.success) {
            const { title, content } = response.data;
            $titleInput.value = title;
            $contentInput.value = content;
            // Note: Handling existing image in edit mode is complex without UI to show/remove it.
            // For now, we just allow uploading a new one.
        }
    } catch (error) {
        console.error('Failed to load post:', error);
        alert('게시글 정보를 불러오는데 실패했습니다.');
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const title = $titleInput.value.trim();
    const content = $contentInput.value.trim();
    const image = $imageInput.files[0];

    if (!title || !content) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    try {
        let img_id = ""; // Spec requires img_id

        if (image) {
            const uploadResponse = await api.upload(image);
            if (uploadResponse.success) {
                // Response data structure: { file_id: "..." }
                img_id = uploadResponse.data.file_id;
            }
        }

        if (isEditMode) {
            await api.put('/post', {
                post_id: postId,
                title,
                content,
                img_id: img_id // If empty, might clear image or keep old? Spec unclear.
            });
            alert('게시글이 수정되었습니다.');
            window.location.href = `post.html?id=${postId}`;
        } else {
            await api.post('/post', {
                title,
                content,
                img_id: img_id
            });
            alert('게시글이 작성되었습니다.');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Failed to save post:', error);
        alert('게시글 저장에 실패했습니다.');
    }
}
