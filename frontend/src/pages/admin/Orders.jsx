// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { FileText, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // state לסינון
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

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('שגיאה בטעינת ההזמנות');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את ההזמנה?')) return;
    try {
      await ordersAPI.delete(orderId);
      toast.success('ההזמנה נמחקה בהצלחה');
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('שגיאה במחיקת ההזמנה');
    }
  };

  const ordersByUser = () => {
    const grouped = {};
    filteredOrders().forEach((order) => {
      const userKey = order.user_name || `User ${order.user_id}`;
      if (!grouped[userKey]) grouped[userKey] = [];
      grouped[userKey].push(order);
    });
    return grouped;
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const groupedOrders = ordersByUser();

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          כל ההזמנות
        </h1>
        <p>רשימת כל ההזמנות של המשתמשים במערכת</p>
      </div>

      {/* 🔹 סינונים */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4">
        <Filter className="h-4 w-4" />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="delivered">Delivered</option>
          <option value="confirmed">Confirmed</option>
        </select>

        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={filters.toDate}
          onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="מחיר מינימום"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          className="border p-2 rounded w-40"
        />
        <input
          type="number"
          placeholder="מחיר מקסימום"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          className="border p-2 rounded w-40"
        />

        <button
          onClick={() =>
            setFilters({ status: '', fromDate: '', toDate: '', minPrice: '', maxPrice: '' })
          }
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          איפוס
        </button>
      </div>

      {filteredOrders().length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">לא נמצאו הזמנות</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedOrders).map(([user, userOrders]) => (
            <div key={user} className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-xl font-semibold mb-3 border-b pb-2">{user}</h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-3 border">ID</th>
                      <th className="p-3 border">כמות מוצרים</th>
                      <th className="p-3 border">תאריך ההזמנה</th>
                      <th className="p-3 border">מחיר כולל</th>
                      <th className="p-3 border">סטטוס</th>
                      <th className="p-3 border">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map((order) => (
                      <tr key={order.id} className="text-center hover:bg-gray-50">
                        <td className="p-3 border">{order.id}</td>
                        <td className="p-3 border">{order.total_items}</td>
                        <td className="p-3 border">{new Date(order.order_date).toLocaleString()}</td>
                        <td className="p-3 border">₪{Number(order.total_amount)}</td>
                        <td className="p-3 border">
                          <select
                            value={order.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                await ordersAPI.updateStatus(order.id, newStatus);
                                setOrders((prev) =>
                                  prev.map((o) =>
                                    o.id === order.id ? { ...o, status: newStatus } : o
                                  )
                                );
                                toast.success('סטטוס ההזמנה עודכן בהצלחה');
                              } catch (error) {
                                console.error('Error updating order status:', error);
                                toast.error('שגיאה בעדכון סטטוס ההזמנה');
                              }
                            }}
                            className="border px-2 py-1 rounded"
                          >
                            <option value="pending">Pending</option>
                            <option value="delivered">Delivered</option>
                            <option value="confirmed">Confirmed</option>
                          </select>
                        </td>

                        <td className="p-3 border flex justify-center gap-2">
                          <Link
                            to={`/order-details/${order.id}`}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 inline-flex items-center gap-1"
                          >
                            פרטי הזמנה
                          </Link>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="bg-red-500 text-black px-3 py-1 rounded hover:bg-red-600 inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" /> מחק
                          </button>
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
  );
};

export default Orders;
