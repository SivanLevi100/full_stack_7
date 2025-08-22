// // src/pages/Categories.jsx
// import React, { useState, useEffect } from 'react';
// import { categoriesAPI } from '../../services/api';
// import { Plus, Trash2, Edit, AlertCircle, X } from 'lucide-react';
// import toast from 'react-hot-toast';

// const Categories = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // מודל להוספה/עריכה
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [formData, setFormData] = useState({
//     name: ''
//   });

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const data = await categoriesAPI.getAll();
//       setCategories(data);
//     } catch (error) {
//       console.error('Error loading categories:', error);
//       toast.error('שגיאה בטעינת הקטגוריות');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openAddModal = () => {
//     setEditingCategory(null);
//     setFormData({ name: '' });
//     setModalOpen(true);
//   };

//   const openEditModal = (category) => {
//     setEditingCategory(category);
//     setFormData({ name: category.name });
//     setModalOpen(true);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSave = async () => {
//     try {
//       let savedCategory;
//       if (editingCategory) {
//         savedCategory = await categoriesAPI.update(editingCategory.id, formData);
//         setCategories(categories.map(c => c.id === savedCategory.id ? savedCategory : c));
//         toast.success('הקטגוריה עודכנה בהצלחה');
//       } else {
//         savedCategory = await categoriesAPI.create(formData);
//         setCategories([savedCategory, ...categories]);
//         toast.success('הקטגוריה נוספה בהצלחה');
//       }
//       setModalOpen(false);
//     } catch (error) {
//       console.error('Error saving category:', error);
//       toast.error('שגיאה בשמירת הקטגוריה');
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('בטוח שאתה רוצה למחוק את הקטגוריה הזו?')) return;
//     try {
//       await categoriesAPI.delete(id);
//       setCategories(categories.filter(c => c.id !== id));
//       toast.success('הקטגוריה נמחקה בהצלחה');
//     } catch (error) {
//       console.error('Error deleting category:', error);
//       toast.error('שגיאה במחיקת הקטגוריה');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">ניהול קטגוריות</h1>
//         <button
//           className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//           onClick={openAddModal}
//         >
//           <Plus className="h-4 w-4" />
//           הוסף קטגוריה
//         </button>
//       </div>

//       {categories.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-lg">
//           <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//           <p className="text-gray-500 text-lg">אין קטגוריות להצגה</p>
//         </div>
//       ) : (
//         <table className="w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 text-left">שם קטגוריה</th>
//               <th className="px-4 py-2 text-left">פעולות</th>
//             </tr>
//           </thead>
//           <tbody>
//             {categories.map(category => (
//               <tr key={category.id} className="border-t border-gray-200 hover:bg-gray-50">
//                 <td className="px-4 py-2">{category.name}</td>
//                 <td className="px-4 py-2 flex gap-2">
//                   <button
//                     className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600"
//                     onClick={() => openEditModal(category)}
//                   >
//                     <Edit className="h-4 w-4" />
//                     עריכה
//                   </button>
//                   <button
//                     className="flex items-center gap-1 px-2 py-1 bg-red-600 text-black rounded hover:bg-red-700"
//                     onClick={() => handleDelete(category.id)}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                     מחיקה
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {/* מודל */}
//       {modalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
//             <button
//               className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
//               onClick={() => setModalOpen(false)}
//             >
//               <X className="h-5 w-5" />
//             </button>
//             <h2 className="text-xl font-bold mb-4">{editingCategory ? 'עריכת קטגוריה' : 'הוספת קטגוריה'}</h2>
//             <div className="space-y-4">
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="שם קטגוריה"
//                 value={formData.name}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded"
//               />
//               <button
//                 onClick={handleSave}
//                 className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//               >
//                 שמירה
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Categories;
// src/pages/Categories.jsx - עמוד ניהול קטגוריות עם עיצוב מותאם
import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import { Plus, Trash2, Edit, AlertCircle, X, AlertTriangle } from 'lucide-react';
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
      toast.error('שגיאה בטעינת הקטגוריות', {
        className: 'categories-toast-error-general',
        dismissible: false
      });
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

  // --- מחיקה עם Toast מותאם ---
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
        
        // בדיקה מפורטת יותר של השגיאה
        let showCategoryHasProductsError = false;
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
            // שגיאת שרת פנימית - לרוב אילוץ מסד נתונים
            showCategoryHasProductsError = true;
            errorMessage = 'הקטגוריה קשורה למוצרים במערכת';
          }
        } else if (error.request) {
          // בעיית רשת
          errorMessage = 'בעיית תקשורת עם השרת';
        } else {
          // שגיאה כללית
          errorMessage = error.message || 'שגיאה לא ידועה';
        }

        // הצגת ההודעה המתאימה
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
          // שגיאה כללית אחרת
          toast.error(`שגיאה במחיקת הקטגוריה: ${errorMessage}`, {
            duration: 5000,
            icon: '❌',
            className: 'categories-toast-error-general',
            dismissible: false
          });
        }
      }
    };

    // יצירת Toast מותאם עם כפתורי אישור/ביטול
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
        {/* כותרת עמוד */}
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
          <div className="categories-empty">
            <AlertCircle className="categories-empty-icon" />
            <h3 className="categories-empty-title">אין קטגוריות להצגה</h3>
            <p className="categories-empty-description">
              התחל בהוספת קטגוריות לארגון המוצרים שלך
            </p>
          </div>
        ) : (
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

        {/* מודל */}
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