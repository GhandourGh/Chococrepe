// --- FULLSCREEN NAV OVERLAY FUNCTIONALITY ---
document.addEventListener('DOMContentLoaded', function() {
    // Navigation elements
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navOverlay = document.getElementById('navOverlay');
    const navOverlayClose = document.getElementById('navOverlayClose');
    const navOverlayLinks = document.querySelectorAll('.nav-overlay__link');

    // Optional elements (may not exist on all pages)
    const menuSection = document.getElementById('menuSections');
    const footer = document.querySelector('.choco-footer');
    const cartButton = document.querySelector('.cart-btn');
    const menuBtn = document.querySelector('.menu-btn');
    const contactBtn = document.querySelector('.contact-btn');

    // Check if required navigation elements exist
    if (!hamburgerBtn || !navOverlay || !navOverlayClose) {
        return;
    }

    function openNavOverlay() {
        navOverlay.style.display = 'flex';
        setTimeout(() => navOverlay.classList.add('open'), 10);
        navOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeNavOverlay() {
        navOverlay.classList.remove('open');
        navOverlay.setAttribute('aria-hidden', 'true');
        setTimeout(() => { 
            navOverlay.style.display = 'none'; 
            document.body.style.overflow = ''; 
        }, 350);
    }
    
    // Hamburger button functionality
    hamburgerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (navOverlay.classList.contains('open')) {
            closeNavOverlay();
        } else {
            openNavOverlay();
        }
    });
    
    // Close button functionality
    navOverlayClose.addEventListener('click', closeNavOverlay);
    
    // Escape key functionality
    document.addEventListener('keydown', function(e) {
        if (navOverlay.classList.contains('open') && (e.key === 'Escape' || e.key === 'Esc')) {
            closeNavOverlay();
        }
    });
    
    // Navigation links functionality
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
            } else if (nav === 'contact') {
                // Go to contact section on main page
                if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '') {
                    // If we're already on the main page, scroll to footer
                    if (footer) {
                        footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else {
                    // If we're on another page, go to main page and scroll to contact
                    window.location.href = 'index.html#contact';
                }
            } else if (nav === 'cart') {
                // Use the global cart function if available
                if (window.openCartModal) {
                    window.openCartModal();
                } else {
                    // Fallback: directly open cart modal if it exists
                    const cartModal = document.getElementById('cart-modal');
                    if (cartModal) {
                        cartModal.style.display = 'flex';
                        setTimeout(() => cartModal.classList.add('active'), 10);
                        cartModal.setAttribute('aria-hidden', 'false');
                        document.body.style.overflow = 'hidden';
                    }
                }
            }
        });
    });

    // Menu button functionality (if exists)
    if (menuBtn) {
        menuBtn.addEventListener('click', function(e) {
            // Only prevent default if this is a JavaScript action button (not a navigation link)
            const href = menuBtn.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
                // Add click feedback
                menuBtn.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    menuBtn.style.transform = '';
                }, 150);
                // Scroll to menu section if it exists
                if (menuSection) {
                    menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    }

    // Contact button functionality (if exists)
    if (contactBtn) {
        contactBtn.addEventListener('click', function(e) {
            // Only prevent default if this is a JavaScript action button (not a navigation link)
            const href = contactBtn.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
                contactBtn.style.transform = 'scale(0.98)';
                setTimeout(() => { contactBtn.style.transform = ''; }, 150);
                // Scroll to footer if it exists
                if (footer) {
                    footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    }
}); 