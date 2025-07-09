let isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';

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
const CATEGORIES = ['Desserts', 'Crepes', 'Cups', 'Sticks', 'Ice Cream', 'Drinks', 'Add-ons', 'Shisha'];

// DOM elements
const loginForm = document.getElementById('loginForm');
const adminPanel = document.getElementById('dashboardSection');
const menuForm = document.getElementById('addItemForm');
const menuList = document.getElementById('itemsTable').querySelector('tbody');
const categoryFilter = document.getElementById('filterCategory');
const subcategoryField = document.getElementById('subcategoryField');
const subcategorySelect = document.getElementById('subcategorySelect');

// Initialize admin panel
function initAdmin() {
    if (isLoggedIn) {
        showAdminPanel();
        loadMenuItems();
    } else {
        showLoginForm();
    }
}

// Show/hide forms
function showLoginForm() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'flex';
}

// Login handler
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    // Hardcoded credentials (replace with proper auth)
    if (username === 'chococrepe@admin.com' && password === 'chococrepe') {
        isLoggedIn = true;
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
        loadMenuItems();
    } else {
        showMessage('Invalid credentials. Please use: chococrepe@admin.com / chococrepe', 'error', 5000);
    }
}

// Category change handler
function handleCategoryChange() {
    const categorySelect = document.getElementById('itemCategory');
    const subcategoryField = document.getElementById('subcategoryField');
    const subcategorySelect = document.getElementById('subcategorySelect');
    const category = categorySelect ? categorySelect.value : '';

    if (category === 'Drinks') {
        if (subcategoryField && subcategorySelect) {
            subcategoryField.style.display = 'block';
            subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
            DRINK_SUBCATEGORIES.forEach(sub => {
                subcategorySelect.innerHTML += `<option value="${sub}">${sub}</option>`;
            });
        }
    } else {
        if (subcategoryField && subcategorySelect) {
            subcategoryField.style.display = 'none';
            subcategorySelect.value = '';
        }
    }
}

// Add a message area to the DOM if it doesn't exist
function ensureMessageArea() {
    if (!document.getElementById('adminMessage')) {
        const msg = document.createElement('div');
        msg.id = 'adminMessage';
        msg.style.display = 'none';
        msg.style.position = 'fixed';
        msg.style.top = '24px';
        msg.style.left = '50%';
        msg.style.transform = 'translateX(-50%)';
        msg.style.zIndex = '9999';
        msg.style.background = '#fff6ee';
        msg.style.color = '#2d2d2d';
        msg.style.border = '1.5px solid #e7d7c9';
        msg.style.borderRadius = '10px';
        msg.style.padding = '14px 32px';
        msg.style.fontWeight = '700';
        msg.style.fontSize = '1.08rem';
        msg.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
        msg.style.textAlign = 'center';
        document.body.appendChild(msg);
    }
}

function showMessage(message, type = 'info', duration = 3000) {
    ensureMessageArea();
    const msg = document.getElementById('adminMessage');
    msg.textContent = message;
    msg.style.display = 'block';
    msg.style.background = type === 'error' ? '#ffeaea' : '#fff6ee';
    msg.style.color = type === 'error' ? '#b00020' : '#2d2d2d';
    msg.style.borderColor = type === 'error' ? '#ffb3b3' : '#e7d7c9';
    clearTimeout(msg._timeout);
    msg._timeout = setTimeout(() => { msg.style.display = 'none'; }, duration);
}

// Add menu item
async function addMenuItem(event) {
    event.preventDefault();
    
    const name = document.getElementById('itemName').value;
    const description = document.getElementById('itemDesc').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const category = document.getElementById('itemCategory').value;
    const subcategory = document.getElementById('subcategorySelect').value || null;
    const imageFile = document.getElementById('itemImage').files[0];
    
    if (!name || !price || !category) {
        showMessage('Please fill in all required fields');
        return;
    }
    
    if (category === 'Drinks' && !subcategory) {
        showMessage('Please select a subcategory for drinks');
        return;
    }
    
    try {
        let imagePath = null;
        
        // Handle image upload
        if (imageFile && imageFile.size > 0) {
            // Compress image
            const compressedFile = await imageCompression(imageFile, {
                maxSizeMB: 1,
                maxWidthOrHeight: 800
            });
            
            // Upload to Supabase storage
            const fileName = `${Date.now()}_${imageFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('menu-images')
                .upload(fileName, compressedFile);
                
            if (uploadError) throw uploadError;
            imagePath = fileName;
        }
        
        // Insert menu item
        console.log('Inserting menu item:', {
            name, description, price, category, subcategory, image_path: imagePath
        });
        const menuItem = {
            name,
            description,
            price,
            category,
            subcategory
        };
        if (imagePath && typeof imagePath === 'string') {
            menuItem.image_path = imagePath;
        }
        const { data, error } = await supabase
            .from('menu_items')
            .insert([menuItem]);
            
        if (error) throw error;
        
        showMessage('Menu item added successfully!');
        menuForm.reset();
        subcategoryField.style.display = 'none';
        loadMenuItems();
        
    } catch (error) {
        showMessage('Error adding menu item. Please try again.', 'error', 5000);
    }
}

// Load menu items
async function loadMenuItems() {
    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('category')
            .order('subcategory')
            .order('name');
            
        if (error) throw error;
        
        displayMenuItems(data);
        
    } catch (error) {
        showMessage('Error loading menu items', 'error', 5000);
    }
}

// Display menu items
function displayMenuItems(items) {
    const filterCategory = categoryFilter.value;
    const filteredItems = filterCategory === 'all' ? items : items.filter(item => item.category === filterCategory);
    
    menuList.innerHTML = '';
    
    if (filteredItems.length === 0) {
        menuList.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-4">No menu items found</td></tr>';
        return;
    }
    
    filteredItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                ${item.image_path ? 
                    `<img src="${SUPABASE_URL}/storage/v1/object/public/menu-images/${item.image_path}" 
                          alt="${item.name}" class="w-16 h-16 object-cover rounded">` : 
                    '<div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs">No Image</div>'
                }
                <button class="change-image-btn" data-id="${item.id}">Change Image</button>
                <input type="file" class="change-image-input" data-id="${item.id}" style="display:none;" accept="image/*">
                </div>
            </td>
            <td>
                <div>
                    <h3 class="font-semibold">${item.name}</h3>
                    <button class="desc-toggle-btn" data-id="${item.id}" aria-expanded="false" style="margin:4px 0 0 0;font-size:0.9em;color:#b88b6a;background:none;border:none;cursor:pointer;">Show Description</button>
                    <p class="text-gray-600 text-sm admin-desc" style="display:none;margin:4px 0 0 0;">${item.description}
                      <button class="edit-desc-btn" data-id="${item.id}" style="margin-left:8px;font-size:0.9em;color:#b88b6a;background:none;border:none;cursor:pointer;">✏️</button>
                    </p>
                    <div class="edit-desc-form" data-id="${item.id}" style="display:none;margin:6px 0 0 0;">
                      <textarea class="edit-desc-input" style="width:100%;font-size:0.95em;padding:4px 8px;border-radius:6px;border:1.5px solid #e7d7c9;">${item.description}</textarea>
                      <button class="save-desc-btn" data-id="${item.id}" style="margin:4px 4px 0 0;font-size:0.9em;color:#fff;background:#b88b6a;border:none;border-radius:6px;padding:2px 10px;">Save</button>
                      <button class="cancel-desc-btn" data-id="${item.id}" style="margin:4px 0 0 0;font-size:0.9em;color:#b88b6a;background:none;border:none;">Cancel</button>
                    </div>
                    ${item.subcategory ? `<p class="text-xs text-gray-500">${item.subcategory}</p>` : ''}
                </div>
            </td>
            <td>${item.category}</td>
            <td class="font-bold text-orange-600">
              <span class="price-value">$${item.price.toFixed(2)}</span>
              <button class="edit-price-btn" data-id="${item.id}" style="margin-left:8px;font-size:0.9em;color:#b88b6a;background:none;border:none;cursor:pointer;">✏️</button>
              <div class="edit-price-form" data-id="${item.id}" style="display:none;margin-top:4px;">
                <input type="number" min="0" step="0.01" class="edit-price-input" value="${item.price}" style="width:70px;font-size:0.95em;padding:2px 6px;border-radius:6px;border:1.5px solid #e7d7c9;">
                <button class="save-price-btn" data-id="${item.id}" style="margin-left:4px;font-size:0.9em;color:#fff;background:#b88b6a;border:none;border-radius:6px;padding:2px 10px;">Save</button>
                <button class="cancel-price-btn" data-id="${item.id}" style="margin-left:2px;font-size:0.9em;color:#b88b6a;background:none;border:none;">Cancel</button>
              </div>
            </td>
            <td>
                <button onclick="deleteMenuItem(${item.id})" class="delete-btn">
                    <i class='bx bx-trash'></i> <span class="delete-label">Delete</span>
                </button>
            </td>
        `;
        menuList.appendChild(row);
    });

    // Add event listeners for change image
    document.querySelectorAll('.change-image-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = btn.getAttribute('data-id');
            document.querySelector(`.change-image-input[data-id="${id}"]`).click();
        });
    });
    document.querySelectorAll('.change-image-input').forEach(input => {
        input.addEventListener('change', async e => {
            const id = input.getAttribute('data-id');
            const file = input.files[0];
            if (!file) return;
            try {
                const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 800 });
                const fileName = `${Date.now()}_${file.name}`;
                const { error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, compressedFile);
                if (uploadError) return showMessage('Image upload failed', 'error', 4000);
                const { error: updateError } = await supabase.from('menu_items').update({ image_path: fileName }).eq('id', id);
                if (updateError) return showMessage('Failed to update image', 'error', 4000);
                showMessage('Image updated!');
                loadMenuItems();
            } catch (err) {
                showMessage('Image update failed', 'error', 4000);
            }
        });
    });

    // Add event listeners for description toggle (all screens)
    document.querySelectorAll('.desc-toggle-btn').forEach(btn => {
      btn.style.display = '';
      btn.addEventListener('click', function() {
        const desc = btn.parentElement.querySelector('.admin-desc');
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        if (desc) {
          desc.style.display = expanded ? 'none' : '';
          btn.textContent = expanded ? 'Show Description' : 'Hide Description';
          btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });

    // Inline edit for price
    document.querySelectorAll('.edit-price-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-id');
        btn.style.display = 'none';
        const priceForm = document.querySelector(`.edit-price-form[data-id="${id}"]`);
        if (priceForm) priceForm.style.display = '';
      });
    });
    document.querySelectorAll('.cancel-price-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-id');
        document.querySelector(`.edit-price-form[data-id="${id}"]`).style.display = 'none';
        document.querySelector(`.edit-price-btn[data-id="${id}"]`).style.display = '';
      });
    });
    document.querySelectorAll('.save-price-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = btn.getAttribute('data-id');
        const input = document.querySelector(`.edit-price-input[data-id="${id}"]`) || document.querySelector(`.edit-price-input`);
        const newPrice = parseFloat(input.value);
        if (isNaN(newPrice) || newPrice < 0) return showMessage('Invalid price', 'error', 3000);
        const { error } = await supabase.from('menu_items').update({ price: newPrice }).eq('id', id);
        if (error) return showMessage('Failed to update price', 'error', 4000);
        showMessage('Price updated!');
        loadMenuItems();
      });
    });

    // Inline edit for description
    document.querySelectorAll('.edit-desc-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-id');
        btn.parentElement.style.display = 'none';
        const form = document.querySelector(`.edit-desc-form[data-id="${id}"]`);
        if (form) form.style.display = '';
      });
    });
    document.querySelectorAll('.cancel-desc-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-id');
        document.querySelector(`.edit-desc-form[data-id="${id}"]`).style.display = 'none';
        const desc = document.querySelector(`.admin-desc[data-id="${id}"]`) || document.querySelector('.admin-desc');
        if (desc) desc.style.display = '';
      });
    });
    document.querySelectorAll('.save-desc-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = btn.getAttribute('data-id');
        const input = document.querySelector(`.edit-desc-input[data-id="${id}"]`) || document.querySelector('.edit-desc-input');
        const newDesc = input.value.trim();
        const { error } = await supabase.from('menu_items').update({ description: newDesc }).eq('id', id);
        if (error) return showMessage('Failed to update description', 'error', 4000);
        showMessage('Description updated!');
        loadMenuItems();
      });
    });
}

// Delete menu item
async function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        showMessage('Menu item deleted successfully!');
        loadMenuItems();
        
    } catch (error) {
        showMessage('Error deleting menu item', 'error', 5000);
    }
}

// Filter menu items
function filterMenuItems() {
    loadMenuItems();
}

// Logout
function logout() {
    isLoggedIn = false;
    sessionStorage.removeItem('adminLoggedIn');
    showLoginForm();
}

// Test login function
function testLogin() {
    console.log('Test login function called');
    document.getElementById('adminEmail').value = 'chococrepe@admin.com';
    document.getElementById('adminPassword').value = 'chococrepe';
    handleLogin(new Event('submit'));
}

// Password toggle functionality
function togglePassword() {
    const passwordInput = document.getElementById('adminPassword');
    const toggleButton = document.getElementById('passwordToggle');
    const icon = toggleButton.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'bx bx-show';
    } else {
        passwordInput.type = 'password';
        icon.className = 'bx bx-hide';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up event listeners...'); // Debug log
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found, adding submit listener'); // Debug log
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found!'); // Debug log
    }
    
    const menuForm = document.getElementById('addItemForm');
    if (menuForm) {
        menuForm.addEventListener('submit', addMenuItem);
    }
    
    const categorySelect = document.getElementById('itemCategory');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }
    
    const categoryFilter = document.getElementById('filterCategory');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterMenuItems);
    }
    
    // Add password toggle event listener
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordToggle) {
        console.log('Password toggle found, adding click listener'); // Debug log
        passwordToggle.addEventListener('click', togglePassword);
    } else {
        console.error('Password toggle not found!'); // Debug log
    }
    
    // Add logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    initAdmin();
});
