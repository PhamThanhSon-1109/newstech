// ============================================================
// auth.js — TechPulse Login / Register Logic
// ============================================================

if (Auth.isLoggedIn()) {
    const isAdmin = Auth.isAdmin();
    // Only redirect if not already admin or not coming from a restricted page
    if (!isAdmin || !document.referrer.includes('admin.html')) {
        window.location.href = 'index.html';
    }
}

// ── Tab switching ─────────────────────────────────────────
function switchTab(tab) {
    const isL = tab === 'login';
    document.getElementById('form-login').style.display = isL ? 'block' : 'none';
    document.getElementById('form-register').style.display = isL ? 'none' : 'block';
    document.getElementById('tab-login').className = 'tab-btn' + (isL ? ' active' : '');
    document.getElementById('tab-register').className = 'tab-btn' + (!isL ? ' active' : '');
}

// ── Toggle password visibility ────────────────────────────
function togglePwd(id, btn) {
    const inp = document.getElementById(id);
    const isText = inp.type === 'text';
    inp.type = isText ? 'password' : 'text';
    btn.innerHTML = isText
        ? '<i class="fa-regular fa-eye"></i>'
        : '<i class="fa-regular fa-eye-slash"></i>';
}

// ── Password strength indicator ───────────────────────────
document.getElementById('r-password').addEventListener('input', function () {
    const v = this.value;
    const el = document.getElementById('pwd-strength');
    const bar = document.getElementById('strength-bar');
    const lbl = document.getElementById('strength-label');
    if (!v) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const configs = [
        { w: '25%', c: '#ef4444', t: 'Yếu' },
        { w: '50%', c: '#f59e0b', t: 'Trung bình' },
        { w: '75%', c: '#22d3ee', t: 'Khá mạnh' },
        { w: '100%', c: '#10b981', t: 'Rất mạnh' }
    ];
    const cfg = configs[Math.max(0, score - 1)] || configs[0];
    bar.style.width = cfg.w;
    bar.style.background = cfg.c;
    lbl.textContent = 'Mức độ: ' + cfg.t;
    lbl.style.color = cfg.c;
});

// ── Login ─────────────────────────────────────────────────
async function doLogin() {
    const un = document.getElementById('l-username').value.trim();
    const pw = document.getElementById('l-password').value;
    if (!un || !pw) { showToast('Vui lòng điền đầy đủ thông tin', 'error'); return; }
    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right:8px"></i> Đang xử lý...';
    try {
        const r = await api.post('/auth/login', { username: un, password: pw });
        if (r.success) {
            // Decode role from JWT payload (base64 middle part)
            let role = 'USER';
            try {
                const payload = JSON.parse(atob(r.data.split('.')[1]));
                role = payload.role || payload.authorities?.[0]?.authority || 'USER';
                if (role.startsWith('ROLE_')) role = role.slice(5);
            } catch (_) { role = un === 'admin' ? 'ADMIN' : 'USER'; }
            Auth.save(r.data, { username: un, role, avatar: null });
            showToast('Đăng nhập thành công!');
            setTimeout(() => window.location.href = 'index.html', 800);
        } else {
            showToast(r.message || 'Sai tên đăng nhập hoặc mật khẩu', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-right-to-bracket" style="margin-right:8px"></i> Đăng nhập';
        }
    } catch (e) {
        showToast('Lỗi kết nối server', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-right-to-bracket" style="margin-right:8px"></i> Đăng nhập';
    }
}

// ── Register ──────────────────────────────────────────────
async function doRegister() {
    const un = document.getElementById('r-username').value.trim();
    const pw = document.getElementById('r-password').value;
    const cf = document.getElementById('r-confirm').value;
    if (!un || !pw) { showToast('Vui lòng điền đầy đủ thông tin', 'error'); return; }
    if (pw !== cf) { showToast('Mật khẩu xác nhận không khớp', 'error'); return; }
    if (pw.length < 6) { showToast('Mật khẩu tối thiểu 6 ký tự', 'error'); return; }
    const btn = document.getElementById('register-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right:8px"></i> Đang xử lý...';
    try {
        const r = await api.post('/auth/register', { username: un, password: pw });
        if (r.success) {
            showToast('Đăng ký thành công! Hãy đăng nhập.');
            setTimeout(() => switchTab('login'), 1000);
        } else {
            showToast(r.message || 'Đăng ký thất bại', 'error');
        }
    } catch (e) {
        showToast('Lỗi kết nối server', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-user-plus" style="margin-right:8px"></i> Tạo tài khoản';
    }
}

// ── Enter key shortcuts ───────────────────────────────────
document.getElementById('l-password').addEventListener('keypress', e => { if (e.key === 'Enter') doLogin(); });
document.getElementById('r-confirm').addEventListener('keypress', e => { if (e.key === 'Enter') doRegister(); });
