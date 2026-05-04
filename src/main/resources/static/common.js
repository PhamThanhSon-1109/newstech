const API_BASE = 'http://localhost:8080/api/v1';

// Auto-init theme
(function () {
    if (localStorage.getItem('tp_light_mode') === 'true') {
        document.documentElement.classList.add('light-mode');
        // fallback in case script runs before body
        window.addEventListener('DOMContentLoaded', () => document.body.classList.add('light-mode'));
    }
})();

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('tp_light_mode', isLight);
    // Also toggle in document element to avoid flickering sometimes depending on CSS
    document.documentElement.classList.toggle('light-mode', isLight);
}

const Auth = {
    getToken: () => localStorage.getItem('tp_token'),
    getUser: () => JSON.parse(localStorage.getItem('tp_user') || 'null'),
    isLoggedIn: () => !!localStorage.getItem('tp_token'),
    isAdmin: () => { const u = Auth.getUser(); return u && u.role === 'ADMIN'; },
    save: (token, user) => { localStorage.setItem('tp_token', token); localStorage.setItem('tp_user', JSON.stringify(user)); },
    logout: () => { localStorage.removeItem('tp_token'); localStorage.removeItem('tp_user'); window.location.href = 'index.html'; }
};

const api = {
    _headers: () => {
        const h = { 'Content-Type': 'application/json' };
        if (Auth.getToken()) h['Authorization'] = 'Bearer ' + Auth.getToken();
        return h;
    },
    _handle: async (r) => {
        if (!r.ok) {
            const err = await r.text().catch(() => '');
            let msg = 'Lỗi kết nối';
            try { msg = JSON.parse(err).message || `Lỗi ${r.status}`; } catch (e) { msg = `Lỗi ${r.status}`; }
            throw new Error(msg);
        }
        if (r.status === 204 || r.headers.get('content-length') === '0') return { success: true };
        const text = await r.text();
        if (!text || !text.trim()) return { success: true };
        try { return JSON.parse(text); } catch { return { success: true }; }
    },
    get: (path) => fetch(API_BASE + path, { headers: api._headers() }).then(api._handle),
    post: (path, body) => fetch(API_BASE + path, { method: 'POST', headers: api._headers(), body: JSON.stringify(body) }).then(api._handle),
    put: (path, body) => fetch(API_BASE + path, { method: 'PUT', headers: api._headers(), body: JSON.stringify(body) }).then(api._handle),
    del: (path) => fetch(API_BASE + path, { method: 'DELETE', headers: api._headers() }).then(api._handle),
    upload: (file) => {
        const fd = new FormData(); fd.append('file', file);
        const h = {}; if (Auth.getToken()) h['Authorization'] = 'Bearer ' + Auth.getToken();
        return fetch(API_BASE + '/posts/upload', { method: 'POST', headers: h, body: fd }).then(api._handle);
    }
};

function getImgUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return API_BASE.replace('/api/v1', '') + cleanPath;
}

function timeAgo(d) {
    if (!d) return '';
    const s = Math.floor((new Date() - new Date(d)) / 1000);
    if (s < 60) return 'vừa xong';
    if (s < 3600) return Math.floor(s / 60) + ' phút trước';
    if (s < 86400) return Math.floor(s / 3600) + ' giờ trước';
    return Math.floor(s / 86400) + ' ngày trước';
}

function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('vi-VN');
}

function showToast(msg, type) {
    type = type || 'success';
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;padding:14px 20px;border-radius:14px;font-size:14px;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:fadeIn .3s ease';
    t.style.background = type === 'success' ? '#10b981' : '#ef4444';
    t.style.color = '#fff';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

const CAT_COLORS = { 'AI': 'text-purple-400', 'Smartphone': 'text-emerald-400', 'Laptop': 'text-cyan-400', 'Blockchain': 'text-amber-400', 'Gadget': 'text-pink-400', 'Hardware': 'text-orange-400' };
function getCatColor(n) { return CAT_COLORS[n] || 'text-zinc-400'; }

function toggleUserDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('tp-user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('tp-user-dropdown');
    const wrap = document.getElementById('tp-user-dropdown-wrap');
    if (dropdown && !dropdown.classList.contains('hidden')) {
        if (wrap && !wrap.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    }
});

function renderHeader(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    let authHtml;
    if (Auth.isLoggedIn()) {
        const u = Auth.getUser();
        authHtml = '<div class="flex items-center gap-2">' +
            (Auth.isAdmin() ? '<a href="admin.html" class="text-xs px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-400 font-medium hover:bg-amber-400/20 transition" style="text-decoration:none">Admin</a>' : '') +
            '<div id="tp-user-dropdown-wrap" class="relative cursor-pointer">' +
            '<img onclick="toggleUserDropdown(event)" src="' + (u.avatar || 'https://ui-avatars.com/api/?name=' + u.username + '&background=0e7490&color=fff') + '" class="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-400/40">' +
            '<div id="tp-user-dropdown" class="hidden absolute right-0 top-10 rounded-2xl shadow-2xl py-2 w-48 z-50" style="background:var(--surface); border:1px solid var(--border)">' +
            '<div class="px-4 py-2 text-sm font-medium border-b mb-1" style="color:var(--text); border-color:var(--border)">' + u.username + '</div>' +
            '<a href="profile.html" class="w-full text-left px-4 py-2 text-sm text-cyan-400 block hover:opacity-80 transition" style="text-decoration:none"><i class="fa-regular fa-user" style="margin-right:8px"></i>Hồ sơ cá nhân</a>' +
            '<a href="liked.html" class="w-full text-left px-4 py-2 text-sm text-pink-400 block hover:opacity-80 transition" style="text-decoration:none"><i class="fa-solid fa-heart" style="margin-right:8px"></i>Bài viết đã thích</a>' +
            '<a href="saved.html" class="w-full text-left px-4 py-2 text-sm text-cyan-400 block hover:opacity-80 transition" style="text-decoration:none"><i class="fa-regular fa-bookmark" style="margin-right:8px"></i>Bài viết đã lưu</a>' +
            '<button onclick="Auth.logout()" class="w-full text-left px-4 py-2 text-sm text-red-400 block hover:opacity-80 transition" style="border:none;background:none;cursor:pointer;width:100%"><i class="fa-solid fa-arrow-right-from-bracket" style="margin-right:8px"></i>Đăng xuất</button>' +
            '</div></div></div>';
    } else {
        authHtml = '<a href="auth.html" class="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2 rounded-full text-sm transition syne" style="text-decoration:none">Đăng nhập</a>';
    }
    el.innerHTML = authHtml;
}