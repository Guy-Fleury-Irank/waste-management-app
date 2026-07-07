import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import ExportButtons from '../components/ExportButtons';

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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Sites de collecte</h1>
        {isStaffOrAdmin && (
          <button onClick={openCreate} className="px-4 py-2 border border-border bg-surface text-foreground text-sm font-medium rounded-sm hover:border-strong transition-colors">
            + Nouveau site
          </button>
        )}
      </div>

      <div className="flex justify-end mb-2">
        <ExportButtons data={sites} filename="sites" />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-surface border border-border rounded-sm p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-5">{editing ? 'Modifier' : 'Nouveau'} site</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" placeholder="Nom du site" required value={form.name} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-sm focus:border-strong focus:ring-0 outline-none placeholder:text-muted" />
              <input name="address" placeholder="Adresse" required value={form.address} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-sm focus:border-strong focus:ring-0 outline-none placeholder:text-muted" />
              <input name="city" placeholder="Ville" required value={form.city} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-sm focus:border-strong focus:ring-0 outline-none placeholder:text-muted" />
              <input name="contactName" placeholder="Contact (nom)" value={form.contactName} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-sm focus:border-strong focus:ring-0 outline-none placeholder:text-muted" />
              <input name="contactPhone" placeholder="Contact (téléphone)" value={form.contactPhone} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-sm focus:border-strong focus:ring-0 outline-none placeholder:text-muted" />
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-sm focus:border-strong focus:ring-0 outline-none text-muted">
                <option value="residentiel">Résidentiel</option>
                <option value="commercial">Commercial</option>
                <option value="industriel">Industriel</option>
                <option value="public">Public</option>
              </select>
              <div className="flex gap-3 pt-3">
                <button type="submit" className="flex-1 py-2.5 bg-foreground text-white text-sm font-medium rounded-sm hover:bg-strong transition-colors">
                  {editing ? 'Modifier' : 'Créer'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-border text-muted text-sm font-medium rounded-sm hover:border-strong transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border overflow-hidden rounded-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Nom</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Ville</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Contact</th>
              <th className="text-right px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sites.map((site) => (
              <tr key={site._id} className="hover:bg-surface transition-colors">
                <td className="px-5 py-4 text-sm font-medium text-foreground">{site.name}</td>
                <td className="px-5 py-4 text-sm text-muted">{site.city}</td>
                <td className="px-5 py-4">
                  <span className="px-3 py-1 text-xs rounded-sm bg-surface text-muted">{site.type}</span>
                </td>
                <td className="px-5 py-4 text-sm text-muted">{site.contactName || '-'}</td>
                <td className="px-5 py-4 text-right">
                  {isStaffOrAdmin && (
                    <>
                      <button onClick={() => openEdit(site)} className="text-sm text-muted hover:text-strong transition-colors mr-4">Modifier</button>
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDelete(site._id)} className="text-sm text-red-500 hover:text-red-600 transition-colors">Supprimer</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {sites.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-sm text-muted font-light">Aucun site enregistré</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}