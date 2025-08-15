// src/pages/MyOrders.js
import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getMyOrders(); // ⬅️ מחזיר רק את ההזמנות של המשתמש הנוכחי
      setOrders(data);
    } catch (error) {
      console.error('Error loading my orders:', error);
      toast.error('שגיאה בטעינת ההזמנות שלי');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* כותרת */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-2">ההזמנות שלי</h1>
        <p className="text-green-100">צפה בכל ההזמנות שביצעת</p>
      </div>

      {/* טבלה או הודעה */}
      {orders.length > 0 ? (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">תאריך</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סכום</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{order.id}</td>
                  <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('he-IL')}</td>
                  <td className="px-6 py-4">₪{parseFloat(order.total_price).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">אין הזמנות להצגה</p>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
