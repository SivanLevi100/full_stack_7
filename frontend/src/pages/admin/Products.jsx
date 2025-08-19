// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '../../services/api';
import { Plus, Trash2, Edit, AlertCircle, X } from 'lucide-react';
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

    // --- מחיקה ---
    const handleDelete = async (id) => {
        if (!window.confirm('בטוח שאתה רוצה למחוק את המוצר הזה?')) return;
        try {
            await productsAPI.delete(id);
            setProducts(products.filter(p => p.id !== id));
            toast.success('המוצר נמחק בהצלחה');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('שגיאה במחיקת המוצר');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">ניהול מוצרים</h1>
                <button
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    onClick={openAddModal}
                >
                    <Plus className="h-4 w-4" />
                    הוסף מוצר
                </button>
            </div>

            {/* --- סינון --- */}
            <div className="flex gap-4 flex-wrap bg-gray-100 p-4 rounded items-center">
                <select
                    name="category_id"
                    value={filters.category_id}
                    onChange={handleFilterChange}
                    className="px-3 py-2 border border-gray-300 rounded"
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
                    className="px-3 py-2 border border-gray-300 rounded"
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="מחיר מקסימום"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="px-3 py-2 border border-gray-300 rounded"
                />
                {/* --- סינון מלאי עם כפתורים בצד --- */}
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        name="stock"
                        placeholder="מלאי"
                        value={filters.stock ?? ''}
                        onChange={handleFilterChange}
                        className="w-24 px-3 py-2 border border-gray-300 rounded"
                    />
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, stockMin: parseInt(filters.stock) || 0, stockMax: null }))}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title="מכאן ומעלה"
                    >
                        ↑
                    </button>
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, stockMax: parseInt(filters.stock) || 0, stockMin: null }))}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title="מכאן ומטה"
                    >
                        ↓
                    </button>
                </div>


                <button
                    onClick={() => setFilters({ category_id: '', minPrice: '', maxPrice: '', minStock: '', maxStock: '' })}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition-colors"
                >
                    איפוס סינון
                </button>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">אין מוצרים להצגה</p>
                </div>
            ) : (
                <table className="w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">תמונה</th>
                            <th className="px-4 py-2 text-left">שם</th>
                            <th className="px-4 py-2 text-left">קטגוריה</th>
                            <th className="px-4 py-2 text-left">מחיר</th>
                            <th className="px-4 py-2 text-left">מלאי</th>
                            <th className="px-4 py-2 text-left">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-2">
                                    {product.image_url ? (
                                        <img src={`http://localhost:3000${product.image_url}`} alt={product.name} className="h-48 object-cover mb-2 rounded" />
                                    ) : (
                                        <div className="h-48 bg-gray-200 flex items-center justify-center mb-2">No Image</div>
                                    )}
                                </td>
                                <td className="font-bold">{product.name}</td>
                                <td className="px-4 py-2">{categories.find(c => c.id === product.category_id)?.name || '-'}</td>
                                <td className="text-blue-600 font-semibold">₪{parseFloat(product.price).toFixed(2)}</td>
                                <td className="px-4 py-2">{product.stock_quantity}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <button
                                        className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600"
                                        onClick={() => openEditModal(product)}
                                    >
                                        <Edit className="h-4 w-4" />
                                        עריכה
                                    </button>
                                    <button
                                        className="flex items-center gap-1 px-2 py-1 bg-red-600 text-black rounded hover:bg-red-700"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        מחיקה
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* מודל */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={() => setModalOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h2 className="text-xl font-bold mb-4">{editingProduct ? 'עריכת מוצר' : 'הוספת מוצר'}</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="שם מוצר"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                            <input
                                type="number"
                                name="stock_quantity"
                                placeholder="מלאי"
                                value={formData.stock_quantity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                            <input
                                type="file"
                                name="image"
                                onChange={handleChange}
                                className="w-full"
                            />
                            <button
                                onClick={handleSave}
                                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                שמירה
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
