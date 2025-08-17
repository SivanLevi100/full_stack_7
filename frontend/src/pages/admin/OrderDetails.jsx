import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderItemsAPI, productsAPI } from '../../services/api'; // נניח שיש שירות productsAPI
import toast from 'react-hot-toast';

const OrderDetails = () => {
    const { orderId } = useParams();
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // ניהול עריכה/הוספה
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({ product_id: '', name: '', quantity: 1, unit_price: 0 });

    // טעינת פרטי הזמנה
    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await orderItemsAPI.getByOrder(orderId);
            setItems(data);
        } catch (error) {
            console.error('Error loading order items:', error);
            toast.error('שגיאה בטעינת פרטי ההזמנה');
        } finally {
            setLoading(false);
        }
    };

    // טעינת רשימת מוצרים מהחנות
    const loadProducts = async () => {
        try {
            const data = await productsAPI.getAll(); // מחזיר array של מוצרים עם id, name, price
            setProducts(data);
        } catch (err) {
            console.error('Error loading products:', err);
        }
    };

    useEffect(() => {
        loadItems();
        loadProducts();
    }, [orderId]);

    // מחיקה
    const handleDelete = async (id) => {
        if (!window.confirm('למחוק פריט זה?')) return;
        try {
            await orderItemsAPI.delete(id);
            toast.success('פריט נמחק בהצלחה');
            loadItems();
        } catch (err) {
            console.error(err);
            toast.error('שגיאה במחיקת פריט');
        }
    };

    // עריכה
    const handleEdit = (item) => setEditingItem({ ...item });

    const handleSaveEdit = async () => {
        try {
            await orderItemsAPI.update(editingItem.id, editingItem);
            toast.success('פריט עודכן בהצלחה');
            setEditingItem(null);
            loadItems();
        } catch (err) {
            console.error(err);
            toast.error('שגיאה בעדכון פריט');
        }
    };

    // הוספה
    const handleAddNew = async () => {
        if (!newItem.product_id) {
            toast.error('בחר מוצר לפני ההוספה');
            return;
        }
        try {
            await orderItemsAPI.create({ ...newItem, order_id: orderId });
            toast.success('פריט נוסף בהצלחה');
            setNewItem({ product_id: '', name: '', quantity: 1, unit_price: 0 });
            loadItems();
        } catch (err) {
            console.error(err);
            toast.error('שגיאה בהוספת פריט');
        }
    };

    if (loading) return <p>טוען...</p>;

    return (
        <div className="p-6 bg-white rounded-xl shadow space-y-6">
            <h1 className="text-2xl font-bold mb-4">פרטי הזמנה #{orderId}</h1>

            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">מוצר</th>
                        <th className="border p-2">כמות</th>
                        <th className="border p-2">מחיר ליחידה</th>
                        <th className="border p-2">סה"כ</th>
                        <th className="border p-2">פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} className="text-center hover:bg-gray-50">
                            <td className="border p-2">
                                {editingItem?.id === item.id ? (
                                    <select
                                        value={editingItem.product_id}
                                        onChange={(e) => {
                                            const selectedProduct = products.find(p => p.id === Number(e.target.value));
                                            setEditingItem({
                                                ...editingItem,
                                                product_id: selectedProduct.id,
                                                name: selectedProduct.name,
                                                unit_price: selectedProduct.price,
                                            });
                                        }}
                                    >
                                        <option value="">בחר מוצר</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    item.name
                                )}
                            </td>
                            <td className="border p-2">
                                {editingItem?.id === item.id ? (
                                    <input
                                        type="number"
                                        value={editingItem.quantity}
                                        onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                                    />
                                ) : (
                                    item.quantity
                                )}
                            </td>
                            <td className="border p-2">
                                {editingItem?.id === item.id ? (
                                    <input
                                        type="number"
                                        value={editingItem.unit_price}
                                        readOnly
                                        className="bg-gray-100"
                                    />
                                ) : (
                                    `₪${Number(item.unit_price)}`
                                )}
                            </td>
                            <td className="border p-2">₪{(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
                            <td className="border p-2 space-x-2">
                                {editingItem?.id === item.id ? (
                                    <>
                                        <button onClick={handleSaveEdit} className="bg-green-500 text-white px-2 py-1 rounded">שמור</button>
                                        <button onClick={() => setEditingItem(null)} className="bg-gray-300 px-2 py-1 rounded">ביטול</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(item)} className="bg-yellow-400 px-2 py-1 rounded">ערוך</button>
                                        <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white px-2 py-1 rounded">מחק</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* טופס הוספת פריט חדש */}
            <div className="mt-6 p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">הוסף פריט חדש</h3>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <label className="w-32 font-medium">מוצר:</label>
                    <select
                        value={newItem.product_id}
                        onChange={(e) => {
                            const selectedProduct = products.find(p => p.id === Number(e.target.value));
                            setNewItem({
                                ...newItem,
                                product_id: selectedProduct.id,
                                name: selectedProduct.name,
                                unit_price: selectedProduct.price,
                            });
                        }}
                        className="border p-1 rounded flex-1"
                    >
                        <option value="">בחר מוצר</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <label className="w-32 font-medium">כמות:</label>
                    <input
                        type="number"
                        placeholder="לדוגמה: 3"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                        className="border p-1 rounded w-24"
                    />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <label className="w-32 font-medium">מחיר ליחידה:</label>
                    <input
                        type="number"
                        value={newItem.unit_price}
                        readOnly
                        className="border p-1 rounded w-24 bg-gray-100"
                    />
                </div>

                <button
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-4 py-1 rounded mt-2"
                >
                    הוסף
                </button>
            </div>
        </div>
    );
};

export default OrderDetails;
