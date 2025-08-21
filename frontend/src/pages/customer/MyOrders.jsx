// src/pages/MyOrders.jsx
import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import {
  Loader2,
  Package,
  ShoppingCart,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // --- מצב למודל פרטי ההזמנה ---
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getMyOrders();
      console.log("🟢 Raw data from server:", data);
      setOrders(data);
    } catch (error) {
      console.error('Error loading my orders:', error);
      toast.error('שגיאה בטעינת ההזמנות שלי');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    filtered.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
    setFilteredOrders(filtered);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { text: 'ממתינה', icon: Clock, color: 'status-pending', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', iconColor: 'text-yellow-600' },
      confirmed: { text: 'אושרה', icon: CheckCircle, color: 'status-confirmed', bgColor: 'bg-blue-100', textColor: 'text-blue-800', iconColor: 'text-blue-600' },
      delivered: { text: 'נמסרה', icon: CheckCircle, color: 'status-delivered', bgColor: 'bg-green-100', textColor: 'text-green-800', iconColor: 'text-green-600' },
      cancelled: { text: 'בוטלה', icon: XCircle, color: 'status-cancelled', bgColor: 'bg-red-100', textColor: 'text-red-800', iconColor: 'text-red-600' },
    };
    return statusMap[status] || statusMap.pending;
  };

  // --- הפעלת מודל פרטי ההזמנה ---
  const handleViewDetails = async (orderId) => {
    try {
      const orderDetails = await ordersAPI.getById(orderId);
      setSelectedOrder(orderDetails);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('שגיאה בטעינת פרטי ההזמנה');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="cart-loading-spinner"></div>
        <p className="cart-loading-text">טוען הזמנות...</p>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-container">
        {/* כותרת העמוד */}
        <div className="shop-header">
          <div className="shop-header-content">
            <h1 className="shop-header-title">ההזמנות שלי</h1>
            <p className="shop-header-subtitle">צפה בכל ההזמנות שביצעת ועקוב אחר הסטטוס שלהן</p>
          </div>
        </div>

        {/* פילטרים */}
        <div className="shop-filters">
          <div className="orders-filters-header">
            <div className="orders-filters-title">
              <Filter className="h-5 w-5 text-primary-green" />
              סינון הזמנות
            </div>
          </div>

          <div className="orders-filters-content">
            <div className="orders-filter-group">
              <label className="shop-filter-label">סטטוס הזמנה</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="shop-select"
              >
                <option value="all">כל ההזמנות</option>
                <option value="pending">ממתינות</option>
                <option value="confirmed">מאושרות</option>
                <option value="delivered">נמסרו</option>
                <option value="cancelled">בוטלו</option>
              </select>
            </div>

            <div className="orders-summary">
              <span className="orders-summary-text">נמצאו {filteredOrders.length} הזמנות</span>
            </div>
          </div>
        </div>

        {/* תוצאות */}
        {filteredOrders.length > 0 ? (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} getStatusInfo={getStatusInfo} onViewDetails={handleViewDetails} />
            ))}
          </div>
        ) : (
          <div className="shop-empty-state">
            {orders.length === 0 ? (
              <>
                <Package className="shop-empty-icon" />
                <h3 className="shop-empty-title">אין הזמנות להצגה</h3>
                <p className="orders-empty-description">
                  עדיין לא ביצעת הזמנות. התחל לקנות ותראה את ההזמנות שלך כאן!
                </p>
                <a href="/shop" className="shop-empty-button">
                  <ShoppingCart className="h-5 w-5" />
                  התחל לקנות
                </a>
              </>
            ) : (
              <>
                <AlertCircle className="shop-empty-icon" />
                <h3 className="shop-empty-title">אין הזמנות בסטטוס זה</h3>
                <p className="orders-empty-description">
                  לא נמצאו הזמנות שמתאימות לסינון הנוכחי
                </p>
                <button
                  onClick={() => setStatusFilter('all')}
                  className="shop-empty-button"
                >
                  הצג את כל ההזמנות
                </button>
              </>
            )}
          </div>
        )}

        {/* מודל פרטי ההזמנה */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
              <h2 className="text-xl font-bold mb-4">פרטי הזמנה #{selectedOrder.id}</h2>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold"
              >
                X
              </button>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-right">פריט</th>
                    <th className="border p-2 text-right">כמות</th>
                    <th className="border p-2 text-right">מחיר</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border p-2">{item.name}</td>
                      <td className="border p-2">{item.quantity}</td>
                      <td className="border p-2">₪{Number(item.unit_price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}



      </div>
    </div>
  );
};

// רכיב כרטיס הזמנה
const OrderCard = ({ order, getStatusInfo, onViewDetails }) => {
  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div className="order-card-main-info">
          <div className="order-card-icon">
            <Package className="h-6 w-6 text-primary-green" />
          </div>
          <div className="order-card-details">
            <h3 className="order-card-number">הזמנה #{order.id}</h3>
            <div className="order-card-meta">
              <div className="order-card-meta-item">
                <Calendar className="h-4 w-4" />
                <span>{new Date(order.order_date).toLocaleDateString('he-IL')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="order-card-status-section">
          <div className={`order-status-badge ${statusInfo.color}`}>
            <StatusIcon className="h-4 w-4" />
            <span>{statusInfo.text}</span>
          </div>
          <div className="order-card-amount">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <span className="order-amount-value">₪{Number(order.total_amount).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="order-card-actions">
        <button
          className="order-action-btn order-action-btn--view"
          onClick={() => onViewDetails(order.id)}
        >
          <Eye className="h-4 w-4" />
          צפה בפרטים
        </button>
      </div>
    </div>
  );
};

export default MyOrders;
