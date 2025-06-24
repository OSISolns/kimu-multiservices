import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  username: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (res.ok && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          setUsers([]);
          setError(data.error || 'Failed to fetch users');
        }
      } catch (err) {
        setUsers([]);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link href="/agent/users/add" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Add User</Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600 font-medium">{error}</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Username</th>
              <th className="py-2 px-4 border">Role</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(users) ? users : []).map((user) => (
              <tr key={user.username}>
                <td className="py-2 px-4 border">{user.username}</td>
                <td className="py-2 px-4 border">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 