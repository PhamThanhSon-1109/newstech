// ============================================================
// post.js — TechPulse Article Detail Logic
// ============================================================

const slug = new URLSearchParams(location.search).get('slug');
let postId = null;
let likeCount = 0;
let liked = false;
let isSavedPost = false;

// ── Scroll progress bar ───────────────────────────────────
let scrollTimeout;
window.addEventListener('scroll', function () {
    const d = document.documentElement;
    document.getElementById('scroll-bar').style.width =
        (d.scrollTop / (d.scrollHeight - d.clientHeight) * 100) + '%';

    // Save reading progress
    if (postId) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (d.scrollTop > 400) { // Only save if scrolled past header
                localStorage.setItem('read_progress_' + postId, d.scrollTop);
            } else {
                localStorage.removeItem('read_progress_' + postId);
            }
        }, 500); // Debounce
    }
});

// ── Auth area ─────────────────────────────────────────────
renderHeader('auth-area');

// ── Load post ─────────────────────────────────────────────
async function loadPost() {
    if (!slug) {
        document.getElementById('post-body').innerHTML = '<p style="color:var(--text-muted)">Không tìm thấy bài viết.</p>';
        return;
    }
    try {
        const r = await api.get('/posts/slug/' + slug);
        if (!r.success) {
            document.getElementById('post-body').innerHTML = '<p style="color:#ef4444">Bài viết không tồn tại.</p>';
            return;
        }
        const p = r.data;
        postId = p.id;
        likeCount = p.likeCount || 0;

        // Tăng lượt xem (không cần đợi)
        api.post('/posts/' + postId + '/view', {}).catch(console.error);

        // SEO meta tags
        document.title = p.title + ' - TechPulse';
        setMeta('og:title', p.title + ' - TechPulse');
        setMeta('og:description', p.excerpt || p.title);
        setMeta('og:image', p.thumbnail || '');
        setMeta('og:url', location.href);
        setMeta('og:type', 'article');
        setMeta('twitter:card', 'summary_large_image');
        setMeta('description', p.excerpt || p.title);

        // Lazy-load thumbnail
        const thumb = document.getElementById('post-thumb');
        const thumbBg = document.getElementById('post-thumb-bg');
        const imgSrc = p.thumbnail || 'https://picsum.photos/seed/' + p.id + '/1920/800';

        if (thumb) {
            thumb.setAttribute('loading', 'lazy');
            thumb.src = imgSrc;
        }
        if (thumbBg) {
            thumbBg.src = imgSrc;
        }

        document.getElementById('post-cat').textContent = p.categoryName || '';
        document.getElementById('post-title').textContent = p.title;
        document.getElementById('post-author').textContent = p.authorName || 'Admin';
        document.getElementById('post-date').textContent = formatDate(p.createdAt);
        document.getElementById('post-views').textContent = (p.views || 0).toLocaleString('vi-VN');
        if (p.authorAvatar) document.getElementById('post-avatar').src = p.authorAvatar;

        // Like count display
        updateLikeBtn();

        // Check if liked and saved
        if (Auth.isLoggedIn()) {
            api.get('/likes/check/' + postId).then(res => {
                if (res.success) {
                    liked = res.data;
                    updateLikeBtn();
                }
            }).catch(e => console.log('Không thể kiểm tra trạng thái like'));

            api.get('/saved-posts/check/' + postId).then(res => {
                if (res.success) {
                    isSavedPost = res.data;
                    updateSaveBtn();
                }
            }).catch(e => console.log('Không thể kiểm tra trạng thái lưu'));
        } else {
            updateSaveBtn();
        }

        document.getElementById('post-body').innerHTML = p.content || '<p>Chưa có nội dung.</p>';

        // Lazy-load images inside article body
        document.querySelectorAll('#post-body img').forEach(img => {
            img.setAttribute('loading', 'lazy');
        });

        buildTOC();
        loadRelated(p.categoryName);
        loadComments();
        setupCommentForm();

        // Check reading progress
        setTimeout(() => {
            const savedScroll = localStorage.getItem('read_progress_' + postId);
            if (savedScroll && parseInt(savedScroll) > 400) {
                showReadProgressModal(parseInt(savedScroll));
            }
        }, 800); // Slight delay for smoother UX
    } catch (e) {
        document.getElementById('post-body').innerHTML = '<p style="color:#ef4444">Lỗi kết nối API.</p>';
    }
}

function showReadProgressModal(savedScroll) {
    const modal = document.getElementById('progress-modal');
    if (!modal) return;

    // Add active class for animation
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 50);

    document.getElementById('btn-continue-read').onclick = () => {
        window.scrollTo({ top: savedScroll, behavior: 'smooth' });
        closeProgressModal();
    };

    document.getElementById('btn-restart-read').onclick = () => {
        localStorage.removeItem('read_progress_' + postId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        closeProgressModal();
    };
}

function closeProgressModal() {
    const modal = document.getElementById('progress-modal');
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

function setMeta(name, content) {
    let el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        const isOg = name.startsWith('og:') || name.startsWith('twitter:');
        el.setAttribute(isOg ? 'property' : 'name', name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

// ── Table of contents ─────────────────────────────────────
function buildTOC() {
    const hs = document.querySelectorAll('#post-body h2,#post-body h3');
    if (hs.length < 2) return;
    document.getElementById('toc-box').style.display = 'block';
    const list = document.getElementById('toc-list');
    hs.forEach((h, i) => {
        h.id = 'h' + i;
        const d = document.createElement('div');
        d.className = 'toc-item';
        d.textContent = h.textContent;
        d.style.paddingLeft = h.tagName === 'H3' ? '24px' : '12px';
        d.onclick = () => h.scrollIntoView({ behavior: 'smooth' });
        list.appendChild(d);
    });

    // Highlight active TOC item on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        hs.forEach(h => { if (window.scrollY >= h.offsetTop - 120) current = h.id; });
        list.querySelectorAll('.toc-item').forEach((d, i) => {
            d.classList.toggle('active', hs[i]?.id === current);
        });
    }, { passive: true });
}

// ── Related posts ─────────────────────────────────────────
async function loadRelated(catName) {
    try {
        const path = catName
            ? `/posts?keyword=${encodeURIComponent(catName)}&page=0&size=5`
            : '/posts?page=0&size=5';
        const r = await api.get(path);
        const posts = (r.data?.content || []).filter(p => p.slug !== slug).slice(0, 3);
        document.getElementById('related-list').innerHTML = posts.map(p =>
            `<a href="post.html?slug=${p.slug}" style="display:flex;gap:10px;text-decoration:none;color:var(--text);align-items:flex-start">
                <img src="${p.thumbnail || 'https://picsum.photos/seed/' + p.id + '/120/80'}" loading="lazy"
                    style="width:68px;height:48px;object-fit:cover;border-radius:10px;flex-shrink:0;transition:opacity .2s"
                    onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'" onerror="this.style.display='none'">
                <div>
                    <p style="font-size:13px;font-weight:500;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color .2s"
                        onmouseover="this.style.color='var(--cyan)'" onmouseout="this.style.color='var(--text)'">${p.title}</p>
                    <p style="font-size:11px;color:var(--text-muted);margin-top:3px">${timeAgo(p.createdAt)}</p>
                </div>
            </a>`
        ).join('');
    } catch (e) { }
}

// ── Comments ──────────────────────────────────────────────
async function loadComments() {
    if (!postId) return;
    try {
        const r = await api.get('/comments/post/' + postId);
        const cmts = Array.isArray(r) ? r : (Array.isArray(r.data) ? r.data : []);
        document.getElementById('cmt-count').textContent = cmts.length;
        const el = document.getElementById('cmt-list');
        if (!cmts.length) {
            el.innerHTML = '<p style="font-size:13px;color:var(--text-muted);text-align:center;padding:24px 0">Chưa có bình luận nào. Hãy là người đầu tiên!</p>';
            return;
        }

        // Grouping: Flat list to Tree
        const map = {};
        const roots = [];
        cmts.forEach(c => {
            map[c.id] = { ...c, replies: [] };
        });
        cmts.forEach(c => {
            if (c.parentId && map[c.parentId]) {
                map[c.parentId].replies.push(map[c.id]);
            } else {
                roots.push(map[c.id]);
            }
        });

        // Sort roots by newest first (optional, or oldest depending on preference)
        roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        el.innerHTML = roots.map(c => renderComment(c)).join('');
    } catch (e) { }
}

function renderComment(c, depth = 0) {
    const av = (c.username || '?').charAt(0).toUpperCase();
    const isReply = depth > 0;

    // Chỉ thụt lề và thêm viền dọc ở cấp 1
    const margin = depth === 1 ? 'margin-left: 32px;' : '';
    const border = depth === 1 ? 'border-left: 1px solid var(--border); padding-left: 20px;' : '';

    // Thu gọn khoảng cách cho bình luận con và bỏ gạch ngang chồng chéo
    const extraStyle = isReply ? 'border-bottom: none; padding: 12px 0;' : '';

    return `
        <div class="cmt-item" style="${margin} ${border} ${extraStyle}">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                <div style="width:34px;height:34px;border-radius:50%;background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--cyan);flex-shrink:0">${av}</div>
                <span style="font-size:13px;font-weight:600;color:var(--text)">${escHtml(c.username)}</span>
                ${c.parentUsername ? `<span style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:4px"><i class="fa-solid fa-share" style="transform:scaleX(-1);font-size:10px"></i> phản hồi <span style="color:var(--cyan);font-weight:600">@${escHtml(c.parentUsername)}</span></span>` : ''}
                <span style="font-size:11px;color:var(--text-muted);margin-left:auto">${timeAgo(c.createdAt)}</span>
            </div>
            <p style="font-size:14px;line-height:1.65;color:var(--text);padding-left:44px">${escHtml(c.content)}</p>
            
            <div style="padding-left:44px; margin-top:10px">
                <button onclick="showReplyForm(${c.id}, '${escHtml(c.username)}')" style="background:none;border:none;color:var(--cyan);font-size:12px;cursor:pointer;padding:0;font-weight:600;display:flex;align-items:center;gap:5px">
                    <i class="fa-solid fa-reply"></i> Phản hồi
                </button>
            </div>
            <div id="reply-form-${c.id}" style="margin-top:15px; display:none; padding-left:44px"></div>

            <div class="replies-list">
                ${(c.replies || []).map(r => renderComment(r, depth + 1)).join('')}
            </div>
        </div>
    `;
}

function showReplyForm(parentId, username) {
    if (!Auth.isLoggedIn()) {
        showToast('Hãy đăng nhập để phản hồi', 'error');
        return;
    }

    // Đóng các form reply khác
    document.querySelectorAll('[id^="reply-form-"]').forEach(el => {
        el.style.display = 'none';
        el.innerHTML = '';
    });

    const container = document.getElementById('reply-form-' + parentId);
    if (!container) return;

    container.innerHTML = `
        <div style="background:rgba(255,255,255,0.02); padding:15px; border-radius:16px; border:1px solid var(--border)">
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:8px">Đang phản hồi <strong>@${username}</strong></p>
            <textarea id="reply-txt-${parentId}" class="tp-input" rows="3" placeholder="Viết phản hồi của bạn..." style="font-size:13px; resize:vertical; margin-bottom:12px; background:var(--bg)"></textarea>
            <div style="display:flex; gap:10px">
                <button class="tp-btn" style="padding: 6px 16px; font-size:12px" onclick="postComment(${parentId})">Gửi phản hồi</button>
                <button class="tp-btn-ghost" style="padding: 6px 16px; font-size:12px" onclick="hideReplyForm(${parentId})">Hủy</button>
            </div>
        </div>
    `;
    container.style.display = 'block';
    setTimeout(() => document.getElementById('reply-txt-' + parentId).focus(), 50);
}

function hideReplyForm(parentId) {
    const container = document.getElementById('reply-form-' + parentId);
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

function setupCommentForm() {
    const fa = document.getElementById('cmt-form-area');
    if (Auth.isLoggedIn()) {
        fa.innerHTML =
            '<textarea id="cmt-txt" class="tp-input" rows="4" placeholder="Viết bình luận của bạn..." style="resize:vertical;margin-bottom:10px"></textarea>' +
            '<button class="tp-btn" onclick="postComment()"><i class="fa-solid fa-paper-plane" style="margin-right:8px"></i>Gửi bình luận</button>';
    } else {
        fa.innerHTML = '<div style="padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:16px;text-align:center;font-size:13px;color:var(--text-muted)"><a href="auth.html" style="color:var(--cyan);font-weight:600">Đăng nhập</a> để bình luận</div>';
    }
}

async function postComment(parentId = null) {
    const id = parentId ? 'reply-txt-' + parentId : 'cmt-txt';
    const txt = document.getElementById(id);
    if (!txt || !txt.value.trim()) { showToast('Vui lòng nhập nội dung', 'error'); return; }
    try {
        const body = { postId, content: txt.value.trim() };
        if (parentId) body.parentId = parentId;

        const r = await api.post('/comments', body);
        if (r.id || r.content || r.success) {
            txt.value = '';
            showToast('Đã gửi bình luận!');
            if (parentId) hideReplyForm(parentId);
            loadComments();
        }
        else showToast('Gửi thất bại', 'error');
    } catch (e) { showToast('Lỗi kết nối', 'error'); }
}

// ── Like ──────────────────────────────────────────────────
function updateLikeBtn() {
    const btn = document.getElementById('like-btn');
    if (!btn) return;
    if (liked) {
        btn.classList.add('liked');
        btn.innerHTML = `<i class="fa-solid fa-heart"></i> Đã thích <span style="font-size:12px;opacity:.8">(${likeCount})</span>`;
    } else {
        btn.classList.remove('liked');
        btn.innerHTML = `<i class="fa-regular fa-heart"></i> Thích <span style="font-size:12px;opacity:.8">(${likeCount})</span>`;
    }
}

async function toggleLike() {
    if (!Auth.isLoggedIn()) { showToast('Hãy đăng nhập để like', 'error'); return; }
    if (!postId) return;
    try {
        const r = await api.post('/likes/' + postId, {});
        if (r.success) {
            liked = (r.data === 'Liked');
            likeCount += liked ? 1 : -1;
            if (likeCount < 0) likeCount = 0; // Guard against negative values
            updateLikeBtn();
        } else {
            showToast('Lỗi: ' + r.message, 'error');
        }
    } catch (e) { showToast('Lỗi', 'error'); }
}

// ── Save Post ─────────────────────────────────────────────
function updateSaveBtn() {
    const btn = document.getElementById('save-btn');
    if (!btn) return;
    if (isSavedPost) {
        btn.classList.add('liked'); // Reuse liked class for styling
        btn.innerHTML = `<i class="fa-solid fa-bookmark"></i> Đã lưu`;
    } else {
        btn.classList.remove('liked');
        btn.innerHTML = `<i class="fa-regular fa-bookmark"></i> Lưu bài viết`;
    }
}

async function toggleSavePost() {
    if (!Auth.isLoggedIn()) { showToast('Hãy đăng nhập để lưu bài viết', 'error'); return; }
    if (!postId) return;
    try {
        const r = await api.post('/saved-posts/' + postId, {});
        if (r.success) {
            isSavedPost = r.data;
            updateSaveBtn();
            showToast(r.message);
        }
    } catch (e) { showToast('Lỗi kết nối', 'error'); }
}

// ── Helper ────────────────────────────────────────────────
function escHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── Init ──────────────────────────────────────────────────
loadPost();
