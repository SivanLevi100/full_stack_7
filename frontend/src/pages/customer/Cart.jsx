// src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  ArrowRight,
  AlertCircle,
  Tag,
  Truck
} from 'lucide-react';
import { cartAPI, ordersAPI, productsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Cart = () => {
  console.log("🚀 Cart component rendered!");
  const [cartData, setCartData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    phone: '',
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartAPI.getItems(); //בעיה כאן - לא מקבל את העגלה מהשרת
      //const data = await productsAPIAPI.getAll();
      setCartData(data);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('שגיאה בטעינת העגלה');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      const data = await cartAPI.updateQuantity(productId, newQuantity);
      setCartData(data);
      toast.success('הכמות עודכנה בהצלחה');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('שגיאה בעדכון הכמות');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    if (!window.confirm('האם אתה בטוח שברצונך להסיר את המוצר מהעגלה?')) {
      return;
    }

    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await cartAPI.removeItem(productId);
      await loadCart();
      toast.success('המוצר הוסר מהעגלה');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('שגיאה בהסרת המוצר');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearCart = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך לרוקן את העגלה?')) {
      return;
    }

    try {
      await cartAPI.clear();
      setCartData({ items: [], total: 0 });
      toast.success('העגלה רוקנה בהצלחה');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('שגיאה בריקון העגלה');
    }
  };

  const proceedToCheckout = async () => {
    if (cartData.items.length === 0) {
      toast.error('העגלה ריקה');
      return;
    }

    if (!deliveryInfo.address || !deliveryInfo.phone) {
      toast.error('אנא מלא את פרטי המשלוח');
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderData = {
        total_amount: cartData.total,
        delivery_address: deliveryInfo.address,
        delivery_phone: deliveryInfo.phone,
        notes: deliveryInfo.notes,
        items: cartData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price
        }))
      };

      const order = await ordersAPI.create(orderData);
      toast.success('ההזמנה נוצרה בהצלחה!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('שגיאה ביצירת ההזמנה');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const deliveryFee = cartData.total > 100 ? 0 : 15;
  const finalTotal = cartData.total + deliveryFee;

  return (
    <div className="space-y-6">
      {/* כותרת */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">עגלת הקניות שלי</h1>
            <p className="text-green-100">
              {cartData.items.length > 0 
                ? `${cartData.items.length} מוצרים בעגלה` 
                : 'העגלה ריקה'
              }
            </p>
          </div>
          {cartData.items.length > 0 && (
            <button
              onClick={clearCart}
              className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              רוקן עגלה
            </button>
          )}
        </div>
      </div>

      {cartData.items.length === 0 ? (
        /* עגלה ריקה */
        <div className="text-center py-16 bg-white rounded-xl">
          <ShoppingCart className="mx-auto h-24 w-24 text-gray-300 mb-6" />
          <h3 className="text-2xl font-medium text-gray-900 mb-3">
            העגלה שלך ריקה
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            נראה שעוד לא הוספת מוצרים לעגלה. בוא נמצא לך משהו מעניין!
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
            התחל לקנות
          </Link>
        </div>
      ) : (
        /* עגלה עם מוצרים */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* רשימת מוצרים */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-4">
              <h2 className="text-xl font-semibold mb-4">המוצרים שלי</h2>
              {cartData.items.map(item => (
                <CartItem
                  key={item.product_id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  isUpdating={updating[item.product_id]}
                />
              ))}
            </div>
          </div>

          {/* סיכום הזמנה */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-6 space-y-6">
              <h3 className="text-xl font-semibold">סיכום ההזמנה</h3>
              
              {/* סיכום מחירים */}
              <div className="space-y-3 py-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">סך ביניים:</span>
                  <span>₪{cartData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">משלוח:</span>
                  <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                    {deliveryFee === 0 ? 'חינם' : `₪${deliveryFee}`}
                  </span>
                </div>
                {cartData.total < 100 && deliveryFee > 0 && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
                    <Tag className="h-4 w-4" />
                    הוסף ₪{(100 - cartData.total).toFixed(2)} למשלוח חינם
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>סך הכל:</span>
                  <span>₪{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* פרטי משלוח */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  פרטי משלוח
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    כתובת משלוח *
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="רחוב, מספר בית, עיר"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    טלפון ליצירת קשר *
                  </label>
                  <input
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="05X-XXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    הערות (אופציונלי)
                  </label>
                  <textarea
                    value={deliveryInfo.notes}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="הערות למשלוח..."
                    rows="3"
                  />
                </div>
              </div>

              {/* כפתורים */}
              <div className="space-y-3">
                <button
                  onClick={proceedToCheckout}
                  disabled={isCheckingOut || !deliveryInfo.address || !deliveryInfo.phone}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      מעבד הזמנה...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      אשר הזמנה
                    </>
                  )}
                </button>

                <Link
                  to="/shop"
                  className="w-full py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight className="h-5 w-5" />
                  המשך קנייה
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// רכיב פריט בעגלה
const CartItem = ({ item, onUpdateQuantity, onRemove, isUpdating }) => {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    setLocalQuantity(newQuantity);
    onUpdateQuantity(item.product_id, newQuantity);
  };

  const isOutOfStock = item.stock_quantity < localQuantity;

  return (
    <div className={`flex items-center gap-4 p-4 border-b last:border-b-0 ${isUpdating ? 'opacity-50' : ''}`}>
      {/* תמונת מוצר */}
      <div className="flex-shrink-0">
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="h-8 w-8" />
            </div>
          )}
        </div>
      </div>

      {/* פרטי מוצר */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
        <p className="text-sm text-gray-600">₪{parseFloat(item.price).toFixed(2)} ליחידה</p>
        
        {isOutOfStock && (
          <div className="flex items-center mt-1 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 ml-1" />
            במלאי רק {item.stock_quantity} יחידות
          </div>
        )}
      </div>

      {/* בקרת כמות */}
      <div className="flex items-center bg-gray-100 rounded-lg">
        <button
          onClick={() => handleQuantityChange(localQuantity - 1)}
          disabled={isUpdating || localQuantity <= 1}
          className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <span className="min-w-[3rem] text-center font-medium py-2">
          {localQuantity}
        </span>
        
        <button
          onClick={() => handleQuantityChange(localQuantity + 1)}
          disabled={isUpdating || localQuantity >= item.stock_quantity}
          className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* מחיר כולל */}
      <div className="text-right min-w-[100px]">
        <p className="font-medium text-lg">
          ₪{(parseFloat(item.price) * localQuantity).toFixed(2)}
        </p>
      </div>

      {/* כפתור הסרה */}
      <button
        onClick={() => onRemove(item.product_id)}
        disabled={isUpdating}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg disabled:opacity-50"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Cart;