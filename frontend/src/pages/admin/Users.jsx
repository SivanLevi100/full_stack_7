// src/pages/Users.jsx
import React, { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api'; // עדכון הנתיב
import { User, Users as UsersIcon, Plus, Trash2, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', role: 'customer', password: '' });

  useEffect(() => {
    loadUsers();
  }, []);

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

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ full_name: '', email: '', phone: '', role: 'customer', password: '' });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ full_name: user.full_name, email: user.email, phone: user.phone || '', role: user.role, password: '' });
    setModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('למחוק את המשתמש?')) return;
    try {
      await usersAPI.delete(userId);
      toast.success('משתמש נמחק בהצלחה');
      loadUsers();
    } catch (err) {
      console.error(err);
      //toast.error('שגיאה במחיקת המשתמש');
      toast.error('שגיאה במחיקת משתמש - יש לו הזמנות');
    }
  };

  /*const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, formData);
        toast.success('משתמש עודכן בהצלחה');
      } else {
        await usersAPI.create(formData);
        toast.success('משתמש נוצר בהצלחה');
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error('שגיאה בשמירת המשתמש');
    }
  };*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone || '',  // ודא שזה לא undefined
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


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          <h1 className="text-2xl font-bold">כל המשתמשים</h1>
        </div>

      </div>


      {/* כפתור הוסף משתמש מעל הטבלה */}
      <div className="flex justify-end mb-4">
        <button
          className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-xl hover:bg-gray-100"
          onClick={openAddModal}
        >
          <Plus className="h-4 w-4" /> הוסף משתמש
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <User className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">לא נמצאו משתמשים</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 border">ID</th>
                <th className="p-3 border">שם מלא</th>
                <th className="p-3 border">אימייל</th>
                <th className="p-3 border">טלפון</th>
                <th className="p-3 border">תפקיד</th>
                <th className="p-3 border">תאריך יצירה</th>
                <th className="p-3 border">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="text-center hover:bg-gray-50">
                  <td className="p-3 border">{user.id}</td>
                  <td className="p-3 border">{user.full_name}</td>
                  <td className="p-3 border">{user.email}</td>
                  <td className="p-3 border">{user.phone || '-'}</td>
                  <td className="p-3 border">{user.role}</td>
                  <td className="p-3 border">{new Date(user.created_at).toLocaleDateString()}</td>
                

                  <td className="p-3 border flex justify-center gap-2">
                    {/* כפתור עריכה */}
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex items-center justify-center w-8 h-8 text-yellow-500 hover:text-yellow-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* כפתור מחיקה */}
                    <button
                      onClick={() => {
                        if (user.role === 'admin') {
                          toast.error('לא ניתן למחוק משתמש מנהל');
                          return;
                        }
                        handleDelete(user.id);
                      }}
                      className={`flex items-center justify-center w-8 h-8 text-red-500  hover:text-red-700`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>







                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setModalOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">{editingUser ? 'ערוך משתמש' : 'הוסף משתמש'}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700">שם מלא</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-700">אימייל</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label className="block text-gray-700">טלפון</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-gray-700">סיסמה</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-700">תפקיד</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="customer">לקוח</option>
                  <option value="admin">מנהל</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">
                שמור
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
