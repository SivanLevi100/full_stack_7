// // src/pages/MyCart.jsx
// import React, { useState, useEffect } from 'react';
// import { ShoppingCart, Plus, Minus, Trash2, CreditCard, ArrowUpRight } from 'lucide-react';
// import { cartAPI } from '../../services/api';
// import toast from 'react-hot-toast';
// import { Link } from 'react-router-dom'; // <-- משתמשים ב-Link

// const MyCart = () => {
//     const [cart, setCart] = useState({ items: [], total: '0.00' });
//     const [loading, setLoading] = useState(true);
//     const [updatingItems, setUpdatingItems] = useState({});

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

//     const updateQuantity = async (productId, quantity) => {
//         setUpdatingItems(prev => ({ ...prev, [productId]: true }));
//         try {
//             await cartAPI.updateQuantity(productId, quantity);
//             await loadCart();
//         } catch (error) {
//             console.error('Error updating quantity:', error);
//             toast.error('שגיאה בעדכון הכמות');
//         } finally {
//             setUpdatingItems(prev => ({ ...prev, [productId]: false }));
//         }
//     };

//     const removeItem = async (productId) => {
//         setUpdatingItems(prev => ({ ...prev, [productId]: true }));
//         try {
//             await cartAPI.removeItem(productId);
//             await loadCart();
//         } catch (error) {
//             console.error('Error removing item:', error);
//             toast.error('שגיאה בהסרת הפריט');
//         } finally {
//             setUpdatingItems(prev => ({ ...prev, [productId]: false }));
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6 p-4">
//             <h1 className="text-3xl font-bold mb-4">העגלה שלי</h1>

//             {cart.items.length === 0 ? (
//                 <div className="text-center py-12 bg-white rounded-xl">
//                     <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
//                     <p className="text-gray-500 text-lg">העגלה ריקה</p>
//                 </div>
//             ) : (
//                 <>
//                     <div className="space-y-4">
//                         {cart.items.map(item => (
//                             <CartItem
//                                 key={item.product_id}
//                                 item={item}
//                                 isUpdating={updatingItems[item.product_id]}
//                                 onUpdateQuantity={updateQuantity}
//                                 onRemove={removeItem}
//                             />
//                         ))}

//                         <div className="text-right text-2xl font-bold">
//                             סה״כ: ₪{parseFloat(cart.total).toFixed(2)}
//                         </div>

//                         {/* כפתור המשך לתשלום */}
//                         <div className="text-right mt-4">
//                             <Link
//                                 to="/payment"
//                                 className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//                             >
//                                 המשך לתשלום
//                                 <ArrowUpRight className="h-4 w-4" />
//                             </Link>
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// const CartItem = ({ item, isUpdating, onUpdateQuantity, onRemove }) => {
//     const [quantity, setQuantity] = useState(item.quantity);

//     const handleIncrement = () => {
//         const newQuantity = quantity + 1;
//         setQuantity(newQuantity);
//         onUpdateQuantity(item.product_id, newQuantity);
//     };

//     const handleDecrement = () => {
//         if (quantity > 1) {
//             const newQuantity = quantity - 1;
//             setQuantity(newQuantity);
//             onUpdateQuantity(item.product_id, newQuantity);
//         }
//     };

//     return (
//         <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//             <div className="flex items-center gap-4">
//                 {item.image_url ? (
//                     <img
//                         src={`http://localhost:3000${item.image_url}`}
//                         alt={item.name}
//                         className="h-48 object-cover mb-2 rounded"
//                     />
//                 ) : (
//                     <div className="h-48 bg-gray-200 flex items-center justify-center mb-2">
//                         No Image
//                     </div>
//                 )}
//                 <div>
//                     <h3 className="font-semibold">{item.name}</h3>
//                     <p className="text-gray-500">
//                         מחיר ליחידה: ₪{parseFloat(item.price).toFixed(2)}
//                     </p>
//                     <p className="text-gray-500">
//                         סך הכל עבור {item.quantity} יחידות: ₪{parseFloat(item.price * item.quantity).toFixed(2)}
//                     </p>

//                 </div>
//             </div>
//             <div className="flex items-center gap-2">
//                 <button
//                     onClick={handleDecrement}
//                     disabled={isUpdating || quantity <= 1}
//                     className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
//                 >
//                     <Minus className="h-4 w-4" />
//                 </button>
//                 <span className="px-4">{quantity}</span>
//                 <button
//                     onClick={handleIncrement}
//                     disabled={isUpdating}
//                     className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
//                 >
//                     <Plus className="h-4 w-4" />
//                 </button>
//                 <button
//                     onClick={() => onRemove(item.product_id)}
//                     disabled={isUpdating}
//                     className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//                 >
//                     <Trash2 className="h-4 w-4" />
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default MyCart;

// src/pages/MyCart.jsx - עמוד עגלה משופר
import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  ArrowUpRight,
  Package,
  Truck,
  AlertTriangle
} from 'lucide-react';
import { cartAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MyCart = () => {
  const [cart, setCart] = useState({ items: [], total: '0.00' });
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState({});

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
  const amountToFreeShipping = Math.max(0, 50 - subtotal);

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
      toast.success('הכמות עודכנה בהצלחה');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('שגיאה בעדכון הכמות');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  /*const removeItem = async (productId) => {
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    try {
      await cartAPI.removeItem(productId);
      await loadCart();
      toast.success('הפריט הוסר מהעגלה');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('שגיאה בהסרת הפריט');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };*/
  const removeItem = async (productId) => {
    if (!window.confirm('בטוח שאתה רוצה למחוק את המוצר הזה?')) return;

    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    try {
      await cartAPI.removeItem(productId);
      await loadCart();
      toast.success('הפריט הוסר מהעגלה');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('שגיאה בהסרת הפריט');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
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

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* כותרת העגלה */}
        <div className="cart-header">
          <div className="cart-header-content">
            <h1 className="cart-title">העגלה שלי</h1>
            <p className="cart-subtitle">
              {cart.items.length > 0
                ? `${cart.items.length} מוצרים נבחרו עבורך`
                : 'העגלה שלך ריקה כרגע'
              }
            </p>
          </div>
        </div>

        {cart.items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart className="cart-empty-icon" />
            <h2 className="cart-empty-title">העגלה ריקה</h2>
            <p className="cart-empty-description">
              נראה שעדיין לא הוספת מוצרים לעגלה שלך. בוא נמצא משהו מעניב עבורך!
            </p>
            <Link to="/shop" className="cart-empty-action">
              <ShoppingCart className="h-5 w-5" />
              התחל לקנות
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* רשימת מוצרים בעגלה */}
            <div className="cart-items-container">
              <div className="cart-items-title">
                <Package className="h-6 w-6 text-primary-green" />
                מוצרים בעגלה
                <span className="cart-items-count">{cart.items.length}</span>
              </div>

              <div className="cart-items-list">
                {cart.items.map(item => (
                  <CartItem
                    key={item.product_id}
                    item={item}
                    isUpdating={updatingItems[item.product_id]}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            {/* סיכום העגלה */}
            <div className="cart-summary">
              <div className="cart-summary-card">
                <h3 className="cart-summary-title">
                  <CreditCard className="cart-summary-icon" />
                  סיכום הזמנה
                </h3>

                {/* פירוט מחירים */}
                <div className="cart-pricing-breakdown">
                  <div className="cart-pricing-row">
                    <span className="cart-pricing-label">סך המוצרים</span>
                    <span className="cart-pricing-value">
                      ₪{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="cart-pricing-row">
                    <span className="cart-pricing-label">משלוח</span>
                    <span className={`cart-pricing-value ${shippingCost === 0 ? 'free' : ''}`}>
                      {shippingCost === 0 ? 'חינם' : `₪${shippingCost.toFixed(2)}`}
                    </span>
                  </div>

                  {/* הודעת משלוח */}
                  {isEligibleForFreeShipping ? (
                    <div className="cart-delivery-info cart-delivery-success">
                      <Truck className="h-4 w-4" />
                      🎉 זכאי למשלוח חינם!
                    </div>
                  ) : (
                    <div className="cart-delivery-info cart-delivery-warning">
                      <Truck className="h-4 w-4" />
                      הוסף עוד ₪{amountToFreeShipping.toFixed(2)} וקבל משלוח חינם
                    </div>
                  )}
                </div>

                {/* סך הכל */}
                <div className="cart-total-row">
                  <span>סך הכל לתשלום</span>
                  <span className="cart-total-value">
                    ₪{finalTotal.toFixed(2)}
                  </span>
                </div>

                {/* כפתורי פעולה */}
                <div className="cart-actions">
                  <Link to="/payment" className="cart-checkout-btn">
                    <CreditCard className="h-5 w-5" />
                    המשך לתשלום
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>

                  <Link to="/shop" className="cart-continue-shopping">
                    <ShoppingCart className="h-4 w-4" />
                    המשך קנייה
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// רכיב פריט בעגלה משופר
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

  const handleRemove = () => {
    onRemove(item.product_id);
  };

  const isLowStock = item.stock_quantity <= 5 && item.stock_quantity > 0;
  const unitPrice = parseFloat(item.price);
  const totalPrice = unitPrice * quantity;

  return (
    <div className={`cart-item ${isUpdating ? 'updating' : ''} cart-item-enter`}>
      {/* תמונת מוצר */}
      <div className="cart-item-image">
        {item.image_url ? (
          <img
            src={`http://localhost:3000${item.image_url}`}
            alt={item.name}
            loading="lazy"
          />
        ) : (
          <div className="cart-item-image-placeholder">
            <Package className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* פרטי המוצר */}
      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.name}</h3>

        <div className="cart-item-price-info">
          <div className="cart-item-unit-price">
            מחיר ליחידה: ₪{unitPrice.toFixed(2)}
          </div>
          <div className="cart-item-total-price">
            סך הכל עבור {quantity} יחידות: ₪{totalPrice.toFixed(2)}
          </div>
        </div>

        {/* אזהרת מלאי נמוך */}
        {isLowStock && (
          <div className="cart-item-stock-warning">
            <AlertTriangle className="h-3 w-3" />
            נותרו רק {item.stock_quantity} יחידות במלאי
          </div>
        )}
      </div>

      {/* בקרות המוצר */}
      <div className="cart-item-controls">
        {/* בקרת כמות */}
        <div className="cart-quantity-control">
          <button
            onClick={handleDecrement}
            disabled={isUpdating || quantity <= 1}
            className="cart-quantity-btn"
            aria-label="הקטן כמות"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="cart-quantity-display" aria-label={`כמות: ${quantity}`}>
            {quantity}
          </span>

          <button
            onClick={handleIncrement}
            disabled={isUpdating || quantity >= item.stock_quantity}
            className="cart-quantity-btn"
            aria-label="הגדל כמות"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* כפתור הסרה */}
        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="cart-item-remove"
          aria-label={`הסר את ${item.name} מהעגלה`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MyCart;
