/**
 * Reports.jsx - Enhanced Business Reports and Analytics Page
 * 
 * This component provides comprehensive business reporting functionality:
 * - Real-time KPI dashboard with revenue, orders, users, and alerts
 * - Interactive sales charts with monthly data visualization
 * - Recent orders table with status tracking
 * - Low stock products monitoring and alerts
 * - Responsive chart components using Recharts library
 * - Advanced data processing for real sales analytics
 * - Mobile-responsive design with proper accessibility
 * - Dynamic data calculation from actual order history
 */

import React, { useEffect, useState } from 'react';
import { ordersAPI, productsAPI, usersAPI } from '../../services/api';
import { DollarSign, ShoppingCart, Users, AlertTriangle, BarChart3, Package } from 'lucide-react';
import { LineChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Line } from 'recharts';

const Reports = () => {
  // Business statistics state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    todayOrders: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  /**
   * Generate real sales data from actual orders
   * Processes order history to create monthly sales analytics
   * 
   * @param {Array} orders - Array of order objects
   * @returns {Array} Monthly sales data for charts
   */
  const generateRealSalesData = (orders) => {
    const monthNames = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    // Create monthly data map
    const monthlyData = {};
    
    // Initialize all months with zero values
    monthNames.forEach((month, index) => {
      monthlyData[index] = {
        month: month,
        sales: 0,
        orders: 0
      };
    });

    // Calculate real monthly sales from orders
    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        const orderDate = new Date(order.order_date);
        const month = orderDate.getMonth();
        const year = orderDate.getFullYear();
        const currentYear = new Date().getFullYear();
        
        // Only include current year orders
        if (year === currentYear) {
          monthlyData[month].sales += parseFloat(order.total_amount || 0);
          monthlyData[month].orders += 1;
        }
      }
    });

    // Convert to array and get last 6 months
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push({
        month: monthlyData[monthIndex].month,
        sales: Math.round(monthlyData[monthIndex].sales),
        orders: monthlyData[monthIndex].orders
      });
    }

    return last6Months;
  };

  /**
   * Load comprehensive reports data
   * Fetches and processes data from multiple APIs
   */
  const loadReportsData = async () => {
    try {
      setLoading(true);
      const [products, orders, users, lowStock] = await Promise.all([
        productsAPI.getAll(),
        ordersAPI.getAll(),
        usersAPI.getAll(),
        productsAPI.getLowStock()
      ]);

      // Calculate business metrics
      const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

      const today = new Date();
      const todayOrders = orders.filter(
        o => new Date(o.order_date).toDateString() === today.toDateString()
      ).length;

      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalUsers: users.length,
        lowStockProducts: lowStock.length,
        pendingOrders,
        todayOrders
      });

      // Sort orders by date (newest first)
      const sortedOrders = orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      setRecentOrders(sortedOrders.slice(0, 8));
      setLowStockProducts(lowStock.slice(0, 6));

      // Generate real sales data
      const realSalesData = generateRealSalesData(orders);
      setSalesData(realSalesData);

    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert status codes to Hebrew display text
   * 
   * @param {string} status - Order status code
   * @returns {string} Localized status text
   */
  const getStatusText = (status) => {
    const map = { 
      pending: 'ממתין', 
      confirmed: 'אושר', 
      delivered: 'נמסר', 
      cancelled: 'בוטל' 
    };
    return map[status] || status;
  };

  /**
   * Get CSS class for status styling
   * 
   * @param {string} status - Order status code
   * @returns {string} CSS class name
   */
  const getStatusClass = (status) => {
    const map = { 
      pending: 'reports-status-pending', 
      confirmed: 'reports-status-confirmed', 
      delivered: 'reports-status-delivered', 
      cancelled: 'reports-status-cancelled' 
    };
    return map[status] || 'reports-status-pending';
  };

  /**
   * Report KPI Card Component
   * Displays individual key performance indicators
   * 
   * @param {string} title - Card title
   * @param {string|number} value - Main value to display
   * @param {ReactNode} icon - Icon component
   * @param {string} type - Card type for styling
   */
  const ReportCard = ({ title, value, icon, type }) => (
    <div className={`reports-kpi-card reports-kpi-card-${type}`}>
      <div className="reports-kpi-content">
        <div className="reports-kpi-info">
          <h3>{title}</h3>
          <p>{value}</p>
        </div>
        <div className={`reports-kpi-icon reports-kpi-icon--${type}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Loading state component
  if (loading) {
    return (
      <div className="reports-container">
        <div className="reports-page">
          <div className="reports-loading">
            <div className="reports-loading-spinner"></div>
            <p className="reports-loading-text">טוען נתוני דוחות...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-page">
        {/* Page Header */}
        <div className="reports-header">
          <h1 className="reports-title">דוחות מערכת</h1>
        </div>

        {/* KPI Cards Grid */}
        <div className="reports-kpi-grid">
          <ReportCard 
            title="סך הכנסות" 
            value={`₪${stats.totalRevenue.toLocaleString()}`} 
            icon={<DollarSign className="h-6 w-6" />} 
            type="revenue"
          />
          <ReportCard 
            title="סך הזמנות" 
            value={stats.totalOrders} 
            icon={<ShoppingCart className="h-6 w-6" />} 
            type="orders"
          />
          <ReportCard 
            title="לקוחות פעילים" 
            value={stats.totalUsers} 
            icon={<Users className="h-6 w-6" />} 
            type="users"
          />
          <ReportCard 
            title="מוצרים במלאי נמוך" 
            value={stats.lowStockProducts} 
            icon={<AlertTriangle className="h-6 w-6" />} 
            type="alerts"
          />
        </div>

        {/* Sales Chart */}
        <div className="reports-chart-container">
          <div className="reports-chart-header">
            <BarChart3 className="reports-chart-icon h-6 w-6" />
            <h2 className="reports-chart-title">מכירות חודשיות (6 חודשים אחרונים)</h2>
          </div>
          <div className="reports-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickFormatter={(value) => `₪${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `₪${value.toLocaleString()}`, 
                    name === 'sales' ? 'מכירות' : 'הזמנות'
                  ]}
                  labelFormatter={(label) => `חודש: ${label}`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="reports-table-container">
          <div className="reports-table-header-section">
            <h2 className="reports-table-title">הזמנות אחרונות</h2>
          </div>
          {recentOrders.length === 0 ? (
            <div className="reports-empty">
              <p className="reports-empty-text">אין הזמנות אחרונות</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="reports-table">
                <thead className="reports-table-head">
                  <tr>
                    <th data-label="#ID">#ID</th>
                    <th data-label="תאריך">תאריך</th>
                    <th data-label="שם לקוח">שם לקוח</th>
                    <th data-label="סה״כ">סה״כ</th>
                    <th data-label="סטטוס">סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="reports-table-row">
                      <td className="reports-table-cell" data-label="#ID">
                        <span className="reports-order-id">{order.id}</span>
                      </td>
                      <td className="reports-table-cell" data-label="תאריך">
                        <span className="reports-order-date">
                          {new Date(order.order_date).toLocaleDateString('he-IL')}
                        </span>
                      </td>
                      <td className="reports-table-cell" data-label="שם לקוח">
                        <span className="reports-customer-name">
                          {order.full_name || order.user_name || `User ${order.user_id}`}
                        </span>
                      </td>
                      <td className="reports-table-cell" data-label="סה״כ">
                        <span className="reports-order-amount">
                          ₪{parseFloat(order.total_amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="reports-table-cell" data-label="סטטוס">
                        <span className={`reports-status-badge ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Products Section */}
        {lowStockProducts.length > 0 && (
          <div className="reports-low-stock-container">
            <div className="reports-low-stock-header">
              <Package className="reports-low-stock-icon h-6 w-6" />
              <h2 className="reports-low-stock-title">מוצרים במלאי נמוך</h2>
            </div>
            <div className="reports-low-stock-grid">
              {lowStockProducts.map(product => (
                <div key={product.id} className="reports-low-stock-item">
                  <div>
                    <div className="reports-low-stock-name">{product.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      מלאי נוכחי: {product.stock_quantity} יחידות
                    </div>
                  </div>
                  <div className="reports-low-stock-quantity">
                    {product.stock_quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;