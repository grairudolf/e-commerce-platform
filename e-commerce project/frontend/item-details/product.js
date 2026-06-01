const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

async function loadProduct() {
    if (!productId) return;

    const product = await apiRequest(`/api/products/${productId}`);

    document.title = `Trendora - ${product.prod_name}`;
    document.querySelector('.product-details h1').textContent = product.prod_name;
    document.querySelector('.brand').textContent = `by ${product.brand_name || product.vendor_name || 'Trendora'}`;
    document.querySelector('.current').textContent = money(product.price);
    document.querySelector('.description').textContent = product.prod_description || '';
    document.querySelector('.breadcrumb').textContent = `Home > ${product.cat_name || 'Products'}`;

    const mainImage = document.querySelector('.main-img');
    mainImage.src = productImage(product, 0);
    mainImage.alt = product.prod_name;

    const thumbnails = document.querySelector('.thumbnails');
    thumbnails.innerHTML = [0, 1, 2, 3].map(index => (
        `<img src="${productImage(product, index)}" alt="${product.prod_name} thumbnail ${index + 1}" />`
    )).join('');

    const colors = document.querySelector('.colors');
    colors.innerHTML = (product.variants || []).map(variant => (
        `<button class="color-btn" type="button" data-variant="${variant.prod_var_id}">
            ${variant.prod_color || variant.prod_size || 'Default'}
        </button>`
    )).join('');

    document.querySelector('.add-cart').dataset.productId = product.prod_id;
}

document.querySelector('.add-cart')?.addEventListener('click', async () => {
    const customer = getCustomer();
    if (!customer) {
        window.location.href = '../login/login.html';
        return;
    }

    try {
        const product = await apiRequest(`/api/products/${productId}`);
        const selectedVariant = document.querySelector('.color-btn[data-variant]')?.dataset.variant;
        const variant = product.variants.find(item => item.prod_var_id === selectedVariant) || product.variants[0];
        const quantity = Number(document.querySelector('.quantity input')?.value || 1);

        if (!variant) {
            alert('This product has no available variant yet.');
            return;
        }

        await apiRequest('/api/cart/add', {
            method: 'POST',
            body: JSON.stringify({
                customer_id: customer.customer_id,
                prod_var_id: variant.prod_var_id,
                quantity
            })
        });

        alert('Item added to cart.');
    } catch (err) {
        alert(err.message);
    }
});

loadProduct().catch(err => console.error(err));
