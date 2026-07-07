import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ExportButtons from '../components/ExportButtons';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

const ROLE_OPTIONS = ['client', 'staff', 'admin'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', address: '', role: 'client', profilePicture: null
  });

  const fetchUsers = useCallback(async () => {
    try {
      const params = filterRole ? { role: filterRole } : {};
      const { data } = await api.get('/users', { params });
      setUsers(data || []);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [filterRole]);

  useEffect(() => {
    (async () => {
      try {
        await fetchUsers();
      } catch {
        // handled
      }
    })();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', phone: '', address: '', role: 'client', profilePicture: null });
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
      profilePicture: user.profilePicture || null,
    });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePictureChange = (base64) => {
    try {
      setForm(prev => ({ ...prev, profilePicture: base64 }));
    } catch (error) {
      console.error('❌ Erreur handlePictureChange :', error);
    }
  };

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
    } catch {
      // handled by interceptor
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      toast.success(user.isActive ? 'Utilisateur désactivé' : 'Utilisateur activé');
      fetchUsers();
    } catch { /* handled */ }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Supprimer ${user.name} ?`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch { /* handled */ }
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Utilisateurs</h1>
          <p className="mt-1 text-sm text-muted font-light">Gestion des comptes utilisateurs</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 border border-border bg-surface text-foreground text-sm font-medium rounded-sm hover:border-strong transition-all">
          + Nouvel utilisateur
        </button>
      </div>

      {/* Filters + Export */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
        {['', 'client', 'staff', 'admin'].map(role => (
          <button key={role}
            onClick={() => setFilterRole(role)}
            className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-all ${
              filterRole === role ? 'bg-foreground text-white' : 'bg-surface text-muted hover:text-strong'
            }`}>
            {role || 'Tous'}
          </button>
        ))}
        </div>
        <ExportButtons data={users} filename="utilisateurs" />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden bg-surface border border-border rounded-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-surface">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Photo</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Nom</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Rôle</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Statut</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Téléphone</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-surface">
                <td className="px-5 py-3">
                  <img
                    src={u.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=111&color=fff&size=32`}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </td>
                <td className="px-5 py-3 text-sm font-medium text-foreground">{u.name}</td>
                <td className="px-5 py-3 text-sm text-muted">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-sm ${
                    u.role === 'admin' ? 'bg-foreground text-white' :
                    u.role === 'staff' ? 'bg-blue-50 text-blue-600' :
                    'bg-surface text-muted'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    u.isActive !== false ? 'text-foreground' : 'text-red-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-foreground' : 'bg-red-500'}`}></span>
                    {u.isActive !== false ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-muted">{u.phone || '-'}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(u)}
                    className="text-xs text-muted hover:text-strong mr-3 transition-colors">
                    Modifier
                  </button>
                  <button onClick={() => toggleActive(u)}
                    className={`text-xs mr-3 transition-colors ${
                      u.isActive !== false ? 'text-muted hover:text-red-500' : 'text-muted hover:text-foreground'
                    }`}>
                    {u.isActive !== false ? 'Désactiver' : 'Activer'}
                  </button>
                  <button onClick={() => deleteUser(u)}
                    className="text-xs text-red-500 hover:text-red-600 transition-colors">
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
              <div className="flex justify-center py-2">
                <ProfilePictureUpload
                  currentPicture={form.profilePicture}
                  onPictureChange={handlePictureChange}
                  userName={form.name || 'User'}
                />
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