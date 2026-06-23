import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const emptyForm = { name: '', address: '', city: '', contactName: '', contactPhone: '', type: 'residentiel' };

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { user } = useAuth();
  const isStaffOrAdmin = ['staff', 'admin'].includes(user?.role);

  const loadSites = () => api.get('/sites').then(({ data }) => setSites(data));

  useEffect(() => { loadSites(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowForm(true); };

  const openEdit = (site) => {
    setForm({ name: site.name, address: site.address, city: site.city, contactName: site.contactName || '', contactPhone: site.contactPhone || '', type: site.type });
    setEditing(site._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/sites/${editing}`, form);
        toast.success('Site modifié');
      } else {
        await api.post('/sites', form);
        toast.success('Site créé');
      }
      setShowForm(false);
      setEditing(null);
      loadSites();
    } catch { /* handled by interceptor */ }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce site ?')) return;
    try {
      await api.delete(`/sites/${id}`);
      toast.success('Site supprimé');
      loadSites();
    } catch { /* handled */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Sites de collecte</h1>
        {isStaffOrAdmin && (
          <button onClick={openCreate} className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
            + Nouveau site
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Modifier' : 'Nouveau'} site</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" placeholder="Nom du site" required value={form.name} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none placeholder:text-gray-300" />
              <input name="address" placeholder="Adresse" required value={form.address} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none placeholder:text-gray-300" />
              <input name="city" placeholder="Ville" required value={form.city} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none placeholder:text-gray-300" />
              <input name="contactName" placeholder="Contact (nom)" value={form.contactName} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none placeholder:text-gray-300" />
              <input name="contactPhone" placeholder="Contact (téléphone)" value={form.contactPhone} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none placeholder:text-gray-300" />
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none text-gray-500">
                <option value="residentiel">Résidentiel</option>
                <option value="commercial">Commercial</option>
                <option value="industriel">Industriel</option>
                <option value="public">Public</option>
              </select>
              <div className="flex gap-3 pt-3">
                <button type="submit" className="flex-1 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
                  {editing ? 'Modifier' : 'Créer'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-full hover:border-gray-400 transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Nom</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Ville</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="text-right px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sites.map((site) => (
              <tr key={site._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{site.name}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{site.city}</td>
                <td className="px-5 py-4">
                  <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-500">{site.type}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-400">{site.contactName || '-'}</td>
                <td className="px-5 py-4 text-right">
                  {isStaffOrAdmin && (
                    <>
                      <button onClick={() => openEdit(site)} className="text-sm text-gray-400 hover:text-gray-900 transition-colors mr-4">Modifier</button>
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDelete(site._id)} className="text-sm text-gray-300 hover:text-red-500 transition-colors">Supprimer</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {sites.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-300 font-light">Aucun site enregistré</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}