/**
 * Orders.jsx - Enhanced Orders Management Page
 * 
 * This component provides comprehensive order management functionality:
 * - Orders listing grouped by customer
 * - Advanced filtering by status, date range, and price
 * - Order deletion with confirmation dialogs
 * - Status change with confirmation workflow
 * - Responsive table design for mobile and desktop
 * - Real-time order statistics and filtering
 * - Integration with order details navigation
 * - Custom Toast notifications for user feedback
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { FileText, Trash2, Filter, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filter state for advanced order filtering
  const [filters, setFilters] = useState({
    status: '',
    fromDate: '',
    toDate: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    loadOrders();
  }, []);

  /**
   * Load all orders from API
   * Fetches complete order list with error handling
   */
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('שגיאה בטעינת ההזמנות', {
        dismissible: false
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle order deletion with confirmation dialog
   * Provides user feedback and updates state after deletion
   * 
   * @param {Object} order - Order object to delete
   */
  const handleDelete = async (order) => {
    const deleteOrder = async () => {
      try {
        await ordersAPI.delete(order.id);
        toast.success(`ההזמנה #${order.id} נמחקה בהצלחה`, {
          duration: 3000,
          icon: '✅',
          dismissible: false
        });
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('שגיאה במחיקת ההזמנה', {
          duration: 4000,
          icon: '⌫',
          dismissible: false
        });
      }
    };

    // Custom confirmation dialog using Toast
    toast((t) => (
      <div className="categories-toast-delete-overlay">
        <div className="categories-toast-delete-header">
          <AlertTriangle size={24} />
          מחיקת הזמנה
        </div>
        
        <div className="categories-toast-delete-content">
          האם אתה בטוח שברצונך למחוק את ההזמנה<br />
          <strong>#{order.id}</strong> של <strong>{order.full_name || order.user_name || `User ${order.user_id}`}</strong>?<br />
          <span className="categories-toast-delete-warning">
            פעולה זו בלתי הפיכה!
          </span>
        </div>
        
        <div className="categories-toast-delete-buttons">
          <button
            onClick={() => {
              deleteOrder();
              toast.dismiss(t.id);
            }}
            className="categories-toast-delete-confirm"
          >
            כן, מחק
          </button>
          
          <button
            onClick={() => toast.dismiss(t.id)}
            className="categories-toast-delete-cancel"
          >
            ביטול
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      className: 'categories-toast-delete-custom',
      position: 'top-center',
      dismissible: false
    });
  };

  /**
   * Handle order status change with confirmation
   * Updates order status after user confirmation
   * 
   * @param {Object} order - Order object to update
   * @param {string} newStatus - New status to set
   */
  const handleStatusChange = async (order, newStatus) => {
    const updateStatus = async () => {
      try {
        await ordersAPI.updateStatus(order.id, newStatus);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id ? { ...o, status: newStatus } : o
          )
        );
        toast.success(`סטטוס ההזמנה #${order.id} עודכן בהצלחה`, {
          duration: 3000,
          icon: '✅',
          dismissible: false
        });
      } catch (error) {
        console.error('Error updating order status:', error);
        toast.error('שגיאה בעדכון סטטוס ההזמנה', {
          duration: 4000,
          icon: '⌫',
          dismissible: false
        });
      }
    };

    // Status change confirmation dialog
    toast((t) => (
      <div className="categories-toast-delete-overlay">
        <div className="categories-toast-delete-header">
          <AlertTriangle size={24} />
          שינוי סטטוס הזמנה
        </div>
        
        <div className="categories-toast-delete-content">
          האם אתה בטוח שברצונך לשנות את סטטוס ההזמנה<br />
          <strong>#{order.id}</strong> של <strong>{order.full_name || order.user_name || `User ${order.user_id}`}</strong><br />
          ל<strong>{getStatusText(newStatus)}</strong>?<br />
          <span className="categories-toast-delete-warning">
            פעולה זו תשנה את מצב ההזמנה!
          </span>
        </div>
        
        <div className="categories-toast-delete-buttons">
          <button
            onClick={() => {
              updateStatus();
              toast.dismiss(t.id);
            }}
            className="categories-toast-delete-confirm"
          >
            כן, שנה סטטוס
          </button>
          
          <button
            onClick={() => toast.dismiss(t.id)}
            className="categories-toast-delete-cancel"
          >
            ביטול
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      className: 'categories-toast-delete-custom',
      position: 'top-center',
      dismissible: false
    });
  };

  /**
   * Convert status codes to Hebrew display text
   * 
   * @param {string} status - Order status code
   * @returns {string} Localized status text
   */
  const getStatusText = (status) => {
    const statusMap = {
      pending: 'ממתין',
      confirmed: 'אושר',
      delivered: 'נמסר'
    };
    return statusMap[status] || status;
  };

  /**
   * Group orders by user for better organization
   * Creates nested structure with user as key and their orders as values
   * 
   * @returns {Object} Orders grouped by user identifier
   */
  const ordersByUser = () => {
    const grouped = {};
    filteredOrders().forEach((order) => {
      const userKey = order.full_name || order.user_name || `User ${order.user_id}`;
      if (!grouped[userKey]) grouped[userKey] = [];
      grouped[userKey].push(order);
    });
    return grouped;
  };

  /**
   * Apply all active filters to orders list
   * Filters by status, date range, and price range
   * 
   * @returns {Array} Filtered orders array
   */
  const filteredOrders = () => {
    return orders.filter((o) => {
      const orderDate = new Date(o.order_date);
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;

      return (
        (!filters.status || o.status === filters.status) &&
        (!fromDate || orderDate >= fromDate) &&
        (!toDate || orderDate <= toDate) &&
        (!filters.minPrice || o.total_amount >= Number(filters.minPrice)) &&
        (!filters.maxPrice || o.total_amount <= Number(filters.maxPrice))
      );
    });
  };

  // Loading state component
  if (loading) {
    return (
      <div className="orders-loading">
        <div className="orders-loading-spinner"></div>
      </div>
    );
  }

  const groupedOrders = ordersByUser();

  return (
    <div className="orders-container">
      <div className="orders-page">
        {/* Page Header */}
        <div className="orders-header">
          <div className="orders-header-content">
            <h1 className="orders-header-title">
              <FileText className="orders-header-icon" />
              כל ההזמנות
            </h1>
            <p className="orders-header-subtitle">
              רשימת כל ההזמנות של המשתמשים במערכת
            </p>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="orders-filters">
          <div className="orders-filters-content">
            <Filter className="orders-filters-icon" />
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="orders-filter-select"
            >
              <option value="">כל הסטטוסים</option>
              <option value="pending">ממתין</option>
              <option value="confirmed">אושר</option>
              <option value="delivered">נמסר</option>
            </select>

            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="orders-filter-input"
            />
            
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              className="orders-filter-input"
            />

            <input
              type="number"
              placeholder="מחיר מינימום"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="orders-filter-input"
            />
            
            <input
              type="number"
              placeholder="מחיר מקסימום"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="orders-filter-input"
            />

            <button
              onClick={() =>
                setFilters({ status: '', fromDate: '', toDate: '', minPrice: '', maxPrice: '' })
              }
              className="orders-clear-filters"
            >
              איפוס
            </button>
          </div>
        </div>

        {/* Orders Display */}
        {filteredOrders().length === 0 ? (
          <div className="orders-empty">
            <FileText className="orders-empty-icon" />
            <h3 className="orders-empty-title">לא נמצאו הזמנות</h3>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedOrders).map(([user, userOrders]) => (
              <div key={user} className="orders-user-group">
                <h2 className="orders-user-title">{user}</h2>
                <div className="orders-table-container">
                  <table className="orders-table">
                    <thead className="orders-table-header">
                      <tr>
                        <th>ID</th>
                        <th>שם הלקוח</th>
                        <th>כמות מוצרים</th>
                        <th>תאריך ההזמנה</th>
                        <th>מחיר כולל</th>
                        <th>סטטוס</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order) => (
                        <tr key={order.id} className="orders-table-row">
                          <td className="orders-table-cell" data-label="ID">
                            <span className="orders-id">{order.id}</span>
                          </td>
                          <td className="orders-table-cell" data-label="שם הלקוח">
                            <span className="orders-customer-name">
                              {order.full_name || order.user_name || `User ${order.user_id}`}
                            </span>
                          </td>
                          <td className="orders-table-cell" data-label="כמות מוצרים">
                            <span className="orders-items-count">{order.total_items}</span>
                          </td>
                          <td className="orders-table-cell" data-label="תאריך">
                            <span className="orders-date">
                              {new Date(order.order_date).toLocaleString('he-IL')}
                            </span>
                          </td>
                          <td className="orders-table-cell" data-label="מחיר">
                            <span className="orders-price">₪{Number(order.total_amount)}</span>
                          </td>
                          <td className="orders-table-cell" data-label="סטטוס">
                            <select
                              value={order.status}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                if (newStatus !== order.status) {
                                  handleStatusChange(order, newStatus);
                                  // Reset select to current value until confirmation
                                  e.target.value = order.status;
                                }
                              }}
                              className="orders-status-select"
                            >
                              <option value="pending">ממתין</option>
                              <option value="confirmed">אושר</option>
                              <option value="delivered">נמסר</option>
                            </select>
                          </td>
                          <td className="orders-table-cell" data-label="פעולות">
                            <div className="orders-actions">
                              <Link
                                to={`/order-details/${order.id}`}
                                className="orders-action-button orders-action-button--details"
                              >
                                פרטי הזמנה
                              </Link>
                              <button
                                onClick={() => handleDelete(order)}
                                className="orders-action-button orders-action-button--delete"
                              >
                                <Trash2 className="h-4 w-4" /> מחק
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;