import { $, createElement, formatDate } from '../utils/utils.js';
import { api } from '../api/api.js';

const $postList = $('#post-list');
const $loading = $('#loading');
let page = 1;
let isLoading = false;
let hasMore = true;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setupInfiniteScroll();
});

async function loadPosts() {
    if (isLoading || !hasMore) return;

    isLoading = true;
    $loading.classList.remove('hidden');

    try {
        // Real API call
        const response = await api.get('/post');

        if (response.success) {
            // The API spec for /post GET returns ApiResponse.
            // Assuming data is a list of posts.
            // The spec doesn't mention pagination params in GET /post.
            // So it might return all posts.
            let posts = response.data;

            // Handle case where data is not directly an array
            if (!Array.isArray(posts)) {
                console.log('API response data is not an array:', posts);
                if (posts && Array.isArray(posts.posts)) {
                    posts = posts.posts;
                } else if (posts && Array.isArray(posts.content)) {
                    posts = posts.content;
                } else {
                    posts = [];
                }
            }

            if (posts.length === 0) {
                hasMore = false;
            }

            // Since there's no pagination in the spec provided (no page param in GET /post),
            // we might just load all at once or the backend handles it.
            // If the backend returns all, we should stop infinite scroll after first load.
            if (page === 1) {
                $postList.innerHTML = ''; // Clear existing
            }

            renderPosts(posts);

            // If we got results, maybe there are more? 
            // Without pagination info in response, it's hard to know.
            // We'll assume if we got less than X, it's done.
            // Or if the API doesn't support pagination, we just set hasMore = false.
            hasMore = false; // Disable infinite scroll for now as spec doesn't show page param
        }
    } catch (error) {
        console.error('Failed to load posts:', error);
    } finally {
        isLoading = false;
        $loading.classList.add('hidden');
    }
}

function renderPosts(posts) {
    const fragment = document.createDocumentFragment();
    posts.forEach(post => {
        console.log(post)
        const $item = createElement('div', 'post-item');
        $item.addEventListener('click', () => {
            window.location.href = `post.html?id=${post.post_id}`;
        });


        // API Post Schema: { post_id, title, content, img_id, ... }
        // We need to adapt to what the API actually returns.
        // Assuming: post_id, title, content, created_at, views, likes, comment_count, user (nickname, profile)
        // If API returns flat structure, we might need to adjust.

        const $profileImg = createElement('div', 'post-profile-img');
        const $postAuthor = createElement('div', 'post-author');
        const $authorName = createElement('span');
        $authorName.textContent = post.user_id || 'Unknown';

        $postAuthor.appendChild($profileImg);
        $postAuthor.appendChild($authorName);

        $item.innerHTML = `
            <h3 class="post-title">${post.title}</h3>
            <div class="post-meta-top">
                <div class="post-stats">
                    <span>좋아요 ${post.like_cnt || 0}</span>
                    <span>댓글 ${post.comment_cnt || 0}</span>
                    <span>조회 ${post.view_cnt || 0}</span>
                </div>
                <span>${post.create_time ? formatDate(post.create_time) : ''}</span>
            </div>
            <div class="post-divider"></div>
        `;
        $item.appendChild($postAuthor);

        if (post.profile_id) {
            api.download(post.profile_id).then(data => {
                if (data) $profileImg.style.backgroundImage = `url('${data}')`;
            }).catch(error => {
                console.error('Failed to load profile image:', error);
            });
        }
        fragment.appendChild($item);
    });

    $postList.appendChild(fragment);
}

function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
            loadPosts();
        }
    }, { threshold: 0.5 });

    // Create a sentinel element at the bottom
    const $sentinel = createElement('div');
    $postList.after($sentinel);
    observer.observe($sentinel);
}
