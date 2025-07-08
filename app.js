// --- SUPABASE DYNAMIC MENU ---
const SUPABASE_URL = 'https://swqjfrcukhsxadjpuubs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cWpmcmN1a2hzeGFkanB1dWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NzE1OTYsImV4cCI6MjA2NzE0NzU5Nn0.8xUXDCGlrHcnsmlE5GgRGLtu-SSWZDHOvI52nfgqXV0';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const menuSections = document.getElementById('menuSections');

const DRINK_SUBCATEGORIES = [
  'Milkshakes',
  'Smoothies',
  'Cocktails',
  'Fresh Juice',
  'Coffee & More',
  'Beverages'
];

const CATEGORY_MAP = {
    'crepes': 'Crepes',
  'desserts': 'Desserts',
  'cups': 'Cups',
  'sticks': 'Sticks',
  'ice-cream': 'Ice Cream',
  'drinks': 'Drinks',
  'add-ons': 'Add-ons',
  'shisha': 'Shisha'
};

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  return `${SUPABASE_URL}/storage/v1/object/public/menu-images/${imagePath}`;
}

async function fetchMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('subcategory')
    .order('name');
  if (error) {
    menuSections.innerHTML = '<p class="error">Failed to load menu.</p>';
    return [];
  }
  return data;
}

function renderMenu(items, filterCategory = null) {
  menuSections.innerHTML = '';
  // Group by category and subcategory (do NOT filter here)
  const grouped = {};
  items.forEach(item => {
    const catKey = (item.category || '').toLowerCase().replace(/\s+/g, '-');
    if (!grouped[catKey]) grouped[catKey] = {};
    const subcat = item.subcategory || 'Other';
    if (!grouped[catKey][subcat]) grouped[catKey][subcat] = [];
    grouped[catKey][subcat].push(item);
  });
  Object.entries(CATEGORY_MAP).forEach(([catKey, catLabel]) => {
    // Always create the section, even if there are no items
    const section = document.createElement('section');
    section.className = 'menu-section closed';
    section.id = catKey;
    section.innerHTML = `
      <div class="menu-section__header">
        <h2 class="menu-section__title">${catLabel}</h2>
        <button class="menu-section__toggle" aria-label="Toggle ${catLabel}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>`;
    if (grouped[catKey]) {
      Object.entries(grouped[catKey]).forEach(([subcat, items], subIdx) => {
        let subcatId = `${catKey}-subcat-${subIdx}`;
        let subcatToggle = '';
        if (catKey === 'drinks' && subcat !== 'Other') {
          subcatToggle = `<button class="menu-subsection__toggle" aria-label="Toggle ${subcat}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
          section.innerHTML += `<div class="menu-subsection closed" id="${subcatId}" style="display:none;"><div class="menu-subsection__header"><h3 class="menu-subsection__title">${subcat}</h3>${subcatToggle}</div>`;
        }
        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'menu-items';
        items.forEach(item => {
          itemsDiv.innerHTML += `
            <article class="menu-item">
              <img src="${getImageUrl(item.image_path)}" alt="${item.name}" class="menu-item__image" loading="lazy">
              <div class="menu-item__content">
                <div class="menu-item__header">
                  <h3 class="menu-item__name">${item.name}</h3>
                </div>
                <p class="menu-item__description">${item.description || ''}</p>
                <div class="menu-item__footer">
                  <span class="menu-item__price">$${item.price.toFixed(2)}</span>
                </div>
              </div>
            </article>
          `;
        });
        if (catKey === 'drinks' && subcat !== 'Other') {
          section.innerHTML += `</div>`; // close menu-subsection__header
          section.appendChild(itemsDiv);
          section.innerHTML += `</div>`; // close menu-subsection
        } else {
          section.appendChild(itemsDiv);
        }
      });
    } else {
      // No items in this category
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'menu-items menu-items--empty';
      emptyDiv.innerHTML = `<div style="color:var(--textSecondary);opacity:0.7;padding:24px 0;text-align:center;font-weight:500;">No items in this category yet.</div>`;
      section.appendChild(emptyDiv);
    }
    menuSections.appendChild(section);
  });
  // Attach modal logic to new menu items
  setupMenuItemModal();
  // Ensure dropdown toggles are functional after render
  setupMenuSectionToggles();
  setupMenuSubsectionToggles();
}

(async () => {
  const items = await fetchMenuItems();
  renderMenu(items);
})();

// Real-time updates: re-fetch and re-render menu on any change
supabase
  .channel('public:menu_items')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'menu_items' },
    async (payload) => {
      const items = await fetchMenuItems();
      renderMenu(items);
    }
  )
  .subscribe();
// --- END SUPABASE DYNAMIC MENU ---

// --- HERO VIDEO CAROUSEL ---
function setupHeroVideoCarousel() {
    const videos = document.querySelectorAll('.hero-video');
    
    let currentVideoIndex = 0;
    let autoPlayInterval;
    
    function showVideo(index) {
        // Remove active class from all videos
        videos.forEach(video => video.classList.remove('active'));
        
        // Add active class to current video
        videos[index].classList.add('active');
        
        // Play the current video with error handling
        const currentVideo = videos[index];
        const playPromise = currentVideo.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Video autoplay failed:', error);
                // Fallback: try to play on user interaction
                document.addEventListener('click', () => currentVideo.play(), { once: true });
            });
        }
        
        // Pause other videos
        videos.forEach((video, i) => {
            if (i !== index) {
                video.pause();
            }
        });
        
        currentVideoIndex = index;
    }
    
    function nextVideo() {
        const nextIndex = (currentVideoIndex + 1) % videos.length;
        showVideo(nextIndex);
    }
    
    function prevVideo() {
        const prevIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
        showVideo(prevIndex);
    }
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextVideo, 8000); // Change video every 8 seconds
    }
    
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }
    

    

    
    // Pause auto-play on hover
    const heroSection = document.querySelector('.hero');
    heroSection.addEventListener('mouseenter', stopAutoPlay);
    heroSection.addEventListener('mouseleave', startAutoPlay);
    
    // Start auto-play
    startAutoPlay();
    
    // Handle video loading and errors gracefully
    videos.forEach(video => {
        // Add loading state
        video.addEventListener('loadstart', () => {
            video.classList.add('loading');
        });
        
        // Remove loading state when video can play
        video.addEventListener('canplay', () => {
            video.classList.remove('loading');
            video.classList.add('loaded');
        });
        
        // Handle video errors gracefully
        video.addEventListener('error', () => {
            console.warn('Video failed to load:', video.src);
            video.classList.remove('loading');
            // Fallback to next video if current fails
            if (video.classList.contains('active')) {
                nextVideo();
            }
        });
    });
}

// Initialize video carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupHeroVideoCarousel();
});

// --- CART STATE ---
let cart = JSON.parse(localStorage.getItem('chocoCart')) || [];

// Make cart globally accessible
window.cart = cart;

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
    // Save to localStorage
    localStorage.setItem('chocoCart', JSON.stringify(cart));
}

// Make updateCartBadge globally accessible
window.updateCartBadge = updateCartBadge;

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
        // Ensure price is a valid number
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

    // Add quantity controls if not present
    let qtyWrapper = modal.querySelector('.menu-modal__qty-wrapper');
    if (!qtyWrapper) {
        qtyWrapper = document.createElement('div');
        qtyWrapper.className = 'menu-modal__qty-wrapper';
        qtyWrapper.innerHTML = `
            <button type="button" class="menu-modal__qty-minus">-</button>
            <span class="menu-modal__qty-value">1</span>
            <button type="button" class="menu-modal__qty-plus">+</button>
        `;
        addToCartBtn.parentElement.insertBefore(qtyWrapper, addToCartBtn);
    }
    const qtyValue = qtyWrapper.querySelector('.menu-modal__qty-value');
    const qtyMinus = qtyWrapper.querySelector('.menu-modal__qty-minus');
    const qtyPlus = qtyWrapper.querySelector('.menu-modal__qty-plus');

    function resetQty() { qtyValue.textContent = '1'; }

    qtyMinus.onclick = () => {
        let val = parseInt(qtyValue.textContent, 10);
        if (val > 1) qtyValue.textContent = val - 1;
    };
    qtyPlus.onclick = () => {
        let val = parseInt(qtyValue.textContent, 10);
        qtyValue.textContent = val + 1;
    };

    function openModal({img, name, desc, price}) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || name;
        modalName.textContent = name;
        modalDesc.textContent = desc || '';
        modalDesc.style.display = desc ? '' : 'none';
        modalPrice.textContent = price !== undefined && price !== null ? `$${Number(price).toFixed(2)}` : '';
        modalPrice.setAttribute('data-price', price);
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        resetQty();
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
        addToCartBtn.onclick = function() {
            const name = modalName.textContent;
            const price = parseFloat(modalPrice.getAttribute('data-price'));
            const img = modalImg.src;
            const qty = parseInt(qtyValue.textContent, 10) || 1;
            const idx = cart.findIndex(i => i.name === name && i.price === price && i.img === img);
            if (idx > -1) {
                cart[idx].qty += qty;
            } else {
                cart.push({ name, price, img, qty });
            }
            updateCartBadge();
            // Feedback
            const originalText = addToCartBtn.textContent;
            addToCartBtn.textContent = 'ENJOY!';
            addToCartBtn.style.backgroundColor = 'var(--textSecondary)';
            addToCartBtn.style.color = 'white';
            addToCartBtn.style.transform = 'scale(1.05)';
            setTimeout(() => {
                addToCartBtn.textContent = originalText;
                addToCartBtn.style.backgroundColor = '';
                addToCartBtn.style.color = '';
                addToCartBtn.style.transform = '';
                resetQty();
            }, 1000);
        };
    }

    document.querySelectorAll('.menu-item').forEach(item => {
        const img = item.querySelector('.menu-item__image');
        const name = item.querySelector('.menu-item__name');
        const desc = item.querySelector('.menu-item__description');
        const price = item.querySelector('.menu-item__price');
        // Extract the price as a number from the DOM
        let priceValue = 0;
        if (price) {
            // Remove $ and commas, parse as float
            priceValue = parseFloat((price.textContent || '').replace(/[^\d.]/g, ''));
        }
        function show() {
            openModal({
                img,
                name: name ? name.textContent : '',
                desc: desc ? desc.textContent : '',
                price: priceValue // Pass the number, not the string
            });
        }
        // Make the entire menu-item clickable
        item.style.cursor = 'pointer';
        item.addEventListener('click', show);
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
            const href = link.getAttribute('href');
            const nav = link.getAttribute('data-nav');
            
            // Handle regular page links (catering.html, brand.html, locations.html)
            if (href && href !== '#' && !nav) {
                // Allow normal navigation for page links
                return;
            }
            
            // Handle internal navigation
            e.preventDefault();
            closeNavOverlay();
            
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
            if (e.target.closest('.menu-section__toggle')) {
                return;
            }
            const isClosed = section.classList.toggle('closed');
            if (isClosed) {
                items.style.maxHeight = '0px';
                // If this is the drinks section, close and hide all subcategories
                if (section.id === 'drinks') {
                  section.querySelectorAll('.menu-subsection').forEach(sub => {
                    sub.classList.add('closed');
                    sub.style.display = 'none';
                  });
                }
            } else {
                items.style.maxHeight = items.scrollHeight + 'px';
                // If this is the drinks section, show all subcategories (but keep them closed)
                if (section.id === 'drinks') {
                  section.querySelectorAll('.menu-subsection').forEach(sub => {
                    sub.style.display = '';
                  });
                }
            }
        });
        toggle.addEventListener('click', (e) => {
            const isClosed = section.classList.toggle('closed');
            if (isClosed) {
                items.style.maxHeight = '0px';
                if (section.id === 'drinks') {
                  section.querySelectorAll('.menu-subsection').forEach(sub => {
                    sub.classList.add('closed');
                    sub.style.display = 'none';
                  });
                }
            } else {
                items.style.maxHeight = items.scrollHeight + 'px';
                if (section.id === 'drinks') {
                  section.querySelectorAll('.menu-subsection').forEach(sub => {
                    sub.style.display = '';
                  });
                }
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

// Inject CSS for quantity controls if not present
if (!document.getElementById('modal-qty-style')) {
  const style = document.createElement('style');
  style.id = 'modal-qty-style';
  style.textContent = `
    .menu-modal__qty-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 18px;
      margin-top: 8px;
    }
    .menu-modal__qty-minus, .menu-modal__qty-plus {
      background: #fff6ee;
      color: var(--textSecondary);
      border: 2px solid #e7d7c9;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      font-size: 1.5rem;
      font-weight: 900;
      cursor: pointer;
      transition: background 0.2s, color 0.2s, border 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
    }
    .menu-modal__qty-minus:hover, .menu-modal__qty-plus:hover {
      background: var(--textSecondary);
      color: #fff;
      border-color: var(--textSecondary);
    }
    .menu-modal__qty-value {
      min-width: 32px;
      text-align: center;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--textSecondary);
      background: none;
      border: none;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

function setupMenuSubsectionToggles() {
  document.querySelectorAll('.menu-section#drinks .menu-subsection').forEach(subsection => {
    const header = subsection.querySelector('.menu-subsection__header');
    const toggle = subsection.querySelector('.menu-subsection__toggle');
    const items = subsection.nextElementSibling;
    if (!header || !toggle) return;
    // Find the .menu-items div that follows this subsection
    let itemsDiv = subsection.querySelector('.menu-items');
    if (!itemsDiv) itemsDiv = items;
    if (!itemsDiv) return;
    // Set initial state
    itemsDiv.style.maxHeight = subsection.classList.contains('closed') ? '0px' : itemsDiv.scrollHeight + 'px';
    // Toggle on header or button click
    function toggleSubcat() {
      const isClosed = subsection.classList.toggle('closed');
      if (isClosed) {
        itemsDiv.style.maxHeight = '0px';
      } else {
        itemsDiv.style.maxHeight = itemsDiv.scrollHeight + 'px';
      }
    }
    header.addEventListener('click', (e) => {
      if (e.target.closest('.menu-subsection__toggle')) return;
      toggleSubcat();
    });
    toggle.addEventListener('click', (e) => {
      toggleSubcat();
    });
  });
}

// --- SMOOTH CATEGORY NAVIGATION ---
document.addEventListener('DOMContentLoaded', function() {
  const navContainer = document.querySelector('.category-nav__container');
  if (!navContainer) return;

  let currentCategory = null;

  navContainer.addEventListener('click', async function(e) {
    const tab = e.target.closest('.category-tab');
    if (!tab) return;
    e.preventDefault();
    if (tab.classList.contains('active')) return; // Already selected

    // Remove active from all, add to clicked
    navContainer.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Animate tab (optional, for smoothness)
    tab.style.transition = 'background 0.3s, color 0.3s, transform 0.2s';
    tab.style.transform = 'scale(1.08)';
    setTimeout(() => { tab.style.transform = ''; }, 180);

    // Get category key
    const filter = tab.getAttribute('href').replace('#', '');
    if (currentCategory === filter) return;
    currentCategory = filter;

    // Fetch and render menu for this category
    const items = await fetchMenuItems();
    renderMenu(items, filter === 'all' ? null : filter);

    // Open the chosen category section and scroll smoothly
    setTimeout(() => {
      const section = document.getElementById(filter);
      if (section) {
        section.classList.remove('closed');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  });
}); 