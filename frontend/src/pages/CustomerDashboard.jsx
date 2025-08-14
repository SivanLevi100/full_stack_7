// src/pages/CustomerDashboard.jsx - דף בקרה לקונה
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  Star,
  ArrowUpRight,
  Heart,
  Gift,
  Truck,
  CreditCard,
  User,
  MapPin,
  Tag,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ordersAPI, productsAPI, cartAPI } from '../services/api';

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
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
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

      // המלצות מוצרים (מוצרים פופולריים)
      const recommended = products
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);

      // מוצרים מועדפים (דוגמה)
      const favorites = products
        .filter(product => product.stock_quantity > 0)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      setCustomerStats({
        totalOrders: orders.length,
        pendingOrders,
        totalSpent,
        favoriteCategory: 'מוצרי מזון', // ניתן לחישוב אמיתי
        cartItems: cartData.items?.length || 0,
        loyaltyPoints
      });

      setRecentOrders(orders.slice(0, 5));
      setRecommendedProducts(recommended);
      setFavoriteProducts(favorites);

    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* כותרת לקוח */}
      <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white rounded-xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">
                שלום {user?.full_name}! 🛒
              </h1>
              <p className="text-green-100 text-lg mb-4">
                ברוך הבא לחנות שלנו! מה נרכוש היום?
              </p>
              
            </div>
            <div className="hidden md:block">
              <div className="text-6xl opacity-20">🛍️</div>
            </div>
          </div>
        </div>
      </div>

      {/* סטטיסטיקות לקוח */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CustomerStatCard
          title="ההזמנות שלי"
          value={customerStats.totalOrders}
          icon={<ShoppingCart className="h-8 w-8" />}
          color="from-blue-500 to-blue-600"
          link="/my-orders"
        />
        <CustomerStatCard
          title="הזמנות פעילות"
          value={customerStats.pendingOrders}
          icon={<Clock className="h-8 w-8" />}
          color="from-orange-500 to-orange-600"
          urgent={customerStats.pendingOrders > 0}
        />
        <CustomerStatCard
          title="סך כל הקניות"
          value={`₪${customerStats.totalSpent.toLocaleString()}`}
          icon={<CreditCard className="h-8 w-8" />}
          color="from-green-500 to-green-600"
        />
        <CustomerStatCard
          title="פריטים בעגלה"
          value={customerStats.cartItems}
          icon={<ShoppingCart className="h-8 w-8" />}
          color="from-purple-500 to-purple-600"
          link="/cart"
          urgent={customerStats.cartItems > 0}
        />
      </div>

    

      {/* תוכן ראשי */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ההזמנות האחרונות שלי */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">ההזמנות האחרונות שלי</h3>
            <Link 
              to="/my-orders"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
            >
              צפה בהכל
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <CustomerOrderItem key={order.id} order={order} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h4 className="text-lg font-medium mb-2">עוד לא ביצעת הזמנות</h4>
                <p className="text-gray-400 mb-6">התחל לקנות ותוכל לעקוב אחר ההזמנות שלך כאן</p>
                <Link 
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  התחל לקנות
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* המוצרים המועדפים שלי */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              המועדפים שלי
            </h3>
            <Link 
              to="/favorites"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
            >
              צפה בהכל
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {favoriteProducts.length > 0 ? (
              favoriteProducts.map(product => (
                <CustomerFavoriteItem key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <Heart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>אין מוצרים מועדפים</p>
                <p className="text-sm">התחל לסמן מוצרים שאתה אוהב</p>
              </div>
            )}
          </div>
        </div>
      </div>

     
      {/* פעולות מהירות */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CustomerQuickAction
          title="התחל לקנות"
          description="עיין במגוון המוצרים"
          icon={<ShoppingCart className="h-6 w-6" />}
          link="/shop"
          color="bg-blue-500"
        />
        <CustomerQuickAction
          title="עגלת הקניות"
          description={`${customerStats.cartItems} פריטים בעגלה`}
          icon={<Package className="h-6 w-6" />}
          link="/cart"
          color="bg-green-500"
          badge={customerStats.cartItems > 0 ? customerStats.cartItems : null}
        />
        <CustomerQuickAction
          title="הפרופיל שלי"
          description="עדכן פרטים אישיים"
          icon={<User className="h-6 w-6" />}
          link="/profile"
          color="bg-purple-500"
        />
        <CustomerQuickAction
          title="כתובות משלוח"
          description="נהל כתובות"
          icon={<MapPin className="h-6 w-6" />}
          link="/addresses"
          color="bg-orange-500"
        />
      </div>

      {/* טיפים וחדשות */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
            <Star className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">טיפ היום</h3>
        </div>
        <p className="text-gray-700 mb-4">
          ידעת שחיסכון באנרגיה במקרר יכול להתחיל מסידור נכון של המוצרים? שמור את הירקות בתא הטריות ואת המוצרים הקפואים יחד.
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            עדכון יומי
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            טיפים מועילים
          </span>
        </div>
      </div>
    </div>
  );
};

// רכיב כרטיס סטטיסטיקה ללקוח
const CustomerStatCard = ({ title, value, icon, color, link, urgent }) => (
  <div className={`bg-gradient-to-r ${color} text-white rounded-xl p-6 shadow-lg relative overflow-hidden ${urgent ? 'ring-2 ring-orange-300' : ''}`}>
    <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
          {icon}
        </div>
        {urgent && (
          <AlertCircle className="h-5 w-5 text-orange-200" />
        )}
      </div>
      <div>
        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold mb-2">{value}</p>
        {link && (
          <Link 
            to={link}
            className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium"
          >
            צפה בפירוט
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  </div>
);

// רכיב פריט הזמנה ללקוח
const CustomerOrderItem = ({ order }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <ShoppingCart className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <p className="font-medium">הזמנה #{order.order_number}</p>
        <p className="text-sm text-gray-600">
          {new Date(order.order_date).toLocaleDateString('he-IL')}
        </p>
      </div>
    </div>
    <div className="text-left">
      <p className="font-medium">₪{parseFloat(order.total_amount).toLocaleString()}</p>
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
        {getStatusText(order.status)}
      </span>
    </div>
  </div>
);

// רכיב מוצר מועדף
const CustomerFavoriteItem = ({ product }) => (
  <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
    <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
      )}
    </div>
    <h4 className="font-medium text-sm text-gray-900 truncate">{product.name}</h4>
    <p className="text-green-600 font-bold text-sm">₪{parseFloat(product.price).toFixed(2)}</p>
  </div>
);

// רכיב כרטיס מוצר
const CustomerProductCard = ({ product }) => (
  <Link to={`/product/${product.id}`} className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
    <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="h-6 w-6 text-gray-400" />
        </div>
      )}
    </div>
    <h4 className="font-medium text-xs text-gray-900 truncate mb-1">{product.name}</h4>
    <p className="text-green-600 font-bold text-sm">₪{parseFloat(product.price).toFixed(2)}</p>
  </Link>
);

// רכיב פעולה מהירה ללקוח
const CustomerQuickAction = ({ title, description, icon, link, color, badge }) => (
  <Link
    to={link}
    className="relative block p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all group"
  >
    {badge && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
        {badge}
      </span>
    )}
    <div className="flex items-center gap-3">
      <div className={`${color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
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

const getStatusStyle = (status) => {
  const styleMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return styleMap[status] || 'bg-gray-100 text-gray-800';
};

export default CustomerDashboard;