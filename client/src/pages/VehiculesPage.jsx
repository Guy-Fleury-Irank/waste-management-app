import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const emptyForm = {
  plate: '', brand: '', model: '', year: '', type: 'camion',
  capacity: '', fuelType: 'diesel', status: 'actif',
  lastMaintenance: '', nextMaintenance: ''
};

export default function VehiculesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { user } = useAuth();
  const isStaffOrAdmin = ['staff', 'admin'].includes(user?.role);

  const loadVehicles = () => api.get('/vehicles').then(({ data }) => setVehicles(data));
  useEffect(() => { loadVehicles(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowForm(true); };

  const openEdit = (v) => {
    setForm({
      plate: v.plate, brand: v.brand, model: v.model, year: v.year || '',
      type: v.type, capacity: v.capacity, fuelType: v.fuelType, status: v.status,
      lastMaintenance: v.lastMaintenance ? v.lastMaintenance.slice(0, 10) : '',
      nextMaintenance: v.nextMaintenance ? v.nextMaintenance.slice(0, 10) : ''
    });
    setEditing(v._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        year: form.year ? parseInt(form.year) : undefined,
        capacity: parseFloat(form.capacity),
        lastMaintenance: form.lastMaintenance ? new Date(form.lastMaintenance) : undefined,
        nextMaintenance: form.nextMaintenance ? new Date(form.nextMaintenance) : undefined
      };
      if (editing) {
        await api.put(`/vehicles/${editing}`, payload);
        toast.success('Véhicule modifié');
      } else {
        await api.post('/vehicles', payload);
        toast.success('Véhicule créé');
      }
      setShowForm(false);
      setEditing(null);
      loadVehicles();
    } catch { /* handled */ }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce véhicule ?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Véhicule supprimé');
      loadVehicles();
    } catch { /* handled */ }
  };

  const statusColors = {
    actif: 'bg-surface text-muted',
    maintenance: 'bg-blue-50 text-blue-600',
    hors_service: 'bg-red-50 text-red-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Véhicules</h1>
        {isStaffOrAdmin && (
          <button onClick={openCreate} className="px-4 py-2 border border-border bg-surface text-foreground text-sm font-medium rounded-sm hover:border-strong transition-colors">
            + Nouveau véhicule
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-surface border border-border rounded-sm p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-5">{editing ? 'Modifier' : 'Nouveau'} véhicule</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input name="plate" placeholder="Plaque" required value={form.plate} onChange={handleChange}
                  className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-sm focus:border-strong focus:ring-0 outline-none placeholder:text-muted" />
                <input name="year" type="number" placeholder="Année" value={form.year} onChange={handleChange}
                  className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-sm focus:border-strong focus:ring-0 outline-none placeholder:text-muted" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="brand" placeholder="Marque" required value={form.brand} onChange={handleChange}
                  className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none placeholder:text-gray-300" />
                <input name="model" placeholder="Modèle" required value={form.model} onChange={handleChange}
                  className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none placeholder:text-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none text-gray-500">
                  <option value="camion">Camion</option>
                  <option value="benne">Benne</option>
                  <option value="compacteur">Compacteur</option>
                  <option value="remorque">Remorque</option>
                  <option value="utilitaire">Utilitaire</option>
                </select>
                <input name="capacity" type="number" step="0.1" placeholder="Capacité (kg/m³)" required value={form.capacity} onChange={handleChange}
                  className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none placeholder:text-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="fuelType" value={form.fuelType} onChange={handleChange}
                  className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none text-gray-500">
                  <option value="diesel">Diesel</option>
                  <option value="essence">Essence</option>
                  <option value="electrique">Électrique</option>
                  <option value="hybride">Hybride</option>
                  <option value="gaz">Gaz</option>
                </select>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-200 text-sm focus:border-black focus:ring-0 outline-none text-gray-500">
                  <option value="actif">Actif</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="hors_service">Hors service</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-xai">Dernière maintenance</label>
                  <input type="date" name="lastMaintenance" value={form.lastMaintenance} onChange={handleChange}
                    className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-sm focus:border-strong focus:ring-0 outline-none" />
                </div>
                <div>
                  <label className="label-xai">Prochaine maintenance</label>
                  <input type="date" name="nextMaintenance" value={form.nextMaintenance} onChange={handleChange}
                    className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-border text-sm focus:border-strong focus:ring-0 outline-none" />
                </div>
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

      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Plaque</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Marque / Modèle</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Capacité</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Statut</th>
              <th className="text-right px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vehicles.map((v) => (
              <tr key={v._id} className="hover:bg-surface transition-colors">
                <td className="px-5 py-4 text-sm font-medium text-foreground">{v.plate}</td>
                <td className="px-5 py-4 text-sm text-muted">{v.brand} {v.model}</td>
                <td className="px-5 py-4">
                  <span className="px-3 py-1 text-xs rounded-sm bg-surface text-muted">{v.type}</span>
                </td>
                <td className="px-5 py-4 text-sm font-mono text-foreground">{v.capacity}</td>
                <td className="px-5 py-4">
                  <span className={`px-3 py-1 text-xs rounded-sm font-medium ${statusColors[v.status]}`}>{v.status}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  {isStaffOrAdmin && (
                    <>
                      <button onClick={() => openEdit(v)} className="text-sm text-muted hover:text-strong transition-colors mr-4">Modifier</button>
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDelete(v._id)} className="text-sm text-red-500 hover:text-red-600 transition-colors">Supprimer</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-sm text-muted font-light">Aucun véhicule enregistré</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}