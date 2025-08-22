// src/pages/Products.jsx - עמוד ניהול מוצרים עם toast למחיקה
import React, { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '../../services/api';
import { Plus, Trash2, Edit, AlertCircle, X, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        price: '',
        stock_quantity: '',
        image: null,
    });

    // --- סינון ---
    const [filters, setFilters] = useState({
        category_id: '',
        minPrice: '',
        maxPrice: '',
        minStock: '',
        maxStock: '',
        stock: '',
        stockMin: null,
        stockMax: null,
        priceSort: ''
    });

    useEffect(() => {
        loadData();
    }, []);

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
            console.error('Error loading products:', error);
            toast.error('שגיאה בטעינת המוצרים');
        } finally {
            setLoading(false);
        }
    };

    // --- סינון לפי שדות ---
    let filteredProducts = products.filter(p => {
        const matchCategory = filters.category_id ? p.category_id === parseInt(filters.category_id) : true;

        // המרת מחירים למספרים
        const productPrice = parseFloat(p.price);
        const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : null;
        const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : null;

        const matchPriceMin = minPrice != null ? productPrice >= minPrice : true;
        const matchPriceMax = maxPrice != null ? productPrice <= maxPrice : true;

        // סינון מלאי
        const matchStockMin = filters.stockMin != null ? p.stock_quantity >= filters.stockMin : true;
        const matchStockMax = filters.stockMax != null ? p.stock_quantity <= filters.stockMax : true;

        return matchCategory && matchPriceMin && matchPriceMax && matchStockMin && matchStockMax;
    });

    // --- מיון לפי מחיר ---
    if (filters.priceSort === 'asc') {
        filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (filters.priceSort === 'desc') {
        filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // --- פתיחת מודל ---
    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', category_id: '', price: '', stock_quantity: '', image: null });
        setModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category_id: product.category_id,
            price: product.price,
            stock_quantity: product.stock_quantity,
            image: null
        });
        setModalOpen(true);
    };

    // --- שינוי שדות ---
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData(prev => ({ ...prev, image: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- שמירה ---
    const handleSave = async () => {
        try {
            const data = new FormData();
            data.append('name', formData.name ?? '');
            data.append('category_id', formData.category_id ?? null);
            data.append('price', formData.price ?? 0);
            data.append('stock_quantity', formData.stock_quantity ?? 0);
            if (formData.image) data.append('image', formData.image);

            let savedProduct;
            if (editingProduct) {
                savedProduct = await productsAPI.update(editingProduct.id, data);
                setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
                toast.success('המוצר עודכן בהצלחה');
            } else {
                savedProduct = await productsAPI.create(data);
                setProducts([savedProduct, ...products]);
                toast.success('המוצר נוסף בהצלחה');
            }
            setModalOpen(false);
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('שגיאה בשמירת המוצר');
        }
    };

    // --- מחיקה עם Toast מותאם ---
    const handleDelete = async (product) => {
        const deleteProduct = async () => {
            try {
                await productsAPI.delete(product.id);
                setProducts(products.filter(p => p.id !== product.id));
                toast.success(`המוצר "${product.name}" נמחק בהצלחה`, {
                    duration: 3000,
                    icon: '✅',
                    className: 'toast-success'
                });
            } catch (error) {
                console.error('Error deleting product:', error);
                
                // בדיקה מפורטת יותר של השגיאה
                let showProductInOrdersError = false;
                let errorMessage = '';

                if (error.response) {
                    // יש תגובה מהשרת
                    const status = error.response.status;
                    const responseData = error.response.data;
                    
                    console.log('Server response:', { status, data: responseData });
                    
                    // בדיקת סטטוס קוד ותוכן התגובה
                    if (status === 400 || status === 409 || status === 422) {
                        // שגיאות הקשורות לאילוצי מסד נתונים
                        if (responseData) {
                            const message = responseData.message || responseData.error || '';
                            const details = responseData.details || '';
                            
                            // בדיקת מילות מפתח בהודעת השגיאה
                            const orderRelatedKeywords = [
                                'הזמנות', 'הזמנה', 'orders', 'order',
                                'רכישה', 'רכש', 'purchased', 'purchase',
                                'מכירה', 'נמכר', 'sold', 'sale',
                                'לקוח', 'לקוחות', 'customer', 'customers',
                                'פעיל', 'פעילה', 'active',
                                'ממתין', 'ממתינה', 'pending',
                                'foreign key', 'constraint', 'reference',
                                'cannot delete', 'אי אפשר למחוק', 'לא ניתן למחוק'
                            ];
                            
                            const fullErrorText = `${message} ${details}`.toLowerCase();
                            showProductInOrdersError = orderRelatedKeywords.some(keyword => 
                                fullErrorText.includes(keyword.toLowerCase())
                            );
                            
                            errorMessage = message || details || 'שגיאה לא ידועה';
                        }
                    } else if (status === 500) {
                        // שגיאת שרת פנימית - לרוב אילוץ מסד נתונים
                        showProductInOrdersError = true;
                        errorMessage = 'המוצר קשור להזמנות פעילות';
                    }
                } else if (error.request) {
                    // בעיית רשת
                    errorMessage = 'בעיית תקשורת עם השרת';
                } else {
                    // שגיאה כללית
                    errorMessage = error.message || 'שגיאה לא ידועה';
                }

                // הצגת ההודעה המתאימה
                if (showProductInOrdersError) {
                    toast.error((t) => (
                        <div className="toast-error-overlay">
                            <div className="toast-error-header">
                                <AlertTriangle size={24} />
                                לא ניתן למחוק מוצר
                            </div>
                            
                            <div className="toast-error-content">
                                המוצר <strong>"{product.name}"</strong> לא יכול להימחק<br />
                                כיוון שהוא קשור להזמנות פעילות במערכת.
                            
                               
                                <div className="toast-error-tip">
                                    💡 המתן עד שכל ההזמנות הקשורות יושלמו, או פנה למנהל המערכת
                                </div>
                            </div>
                            
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="toast-error-button"
                            >
                                הבנתי
                            </button>
                        </div>
                    ), {
                         duration: Infinity,
                        className: 'toast-error-custom',
                        position: 'top-center',
                        dismissible: false
                    });
                } else {
                    // שגיאה כללית אחרת
                    toast.error(`שגיאה במחיקת המוצר: ${errorMessage}`, {
                        duration: 5000,
                        className: 'toast-error-general'
                    });
                }
            }
        };

        // יצירת Toast מותאם עם כפתורי אישור/ביטול
        toast((t) => (
            <div className="toast-delete-overlay">
                <div className="toast-delete-header">
                    <AlertTriangle size={24} />
                    מחיקת מוצר
                </div>
                
                <div className="toast-delete-content">
                    האם אתה בטוח שברצונך למחוק את המוצר<br />
                    <strong>"{product.name}"</strong>?<br />
                    <span className="toast-delete-warning">
                        פעולה זו בלתי הפיכה!
                    </span>
                </div>
                
                <div className="toast-delete-buttons">
                    <button
                        onClick={() => {
                            deleteProduct();
                            toast.dismiss(t.id);
                        }}
                        className="toast-delete-confirm"
                    >
                        כן, מחק
                    </button>
                    
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="toast-delete-cancel"
                    >
                        ביטול
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity, // לא ייעלם אוטומטית
            className: 'toast-delete-custom',
            position: 'top-center',
            dismissible: false 
        });
    };

    // Get stock status class
    const getStockStatusClass = (quantity) => {
        if (quantity <= 10) return 'products-stock--low';
        if (quantity <= 50) return 'products-stock--medium';
        return 'products-stock--high';
    };

    if (loading) {
        return (
            <div className="products-loading">
                <div className="products-loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="products-container">
            <div className="products-page">
                {/* כותרת עמוד */}
                <div className="products-header">
                    <div className="products-header-content">
                        <h1 className="products-header-title">ניהול מוצרים</h1>
                        <button
                            className="products-add-button"
                            onClick={openAddModal}
                        >
                            <Plus className="products-add-button-icon" />
                            הוסף מוצר
                        </button>
                    </div>
                </div>

                {/* --- סינון --- */}
                <div className="products-filters">
                    <div className="products-filters-content">
                        <select
                            name="category_id"
                            value={filters.category_id}
                            onChange={handleFilterChange}
                            className="products-filter-select"
                        >
                            <option value="">כל הקטגוריות</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        
                        <input
                            type="number"
                            name="minPrice"
                            placeholder="מחיר מינימום"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            className="products-filter-input"
                        />
                        
                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="מחיר מקסימום"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            className="products-filter-input"
                        />
                        
                        {/* --- סינון מלאי עם כפתורים בצד --- */}
                        <div className="products-stock-filter">
                            <input
                                type="number"
                                name="stock"
                                placeholder="מלאי"
                                value={filters.stock ?? ''}
                                onChange={handleFilterChange}
                                className="products-stock-input"
                            />
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, stockMin: parseInt(filters.stock) || 0, stockMax: null }))}
                                className="products-stock-button"
                                title="מכאן ומעלה"
                            >
                                →
                            </button>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, stockMax: parseInt(filters.stock) || 0, stockMin: null }))}
                                className="products-stock-button"
                                title="מכאן ומטה"
                            >
                                ↓
                            </button>
                        </div>

                        <button
                            onClick={() => setFilters({ 
                                category_id: '', 
                                minPrice: '', 
                                maxPrice: '', 
                                minStock: '', 
                                maxStock: '', 
                                stock: '',
                                stockMin: null,
                                stockMax: null,
                                priceSort: ''
                            })}
                            className="products-clear-filters"
                        >
                            איפוס סינון
                        </button>
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="products-empty">
                        <AlertCircle className="products-empty-icon" />
                        <h3 className="products-empty-title">אין מוצרים להצגה</h3>
                        <p className="products-empty-description">
                            נסה לשנות את הסינונים או להוסיף מוצרים חדשים
                        </p>
                    </div>
                ) : (
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead className="products-table-header">
                                <tr>
                                    <th>תמונה</th>
                                    <th>שם</th>
                                    <th>קטגוריה</th>
                                    <th>מחיר</th>
                                    <th>מלאי</th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className="products-table-row">
                                        <td className="products-table-cell" data-label="תמונה">
                                            {product.image_url ? (
                                                <img 
                                                    src={`http://localhost:3000${product.image_url}`} 
                                                    alt={product.name} 
                                                    className="products-image" 
                                                />
                                            ) : (
                                                <div className="products-image-placeholder">
                                                    <Package className="h-4 w-4" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="products-table-cell" data-label="שם">
                                            <div className="products-name">{product.name}</div>
                                        </td>
                                        <td className="products-table-cell" data-label="קטגוריה">
                                            <div className="products-category">
                                                {categories.find(c => c.id === product.category_id)?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="products-table-cell" data-label="מחיר">
                                            <div className="products-price">
                                                ₪{parseFloat(product.price).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="products-table-cell" data-label="מלאי">
                                            <span className={`products-stock ${getStockStatusClass(product.stock_quantity)}`}>
                                                {product.stock_quantity}
                                            </span>
                                        </td>
                                        <td className="products-table-cell" data-label="פעולות">
                                            <div className="products-actions">
                                                <button
                                                    className="products-action-button products-action-button--edit"
                                                    onClick={() => openEditModal(product)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    עריכה
                                                </button>
                                                <button
                                                    className="products-action-button products-action-button--delete"
                                                    onClick={() => handleDelete(product)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    מחיקה
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* מודל */}
                {modalOpen && (
                    <div className="products-modal-overlay">
                        <div className="products-modal">
                            <button
                                className="products-modal-close"
                                onClick={() => setModalOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <h2 className="products-modal-title">
                                {editingProduct ? 'עריכת מוצר' : 'הוספת מוצר'}
                            </h2>
                            <div className="products-modal-form">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="שם מוצר"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="products-modal-input"
                                />
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="products-modal-select"
                                >
                                    <option value="">בחר קטגוריה</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    name="price"
                                    placeholder="מחיר"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="products-modal-input"
                                />
                                <input
                                    type="number"
                                    name="stock_quantity"
                                    placeholder="מלאי"
                                    value={formData.stock_quantity}
                                    onChange={handleChange}
                                    className="products-modal-input"
                                />
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleChange}
                                    className="products-modal-file-input"
                                    accept="image/*"
                                />
                                <button
                                    onClick={handleSave}
                                    className="products-modal-save"
                                >
                                    {editingProduct ? 'עדכן מוצר' : 'הוסף מוצר'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;