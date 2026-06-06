-- Role 1: Product Manager
CREATE ROLE product_manager WITH LOGIN PASSWORD 'ProdMgr@Trendora2025';
GRANT SELECT, INSERT, UPDATE ON product TO product_manager;
GRANT SELECT, INSERT, UPDATE ON categories TO product_manager;
GRANT SELECT, INSERT, UPDATE ON product_variants TO product_manager;
GRANT SELECT, INSERT, UPDATE ON product_images TO product_manager;
GRANT SELECT ON vendor TO product_manager;
REVOKE DELETE ON product FROM product_manager;

-- Role 2: Finance Admin
CREATE ROLE finance_admin WITH LOGIN PASSWORD 'Finance@Trendora2025';
GRANT SELECT ON payment TO finance_admin;
GRANT SELECT ON orders TO finance_admin;
GRANT SELECT ON order_items TO finance_admin;
GRANT SELECT ON coupon_usages TO finance_admin;
REVOKE INSERT, UPDATE, DELETE ON payment FROM finance_admin;

-- Role 3: Customer Support
CREATE ROLE support_staff WITH LOGIN PASSWORD 'Support@Trendora2025';
GRANT SELECT ON customer TO support_staff;
GRANT SELECT ON addresses TO support_staff;
GRANT SELECT ON orders TO support_staff;
GRANT SELECT ON reviews TO support_staff;
REVOKE INSERT, UPDATE, DELETE ON customer FROM support_staff;
REVOKE INSERT, UPDATE, DELETE ON orders FROM support_staff;

-- Enable database logging configuration
ALTER SYSTEM SET logging_collector = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_statement = 'ddl';
SELECT pg_reload_conf();

-- Enable Row Level Security (RLS) (CIA Triad: Confidentiality & Integrity)
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment ENABLE ROW LEVEL SECURITY;

-- Customer table RLS: users can only manage their own profile
CREATE POLICY customer_self_policy ON customer
    FOR ALL
    USING (customer_id = NULLIF(current_setting('app.current_customer_id', true), '')::uuid);

-- Address RLS: users can only manage their own addresses
CREATE POLICY address_self_policy ON addresses
    FOR ALL
    USING (customer_id = NULLIF(current_setting('app.current_customer_id', true), '')::uuid);

-- Cart RLS: users can only manage their own carts
CREATE POLICY cart_self_policy ON carts
    FOR ALL
    USING (customer_id = NULLIF(current_setting('app.current_customer_id', true), '')::uuid);
