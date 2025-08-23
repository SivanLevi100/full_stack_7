/**
 * Shop.jsx - Enhanced Shopping Page
 * 
 * This component provides a comprehensive shopping experience featuring:
 * - Product browsing with search and filtering capabilities
 * - Category-based filtering and sorting options
 * - Price range filtering with min/max inputs
 * - Real-time search with instant results
 * - Product cards with quantity controls and cart integration
 * - Stock management with low stock warnings
 * - Responsive grid layout with empty states
 * - Advanced filtering with collapsible interface
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Plus, Minus, Star, X } from 'lucide-react';
import { productsAPI, categoriesAPI, cartAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartUpdating, setCartUpdating] = useState({});
  
  // Filter and search state
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortOrder: 'ASC'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  /**
   * Load initial shop data
   * Fetches products and categories from API
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading shop data:', error);
      toast.error('שגיאה בטעינת נתוני החנות');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply all active filters and sorting to products list
   * Filters by category, search term, price range, and applies sorting
   */
  const applyFilters = () => {
    let filtered = [...products];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(product =>
        product.category_id === parseInt(filters.category)
      );
    }

    // Filter by search term (case-insensitive)
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by minimum price
    if (filters.minPrice) {
      filtered = filtered.filter(product =>
        parseFloat(product.price) >= parseFloat(filters.minPrice)
      );
    }

    // Filter by maximum price
    if (filters.maxPrice) {
      filtered = filtered.filter(product =>
        parseFloat(product.price) <= parseFloat(filters.maxPrice)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      // Handle numeric sorting for price
      if (filters.sortBy === 'price') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (filters.sortOrder === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  };

  /**
   * Handle filter changes
   * Updates filter state and triggers re-filtering
   * 
   * @param {string} key - Filter key to update
   * @param {string|number} value - New filter value
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Add product to cart
   * Provides visual feedback and handles API errors
   * 
   * @param {number} productId - Product ID to add
   * @param {number} quantity - Quantity to add (default: 1)
   */
  const addToCart = async (productId, quantity = 1) => {
    setCartUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await cartAPI.addItem(productId, quantity);
      toast.success('המוצר נוסף לעגלה!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('שגיאה בהוספה לעגלה');
    } finally {
      setCartUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  /**
   * Reset all filters to default values
   * Clears all search and filter criteria
   */
  const resetFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'name',
      sortOrder: 'ASC'
    });
  };

  // Loading state component
  if (loading) {
    return (
      <div className="shop-loading">
        <div className="shop-loading-spinner"></div>
        <p className="shop-loading-text">טוען מוצרים...</p>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-container">
        {/* Shop Header */}
        <div className="shop-header">
          <div className="shop-header-content">
            <h1 className="shop-header-title">החנות שלנו</h1>
            <p className="shop-header-subtitle">
              גלה את המוצרים הטובים ביותר במחירים הכי טובים
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="shop-filters">
          <div className="shop-filters-main">
            {/* Search Input */}
            <div className="shop-search-container">
              <input
                type="text"
                placeholder="חפש מוצרים..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="shop-search-input"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="shop-select"
            >
              <option value="">כל הקטגוריות</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="shop-select"
            >
              <option value="name-ASC">שם (א-ת)</option>
              <option value="name-DESC">שם (ת-א)</option>
              <option value="price-ASC">מחיר (נמוך-גבוה)</option>
              <option value="price-DESC">מחיר (גבוה-נמוך)</option>
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`shop-filters-toggle ${showFilters ? 'active' : ''}`}
            >
              <Filter className="h-4 w-4" />
              פילטרים
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="shop-advanced-filters">
              <div className="shop-advanced-filters-grid">
                <div className="shop-filter-group">
                  <label className="shop-filter-label">מחיר מינימום</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="shop-filter-input"
                  />
                </div>
                <div className="shop-filter-group">
                  <label className="shop-filter-label">מחיר מקסימום</label>
                  <input
                    type="number"
                    placeholder="999"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="shop-filter-input"
                  />
                </div>
                <button
                  onClick={resetFilters}
                  className="shop-reset-button"
                >
                  איפוס
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="shop-results-header">
          <p className="shop-results-count">
            נמצאו {filteredProducts.length} מוצרים
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="shop-products-grid">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                isUpdating={cartUpdating[product.id]}
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="shop-empty-state">
            <ShoppingCart className="shop-empty-icon" />
            <p className="shop-empty-title">לא נמצאו מוצרים המתאימים לחיפוש</p>
            <button
              onClick={resetFilters}
              className="shop-empty-button"
            >
              נקה סינונים
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Enhanced Product Card Component
 * Displays individual product with interactive elements
 * 
 * @param {Object} product - Product object with details
 * @param {Function} onAddToCart - Callback for adding to cart
 * @param {boolean} isUpdating - Whether the product is being added to cart
 */
const ProductCard = ({ product, onAddToCart, isUpdating }) => {
  const [quantity, setQuantity] = useState(1);

  /**
   * Handle add to cart action
   * Calls parent callback with current quantity
   */
  const handleAddToCart = () => {
    onAddToCart(product.id, quantity);
  };

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity <= 5 && product.stock_quantity > 0;

  return (
    <div className="product-card">
      {/* Product Image Container */}
      <div className="product-card-image-container">
        {/* Stock Status Badges */}
        {isLowStock && (
          <div className="product-card-badge">
            נותרו {product.stock_quantity}
          </div>
        )}
        {isOutOfStock && (
          <div className="product-card-badge product-card-badge--out-of-stock">
            אזל מהמלאי
          </div>
        )}
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="product-card-overlay">
            <span className="product-card-overlay-text">אזל מהמלאי</span>
          </div>
        )}
        
        {/* Product Image */}
        {product.image_url ? (
          <img 
            src={`http://localhost:3000${product.image_url}`} 
            alt={product.name} 
            className="product-card-image"
            loading="lazy"
          />
        ) : (
          <div className="product-card-no-image">
            אין תמונה
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="product-card-content">
        {/* Product Header */}
        <div className="product-card-header">
          <h3 className="product-card-title">
            {product.name}
          </h3>
          <p className="product-card-category">{product.category_name}</p>
        </div>

        {/* Price and Rating - Commented out as requested in original
        <div className="product-card-meta">
          <span className="product-card-price">
            ₪{parseFloat(product.price).toFixed(2)}
          </span>
          <div className="product-card-rating">
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4" />
          </div>
        </div> */}

        {/* Product Actions - Only show if in stock */}
        {!isOutOfStock && (
          <div className="product-card-actions">
            {/* Quantity Control */}
            <div className="product-card-quantity">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="product-card-quantity-btn"
                aria-label="הקטן כמות"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="product-card-quantity-value">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                className="product-card-quantity-btn"
                aria-label="הגדל כמות"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isUpdating}
              className="product-card-add-btn"
              aria-label={`הוסף ${product.name} לעגלה`}
            >
              {isUpdating ? (
                <div className="product-card-spinner"></div>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  הוסף לעגלה
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;