// src/pages/Reports.jsx
import React, { useEffect, useState } from 'react';
import { ordersAPI, productsAPI, usersAPI } from '../../services/api';
import { DollarSign, ShoppingCart, Users, AlertTriangle, BarChart3 } from 'lucide-react';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const Reports = () => {
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

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const [products, orders, users, lowStock] = await Promise.all([
        productsAPI.getAll(),
        ordersAPI.getAll(),
        usersAPI.getAll(),
        productsAPI.getLowStock()
      ]);

      const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

      const todayOrders = orders.filter(
        o => new Date(o.order_date).toDateString() === new Date().toDateString()
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

      setRecentOrders(orders.slice(0, 8));
      setLowStockProducts(lowStock.slice(0, 6));

      // נתוני מכירות חודשי לדוגמה
      setSalesData([
        { month: 'ינואר', sales: 12000 },
        { month: 'פברואר', sales: 15000 },
        { month: 'מרץ', sales: 18000 },
        { month: 'אפריל', sales: 22000 },
        { month: 'מאי', sales: 25000 },
        { month: 'יוני', sales: 28000 }
      ]);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* כותרת */}
      <h1 id="topReport" className="text-3xl font-bold mb-6">דוחות מערכת</h1>

      {/* כרטיסי KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <ReportCard title="סך ההכנסות" value={`₪${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-6 w-6" />} color="bg-green-500" />
        <ReportCard title="סך ההזמנות" value={stats.totalOrders} icon={<ShoppingCart className="h-6 w-6" />} color="bg-blue-500" />
        <ReportCard title="לקוחות פעילים" value={stats.totalUsers} icon={<Users className="h-6 w-6" />} color="bg-purple-500" />
        <ReportCard title="מוצרים במלאי נמוך" value={stats.lowStockProducts} icon={<AlertTriangle className="h-6 w-6" />} color="bg-red-500" />
      </div>

      {/* גרף מכירות */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          מכירות חודשיות
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* הזמנות אחרונות */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">הזמנות אחרונות</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">אין הזמנות אחרונות</p>
        ) : (
          <table className="w-full table-auto border-collapse text-center">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border">#ID</th>
                <th className="p-2 border">תאריך</th>
                <th className="p-2 border">שם לקוח</th>
                <th className="p-2 border">סה"כ</th>
                <th className="p-2 border">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{order.id}</td>
                  <td className="p-2 border">{new Date(order.order_date).toLocaleDateString('he-IL')}</td>
                  <td className="p-2 border">{order.full_name}</td>
                  <td className="p-2 border">₪{parseFloat(order.total_amount).toLocaleString()}</td>
                  <td className="p-2 border">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// רכיב כרטיס KPI
const ReportCard = ({ title, value, icon, color }) => (
  <div className={`${color} text-white rounded-xl p-6 shadow-lg flex items-center justify-between`}>
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className="p-3 bg-white bg-opacity-20 rounded-lg">{icon}</div>
  </div>
);

// פונקציות עזר לסטטוס הזמנה
const getStatusText = (status) => {
  const map = { pending: 'ממתינה', confirmed: 'אושרה', delivered: 'נמסרה', cancelled: 'בוטלה' };
  return map[status] || status;
};

const getStatusStyle = (status) => {
  const map = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export default Reports;
