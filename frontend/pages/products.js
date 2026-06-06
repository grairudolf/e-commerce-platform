const detailsContainer = document.getElementById('product-details-container');
const reviewsList = document.getElementById('reviews-list');
const addReviewForm = document.getElementById('add-review-form');
const ratingStars = document.getElementById('rating-stars');
const reviewCommentInput = document.getElementById('review-comment');
const cartCountBadge = document.getElementById('cart-count');

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
const customer = getCustomer();

let selectedRating = 5;
let productData = null;
let selectedVariantIndex = 0;

if (!customer) {
    window.location.href = '../index.html';
}

if (!productId) {
    window.location.href = 'home.html';
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

// Setup star rating clicks
ratingStars?.addEventListener('click', (event) => {
    const star = event.target.closest('[data-rating]');
    if (!star) return;

    selectedRating = parseInt(star.dataset.rating, 10);
    const stars = ratingStars.querySelectorAll('i');
    stars.forEach((s, idx) => {
        if (idx < selectedRating) {
            s.classList.add('selected');
        } else {
            s.classList.remove('selected');
        }
    });
});

// Select default rating stars
(function selectDefaultStars() {
    const stars = ratingStars?.querySelectorAll('i');
    stars?.forEach((s, idx) => {
        if (idx < selectedRating) s.classList.add('selected');
    });
})();

async function loadProductDetails() {
    try {
        productData = await apiRequest(`/api/products/${productId}`);
        renderProduct();
        renderReviews();
    } catch (err) {
        detailsContainer.innerHTML = `<p class="empty-state">Error: ${err.message}</p>`;
    }
}

function renderProduct() {
    if (!productData) return;

    const mainImage = productImage(productData, 0);
    const imagesList = Array.isArray(productData.images) && productData.images.length
        ? productData.images
        : [mainImage];

    const variants = productData.variants || [];
    const activeVariant = variants[selectedVariantIndex] || null;

    detailsContainer.innerHTML = `
        <div class="product-gallery">
            <img src="${mainImage}" alt="${productData.prod_name}" class="main-img" id="main-product-image" />
            <div class="thumbnails">
                ${imagesList.map((img, idx) => `
                    <img src="${img}" alt="Thumbnail ${idx + 1}" class="${idx === 0 ? 'active' : ''}" data-index="${idx}" />
                `).join('')}
            </div>
        </div>

        <div class="product-details">
            <nav class="breadcrumb">
                Home > ${productData.cat_name || 'Catalog'} > ${productData.prod_name}
            </nav>

            <h1>${productData.prod_name}</h1>
            <p class="brand">by ${productData.brand_name || productData.vendor_name || 'Trendora'}</p>

            <div class="rating">
                <span id="avg-rating-value">⭐ 0.0</span>
                <small id="reviews-count-label">(0 reviews)</small>
            </div>

            <div class="price">
                <span class="current">${money(activeVariant ? activeVariant.prod_price : productData.price)}</span>
                ${activeVariant && activeVariant.prod_price < productData.price ? `
                    <span class="old">${money(productData.price)}</span>
                    <span class="discount">${Math.round((1 - activeVariant.prod_price / productData.price) * 100)}% OFF</span>
                ` : ''}
            </div>

            <p class="description">
                ${productData.prod_description || 'No description available for this premium product.'}
            </p>

            ${variants.length ? `
                <div class="colors" id="variants-list">
                    ${variants.map((v, idx) => `
                        <button type="button" class="color-btn ${idx === selectedVariantIndex ? 'active' : ''}" data-var-index="${idx}">
                            ${v.prod_size ? `Size: ${v.prod_size}` : ''} 
                            ${v.prod_color ? `Color: ${v.prod_color}` : ''}
                            (${v.stock_quantity} in stock)
                        </button>
                    `).join('')}
                </div>
            ` : '<p class="description"><strong>Out of Stock</strong></p>'}

            ${activeVariant && activeVariant.stock_quantity > 0 ? `
                <div class="quantity">
                    <button type="button" id="qty-minus">-</button>
                    <input type="number" id="qty-input" value="1" min="1" max="${activeVariant.stock_quantity}" />
                    <button type="button" id="qty-plus">+</button>
                </div>
                <button class="add-cart" id="add-to-cart-btn">Add to Cart</button>
            ` : '<p style="color: var(--red); font-weight: 700; margin-bottom: 2rem;">Out of stock</p>'}

            <ul class="features">
                <li><i class="fa fa-truck"></i> Free shipping on orders over $50</li>
                <li><i class="fa fa-undo"></i> 30-day return policy</li>
                <li><i class="fa fa-shield-alt"></i> 1-year warranty included</li>
            </ul>
        </div>
    `;

    // Add Thumbnail Click Event
    const thumbs = detailsContainer.querySelectorAll('.thumbnails img');
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            const mainImg = detailsContainer.querySelector('#main-product-image');
            if (mainImg) mainImg.src = thumb.src;
        });
    });

    // Add Variant Click Event
    const varButtons = detailsContainer.querySelectorAll('#variants-list button');
    varButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedVariantIndex = parseInt(btn.dataset.varIndex, 10);
            renderProduct(); // Re-render to update price, description and stock!
        });
    });

    // Quantity events
    const qtyInput = detailsContainer.querySelector('#qty-input');
    const btnMinus = detailsContainer.querySelector('#qty-minus');
    const btnPlus = detailsContainer.querySelector('#qty-plus');

    btnMinus?.addEventListener('click', () => {
        const val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) qtyInput.value = val - 1;
    });

    btnPlus?.addEventListener('click', () => {
        const val = parseInt(qtyInput.value, 10) || 1;
        const max = parseInt(qtyInput.getAttribute('max'), 10) || 99;
        if (val < max) qtyInput.value = val + 1;
    });

    // Add to cart event
    const btnAddCart = detailsContainer.querySelector('#add-to-cart-btn');
    btnAddCart?.addEventListener('click', async () => {
        if (!activeVariant) return;
        const quantity = parseInt(qtyInput.value, 10) || 1;

        try {
            await apiRequest('/api/cart/add', {
                method: 'POST',
                body: JSON.stringify({
                    customer_id: customer.customer_id,
                    prod_var_id: activeVariant.prod_var_id,
                    quantity
                })
            });

            alert('Item added to cart.');
            updateCartCount();
        } catch (err) {
            alert(err.message);
        }
    });
}

function renderReviews() {
    if (!productData) return;

    const reviews = productData.reviews || [];
    const avgSpan = document.getElementById('avg-rating-value');
    const labelSpan = document.getElementById('reviews-count-label');

    if (reviews.length) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = (total / reviews.length).toFixed(1);
        if (avgSpan) avgSpan.textContent = `⭐ ${avg}`;
        if (labelSpan) labelSpan.textContent = `(${reviews.length} review${reviews.length > 1 ? 's' : ''})`;
    } else {
        if (avgSpan) avgSpan.textContent = `⭐ 0.0`;
        if (labelSpan) labelSpan.textContent = `(0 reviews)`;
    }

    if (!reviews.length) {
        reviewsList.innerHTML = '<p class="empty-state">No reviews yet. Be the first to review this product!</p>';
        return;
    }

    reviewsList.innerHTML = reviews.map(r => `
        <div class="review">
            <div class="avatar">${(r.first_name || 'U').substring(0,1)}${(r.last_name || '').substring(0,1)}</div>
            <div class="content">
                <h4>${r.first_name} ${r.last_name} <span class="time">${new Date(r.created_at).toLocaleDateString()}</span></h4>
                <p>${r.comment || ''}</p>
                <div class="stars">${'⭐'.repeat(r.rating)}</div>
            </div>
        </div>
    `).join('');
}

addReviewForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const comment = reviewCommentInput.value.trim();
    if (!comment) return;

    try {
        await apiRequest(`/api/products/${productId}/reviews`, {
            method: 'POST',
            body: JSON.stringify({
                customer_id: customer.customer_id,
                comment,
                rating: selectedRating
            })
        });

        alert('Review submitted successfully!');
        reviewCommentInput.value = '';
        
        // Reload product details to fetch updated reviews
        await loadProductDetails();
    } catch (err) {
        alert(err.message);
    }
});

// Search bar in navbar handler
const navSearch = document.getElementById('nav-search');
navSearch?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const query = navSearch.value.trim();
        if (query) {
            window.location.href = `home.html?search=${encodeURIComponent(query)}`;
        }
    }
});

(async function initProducts() {
    try {
        await updateCartCount();
        await loadProductDetails();
    } catch (err) {
        console.error(err);
    }
})();
