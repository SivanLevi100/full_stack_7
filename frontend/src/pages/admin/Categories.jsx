/**
 * Categories.jsx - Enhanced Categories Management Page
 * 
 * This component provides comprehensive category management functionality:
 * - Categories listing with responsive table design
 * - Add/Edit categories with modal forms
 * - Advanced delete confirmation with Toast UI
 * - Error handling for foreign key constraints (products using categories)
 * - Empty state handling and user feedback
 * - Real-time updates after CRUD operations
 * - Responsive design for mobile and desktop
 * - Accessibility features and proper ARIA labels
 */

import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import { Plus, Trash2, Edit, AlertCircle, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for add/edit operations
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Load all categories from API
   * Handles loading state and error feedback
   */
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('שגיאה בטעינת הקטגוריות', {
        className: 'categories-toast-error-general',
        dismissible: false
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Open modal for adding new category
   * Resets form data and editing state
   */
  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setModalOpen(true);
  };

  /**
   * Open modal for editing existing category
   * Populates form with current category data
   * 
   * @param {Object} category - Category object to edit
   */
  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setModalOpen(true);
  };

  /**
   * Handle form input changes
   * Updates form state as user types
   * 
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Save category (create or update)
   * Handles both new category creation and existing category updates
   */
  const handleSave = async () => {
    try {
      let savedCategory;
      if (editingCategory) {
        savedCategory = await categoriesAPI.update(editingCategory.id, formData);
        setCategories(categories.map(c => c.id === savedCategory.id ? savedCategory : c));
        toast.success('הקטגוריה עודכנה בהצלחה', {
          className: 'categories-toast-success',
          dismissible: false
        });
      } else {
        savedCategory = await categoriesAPI.create(formData);
        setCategories([savedCategory, ...categories]);
        toast.success('הקטגוריה נוספה בהצלחה', {
          className: 'categories-toast-success',
          dismissible: false
        });
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('שגיאה בשמירת הקטגוריה', {
        className: 'categories-toast-error-general',
        dismissible: false
      });
    }
  };

  /**
   * Handle category deletion with advanced confirmation
   * Features comprehensive error handling for foreign key constraints
   * Provides detailed user feedback for deletion failures
   * 
   * @param {Object} category - Category object to delete
   */
  const handleDelete = async (category) => {
    const deleteCategory = async () => {
      try {
        await categoriesAPI.delete(category.id);
        setCategories(categories.filter(c => c.id !== category.id));
        toast.success(`הקטגוריה "${category.name}" נמחקה בהצלחה`, {
          duration: 3000,
          icon: '✅',
          className: 'categories-toast-success',
          dismissible: false
        });
      } catch (error) {
        console.error('Error deleting category:', error);
        
        // Advanced error analysis for better user experience
        let showCategoryHasProductsError = false;
        let errorMessage = '';

        if (error.response) {
          // Server response available
          const status = error.response.status;
          const responseData = error.response.data;
          
          console.log('Server response:', { status, data: responseData });
          
          // Check status codes and response content
          if (status === 400 || status === 409 || status === 422) {
            // Constraint violation related errors
            if (responseData) {
              const message = responseData.message || responseData.error || '';
              const details = responseData.details || '';
              
              // Check for product-related keywords in error message
              const productRelatedKeywords = [
                'מוצרים', 'מוצר', 'products', 'product',
                'קטגוריה', 'category', 'categories',
                'שייכים', 'משויכים', 'assigned', 'belongs',
                'קשור', 'קשורה', 'related', 'associated',
                'foreign key', 'constraint', 'reference',
                'cannot delete', 'אי אפשר למחוק', 'לא ניתן למחוק'
              ];
              
              const fullErrorText = `${message} ${details}`.toLowerCase();
              showCategoryHasProductsError = productRelatedKeywords.some(keyword => 
                fullErrorText.includes(keyword.toLowerCase())
              );
              
              errorMessage = message || details || 'שגיאה לא ידועה';
            }
          } else if (status === 500) {
            // Internal server error - usually constraint violation
            showCategoryHasProductsError = true;
            errorMessage = 'הקטגוריה קשורה למוצרים במערכת';
          }
        } else if (error.request) {
          // Network error
          errorMessage = 'בעיית תקשורת עם השרת';
        } else {
          // General error
          errorMessage = error.message || 'שגיאה לא ידועה';
        }

        // Display appropriate error message
        if (showCategoryHasProductsError) {
          toast.error((t) => (
            <div className="categories-toast-error-overlay">
              <div className="categories-toast-error-header">
                <AlertTriangle size={24} />
                לא ניתן למחוק קטגוריה
              </div>
              
              <div className="categories-toast-error-content">
                הקטגוריה <strong>"{category.name}"</strong> לא יכולה להימחק<br />
                כיוון שיש מוצרים שייכים אליה במערכת.
                <br /><br />
                <strong>פתרונות אפשריים:</strong><br />
                • העבר את המוצרים לקטגוריה אחרת<br />
                • מחק תחילה את כל המוצרים בקטגוריה<br />
                • צור קטגוריה חדשה ועבור אליה את המוצרים
                <div className="categories-toast-error-tip">
                  💡 ניתן לערוך מוצרים ולשנות את הקטגוריה שלהם
                </div>
              </div>
              
              <button
                onClick={() => toast.dismiss(t.id)}
                className="categories-toast-error-button"
              >
                הבנתי
              </button>
            </div>
          ), {
            duration: Infinity,
            className: 'categories-toast-error-custom',
            position: 'top-center',
            dismissible: false
          });
        } else {
          // Other general errors
          toast.error(`שגיאה במחיקת הקטגוריה: ${errorMessage}`, {
            duration: 5000,
            icon: '⌫',
            className: 'categories-toast-error-general',
            dismissible: false
          });
        }
      }
    };

    // Create custom Toast confirmation dialog
    toast((t) => (
      <div className="categories-toast-delete-overlay">
        <div className="categories-toast-delete-header">
          <AlertTriangle size={24} />
          מחיקת קטגוריה
        </div>
        
        <div className="categories-toast-delete-content">
          האם אתה בטוח שברצונך למחוק את הקטגוריה<br />
          <strong>"{category.name}"</strong>?<br />
          <span className="categories-toast-delete-warning">
            פעולה זו בלתי הפיכה!
          </span>
        </div>
        
        <div className="categories-toast-delete-buttons">
          <button
            onClick={() => {
              deleteCategory();
              toast.dismiss(t.id);
            }}
            className="categories-toast-delete-confirm"
          >
            כן, מחק
          </button>
          
          <button
            onClick={() => toast.dismiss(t.id)}
            className="categories-toast-delete-cancel"
          >
            ביטול
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      className: 'categories-toast-delete-custom',
      position: 'top-center',
      dismissible: false
    });
  };

  // Loading state component
  if (loading) {
    return (
      <div className="categories-loading">
        <div className="categories-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-page">
        {/* Page Header */}
        <div className="categories-header">
          <div className="categories-header-content">
            <h1 className="categories-header-title">ניהול קטגוריות</h1>
            <button
              className="categories-add-button"
              onClick={openAddModal}
            >
              <Plus className="categories-add-button-icon" />
              הוסף קטגוריה
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          // Empty state
          <div className="categories-empty">
            <AlertCircle className="categories-empty-icon" />
            <h3 className="categories-empty-title">אין קטגוריות להצגה</h3>
            <p className="categories-empty-description">
              התחל בהוספת קטגוריות לארגון המוצרים שלך
            </p>
          </div>
        ) : (
          // Categories table
          <div className="categories-table-container">
            <table className="categories-table">
              <thead className="categories-table-header">
                <tr>
                  <th>שם קטגוריה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id} className="categories-table-row">
                    <td className="categories-table-cell" data-label="שם קטגוריה">
                      <div className="categories-name">{category.name}</div>
                    </td>
                    <td className="categories-table-cell" data-label="פעולות">
                      <div className="categories-actions">
                        <button
                          className="categories-action-button categories-action-button--edit"
                          onClick={() => openEditModal(category)}
                        >
                          <Edit className="h-4 w-4" />
                          עריכה
                        </button>
                        <button
                          className="categories-action-button categories-action-button--delete"
                          onClick={() => handleDelete(category)}
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

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="categories-modal-overlay">
            <div className="categories-modal">
              <button
                className="categories-modal-close"
                onClick={() => setModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="categories-modal-title">
                {editingCategory ? 'עריכת קטגוריה' : 'הוספת קטגוריה'}
              </h2>
              <div className="categories-modal-form">
                <input
                  type="text"
                  name="name"
                  placeholder="שם קטגוריה"
                  value={formData.name}
                  onChange={handleChange}
                  className="categories-modal-input"
                />
                <button
                  onClick={handleSave}
                  className="categories-modal-save"
                >
                  {editingCategory ? 'עדכן קטגוריה' : 'הוסף קטגוריה'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;