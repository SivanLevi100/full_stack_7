// src/pages/Users.jsx
import React, { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api';
import { User, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-6 flex items-center gap-2">
        <UsersIcon className="h-5 w-5" />
        <h1 className="text-2xl font-bold">כל המשתמשים</h1>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
