// ============================================================
// write.js — TechPulse Admin Post Create/Edit Logic
// ============================================================

if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
    window.location.href = 'auth.html';
}

const params = new URLSearchParams(location.search);
const editId = params.get('id');

async function init() {
    // Load categories
    try {
        const r = await api.get('/categories');
        const cats = r.data || [];
        document.getElementById('p-cat').innerHTML += cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (e) { }

    // If edit mode, load data
    if (editId) {
        document.getElementById('page-title').textContent = 'Sửa bài viết';
        document.getElementById('save-btn').innerHTML = '<i class="fa-solid fa-check" style="margin-right:8px"></i>Cập nhật';
        try {
            // Need to get post by ID, assuming the endpoint exists or we use search by slug/list filtering.
            // As fallback, we'll fetch /posts/{id} if exists, else fetch all to find it.
            const pRes = await fetch(API_BASE + '/posts/' + editId, { headers: api._headers() }).then(res => res.json());
            const p = pRes.data || pRes; // Handle wrapper if any
            if (p.id) {
                document.getElementById('post-id').value = p.id;
                document.getElementById('p-title').value = p.title || '';
                document.getElementById('p-slug').value = p.slug || '';
                document.getElementById('p-excerpt').value = p.excerpt || '';
                document.getElementById('p-thumb').value = p.thumbnail || '';
                if (p.thumbnail) {
                    const pre = document.getElementById('thumb-preview');
                    const img = document.getElementById('p-thumb-img');
                    img.src = getImgUrl(p.thumbnail);
                    pre.style.display = 'block';
                }
                document.getElementById('p-content').value = p.content || '';
                if (p.categoryId || p.categoryName) {
                    const sel = document.getElementById('p-cat');
                    Array.from(sel.options).forEach(opt => {
                        if (opt.text === p.categoryName || opt.value == p.categoryId) {
                            sel.value = opt.value;
                        }
                    });
                }
            }
        } catch (e) {
            showToast('Lỗi tải bài viết', 'error');
        }
    }
}

function genSlug() {
    const title = document.getElementById('p-title').value;
    const slug = title.toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-");

    // Only auto-fill if user hasn't explicitly typed something else
    const slugInput = document.getElementById('p-slug');
    if (!editId || slugInput.value.trim() === '') {
        slugInput.value = slug;
    }
}

async function uploadThumb(input) {
    if (!input.files || !input.files[0]) return;
    showToast('Đang tải ảnh...', 'info');
    try {
        const r = await api.upload(input.files[0]);
        if (r.success && r.data) {
            document.getElementById('p-thumb').value = r.data;
            const pre = document.getElementById('thumb-preview');
            const img = document.getElementById('p-thumb-img');
            img.src = getImgUrl(r.data);
            pre.style.display = 'block';
            showToast('Tải ảnh thành công!');
        }
    } catch (e) { showToast('Lỗi tải ảnh', 'error'); }
}

async function savePost() {
    const id = document.getElementById('post-id').value;
    const data = {
        title: document.getElementById('p-title').value.trim(),
        categoryId: document.getElementById('p-cat').value,
        slug: document.getElementById('p-slug').value.trim(),
        excerpt: document.getElementById('p-excerpt').value.trim(),
        thumbnail: document.getElementById('p-thumb').value.trim(),
        content: document.getElementById('p-content').value.trim(),
    };

    if (!data.title) { showToast('Vui lòng nhập tiêu đề', 'error'); return; }
    if (!data.categoryId) { showToast('Vui lòng chọn chuyên mục', 'error'); return; }
    if (!data.content) { showToast('Vui lòng nhập nội dung', 'error'); return; }

    const btn = document.getElementById('save-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right:8px"></i>Đang lưu...';

    try {
        const r = id ? await api.put('/posts/' + id, data) : await api.post('/posts', data);
        if (r.success !== false) {
            showToast(id ? 'Đã cập nhật bài viết!' : 'Đã đăng bài thành công!');
            setTimeout(() => window.location.href = 'admin.html', 1000);
        } else {
            showToast(r.message || 'Lỗi lưu bài viết', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-check" style="margin-right:8px"></i>' + (id ? 'Cập nhật' : 'Lưu bài viết');
        }
    } catch (e) {
        showToast('Lỗi kết nối', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-check" style="margin-right:8px"></i>' + (id ? 'Cập nhật' : 'Lưu bài viết');
    }
}

init();