
//import './App.css'

// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute, { AuthRedirect } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import './styles/index.css';



// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shop from './pages/customer/Shop';
import Cart from './pages/customer/Cart';
import MyOrders from './pages/customer/MyOrders';
import MyCart from './pages/customer/MyCart';
import Payment from './pages/customer/Payment';

import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import OrderDetails from './pages/admin/OrderDetails';

import Reports from './pages/admin/Reports';





// Layout component
const Layout = ({ children }) => (
  <div >
    <Navbar/>
    <main>
      {children}
    </main>
     <Footer />
    
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes - redirect if logged in */}
            <Route path="/login" element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            } />
            <Route path="/register" element={
              <AuthRedirect>
                <Register />
              </AuthRedirect>
            } />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/shop" element={
              <ProtectedRoute>
                <Layout>
                  <Shop />
                </Layout>
              </ProtectedRoute>
            } />


            <Route path="/my-cart" element={
              <ProtectedRoute>
                <Layout>
                  <MyCart />
                </Layout>
              </ProtectedRoute>
            } />


            <Route path="/my-orders" element={
              <ProtectedRoute>
                <Layout>
                  <MyOrders />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/payment" element={
              <ProtectedRoute>
                <Layout>
                  <Payment />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/products" element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/categories" element={
              <ProtectedRoute>
                <Layout>
                  <Categories />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/orders" element={
              <ProtectedRoute>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            } />


            <Route path="/users" element={
              <ProtectedRoute>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            } />

            <Route
              path="/order-details/:orderId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrderDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />

             <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <Reports  />
                </Layout>
              </ProtectedRoute>
            } />


            

             





            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">העמוד שחיפשת לא נמצא</p>
                  <Navigate to="/dashboard" replace />
                </div>
              </div>
            } />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                direction: 'rtl',
                textAlign: 'right'
              },
              success: {
                style: {
                  background: '#059669',
                },
              },
              error: {
                style: {
                  background: '#dc2626',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
