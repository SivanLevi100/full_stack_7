// src/pages/Categories.jsx
import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import { Plus, Trash2, Edit, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // מודל להוספה/עריכה
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('שגיאה בטעינת הקטגוריות');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      let savedCategory;
      if (editingCategory) {
        savedCategory = await categoriesAPI.update(editingCategory.id, formData);
        setCategories(categories.map(c => c.id === savedCategory.id ? savedCategory : c));
        toast.success('הקטגוריה עודכנה בהצלחה');
      } else {
        savedCategory = await categoriesAPI.create(formData);
        setCategories([savedCategory, ...categories]);
        toast.success('הקטגוריה נוספה בהצלחה');
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('שגיאה בשמירת הקטגוריה');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('בטוח שאתה רוצה למחוק את הקטגוריה הזו?')) return;
    try {
      await categoriesAPI.delete(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success('הקטגוריה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('שגיאה במחיקת הקטגוריה');
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
        <h1 className="text-2xl font-bold">ניהול קטגוריות</h1>
        <button
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          onClick={openAddModal}
        >
          <Plus className="h-4 w-4" />
          הוסף קטגוריה
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">אין קטגוריות להצגה</p>
        </div>
      ) : (
        <table className="w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">שם קטגוריה</th>
              <th className="px-4 py-2 text-left">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">{category.name}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={() => openEditModal(category)}
                  >
                    <Edit className="h-4 w-4" />
                    עריכה
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => handleDelete(category.id)}
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
            <h2 className="text-xl font-bold mb-4">{editingCategory ? 'עריכת קטגוריה' : 'הוספת קטגוריה'}</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="שם קטגוריה"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
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

export default Categories;
