/**
 * Payment.jsx - Enhanced Secure Payment Page
 * 
 * This component provides a comprehensive and secure payment experience featuring:
 * - Order summary with shipping calculations
 * - Secure credit card form with input formatting
 * - Form validation with user feedback
 * - Free shipping promotions and notifications
 * - SSL security indicators and user trust elements
 * - Integration with cart and orders APIs
 * - Responsive design with loading states
 * - Proper accessibility and error handling
 */

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

  // Credit card form fields
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);

  const navigate = useNavigate();

  /**
   * Calculate shipping cost based on order subtotal
   * Free shipping for orders over ₪50, otherwise ₪20 shipping fee
   * 
   * @param {number} subtotal - Order subtotal amount
   * @returns {number} Shipping cost
   */
  const calculateShipping = (subtotal) => {
    const SHIPPING_THRESHOLD = 50;
    const SHIPPING_COST = 20;
    return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  };

  // Calculate order totals and shipping eligibility
  const subtotal = parseFloat(cart.total);
  const shippingCost = calculateShipping(subtotal);
  const finalTotal = subtotal + shippingCost;
  const isEligibleForFreeShipping = subtotal >= 50;

  useEffect(() => {
    loadCart();
  }, []);

  /**
   * Load cart data from API
   * Redirects to shop if cart is empty
   */
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

  /**
   * Format credit card number with spaces
   * Adds spaces every 4 digits for better readability
   * 
   * @param {string} value - Raw card number input
   * @returns {string} Formatted card number
   */
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

  /**
   * Format expiry date as MM/YY
   * Automatically adds slash after 2 digits
   * 
   * @param {string} value - Raw expiry input
   * @returns {string} Formatted expiry date
   */
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  /**
   * Validate payment form
   * Checks all required fields and formats
   * 
   * @returns {boolean} Whether form is valid
   */
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

  /**
   * Process payment and create order
   * Validates form, creates order, clears cart, and redirects
   */
  const handlePayment = async () => {
    if (!isFormValid()) return;

    try {
      setProcessing(true);

      // Create order data with final total including shipping
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

      // Create order via API
      await ordersAPI.create(orderData);

      // Clear cart after successful payment
      await cartAPI.clear();

      toast.success('התשלום בוצע וההזמנה נוצרה בהצלחה!');
      navigate('/my-orders');
    } catch (error) {
      console.error('Payment/order creation error:', error);
      toast.error('שגיאה בתשלום או ביצירת ההזמנה');
    } finally {
      setProcessing(false);
    }
  };

  // Loading state component
  if (loading) {
    return (
      <div className="cart-loading">
        <div className="cart-loading-spinner"></div>
        <p className="cart-loading-text">טוען עגלה...</p>
      </div>
    );
  }

  // Empty cart state
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
        {/* Payment Header */}
        <div className="cart-header">
          <div className="cart-header-content">
            <h1 className="cart-title">תשלום מאובטח</h1>
            <p className="cart-subtitle">
              בצע את התשלום בצורה מאובטחת וגמור את ההזמנה
            </p>
          </div>
        </div>

        <div className="payment-layout">
          {/* Order Summary */}
          <div className="payment-summary">
            <div className="cart-summary-card">
              <h3 className="cart-summary-title">
                <Package className="cart-summary-icon" />
                סיכום הזמנה
              </h3>

              {/* Order Items */}
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

              {/* Price Breakdown */}
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

                {/* Shipping notification */}
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

              {/* Final Total */}
              <div className="cart-total-row">
                <span>סך הכל לתשלום</span>
                <span className="cart-total-value">₪{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
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
                {/* Cardholder Name */}
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

                {/* Card Number */}
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

                {/* Expiry and CVV */}
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

                {/* Security Notice */}
                <div className="payment-security-notice">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span>כל המידע מוצפן ומאובטח בתקני SSL</span>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="cart-checkout-btn payment-btn"
                >
                  {processing ? (
                    <>
                      <div className="cart-loading-spinner" style={{ width: '1.25rem', height: '1.25rem' }}></div>
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

                {/* Back to Cart Button */}
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