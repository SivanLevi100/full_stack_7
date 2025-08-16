// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '../../services/api';
import { Plus, Trash2, Edit, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // מודל להוספה/עריכה
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        price: '',
        stock_quantity: '',
        image: null,
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

    // פתיחת המודל להוספה
    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', category_id: '', price: '', stock_quantity: '', image: null });
        setModalOpen(true);
    };

    // פתיחת המודל לעריכה
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

    // טיפול בשינוי שדות
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData(prev => ({ ...prev, image: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // שמירה (הוספה או עריכה)
    const handleSave = async () => {
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('category_id', formData.category_id);
            data.append('price', formData.price);
            data.append('stock_quantity', formData.stock_quantity);
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

    // מחיקה
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

            {products.length === 0 ? (
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
                        {products.map(product => (
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
                                        className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                        onClick={() => openEditModal(product)}
                                    >
                                        <Edit className="h-4 w-4" />
                                        עריכה
                                    </button>
                                    <button
                                        className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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
