document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const PRICE_PER_UNIT = 130000;

    // --- State ---
    let quantity = 1;

    // --- DOM Elements ---
    // Views
    const viewProduct = document.getElementById('product-view');
    const viewOrder = document.getElementById('order-view');
    const viewPayment = document.getElementById('payment-view');

    // Product View Controls
    const btnMinus = document.querySelector('.qty-btn.minus');
    const btnPlus = document.querySelector('.qty-btn.plus');
    const qtyDisplay = document.getElementById('qty-display');
    const totalPriceDisplay = document.getElementById('total-price');
    const btnToOrder = document.getElementById('btn-to-order');

    // Slider
    const slider = document.querySelector('.slider');
    const dots = document.querySelectorAll('.dot');
    const btnPrevSlide = document.createElement('button');
    const btnNextSlide = document.createElement('button');

    // Order View Controls
    const btnBackToProduct = document.getElementById('back-to-product');
    const summaryQty = document.getElementById('summary-qty');
    const summaryTotal = document.getElementById('summary-total');
    const orderForm = document.getElementById('order-form');

    // Payment View Controls
    const btnBackToOrder = document.getElementById('back-to-order');
    const btnHome = document.getElementById('btn-home');
    const paymentAmount = document.getElementById('payment-amount');
    const paymentContent = document.getElementById('payment-content');

    // --- Phone Validation & Filtering ---
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            if (e.target.value.length === 10) {
                e.target.setCustomValidity('');
            } else {
                e.target.setCustomValidity('Số điện thoại phải có đúng 10 chữ số');
            }
        });
    }

    // --- Functions ---

    // Formatting currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Helper to remove accents
    const removeAccents = (str) => {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D');
    };

    // Update Price & Quantity UI
    const updateProductUI = () => {
        qtyDisplay.textContent = quantity;
        const total = quantity * PRICE_PER_UNIT;
        totalPriceDisplay.textContent = formatCurrency(total);

        // Update Summary in Order View interactions
        summaryQty.textContent = `${quantity} hũ`;
        summaryTotal.textContent = formatCurrency(total);
    };

    // View Navigation
    const switchView = (targetViewId) => {
        // Hide all views
        [viewProduct, viewOrder, viewPayment].forEach(view => {
            view.classList.remove('active');
        });

        // Show target view
        document.getElementById(targetViewId).classList.add('active');

        // Scroll to top
        window.scrollTo(0, 0);
    };

    // --- Event Listeners ---

    // Quantity Controls
    btnMinus.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            updateProductUI();
        }
    });

    btnPlus.addEventListener('click', () => {
        quantity++;
        updateProductUI();
    });

    // Navigation Buttons
    btnToOrder.addEventListener('click', () => {
        switchView('order-view');
    });

    btnBackToProduct.addEventListener('click', () => {
        switchView('product-view');
    });

    btnBackToOrder.addEventListener('click', () => {
        switchView('order-view');
    });

    btnHome.addEventListener('click', () => {
        // Reset form
        orderForm.reset();
        quantity = 1;
        updateProductUI();
        switchView('product-view');
    });

    // Slider Logic with Arrows
    const setupSlider = () => {
        const sliderContainer = document.querySelector('.slider-container');

        if (!sliderContainer) return;

        // Create Buttons
        btnPrevSlide.className = 'slider-btn prev';
        btnPrevSlide.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';

        btnNextSlide.className = 'slider-btn next';
        btnNextSlide.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';

        sliderContainer.appendChild(btnPrevSlide);
        sliderContainer.appendChild(btnNextSlide);

        // Events
        btnPrevSlide.addEventListener('click', () => {
            slider.scrollBy({ left: -slider.offsetWidth, behavior: 'smooth' });
        });

        btnNextSlide.addEventListener('click', () => {
            slider.scrollBy({ left: slider.offsetWidth, behavior: 'smooth' });
        });

        // Scroll listener for dots
        slider.addEventListener('scroll', () => {
            const scrollLeft = slider.scrollLeft;
            const width = slider.offsetWidth;
            const activeIndex = Math.round(scrollLeft / width);

            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        });
    };
    setupSlider();

    // Order Form Submit
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const formData = new FormData(orderForm);
        const name = formData.get('fullname');
        const phone = formData.get('phone');
        const address = formData.get('address');

        // Strict validation check again
        if (phone.length !== 10) {
            alert('Vui lòng nhập đúng 10 số điện thoại!');
            phoneInput.focus();
            return;
        }

        // Update Payment View Details
        const total = quantity * PRICE_PER_UNIT;
        paymentAmount.textContent = formatCurrency(total);

        // Format content as: NAME - SDT (No accents)
        const cleanName = removeAccents(name.trim()).toUpperCase();
        const cleanPhone = phone.trim();
        const description = `${cleanName} - ${cleanPhone}`;
        paymentContent.textContent = description;

        // Generate Dynamic QR Code URL
        // https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
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

        // SAVE ORDER to LocalStorage
        const newOrder = {
            name: name,
            phone: phone,
            address: address, // NEW: Capture address
            quantity: quantity,
            total: total,
            date: new Date().toISOString()
        };
        const existingOrders = JSON.parse(localStorage.getItem('mami_orders') || '[]');
        existingOrders.push(newOrder);
        localStorage.setItem('mami_orders', JSON.stringify(existingOrders));

        // Navigate
        switchView('payment-view');
    });

    // Initial state setup
    updateProductUI();
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
        // Visual feedback (optional)
        const btn = document.querySelector(`button[onclick="copyToClipboard('${elementId}')"]`);
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = 'Đã chép!';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 1500);
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};
