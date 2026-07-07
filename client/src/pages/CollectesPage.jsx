import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import ExportButtons from '../components/ExportButtons';

const emptyForm = {
  date: new Date().toISOString().slice(0, 16),
  site: '',
  vehicle: '',
  driver: '',
  wasteDetails: [{ type: 'organique', volume: '' }],
  notes: '',
  status: 'planifie'
};

export default function CollectesPage() {
  const [collectes, setCollectes] = useState([]);
  const [sites, setSites] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState('');
  const { user } = useAuth();
  const isStaffOrAdmin = ['staff', 'admin'].includes(user?.role);

  const loadData = () => {
    api.get('/collectes').then(({ data }) => setCollectes(data));
    api.get('/sites').then(({ data }) => setSites(data));
    api.get('/vehicles').then(({ data }) => setVehicles(data));
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleWasteChange = (index, field, value) => {
    const details = [...form.wasteDetails];
    details[index] = { ...details[index], [field]: value };
    setForm({ ...form, wasteDetails: details });
  };

  const addWasteDetail = () => {
    setForm({ ...form, wasteDetails: [...form.wasteDetails, { type: 'organique', volume: '' }] });
  };

  const removeWasteDetail = (index) => {
    if (form.wasteDetails.length <= 1) return;
    setForm({ ...form, wasteDetails: form.wasteDetails.filter((_, i) => i !== index) });
  };

  const totalVolume = form.wasteDetails.reduce((sum, d) => sum + (parseFloat(d.volume) || 0), 0);

  const openCreate = () => {
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 16) });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({
      date: new Date(c.date).toISOString().slice(0, 16),
      site: c.site?._id || '',
      vehicle: c.vehicle?._id || '',
      driver: c.driver?._id || '',
      wasteDetails: c.wasteDetails?.length ? c.wasteDetails : [{ type: 'organique', volume: '' }],
      notes: c.notes || '',
      status: c.status
    });
    setEditing(c._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        date: new Date(form.date),
        wasteDetails: form.wasteDetails.map(d => ({ ...d, volume: parseFloat(d.volume) })),
        totalVolume
      };
      if (editing) {
        await api.put(`/collectes/${editing}`, payload);
        toast.success('Collecte modifiée');
      } else {
        await api.post('/collectes', payload);
        toast.success('Collecte créée');
      }
      setShowForm(false);
      setEditing(null);
      loadData();
    } catch { /* handled */ }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette collecte ?')) return;
    try {
      await api.delete(`/collectes/${id}`);
      toast.success('Collecte supprimée');
      loadData();
    } catch { /* handled */ }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/collectes/${id}`, { status });
      toast.success(`Statut mis à jour: ${status}`);
      loadData();
    } catch { /* handled */ }
  };

  const statusColors = {
    planifie: 'bg-surface text-muted',
    en_cours: 'bg-blue-50 text-blue-600',
    termine: 'bg-foreground text-white',
    annule: 'bg-red-50 text-red-500'
  };

  const filteredCollectes = filter
    ? collectes.filter(c => c.status === filter)
    : collectes;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Collectes</h1>
        {isStaffOrAdmin && (
          <button onClick={openCreate} className="px-4 py-2 border border-border bg-surface text-foreground text-sm font-medium rounded-sm hover:border-strong transition-colors">
            + Nouvelle collecte
          </button>
        )}
      </div>

      {/* Filtres + Export */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
        {['', 'planifie', 'en_cours', 'termine', 'annule'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 text-xs rounded-sm transition-colors ${
              filter === s ? 'bg-foreground text-white' : 'bg-surface text-muted hover:text-strong hover:bg-surface/80'
            }`}>
            {s === '' ? 'Tous' : s === 'en_cours' ? 'En cours' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        </div>
        <ExportButtons data={filteredCollectes} filename="collectes" />
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-surface border border-border rounded-sm p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-5">{editing ? 'Modifier' : 'Nouvelle'} collecte</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-xai">Date & heure</label>
                <input type="datetime-local" name="date" required value={form.date} onChange={handleChange}
                  className="input-xai" />
              </div>
              <div>
                <label className="label-xai">Site</label>
                <select name="site" required value={form.site} onChange={handleChange}
                  className="input-xai text-gray-500">
                  <option value="">Sélectionner un site</option>
                  {sites.map(s => <option key={s._id} value={s._id}>{s.name} - {s.city}</option>)}
                </select>
              </div>
              <div>
                <label className="label-xai">Véhicule</label>
                <select name="vehicle" value={form.vehicle} onChange={handleChange}
                  className="input-xai text-gray-500">
                  <option value="">Sélectionner un véhicule</option>
                  {vehicles.map(v => <option key={v._id} value={v._id}>{v.plate} - {v.brand} {v.model}</option>)}
                </select>
              </div>
              <div>
                <label className="label-xai">Statut</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="input-xai text-gray-500">
                  <option value="planifie">Planifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>
              {/* Waste details */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label-xai">Détails déchets</label>
                  <button type="button" onClick={addWasteDetail} className="text-xs text-gray-400 hover:text-gray-900 transition-colors">+ Ajouter</button>
                </div>
                {form.wasteDetails.map((wd, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select value={wd.type} onChange={(e) => handleWasteChange(i, 'type', e.target.value)}
                      className="flex-1 px-0 py-2 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none text-gray-500">
                      <option value="organique">Organique</option>
                      <option value="recyclable">Recyclable</option>
                      <option value="verre">Verre</option>
                      <option value="residuels">Résiduels</option>
                      <option value="encombrants">Encombrants</option>
                    </select>
                    <input type="number" step="0.1" min="0" placeholder="Volume" value={wd.volume} onChange={(e) => handleWasteChange(i, 'volume', e.target.value)}
                      className="w-24 px-0 py-2 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none placeholder:text-gray-300" />
                    {form.wasteDetails.length > 1 && (
                      <button type="button" onClick={() => removeWasteDetail(i)} className="text-gray-300 hover:text-gray-700 text-sm px-1">✕</button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted mt-2">
                  Volume total: <strong className="font-mono text-foreground">{totalVolume}</strong> kg/L
                </p>
              </div>
              <div>
                <label className="label-xai">Notes</label>
                <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
                  className="input-xai resize-none" />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="submit" className="flex-1 py-2.5 bg-foreground text-white text-sm font-medium rounded-sm hover:bg-strong transition-colors">
                  {editing ? 'Modifier' : 'Créer'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-border text-muted text-sm font-medium rounded-sm hover:border-strong transition-colors">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-border overflow-hidden rounded-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Date</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Site</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Véhicule</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Volume</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Statut</th>
              <th className="text-right px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCollectes.map((c) => (
              <tr key={c._id} className="hover:bg-surface transition-colors">
                <td className="px-5 py-4 text-sm text-muted">{new Date(c.date).toLocaleDateString('fr-FR')}</td>
                <td className="px-5 py-4 text-sm text-foreground font-medium">{c.site?.name || '-'}</td>
                <td className="px-5 py-4 text-sm text-muted">{c.vehicle?.plate || '-'}</td>
                <td className="px-5 py-4 text-sm font-mono text-foreground">{c.totalVolume || '-'}</td>
                <td className="px-5 py-4">
                  {isStaffOrAdmin ? (
                    <select value={c.status} onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      className={`px-3 py-1 text-xs rounded-sm border-0 font-medium ${statusColors[c.status]}`}>
                      <option value="planifie">Planifié</option>
                      <option value="en_cours">En cours</option>
                      <option value="termine">Terminé</option>
                      <option value="annule">Annulé</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 text-xs rounded-sm ${statusColors[c.status]} font-mono`}>{c.status}</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  {isStaffOrAdmin && (
                    <>
                      <button onClick={() => openEdit(c)} className="text-sm text-muted hover:text-strong transition-colors mr-4">Modifier</button>
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDelete(c._id)} className="text-sm text-red-500 hover:text-red-600 transition-colors">Supprimer</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredCollectes.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-sm text-muted font-light">Aucune collecte trouvée</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}