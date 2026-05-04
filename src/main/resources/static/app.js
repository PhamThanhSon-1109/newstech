// ============================================================
// app.js — TechPulse Homepage Logic
// ============================================================

let currentPage = 0;
let totalPages = 1;

// ── Mobile Nav ──────────────────────────────────────────
function toggleMobileNav() {
    const nav = document.getElementById('mobile-nav');
    nav.style.display = nav.style.display === 'none' ? 'block' : 'none';
}

// ── Initialization ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Auth integration via common.js
    renderHeader('auth-buttons');
    if (Auth.isLoggedIn() && Auth.isAdmin()) {
        // Add to mobile nav if admin
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) {
            mobileNav.innerHTML += `<a href="admin.html" style="display:block;padding:10px 0;color:var(--cyan);font-size:14px;text-decoration:none;font-weight:700;border-top:1px solid var(--border)"><i class="fa-solid fa-gauge" style="margin-right:8px"></i> Quản lý bài viết</a>`;
        }
    }

    loadCategories();
    loadHeroPost();
    loadPosts(0);
    loadTrending();
    loadLoved();
    loadMarquee();
});

// ── Marquee ────────────────────────────────────────────
async function loadMarquee() {
    try {
        const r = await api.get('/posts?page=0&size=5');
        const posts = r.data?.content || [];
        if (!posts.length) return;

        let html = '';
        posts.forEach((p, index) => {
            html += `<a href="post.html?slug=${p.slug}" class="marquee-item">
                        <span style="color:var(--cyan);margin-right:8px">[Mới]</span> ${p.title}
                     </a>`;
            if (index < posts.length - 1) {
                html += `<div class="marquee-dot"></div>`;
            }
        });

        // Duplicate content for smooth infinite scrolling
        document.getElementById('marquee-content').innerHTML = html + '<div class="marquee-dot"></div>' + html;
    } catch (e) {
        document.getElementById('marquee-content').innerHTML = 'Chào mừng đến với TechPulse';
    }
}

// ── Categories ─────────────────────────────────────────
async function loadCategories() {
    try {
        const r = await api.get('/categories');
        const cats = r.data || [];
        // Header Nav
        document.getElementById('nav-categories').innerHTML = cats.slice(0, 5).map(c =>
            `<a href="category.html?slug=${c.slug}&name=${encodeURIComponent(c.name)}" class="nav-link">${c.name}</a>`
        ).join('');
        // Sidebar
        document.getElementById('sidebar-categories').innerHTML = cats.map(c =>
            `<a href="category.html?slug=${c.slug}&name=${encodeURIComponent(c.name)}" class="cat-item">${c.name}</a>`
        ).join('');
        // Footer
        document.getElementById('footer-categories').innerHTML = cats.slice(0, 6).map(c =>
            `<li><a href="category.html?slug=${c.slug}&name=${encodeURIComponent(c.name)}">${c.name}</a></li>`
        ).join('');
    } catch (e) {
        console.error('Failed to load categories', e);
    }
}

// ── Hero Post ──────────────────────────────────────────
async function loadHeroPost() {
    try {
        const r = await api.get('/posts?page=0&size=1');
        const posts = r.data?.content || [];
        if (!posts.length) return;
        const p = posts[0];
        document.getElementById('hero-title').textContent = p.title;
        document.getElementById('hero-excerpt').textContent = p.excerpt || 'Bài viết mới nhất trên TechPulse. Cập nhật những xu hướng công nghệ hàng đầu, đánh giá sản phẩm và kiến thức chuyên sâu.';
        if (p.authorAvatar) {
            document.getElementById('hero-avatar').src = getImgUrl(p.authorAvatar);
        } else {
            document.getElementById('hero-avatar').src = `https://ui-avatars.com/api/?name=${p.authorName || 'Admin'}&background=0e7490&color=fff`;
        }
        document.getElementById('hero-author').textContent = p.authorName || 'Admin';
        document.getElementById('hero-date').textContent = formatDate(p.createdAt);
        document.getElementById('hero-link').href = `post.html?slug=${p.slug}`;
        if (p.thumbnail) {
            const thumbUrl = getImgUrl(p.thumbnail);

            // Set ambient background
            document.querySelector('.hero-bg-overlay').style.backgroundImage = `url(${thumbUrl})`;
            document.querySelector('.hero-bg-overlay').style.backgroundSize = 'cover';
            document.querySelector('.hero-bg-overlay').style.backgroundPosition = 'center';

            // Set main thumbnail
            const thumbEl = document.getElementById('hero-thumbnail');
            if (thumbEl) thumbEl.src = thumbUrl;
        }

        const thumbLinkEl = document.getElementById('hero-thumb-link');
        if (thumbLinkEl) thumbLinkEl.href = `post.html?slug=${p.slug}`;
    } catch (e) {
        document.getElementById('hero-title').textContent = 'Chào mừng đến với TechPulse';
    }
}

// ── Main Posts Grid ────────────────────────────────────
async function loadPosts(page) {
    currentPage = page;
    const grid = document.getElementById('posts-grid');
    grid.innerHTML = Array(6).fill(`<div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>`).join('');
    try {
        const r = await api.get(`/posts?page=${page}&size=9`);
        const posts = r.data?.content || [];
        totalPages = r.data?.totalPages || 1;

        if (!posts.length) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">Không có bài viết nào.</div>';
            return;
        }

        grid.innerHTML = posts.map(p => {
            const authorAvatar = p.authorAvatar ? getImgUrl(p.authorAvatar) : `https://ui-avatars.com/api/?name=${p.authorName || 'Admin'}&background=0e7490&color=fff`;
            return `
                <a href="post.html?slug=${p.slug}" class="post-card" style="text-decoration:none">
                    <div class="post-card-img">
                        <img src="${getImgUrl(p.thumbnail) || 'https://picsum.photos/seed/' + p.id + '/480/300'}" alt="${p.title}" loading="lazy" onerror="this.src='https://picsum.photos/seed/${p.id}/480/300'">
                    </div>
                    <div class="post-card-body">
                        <span class="post-cat-badge">${p.categoryName || 'Khác'}</span>
                        <h3 class="post-card-title">${p.title}</h3>
                        <div class="post-card-meta">
                            <span style="display:flex;align-items:center;gap:6px">
                                <img src="${authorAvatar}" style="width:20px;height:20px;border-radius:50%;object-fit:cover">
                                ${p.authorName || 'Admin'}
                            </span>
                            <span><i class="fa-regular fa-calendar"></i> ${formatDate(p.createdAt)}</span>
                            <span><i class="fa-regular fa-eye"></i> ${(p.views || 0).toLocaleString('vi-VN')}</span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');

        renderPagination();
    } catch (e) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#ef4444">Lỗi kết nối máy chủ.</div>';
    }
}

function renderPagination() {
    const el = document.getElementById('pagination');
    if (totalPages <= 1) { el.innerHTML = ''; return; }
    let html = '';
    for (let i = 0; i < Math.min(totalPages, 8); i++) {
        html += `<button class="page-btn${i === currentPage ? ' active' : ''}" onclick="loadPosts(${i})">${i + 1}</button>`;
    }
    el.innerHTML = html;
}

// ── Trending Posts ─────────────────────────────────────
async function loadTrending() {
    try {
        const r = await api.get('/posts?top=true&page=0&size=5');
        let posts = r.data?.content || [];

        const el = document.getElementById('trending-list');
        if (!posts.length) return;

        el.innerHTML = posts.map((p, idx) => `
            <a href="post.html?slug=${p.slug}" style="display:flex;gap:12px;text-decoration:none;align-items:center;padding:8px 0">
                <div style="font-size:24px;font-weight:800;color:rgba(34,211,238,.3);font-family:'Syne',sans-serif;width:24px;text-align:center">
                    ${idx + 1}
                </div>
                <div>
                    <h5 style="font-size:13px;font-weight:600;color:var(--text);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color .2s"
                        onmouseover="this.style.color='var(--cyan)'" onmouseout="this.style.color='var(--text)'">
                        ${p.title}
                    </h5>
                    <p style="font-size:11px;color:var(--text-muted);margin-top:4px"><i class="fa-regular fa-eye"></i> ${(p.views || 0).toLocaleString('vi-VN')} lượt xem</p>
                </div>
            </a>
        `).join('');
    } catch (e) {
        console.error('Failed to load trending', e);
    }
}

async function loadLoved() {
    try {
        const r = await api.get('/posts?topLiked=true&page=0&size=5');
        let posts = r.data?.content || [];
        const el = document.getElementById('loved-list');
        if (!el) return;
        if (!posts.length) {
            el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">Chưa có bài viết yêu thích</div>';
            return;
        }

        el.innerHTML = posts.map((p, idx) => `
            <a href="post.html?slug=${p.slug}" style="display:flex;gap:12px;text-decoration:none;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.03)">
                <div style="font-size:14px;font-weight:700;color:var(--cyan);background:rgba(34,211,238,0.1);width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    ${idx + 1}
                </div>
                <div style="flex:1">
                    <h5 style="font-size:13px;font-weight:600;color:var(--text);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color .2s"
                        onmouseover="this.style.color='var(--cyan)'" onmouseout="this.style.color='var(--text)'">
                        ${p.title}
                    </h5>
                    <div style="display:flex; gap:12px; margin-top:4px">
                        <p style="font-size:11px;color:#ef4444;font-weight:600"><i class="fa-solid fa-heart" style="margin-right:4px"></i> ${(p.likeCount || 0).toLocaleString('vi-VN')}</p>
                        <p style="font-size:11px;color:var(--text-muted)"><i class="fa-regular fa-eye"></i> ${(p.views || 0).toLocaleString('vi-VN')}</p>
                    </div>
                </div>
            </a>
        `).join('');
    } catch (e) {
        console.error('Failed to load loved posts', e);
    }
}

