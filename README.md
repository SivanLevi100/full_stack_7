# 🛒 MarketPlus - Online Supermarket Platform
A comprehensive full-stack web application for managing an online supermarket with separate interfaces for customers and administrators. Built with React, Node.js, Express, and MySQL.

## 📋 Overview

**MarketPlus** is a complete e-commerce platform developed as part of a Full Stack Development course assignment. It provides a professional solution for supermarket operations with role-based access control, real-time inventory management, order processing, and comprehensive business analytics.
The system simulates a real-world supermarket experience with customer shopping features and powerful admin tools for managing products, inventory, orders, and users. All authentication is handled securely with JWT tokens and bcrypt password hashing.

## 💻 Technologies & Stack
### Backend Architecture
- Runtime: Node.js with Express.js framework
- Database: MySQL 8.0+ with connection pooling
- Authentication: JWT (JSON Web Tokens)
- Password Security: Bcrypt hashing
- File Uploads: Multer middleware
- HTTP Client: Axios for external requests
- Environment: dotenv for configuration
### Frontend Architecture
- Framework: React 18+ with Hooks
- Routing: React Router v6
- HTTP Client: Axios with interceptors
- UI Components: Lucide React icons
- Styling: Custom CSS with Tailwind utilities
- Notifications: React Hot Toast
- Charts: Recharts for data visualization
- Package Manager: npm or yarn
### Database Design
- Relational MySQL schema with proper normalization
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







## 🔧 Technical Implementation

### Client-Server Architecture
The application simulates a complete client-server architecture within the browser:

- **FXMLHttpRequest** - Custom implementation mimicking XMLHttpRequest
- **Network Simulation** - Artificial delays and message drops
- **Separate Servers** - AuthServer and BooksServer for different functionality
- **Database Classes** - UsersDB and BooksDB for data management

### Single Page Application
The app uses a custom router to handle navigation:
- Hash-based routing
- Dynamic template loading
- Page transitions without reloads

## 📁 Project Structure

```
/
├── Client/
│   ├── CSS/
│   │   └── styles.css           # Main stylesheet
│   └── JS/
│       ├── app.js               # Main application logic
│       ├── fajax.js             # AJAX simulation
│       └── network.js           # Network simulation
│
├── Database/
│   ├── BooksDB.js               # Book database management
│   └── UsersDB.js               # User database management
│
├── Server/
│   ├── auth_server.js           # Authentication server
│   └── books_server.js          # Books management server
│
└── index.html                   # Main HTML file with templates
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


## 🔍 Application Flow

1. **Authentication** - Users start at the login page and can either login or register.
2. **Books Management** - After login, users can view, add, edit, or delete books.
3. **Search & Filter** - Users can search by title/author and filter by location/status.
4. **Action History** - Track all library management actions with detailed statistics.

