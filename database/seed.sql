-- Demo data for the Trendora frontend and API.
-- Run after database/schema.sql has completed successfully.

INSERT INTO categories (cat_id, cat_name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Electronics'),
    ('22222222-2222-2222-2222-222222222222', 'Fashion'),
    ('33333333-3333-3333-3333-333333333333', 'Home & Living'),
    ('44444444-4444-4444-4444-444444444444', 'Sports')
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
        'AudioTech',
        'AudioTech Ltd',
        'sales@audiotech.example',
        '+237650000001',
        'Douala, Cameroon',
        TRUE
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'StreetWear Co.',
        'StreetWear Co.',
        'sales@streetwear.example',
        '+237650000002',
        'Yaounde, Cameroon',
        TRUE
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'LightCraft',
        'LightCraft Home',
        'sales@lightcraft.example',
        '+237650000003',
        'Buea, Cameroon',
        TRUE
    )
ON CONFLICT (vendor_email) DO NOTHING;

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
ON CONFLICT (email) DO NOTHING;

INSERT INTO carts (cart_id, customer_id) VALUES
    ('88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999')
ON CONFLICT (customer_id) DO NOTHING;

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
        'Premium Wireless Headphones',
        129.99,
        'Active noise cancellation, long battery life, and comfortable wireless listening.'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'Classic White Sneakers',
        79.99,
        'Clean everyday sneakers with a lightweight sole and durable upper.'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '33333333-3333-3333-3333-333333333333',
        'Modern Desk Lamp',
        59.99,
        'Adjustable LED desk lamp for workspaces and study desks.'
    )
ON CONFLICT (prod_id) DO NOTHING;

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
        'Midnight Black',
        129.99,
        25
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        'US 10',
        'White',
        79.99,
        40
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000003',
        NULL,
        'Black',
        59.99,
        18
    )
ON CONFLICT (prod_var_id) DO NOTHING;

INSERT INTO product_images (prod_id, image_url) VALUES
    ('10000000-0000-0000-0000-000000000001', './src/pho_01.png'),
    ('10000000-0000-0000-0000-000000000002', './src/shoe.png'),
    ('10000000-0000-0000-0000-000000000003', './src/lamp.png');
