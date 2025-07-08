// --- CART FUNCTIONALITY FOR ALL PAGES ---
document.addEventListener('DOMContentLoaded', function() {
    // --- DOM ELEMENTS ---
    const cartButton = document.querySelector('.cart-btn');
    const cartBadge = document.getElementById('cartBadge');
    const cartModal = document.getElementById('cart-modal');
    
    // Check if cart modal exists
    if (!cartModal) {
        console.warn('Cart modal not found on this page');
        return;
    }

    const cartModalOverlay = cartModal.querySelector('.cart-modal__overlay');
    const cartModalClose = cartModal.querySelector('.cart-modal__close');
    const cartModalItems = cartModal.querySelector('.cart-modal__items');
    const cartModalTotal = cartModal.querySelector('.cart-modal__total-value');
    const cartModalClear = cartModal.querySelector('.cart-modal__clear');

    // --- CART BADGE ---
    function updateCartBadge() {
        if (!cartBadge) return;
        // Use the global cart variable from app.js if available, otherwise use localStorage
        let cart = [];
        if (typeof window.cart !== 'undefined') {
            cart = window.cart;
        } else {
            cart = JSON.parse(localStorage.getItem('chocoCart')) || [];
        }
        
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        if (count > 0) {
            cartBadge.textContent = count;
            cartBadge.classList.add('show');
        } else {
            cartBadge.classList.remove('show');
        }
    }

    // --- SAVE CART TO LOCALSTORAGE ---
    function saveCart() {
        let cart = [];
        if (typeof window.cart !== 'undefined') {
            cart = window.cart;
        } else {
            cart = JSON.parse(localStorage.getItem('chocoCart')) || [];
        }
        localStorage.setItem('chocoCart', JSON.stringify(cart));
    }

    // --- CART MODAL RENDER ---
    function renderCartModal() {
        if (!cartModalItems) return;
        
        // Use the global cart variable from app.js if available, otherwise use localStorage
        let cart = [];
        if (typeof window.cart !== 'undefined') {
            cart = window.cart;
        } else {
            cart = JSON.parse(localStorage.getItem('chocoCart')) || [];
        }
        
        cartModalItems.innerHTML = '';
        if (cart.length === 0) {
            cartModalItems.innerHTML = '<div style="text-align:center;color:var(--textSecondary);font-weight:600;">Your cart is empty.</div>';
            if (cartModalTotal) cartModalTotal.textContent = '$0.00';
            return;
        }
        
        let total = 0;
        cart.forEach((item, idx) => {
            const itemPrice = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
            total += item.qty * itemPrice;
            const el = document.createElement('div');
            el.className = 'cart-modal__item';
            el.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-modal__item-img" />
                <div class="cart-modal__item-info">
                    <div class="cart-modal__item-name">${item.name}</div>
                    <div class="cart-modal__item-qty">Qty: ${item.qty}</div>
                    <div class="cart-modal__item-price">$${(itemPrice * item.qty).toFixed(2)}</div>
                </div>
                <button class="cart-modal__item-remove" title="Remove item" data-idx="${idx}">&times;</button>
            `;
            cartModalItems.appendChild(el);
        });
        if (cartModalTotal) cartModalTotal.textContent = `$${total.toFixed(2)}`;
    }

    // --- CART MODAL OPEN/CLOSE ---
    function openCartModal() {
        renderCartModal();
        cartModal.classList.add('active');
        cartModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeCartModal() {
        cartModal.classList.remove('active');
        cartModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // --- EVENT LISTENERS ---
    if (cartButton) {
        cartButton.addEventListener('click', openCartModal);
    }

    if (cartModalOverlay) {
        cartModalOverlay.addEventListener('click', closeCartModal);
    }

    if (cartModalClose) {
        cartModalClose.addEventListener('click', closeCartModal);
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (cartModal.classList.contains('active') && (e.key === 'Escape' || e.key === 'Esc')) {
            closeCartModal();
        }
    });

    // --- REMOVE/CLEAR CART ---
    if (cartModalItems) {
        cartModalItems.addEventListener('click', function(e) {
            if (e.target.classList.contains('cart-modal__item-remove')) {
                const idx = +e.target.getAttribute('data-idx');
                // Use the global cart variable from app.js if available
                if (typeof window.cart !== 'undefined') {
                    window.cart.splice(idx, 1);
                    // Call the global updateCartBadge function if available
                    if (typeof window.updateCartBadge === 'function') {
                        window.updateCartBadge();
                    }
                } else {
                    let cart = JSON.parse(localStorage.getItem('chocoCart')) || [];
                    cart.splice(idx, 1);
                    localStorage.setItem('chocoCart', JSON.stringify(cart));
                }
                updateCartBadge();
                renderCartModal();
            }
        });
    }

    if (cartModalClear) {
        cartModalClear.addEventListener('click', function() {
            // Use the global cart variable from app.js if available
            if (typeof window.cart !== 'undefined') {
                window.cart = [];
                // Call the global updateCartBadge function if available
                if (typeof window.updateCartBadge === 'function') {
                    window.updateCartBadge();
                }
            } else {
                localStorage.setItem('chocoCart', JSON.stringify([]));
            }
            updateCartBadge();
            renderCartModal();
        });
    }

    // --- ADD TO CART FUNCTION (for external use) ---
    window.addToCart = function(name, price, img, qty = 1) {
        // Use the global cart variable from app.js if available
        if (typeof window.cart !== 'undefined') {
            const idx = window.cart.findIndex(i => i.name === name && i.price === price && i.img === img);
            if (idx > -1) {
                window.cart[idx].qty += qty;
            } else {
                window.cart.push({ name, price, img, qty });
            }
            // Call the global updateCartBadge function if available
            if (typeof window.updateCartBadge === 'function') {
                window.updateCartBadge();
            }
        } else {
            let cart = JSON.parse(localStorage.getItem('chocoCart')) || [];
            const idx = cart.findIndex(i => i.name === name && i.price === price && i.img === img);
            if (idx > -1) {
                cart[idx].qty += qty;
            } else {
                cart.push({ name, price, img, qty });
            }
            localStorage.setItem('chocoCart', JSON.stringify(cart));
        }
        updateCartBadge();
    };

    // --- OPEN CART MODAL FUNCTION (for external use) ---
    window.openCartModal = openCartModal;

    // --- INITIALIZE ---
    updateCartBadge();
}); 