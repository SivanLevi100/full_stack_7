/**
 * MyCart.jsx - Enhanced Shopping Cart Page
 * 
 * This component provides a comprehensive shopping cart experience featuring:
 * - Cart items display with quantity controls
 * - Price breakdown with shipping calculations
 * - Free shipping promotions and notifications
 * - Item removal with confirmation dialog
 * - Responsive design with loading states
 * - Integration with payment flow
 */

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

  // Calculate cart totals and shipping eligibility
  const subtotal = parseFloat(cart.total);
  const shippingCost = calculateShipping(subtotal);
  const finalTotal = subtotal + shippingCost;
  const isEligibleForFreeShipping = subtotal >= 50;
  const amountToFreeShipping = Math.max(0, 50 - subtotal);

  useEffect(() => {
    loadCart();
  }, []);

  /**
   * Load cart data from API
   * Handles errors gracefully and shows user feedback
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
   * Update item quantity in cart
   * Provides visual feedback during update process
   * 
   * @param {number} productId - Product ID to update
   * @param {number} quantity - New quantity value
   */
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

  /**
   * Remove item from cart with confirmation dialog
   * Uses custom toast confirmation instead of window.confirm for better UX
   * 
   * @param {number} productId - Product ID to remove
   * @param {string} productName - Product name for confirmation message
   */
  const removeItem = async (productId, productName) => {
    const deleteItem = async () => {
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

    // Custom toast confirmation dialog instead of window.confirm
    toast((t) => (
      <div className="cart-toast-delete-overlay">
        <div className="cart-toast-delete-header">
          <AlertTriangle size={24} />
          הסרת פריט מהעגלה
        </div>
        
        <div className="cart-toast-delete-content">
          האם אתה בטוח שברצונך להסיר את הפריט<br />
          <strong> </strong> מהעגלה?
        </div>
        
        <div className="cart-toast-delete-buttons">
          <button
            onClick={() => {
              deleteItem();
              toast.dismiss(t.id);
            }}
            className="cart-toast-delete-confirm"
          >
            כן, הסר
          </button>
          
          <button
            onClick={() => toast.dismiss(t.id)}
            className="cart-toast-delete-cancel"
          >
            ביטול
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      className: 'cart-toast-delete-custom',
      position: 'top-center',
      dismissible: false
    });
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

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Cart Header */}
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
          // Empty cart state
          <div className="cart-empty">
            <ShoppingCart className="cart-empty-icon" />
            <h2 className="cart-empty-title">העגלה ריקה</h2>
            <p className="cart-empty-description">
              נראה שעדיין לא הוספת מוצרים לעגלה שלך. בואו נמצא משהו עבורך!
            </p>
            <Link to="/shop" className="cart-empty-action">
              <ShoppingCart className="h-5 w-5" />
              התחל לקנות
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items List */}
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

            {/* Cart Summary */}
            <div className="cart-summary">
              <div className="cart-summary-card">
                <h3 className="cart-summary-title">
                  <CreditCard className="cart-summary-icon" />
                  סיכום הזמנה
                </h3>

                {/* Price Breakdown */}
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

                  {/* Shipping notifications */}
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

                {/* Total Amount */}
                <div className="cart-total-row">
                  <span>סך הכל לתשלום</span>
                  <span className="cart-total-value">
                    ₪{finalTotal.toFixed(2)}
                  </span>
                </div>

                {/* Action buttons */}
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

/**
 * Enhanced Cart Item Component
 * Displays individual cart item with quantity controls and remove option
 * 
 * @param {Object} item - Cart item object
 * @param {boolean} isUpdating - Whether the item is currently being updated
 * @param {Function} onUpdateQuantity - Callback for quantity updates
 * @param {Function} onRemove - Callback for item removal
 */
const CartItem = ({ item, isUpdating, onUpdateQuantity, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  /**
   * Handle quantity increment
   * Ensures quantity doesn't exceed stock
   */
  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onUpdateQuantity(item.product_id, newQuantity);
  };

  /**
   * Handle quantity decrement
   * Ensures minimum quantity of 1
   */
  const handleDecrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onUpdateQuantity(item.product_id, newQuantity);
    }
  };

  /**
   * Handle item removal
   * Passes product ID to parent component
   */
  const handleRemove = () => {
    onRemove(item.product_id);
  };

  const isLowStock = item.stock_quantity <= 5 && item.stock_quantity > 0;
  const unitPrice = parseFloat(item.price);
  const totalPrice = unitPrice * quantity;

  return (
    <div className={`cart-item ${isUpdating ? 'updating' : ''} cart-item-enter`}>
      {/* Product Image */}
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

      {/* Product Details */}
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

        {/* Low stock warning */}
        {isLowStock && (
          <div className="cart-item-stock-warning">
            <AlertTriangle className="h-3 w-3" />
            נותרו רק {item.stock_quantity} יחידות במלאי
          </div>
        )}
      </div>

      {/* Product Controls */}
      <div className="cart-item-controls">
        {/* Quantity Control */}
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

        {/* Remove Button */}
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