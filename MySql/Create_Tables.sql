-- ========================================
-- סכמת מסד נתונים לאפליקציית סופרמרקט
-- ========================================

CREATE DATABASE IF NOT EXISTS supermarket_db;
USE supermarket_db;

-- ========================================
-- 1. טבלת משתמשים
-- מטרה: ניהול לקוחות ומנהלים
-- ========================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. טבלת קטגוריות
-- מטרה: ארגון המוצרים לקבוצות
-- ========================================
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- ========================================
-- 3. טבלת מוצרים
-- מטרה: המוצרים הזמינים לרכישה
-- ========================================
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- קישורים
    FOREIGN KEY (category_id) REFERENCES categories(id),
    
    -- אינדקסים לחיפוש מהיר
    INDEX idx_category (category_id),
    INDEX idx_name (name)
);

-- ========================================
-- 4. עגלת קניות (זמני)
-- מטרה: שמירת מוצרים לפני רכישה
-- ========================================
CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- קישורים
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    -- מניעת כפילויות: משתמש אחד = מוצר אחד = שורה אחת
    UNIQUE KEY unique_user_product (user_id, product_id),
    
    -- אינדקס לחיפוש מהיר
    INDEX idx_user (user_id)
);

-- ========================================
-- 5. הזמנות (קבוע)
-- מטרה: תיעוד רכישות שהושלמו
-- ========================================
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'delivered', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- קישורים
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    -- אינדקסים לחיפוש מהיר
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
);

-- ========================================
-- 6. פריטי הזמנה (קבוע)
-- מטרה: פירוט מדויק של מה נרכש בכל הזמנה
-- ========================================
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL, -- מחיר ברגע הרכישה (קפוא)
    
    -- קישורים
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    
    -- אינדקס לחיפוש מהיר
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

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
-- מוצרים לדוגמה
INSERT INTO products (name, category_id, price, stock_quantity) VALUES 
('חלב 3% טרה', 1, 5.90, 50),
('לחם פרוס', 2, 6.50, 30),
('תפוחים אדומים', 3, 8.90, 25),
('עוף שלם קפוא', 4, 25.90, 15),
('קוקה קולה 1.5 ליטר', 5, 7.90, 40);