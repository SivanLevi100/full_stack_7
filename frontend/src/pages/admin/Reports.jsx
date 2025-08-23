// // src/pages/Reports.jsx
// import React, { useEffect, useState } from 'react';
// import { ordersAPI, productsAPI, usersAPI } from '../../services/api';
// import { DollarSign, ShoppingCart, Users, AlertTriangle, BarChart3 } from 'lucide-react';
// import { Line } from 'recharts';
// import { LineChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

// const Reports = () => {
//   const [stats, setStats] = useState({
//     totalRevenue: 0,
//     totalOrders: 0,
//     totalUsers: 0,
//     lowStockProducts: 0,
//     pendingOrders: 0,
//     todayOrders: 0
//   });
//   const [recentOrders, setRecentOrders] = useState([]);
//   const [lowStockProducts, setLowStockProducts] = useState([]);
//   const [salesData, setSalesData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadReportsData();
//   }, []);

//   const loadReportsData = async () => {
//     try {
//       setLoading(true);
//       const [products, orders, users, lowStock] = await Promise.all([
//         productsAPI.getAll(),
//         ordersAPI.getAll(),
//         usersAPI.getAll(),
//         productsAPI.getLowStock()
//       ]);

//       const totalRevenue = orders
//         .filter(o => o.status !== 'cancelled')
//         .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

//       const todayOrders = orders.filter(
//         o => new Date(o.order_date).toDateString() === new Date().toDateString()
//       ).length;

//       const pendingOrders = orders.filter(o => o.status === 'pending').length;

//       setStats({
//         totalRevenue,
//         totalOrders: orders.length,
//         totalUsers: users.length,
//         lowStockProducts: lowStock.length,
//         pendingOrders,
//         todayOrders
//       });

//       setRecentOrders(orders.slice(0, 8));
//       setLowStockProducts(lowStock.slice(0, 6));

//       // נתוני מכירות חודשי לדוגמה
//       setSalesData([
//         { month: 'ינואר', sales: 12000 },
//         { month: 'פברואר', sales: 15000 },
//         { month: 'מרץ', sales: 18000 },
//         { month: 'אפריל', sales: 22000 },
//         { month: 'מאי', sales: 25000 },
//         { month: 'יוני', sales: 28000 }
//       ]);
//     } catch (error) {
//       console.error('Error loading reports data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-6">
//       {/* כותרת */}
//       <h1 id="topReport" className="text-3xl font-bold mb-6">דוחות מערכת</h1>

//       {/* כרטיסי KPI */}
//       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         <ReportCard title="סך ההכנסות" value={`₪${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-6 w-6" />} color="bg-green-500" />
//         <ReportCard title="סך ההזמנות" value={stats.totalOrders} icon={<ShoppingCart className="h-6 w-6" />} color="bg-blue-500" />
//         <ReportCard title="לקוחות פעילים" value={stats.totalUsers} icon={<Users className="h-6 w-6" />} color="bg-purple-500" />
//         <ReportCard title="מוצרים במלאי נמוך" value={stats.lowStockProducts} icon={<AlertTriangle className="h-6 w-6" />} color="bg-red-500" />
//       </div>

//       {/* גרף מכירות */}
//       <div className="bg-white rounded-xl p-6 shadow-sm border">
//         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//           <BarChart3 className="h-5 w-5 text-blue-500" />
//           מכירות חודשיות
//         </h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={salesData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" />
//             <YAxis />
//             <Tooltip />
//             <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* הזמנות אחרונות */}
//       <div className="bg-white rounded-xl p-6 shadow-sm border">
//         <h2 className="text-xl font-semibold mb-4">הזמנות אחרונות</h2>
//         {recentOrders.length === 0 ? (
//           <p className="text-gray-500">אין הזמנות אחרונות</p>
//         ) : (
//           <table className="w-full table-auto border-collapse text-center">
//             <thead>
//               <tr className="bg-gray-100 text-gray-700">
//                 <th className="p-2 border">#ID</th>
//                 <th className="p-2 border">תאריך</th>
//                 <th className="p-2 border">שם לקוח</th>
//                 <th className="p-2 border">סה"כ</th>
//                 <th className="p-2 border">סטטוס</th>
//               </tr>
//             </thead>
//             <tbody>
//               {recentOrders.map(order => (
//                 <tr key={order.id} className="hover:bg-gray-50">
//                   <td className="p-2 border">{order.id}</td>
//                   <td className="p-2 border">{new Date(order.order_date).toLocaleDateString('he-IL')}</td>
//                   <td className="p-2 border">{order.full_name}</td>
//                   <td className="p-2 border">₪{parseFloat(order.total_amount).toLocaleString()}</td>
//                   <td className="p-2 border">
//                     <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
//                       {getStatusText(order.status)}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// // רכיב כרטיס KPI
// const ReportCard = ({ title, value, icon, color }) => (
//   <div className={`${color} text-white rounded-xl p-6 shadow-lg flex items-center justify-between`}>
//     <div>
//       <p className="text-sm font-medium">{title}</p>
//       <p className="text-2xl font-bold">{value}</p>
//     </div>
//     <div className="p-3 bg-white bg-opacity-20 rounded-lg">{icon}</div>
//   </div>
// );

// // פונקציות עזר לסטטוס הזמנה
// const getStatusText = (status) => {
//   const map = { pending: 'ממתינה', confirmed: 'אושרה', delivered: 'נמסרה', cancelled: 'בוטלה' };
//   return map[status] || status;
// };

// const getStatusStyle = (status) => {
//   const map = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
//   return map[status] || 'bg-gray-100 text-gray-800';
// };

// export default Reports;
// src/pages/Reports.jsx - מעודכן עם לוגיקה אמיתית וCSS חדש
import React, { useEffect, useState } from 'react';
import { ordersAPI, productsAPI, usersAPI } from '../../services/api';
import { DollarSign, ShoppingCart, Users, AlertTriangle, BarChart3, Package } from 'lucide-react';
import { LineChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Line } from 'recharts';

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

  // פונקציה ליצירת נתוני מכירות אמיתיים לפי חודשים
  const generateRealSalesData = (orders) => {
    const monthNames = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    // יצירת מפה של חודשים עם מכירות
    const monthlyData = {};
    
    // אתחול כל החודשים עם 0
    monthNames.forEach((month, index) => {
      monthlyData[index] = {
        month: month,
        sales: 0,
        orders: 0
      };
    });

    // חישוב מכירות אמיתיות לפי חודש
    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        const orderDate = new Date(order.order_date);
        const month = orderDate.getMonth();
        const year = orderDate.getFullYear();
        const currentYear = new Date().getFullYear();
        
        // רק הזמנות מהשנה הנוכחית
        if (year === currentYear) {
          monthlyData[month].sales += parseFloat(order.total_amount || 0);
          monthlyData[month].orders += 1;
        }
      }
    });

    // המרה למערך ולקיחת 6 החודשים האחרונים
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

      // מיון הזמנות לפי תאריך (החדשות ביותר קודם)
      const sortedOrders = orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      setRecentOrders(sortedOrders.slice(0, 8));
      setLowStockProducts(lowStock.slice(0, 6));

      // יצירת נתוני מכירות אמיתיים
      const realSalesData = generateRealSalesData(orders);
      setSalesData(realSalesData);

    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  // פונקציות עזר לסטטוס הזמנה
  const getStatusText = (status) => {
    const map = { 
      pending: 'ממתין', 
      confirmed: 'אושר', 
      delivered: 'נמסר', 
      cancelled: 'בוטל' 
    };
    return map[status] || status;
  };

  const getStatusClass = (status) => {
    const map = { 
      pending: 'reports-status-pending', 
      confirmed: 'reports-status-confirmed', 
      delivered: 'reports-status-delivered', 
      cancelled: 'reports-status-cancelled' 
    };
    return map[status] || 'reports-status-pending';
  };

  // רכיב כרטיס KPI
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
        {/* כותרת עמוד */}
        <div className="reports-header">
          <h1 className="reports-title">דוחות מערכת</h1>
        </div>

        {/* כרטיסי KPI */}
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

        {/* גרף מכירות */}
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

        {/* הזמנות אחרונות */}
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

        {/* מוצרים במלאי נמוך */}
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