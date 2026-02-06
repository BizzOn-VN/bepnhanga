// --- CONFIGURATION ---
// Để tính năng lưu đơn hàng online hoạt động, bạn cần tạo GitHub Personal Access Token
// và điền vào biến bên dưới.
// Hướng dẫn: Settings -> Developer settings -> Personal access tokens -> Tokens (classic) -> Generate new token -> chọn scope 'repo'.
const GITHUB_CONFIG = {
    OWNER: 'BizzOn-VN',
    REPO: 'bepnhanga',
    PATH: 'orders.json',
    // LƯU Ý: Để lộ Token trong code client-side là không bảo mật tuyệt đối cho các dự án lớn.
    // Với dự án cá nhân nhỏ, có thể chấp nhận được, hoặc bạn có thể nhập thủ công mỗi khi vào trang Admin.
    TOKEN: '' // Điền token của bạn vào đây (bắt đầu bằng ghp_...)
};

// --- DATA MANAGEMENT ---

async function getOrdersFromGitHub() {
    if (!GITHUB_CONFIG.TOKEN) {
        // Fallback to localStorage if no token
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    try {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.PATH}`;
        const response = await fetch(url + '?t=' + new Date().getTime(), { // cache busting
            headers: {
                'Authorization': `Bearer ${GITHUB_CONFIG.TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) throw new Error('Không thể kết nối GitHub');

        const data = await response.json();
        // GitHub API returns content in Base64
        const decodedContent = decodeURIComponent(escape(window.atob(data.content)));
        return {
            orders: JSON.parse(decodedContent),
            sha: data.sha // SHA is required to update the file
        };
    } catch (error) {
        console.error('Error fetching orders:', error);
        // Silent fail to local storage or just return empty
        return { orders: [], sha: null };
    }
}

async function saveOrderToGitHub(newOrder) {
    if (!GITHUB_CONFIG.TOKEN) {
        // Fallback: Save to LocalStorage
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.unshift(newOrder); // Add to beginning
        localStorage.setItem('orders', JSON.stringify(orders));
        return true;
    }

    try {
        // 1. Get current content and SHA
        const currentData = await getOrdersFromGitHub();
        let orders = currentData.orders || [];
        const sha = currentData.sha;

        // 2. Add new order
        orders.unshift(newOrder);

        // 3. Prepare content (encode to Base64)
        // Using UTF-8 safe encoding
        const contentString = JSON.stringify(orders, null, 2);
        const contentBase64 = window.btoa(unescape(encodeURIComponent(contentString)));

        // 4. Push update
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.PATH}`;
        const body = {
            message: `New order: ${newOrder.name}`,
            content: contentBase64,
            sha: sha // Required to update existing file
        };

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_CONFIG.TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Lỗi khi lưu file');
        }
        return true;

    } catch (error) {
        console.error('Save error:', error);
        alert('Lỗi khi lưu đơn hàng online: ' + error.message);
        return false;
    }
}

async function updateOrderDeliveryStatus(index, isDelivered) {
    if (!GITHUB_CONFIG.TOKEN) {
        // LocalStorage logic
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        if (orders[index]) {
            orders[index].delivered = isDelivered;
            localStorage.setItem('orders', JSON.stringify(orders));
        }
        return;
    }

    try {
        // 1. Get current content
        const currentData = await getOrdersFromGitHub();
        let orders = currentData.orders;
        const sha = currentData.sha;

        if (!orders || !orders[index]) return;

        // 2. Update status
        orders[index].delivered = isDelivered;

        // 3. Save back
        const contentString = JSON.stringify(orders, null, 2);
        const contentBase64 = window.btoa(unescape(encodeURIComponent(contentString)));

        const url = `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.PATH}`;
        const body = {
            message: `Update status order #${index}`,
            content: contentBase64,
            sha: sha
        };

        await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_CONFIG.TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

    } catch (e) {
        console.error('Error updating status:', e);
        alert('Không thể cập nhật trạng thái online.');
    }
}

// --- DOM ELEMENTS & LOGIC ---
const slides = document.querySelectorAll('.slide-img');
const dots = document.querySelectorAll('.dot');
// const prevBtn = document.querySelector('.prev'); 
// const nextBtn = document.querySelector('.next'); 
const qtyDisplay = document.getElementById('qty-display');
const btnMinus = document.querySelector('.minus');
const btnPlus = document.querySelector('.plus');
const totalPriceEl = document.getElementById('total-price');
const btnToOrder = document.getElementById('btn-to-order');
const views = {
    product: document.getElementById('product-view'),
    order: document.getElementById('order-view'),
    payment: document.getElementById('payment-view')
};
const orderForm = document.getElementById('order-form');
const btnBackProduct = document.getElementById('back-to-product');
const btnBackOrder = document.getElementById('back-to-order');
const btnHome = document.getElementById('btn-home');

// State
let currentSlide = 0;
let quantity = 1;
const UNIT_PRICE = 130000;

// Slider Functionality
function showSlide(n) {
    if (!slides.length) return;
    slides.forEach(slide => slide.style.display = 'none');
    dots.forEach(dot => dot.classList.remove('active'));

    currentSlide = (n + slides.length) % slides.length;

    slides[currentSlide].style.display = 'block';
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

// Auto slide
setInterval(() => {
    if (views.product && views.product.classList.contains('active')) {
        showSlide(currentSlide + 1);
    }
}, 4000);

// Product Logic
function updatePrice() {
    const total = quantity * UNIT_PRICE;
    if (totalPriceEl) totalPriceEl.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
}

if (btnMinus) {
    btnMinus.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            qtyDisplay.textContent = quantity;
            updatePrice();
        }
    });
}

if (btnPlus) {
    btnPlus.addEventListener('click', () => {
        quantity++;
        qtyDisplay.textContent = quantity;
        updatePrice();
    });
}

// Navigation Logic
function switchView(viewName) {
    Object.values(views).forEach(el => {
        if (el) el.classList.remove('active');
    });
    if (views[viewName]) {
        views[viewName].classList.add('active');
        window.scrollTo(0, 0);
    }
}

if (btnToOrder) {
    btnToOrder.addEventListener('click', () => {
        // Update summary
        document.getElementById('summary-qty').textContent = `${quantity} hũ`;
        const total = quantity * UNIT_PRICE;
        document.getElementById('summary-total').textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);

        switchView('order');
    });
}

if (btnBackProduct) btnBackProduct.addEventListener('click', () => switchView('product'));
if (btnBackOrder) btnBackOrder.addEventListener('click', () => switchView('order'));
if (btnHome) {
    btnHome.addEventListener('click', () => {
        // Reset form
        if (orderForm) orderForm.reset();
        quantity = 1;
        if (qtyDisplay) qtyDisplay.textContent = 1;
        updatePrice();
        switchView('product');
    });
}

// Order Form Handling
const phoneInput = document.getElementById('phone');

// Enforce numbers only for phone
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}

if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate Phone (10 digits)
        const phone = phoneInput.value;
        if (phone.length !== 10) {
            alert('Vui lòng nhập đúng 10 số điện thoại!');
            return;
        }

        const name = document.getElementById('fullname').value;
        const address = document.getElementById('address').value;
        const total = quantity * UNIT_PRICE;

        // Helper to remove accents for banking content
        function removeAccents(str) {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d").replace(/Đ/g, "D");
        }

        const description = `${removeAccents(name)} - ${phone}`;

        // Generate Dynamic QR Code URL
        const bankId = 'VAB';
        const accountNo = '00125223';
        const template = 'compact';
        const accountName = 'Nguyen Thi Tu Anh';

        const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${total}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

        // Update valid QR Image
        const qrImage = document.querySelector('.qr-code');
        if (qrImage) {
            qrImage.src = qrUrl;
        }

        // Update raw amount for manual copy
        const manualAmountRaw = document.getElementById('manual-amount-raw');
        if (manualAmountRaw) {
            manualAmountRaw.value = total;
        }

        // Update display content payment
        const paymentContentEl = document.getElementById('payment-content');
        if (paymentContentEl) {
            paymentContentEl.textContent = description.toUpperCase();
        }

        // SAVE ORDER (Async)
        const newOrder = {
            name: name,
            phone: phone,
            address: address,
            quantity: quantity,
            total: total,
            date: new Date().toISOString(),
            delivered: false
        };

        // Show loading
        const btnSubmit = orderForm.querySelector('button[type="submit"]');
        const originalText = btnSubmit.textContent;
        btnSubmit.textContent = 'Đang xử lý...';
        btnSubmit.disabled = true;

        await saveOrderToGitHub(newOrder);

        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;

        switchView('payment');
    });
}

// --- ADMIN / ORDER LIST LOGIC (for order.html) ---
async function loadOrders() {
    const tbody = document.getElementById('order-list');
    if (!tbody) return; // Not on order page

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Đang tải dữ liệu...</td></tr>';

    let savedOrders = [];

    if (GITHUB_CONFIG.TOKEN) {
        const data = await getOrdersFromGitHub();
        savedOrders = data.orders || [];
    } else {
        savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    }

    tbody.innerHTML = '';

    if (savedOrders.length === 0) {
        const tr = document.createElement('tr');
        tr.className = 'empty-state';
        tr.innerHTML = '<td colspan="6">Chưa có đơn hàng nào được ghi nhận.</td>';
        tbody.appendChild(tr);
        return;
    }

    savedOrders.forEach((order, index) => {
        const tr = document.createElement('tr');
        tr.className = 'order-row ' + (order.delivered ? 'delivered' : '');
        tr.innerHTML = `
            <td>${order.name}</td>
            <td>${order.phone}</td>
            <td>${order.address || ''}</td>
            <td>${order.quantity} hũ</td>
            <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</td>
            <td style="text-align: center;">
                <input type="checkbox" class="status-checkbox" data-index="${index}" ${order.delivered ? 'checked' : ''}>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Add event listeners for checkboxes
    document.querySelectorAll('.status-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', async (e) => {
            const index = e.target.getAttribute('data-index');
            const isChecked = e.target.checked;

            // Visual update immediately
            const row = e.target.closest('tr');
            if (isChecked) row.classList.add('delivered');
            else row.classList.remove('delivered');

            // Persist update
            await updateOrderDeliveryStatus(index, isChecked);
        });
    });
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on order page
    if (document.getElementById('order-list')) {
        // If not configured, prompt user (optional)
        if (!GITHUB_CONFIG.TOKEN && window.location.protocol !== 'file:') {
            console.log('Chưa cấu hình GitHub Token. Đang dùng LocalStorage.');
            // Hiển thị cảnh báo nhỏ cho người dùng biết
            const tbody = document.getElementById('order-list');
            if (tbody) {
                // Có thể thêm thông báo ở đây nếu cần
            }
        }
        loadOrders();
    } else {
        showSlide(0);
    }
});

// Copy to clipboard helper
window.copyToClipboard = (elementId) => {
    const el = document.getElementById(elementId);
    let textToCopy = '';

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        textToCopy = el.value;
    } else {
        textToCopy = el.textContent;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Visual feedback
        const btn = document.querySelector(`button[onclick="copyToClipboard('${elementId}')"]`);
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 1000);
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};
