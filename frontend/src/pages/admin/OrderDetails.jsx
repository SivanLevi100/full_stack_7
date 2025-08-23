// // src/pages/OrderDetails.jsx - עמוד פרטי הזמנה עם עיצוב מותאם
// import React, { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { orderItemsAPI, productsAPI } from '../../services/api';
// import { ArrowRight, AlertTriangle } from 'lucide-react';
// import toast from 'react-hot-toast';

// const OrderDetails = () => {
//     const { orderId } = useParams();
//     const [items, setItems] = useState([]);
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // ניהול עריכה/הוספה
//     const [editingItem, setEditingItem] = useState(null);
//     const [newItem, setNewItem] = useState({ product_id: '', name: '', quantity: 1, unit_price: 0 });

//     // טעינת פרטי הזמנה
//     const loadItems = async () => {
//         try {
//             setLoading(true);
//             const data = await orderItemsAPI.getByOrder(orderId);
//             setItems(data);
//         } catch (error) {
//             console.error('Error loading order items:', error);
//             toast.error('שגיאה בטעינת פרטי ההזמנה', {
//                 dismissible: false
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // טעינת רשימת מוצרים מהחנות
//     const loadProducts = async () => {
//         try {
//             const data = await productsAPI.getAll();
//             setProducts(data);
//         } catch (err) {
//             console.error('Error loading products:', err);
//             toast.error('שגיאה בטעינת רשימת המוצרים', {
//                 dismissible: false
//             });
//         }
//     };

//     useEffect(() => {
//         loadItems();
//         loadProducts();
//     }, [orderId]);

//     // מחיקה עם Toast מותאם
//     const handleDelete = async (item) => {
//         const deleteItem = async () => {
//             try {
//                 await orderItemsAPI.delete(item.id);
//                 toast.success(`פריט "${item.name}" נמחק בהצלחה`, {
//                     duration: 3000,
//                     icon: '✅',
//                     dismissible: false
//                 });
//                 loadItems();
//             } catch (err) {
//                 console.error(err);
//                 toast.error('שגיאה במחיקת פריט', {
//                     dismissible: false
//                 });
//             }
//         };

//         // יצירת Toast מותאם עם כפתורי אישור/ביטול
//         toast((t) => (
//             <div className="categories-toast-delete-overlay">
//                 <div className="categories-toast-delete-header">
//                     <AlertTriangle size={24} />
//                     מחיקת פריט
//                 </div>
                
//                 <div className="categories-toast-delete-content">
//                     האם אתה בטוח שברצונך למחוק את הפריט<br />
//                     <strong>"{item.name}"</strong> מההזמנה?<br />
//                     <span className="categories-toast-delete-warning">
//                         פעולה זו בלתי הפיכה!
//                     </span>
//                 </div>
                
//                 <div className="categories-toast-delete-buttons">
//                     <button
//                         onClick={() => {
//                             deleteItem();
//                             toast.dismiss(t.id);
//                         }}
//                         className="categories-toast-delete-confirm"
//                     >
//                         כן, מחק
//                     </button>
                    
//                     <button
//                         onClick={() => toast.dismiss(t.id)}
//                         className="categories-toast-delete-cancel"
//                     >
//                         ביטול
//                     </button>
//                 </div>
//             </div>
//         ), {
//             duration: Infinity,
//             className: 'categories-toast-delete-custom',
//             position: 'top-center',
//             dismissible: false
//         });
//     };

//     // עריכה
//     const handleEdit = (item) => setEditingItem({ ...item });

//     const handleSaveEdit = async () => {
//         try {
//             // בדיקת מלאי לפני עדכון
//             const product = products.find(p => p.name === editingItem.name);
//             if (product && editingItem.quantity > product.stock_quantity) {
//                 toast.error((t) => (
//                     <div className="categories-toast-error-overlay">
//                         <div className="categories-toast-error-header">
//                             <AlertTriangle size={24} />
//                             כמות חורגת מהמלאי
//                         </div>
                        
//                         <div className="categories-toast-error-content">
//                             הכמות המבוקשת (<strong>{editingItem.quantity}</strong>) של המוצר<br />
//                             <strong>"{editingItem.name}"</strong><br />
//                             חורגת מהמלאי הזמין במערכת.
//                             <br /><br />
//                             <strong>מלאי זמין:</strong> {product.stock_quantity} יחידות
//                             <div className="categories-toast-error-tip">
//                                 💡 עדכן את הכמות למלאי הזמין או פחות
//                             </div>
//                         </div>
                        
//                         <button
//                             onClick={() => toast.dismiss(t.id)}
//                             className="categories-toast-error-button"
//                         >
//                             הבנתי
//                         </button>
//                     </div>
//                 ), {
//                     duration: Infinity,
//                     className: 'categories-toast-error-custom',
//                     position: 'top-center',
//                     dismissible: false
//                 });
//                 return;
//             }

//             await orderItemsAPI.update(editingItem.id, editingItem);
//             toast.success('פריט עודכן בהצלחה', {
//                 dismissible: false
//             });
//             setEditingItem(null);
//             loadItems();
//         } catch (err) {
//             console.error(err);
//             toast.error('שגיאה בעדכון פריט', {
//                 dismissible: false
//             });
//         }
//     };

//     // הוספה
//     const handleAddNew = async () => {
//         if (!newItem.product_id) {
//             toast.error('בחר מוצר לפני ההוספה', {
//                 dismissible: false
//             });
//             return;
//         }

//         // בדיקת מלאי לפני הוספה
//         const product = products.find(p => p.id === newItem.product_id);
//         if (product && newItem.quantity > product.stock_quantity) {
//             toast.error((t) => (
//                 <div className="categories-toast-error-overlay">
//                     <div className="categories-toast-error-header">
//                         <AlertTriangle size={24} />
//                         כמות חורגת מהמלאי
//                     </div>
                    
//                     <div className="categories-toast-error-content">
//                         הכמות המבוקשת (<strong>{newItem.quantity}</strong>) של המוצר<br />
//                         <strong>"{newItem.name}"</strong><br />
//                         חורגת מהמלאי הזמין במערכת.
//                         <br /><br />
//                         <strong>מלאי זמין:</strong> {product.stock_quantity} יחידות
//                         <div className="categories-toast-error-tip">
//                             💡 עדכן את הכמות למלאי הזמין או פחות
//                         </div>
//                     </div>
                    
//                     <button
//                         onClick={() => toast.dismiss(t.id)}
//                         className="categories-toast-error-button"
//                     >
//                         הבנתי
//                     </button>
//                 </div>
//             ), {
//                 duration: Infinity,
//                 className: 'categories-toast-error-custom',
//                 position: 'top-center',
//                 dismissible: false
//             });
//             return;
//         }

//         try {
//             await orderItemsAPI.create({ ...newItem, order_id: orderId });
//             toast.success('פריט נוסף בהצלחה', {
//                 dismissible: false
//             });
//             setNewItem({ product_id: '', name: '', quantity: 1, unit_price: 0 });
//             loadItems();
//         } catch (err) {
//             console.error(err);
//             toast.error('שגיאה בהוספת פריט', {
//                 dismissible: false
//             });
//         }
//     };

//     if (loading) {
//         return (
//             <div className="order-details-container">
//                 <div className="order-details-page">
//                     <div className="order-details-loading">טוען פרטי הזמנה...</div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="order-details-container">
//             <div className="order-details-page">
//                 <div className="order-details-card">
//                     {/* כפתור חזרה */}
//                     <Link to="/orders" className="order-details-back">
//                         <ArrowRight className="h-4 w-4" />
//                         חזרה להזמנות
//                     </Link>

//                     <h1 className="order-details-title">פרטי הזמנה #{orderId}</h1>

//                     {/* טבלת פריטים */}
//                     <div className="order-details-table-container">
//                         <table className="order-details-table">
//                             <thead className="order-details-table-header">
//                                 <tr>
//                                     <th>מוצר</th>
//                                     <th>כמות</th>
//                                     <th>מחיר ליחידה</th>
//                                     <th>סה"כ</th>
//                                     <th>פעולות</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {items.map(item => (
//                                     <tr key={item.id} className="order-details-table-row">
//                                         <td className="order-details-table-cell" data-label="מוצר">
//                                             <span className="order-details-product-name">{item.name}</span>
//                                         </td>
//                                         <td className="order-details-table-cell" data-label="כמות">
//                                             {editingItem?.id === item.id ? (
//                                                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
//                                                     <input
//                                                         type="number"
//                                                         value={editingItem.quantity}
//                                                         onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
//                                                         className="order-details-quantity-input"
//                                                         min="1"
//                                                         max={products.find(p => p.name === editingItem.name)?.stock_quantity}
//                                                     />
//                                                     {(() => {
//                                                         const product = products.find(p => p.name === editingItem.name);
//                                                         return product && (
//                                                             <span style={{ 
//                                                                 fontSize: '0.75rem', 
//                                                                 color: editingItem.quantity > product.stock_quantity ? 'var(--red-600)' : 'var(--gray-600)',
//                                                                 fontWeight: '600'
//                                                             }}>
//                                                                 זמין: {product.stock_quantity}
//                                                             </span>
//                                                         );
//                                                     })()}
//                                                 </div>
//                                             ) : (
//                                                 item.quantity
//                                             )}
//                                         </td>
//                                         <td className="order-details-table-cell" data-label="מחיר ליחידה">
//                                             <span className="order-details-price">₪{Number(item.unit_price)}</span>
//                                         </td>
//                                         <td className="order-details-table-cell" data-label="סה״כ">
//                                             <span className="order-details-total-price">
//                                                 ₪{(Number(item.unit_price) * item.quantity).toFixed(2)}
//                                             </span>
//                                         </td>
//                                         <td className="order-details-table-cell" data-label="פעולות">
//                                             <div className="order-details-actions">
//                                                 {editingItem?.id === item.id ? (
//                                                     <>
//                                                         <button 
//                                                             onClick={handleSaveEdit} 
//                                                             className="order-details-action-button order-details-action-button--save"
//                                                         >
//                                                             שמור
//                                                         </button>
//                                                         <button 
//                                                             onClick={() => setEditingItem(null)} 
//                                                             className="order-details-action-button order-details-action-button--cancel"
//                                                         >
//                                                             ביטול
//                                                         </button>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <button 
//                                                             onClick={() => handleEdit(item)} 
//                                                             className="order-details-action-button order-details-action-button--edit"
//                                                         >
//                                                             ערוך
//                                                         </button>
//                                                         <button 
//                                                             onClick={() => handleDelete(item)} 
//                                                             className="order-details-action-button order-details-action-button--delete"
//                                                         >
//                                                             מחק
//                                                         </button>
//                                                     </>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* טופס הוספת פריט חדש */}
//                     <div className="order-details-add-section">
//                         <h3 className="order-details-add-title">הוסף פריט חדש</h3>

//                         <div className="order-details-add-form">
//                             <div className="order-details-form-group">
//                                 <label className="order-details-form-label">מוצר:</label>
//                                 <select
//                                     value={newItem.product_id}
//                                     onChange={(e) => {
//                                         const selectedProduct = products.find(p => p.id === Number(e.target.value));
//                                         if (selectedProduct) {
//                                             setNewItem({
//                                                 ...newItem,
//                                                 product_id: selectedProduct.id,
//                                                 name: selectedProduct.name,
//                                                 unit_price: selectedProduct.price,
//                                             });
//                                         } else {
//                                             setNewItem({
//                                                 ...newItem,
//                                                 product_id: '',
//                                                 name: '',
//                                                 unit_price: 0,
//                                             });
//                                         }
//                                     }}
//                                     className="order-details-form-select"
//                                 >
//                                     <option value="">בחר מוצר</option>
//                                     {products.map(p => (
//                                         <option key={p.id} value={p.id}>{p.name}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="order-details-form-group">
//                                 <label className="order-details-form-label">כמות:</label>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                                     <input
//                                         type="number"
//                                         placeholder="לדוגמא: 3"
//                                         value={newItem.quantity}
//                                         onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
//                                         className="order-details-form-input order-details-form-input--small"
//                                         min="1"
//                                         max={newItem.product_id ? products.find(p => p.id === newItem.product_id)?.stock_quantity : undefined}
//                                     />
//                                     {newItem.product_id && (
//                                         <span style={{ 
//                                             fontSize: '0.875rem', 
//                                             color: 'var(--gray-600)',
//                                             fontWeight: '600'
//                                         }}>
//                                             (זמין: {products.find(p => p.id === newItem.product_id)?.stock_quantity || 0})
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="order-details-form-group">
//                                 <label className="order-details-form-label">מחיר ליחידה:</label>
//                                 <input
//                                     type="number"
//                                     value={newItem.unit_price}
//                                     readOnly
//                                     className="order-details-form-input order-details-form-input--small"
//                                 />
//                             </div>

//                             <button
//                                 onClick={handleAddNew}
//                                 className="order-details-add-button"
//                             >
//                                 הוסף פריט
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OrderDetails;

// src/pages/OrderDetails.jsx - קוד מלא מתוקן
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderItemsAPI, productsAPI, ordersAPI } from '../../services/api';
import { ArrowRight, AlertTriangle, Package, Truck, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetails = () => {
    const { orderId } = useParams();
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({ product_id: '', name: '', quantity: 1, unit_price: 0 });

    useEffect(() => {
        loadItems();
        loadProducts();
    }, [orderId]);

    // ✅ פונקציה מתוקנת לחישוב סכום (לתצוגה)
    const calculateOrderSummary = (itemsList = items) => {
        // סכום כל הפריטים
        const itemsTotal = itemsList.reduce((sum, item) => {
            return sum + (Number(item.unit_price) * Number(item.quantity));
        }, 0);
        
        // חישוב משלוח - חינם מעל 50 ש"ח
        const shippingCost = itemsTotal >= 50 ? 0 : 20;
        
        // סכום כולל
        const totalAmount = itemsTotal + shippingCost;
        
        return {
            itemsTotal,
            shippingCost,
            totalAmount,
            isFreeShipping: itemsTotal >= 50
        };
    };

    // ✅ פונקציה חדשה שמקבלת רשימת פריטים כפרמטר
    const updateOrderTotalWithItems = async (itemsList) => {
        try {
            // חישוב עם הרשימה שהתקבלה
            const itemsTotal = itemsList.reduce((sum, item) => {
                return sum + (Number(item.unit_price) * Number(item.quantity));
            }, 0);
            
            const shippingCost = itemsTotal >= 50 ? 0 : 20;
            const totalAmount = itemsTotal + shippingCost;
            
            // עדכון בשרת
            await ordersAPI.updateTotal(orderId, totalAmount);
            return totalAmount;
        } catch (error) {
            console.error('Error updating order total:', error);
        }
    };

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await orderItemsAPI.getByOrder(orderId);
            setItems(data);
        } catch (error) {
            console.error('Error loading order items:', error);
            toast.error('שגיאה בטעינת פרטי ההזמנה');
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const data = await productsAPI.getAll();
            setProducts(data);
        } catch (err) {
            console.error('Error loading products:', err);
            toast.error('שגיאה בטעינת רשימת המוצרים');
        }
    };

    // ✅ מחיקת פריט - מתוקן
    const handleDelete = async (item) => {
        const deleteItem = async () => {
            try {
                // מחיקה רגילה
                await orderItemsAPI.delete(item.id);
                
                // עדכון הרשימה
                const updatedItems = items.filter(i => i.id !== item.id);
                setItems(updatedItems);
                
                // עדכון הסכום עם הרשימה החדשה
                setTimeout(() => updateOrderTotalWithItems(updatedItems), 100);
                
                toast.success(`פריט "${item.name}" נמחק בהצלחה!`);
            } catch (err) {
                console.error(err);
                toast.error('שגיאה במחיקת פריט');
            }
        };

        toast((t) => (
            <div className="categories-toast-delete-overlay">
                <div className="categories-toast-delete-header">
                    <AlertTriangle size={24} />
                    מחיקת פריט
                </div>
                
                <div className="categories-toast-delete-content">
                    האם אתה בטוח שברצונך למחוק את הפריט<br />
                    <strong>"{item.name}"</strong> מההזמנה?<br />
                    <span className="categories-toast-delete-warning">
                        פעולה זו בלתי הפיכה!
                    </span>
                </div>
                
                <div className="categories-toast-delete-buttons">
                    <button
                        onClick={() => {
                            deleteItem();
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

    const handleEdit = (item) => setEditingItem({ ...item });

    // ✅ עריכת פריט - מתוקן
    const handleSaveEdit = async () => {
        try {
            // בדיקת מלאי
            const product = products.find(p => p.name === editingItem.name);
            if (product && editingItem.quantity > product.stock_quantity) {
                toast.error(`כמות חורגת מהמלאי! זמין: ${product.stock_quantity} יחידות`);
                return;
            }

            // עדכון רגיל
            await orderItemsAPI.update(editingItem.id, editingItem);
            
            // עדכון הרשימה מקומית
            const updatedItems = items.map(item => 
                item.id === editingItem.id ? editingItem : item
            );
            setItems(updatedItems);
            
            // עדכון הסכום עם הרשימה החדשה
            setTimeout(() => updateOrderTotalWithItems(updatedItems), 100);
            
            toast.success('פריט עודכן בהצלחה!');
            setEditingItem(null);
        } catch (err) {
            console.error(err);
            toast.error('שגיאה בעדכון פריט');
        }
    };

    // ✅ הוספת פריט - מתוקן
    const handleAddNew = async () => {
        if (!newItem.product_id) {
            toast.error('בחר מוצר לפני ההוספה');
            return;
        }

        // בדיקת מלאי
        const product = products.find(p => p.id === newItem.product_id);
        if (product && newItem.quantity > product.stock_quantity) {
            toast.error(`כמות חורגת מהמלאי! זמין: ${product.stock_quantity} יחידות`);
            return;
        }

        try {
            // הוספה רגילה
            const createdItem = await orderItemsAPI.create({ ...newItem, order_id: orderId });
            
            // עדכון הרשימה מקומית
            const updatedItems = [...items, createdItem];
            setItems(updatedItems);
            
            // עדכון הסכום עם הרשימה החדשה
            setTimeout(() => updateOrderTotalWithItems(updatedItems), 100);
            
            toast.success('פריט נוסף בהצלחה!');
            setNewItem({ product_id: '', name: '', quantity: 1, unit_price: 0 });
        } catch (err) {
            console.error(err);
            toast.error('שגיאה בהוספת פריט');
        }
    };

    // רכיב סיכום הזמנה
    const OrderSummary = () => {
        const summary = calculateOrderSummary();

        return (
            <div className="order-summary-container">
            

                <div className="order-summary-content">
                    {/* סכום פריטים */}
                    <div className="order-summary-row">
                        <div className="order-summary-label">
                            <span>סה"כ פריטים</span>
                            <span className="order-summary-items-count">({items.length} פריטים)</span>
                        </div>
                        <div className="order-summary-value">
                            ₪{summary.itemsTotal.toLocaleString()}
                        </div>
                    </div>

                    {/* משלוח */}
                    <div className="order-summary-row">
                        <div className="order-summary-label">
                            <span>משלוח</span>
                            {summary.isFreeShipping && (
                                <span className="order-summary-free-badge">משלוח חינם!</span>
                            )}
                        </div>
                        <div className={`order-summary-value ${summary.isFreeShipping ? 'order-summary-value--free' : ''}`}>
                            {summary.isFreeShipping ? 'חינם' : `₪${summary.shippingCost}`}
                        </div>
                    </div>

                    {/* הודעת משלוח חינם */}
                    {!summary.isFreeShipping && (
                        <div className="order-summary-shipping-note">
                             הוסף עוד ₪{(50 - summary.itemsTotal).toFixed(2)} לקבלת משלוח חינם!
                        </div>
                    )}

                    {/* קו מפריד */}
                    <div className="order-summary-divider"></div>

                    {/* סכום כולל */}
                    <div className="order-summary-total">
                        <div className="order-summary-total-label">סה"כ לתשלום:</div>
                        <div className="order-summary-total-value">₪{summary.totalAmount.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="order-details-container">
                <div className="order-details-page">
                    <div className="order-details-loading">טוען פרטי הזמנה...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-details-container">
            <div className="order-details-page">
                <div className="order-details-card">
                    {/* כפתור חזרה */}
                    <Link to="/orders" className="order-details-back">
                        <ArrowRight className="h-4 w-4" />
                        חזרה להזמנות
                    </Link>

                    <h1 className="order-details-title">פרטי הזמנה #{orderId}</h1>

                    {/* טבלת פריטים */}
                    <div className="order-details-table-container">
                        <table className="order-details-table">
                            <thead className="order-details-table-header">
                                <tr>
                                    <th>מוצר</th>
                                    <th>כמות</th>
                                    <th>מחיר ליחידה</th>
                                    <th>סה"כ</th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} className="order-details-table-row">
                                        <td className="order-details-table-cell" data-label="מוצר">
                                            <span className="order-details-product-name">{item.name}</span>
                                        </td>
                                        <td className="order-details-table-cell" data-label="כמות">
                                            {editingItem?.id === item.id ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                                    <input
                                                        type="number"
                                                        value={editingItem.quantity}
                                                        onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                                                        className="order-details-quantity-input"
                                                        min="1"
                                                        max={products.find(p => p.name === editingItem.name)?.stock_quantity}
                                                    />
                                                    {(() => {
                                                        const product = products.find(p => p.name === editingItem.name);
                                                        return product && (
                                                            <span style={{ 
                                                                fontSize: '0.75rem', 
                                                                color: editingItem.quantity > product.stock_quantity ? 'var(--red-600)' : 'var(--gray-600)',
                                                                fontWeight: '600'
                                                            }}>
                                                                זמין: {product.stock_quantity}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                item.quantity
                                            )}
                                        </td>
                                        <td className="order-details-table-cell" data-label="מחיר ליחידה">
                                            <span className="order-details-price">₪{Number(item.unit_price)}</span>
                                        </td>
                                        <td className="order-details-table-cell" data-label="סה״כ">
                                            <span className="order-details-total-price">
                                                ₪{(Number(item.unit_price) * item.quantity).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="order-details-table-cell" data-label="פעולות">
                                            <div className="order-details-actions">
                                                {editingItem?.id === item.id ? (
                                                    <>
                                                        <button 
                                                            onClick={handleSaveEdit} 
                                                            className="order-details-action-button order-details-action-button--save"
                                                        >
                                                            שמור
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditingItem(null)} 
                                                            className="order-details-action-button order-details-action-button--cancel"
                                                        >
                                                            ביטול
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => handleEdit(item)} 
                                                            className="order-details-action-button order-details-action-button--edit"
                                                        >
                                                            ערוך
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item)} 
                                                            className="order-details-action-button order-details-action-button--delete"
                                                        >
                                                            מחק
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* טופס הוספת פריט חדש */}
                    <div className="order-details-add-section">
                        <h3 className="order-details-add-title">הוסף פריט חדש</h3>

                        <div className="order-details-add-form">
                            <div className="order-details-form-group">
                                <label className="order-details-form-label">מוצר:</label>
                                <select
                                    value={newItem.product_id}
                                    onChange={(e) => {
                                        const selectedProduct = products.find(p => p.id === Number(e.target.value));
                                        if (selectedProduct) {
                                            setNewItem({
                                                ...newItem,
                                                product_id: selectedProduct.id,
                                                name: selectedProduct.name,
                                                unit_price: selectedProduct.price,
                                            });
                                        } else {
                                            setNewItem({
                                                ...newItem,
                                                product_id: '',
                                                name: '',
                                                unit_price: 0,
                                            });
                                        }
                                    }}
                                    className="order-details-form-select"
                                >
                                    <option value="">בחר מוצר</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="order-details-form-group">
                                <label className="order-details-form-label">כמות:</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        placeholder="לדוגמא: 3"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                                        className="order-details-form-input order-details-form-input--small"
                                        min="1"
                                        max={newItem.product_id ? products.find(p => p.id === newItem.product_id)?.stock_quantity : undefined}
                                    />
                                    {newItem.product_id && (
                                        <span style={{ 
                                            fontSize: '0.875rem', 
                                            color: 'var(--gray-600)',
                                            fontWeight: '600'
                                        }}>
                                            (זמין: {products.find(p => p.id === newItem.product_id)?.stock_quantity || 0})
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="order-details-form-group">
                                <label className="order-details-form-label">מחיר ליחידה:</label>
                                <input
                                    type="number"
                                    value={newItem.unit_price}
                                    readOnly
                                    className="order-details-form-input order-details-form-input--small"
                                />
                            </div>

                            <button
                                onClick={handleAddNew}
                                className="order-details-add-button"
                            >
                                הוסף פריט
                            </button>
                        </div>
                    </div>

                    {/* סיכום הזמנה */}
                    <OrderSummary />
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;