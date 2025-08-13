-- מוצרים לדוגמה
INSERT INTO products (name, category_id, price, stock_quantity) VALUES 
('חלב 3% טרה', 1, 5.90, 50),
('לחם פרוס', 2, 6.50, 30),
('תפוחים אדומים', 3, 8.90, 25),
('עוף שלם קפוא', 4, 25.90, 15),
('קוקה קולה 1.5 ליטר', 5, 7.90, 40);

-- ========================================
-- נתונים ראשוניים לדוגמה
-- ========================================

-- קטגוריות בסיסיות
INSERT INTO categories (name) VALUES 
('מוצרי חלב'),
('לחם ומאפים'),
('פירות וירקות'),
('בשר ודגים'),
('משקאות');

-- משתמשים בסיסיים
INSERT INTO users (email, password, full_name, role) VALUES 
('admin@supermarket.com', 'hashed_password', 'מנהל מערכת', 'admin'),
('customer@example.com', 'hashed_password', 'לקוח לדוגמה', 'customer');