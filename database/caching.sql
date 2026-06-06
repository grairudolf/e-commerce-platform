-- Featured products materialized view with category and vendor details
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_featured_products AS
SELECT
    p.prod_id,
    p.prod_name,
    p.price,
    p.prod_description,
    c.cat_name,
    v.vendor_name,
    v.brand_name
FROM product p
LEFT JOIN categories c ON p.cat_id   = c.cat_id
LEFT JOIN vendor     v ON p.vendor_id = v.vendor_id
WHERE p.price IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_featured_products_id ON mv_featured_products (prod_id);

-- Category summary materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_category_summary AS
SELECT
    c.cat_id,
    c.cat_name,
    COUNT(p.prod_id) AS product_count
FROM categories c
LEFT JOIN product p ON p.cat_id = c.cat_id
GROUP BY c.cat_id, c.cat_name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_category_summary_id ON mv_category_summary (cat_id);

-- Daily sales totals materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_sales AS
SELECT
    DATE(placed_at)       AS sale_date,
    COUNT(order_id)       AS total_orders,
    SUM(total_amount)     AS total_revenue
FROM orders
WHERE order_status != 'cancelled'
GROUP BY DATE(placed_at)
ORDER BY sale_date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_sales_date ON mv_daily_sales (sale_date);

-- Top vendors materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_vendors AS
SELECT
    v.vendor_id,
    v.vendor_name,
    v.brand_name,
    COUNT(DISTINCT o.order_id)          AS total_orders,
    SUM(oi.unit_price * oi.quantity)    AS total_revenue
FROM vendor v
JOIN product          p  ON p.vendor_id   = v.vendor_id
JOIN product_variants pv ON pv.prod_id    = p.prod_id
JOIN order_items      oi ON oi.prod_var_id= pv.prod_var_id
JOIN orders           o  ON o.order_id    = oi.order_id
GROUP BY v.vendor_id, v.vendor_name, v.brand_name
ORDER BY total_orders DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_vendors_id ON mv_top_vendors (vendor_id);
