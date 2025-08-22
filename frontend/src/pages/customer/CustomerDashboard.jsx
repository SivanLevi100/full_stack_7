// // src/pages/CustomerDashboard.jsx - דף בקרה לקונה
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { Link } from 'react-router-dom';
// import { 
//   ShoppingCart, 
//   Package, 
//   Clock, 
//   Star,
//   ArrowUpRight,
//   Heart,
//   Gift,
//   Truck,
//   CreditCard,
//   User,
//   MapPin,
//   Tag,
//   TrendingUp,
//   Calendar,
//   CheckCircle,
//   AlertCircle
// } from 'lucide-react';
// import { ordersAPI, productsAPI, cartAPI } from '../../services/api';

// const CustomerDashboard = () => {
//   const { user } = useAuth();
//   const [customerStats, setCustomerStats] = useState({
//     totalOrders: 0,
//     pendingOrders: 0,
//     totalSpent: 0,
//     favoriteCategory: '',
//     cartItems: 0,
//     loyaltyPoints: 0
//   });
//   const [recentOrders, setRecentOrders] = useState([]);
//   const [recommendedProducts, setRecommendedProducts] = useState([]);
//   const [favoriteProducts, setFavoriteProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadCustomerData();
//   }, []);

//   const loadCustomerData = async () => {
//     try {
//       setLoading(true);

//       const [orders, products, cartData] = await Promise.all([
//         ordersAPI.getMyOrders(),
//         productsAPI.getAll(),
//         cartAPI.getItems().catch(() => ({ items: [], total: 0 }))
//       ]);

//       // חישוב סטטיסטיקות לקוח
//       const totalSpent = orders
//         .filter(order => order.status === 'delivered')
//         .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

//       const pendingOrders = orders.filter(order => 
//         order.status === 'pending' || order.status === 'confirmed'
//       ).length;

//       // נקודות נאמנות (1 נקודה לכל 10 שקלים)
//       const loyaltyPoints = Math.floor(totalSpent / 10);

//       // המלצות מוצרים (מוצרים פופולריים)
//       const recommended = products
//         .sort(() => 0.5 - Math.random())
//         .slice(0, 6);

//       // מוצרים מועדפים (דוגמה)
//       const favorites = products
//         .filter(product => product.stock_quantity > 0)
//         .sort(() => 0.5 - Math.random())
//         .slice(0, 4);

//       setCustomerStats({
//         totalOrders: orders.length,
//         pendingOrders,
//         totalSpent,
//         favoriteCategory: 'מוצרי מזון', // ניתן לחישוב אמיתי
//         cartItems: cartData.items?.length || 0,
//         loyaltyPoints
//       });

//       setRecentOrders(orders.slice(0, 5));
//       setRecommendedProducts(recommended);
//       setFavoriteProducts(favorites);

//     } catch (error) {
//       console.error('Error loading customer data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//  if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
//           <p className="text-gray-600 font-medium">טוען נתונים...</p>
//         </div>
//       </div>
//     );
//   }
//   return (
//     <div className="space-y-6">
//       {/* כותרת לקוח */}
//       <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white rounded-xl p-8 relative overflow-hidden">
//         <div className="absolute inset-0 bg-black opacity-10"></div>
//         <div className="relative z-10">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-4xl font-bold mb-3">
//                 שלום {user?.full_name}! 🛒
//               </h1>
//               <p className="text-green-100 text-lg mb-4">
//                 ברוך הבא לחנות שלנו! מה נרכוש היום?
//               </p>

//             </div>
//             <div className="hidden md:block">
//               <div className="text-6xl opacity-20">🛍️</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* סטטיסטיקות לקוח */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <CustomerStatCard
//           title="ההזמנות שלי"
//           value={customerStats.totalOrders}
//           icon={<ShoppingCart className="h-8 w-8" />}
//           color="from-blue-500 to-blue-600"
//           link="/my-orders"
//         />
//         <CustomerStatCard
//           title="הזמנות פעילות"
//           value={customerStats.pendingOrders}
//           icon={<Clock className="h-8 w-8" />}
//           color="from-orange-500 to-orange-600"
//           urgent={customerStats.pendingOrders > 0}
//         />
//         <CustomerStatCard
//           title="סך כל הקניות עם סטטוס delivered"
//           value={`₪${customerStats.totalSpent.toLocaleString()}`}
//           //value={`₪${Number(customerStats.totalSpent)}`}
//           icon={<CreditCard className="h-8 w-8" />}
//           color="from-green-500 to-green-600"
//         />
//         <CustomerStatCard
//           title="מוצרים בעגלה"
//           value={customerStats.cartItems}
//           icon={<ShoppingCart className="h-8 w-8" />}
//           color="from-purple-500 to-purple-600"
//           //link="/cart"
//           link="/my-cart"
//           urgent={customerStats.cartItems > 0}
//         />
//       </div>



//       {/* תוכן ראשי */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* ההזמנות האחרונות שלי */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-xl font-semibold">ההזמנות האחרונות שלי</h3>
//             <Link 
//               to="/my-orders"
//               className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
//             >
//               צפה בהכל
//               <ArrowUpRight className="h-4 w-4" />
//             </Link>
//           </div>
//           <div className="space-y-4">
//             {recentOrders.length > 0 ? (
//               recentOrders.map(order => (
//                 <CustomerOrderItem key={order.id} order={order} />
//               ))
//             ) : (
//               <div className="text-center py-12 text-gray-500">
//                 <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
//                 <h4 className="text-lg font-medium mb-2">עוד לא ביצעת הזמנות</h4>
//                 <p className="text-gray-400 mb-6">התחל לקנות ותוכל לעקוב אחר ההזמנות שלך כאן</p>
//                 <Link 
//                   to="/shop"
//                   className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   התחל לקנות
//                   <ArrowUpRight className="h-4 w-4" />
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* המוצרים המועדפים שלי */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-xl font-semibold flex items-center gap-2">
//               <Heart className="h-5 w-5 text-red-500" />
//               המועדפים שלי
//             </h3>
//             <Link 
//               to="/favorites"
//               className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
//             >
//               צפה בהכל
//               <ArrowUpRight className="h-4 w-4" />
//             </Link>
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             {favoriteProducts.length > 0 ? (
//               favoriteProducts.map(product => (
//                 <CustomerFavoriteItem key={product.id} product={product} />
//               ))
//             ) : (
//               <div className="col-span-2 text-center py-8 text-gray-500">
//                 <Heart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
//                 <p>אין מוצרים מועדפים</p>
//                 <p className="text-sm">התחל לסמן מוצרים שאתה אוהב</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>


//       {/* פעולות מהירות */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <CustomerQuickAction
//           title="התחל לקנות"
//           description="עיין במגוון המוצרים"
//           icon={<ShoppingCart className="h-6 w-6" />}
//           link="/shop"
//           color="bg-blue-500"
//         />
//         <CustomerQuickAction
//           title="עגלת הקניות"
//           description={`${customerStats.cartItems} מוצרים בעגלה`}
//           icon={<Package className="h-6 w-6" />}
//           //link="/cart"
//           link="/my-cart"
//           color="bg-green-500"
//           badge={customerStats.cartItems > 0 ? customerStats.cartItems : null}
//         />
//         <CustomerQuickAction
//           title="הפרופיל שלי"
//           description="עדכן פרטים אישיים"
//           icon={<User className="h-6 w-6" />}
//           link="/profile"
//           color="bg-purple-500"
//         />
//         <CustomerQuickAction
//           title="כתובות משלוח"
//           description="נהל כתובות"
//           icon={<MapPin className="h-6 w-6" />}
//           link="/addresses"
//           color="bg-orange-500"
//         />
//       </div>

//       {/* טיפים וחדשות */}
//       <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border">
//         <div className="flex items-center gap-2 mb-4">
//           <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
//             <Star className="h-4 w-4 text-white" />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-900">טיפ היום</h3>
//         </div>
//         <p className="text-gray-700 mb-4">
//           ידעת שחיסכון באנרגיה במקרר יכול להתחיל מסידור נכון של המוצרים? שמור את הירקות בתא הטריות ואת המוצרים הקפואים יחד.
//         </p>
//         <div className="flex items-center gap-4 text-sm text-gray-600">
//           <span className="flex items-center gap-1">
//             <Calendar className="h-4 w-4" />
//             עדכון יומי
//           </span>
//           <span className="flex items-center gap-1">
//             <CheckCircle className="h-4 w-4" />
//             טיפים מועילים
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // רכיב כרטיס סטטיסטיקה ללקוח
// const CustomerStatCard = ({ title, value, icon, color, link, urgent }) => (
//   <div className={`bg-gradient-to-r ${color} text-white rounded-xl p-6 shadow-lg relative overflow-hidden ${urgent ? 'ring-2 ring-orange-300' : ''}`}>
//     <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
//     <div className="relative z-10">
//       <div className="flex items-center justify-between mb-4">
//         <div className="p-3 bg-white bg-opacity-20 rounded-lg">
//           {icon}
//         </div>
//         {urgent && (
//           <AlertCircle className="h-5 w-5 text-orange-200" />
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

// // רכיב פריט הזמנה ללקוח
// const CustomerOrderItem = ({ order }) => (
//   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//     <div className="flex items-center gap-3">
//       <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//         <ShoppingCart className="h-5 w-5 text-blue-600" />
//       </div>
//       <div>
//         <p className="font-medium">הזמנה #{order.order_number}</p>
//         <p className="text-sm text-gray-600">
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

// // רכיב מוצר מועדף
// /*const CustomerFavoriteItem = ({ product }) => (
//   <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
//     <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
//       {product.image_url ? (
//         <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
//       ) : (
//         <div className="w-full h-full flex items-center justify-center">
//           <Package className="h-8 w-8 text-gray-400" />
//         </div>
//       )}
//     </div>
//     <h4 className="font-medium text-sm text-gray-900 truncate">{product.name}</h4>
//     <p className="text-green-600 font-bold text-sm">₪{parseFloat(product.price).toFixed(2)}</p>
//   </div>
// );*/
// const CustomerFavoriteItem = ({ product }) => (
//   <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer w-32">
//     {product.image_url ? (
//       <img
//         src={`http://localhost:3000${product.image_url}`}
//         alt={product.name}
//         className="h-24 w-full object-cover mb-2 rounded"
//       />
//     ) : (
//       <div className="h-24 w-full bg-gray-200 flex items-center justify-center mb-2 rounded">
//         No Image
//       </div>
//     )}
//     <h4 className="font-medium text-sm text-gray-900 truncate">{product.name}</h4>
//     <p className="text-green-600 font-bold text-sm">₪{parseFloat(product.price).toFixed(2)}</p>
//   </div>
// );



// // רכיב כרטיס מוצר
// const CustomerProductCard = ({ product }) => (
//   <Link to={`/product/${product.id}`} className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
//     <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
//       {product.image_url ? (
//         <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
//       ) : (
//         <div className="w-full h-full flex items-center justify-center">
//           <Package className="h-6 w-6 text-gray-400" />
//         </div>
//       )}
//     </div>
//     <h4 className="font-medium text-xs text-gray-900 truncate mb-1">{product.name}</h4>
//     <p className="text-green-600 font-bold text-sm">₪{parseFloat(product.price).toFixed(2)}</p>
//   </Link>
// );

// // רכיב פעולה מהירה ללקוח
// const CustomerQuickAction = ({ title, description, icon, link, color, badge }) => (
//   <Link
//     to={link}
//     className="relative block p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all group"
//   >
//     {badge && (
//       <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
//         {badge}
//       </span>
//     )}
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

// export default CustomerDashboard;
// src/pages/CustomerDashboard.jsx - דף בקרה ללקוח
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Clock,
  Star,
  ArrowUpRight,
  CreditCard,
  User,
  AlertCircle,
  ChevronRight,
  Zap,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { ordersAPI, productsAPI, cartAPI } from '../../services/api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [customerStats, setCustomerStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    favoriteCategory: '',
    cartItems: 0,
    loyaltyPoints: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);

      const [orders, products, cartData] = await Promise.all([
        ordersAPI.getMyOrders(),
        productsAPI.getAll(),
        cartAPI.getItems().catch(() => ({ items: [], total: 0 }))
      ]);

      // חישוב סטטיסטיקות לקוח
      const totalSpent = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

      const pendingOrders = orders.filter(order =>
        order.status === 'pending' || order.status === 'confirmed'
      ).length;

      // נקודות נאמנות (1 נקודה לכל 10 שקלים)
      const loyaltyPoints = Math.floor(totalSpent / 10);

      setCustomerStats({
        totalOrders: orders.length,
        pendingOrders,
        totalSpent,
        favoriteCategory: 'מוצרי מזון', // ניתן לחישוב אמיתי
        cartItems: cartData.items?.length || 0,
        loyaltyPoints
      });

      setRecentOrders(orders.slice(0, 5));

    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-dashboard-loading">
        <div className="customer-dashboard-loading-content">
          <div className="customer-dashboard-loading-spinner"></div>
          <p className="customer-dashboard-loading-text">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard-container" >
      <div className="customer-dashboard">
        {/* Hero Header */}
        <div className="customer-dashboard-hero">
          <div className="customer-dashboard-hero-bg-element customer-dashboard-hero-bg-element--top"></div>
          <div className="customer-dashboard-hero-bg-element customer-dashboard-hero-bg-element--bottom"></div>

          <div className="customer-dashboard-hero-content">
            <div className="customer-dashboard-hero-main">
              <div className="customer-dashboard-hero-text">
                <div className="customer-dashboard-hero-user-info">
                  <div>
                    <h1 className="customer-dashboard-hero-title">
                      שלום {user?.full_name}!
                    </h1>
                    <p className="customer-dashboard-hero-subtitle">
                      ברוכים הבאים לחנות שלנו - מה נרכוש היום?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="customer-dashboard-stats">
          <div className="customer-dashboard-stats-grid">
            <CustomerStatCard
              title="ההזמנות שלי"
              value={customerStats.totalOrders}
              icon={<ShoppingCart className="h-7 w-7" />}
              iconColor="blue"
              link="/my-orders"
              trend="+3 השבוע"
            />
            <CustomerStatCard
              title="הזמנות פעילות"
              value={customerStats.pendingOrders}
              icon={<Clock className="h-7 w-7" />}
              iconColor="orange"
              urgent={customerStats.pendingOrders > 0}
              pulse={customerStats.pendingOrders > 0}
            />
            <CustomerStatCard
              title="סך כל הקניות עם סטטוס delivered"
              value={`₪${customerStats.totalSpent.toLocaleString()}`}
              icon={<CreditCard className="h-7 w-7" />}
              iconColor="green"
              trend="+12% מהחודש הקודם"
            />
            <CustomerStatCard
              title="מוצרים בעגלה"
              value={customerStats.cartItems}
              icon={<Package className="h-7 w-7" />}
              iconColor="purple"
              link="/my-cart"
              urgent={customerStats.cartItems > 0}
              badge={null}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="customer-dashboard-content">
          <div className="customer-dashboard-main-grid">
            {/* Recent Orders */}
            <div className="customer-dashboard-orders">
              <div className="customer-dashboard-orders-header">
                <div className="customer-dashboard-orders-header-content">
                  <div className="customer-dashboard-orders-header-info">
                    <div className="customer-dashboard-orders-icon">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="customer-dashboard-orders-title">ההזמנות האחרונות שלי</h3>
                      <p className="customer-dashboard-orders-subtitle">עקוב אחר הסטטוס והתקדמות</p>
                    </div>
                  </div>
                  <Link to="/my-orders" className="customer-dashboard-orders-link">
                    צפה בהכל
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="customer-dashboard-orders-body">
                {recentOrders.length > 0 ? (
                  <div className="customer-dashboard-orders-list">
                    {recentOrders.map(order => (
                      <CustomerOrderItem key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <div className="customer-dashboard-empty">
                    <ShoppingCart className="customer-dashboard-empty-icon" />
                    <h4 className="customer-dashboard-empty-title">עוד לא ביצעת הזמנות</h4>
                    <p className="customer-dashboard-empty-description">
                      התחל לקנות ותוכל לעקוב אחר ההזמנות שלך כאן
                    </p>
                    <Link to="/shop" className="customer-dashboard-empty-button">
                      התחל לקנות
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="customer-dashboard-quick-actions">

            <div className="customer-dashboard-quick-actions-grid">
              <CustomerQuickAction
                title="התחל לקנות"
                description="עיין במגוון המוצרים"
                icon={<ShoppingCart className="h-6 w-6" />}
                link="/shop"
                iconColor="blue"
              />
              <CustomerQuickAction
                title="עגלת הקניות"
                description={`${customerStats.cartItems} מוצרים בעגלה`}
                icon={<Package className="h-6 w-6" />}
                link="/my-cart"
                iconColor="green"
                badge={null}
              />
              <CustomerQuickAction
                title="הפרופיל שלי"
                description="עדכן פרטים אישיים"
                icon={<User className="h-6 w-6" />}
                link="/profile"
                iconColor="purple"
              />
            </div>
          </div>

          {/* Tips Section */}
          <div className="customer-dashboard-tips">
            <div className="customer-dashboard-tips-content">
              <div className="customer-dashboard-tips-icon">
                <Star className="h-6 w-6" />
              </div>
              <div className="customer-dashboard-tips-text">
                <div className="customer-dashboard-tips-header">
                  <h3 className="customer-dashboard-tips-title">טיפ היום</h3>
                  <span className="customer-dashboard-tips-badge">חדש</span>
                </div>
                <p className="customer-dashboard-tips-description">
                  ידעת שחיסכון בנרגיה במקרר יכול להתחיל מסידור נכון של המוצרים? שמור את הירקות בתנאי טריות ואת המוצרים הקפואים יחד.
                </p>
                <div className="customer-dashboard-tips-footer">
                  <div className="customer-dashboard-tips-footer-item">
                    <Calendar className="h-4 w-4" />
                    עדכון יומי
                  </div>
                  <div className="customer-dashboard-tips-footer-item">
                    <CheckCircle className="h-4 w-4" />
                    טיפים מועילים
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// רכיב כרטיס סטטיסטיקה
const CustomerStatCard = ({ title, value, icon, iconColor, link, trend, urgent, pulse, badge }) => (
  <div className={`customer-stat-card ${urgent ? 'customer-stat-card--urgent' : ''} ${pulse ? 'customer-stat-card--pulse' : ''}`}>
    <div className={`customer-stat-card-bg bg-gradient-to-br from-${iconColor}-500 to-${iconColor}-600`}></div>

    {badge && (
      <span className="customer-stat-card-badge">{badge}</span>
    )}

    <div className="customer-stat-card-content">
      <div className="customer-stat-card-header">
        <div className={`customer-stat-card-icon customer-stat-card-icon--${iconColor}`}>
          {icon}
        </div>
        {urgent && (
          <AlertCircle className="customer-stat-card-alert h-5 w-5" />
        )}
      </div>

      <div className="customer-stat-card-body">
        <p className="customer-stat-card-title">{title}</p>
        <p className="customer-stat-card-value">{value}</p>

        {trend && (
          <p className="customer-stat-card-trend">{trend}</p>
        )}

        {link && (
          <Link to={link} className="customer-stat-card-link">
            צפה בפירוט
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  </div>
);

// רכיב פריט הזמנה
const CustomerOrderItem = ({ order }) => (
  <div className="customer-order-item">
    <div className="customer-order-item-left">
      <div className="customer-order-item-icon">
        <ShoppingCart className="h-6 w-6" />
      </div>
      <div className="customer-order-item-info">
        <h4>הזמנה #{order.order_number}</h4>
        <p>{new Date(order.order_date).toLocaleDateString('he-IL')}</p>
      </div>
    </div>

    <div className="customer-order-item-right">
      <div className="customer-order-item-details">
        <p className="customer-order-item-amount">₪{parseFloat(order.total_amount).toLocaleString()}</p>
        <span className={`customer-order-item-status customer-order-item-status--${order.status}`}>
          {getStatusText(order.status)}
        </span>
      </div>
      <ChevronRight className="customer-order-item-arrow h-5 w-5" />
    </div>
  </div>
);

// רכיב פעולה מהירה
const CustomerQuickAction = ({ title, description, icon, link, iconColor, badge }) => (
  <Link to={link} className="customer-quick-action">
    {badge && (
      <span className="customer-quick-action-badge">{badge}</span>
    )}

    <div className="customer-quick-action-content">
      <div className={`customer-quick-action-icon customer-quick-action-icon--${iconColor}`}>
        {icon}
      </div>
      <div className="customer-quick-action-text">
        <h4 className="customer-quick-action-title">{title}</h4>
        <p className="customer-quick-action-description">{description}</p>
      </div>
      <ChevronRight className="customer-quick-action-arrow h-5 w-5" />
    </div>
  </Link>
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

export default CustomerDashboard;