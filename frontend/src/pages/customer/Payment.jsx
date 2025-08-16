// src/pages/Payment.jsx
import React, { useState, useEffect } from 'react';
import { cartAPI, ordersAPI, orderItemsAPI, authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, ArrowLeft } from 'lucide-react';

const Payment = () => {
    const [cart, setCart] = useState({ items: [], total: '0.00' });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const navigate = useNavigate();

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

    const isFormValid = () => {
        if (!cardName || !cardNumber || !expiry || !cvv) {
            toast.error('נא למלא את כל שדות הכרטיס');
            return false;
        }
        // אפשר להוסיף כאן בדיקות נוספות כמו מספר כרטיס תקין, תוקף וכדומה
        return true;
    };

    const handlePayment = async () => {
        if (!isFormValid()) return;

        try {
            setProcessing(true);

            // יצירת הזמנה חדשה
            const orderData = {
                total_amount: parseFloat(cart.total),
                items: cart.items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    //unit_price: 5
                    unit_price: parseFloat(item.price)

                }))
            };

            console.log("from payment comp");
            console.log(orderData);
            await ordersAPI.create(orderData);

            // ניקוי העגלה
            await cartAPI.clear();

            toast.success('התשלום בוצע וההזמנה נוצרה בהצלחה!');
            navigate('/'); // החזרה לדף הבית או לדף ההזמנות
        } catch (error) {
            console.error('Payment/order creation error:', error);
            toast.error('שגיאה בתשלום או ביצירת ההזמנה');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (cart.items.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">העגלה ריקה</p>
                <Link
                    to="/"
                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    חזור לחנות
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold mb-4">תשלום</h1>

            {/* סיכום הזמנה */}
            <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
                <h2 className="font-semibold text-lg">סיכום הזמנה</h2>
                {cart.items.map(item => (
                    <div key={item.product_id} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>₪{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="flex justify-between font-bold border-t mt-2 pt-2">
                    <span>סה״כ לתשלום:</span>
                    <span>₪{parseFloat(cart.total).toFixed(2)}</span>
                </div>
            </div>

            {/* פרטי כרטיס */}
            <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                <h2 className="font-semibold text-lg">פרטי כרטיס</h2>
                <input
                    type="text"
                    placeholder="שם בעל הכרטיס"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                    type="text"
                    placeholder="מספר כרטיס"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={e => setExpiry(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="text"
                        placeholder="CVV"
                        value={cvv}
                        onChange={e => setCvv(e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>

            {/* כפתור תשלום */}
            <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
                {processing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <>
                        <CreditCard className="h-5 w-5" />
                        אשר תשלום
                    </>
                )}
            </button>
        </div>
    );
};

export default Payment;
