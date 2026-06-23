import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = ['client', 'staff', 'admin'];
const STATUS_OPTIONS = ['all', 'actif', 'inactif'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', address: '', role: 'client'
  });

  const fetchUsers = async () => {
    try {
      const params = filterRole ? { role: filterRole } : {};
      const { data } = await api.get('/users', { params });
      setUsers(data || []);
    } catch (err) {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [filterRole]);

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', phone: '', address: '', role: 'client' });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'client',
    });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editUser._id}`, payload);
        toast.success('Utilisateur mis à jour');
      } else {
        await api.post('/users', form);
        toast.success('Utilisateur créé');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      // handled by interceptor
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      toast.success(user.isActive ? 'Utilisateur désactivé' : 'Utilisateur activé');
      fetchUsers();
    } catch (err) { /* handled */ }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Supprimer ${user.name} ?`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (err) { /* handled */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-6 w-6 border-2 border-gray-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Utilisateurs</h1>
          <p className="mt-1 text-sm text-gray-400 font-light">Gestion des comptes utilisateurs</p>
        </div>
        <button onClick={openCreate}
          className="px-5 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all">
          + Nouvel utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'client', 'staff', 'admin'].map(role => (
          <button key={role}
            onClick={() => setFilterRole(role)}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              filterRole === role ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400 hover:text-gray-700'
            }`}>
            {role || 'Tous'}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Nom</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Rôle</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Téléphone</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium text-gray-900">{u.name}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                    u.role === 'admin' ? 'bg-gray-900 text-white' :
                    u.role === 'staff' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    u.isActive !== false ? 'text-gray-900' : 'text-red-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-gray-900' : 'bg-red-500'}`}></span>
                    {u.isActive !== false ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-400">{u.phone || '-'}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(u)}
                    className="text-xs text-gray-400 hover:text-gray-900 mr-3 transition-colors">
                    Modifier
                  </button>
                  <button onClick={() => toggleActive(u)}
                    className={`text-xs mr-3 transition-colors ${
                      u.isActive !== false ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-gray-900'
                    }`}>
                    {u.isActive !== false ? 'Désactiver' : 'Activer'}
                  </button>
                  <button onClick={() => deleteUser(u)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {editUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-xai">Nom</label>
                <input name="name" required value={form.name} onChange={handleChange}
                  className="input-xai" placeholder="Jean Dupont" />
              </div>
              <div>
                <label className="label-xai">Email</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  className="input-xai" placeholder="email@exemple.com" />
              </div>
              <div>
                <label className="label-xai">{editUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}</label>
                <input name="password" type="password"
                  minLength={editUser ? 0 : 6} required={!editUser}
                  value={form.password} onChange={handleChange}
                  className="input-xai" placeholder={editUser ? 'Laisser vide pour conserver' : 'Au moins 6 caractères'} />
              </div>
              <div>
                <label className="label-xai">Téléphone</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="input-xai" placeholder="+243 800 000 000" />
              </div>
              <div>
                <label className="label-xai">Adresse</label>
                <input name="address" value={form.address} onChange={handleChange}
                  className="input-xai" placeholder="Adresse" />
              </div>
              <div>
                <label className="label-xai">Rôle</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="input-xai">
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-full text-gray-400 hover:text-gray-700 transition-all">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all">
                  {editUser ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}