// --- CART STATE ---
let cart = [];

// --- DOM ELEMENTS ---
const cartButton = document.querySelector('.cart-btn');
const cartBadge = document.getElementById('cartBadge');
const cartModal = document.getElementById('cart-modal');
const cartModalOverlay = cartModal.querySelector('.cart-modal__overlay');
const cartModalClose = cartModal.querySelector('.cart-modal__close');
const cartModalItems = cartModal.querySelector('.cart-modal__items');
const cartModalTotal = cartModal.querySelector('.cart-modal__total-value');
const cartModalClear = cartModal.querySelector('.cart-modal__clear');

// --- CART BADGE ---
function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    if (count > 0) {
        cartBadge.textContent = count;
        cartBadge.classList.add('show');
    } else {
        cartBadge.classList.remove('show');
    }
}

// --- CART MODAL RENDER ---
function renderCartModal() {
    cartModalItems.innerHTML = '';
    if (cart.length === 0) {
        cartModalItems.innerHTML = '<div style="text-align:center;color:var(--textSecondary);font-weight:600;">Your cart is empty.</div>';
        cartModalTotal.textContent = '$0.00';
        return;
    }
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.qty * item.price;
        const el = document.createElement('div');
        el.className = 'cart-modal__item';
        el.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="cart-modal__item-img" />
            <div class="cart-modal__item-info">
                <div class="cart-modal__item-name">${item.name}</div>
                <div class="cart-modal__item-qty">Qty: ${item.qty}</div>
                <div class="cart-modal__item-price">$${(item.price * item.qty).toFixed(2)}</div>
            </div>
            <button class="cart-modal__item-remove" title="Remove item" data-idx="${idx}">&times;</button>
        `;
        cartModalItems.appendChild(el);
    });
    cartModalTotal.textContent = `$${total.toFixed(2)}`;
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
cartButton.addEventListener('click', openCartModal);
cartModalOverlay.addEventListener('click', closeCartModal);
cartModalClose.addEventListener('click', closeCartModal);
document.addEventListener('keydown', (e) => {
    if (cartModal.classList.contains('active') && (e.key === 'Escape' || e.key === 'Esc')) closeCartModal();
});

// --- REMOVE/CLEAR CART ---
cartModalItems.addEventListener('click', function(e) {
    if (e.target.classList.contains('cart-modal__item-remove')) {
        const idx = +e.target.getAttribute('data-idx');
        cart.splice(idx, 1);
        updateCartBadge();
        renderCartModal();
    }
});
cartModalClear.addEventListener('click', function() {
    cart = [];
    updateCartBadge();
    renderCartModal();
});

// --- ADD TO CART (from menu modal) ---
function setupMenuItemModal() {
    const modal = document.getElementById('menu-modal');
    const modalImg = modal.querySelector('.menu-modal__image');
    const modalName = modal.querySelector('.menu-modal__name');
    const modalDesc = modal.querySelector('.menu-modal__description');
    const modalPrice = modal.querySelector('.menu-modal__price');
    const closeBtn = modal.querySelector('.menu-modal__close');
    const overlay = modal.querySelector('.menu-modal__overlay');
    const addToCartBtn = modal.querySelector('.menu-modal__add-to-cart');

    function openModal({img, name, desc, price}) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || name;
        modalName.textContent = name;
        modalDesc.textContent = desc || '';
        modalDesc.style.display = desc ? '' : 'none';
        modalPrice.textContent = price || '';
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    function closeModal() {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('active') && (e.key === 'Escape' || e.key === 'Esc')) closeModal();
    });

    // Add to Cart functionality
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            // --- ADD TO CART LOGIC ---
            const name = modalName.textContent;
            const price = parseFloat((modalPrice.textContent || '').replace(/[^\d.]/g, ''));
            const img = modalImg.src;
            // If item exists, increment qty
            const idx = cart.findIndex(i => i.name === name && i.price === price && i.img === img);
            if (idx > -1) {
                cart[idx].qty++;
            } else {
                cart.push({ name, price, img, qty: 1 });
            }
            updateCartBadge();
            // --- FEEDBACK ---
            const originalText = addToCartBtn.textContent;
            const originalBg = addToCartBtn.style.backgroundColor;
            const originalColor = addToCartBtn.style.color;
            addToCartBtn.textContent = 'ENJOY!';
            addToCartBtn.style.backgroundColor = 'var(--textSecondary)';
            addToCartBtn.style.color = 'white';
            addToCartBtn.disabled = true;
            addToCartBtn.style.transform = 'scale(1.05)';
            setTimeout(() => {
                addToCartBtn.textContent = originalText;
                addToCartBtn.style.backgroundColor = 'var(--textSecondary)';
                addToCartBtn.style.color = 'var(--textPrimary)';
                addToCartBtn.disabled = false;
                addToCartBtn.style.transform = '';
            }, 1500);
        });
    }

    document.querySelectorAll('.menu-item').forEach(item => {
        const img = item.querySelector('.menu-item__image');
        const name = item.querySelector('.menu-item__name');
        const desc = item.querySelector('.menu-item__description');
        const price = item.querySelector('.menu-item__price');
        function show() {
            openModal({
                img,
                name: name ? name.textContent : '',
                desc: desc ? desc.textContent : '',
                price: price ? price.textContent : ''
            });
        }
        if (img) img.addEventListener('click', show);
        if (name) name.addEventListener('click', show);
    });
}
document.addEventListener('DOMContentLoaded', setupMenuItemModal);

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
    
    // Add smooth scroll behavior for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Optional: Add header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
});

// --- FULLSCREEN NAV OVERLAY FUNCTIONALITY ---
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navOverlay = document.getElementById('navOverlay');
    const navOverlayClose = document.getElementById('navOverlayClose');
    const navOverlayLinks = document.querySelectorAll('.nav-overlay__link');
    const menuSection = document.getElementById('menuSections');
    const footer = document.querySelector('.choco-footer');
    const cartButton = document.querySelector('.cart-btn');

    function openNavOverlay() {
        navOverlay.style.display = 'flex';
        setTimeout(() => navOverlay.classList.add('open'), 10);
        navOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function closeNavOverlay() {
        navOverlay.classList.remove('open');
        navOverlay.setAttribute('aria-hidden', 'true');
        setTimeout(() => { navOverlay.style.display = 'none'; document.body.style.overflow = ''; }, 350);
    }
    hamburgerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (navOverlay.classList.contains('open')) {
            closeNavOverlay();
        } else {
            openNavOverlay();
        }
    });
    navOverlayClose.addEventListener('click', closeNavOverlay);
    document.addEventListener('keydown', function(e) {
        if (navOverlay.classList.contains('open') && (e.key === 'Escape' || e.key === 'Esc')) closeNavOverlay();
    });
    navOverlayLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            closeNavOverlay();
            const nav = link.getAttribute('data-nav');
            if (nav === 'menu' && menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (nav === 'contact' && footer) {
                footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (nav === 'cart' && cartButton) {
                cartButton.click();
            }
        });
    });
});

// Menu button functionality
const menuBtn = document.querySelector('.menu-btn');
menuBtn.addEventListener('click', function() {
    // Add click feedback
    menuBtn.style.transform = 'scale(0.98)';
    setTimeout(() => {
        menuBtn.style.transform = '';
    }, 150);
    
    // Placeholder for menu functionality
    console.log('Menu button clicked - menu functionality to be implemented');
    
    // Optional: Add smooth scroll to menu section when implemented
    // document.querySelector('#menu-section').scrollIntoView({ behavior: 'smooth' });
});

// Performance optimization: Lazy load images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Trigger load if not already loaded
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
});

// Dropdown toggles for menu sections
function setupMenuSectionToggles() {
    const sections = document.querySelectorAll('.menu-section');
    sections.forEach(section => {
        const header = section.querySelector('.menu-section__header');
        const toggle = section.querySelector('.menu-section__toggle');
        const items = section.querySelector('.menu-items');
        if (!header || !toggle || !items) return;
        // Set initial state
        items.style.maxHeight = items.scrollHeight + 'px';
        // Toggle on header click (not just button)
        header.addEventListener('click', (e) => {
            // Prevent double toggle if button is clicked
            if (e.target.closest('.menu-section__toggle')) {
                // Let the button's click handler run
                return;
            }
            const isClosed = section.classList.toggle('closed');
            if (isClosed) {
                items.style.maxHeight = '0px';
            } else {
                items.style.maxHeight = items.scrollHeight + 'px';
            }
        });
        // Still allow button to toggle for accessibility
        toggle.addEventListener('click', (e) => {
            const isClosed = section.classList.toggle('closed');
            if (isClosed) {
                items.style.maxHeight = '0px';
            } else {
                items.style.maxHeight = items.scrollHeight + 'px';
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', setupMenuSectionToggles);

// --- VIEW MENU & CONTACT US BUTTONS ---
document.addEventListener('DOMContentLoaded', function() {
    const viewMenuBtn = document.querySelector('.menu-btn');
    const contactBtn = document.querySelector('.contact-btn');
    const menuSection = document.getElementById('menuSections');
    const footer = document.querySelector('.choco-footer');

    if (viewMenuBtn && menuSection) {
        viewMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            viewMenuBtn.style.transform = 'scale(0.98)';
            setTimeout(() => { viewMenuBtn.style.transform = ''; }, 150);
            menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
    if (contactBtn && footer) {
        contactBtn.addEventListener('click', function(e) {
            e.preventDefault();
            contactBtn.style.transform = 'scale(0.98)';
            setTimeout(() => { contactBtn.style.transform = ''; }, 150);
            footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
});

// --- FEATURED CAROUSEL ROTATION + ARROWS ---
document.addEventListener('DOMContentLoaded', function() {
  const carousel = document.getElementById('featuredCarousel');
  if (!carousel) return;
  const slides = carousel.querySelectorAll('.featured-slide');
  const leftArrow = document.getElementById('featuredArrowLeft');
  const rightArrow = document.getElementById('featuredArrowRight');
  let current = 0;
  let interval;

  function showSlide(idx) {
    slides[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
  }

  function nextSlide() {
    showSlide(current + 1);
  }
  function prevSlide() {
    showSlide(current - 1);
  }

  function startAuto() {
    interval = setInterval(nextSlide, 3500);
  }
  function resetAuto() {
    clearInterval(interval);
    startAuto();
  }

  if (leftArrow && rightArrow) {
    leftArrow.addEventListener('click', function() {
      prevSlide();
      resetAuto();
    });
    rightArrow.addEventListener('click', function() {
      nextSlide();
      resetAuto();
    });
  }

  startAuto();
}); 