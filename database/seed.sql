-- Demo data for the Trendora frontend and API.
-- Run after database/schema.sql has completed successfully.

INSERT INTO categories (cat_id, cat_name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Electronics'),
    ('22222222-2222-2222-2222-222222222222', 'Fashion'),
    ('33333333-3333-3333-3333-333333333333', 'Home & Living'),
    ('44444444-4444-4444-4444-444444444444', 'Groceries')
ON CONFLICT (cat_name) DO NOTHING;

INSERT INTO vendor (
    vendor_id,
    brand_name,
    vendor_name,
    vendor_email,
    telephone_num,
    business_address,
    is_verified
) VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Molyko Gadgets',
        'Molyko Gadgets Ltd',
        'sales@molyko-gadgets.example',
        '+237650000001',
        'Molyko, Buea, Cameroon',
        TRUE
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Akwa Styles',
        'Akwa Styles',
        'sales@akwa-styles.example',
        '+237650000002',
        'Akwa, Douala, Cameroon',
        TRUE
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Mfoundi Home',
        'Mfoundi Home Supplies',
        'sales@mfoundi-home.example',
        '+237650000003',
        'Mfoundi Market, Yaounde, Cameroon',
        TRUE
    )
ON CONFLICT (vendor_email) DO UPDATE SET
    brand_name = EXCLUDED.brand_name,
    vendor_name = EXCLUDED.vendor_name,
    business_address = EXCLUDED.business_address,
    is_verified = TRUE;

INSERT INTO customer (
    customer_id,
    first_name,
    last_name,
    email,
    phone_num,
    password_hash
) VALUES (
    '99999999-9999-9999-9999-999999999999',
    'Demo',
    'Customer',
    'demo@trendora.test',
    '+237650000099',
    '$2a$10$QaOSZX5sPN5GdnOKRXYSOeBf3LDPVZjBT1nWNHtlDhfZb7lM.viQq'
)
ON CONFLICT (email) DO UPDATE SET
    phone_num = EXCLUDED.phone_num,
    password_hash = EXCLUDED.password_hash;

INSERT INTO carts (cart_id, customer_id) VALUES
    ('88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999')
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO coupons (
    coupon_id,
    code,
    description,
    discount_type,
    discount_value,
    minimum_order_amount,
    usage_limit,
    starts_at,
    expires_at,
    is_active
) VALUES
    (
        '77777777-7777-7777-7777-777777777701',
        'MOMO10',
        '10 percent off mobile money checkout',
        'percentage',
        10,
        10000,
        500,
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '90 days',
        TRUE
    ),
    (
        '77777777-7777-7777-7777-777777777702',
        'DOUALA1500',
        '1,500 XAF off delivery orders',
        'fixed',
        1500,
        15000,
        500,
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '90 days',
        TRUE
    )
ON CONFLICT (code) DO UPDATE SET
    description = EXCLUDED.description,
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    minimum_order_amount = EXCLUDED.minimum_order_amount,
    usage_limit = EXCLUDED.usage_limit,
    starts_at = EXCLUDED.starts_at,
    expires_at = EXCLUDED.expires_at,
    is_active = TRUE;

INSERT INTO product (
    prod_id,
    vendor_id,
    cat_id,
    prod_name,
    price,
    prod_description
) VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'Oraimo Wireless Headphones',
        18500,
        'Bluetooth headphones with long battery life for commuting, calls and study sessions.'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'Classic White Sneakers',
        28500,
        'Clean everyday sneakers with a durable sole for city wear.'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '33333333-3333-3333-3333-333333333333',
        'Rechargeable LED Desk Lamp',
        15500,
        'Adjustable LED desk lamp for home offices, shops and study desks.'
    ),
    (
        '10000000-0000-0000-0000-000000000004',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '44444444-4444-4444-4444-444444444444',
        'Premium Cocoa Pack',
        6500,
        'Locally sourced cocoa pack for baking, drinks and pantry restock.'
    ),
    (
        '10000000-0000-0000-0000-000000000005',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'Portable Bluetooth Speaker',
        22500,
        'Compact speaker with strong sound for home, market stalls and travel.'
    )
ON CONFLICT (prod_id) DO UPDATE SET
    prod_name = EXCLUDED.prod_name,
    price = EXCLUDED.price,
    prod_description = EXCLUDED.prod_description,
    vendor_id = EXCLUDED.vendor_id,
    cat_id = EXCLUDED.cat_id;

INSERT INTO product_variants (
    prod_var_id,
    prod_id,
    prod_size,
    prod_color,
    prod_price,
    stock_quantity
) VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        NULL,
        'Black',
        18500,
        25
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        'EU 43',
        'White',
        28500,
        40
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000003',
        NULL,
        'Black',
        15500,
        18
    ),
    (
        '20000000-0000-0000-0000-000000000004',
        '10000000-0000-0000-0000-000000000004',
        '500g',
        NULL,
        6500,
        60
    ),
    (
        '20000000-0000-0000-0000-000000000005',
        '10000000-0000-0000-0000-000000000005',
        NULL,
        'Orange',
        22500,
        30
    )
ON CONFLICT (prod_var_id) DO UPDATE SET
    prod_size = EXCLUDED.prod_size,
    prod_color = EXCLUDED.prod_color,
    prod_price = EXCLUDED.prod_price,
    stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO product_images (prod_id, image_url)
SELECT data.prod_id::uuid, data.image_url
FROM (VALUES
    ('10000000-0000-0000-0000-000000000001', './src/pho_01.png'),
    ('10000000-0000-0000-0000-000000000002', './src/shoe.png'),
    ('10000000-0000-0000-0000-000000000003', './src/lamp.png'),
    ('10000000-0000-0000-0000-000000000004', './src/cacao.png'),
    ('10000000-0000-0000-0000-000000000005', './src/bt.png')
) AS data(prod_id, image_url)
WHERE NOT EXISTS (
    SELECT 1
    FROM product_images pi
    WHERE pi.prod_id = data.prod_id::uuid
      AND pi.image_url = data.image_url
);
