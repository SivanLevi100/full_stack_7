// // src/pages/AdminDashboard.jsx - דף בקרה למנהל
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { Link } from 'react-router-dom';
// import { 
//   ShoppingCart, 
//   Package, 
//   Users, 
//   TrendingUp, 
//   AlertTriangle,
//   DollarSign,
//   Clock,
//   BarChart3,
//   Plus,
//   Eye,
//   ArrowUpRight,
//   Activity,
//   Settings,
//   Download,
//   Filter,
//   Calendar,
//   Zap
// } from 'lucide-react';
// import { ordersAPI, productsAPI, usersAPI } from '../../services/api';

// const AdminDashboard = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     totalProducts: 0,
//     totalOrders: 0,
//     totalUsers: 0,
//     lowStockProducts: 0,
//     totalRevenue: 0,
//     pendingOrders: 0,
//     todayOrders: 0,
//     monthlyGrowth: 0,
//     avgOrderValue: 0
//   });
//   const [recentOrders, setRecentOrders] = useState([]);
//   const [lowStockProducts, setLowStockProducts] = useState([]);
//   const [recentUsers, setRecentUsers] = useState([]);
//   const [salesData, setSalesData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedPeriod, setSelectedPeriod] = useState('today');

//   useEffect(() => {
//     loadAdminData();
//   }, [selectedPeriod]);

//   const loadAdminData = async () => {
//     try {
//       setLoading(true);
      
//       const [products, orders, users, lowStock] = await Promise.all([
//         productsAPI.getAll(),
//         ordersAPI.getAll(),
//         usersAPI.getAll(),
//         productsAPI.getLowStock()
//       ]);

//       // חישוב סטטיסטיקות מתקדמות
//       const totalRevenue = orders
//         .filter(order => order.status !== 'cancelled')
//         .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

//       const todayOrders = orders.filter(order => 
//         new Date(order.order_date).toDateString() === new Date().toDateString()
//       ).length;

//       const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
//       const avgOrderValue = orders.length > 0 
//         ? totalRevenue / orders.filter(order => order.status !== 'cancelled').length 
//         : 0;

//       // צמיחה חודשית (דוגמה - לחישוב אמיתי צריך נתונים היסטוריים)
//       const monthlyGrowth = 12.5; // אחוז צמיחה לדוגמה

//       setStats({
//         totalProducts: products.length,
//         totalOrders: orders.length,
//         totalUsers: users.length,
//         lowStockProducts: lowStock.length,
//         totalRevenue,
//         pendingOrders,
//         todayOrders,
//         monthlyGrowth,
//         avgOrderValue
//       });

//       setRecentOrders(orders.slice(0, 8));
//       setLowStockProducts(lowStock.slice(0, 6));
//       setRecentUsers(users.slice(-5).reverse());

//       // נתוני מכירות לגרף (דוגמה)
//       setSalesData([
//         { name: 'ינואר', sales: 12000, orders: 45 },
//         { name: 'פברואר', sales: 15000, orders: 52 },
//         { name: 'מרץ', sales: 18000, orders: 61 },
//         { name: 'אפריל', sales: 22000, orders: 73 },
//         { name: 'מאי', sales: 25000, orders: 82 },
//         { name: 'יוני', sales: 28000, orders: 95 }
//       ]);

//     } catch (error) {
//       console.error('Error loading admin data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* כותרת מנהל */}
//       <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-xl p-8 relative overflow-hidden">
//         <div className="absolute inset-0 bg-black opacity-10"></div>
//         <div className="relative z-10">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-4xl font-bold mb-3">
//                 ברוך הבא, {user?.full_name}! 👋
//               </h1>
//               <p className="text-blue-100 text-lg mb-4">
//                 פאנל ניהול מתקדם - כל הנתונים החשובים במקום אחד
//               </p>
//               <div className="flex items-center gap-4 text-sm">
//                 <span className="flex items-center gap-1">
//                   <Activity className="h-4 w-4" />
//                   מערכת פעילה
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <Clock className="h-4 w-4" />
//                   עדכון אחרון: {new Date().toLocaleTimeString('he-IL')}
//                 </span>
//               </div>
//             </div>
//             <div className="hidden md:block">
//               <div className="text-6xl opacity-20">👨‍💼</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* כרטיסי סטטיסטיקה ראשיים */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <AdminStatCard
//           title="סך ההכנסות"
//           value={`₪${stats.totalRevenue.toLocaleString()}`}
//           icon={<DollarSign className="h-8 w-8" />}
//           color="from-green-500 to-emerald-600"
//           change="+12.5%"
//           changeType="positive"
//           link="/reports"
//         />
//         <AdminStatCard
//           title="הזמנות היום"
//           value={stats.todayOrders}
//           icon={<ShoppingCart className="h-8 w-8" />}
//           color="from-blue-500 to-cyan-600"
//           change="+8.2%"
//           changeType="positive"
//           urgent={stats.pendingOrders > 5}
//         />
//         <AdminStatCard
//           title="מוצרים במלאי נמוך (מתחת ל 10)"
//           value={stats.lowStockProducts}
//           icon={<AlertTriangle className="h-8 w-8" />}
//           color="from-orange-500 to-red-500"
//           urgent={stats.lowStockProducts > 0}
//           link="/products"
//         />
//         <AdminStatCard
//           title="לקוחות פעילים"
//           value={stats.totalUsers}
//           icon={<Users className="h-8 w-8" />}
//           color="from-purple-500 to-pink-600"
//           change="+15.3%"
//           changeType="positive"
//           link="/users"
//         />
//       </div>

//       {/* כרטיסי סטטיסטיקה משניים */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-xl p-6 shadow-sm border">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-gray-900">ממוצע הזמנה</h3>
//             <TrendingUp className="h-5 w-5 text-green-500" />
//           </div>
//           <div className="text-3xl font-bold text-green-600 mb-2">
//             ₪{stats.avgOrderValue.toFixed(0)}
//           </div>
//           <p className="text-sm text-gray-600">ממוצע לכל הזמנה</p>
//         </div>

//         <div className="bg-white rounded-xl p-6 shadow-sm border">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-gray-900">הזמנות ממתינות</h3>
//             <Clock className="h-5 w-5 text-orange-500" />
//           </div>
//           <div className="text-3xl font-bold text-orange-600 mb-2">
//             {stats.pendingOrders}
//           </div>
//           <p className="text-sm text-gray-600">דורשות טיפול</p>
//         </div>

//         <div className="bg-white rounded-xl p-6 shadow-sm border">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-gray-900">צמיחה חודשית</h3>
//             <BarChart3 className="h-5 w-5 text-blue-500" />
//           </div>
//           <div className="text-3xl font-bold text-blue-600 mb-2">
//             +{stats.monthlyGrowth}%
//           </div>
//           <p className="text-sm text-gray-600">לעומת חודש קודם</p>
//         </div>
//       </div>

//       {/* תוכן ראשי - שתי עמודות */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* הזמנות אחרונות */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-xl font-semibold">הזמנות אחרונות</h3>
//             <div className="flex gap-2">
//               <Link 
//                 to="/orders"
//                 className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
//               >
//                 צפה בהכל
//                 <ArrowUpRight className="h-4 w-4" />
//               </Link>
//             </div>
//           </div>
//           <div className="space-y-4 max-h-96 overflow-y-auto">
//             {recentOrders.length > 0 ? (
//               recentOrders.map(order => (
//                 <AdminOrderItem key={order.id} order={order} />
//               ))
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
//                 <p>אין הזמנות אחרונות</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* מוצרים במלאי נמוך */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-xl font-semibold flex items-center gap-2">
//               <AlertTriangle className="h-5 w-5 text-red-500" />
//               מלאי נמוך
//             </h3>
//             <Link 
//               to="/products"
//               className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
//             >
//               נהל מלאי
//               <ArrowUpRight className="h-4 w-4" />
//             </Link>
//           </div>
//           <div className="space-y-4 max-h-96 overflow-y-auto">
//             {lowStockProducts.length > 0 ? (
//               lowStockProducts.map(product => (
//                 <AdminLowStockItem key={product.id} product={product} />
//               ))
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
//                 <p>כל המוצרים במלאי תקין</p>
//                 <p className="text-sm">מצוין! 🎉</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* פעולות מהירות מתקדמות */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <AdminQuickAction
//           title="הוסף מוצר חדש"
//           description="הוסף מוצרים חדשים למערכת"
//           icon={<Plus className="h-6 w-6" />}
//           //link="/products/new"
//           link="/products"
//           color="bg-green-500"
//         />
//         <AdminQuickAction
//           title="צפה בדוחות"
//           description="דוחות מכירות ומלאי מתקדמים"
//           icon={<BarChart3 className="h-6 w-6" />}
//           link="/reports"
//           color="bg-blue-500"
          
//         />

//         <AdminQuickAction
//           title="נהל משתמשים"
//           description="הוסף ועדכן פרטי לקוחות"
//           icon={<Users className="h-6 w-6" />}
//           link="/users"
//           color="bg-purple-500"
//         />
//         <AdminQuickAction
//           title="הגדרות מערכת"
//           description="הגדרות כלליות ותצורה"
//           icon={<Settings className="h-6 w-6" />}
//           link="/settings"
//           color="bg-gray-500"
//         />
//       </div>

//       {/* לקוחות חדשים */}
//       <div className="bg-white rounded-xl p-6 shadow-sm border">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-semibold">לקוחות חדשים</h3>
//           <Link 
//             to="/users"
//             className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
//           >
//             צפה בהכל
//             <ArrowUpRight className="h-4 w-4" />
//           </Link>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {recentUsers.length > 0 ? (
//             recentUsers.map(user => (
//               <AdminUserCard key={user.id} user={user} />
//             ))
//           ) : (
//             <div className="col-span-full text-center py-8 text-gray-500">
//               <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
//               <p>אין לקוחות חדשים</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // רכיב כרטיס סטטיסטיקה מתקדם למנהל
// const AdminStatCard = ({ title, value, icon, color, change, changeType, link, urgent }) => (
//   <div  className={`bg-gradient-to-r ${color} text-white rounded-xl p-6 shadow-lg relative overflow-hidden ${urgent ? 'ring-2 ring-red-300 animate-pulse' : ''}`}>
//     <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
//     <div className="relative z-10">
//       <div className="flex items-center justify-between mb-4">
//         <div className="p-3 bg-white bg-opacity-20 rounded-lg">
//           {icon}
//         </div>
//         {change && (
//           <div className={`text-xs font-medium px-2 py-1 rounded-full ${
//             changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//           }`}>
//             {change}
//           </div>
//         )}
//       </div>
//       <div>
//         <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
//         <p className="text-3xl font-bold mb-2">{value}</p>
//         {link && (
//           <Link 
//             to={link}
//             className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium"
//           >
//             צפה בפירוט
//             <ArrowUpRight className="h-3 w-3" />
//           </Link>
//         )}
//       </div>
//     </div>
//   </div>
// );

// // רכיב פריט הזמנה למנהל
// const AdminOrderItem = ({ order }) => (
//   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//     <div className="flex items-center gap-3">
//       <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//         <ShoppingCart className="h-5 w-5 text-blue-600" />
//       </div>
//       <div>
//         <p className="font-medium">#{order.order_number}</p>
//         <p className="text-sm text-gray-600">{order.full_name}</p>
//         <p className="text-xs text-gray-500">
//           {new Date(order.order_date).toLocaleDateString('he-IL')}
//         </p>
//       </div>
//     </div>
//     <div className="text-left">
//       <p className="font-medium">₪{parseFloat(order.total_amount).toLocaleString()}</p>
//       <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
//         {getStatusText(order.status)}
//       </span>
//     </div>
//   </div>
// );

// // רכיב פריט מלאי נמוך
// const AdminLowStockItem = ({ product }) => (
//   <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
//     <div className="flex items-center gap-3">
//       <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
//         <Package className="h-5 w-5 text-red-600" />
//       </div>
//       <div>
//         <p className="font-medium">{product.name}</p>
//         <p className="text-sm text-gray-600">{product.category_name}</p>
//       </div>
//     </div>
//     <div className="text-left">
//       <span className="inline-block px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
//         {product.stock_quantity} יחידות
//       </span>
//       <p className="text-xs text-gray-500 mt-1">דרוש חידוש</p>
//     </div>
//   </div>
// );

// // רכיב פעולה מהירה למנהל
// const AdminQuickAction = ({ title, description, icon, link, color }) => (
//   <Link
//     to={link}
//     className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all group"
//   >
//     <div className="flex items-center gap-3">
//       <div className={`${color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}>
//         {icon}
//       </div>
//       <div>
//         <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
//           {title}
//         </h4>
//         <p className="text-sm text-gray-600">{description}</p>
//       </div>
//     </div>
//   </Link>
// );

// // רכיב כרטיס לקוח
// const AdminUserCard = ({ user }) => (
//   <div className="p-4 bg-gray-50 rounded-lg border">
//     <div className="flex items-center gap-3 mb-3">
//       <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
//         {user.full_name ? user.full_name.charAt(0) : 'U'}
//       </div>
//       <div>
//         <p className="font-medium text-gray-900">{user.full_name}</p>
//         <p className="text-sm text-gray-600">{user.email}</p>
//       </div>
//     </div>
//     <div className="flex items-center justify-between text-sm">
//       <span className="text-gray-500">נרשם:</span>
//       <span className="text-gray-700">
//         {new Date(user.created_at).toLocaleDateString('he-IL')}
//       </span>
//     </div>
//   </div>
// );

// // פונקציות עזר
// const getStatusText = (status) => {
//   const statusMap = {
//     pending: 'ממתינה',
//     confirmed: 'אושרה',
//     delivered: 'נמסרה',
//     cancelled: 'בוטלה'
//   };
//   return statusMap[status] || status;
// };

// const getStatusStyle = (status) => {
//   const styleMap = {
//     pending: 'bg-yellow-100 text-yellow-800',
//     confirmed: 'bg-blue-100 text-blue-800',
//     delivered: 'bg-green-100 text-green-800',
//     cancelled: 'bg-red-100 text-red-800'
//   };
//   return styleMap[status] || 'bg-gray-100 text-gray-800';
// };

// export default AdminDashboard;



// src/pages/AdminDashboard.jsx - דף בקרה למנהל עם עיצוב מותאם
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Clock,
  BarChart3,
  Plus,
  Eye,
  ArrowUpRight,
  Activity,
  Settings,
  Download,
  Filter,
  Calendar,
  Zap
} from 'lucide-react';
import { ordersAPI, productsAPI, usersAPI } from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    todayOrders: 0,
    monthlyGrowth: 0,
    avgOrderValue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    loadAdminData();
  }, [selectedPeriod]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      const [products, orders, users, lowStock] = await Promise.all([
        productsAPI.getAll(),
        ordersAPI.getAll(),
        usersAPI.getAll(),
        productsAPI.getLowStock()
      ]);

      // חישוב סטטיסטיקות מתקדמות
      const totalRevenue = orders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

      const todayOrders = orders.filter(order => 
        new Date(order.order_date).toDateString() === new Date().toDateString()
      ).length;

      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
      const avgOrderValue = orders.length > 0 
        ? totalRevenue / orders.filter(order => order.status !== 'cancelled').length 
        : 0;

      // צמיחה חודשית (דוגמה - לחישוב אמיתי צריך נתונים היסטוריים)
      const monthlyGrowth = 12.5; // אחוז צמיחה לדוגמה

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        lowStockProducts: lowStock.length,
        totalRevenue,
        pendingOrders,
        todayOrders,
        monthlyGrowth,
        avgOrderValue
      });

      setRecentOrders(orders.slice(0, 8));
      setLowStockProducts(lowStock.slice(0, 6));
      setRecentUsers(users.slice(-5).reverse());

      // נתוני מכירות לגרף (דוגמה)
      setSalesData([
        { name: 'ינואר', sales: 12000, orders: 45 },
        { name: 'פברואר', sales: 15000, orders: 52 },
        { name: 'מרץ', sales: 18000, orders: 61 },
        { name: 'אפריל', sales: 22000, orders: 73 },
        { name: 'מאי', sales: 25000, orders: 82 },
        { name: 'יוני', sales: 28000, orders: 95 }
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-loading-content">
          <div className="admin-dashboard-loading-spinner"></div>
          <p className="admin-dashboard-loading-text">טוען נתוני דשבורד...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard">
        {/* כותרת מנהל */}
        <div className="admin-dashboard-hero">
          <div className="admin-dashboard-hero-content">
            <h1 className="admin-dashboard-hero-title">
              שלום, {user?.full_name}! 
            </h1>
            <p className="admin-dashboard-hero-subtitle">
              פאנל ניהול מתקדם - כל הנתונים החשובים במקום אחד
            </p>
            <div className="admin-dashboard-hero-stats">
              <span className="admin-dashboard-hero-stat">
                <Activity className="admin-dashboard-hero-stat-icon" />
                מערכת פעילה
              </span>
              {/* <span className="admin-dashboard-hero-stat">
                <Clock className="admin-dashboard-hero-stat-icon" />
                עדכון אחרון: {new Date().toLocaleTimeString('he-IL')}
              </span> */}
            </div>
          </div>
        </div>

        {/* כרטיסי סטטיסטיקה ראשיים */}
        <div className="admin-dashboard-stats">
          <div className="admin-dashboard-stats-grid">
            <AdminStatCard
              title="סך ההכנסות"
              value={`₪${stats.totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="h-8 w-8" />}
              color="admin-stat-card-icon--green"
              change="+12.5%"
              changeType="positive"
              link="/reports"
            />
            <AdminStatCard
              title="הזמנות היום"
              value={stats.todayOrders}
              icon={<ShoppingCart className="h-8 w-8" />}
              color="admin-stat-card-icon--blue"
              change="+8.2%"
              changeType="positive"
            />
            <AdminStatCard
              title="מוצרים במלאי נמוך"
              value={stats.lowStockProducts}
              icon={<AlertTriangle className="h-8 w-8" />}
              color="admin-stat-card-icon--orange"
              link="/products"
            />
            <AdminStatCard
              title="לקוחות פעילים"
              value={stats.totalUsers}
              icon={<Users className="h-8 w-8" />}
              color="admin-stat-card-icon--purple"
              change="+15.3%"
              changeType="positive"
              link="/users"
            />
          </div>
        </div>

        {/* כרטיסי סטטיסטיקה משניים */}
        <div className="admin-dashboard-content">
          <div className="admin-dashboard-secondary-stats">
            <div className="admin-secondary-stat-card">
              <div className="admin-secondary-stat-header">
                <h3 className="admin-secondary-stat-title">ממוצע הזמנה</h3>
                <TrendingUp className="admin-secondary-stat-icon admin-secondary-stat-icon--green" />
              </div>
              <div className="admin-secondary-stat-value admin-secondary-stat-value--green">
                ₪{stats.avgOrderValue.toFixed(0)}
              </div>
              <p className="admin-secondary-stat-description">ממוצע לכל הזמנה</p>
            </div>

            <div className="admin-secondary-stat-card">
              <div className="admin-secondary-stat-header">
                <h3 className="admin-secondary-stat-title">הזמנות ממתינות</h3>
                <Clock className="admin-secondary-stat-icon admin-secondary-stat-icon--orange" />
              </div>
              <div className="admin-secondary-stat-value admin-secondary-stat-value--orange">
                {stats.pendingOrders}
              </div>
              <p className="admin-secondary-stat-description">דורשות טיפול</p>
            </div>

            <div className="admin-secondary-stat-card">
              <div className="admin-secondary-stat-header">
                <h3 className="admin-secondary-stat-title">צמיחה חודשית</h3>
                <BarChart3 className="admin-secondary-stat-icon admin-secondary-stat-icon--blue" />
              </div>
              <div className="admin-secondary-stat-value admin-secondary-stat-value--blue">
                +{stats.monthlyGrowth}%
              </div>
              <p className="admin-secondary-stat-description">לעומת חודש קודם</p>
            </div>
          </div>

          {/* תוכן ראשי - שתי עמודות */}
          <div className="admin-dashboard-main-grid">
            {/* הזמנות אחרונות */}
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <div className="admin-dashboard-section-header-content">
                  <div className="admin-dashboard-section-header-info">
                    <div className="admin-dashboard-section-icon">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="admin-dashboard-section-title">הזמנות אחרונות</h3>
                      <p className="admin-dashboard-section-subtitle">מעקב אחר הזמנות חדשות</p>
                    </div>
                  </div>
                  <Link to="/orders" className="admin-dashboard-section-link">
                    צפה בהכל
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="admin-dashboard-section-body">
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <AdminOrderItem key={order.id} order={order} />
                  ))
                ) : (
                  <div className="admin-dashboard-empty">
                    <ShoppingCart className="admin-dashboard-empty-icon" />
                    <h4 className="admin-dashboard-empty-title">אין הזמנות אחרונות</h4>
                  </div>
                )}
              </div>
            </div>

            {/* מוצרים במלאי נמוך */}
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <div className="admin-dashboard-section-header-content">
                  <div className="admin-dashboard-section-header-info">
                    <div className="admin-dashboard-section-icon">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="admin-dashboard-section-title">מלאי נמוך</h3>
                      <p className="admin-dashboard-section-subtitle">מוצרים הדורשים התראות</p>
                    </div>
                  </div>
                  <Link to="/products" className="admin-dashboard-section-link">
                    נהל מלאי
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="admin-dashboard-section-body">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map(product => (
                    <AdminLowStockItem key={product.id} product={product} />
                  ))
                ) : (
                  <div className="admin-dashboard-empty">
                    <Package className="admin-dashboard-empty-icon" />
                    <h4 className="admin-dashboard-empty-title">כל המוצרים במלאי תקין</h4>
                    <p className="admin-dashboard-empty-subtitle">מצוין! 🎉</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* פעולות מהירות מתקדמות */}
          <div className="admin-dashboard-quick-actions">
            <div className="admin-dashboard-quick-actions-grid">
              <AdminQuickAction
                title="הוסף מוצר חדש"
                description="הוסף מוצרים חדשים למערכת"
                icon={<Plus className="h-6 w-6" />}
                link="/products"
                color="admin-quick-action-icon--green"
              />
              <AdminQuickAction
                title="צפה בדוחות"
                description="דוחות מכירות ומלאי מתקדמים"
                icon={<BarChart3 className="h-6 w-6" />}
                link="/reports"
                color="admin-quick-action-icon--blue"
              />
              <AdminQuickAction
                title="נהל משתמשים"
                description="הוסף ועדכן פרטי לקוחות"
                icon={<Users className="h-6 w-6" />}
                link="/users"
                color="admin-quick-action-icon--purple"
              />
             
            </div>
          </div>

          {/* לקוחות חדשים */}
          <div className="admin-dashboard-section">
            <div className="admin-dashboard-section-header">
              <div className="admin-dashboard-section-header-content">
                <div className="admin-dashboard-section-header-info">
                  <div className="admin-dashboard-section-icon">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="admin-dashboard-section-title">לקוחות חדשים</h3>
                    <p className="admin-dashboard-section-subtitle">רשימת לקוחות שנרשמו לאחרונה</p>
                  </div>
                </div>
                <Link to="/users" className="admin-dashboard-section-link">
                  צפה בהכל
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="admin-dashboard-section-body">
              <div className="admin-dashboard-secondary-stats">
                {recentUsers.length > 0 ? (
                  recentUsers.map(user => (
                    <AdminUserCard key={user.id} user={user} />
                  ))
                ) : (
                  <div className="admin-dashboard-empty">
                    <Users className="admin-dashboard-empty-icon" />
                    <h4 className="admin-dashboard-empty-title">אין לקוחות חדשים</h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// רכיב כרטיס סטטיסטיקה מתקדם למנהל
const AdminStatCard = ({ title, value, icon, color, change, changeType, link, urgent }) => (
  <div className={`admin-stat-card ${urgent ? 'admin-stat-card--urgent' : ''}`}>
    {urgent && <div className="admin-stat-card-badge">!</div>}
    <div className="admin-stat-card-bg" style={{background: 'currentColor'}}></div>
    <div className="admin-stat-card-content">
      <div className="admin-stat-card-header">
        <div className={`admin-stat-card-icon ${color}`}>
          {icon}
        </div>
        {change && (
          <div className={`admin-stat-card-change admin-stat-card-change--${changeType}`}>
            {change}
          </div>
        )}
      </div>
      <div className="admin-stat-card-body">
        <p className="admin-stat-card-title">{title}</p>
        <p className="admin-stat-card-value">{value}</p>
      </div>
      {link && (
        <Link to={link} className="admin-stat-card-link">
          צפה בפירוט
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  </div>
);

// רכיב פריט הזמנה למנהל
const AdminOrderItem = ({ order }) => (
  <div className="admin-order-item">
    <div className="admin-order-item-left">
      <div className="admin-order-item-icon">
        <ShoppingCart className="h-5 w-5" />
      </div>
      <div className="admin-order-item-info">
        <h4>#{order.order_number}</h4>
        <p>{order.full_name}</p>
        <p>{new Date(order.order_date).toLocaleDateString('he-IL')}</p>
      </div>
    </div>
    <div className="admin-order-item-right">
      <div className="admin-order-item-details">
        <p className="admin-order-item-amount">₪{parseFloat(order.total_amount).toLocaleString()}</p>
        <span className={`admin-order-item-status admin-order-item-status--${order.status}`}>
          {getStatusText(order.status)}
        </span>
      </div>
    </div>
  </div>
);

// רכיב פריט מלאי נמוך
const AdminLowStockItem = ({ product }) => (
  <div className="admin-low-stock-item">
    <div className="admin-low-stock-item-left">
      <div className="admin-low-stock-item-icon">
        <Package className="h-5 w-5" />
      </div>
      <div className="admin-low-stock-item-info">
        <h4>{product.name}</h4>
        <p>{product.category_name}</p>
      </div>
    </div>
    <div className="admin-low-stock-item-right">
      <span className="admin-low-stock-item-stock">
        {product.stock_quantity} יחידות
      </span>
      <p className="admin-low-stock-item-action">דרוש חידוש</p>
    </div>
  </div>
);

// רכיב פעולה מהירה למנהל
const AdminQuickAction = ({ title, description, icon, link, color }) => (
  <Link to={link} className="admin-quick-action">
    <div className="admin-quick-action-content">
      <div className={`admin-quick-action-icon ${color}`}>
        {icon}
      </div>
      <div className="admin-quick-action-text">
        <h4 className="admin-quick-action-title">{title}</h4>
        <p className="admin-quick-action-description">{description}</p>
      </div>
    </div>
  </Link>
);

// רכיב כרטיס לקוח
const AdminUserCard = ({ user }) => (
  <div className="admin-user-card">
    <div className="admin-user-card-header">
      <div className="admin-user-card-avatar">
        {user.full_name ? user.full_name.charAt(0) : 'U'}
      </div>
      <div className="admin-user-card-info">
        <h4>{user.full_name}</h4>
        <p>{user.email}</p>
      </div>
    </div>
    <div className="admin-user-card-footer">
      <span className="admin-user-card-date-label">נרשם:</span>
      <span className="admin-user-card-date-value">
        {new Date(user.created_at).toLocaleDateString('he-IL')}
      </span>
    </div>
  </div>
);

// פונקציות עזר
const getStatusText = (status) => {
  const statusMap = {
    pending: 'ממתינה',
    confirmed: 'אושרה',
    delivered: 'נמסרה',
    cancelled: 'בוטלה'
  };
  return statusMap[status] || status;
};

export default AdminDashboard;