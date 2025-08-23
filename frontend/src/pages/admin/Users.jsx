/**
 * Users.jsx - Enhanced User Management Page
 * 
 * This component provides comprehensive user management functionality:
 * - Users listing with role-based styling and permissions
 * - Add/Edit users with full form validation
 * - Role assignment and management (customer/admin)
 * - Protected admin user deletion prevention
 * - Responsive table design for mobile and desktop
 * - Modal forms with proper accessibility
 * - Real-time user creation and updates
 * - Error handling with user-friendly feedback
 * - Empty state handling and loading indicators
 */

import React, { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api';
import { User, Users as UsersIcon, Plus, Trash2, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state for add/edit operations
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    phone: '', 
    role: 'customer', 
    password: '' 
  });

  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Load all users from API
   * Handles loading states and error feedback
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('שגיאה בטעינת המשתמשים');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form input changes
   * Updates form state as user types
   * 
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Open modal for adding new user
   * Resets form data and editing state
   */
  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ 
      full_name: '', 
      email: '', 
      phone: '', 
      role: 'customer', 
      password: '' 
    });
    setModalOpen(true);
  };

  /**
   * Open modal for editing existing user
   * Populates form with current user data
   * 
   * @param {Object} user - User object to edit
   */
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ 
      full_name: user.full_name, 
      email: user.email, 
      phone: user.phone || '', 
      role: user.role, 
      password: '' 
    });
    setModalOpen(true);
  };

  /**
   * Handle user deletion with admin protection
   * Prevents deletion of admin users and provides feedback
   * 
   * @param {number} userId - User ID to delete
   */
  const handleDelete = async (userId) => {
    if (!window.confirm('למחוק את המשתמש?')) return;
    try {
      await usersAPI.delete(userId);
      toast.success('משתמש נמחק בהצלחה');
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error('שגיאה במחיקת משתמש - יש לו הזמנות');
    }
  };

  /**
   * Handle form submission for create/update operations
   * Validates and processes user data with proper error handling
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone || '',
        role: formData.role
      };

      if (editingUser) {
        await usersAPI.update(editingUser.id, userData);
        toast.success('משתמש עודכן בהצלחה');
      } else {
        await usersAPI.create(userData);
        toast.success('משתמש נוצר בהצלחה');
      }

      setModalOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error('שגיאה בשמירת המשתמש');
    }
  };

  // Loading state component
  if (loading) {
    return (
      <div className="users-container">
        <div className="users-page">
          <div className="users-loading">
            <div className="users-loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-page">
        {/* Page Header with Add Button */}
        <div className="users-header-gradient">
          <div className="users-header-content">
            <UsersIcon className="users-header-icon" />
            <h1 className="users-header-title">כל המשתמשים</h1>
          </div>
          <button
            className="users-add-button"
            onClick={openAddModal}
          >
            <Plus className="users-add-button-icon" />
            הוסף משתמש
          </button>
        </div>

        {/* Users Table or Empty State */}
        {users.length === 0 ? (
          <div className="users-empty">
            <User className="users-empty-icon" />
            <h3 className="users-empty-title">לא נמצאו משתמשים</h3>
            <p className="users-empty-description">התחל בהוספת המשתמש הראשון</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead className="users-table-header">
                <tr>
                  <th>ID</th>
                  <th>שם מלא</th>
                  <th>אימייל</th>
                  <th>טלפון</th>
                  <th>תפקיד</th>
                  <th>תאריך יצירה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="users-table-row">
                    <td className="users-table-cell" data-label="ID:">
                      <span className="users-id">{user.id}</span>
                    </td>
                    <td className="users-table-cell" data-label="שם מלא:">
                      <span className="users-name">{user.full_name}</span>
                    </td>
                    <td className="users-table-cell" data-label="אימייל:">
                      <span className="users-email">{user.email}</span>
                    </td>
                    <td className="users-table-cell" data-label="טלפון:">
                      <span className="users-phone">{user.phone || '-'}</span>
                    </td>
                    <td className="users-table-cell" data-label="תפקיד:">
                      <span className={`users-role users-role--${user.role}`}>
                        {user.role === 'admin' ? 'מנהל' : 'לקוח'}
                      </span>
                    </td>
                    <td className="users-table-cell" data-label="תאריך יצירה:">
                      <span className="users-date">
                        {new Date(user.created_at).toLocaleDateString('he-IL')}
                      </span>
                    </td>
                    <td className="users-table-cell" data-label="פעולות:">
                      <div className="users-actions">
                        <button
                          onClick={() => openEditModal(user)}
                          className="users-action-button users-action-button--edit"
                          title="עריכה"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (user.role === 'admin') {
                              toast.error('לא ניתן למחוק משתמש מנהל');
                              return;
                            }
                            handleDelete(user.id);
                          }}
                          className={`users-action-button ${
                            user.role === 'admin' 
                              ? 'users-action-button--disabled' 
                              : 'users-action-button--delete'
                          }`}
                          title={user.role === 'admin' ? 'לא ניתן למחוק מנהל' : 'מחיקה'}
                          disabled={user.role === 'admin'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit User Modal */}
        {modalOpen && (
          <div className="users-modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}>
            <div className="users-modal">
              <button 
                className="users-modal-close" 
                onClick={() => setModalOpen(false)}
                title="סגור"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h2 className="users-modal-title">
                {editingUser ? 'עריכת משתמש' : 'הוספת משתמש חדש'}
              </h2>
              
              <form className="users-form" onSubmit={handleSubmit}>
                <div className="users-form-group">
                  <label className="users-form-label">שם מלא</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="users-form-input"
                    placeholder="הכנס שם מלא"
                  />
                </div>
                
                <div className="users-form-group">
                  <label className="users-form-label">אימייל</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="users-form-input"
                    placeholder="הכנס כתובת אימייל"
                    disabled={!!editingUser}
                  />
                </div>
                
                <div className="users-form-group">
                  <label className="users-form-label">טלפון (אופציונלי)</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="users-form-input"
                    placeholder="מספר טלפון"
                  />
                </div>
                
                {!editingUser && (
                  <div className="users-form-group">
                    <label className="users-form-label">סיסמה</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="users-form-input"
                      placeholder="הכנס סיסמה"
                    />
                  </div>
                )}
                
                <div className="users-form-group">
                  <label className="users-form-label">תפקיד</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="users-form-select"
                  >
                    <option value="customer">לקוח</option>
                    <option value="admin">מנהל</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="users-form-submit"
                >
                  {editingUser ? 'עדכן משתמש' : 'צור משתמש'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;