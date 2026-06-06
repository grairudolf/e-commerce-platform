const grid = document.getElementById('product-grid');
const searchInput = document.querySelector('.search-bar');
const categoryBar = document.getElementById('categories-bar');
const cartCountBadge = document.getElementById('cart-count');

let products = [];
const customer = getCustomer();

// Check authentication
if (!customer) {
    window.location.href = '../index.html';
}

function renderProducts(items) {
    if (!grid) return;

    if (!items.length) {
        grid.innerHTML = '<p class="empty-state">No products found matching your search.</p>';
        return;
    }

    grid.innerHTML = items.map((product, index) => `
        <div class="product-card" data-product-id="${product.prod_id}">
            <img src="${productImage(product, index)}" alt="${product.prod_name}" />
            <h3>${product.prod_name}</h3>
            <p class="brand">${product.brand_name || product.vendor_name || 'Trendora'}</p>
            <p class="price">${money(product.price)}</p>
            <button type="button" data-add="${product.prod_id}">Add to Cart</button>
        </div>
    `).join('');
}

async function updateCartCount() {
    try {
        const cartItems = await apiRequest(`/api/cart/${customer.customer_id}`);
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountBadge) {
            cartCountBadge.textContent = count;
        }
    } catch (err) {
        console.error('Failed to update cart count:', err);
    }
}

async function addProductToCart(productId) {
    const product = await apiRequest(`/api/products/${productId}`);
    const variant = product.variants?.[0];
    if (!variant) {
        alert('This product has no available variant yet.');
        return;
    }

    await apiRequest('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({
            customer_id: customer.customer_id,
            prod_var_id: variant.prod_var_id,
            quantity: 1
        })
    });

    alert('Item added to cart.');
    updateCartCount();
}

async function loadCategories() {
    const categories = await apiRequest('/api/categories');
    categoryBar.innerHTML = `
        <button type="button" class="active" data-category="all">All</button>
        ${categories.map(category => (
            `<button type="button" data-category="${category.cat_id}">${category.cat_name}</button>`
        )).join('')}
    `;
}

async function loadProducts(path = '/api/products') {
    products = await apiRequest(path);
    renderProducts(products);
}

grid?.addEventListener('click', async (event) => {
    const addButton = event.target.closest('[data-add]');
    if (addButton) {
        event.stopPropagation();
        try {
            await addProductToCart(addButton.dataset.add);
        } catch (err) {
            alert(err.message);
        }
        return;
    }

    const card = event.target.closest('.product-card');
    if (card?.dataset.productId) {
        window.location.href = `products.html?id=${card.dataset.productId}`;
    }
});

categoryBar?.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    document.querySelectorAll('.categories button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');

    try {
        await loadProducts(button.dataset.category === 'all'
            ? '/api/products'
            : `/api/products/category/${button.dataset.category}`);
    } catch (err) {
        alert(err.message);
    }
});

searchInput?.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    renderProducts(products.filter(product => (
        product.prod_name.toLowerCase().includes(query)
        || (product.prod_description || '').toLowerCase().includes(query)
    )));
});

(async function initHome() {
    try {
        await updateCartCount();
        await loadCategories();
        await loadProducts();
    } catch (err) {
        console.error(err);
    }
})();
