const grid = document.querySelector('.product-grid');
const searchInput = document.querySelector('.search-bar');
const categoryBar = document.querySelector('.categories');

let products = [];

function renderProducts(items) {
    if (!grid) return;

    if (!items.length) {
        grid.innerHTML = '<p class="empty-state">No products found.</p>';
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

async function addProductToCart(productId) {
    const customer = getCustomer();
    if (!customer) {
        window.location.href = '../login/login.html';
        return;
    }

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
}

async function loadCategories() {
    const categories = await apiRequest('/api/categories');
    const extraLinks = `
        <button type="button" data-link="../item-details/item.html">Product</button>
        <button type="button" data-link="../shop-card/card.html">Cart</button>
        <button type="button" data-link="../order/order.html">Order</button>
        <button type="button" data-link="../login/login.html">Login</button>
    `;

    categoryBar.innerHTML = `
        <button type="button" class="active" data-category="all">All</button>
        ${categories.map(category => (
            `<button type="button" data-category="${category.cat_id}">${category.cat_name}</button>`
        )).join('')}
        ${extraLinks}
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
        window.location.href = `../item-details/item.html?id=${card.dataset.productId}`;
    }
});

categoryBar?.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.link) {
        window.location.href = button.dataset.link;
        return;
    }

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
        await loadCategories();
        await loadProducts();
    } catch (err) {
        console.error(err);
    }
})();
