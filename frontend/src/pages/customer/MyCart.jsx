// src/pages/MyCart.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, ArrowUpRight } from 'lucide-react';
import { cartAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom'; // <-- משתמשים ב-Link

const MyCart = () => {
    const [cart, setCart] = useState({ items: [], total: '0.00' });
    const [loading, setLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState({});

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await cartAPI.getItems();
            setCart(data);
        } catch (error) {
            console.error('Error loading cart:', error);
            toast.error('שגיאה בטעינת העגלה');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        setUpdatingItems(prev => ({ ...prev, [productId]: true }));
        try {
            await cartAPI.updateQuantity(productId, quantity);
            await loadCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('שגיאה בעדכון הכמות');
        } finally {
            setUpdatingItems(prev => ({ ...prev, [productId]: false }));
        }
    };

    const removeItem = async (productId) => {
        setUpdatingItems(prev => ({ ...prev, [productId]: true }));
        try {
            await cartAPI.removeItem(productId);
            await loadCart();
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('שגיאה בהסרת הפריט');
        } finally {
            setUpdatingItems(prev => ({ ...prev, [productId]: false }));
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
        <div className="space-y-6 p-4">
            <h1 className="text-3xl font-bold mb-4">העגלה שלי</h1>

            {cart.items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                    <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">העגלה ריקה</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {cart.items.map(item => (
                            <CartItem
                                key={item.product_id}
                                item={item}
                                isUpdating={updatingItems[item.product_id]}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                            />
                        ))}

                        <div className="text-right text-2xl font-bold">
                            סה״כ: ₪{parseFloat(cart.total).toFixed(2)}
                        </div>

                        {/* כפתור המשך לתשלום */}
                        <div className="text-right mt-4">
                            <Link
                                to="/payment"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                המשך לתשלום
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const CartItem = ({ item, isUpdating, onUpdateQuantity, onRemove }) => {
    const [quantity, setQuantity] = useState(item.quantity);

    const handleIncrement = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        onUpdateQuantity(item.product_id, newQuantity);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            onUpdateQuantity(item.product_id, newQuantity);
        }
    };

    return (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
                {item.image_url ? (
                    <img
                        src={`http://localhost:3000${item.image_url}`}
                        alt={item.name}
                        className="h-48 object-cover mb-2 rounded"
                    />
                ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center mb-2">
                        No Image
                    </div>
                )}
                <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-500">
                        מחיר ליחידה: ₪{parseFloat(item.price).toFixed(2)}
                    </p>
                    <p className="text-gray-500">
                        סך הכל עבור {item.quantity} יחידות: ₪{parseFloat(item.price * item.quantity).toFixed(2)}
                    </p>

                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleDecrement}
                    disabled={isUpdating || quantity <= 1}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <span className="px-4">{quantity}</span>
                <button
                    onClick={handleIncrement}
                    disabled={isUpdating}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    <Plus className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onRemove(item.product_id)}
                    disabled={isUpdating}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default MyCart;
