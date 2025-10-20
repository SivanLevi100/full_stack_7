# 🛒 MarketPlus - Online Supermarket Platform
A comprehensive full-stack web application for managing an online supermarket with separate interfaces for customers and administrators. Built with React, Node.js, Express, and MySQL.

## 📋 Overview

**MarketPlus** is a complete e-commerce platform developed as part of a Full Stack Development course assignment. It provides a professional solution for supermarket operations with role-based access control, real-time inventory management, order processing, and comprehensive business analytics.
The system simulates a real-world supermarket experience with customer shopping features and powerful admin tools for managing products, inventory, orders, and users. All authentication is handled securely with JWT tokens and bcrypt password hashing.

## 💻 Technologies & Stack
### Backend Architecture
- **Runtime:** Node.js with Express.js framework
- **Database:** MySQL 8.0+ with connection pooling
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** Bcrypt hashing
- **File Uploads:** Multer middleware
- **HTTP Client:** Axios for external requests
- **Environment:** dotenv for configuration
### Frontend Architecture
- **Framework:** React 18+ with Hooks
- **Routing:** React Router v6
- **HTTP Client:** Axios with interceptors
- **UI Components:** Lucide React icons
- **Styling:** Custom CSS with Tailwind utilities
- **Notifications:** React Hot Toast
- **Charts:** Recharts for data visualization
- **Package Manager:** npm 
### Database Design
- **Relational MySQL** schema with proper normalization
- Connection pooling for performance optimization
- Indexed columns for fast query execution
- Foreign key constraints for data integrity
- Transaction support for atomic operations

## ✨ Key Features
### Customer Features
#### Secure Authentication
- User registration with email validation
- Login with JWT token management
- Password reset capability
- Session persistence across page refreshes
#### Product Management
- Browse all supermarket products
- Search products by name
- Filter by category
- Sort by price and availability
- View detailed product information
#### Shopping Cart
- Add/remove products from cart
- Update quantity for items
- Real-time cart total calculation
- Cart persistence (survives page refresh)
- Clear entire cart functionality
#### Order Processing
- One-click order placement from cart
- Automatic stock deduction on purchase
- Order confirmation and details
- View complete order history
- Track order status in real-time
#### User Dashboard
- Personal information display
- Quick access to recent orders
- Order statistics and summary
- Account settings and preferences
#### Responsive Interface
- Mobile-optimized design
- Tablet-friendly layouts
- Desktop full experience
- Touch-friendly buttons and controls
### Admin Features
#### Comprehensive Dashboard
- Real-time KPIs (Total Revenue, Orders, Users)
- Recent orders with quick access
- Low stock products alerts
- Revenue trends and analytics
- Pending orders count
#### Product Management
- Add new products with details
- Edit existing product information
- Delete products with safety confirmation
- Upload product images
- Manage stock quantities
- Track low-stock items
#### Inventory Control
- Monitor stock levels in real-time
- Low stock alerts and notifications
- Stock adjustment functionality
- Inventory reports and analytics
#### Category Management
- Create product categories
- Edit category information
- Delete categories with constraint checking
- Organize products by category
#### Order Administration
- View all customer orders
- Update order status (pending → confirmed → delivered)
- View detailed order items
- Add/remove items from orders
- Update order totals
- Delete orders with stock restoration
#### User Management
- View all registered users
- Create new user accounts
- Edit user information
- Assign admin/customer roles
- Delete user accounts
#### Business Analytics
- Sales revenue tracking
- Monthly sales charts
- Order trends analysis
- Customer statistics
- Product performance reports
- Exportable data summaries

## 🔧 Technical Implementation

### Security
- JWT-based stateless authentication
- Secure password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- CORS configuration
- Input validation and sanitization
### Data Management
- Foreign key constraints enforcement
- Transaction support for operations
- Soft delete for categories
- Stock synchronization
- Data consistency checks
  
### User Experience
- Toast notifications for all actions
- Loading indicators on async operations
- Error messages with helpful context
- Form validation with inline feedback
- Confirmation dialogs for destructive actions
- Empty state handling

### Internationalization
- Full Hebrew language support
- Right-to-left (RTL) text direction
- Localized date formatting
- Hebrew error messages

## 📁 Project Structure

```
MarketPlus/
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/              # App images and logos
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top navigation bar
│   │   │   ├── Footer.jsx           # Footer with info
│   │   │   ├── ProtectedRoute.jsx   # Route protection
│   │   │   ├── ScrollToTop.jsx      # Auto-scroll handler
│   │   │   └── ...
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── Dashboard.jsx        # Main dashboard (role-based)
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── Products.jsx     # Product management
│   │   │   │   ├── Categories.jsx   # Category management
│   │   │   │   ├── Orders.jsx       # Order admin
│   │   │   │   ├── OrderDetails.jsx # Order details & items
│   │   │   │   ├── Users.jsx        # User management
│   │   │   │   └── Reports.jsx      # Analytics & reports
│   │   │   │
│   │   │   └── customer/
│   │   │       ├── CustomerDashboard.jsx
│   │   │       ├── Shop.jsx         # Product browsing
│   │   │       ├── MyCart.jsx       # Shopping cart
│   │   │       ├── MyOrders.jsx     # Order history
│   │   │       └── Payment.jsx      # Checkout
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Axios API configuration
│   │   │
│   │   ├── styles/
│   │   │   ├── index.css            # Global styles
│   │   │   ├── auth.css
│   │   │   ├── navbar.css
│   │   │   ├── admin-dashboard.css
│   │   │   ├── admin-products.css
│   │   │   └── ...
│   │   │
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # React DOM entry
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── backend/
│   ├── config/
│   │   └── database.js              # MySQL pool config
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT & role auth
│   │   └── upload.js                # Multer file upload
│   │
│   ├── models/
│   │   ├── User.js                  # User model
│   │   ├── Product.js               # Product model
│   │   ├── Category.js              # Category model
│   │   ├── Order.js                 # Order model
│   │   ├── OrderItem.js             # Order items model
│   │   └── Cart.js                  # Shopping cart model
│   │
│   ├── routes/
│   │   ├── auth.js                  # Auth routes
│   │   ├── users.js                 # User routes
│   │   ├── products.js              # Product routes
│   │   ├── categories.js            # Category routes
│   │   ├── orders.js                # Order routes
│   │   ├── orderItems.js            # Order items routes
│   │   └── cart.js                  # Cart routes
│   │
│   ├── uploads/                     # Product images directory
│   ├── server.js                    # Express app setup
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── Create_Tables.sql            # Schema creation
│   └── Insert_Tables.sql            # Sample data
│
└── README.md
```

## 📸 Screenshots
### LogIn Page 
<p align="left">
<img src="https://github.com/Tehila-David/Library_manage/blob/main/Screenshots/Login_page.jpg" width="80%">
</p>

### Register Page 
<p align="left">
<img src="https://github.com/Tehila-David/Library_manage/blob/main/Screenshots/register_page.png" width="80%">
</p>

### Books Page
<p align="left">
<img src="https://github.com/Tehila-David/Library_manage/blob/main/Screenshots/books_page.png" width="80%">
</p>

### Add Book Page
<p align="left">
<img src="https://github.com/Tehila-David/Library_manage/blob/main/Screenshots/add_book_page.png" width="80%">
</p>

### History Page
<p align="left">
<img src="https://github.com/Tehila-David/Library_manage/blob/main/Screenshots/history_page.png" width="80%">
</p>




