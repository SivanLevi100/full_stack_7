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


## ✨ Key Features

- **Single Page Application (SPA)** - Seamless navigation without page reloads
- **Complete Authentication System** - Login and registration functionality
- **Book Management** - Add, edit, delete, and search operations
- **Advanced Filtering** - Filter books by multiple criteria
- **Action History** - Track all changes to the library database
- **User Activity Statistics** - Visual representation of library management actions
- **Responsive Design** - Mobile-friendly interface
- **Custom AJAX Simulation** - Client-server architecture within the browser
- **RTL Support** - Full Hebrew language support

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

