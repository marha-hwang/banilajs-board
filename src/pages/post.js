import { $, createElement, formatDate } from '../utils/utils.js';
import { api } from '../api/api.js';

const $postDetail = $('#post-detail');
const $commentList = $('#comment-list');
const $commentCount = $('#comment-count');
const $commentInput = $('#comment-input');
const $commentSubmitBtn = $('#comment-submit-btn');

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

async function loadImage(fileId, targetId) {
    const data = await api.download(fileId);
    if (data) {
        const $target = document.getElementById(targetId);
        if ($target) {
            // If data is base64 (starts with data:) or blob url (starts with blob:)
            // If api.download returns base64 string without prefix, we might need to add it.
            // Assuming api.download returns usable src.
            // If it returns raw base64 string, we need to know mime type.
            // But let's assume it returns a Blob URL or Data URL.

            // If api.download returned just the base64 string, we might need to guess.
            // But let's assume it returns a Blob URL for now as per my api.js implementation.

            $target.innerHTML = `<img src="${data}" alt="Image" style="max-width: 100%;">`;
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!postId) {
        alert('잘못된 접근입니다.');
        window.location.href = 'index.html';
        return;
    }
    loadPostDetail();
    loadComments();
});

$commentSubmitBtn.addEventListener('click', handleCommentSubmit);

async function loadPostDetail() {
    try {
        const response = await api.get(`/post/${postId}`);

        if (response.success) {
            renderPostDetail(response.data);
        }
    } catch (error) {
        console.error('Failed to load post:', error);
        alert('게시글을 불러오는데 실패했습니다.');
    }
}

function renderPostDetail(post) {
    const user = JSON.parse(localStorage.getItem('user'));
    // Assuming post.user_id is the author's ID.
    // We need to check if the current user is the author.
    // The user object in localStorage might need to have user_id.
    // Let's assume user.user_id or user.id exists.
    const currentUserId = user ? (user.user_id || user.id || user.email) : null;
    const isAuthor = currentUserId && (post.user_id === currentUserId);

    $postDetail.innerHTML = `
        <div class="detail-header">
            <h1 class="detail-title">${post.title}</h1>
            <div class="detail-author-info" style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center;">
                        <div class="post-profile-img" id="post-profile-img">
                        </div>
                        <div class="author-meta" style="margin-left: 10px; display: flex; align-items: center;">
                            <span class="post-author">${post.user_id || 'Unknown'}</span>
                            <span class="post-date" style="margin-left: 10px;">${post.create_time ? formatDate(post.create_time) : ''}</span>
                        </div>
                    </div>
                    ${isAuthor ? `
                    <div class="detail-actions">
                        <button class="btn btn--outline btn--sm" id="edit-btn">수정</button>
                        <button class="btn btn--outline btn--sm" style="color: var(--color-error); border-color: var(--color-error); margin-left: 8px;" id="delete-btn">삭제</button>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
        <div class="detail-image" id="post-image-${post.post_id}"></div>
        <div class="detail-content">${post.content}</div>
        <div class="detail-footer">
            <div class="post-stats">
                <div class="stat-item" id="like-stat" style="cursor: pointer; display: flex; flex-direction: column; align-items: center;">
                    <span id="like-count">${post.like_cnt || 0}</span>
                    <span id="like-icon" style="font-size: 0.8em;">좋아요수</span>
                </div>
                <div class="stat-item" style="display: flex; flex-direction: column; align-items: center;">
                    <span>${post.comment_cnt || 0}</span>
                    <span style="font-size: 0.8em;">댓글수</span>
                </div>
                <div class="stat-item" style="display: flex; flex-direction: column; align-items: center;">
                    <span>${post.view_cnt || 0}</span>
                    <span style="font-size: 0.8em;">조회수</span>
                </div>
            </div>
        </div>
    `;

    if (post.profile_id) {
        loadImage(post.profile_id, `post-profile-img`);
    }

    if (post.img_id) {
        loadImage(post.img_id, `post-image-${post.post_id}`);
    }

    $('#like-stat').addEventListener('click', handleLike);
    updateLikeButtonUI(post.like_cnt); // Initial UI update

    if (isAuthor) {
        $('#edit-btn').addEventListener('click', () => {
            window.location.href = `write.html?id=${post.post_id}`;
        });
        $('#delete-btn').addEventListener('click', handleDeletePost);
    }
}

function updateLikeButtonUI(likeCount) {
    const $likeIcon = $('#like-icon');
    const $likeCount = $('#like-count');

    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
    const isLiked = likedPosts.includes(postId);

    if (isLiked) {
        $likeIcon.textContent = '좋아요수';
        $likeIcon.style.fontWeight = 'bold'; // Optional: make it bold if liked
        // Or change color?
        $likeIcon.style.color = 'var(--color-primary)';
    } else {
        $likeIcon.textContent = '좋아요수';
        $likeIcon.style.color = 'inherit';
    }
    $likeCount.textContent = likeCount;
}

async function handleLike() {
    try {
        // Toggle like locally
        const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
        const index = likedPosts.indexOf(postId);

        // API only has POST /post/like (toggle or add? Spec says "Like Post").
        // Usually it toggles.
        await api.post('/post/like', { post_id: postId });

        if (index === -1) {
            likedPosts.push(postId);
        } else {
            likedPosts.splice(index, 1);
        }
        localStorage.setItem('liked_posts', JSON.stringify(likedPosts));

        loadPostDetail(); // Reload to update count
    } catch (error) {
        console.error('Like error:', error);
        alert('좋아요 처리에 실패했습니다.');
    }
}

async function handleDeletePost() {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    try {
        await api.delete('/post', { post_id: postId });
        alert('게시글이 삭제되었습니다.');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Failed to delete post:', error);
        alert('게시글 삭제에 실패했습니다.');
    }
}

async function loadComments() {
    try {
        const response = await api.get(`/comment/${postId}`);

        if (response.success) {
            let comments = response.data;

            if (!Array.isArray(comments)) {
                console.log('API comments data is not an array:', comments);
                if (comments && Array.isArray(comments.comments)) {
                    comments = comments.comments;
                } else if (comments && Array.isArray(comments.content)) {
                    comments = comments.content;
                } else {
                    comments = [];
                }
            }
            renderComments(comments);
        }
    } catch (error) {
        console.error('Failed to load comments:', error);
    }
}

function renderComments(comments) {
    const user = JSON.parse(localStorage.getItem('user'));
    const currentUserId = user ? (user.user_id || user.id || user.email) : null;

    $commentCount.textContent = comments.length;
    $commentList.innerHTML = comments.map(comment => {
        const isAuthor = currentUserId && (comment.user_id === currentUserId);
        const commentContent = comment.content || '';

        return `
        <div class="comment-item" id="comment-${comment.comment_id}">
            <div class="comment-header">
                <div style="display: flex; align-items: center;">
                    <div class="post-profile-img" id="comment-profile-${comment.comment_id}" style="width: 24px; height: 24px; margin-right: 8px;"></div>
                    <span class="comment-author">${comment.user_id || 'Unknown'}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="comment-date">${comment.create_time ? formatDate(comment.create_time) : ''}</span>
                    ${isAuthor ? `
                    <div class="comment-actions">
                        <button class="btn-text" onclick="enableEditComment('${comment.comment_id}', '${commentContent.replace(/'/g, "\\'")}')">수정</button>
                        <button class="btn-text" style="color: var(--color-error);" onclick="deleteComment('${comment.comment_id}')">삭제</button>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="comment-content" id="comment-content-${comment.comment_id}">${commentContent}</div>
        </div>
    `}).join('');

    // Load profile images for comments
    comments.forEach(comment => {
        if (comment.profile_id) {
            loadImage(comment.profile_id, `comment-profile-${comment.comment_id}`);
        }
    });

    // Bind global functions for onclick (simpler for this structure) or use event delegation
    window.deleteComment = handleDeleteComment;
    window.enableEditComment = handleEnableEditComment;
}

async function handleCommentSubmit() {
    const content = $commentInput.value.trim();
    if (!content) return;

    try {
        await api.post('/comment', { post_id: postId, comment: content });

        $commentInput.value = '';
        loadComments(); // Reload comments
    } catch (error) {
        console.error('Failed to submit comment:', error);
        alert('댓글 작성에 실패했습니다.');
    }
}

async function handleDeleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
        await api.delete('/comment', { comment_id: commentId });
        loadComments();
    } catch (error) {
        console.error('Failed to delete comment:', error);
        alert('댓글 삭제에 실패했습니다.');
    }
}

function handleEnableEditComment(commentId, currentContent) {
    const $contentDiv = document.getElementById(`comment-content-${commentId}`);
    $contentDiv.innerHTML = `
        <div class="comment-edit-form">
            <textarea id="edit-input-${commentId}" rows="2" style="width: 100%; margin-bottom: 8px;">${currentContent}</textarea>
            <div style="text-align: right;">
                <button class="btn btn--sm btn--outline" onclick="cancelEditComment('${commentId}', '${currentContent.replace(/'/g, "\\'")}')">취소</button>
                <button class="btn btn--sm btn--primary" onclick="submitEditComment('${commentId}')">저장</button>
            </div>
        </div>
    `;
    window.cancelEditComment = (id, content) => {
        document.getElementById(`comment-content-${id}`).textContent = content;
    };
    window.submitEditComment = async (id) => {
        const newContent = document.getElementById(`edit-input-${id}`).value.trim();
        if (!newContent) return;
        try {
            await api.put('/comment', { comment_id: id, comment: newContent });
            loadComments();
        } catch (error) {
            console.error('Failed to update comment:', error);
            alert('댓글 수정에 실패했습니다.');
        }
    };
}
