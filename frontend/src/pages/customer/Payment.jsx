// // src/pages/Payment.jsx
// import React, { useState, useEffect } from 'react';
// import { cartAPI, ordersAPI, orderItemsAPI, authAPI } from '../../services/api';
// import toast from 'react-hot-toast';
// import { useNavigate, Link } from 'react-router-dom';
// import { CreditCard, ArrowLeft } from 'lucide-react';

// const Payment = () => {
//     const [cart, setCart] = useState({ items: [], total: '0.00' });
//     const [loading, setLoading] = useState(true);
//     const [processing, setProcessing] = useState(false);
//     const [cardName, setCardName] = useState('');
//     const [cardNumber, setCardNumber] = useState('');
//     const [expiry, setExpiry] = useState('');
//     const [cvv, setCvv] = useState('');
//     const navigate = useNavigate();

//     useEffect(() => {
//         loadCart();
//     }, []);

//     const loadCart = async () => {
//         try {
//             setLoading(true);
//             const data = await cartAPI.getItems();
//             setCart(data);
//         } catch (error) {
//             console.error('Error loading cart:', error);
//             toast.error('שגיאה בטעינת העגלה');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const isFormValid = () => {
//         if (!cardName || !cardNumber || !expiry || !cvv) {
//             toast.error('נא למלא את כל שדות הכרטיס');
//             return false;
//         }
//         // אפשר להוסיף כאן בדיקות נוספות כמו מספר כרטיס תקין, תוקף וכדומה
//         return true;
//     };

//     const handlePayment = async () => {
//         if (!isFormValid()) return;

//         try {
//             setProcessing(true);

//             // יצירת הזמנה חדשה
//             const orderData = {
//                 total_amount: parseFloat(cart.total),
//                 items: cart.items.map(item => ({
//                     product_id: item.product_id,
//                     quantity: item.quantity,
//                     //unit_price: 5
//                     unit_price: parseFloat(item.price)

//                 }))
//             };

//             console.log("from payment comp");
//             console.log(orderData);
//             await ordersAPI.create(orderData);

//             // ניקוי העגלה
//             await cartAPI.clear();

//             toast.success('התשלום בוצע וההזמנה נוצרה בהצלחה!');
//             navigate('/'); // החזרה לדף הבית או לדף ההזמנות
//         } catch (error) {
//             console.error('Payment/order creation error:', error);
//             toast.error('שגיאה בתשלום או ביצירת ההזמנה');
//         } finally {
//             setProcessing(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
//             </div>
//         );
//     }

//     if (cart.items.length === 0) {
//         return (
//             <div className="text-center py-12">
//                 <p className="text-gray-500 text-lg">העגלה ריקה</p>
//                 <Link
//                     to="/"
//                     className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                     חזור לחנות
//                     <ArrowLeft className="h-4 w-4" />
//                 </Link>
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-2xl mx-auto p-4 space-y-6">
//             <h1 className="text-3xl font-bold mb-4">תשלום</h1>

//             {/* סיכום הזמנה */}
//             <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
//                 <h2 className="font-semibold text-lg">סיכום הזמנה</h2>
//                 {cart.items.map(item => (
//                     <div key={item.product_id} className="flex justify-between">
//                         <span>{item.name} x {item.quantity}</span>
//                         <span>₪{(item.price * item.quantity).toFixed(2)}</span>
//                     </div>
//                 ))}
//                 <div className="flex justify-between font-bold border-t mt-2 pt-2">
//                     <span>סה״כ לתשלום:</span>
//                     <span>₪{parseFloat(cart.total).toFixed(2)}</span>
//                 </div>
//             </div>

//             {/* פרטי כרטיס */}
//             <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
//                 <h2 className="font-semibold text-lg">פרטי כרטיס</h2>
//                 <input
//                     type="text"
//                     placeholder="שם בעל הכרטיס"
//                     value={cardName}
//                     onChange={e => setCardName(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                 />
//                 <input
//                     type="text"
//                     placeholder="מספר כרטיס"
//                     value={cardNumber}
//                     onChange={e => setCardNumber(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                 />
//                 <div className="flex gap-2">
//                     <input
//                         type="text"
//                         placeholder="MM/YY"
//                         value={expiry}
//                         onChange={e => setExpiry(e.target.value)}
//                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
//                     />
//                     <input
//                         type="text"
//                         placeholder="CVV"
//                         value={cvv}
//                         onChange={e => setCvv(e.target.value)}
//                         className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
//                     />
//                 </div>
//             </div>

//             {/* כפתור תשלום */}
//             <button
//                 onClick={handlePayment}
//                 disabled={processing}
//                 className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
//             >
//                 {processing ? (
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                 ) : (
//                     <>
//                         <CreditCard className="h-5 w-5" />
//                         אשר תשלום
//                     </>
//                 )}
//             </button>
//         </div>
//     );
// };

// export default Payment;


// src/pages/Payment.jsx - עמוד תשלום משופר
import React, { useState, useEffect } from 'react';
import { cartAPI, ordersAPI, orderItemsAPI, authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, 
  ArrowLeft, 
  ShoppingCart, 
  Lock, 
  Package,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Truck
} from 'lucide-react';

const Payment = () => {
  const [cart, setCart] = useState({ items: [], total: '0.00' });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const navigate = useNavigate();

  // חישוב עלויות משלוח
  const calculateShipping = (subtotal) => {
    const SHIPPING_THRESHOLD = 50;
    const SHIPPING_COST = 20;
    return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  };

  const subtotal = parseFloat(cart.total);
  const shippingCost = calculateShipping(subtotal);
  const finalTotal = subtotal + shippingCost;
  const isEligibleForFreeShipping = subtotal >= 50;

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

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const isFormValid = () => {
    if (!cardName || !cardNumber || !expiry || !cvv) {
      toast.error('נא למלא את כל שדות הכרטיס');
      return false;
    }
    
    if (cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('מספר כרטיס לא תקין');
      return false;
    }
    
    if (cvv.length < 3) {
      toast.error('קוד CVV לא תקין');
      return false;
    }
    
    return true;
  };

  const handlePayment = async () => {
    if (!isFormValid()) return;

    try {
      setProcessing(true);

      const orderData = {
        total_amount: finalTotal,
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: parseFloat(item.price)
        }))
      };

      console.log("from payment comp");
      console.log(orderData);
      await ordersAPI.create(orderData);

      await cartAPI.clear();

      toast.success('התשלום בוצע והההזמנה נוצרה בהצלחה!');
      navigate('/my-orders');
    } catch (error) {
      console.error('Payment/order creation error:', error);
      toast.error('שגיאה בתשלום או ביצירת ההזמנה');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="cart-loading-spinner"></div>
        <p className="cart-loading-text">טוען עגלה...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="shop-page">
        <div className="shop-container">
          <div className="shop-empty-state">
            <ShoppingCart className="shop-empty-icon" />
            <h2 className="shop-empty-title">העגלה ריקה</h2>
            <p className="orders-empty-description">
              אין מוצרים בעגלה. חזור לחנות כדי להוסיף מוצרים.
            </p>
            <Link to="/shop" className="shop-empty-button">
              <ArrowLeft className="h-4 w-4" />
              חזור לחנות
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* כותרת התשלום */}
        <div className="cart-header">
          <div className="cart-header-content">
            <h1 className="cart-title">תשלום מאובטח</h1>
            <p className="cart-subtitle">
              בצע את התשלום בצורה מאובטחת וגמור את ההזמנה
            </p>
          </div>
        </div>

        <div className="payment-layout">
          {/* סיכום הזמנה */}
          <div className="payment-summary">
            <div className="cart-summary-card">
              <h3 className="cart-summary-title">
                <Package className="cart-summary-icon" />
                סיכום הזמנה
              </h3>

              {/* פריטים */}
              <div className="payment-items">
                {cart.items.map(item => (
                  <div key={item.product_id} className="payment-item">
                    <div className="payment-item-info">
                      <span className="payment-item-name">{item.name}</span>
                      <span className="payment-item-quantity">כמות: {item.quantity}</span>
                    </div>
                    <span className="payment-item-price">
                      ₪{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* פירוט מחירים */}
              <div className="cart-pricing-breakdown">
                <div className="cart-pricing-row">
                  <span className="cart-pricing-label">סך המוצרים</span>
                  <span className="cart-pricing-value">₪{subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-pricing-row">
                  <span className="cart-pricing-label">משלוח</span>
                  <span className={`cart-pricing-value ${shippingCost === 0 ? 'free' : ''}`}>
                    {shippingCost === 0 ? 'חינם' : `₪${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                
                {isEligibleForFreeShipping ? (
                  <div className="cart-delivery-info cart-delivery-success">
                    <Truck className="h-4 w-4" />
                    🎉 זכאי למשלוח חינם!
                  </div>
                ) : (
                  <div className="cart-delivery-info cart-delivery-warning">
                    <Truck className="h-4 w-4" />
                    הוסף עוד ₪{(50 - subtotal).toFixed(2)} וקבל משלוח חינם
                  </div>
                )}
              </div>

              <div className="cart-total-row">
                <span>סך הכל לתשלום</span>
                <span className="cart-total-value">₪{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* טופס תשלום */}
          <div className="payment-form-container">
            <div className="cart-summary-card">
              <h3 className="payment-form-title">
                <CreditCard className="h-6 w-6 text-primary-green" />
                פרטי כרטיס אשראי
                <div className="payment-security-badge">
                  <Lock className="h-4 w-4" />
                  מאובטח
                </div>
              </h3>

              <div className="payment-form">
                {/* שם בעל הכרטיס */}
                <div className="payment-form-group">
                  <label className="payment-form-label">שם בעל הכרטיס</label>
                  <input
                    type="text"
                    placeholder="שם מלא כפי שמופיע בכרטיס"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="payment-form-input"
                  />
                </div>

                {/* מספר כרטיס */}
                <div className="payment-form-group">
                  <label className="payment-form-label">מספר כרטיס</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="payment-form-input"
                    maxLength="19"
                  />
                </div>

                {/* תוקף ו-CVV */}
                <div className="payment-form-row">
                  <div className="payment-form-group">
                    <label className="payment-form-label">תוקף</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      className="payment-form-input"
                      maxLength="5"
                    />
                  </div>
                  <div className="payment-form-group">
                    <label className="payment-form-label">CVV</label>
                    <div className="payment-cvv-container">
                      <input
                        type={showCvv ? "text" : "password"}
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="payment-form-input"
                        maxLength="4"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCvv(!showCvv)}
                        className="payment-cvv-toggle"
                      >
                        {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* הודעת אבטחה */}
                <div className="payment-security-notice">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span>כל המידע מוצפן ומאובטח בתקני SSL</span>
                </div>

                {/* כפתור תשלום */}
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="cart-checkout-btn payment-btn"
                >
                  {processing ? (
                    <>
                      <div className="cart-loading-spinner" style={{width: '1.25rem', height: '1.25rem'}}></div>
                      מעבד תשלום...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      בצע תשלום ₪{finalTotal.toFixed(2)}
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* כפתור חזרה */}
                <Link to="/my-cart" className="cart-continue-shopping">
                  <ArrowLeft className="h-4 w-4" />
                  חזור לעגלה
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;