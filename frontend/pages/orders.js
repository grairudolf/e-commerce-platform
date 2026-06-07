const ordersContainer = document.getElementById('orders-main');
const cartCountBadge = document.getElementById('cart-count');

const customer = getCustomer();
let allOrders = [];
let activeTab = 'All';

if (!customer) {
    window.location.href = '../index.html';
}

async function updateCartCount() {
    try {
        const cartItems = await apiRequest(`/api/cart/${customer.customer_id}`);
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountBadge) cartCountBadge.textContent = count;
    } catch (err) {
        console.error('Failed to update cart count:', err);
    }
}

function renderOrders() {
    let filteredOrders = allOrders;
    if (activeTab !== 'All') {
        filteredOrders = allOrders.filter(o => o.order_status.toLowerCase() === activeTab.toLowerCase());
    }

    ordersContainer.innerHTML = `
        <h2>My Orders</h2>
        <div class="tabs" id="order-tabs">
            <button class="${activeTab === 'All' ? 'active' : ''}" data-tab="All">All Orders</button>
            <button class="${activeTab === 'Pending' ? 'active' : ''}" data-tab="Pending">Pending</button>
            <button class="${activeTab === 'Delivered' ? 'active' : ''}" data-tab="Delivered">Delivered</button>
            <button class="${activeTab === 'Cancelled' ? 'active' : ''}" data-tab="Cancelled">Cancelled</button>
        </div>

        ${filteredOrders.length ? filteredOrders.map(order => `
            <div class="order-card" data-order-id="${order.order_id}">
                <div class="order-header">
                    <div>
                        <p><strong>Order ID:</strong> ${order.order_number}</p>
                        <p><strong>Date Placed:</strong> ${new Date(order.placed_at).toLocaleDateString()}</p>
                        <p><strong>Payment Method:</strong> ${order.payment_method === 'MTN_MOMO' ? 'MTN MoMo' : 'Orange Money'}</p>
                    </div>
                    <div class="order-total">
                        <p><strong>Total Paid:</strong> ${money(order.total_amount)}</p>
                        <span class="status ${order.order_status.toLowerCase()}">${order.order_status}</span>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="primary" type="button" data-action="details">View Details</button>
                    ${order.order_status.toUpperCase() === 'PENDING' ? `<button class="primary" type="button" data-action="deliver">Confirm Delivery</button>` : ''}
                    ${order.order_status.toUpperCase() === 'DELIVERED' ? `<button class="secondary" type="button" data-action="return">Request Return</button>
                                                            <button class="secondary" type="button" data-action="refund">Request Refund</button>` : ''}
                    <button class="secondary" type="button" data-action="payment">${order.payment_status.toUpperCase()}</button>
                </div>
                <div class="order-details-pane" style="display: none; border-top: 1px solid var(--line); margin-top: 1rem; padding-top: 1rem;">
                    <p style="color: var(--muted); text-align: center;">Loading details...</p>
                </div>
            </div>
        `).join('') : '<p class="empty-state">No orders found.</p>'}
    `;

    // Add Tab Clicks
    const tabs = document.getElementById('order-tabs');
    tabs?.addEventListener('click', (event) => {
        const btn = event.target.closest('button');
        if (!btn) return;
        activeTab = btn.dataset.tab;
        renderOrders();
    });
}

// Handle Order details toggles (lazy loading details)
ordersContainer?.addEventListener('click', async (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    const action = target.dataset.action;
    const card = target.closest('.order-card');
    if (!card) return;

    const orderId = card.dataset.orderId;
    const detailsPane = card.querySelector('.order-details-pane');

    if (action === 'details') {
        if (detailsPane.style.display === 'block') {
            detailsPane.style.display = 'none';
        } else {
            detailsPane.style.display = 'block';
            try {
                const orderData = await apiRequest(`/api/orders/${orderId}`);
                renderOrderDetails(detailsPane, orderData);
            } catch (err) {
                detailsPane.innerHTML = `<p style="color: var(--red); text-align: center;">Failed: ${err.message}</p>`;
            }
        }
    } else if (action === 'deliver') {
        try {
            await apiRequest(`/api/orders/${orderId}/deliver`, { method: 'PATCH' });
            alert('Delivery confirmed! Funds are released.');
            loadOrders();
        } catch (err) {
            alert(err.message);
        }
    } else if (action === 'refund') {
        const reason = prompt('Please enter a reason for the refund (Must be within 7 days):');
        if (reason) {
            try {
                await apiRequest(`/api/orders/${orderId}/refund`, {
                    method: 'POST',
                    body: JSON.stringify({ reason })
                });
                alert('Refund requested successfully.');
                loadOrders();
            } catch (err) {
                alert(err.message);
            }
        }
    } else if (action === 'return') {
        const reason = prompt('Please enter a reason for returning the item(s):');
        if (reason) {
            try {
                await apiRequest(`/api/orders/${orderId}/return`, {
                    method: 'POST',
                    body: JSON.stringify({ reason })
                });
                alert('Return requested successfully.');
                loadOrders();
            } catch (err) {
                alert(err.message);
            }
        }
    }
});

function renderOrderDetails(pane, order) {
    pane.innerHTML = `
        <div style="font-size: 0.9rem; margin-bottom: 1rem; background: var(--bg); padding: 1rem; border-radius: var(--radius-sm);">
            <p><strong>Delivery Location:</strong> ${order.address_line || 'No address line'}, ${order.city || 'Buea'}, ${order.region || 'Cameroon'}</p>
            ${order.order_notes ? `<p><strong>Delivery Notes:</strong> ${order.order_notes}</p>` : ''}
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
            ${order.items.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--line); padding-bottom: 0.5rem;">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <img src="${productImage(item)}" alt="${item.prod_name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm);" onerror="this.src='../src/shoe.png'" />
                        <div>
                            <p style="font-weight: 600; font-size: 0.95rem;">${item.prod_name}</p>
                            <p style="color: var(--muted); font-size: 0.8rem;">
                                Brand: ${item.vendor_name || 'Trendora'} 
                                ${item.prod_size ? `| Size: ${item.prod_size}` : ''} 
                                ${item.prod_color ? `| Color: ${item.prod_color}` : ''}
                            </p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-weight: 600; color: var(--primary);">${money(item.unit_price)}</p>
                        <p style="color: var(--muted); font-size: 0.85rem;">Qty: ${item.quantity}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadOrders() {
    try {
        allOrders = await apiRequest(`/api/orders/customer/${customer.customer_id}`);
        renderOrders();
    } catch (err) {
        ordersContainer.innerHTML = `<h2>My Orders</h2><p class="empty-state">Failed to load orders: ${err.message}</p>`;
    }
}

// Search bar keydown
const navSearch = document.getElementById('nav-search');
navSearch?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const query = navSearch.value.trim();
        if (query) {
            window.location.href = `home.html?search=${encodeURIComponent(query)}`;
        }
    }
});

(async function initOrders() {
    try {
        await updateCartCount();
        await loadOrders();
    } catch (err) {
        console.error(err);
    }
})();
