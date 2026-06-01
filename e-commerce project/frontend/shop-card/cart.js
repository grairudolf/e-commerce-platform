const cartItems = document.querySelector('.cart-items');
const summary = document.querySelector('.summary');

function renderCart(items) {
    const subtotal = items.reduce((sum, item) => {
        const price = Number(item.prod_price || 0);
        return sum + price * Number(item.quantity || 0);
    }, 0);
    const tax = subtotal * 0.1;

    cartItems.innerHTML = `
        <h2>Shopping Cart</h2>
        <p>${items.length} item${items.length === 1 ? '' : 's'} in your cart</p>
        ${items.map(item => `
            <div class="cart-item" data-cart-item="${item.cart_item_id}">
                <img src="${item.image_url || 'src/pho_01.png'}" alt="${item.prod_name}" />
                <div class="item-details">
                    <h3>${item.prod_name}</h3>
                    <p class="brand">${item.vendor_name || 'Trendora'}</p>
                    <p class="variant">${[item.prod_size, item.prod_color].filter(Boolean).join(' / ') || 'Default'}</p>
                </div>
                <div class="item-price">${money(item.prod_price)}</div>
                <div class="quantity">
                    <button class="minus" type="button">-</button>
                    <input type="number" value="${item.quantity}" min="1" />
                    <button class="plus" type="button">+</button>
                </div>
                <div class="item-total">${money(Number(item.prod_price) * Number(item.quantity))}</div>
                <button class="remove" type="button"><i class="fa fa-times"></i></button>
            </div>
        `).join('')}
        <a href="../home/home.html" class="continue-shopping"><i class="fa fa-arrow-left"></i> Continue Shopping</a>
    `;

    summary.querySelector('.summary-item span:last-child').textContent = money(subtotal);
    summary.querySelectorAll('.summary-item span:last-child')[2].textContent = money(tax);
    summary.querySelector('.total-price').textContent = money(subtotal + tax);
}

async function loadCart() {
    const customer = getCustomer();
    if (!customer) {
        cartItems.innerHTML = '<h2>Shopping Cart</h2><p>Please sign in to view your cart.</p>';
        return;
    }

    const items = await apiRequest(`/api/cart/${customer.customer_id}`);
    renderCart(items);
}

cartItems?.addEventListener('click', async (event) => {
    const row = event.target.closest('.cart-item');
    if (!row) return;

    const input = row.querySelector('input');
    let quantity = Number(input.value);

    if (event.target.closest('.plus')) quantity += 1;
    if (event.target.closest('.minus')) quantity = Math.max(1, quantity - 1);

    try {
        if (event.target.closest('.remove')) {
            await apiRequest(`/api/cart/item/${row.dataset.cartItem}`, { method: 'DELETE' });
        } else if (event.target.closest('.plus') || event.target.closest('.minus')) {
            await apiRequest(`/api/cart/item/${row.dataset.cartItem}`, {
                method: 'PUT',
                body: JSON.stringify({ quantity })
            });
        }
        await loadCart();
    } catch (err) {
        alert(err.message);
    }
});

loadCart().catch(err => console.error(err));
