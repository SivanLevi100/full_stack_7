// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Clock,
  Star,
  ArrowUpRight,
  Eye,
  BarChart3
} from 'lucide-react';
import { ordersAPI, productsAPI, usersAPI } from '../services/api';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (isAdmin()) {
        const [products, orders, users, lowStock] = await Promise.all([
          productsAPI.getAll(),
          ordersAPI.getAll(),
          usersAPI.getAll(),
          productsAPI.getLowStock()
        ]);

        const totalRevenue = orders
          .filter(order => order.status !== 'cancelled')
          .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

        const pendingOrders = orders.filter(order => order.status === 'pending').length;

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalUsers: users.length,
          lowStockProducts: lowStock.length,
          totalRevenue,
          pendingOrders
        });

        setRecentOrders(orders.slice(0, 5));
        setLowStockProducts(lowStock.slice(0, 5));

      } else {
        const orders = await ordersAPI.getMyOrders();
        setRecentOrders(orders.slice(0, 5));
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter(order => order.status === 'pending').length
        });
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ברכה */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">
              {getGreeting()}, {user?.full_name}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              {isAdmin() 
                ? 'ברוך הבא לפאנל הניהול. כאן תוכל לנהל את המערכת ולעקוב אחר הביצועים' 
                : 'ברוך הבא לחנות שלנו! כאן תוכל לעקוב אחר ההזמנות שלך ולגלות מוצרים חדשים'
              }
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-6xl opacity-20">
              {isAdmin() ? '👨‍💼' : '🛍️'}
            </div>
          </div>
        </div>
      </div>

      {/* כרטיסי סטטיסטיקה */}
      {isAdmin() ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="סך המוצרים"
            value={stats.totalProducts}
            icon={<Package className="h-8 w-8" />}
            color="from-blue-500 to-blue-600"
            link="/products"
          />
          <StatCard
            title="סך ההזמנות"
            value={stats.totalOrders}
            icon={<ShoppingCart className="h-8 w-8" />}
            color="from-green-500 to-green-600"
            link="/orders"
          />
          <StatCard
            title="סך הלקוחות"
            value={stats.totalUsers}
            icon={<Users className="h-8 w-8" />}
            color="from-purple-500 to-purple-600"
            link="/users"
          />
          <StatCard
            title="מוצרים במלאי נמוך"
            value={stats.lowStockProducts}
            icon={<AlertTriangle className="h-8 w-8" />}
            color="from-red-500 to-red-600"
            urgent={stats.lowStockProducts > 0}
          />
          <StatCard
            title="מחזור כולל"
            value={`₪${stats.totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="h-8 w-8" />}
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            title="הזמנות ממתינות"
            value={stats.pendingOrders}
            icon={<Clock className="h-8 w-8" />}
            color="from-indigo-500 to-indigo-600"
            urgent={stats.pendingOrders > 0}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="ההזמנות שלי"
            value={stats.totalOrders}
            icon={<ShoppingCart className="h-8 w-8" />}
            color="from-blue-500 to-blue-600"
            link="/my-orders"
          />
          <StatCard
            title="הזמנות ממתינות"
            value={stats.pendingOrders}
            icon={<Clock className="h-8 w-8" />}
            color="from-orange-500 to-orange-600"
          />
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">התחל לקנות</h3>
                <p className="text-green-100 mb-4">גלה את המוצרים החדשים שלנו</p>
                <Link 
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
                >
                  לחנות
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <ShoppingCart className="h-12 w-12 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* תוכן נוסף למנהל */}
      {isAdmin() && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* הזמנות אחרונות */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">הזמנות אחרונות</h3>
              <Link 
                to="/orders"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
              >
                צפה בהכל
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">#{order.order_number}</p>
                        <p className="text-sm text-gray-600">{order.full_name}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">₪{parseFloat(order.total_amount).toLocaleString()}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>אין הזמנות אחרונות</p>
                </div>
              )}
            </div>
          </div>

          {/* מוצרים במלאי נמוך */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                מוצרים במלאי נמוך
              </h3>
              <Link 
                to="/products"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
              >
                נהל מלאי
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category_name}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="inline-block px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                        {product.stock_quantity} יחידות
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>כל המוצרים במלאי תקין</p>
                  <p className="text-sm">מצוין! 🎉</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* הזמנות אחרונות ללקוח */}
      {!isAdmin() && (
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
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
      )}

      {/* קישורים מהירים */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin() ? (
          <>
            <QuickLink
              title="הוסף מוצר חדש"
              description="הוסף מוצרים חדשים למלאי"
              icon={<Package className="h-6 w-6" />}
              link="/products/new"
              color="bg-blue-500"
            />
            <QuickLink
              title="צפה בדוחות"
              description="דוחות מכירות ומלאי"
              icon={<BarChart3 className="h-6 w-6" />}
              link="/reports"
              color="bg-green-500"
            />
            <QuickLink
              title="נהל משתמשים"
              description="הוסף וערוך משתמשים"
              icon={<Users className="h-6 w-6" />}
              link="/users"
              color="bg-purple-500"
            />
            <QuickLink
              title="הגדרות מערכת"
              description="הגדרות כלליות"
              icon={<Eye className="h-6 w-6" />}
              link="/settings"
              color="bg-gray-500"
            />
          </>
        ) : (
          <>
            <QuickLink
              title="גלה מוצרים"
              description="עיין במגוון המוצרים שלנו"
              icon={<Package className="h-6 w-6" />}
              link="/shop"
              color="bg-blue-500"
            />
            <QuickLink
              title="עגלת הקניות"
              description="סיים את הרכישה שלך"
              icon={<ShoppingCart className="h-6 w-6" />}
              link="/cart"
              color="bg-green-500"
            />
            <QuickLink
              title="ההזמנות שלי"
              description="עקוב אחר ההזמנות שלך"
              icon={<Clock className="h-6 w-6" />}
              link="/my-orders"
              color="bg-purple-500"
            />
            <QuickLink
              title="הפרופיל שלי"
              description="ערוך את הפרטים שלך"
              icon={<Users className="h-6 w-6" />}
              link="/profile"
              color="bg-gray-500"
            />
          </>
        )}
      </div>
    </div>
  );
};

// רכיב כרטיס סטטיסטיקה
const StatCard = ({ title, value, icon, color, link, urgent }) => (
  <div className={`bg-gradient-to-r ${color} text-white rounded-xl p-6 shadow-sm ${urgent ? 'ring-2 ring-red-300 animate-pulse' : ''}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {link && (
          <Link 
            to={link}
            className="inline-flex items-center gap-1 mt-2 text-white/80 hover:text-white text-sm font-medium"
          >
            צפה בפירוט
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="opacity-80">
        {icon}
      </div>
    </div>
  </div>
);

// רכיב קישור מהיר
const QuickLink = ({ title, description, icon, link, color }) => (
  <Link
    to={link}
    className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
  >
    <div className="flex items-center gap-3">
      <div className={`${color} text-white p-2 rounded-lg group-hover:scale-110 transition-transform`}>
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
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'בוקר טוב';
  if (hour < 18) return 'אחר הצהריים טובים';
  return 'ערב טוב';
};

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

export default Dashboard;// src/pages/Dashboard.js
