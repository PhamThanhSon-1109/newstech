// ============================================================
// admin.js — TechPulse Admin Panel Logic
// ============================================================

// Auth guard
if (!Auth.isLoggedIn()) {
    window.location.href = 'auth.html';
} else if (!Auth.isAdmin()) {
    showToast('Tài khoản của bạn không có quyền Admin', 'error');
    setTimeout(() => window.location.href = 'index.html', 1500);
}
const u = Auth.getUser();
if (u) {
    const displayName = u.fullName || u.username;
    document.getElementById('admin-name').textContent = displayName;
    document.getElementById('welcome-name').textContent = displayName;

    const av = document.getElementById('admin-av');
    if (u.avatar) {
        av.src = getImgUrl(u.avatar);
    } else {
        av.src = `https://ui-avatars.com/api/?name=${displayName}&background=0e7490&color=fff`;
    }
}

let delFn = null;
let pPage = 0, pTotal = 1, pSearch = '';

// ── Tab switching ─────────────────────────────────────────
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('nav-' + tab).classList.add('active');
    if (tab === 'dashboard') loadDashboard();
    if (tab === 'posts') loadPostsTable(0);
    if (tab === 'categories') loadCatTable();
    if (tab === 'users') loadUsersTable();
}

// ── Dashboard ─────────────────────────────────────────────
async function loadDashboard() {
    try {
        const [pr, cr] = await Promise.all([
            api.get('/posts?page=0&size=100'),
            api.get('/categories')
        ]);
        document.getElementById('stat-posts').textContent =
            pr.data?.totalElements ?? pr.data?.content?.length ?? 0;
        document.getElementById('stat-cats').textContent = (cr.data || []).length;

        // Load users count via dedicated endpoint
        api.get('/users/count').then(r => {
            document.getElementById('stat-users').textContent = r.data ?? 0;
        }).catch(() => {
            document.getElementById('stat-users').textContent = '?';
        });

        const posts = pr.data?.content || [];
        document.getElementById('dash-table').innerHTML = posts.slice(0, 8).map(p =>
            `<tr>
                <td><div style="display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;max-width:300px;font-size:13px;font-weight:500">${escHtml(p.title)}</div></td>
                <td><span class="badge badge-user">${escHtml(p.categoryName || '-')}</span></td>
                <td style="font-size:13px;color:var(--text-muted)">${escHtml(p.authorName || 'Admin')}</td>
                <td style="font-size:12px;color:var(--text-muted)">${formatDate(p.createdAt)}</td>
                <td><a href="post.html?slug=${p.slug}" target="_blank" style="font-size:12px;color:var(--cyan);text-decoration:none">Xem</a></td>
            </tr>`
        ).join('');
    } catch (e) {
        document.getElementById('stat-posts').textContent = 'Err';
    }
}

// ── Posts table ───────────────────────────────────────────
async function loadPostsTable(page) {
    pPage = page || 0;
    const tb = document.getElementById('posts-table');
    tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text-muted);font-size:13px">Đang tải...</td></tr>';
    try {
        const path = pSearch
            ? `/posts?keyword=${encodeURIComponent(pSearch)}&page=${pPage}&size=10`
            : `/posts?page=${pPage}&size=10`;
        const r = await api.get(path);
        const posts = r.data?.content || [];
        pTotal = r.data?.totalPages || 1;
        if (!posts.length) {
            tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text-muted);font-size:13px">Không có bài viết nào.</td></tr>';
            return;
        }
        tb.innerHTML = posts.map(p =>
            `<tr>
                <td><img src="${getImgUrl(p.thumbnail) || 'https://picsum.photos/seed/' + p.id + '/80/60'}" style="width:80px;height:50px;object-fit:cover;border-radius:4px" onerror="this.src='https://picsum.photos/seed/${p.id}/80/60'"></td>
                <td><div style="max-width:240px;font-size:13px;font-weight:500;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${escHtml(p.title)}</div></td>
                <td><span class="badge badge-user" style="font-size:11px">${escHtml(p.categoryName || '-')}</span></td>
                <td style="font-size:12px;color:var(--text-muted)">${escHtml(p.authorName || 'Admin')}</td>
                <td style="font-size:12px;color:var(--text-muted)">${formatDate(p.createdAt)}</td>
                <td><div style="display:flex;gap:6px">
                    <a href="write.html?id=${p.id}" class="action-btn btn-edit">Sửa</a>
                    <button class="action-btn btn-del" onclick='delPost(${p.id}, ${JSON.stringify(p.title.substring(0, 30))})'>Xóa</button>
                </div></td>
            </tr>`
        ).join('');
        renderPostsPagination();
    } catch (e) {
        tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:28px;color:#ef4444;font-size:13px">Lỗi kết nối.</td></tr>';
    }
}

function renderPostsPagination() {
    const el = document.getElementById('posts-pagination');
    if (pTotal <= 1) { el.innerHTML = ''; return; }
    let html = '';
    for (let i = 0; i < Math.min(pTotal, 8); i++) {
        html += `<button class="page-btn${i === pPage ? ' active' : ''}" style="width:32px;height:32px;border-radius:50%;font-size:12px" onclick="loadPostsTable(${i})">${i + 1}</button>`;
    }
    el.innerHTML = html;
}

// ── Categories table ──────────────────────────────────────
async function loadCatTable() {
    const tb = document.getElementById('cat-table');
    try {
        const r = await api.get('/categories');
        const cats = r.data || [];
        if (!cats.length) {
            tb.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:28px;color:var(--text-muted);font-size:13px">Chưa có chuyên mục.</td></tr>';
            return;
        }
        tb.innerHTML = cats.map(c =>
            `<tr>
                <td style="font-size:13px;color:var(--text-muted)">${c.id}</td>
                <td style="font-size:14px;font-weight:500">${escHtml(c.name)}</td>
                <td style="font-size:12px;color:var(--text-muted);font-family:monospace">${c.slug || '-'}</td>
                <td><div style="display:flex;gap:6px">
                    <button class="action-btn btn-edit" onclick='editCat(${c.id}, ${JSON.stringify(c.name)})'>Sửa</button>
                    <button class="action-btn btn-del" onclick='delCat(${c.id}, ${JSON.stringify(c.name)})'>Xóa</button>
                </div></td>
            </tr>`
        ).join('');
    } catch (e) {
        tb.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#ef4444;padding:28px;font-size:13px">Lỗi tải dữ liệu.</td></tr>';
    }
}

// ── Users table ───────────────────────────────────────────
async function loadUsersTable() {
    const tb = document.getElementById('users-table');
    tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:28px;color:var(--text-muted);font-size:13px">Đang tải...</td></tr>';
    try {
        const r = await api.get('/users');
        const users = r.data?.content || (Array.isArray(r.data) ? r.data : []);
        if (!users.length) {
            tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:28px;color:var(--text-muted);font-size:13px">Chưa có người dùng.</td></tr>';
            return;
        }
        tb.innerHTML = users.map(u =>
            `<tr>
                <td style="font-size:13px;color:var(--text-muted)">${u.id}</td>
                <td style="font-size:14px;font-weight:500">${escHtml(u.username)}</td>
                <td style="font-size:13px;color:var(--text-muted)">${escHtml(u.fullName || u.displayName || '-')}</td>
                <td><span class="badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}">${u.role || 'USER'}</span></td>
                <td style="font-size:12px;color:var(--text-muted)">${formatDate(u.createdAt)}</td>
            </tr>`
        ).join('');
    } catch (e) {
        tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:28px;color:var(--text-muted);font-size:13px">API người dùng chưa có endpoint.<br><small style="font-size:11px;opacity:.7">Thêm GET /api/v1/users vào Spring Boot để hiển thị.</small></td></tr>';
    }
}

// ── Category CRUD ─────────────────────────────────────────
function showCatModal(id, name) {
    document.getElementById('cat-id').value = id || '';
    document.getElementById('cat-name').value = name || '';
    document.getElementById('cat-modal-title').textContent = id ? 'Sửa chuyên mục' : 'Thêm chuyên mục';
    document.getElementById('cat-modal').style.display = 'flex';
    setTimeout(() => document.getElementById('cat-name').focus(), 100);
}

function editCat(id, name) { showCatModal(id, name); }

async function saveCat() {
    const id = document.getElementById('cat-id').value;
    const name = document.getElementById('cat-name').value.trim();
    if (!name) { showToast('Vui lòng nhập tên', 'error'); return; }
    try {
        const r = id
            ? await api.put('/categories/' + id, { name })
            : await api.post('/categories', { name });
        if (r.data || r.success !== false) {
            document.getElementById('cat-modal').style.display = 'none';
            showToast(id ? 'Đã cập nhật!' : 'Đã thêm chuyên mục!');
            loadCatTable();
        } else {
            showToast(r.message || 'Lỗi', 'error');
        }
    } catch (e) { showToast('Lỗi kết nối', 'error'); }
}

function delCat(id, name) {
    document.getElementById('del-msg').textContent = `Xóa chuyên mục "${name}"?`;
    delFn = async () => {
        try {
            await api.del('/categories/' + id);
            document.getElementById('del-modal').style.display = 'none';
            showToast('Đã xóa chuyên mục!');
            loadCatTable();
        } catch (e) {
            document.getElementById('del-modal').style.display = 'none';
            showToast('Lỗi khi xóa: ' + (e.message || 'Không xác định'), 'error');
        }
    };
    document.getElementById('del-modal').style.display = 'flex';
}

function delPost(id, name) {
    document.getElementById('del-msg').textContent = `Xóa bài viết "${name}..."?`;
    delFn = async () => {
        try {
            await api.del('/posts/' + id);
            document.getElementById('del-modal').style.display = 'none';
            showToast('Đã xóa bài viết!');
            loadPostsTable(pPage);
        } catch (e) {
            document.getElementById('del-modal').style.display = 'none';
            showToast('Lỗi khi xóa: ' + (e.message || 'Không xác định'), 'error');
        }
    };
    document.getElementById('del-modal').style.display = 'flex';
}

function confirmDelete() { if (delFn) delFn(); }

// ── Search debounce ───────────────────────────────────────
let sTimer = null;
document.getElementById('post-search').addEventListener('input', function () {
    clearTimeout(sTimer);
    pSearch = this.value.trim();
    sTimer = setTimeout(() => loadPostsTable(0), 350);
});

// ── Helper ────────────────────────────────────────────────
function escHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── Init ──────────────────────────────────────────────────
loadDashboard();
