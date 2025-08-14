// src/pages/Dashboard.js - דף בקרה מעודכן עם הפניה חכמה
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';

const Dashboard = () => {
  const { isAdmin } = useAuth();

  // החזרת הקומפוננט המתאים בהתאם לסוג המשתמש
  if (isAdmin()) {
    return <AdminDashboard />;
  } else {
    return <CustomerDashboard />;
  }
};

export default Dashboard;