const hardwareData = {
    "RTX 5090 (Rumored)": { type: "GPU", arch: "Blackwell", cores: 24576, base: 2.9, boost: 3.3, vram: 32, tdp: 600, price: 1999 },
    "RTX 4090": { type: "GPU", arch: "Ada Lovelace", cores: 16384, base: 2.23, boost: 2.52, vram: 24, tdp: 450, price: 1599 },
    "RTX 4080 Super": { type: "GPU", arch: "Ada Lovelace", cores: 10240, base: 2.29, boost: 2.55, vram: 16, tdp: 320, price: 999 },
    "RX 7900 XTX": { type: "GPU", arch: "RDNA 3", cores: 6144, base: 2.3, boost: 2.5, vram: 24, tdp: 355, price: 999 },
    "RX 7900 XT": { type: "GPU", arch: "RDNA 3", cores: 5376, base: 2.0, boost: 2.4, vram: 20, tdp: 315, price: 899 },
    "Intel Core Ultra 9 285K": { type: "CPU", arch: "Arrow Lake", cores: 24, base: 3.2, boost: 5.7, vram: 0, tdp: 125, price: 589 },
    "Intel Core i9-14900K": { type: "CPU", arch: "Raptor Lake", cores: 24, base: 3.2, boost: 6.0, vram: 0, tdp: 253, price: 589 },
    "Ryzen 9 9950X": { type: "CPU", arch: "Zen 5", cores: 16, base: 4.3, boost: 5.7, vram: 0, tdp: 170, price: 649 },
    "Ryzen 7 7800X3D": { type: "CPU", arch: "Zen 4", cores: 8, base: 4.2, boost: 5.0, vram: 0, tdp: 120, price: 449 }
};

const specConfig = [
    { key: 'arch', label: 'Kiến trúc', higherIsBetter: null, suffix: '' },
    { key: 'cores', label: 'Số nhân (Cores)', higherIsBetter: true, suffix: '' },
    { key: 'base', label: 'Xung cơ bản', higherIsBetter: true, suffix: ' GHz' },
    { key: 'boost', label: 'Xung tối đa', higherIsBetter: true, suffix: ' GHz' },
    { key: 'vram', label: 'Bộ nhớ (VRAM)', higherIsBetter: true, suffix: ' GB' },
    { key: 'tdp', label: 'Điện năng tiêu thụ (TDP)', higherIsBetter: false, suffix: ' W' }, // Lower is better
    { key: 'price', label: 'Giá dự kiến', higherIsBetter: false, suffix: ' USD' } // Lower is better
];

document.addEventListener('DOMContentLoaded', () => {
    const hw1 = document.getElementById('hw1');
    const hw2 = document.getElementById('hw2');
    
    // Populate dropdowns
    const keys = Object.keys(hardwareData);
    let options = '<option value="">Chọn linh kiện...</option>';
    
    options += '<optgroup label="Card Đồ Họa (GPU)">';
    keys.filter(k => hardwareData[k].type === 'GPU').forEach(k => options += `<option value="${k}">${k}</option>`);
    options += '</optgroup>';
    
    options += '<optgroup label="Vi Xử Lý (CPU)">';
    keys.filter(k => hardwareData[k].type === 'CPU').forEach(k => options += `<option value="${k}">${k}</option>`);
    options += '</optgroup>';

    hw1.innerHTML = options;
    hw2.innerHTML = options;
});

function renderComparison() {
    const k1 = document.getElementById('hw1').value;
    const k2 = document.getElementById('hw2').value;
    const table = document.getElementById('spec-table');
    const empty = document.getElementById('empty-state');
    const tbody = document.getElementById('spec-body');

    if (!k1 || !k2) {
        table.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    empty.style.display = 'none';

    document.getElementById('th1').textContent = k1;
    document.getElementById('th2').textContent = k2;

    const v1 = hardwareData[k1];
    const v2 = hardwareData[k2];

    let html = '';
    
    // Check if they are of the same type. If not, show warning
    if (v1.type !== v2.type) {
        showToast('Bạn đang so sánh CPU với GPU, một số thông số có thể không tương đương.', 'error');
    }

    specConfig.forEach(cfg => {
        // Skip VRAM for CPU comparisons
        if (cfg.key === 'vram' && v1.type === 'CPU' && v2.type === 'CPU') return;

        let val1 = v1[cfg.key];
        let val2 = v2[cfg.key];
        
        let class1 = 'neutral';
        let class2 = 'neutral';

        if (cfg.higherIsBetter !== null && typeof val1 === 'number' && typeof val2 === 'number') {
            if (val1 === val2) {
                // draw
            } else if ((val1 > val2 && cfg.higherIsBetter) || (val1 < val2 && !cfg.higherIsBetter)) {
                class1 = 'winner';
                class2 = 'loser';
            } else {
                class1 = 'loser';
                class2 = 'winner';
            }
        }

        const display1 = val1 === 0 ? '-' : (val1 + cfg.suffix);
        const display2 = val2 === 0 ? '-' : (val2 + cfg.suffix);

        html += `
            <tr>
                <td class="spec-label">${cfg.label}</td>
                <td class="${class1}">${display1}</td>
                <td class="${class2}">${display2}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}
