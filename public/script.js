// Supabase configuration
const SUPABASE_URL = 'https://swqjfrcukhsxadjpuubs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cWpmcmN1a2hzeGFkanB1dWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NzE1OTYsImV4cCI6MjA2NzE0NzU5Nn0.8xUXDCGlrHcnsmlE5GgRGLtu-SSWZDHOvI52nfgqXV0';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Drink subcategories
const DRINK_SUBCATEGORIES = [
    'Milkshakes',
    'Smoothies', 
    'Cocktails',
    'Fresh Juice',
    'Coffee & More',
    'Beverages'
];

// Categories
const CATEGORIES = ['Burgers', 'Sides', 'Desserts', 'Drinks'];

// DOM elements
const menuContainer = document.getElementById('menuContainer');
const categoryTabs = document.getElementById('categoryTabs');
const menuItemsContainer = document.getElementById('menuItemsContainer');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');

// Cart state
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let menuItems = [];

// Initialize menu
async function initMenu() {
    await loadMenuItems();
    renderCategoryTabs();
    renderMenuItems();
    updateCartDisplay();
}

// Load menu items from Supabase
async function loadMenuItems() {
    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('category')
            .order('subcategory')
            .order('name');
            
        if (error) throw error;
        
        menuItems = data || [];
        
    } catch (error) {
        console.error('Error loading menu items:', error);
        menuItems = [];
    }
}

// Render category tabs
function renderCategoryTabs() {
    categoryTabs.innerHTML = `
        <button class="category-tab active" data-category="all">
            All
        </button>
        ${CATEGORIES.map(category => `
            <button class="category-tab" data-category="${category}">
                ${category}
            </button>
        `).join('')}
    `;
    
    // Add event listeners
    categoryTabs.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            categoryTabs.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            // Filter menu items
            const category = tab.dataset.category;
            renderMenuItems(category === 'all' ? null : category);
        });
    });
}

// Render menu items
function renderMenuItems(filterCategory = null) {
    let filteredItems = filterCategory ? 
        menuItems.filter(item => item.category === filterCategory) : 
        menuItems;
    
    if (filteredItems.length === 0) {
        menuItemsContainer.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500 text-lg">No items found in this category</p>
            </div>
        `;
        return;
    }
    
    // Group items by category and subcategory
    const groupedItems = groupItemsByCategory(filteredItems);
    
    menuItemsContainer.innerHTML = '';
    
    Object.keys(groupedItems).forEach(category => {
        const categoryItems = groupedItems[category];
        
        if (category === 'Drinks') {
            // Render drinks with subcategories
            renderDrinksWithSubcategories(categoryItems);
        } else {
            // Render other categories normally
            renderCategorySection(category, categoryItems);
        }
    });
}

// Group items by category and subcategory
function groupItemsByCategory(items) {
    const grouped = {};
    
    items.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }
        grouped[item.category].push(item);
    });
    
    return grouped;
}

// Render drinks with subcategories
function renderDrinksWithSubcategories(drinkItems) {
    const subcategoryGroups = {};
    
    // Group drinks by subcategory
    drinkItems.forEach(item => {
        const subcategory = item.subcategory || 'Other';
        if (!subcategoryGroups[subcategory]) {
            subcategoryGroups[subcategory] = [];
        }
        subcategoryGroups[subcategory].push(item);
    });
    
    // Create drinks section
    const drinksSection = document.createElement('div');
    drinksSection.className = 'menu-section mb-8';
    drinksSection.innerHTML = `
        <h2 class="section-title">Drinks</h2>
    `;
    
    // Render each subcategory
    DRINK_SUBCATEGORIES.forEach(subcategory => {
        if (subcategoryGroups[subcategory]) {
            const subcategorySection = document.createElement('div');
            subcategorySection.className = 'subcategory-section mb-6';
            subcategorySection.innerHTML = `
                <h3 class="subcategory-title">${subcategory}</h3>
                <div class="menu-grid">
                    ${subcategoryGroups[subcategory].map(item => renderMenuItem(item)).join('')}
                </div>
            `;
            drinksSection.appendChild(subcategorySection);
        }
    });
    
    // Add any drinks without subcategory
    if (subcategoryGroups['Other']) {
        const otherSection = document.createElement('div');
        otherSection.className = 'subcategory-section mb-6';
        otherSection.innerHTML = `
            <h3 class="subcategory-title">Other Drinks</h3>
            <div class="menu-grid">
                ${subcategoryGroups['Other'].map(item => renderMenuItem(item)).join('')}
            </div>
        `;
        drinksSection.appendChild(otherSection);
    }
    
    menuItemsContainer.appendChild(drinksSection);
}

// Render category section (for non-drinks)
function renderCategorySection(category, items) {
    const section = document.createElement('div');
    section.className = 'menu-section mb-8';
    section.innerHTML = `
        <h2 class="section-title">${category}</h2>
        <div class="menu-grid">
            ${items.map(item => renderMenuItem(item)).join('')}
        </div>
    `;
    menuItemsContainer.appendChild(section);
}

// Render individual menu item
function renderMenuItem(item) {
    return `
        <div class="menu-item" data-id="${item.id}">
            <div class="menu-item-image">
                ${item.image_path ? 
                    `<img src="${SUPABASE_URL}/storage/v1/object/public/menu-images/${item.image_path}" 
                          alt="${item.name}" loading="lazy">` : 
                    '<div class="no-image">No Image</div>'
                }
            </div>
            <div class="menu-item-content">
                <h3 class="menu-item-title">${item.name}</h3>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Cart functions
function addToCart(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    if (!item) return;
    
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCart();
    
    // Show success feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.classList.add('added');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('added');
    }, 1000);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
    saveCart();
}

function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        updateCartDisplay();
        saveCart();
    }
}

function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
    
    // Update cart items list
    cartItems.innerHTML = cart.length === 0 ? 
        '<p class="text-center text-gray-500 py-4">Your cart is empty</p>' :
        cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity(${item.id}, -1)" class="quantity-btn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" class="quantity-btn">+</button>
                </div>
            </div>
        `).join('');
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function toggleCart() {
    cartModal.classList.toggle('show');
}

function closeCart() {
    cartModal.classList.remove('show');
}

// Close cart when clicking outside
document.addEventListener('click', (event) => {
    if (cartModal.classList.contains('show') && 
        !cartModal.contains(event.target) && 
        !event.target.closest('.cart-icon')) {
        closeCart();
    }
});

// Real-time updates: re-fetch and re-render menu on any change
supabase
  .channel('public:menu_items')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'menu_items' },
    async (payload) => {
      const items = await loadMenuItems();
      renderMenuItems(items);
    }
  )
  .subscribe();

// Initialize on page load
document.addEventListener('DOMContentLoaded', initMenu);
