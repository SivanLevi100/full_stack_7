// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    const ordersByUser = () => {
        const grouped = {};
        orders.forEach((order) => {
            const userKey = order.user_name || `User ${order.user_id}`;
            if (!grouped[userKey]) grouped[userKey] = [];
            grouped[userKey].push(order);
        });
        return grouped;
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

            {orders.length === 0 ? (
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
                                                                // עדכון סטטוס בלוקל סטייט
                                                                setOrders(prev =>
                                                                    prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
                                                                );
                                                                toast.success('סטטוס ההזמנה עודכן בהצלחה');
                                                            } catch (error) {
                                                                console.error('Error updating order status:', error);
                                                                toast.error('שגיאה בעדכון סטטוס ההזמנה');
                                                            }
                                                        }}
                                                        className="border px-2 py-1 rounded">
                                                        <option value="pending">Pending</option>
                                                        <option value="delivered">delivered</option>
                                                        <option value="confirmed">confirmed</option>
                                                    </select>
                                                </td>

                                                <td className="p-3 border">
                                                    <Link
                                                        to={`/order-details/${order.id}`}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 inline-block"
                                                    >
                                                        פרטי הזמנה
                                                    </Link>
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
