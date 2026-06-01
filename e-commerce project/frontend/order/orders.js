const ordersContainer = document.querySelector('.orders-container');

function renderOrders(orders) {
    ordersContainer.innerHTML = `
        <h2>My Orders</h2>
        <div class="tabs">
            <button class="active">All Orders</button>
            <button>Pending</button>
            <button>Delivered</button>
            <button>Cancelled</button>
        </div>
        ${orders.length ? orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <p><strong>Order ID:</strong> ${order.order_number}</p>
                        <p><strong>Date:</strong> ${new Date(order.placed_at).toLocaleDateString()}</p>
                    </div>
                    <div class="order-total">
                        <p><strong>Total:</strong> ${money(order.total_amount)}</p>
                        <span class="status ${order.order_status}">${order.order_status}</span>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="primary" type="button">View Details</button>
                    <button class="secondary" type="button">${order.payment_status}</button>
                </div>
            </div>
        `).join('') : '<p>No orders yet.</p>'}
    `;
}

async function loadOrders() {
    const customer = getCustomer();
    if (!customer) {
        ordersContainer.innerHTML = '<h2>My Orders</h2><p>Please sign in to view your orders.</p>';
        return;
    }

    const orders = await apiRequest(`/api/orders/customer/${customer.customer_id}`);
    renderOrders(orders);
}

loadOrders().catch(err => console.error(err));
