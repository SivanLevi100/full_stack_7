// src/pages/Dashboard.js
/**
 * Dashboard Page Component
 *
 * This component dynamically renders the appropriate dashboard
 * (Admin or Customer) based on the authenticated user's role.
 * It also handles loading state before deciding which dashboard to show.
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import CustomerDashboard from './customer/CustomerDashboard';

/**
 * Dashboard Component
 *
 * @returns {JSX.Element} The admin or customer dashboard based on user role.
 */
const Dashboard = () => {
  const { isAdmin, loading } = useAuth();

  // Loading state - show spinner until auth status is resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render dashboard depending on user role
  return isAdmin() ? <AdminDashboard /> : <CustomerDashboard />;
};

export default Dashboard;
