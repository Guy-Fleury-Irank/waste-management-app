import { useState, useEffect } from 'react';
import api from '../services/api';
import ExportButtons from '../components/ExportButtons';

export default function StaffDashboardPage() {
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [collectes, setCollectes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, subsRes, collectesRes] = await Promise.all([
          api.get('/users').catch(() => ({ data: [] })),
          api.get('/subscriptions'),
          api.get('/collectes'),
        ]);
        setUsers(usersRes.data || []);
        setSubscriptions(subsRes.data || []);
        setCollectes(collectesRes.data || []);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const clients = users.filter(u => u.role === 'client');
  const activeSubs = subscriptions.filter(s => s.status === 'actif');
  const totalCollected = collectes.reduce((sum, c) => sum + (c.totalVolume || 0), 0);

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Tableau de bord Staff
        </h1>
        <p className="mt-1 text-sm text-gray-400 font-light">
          Vue d'ensemble des clients, abonnements et collectes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-sm p-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Clients</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{clients.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-sm p-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Abonnements actifs</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{activeSubs.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-sm p-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Collectes</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{collectes.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-sm p-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Volume total</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{totalCollected} kg</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'overview', label: 'Vue d\'ensemble' },
          { id: 'clients', label: 'Clients & Paiements' },
          { id: 'collectes', label: 'Collectes' },
        ].map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-all ${
              activeTab === tab.id ? 'bg-foreground text-white' : 'bg-surface text-muted hover:text-strong'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Abonnements récents</h2>
              <ExportButtons data={subscriptions} filename="abonnements_staff" />
            </div>
            <div className="overflow-hidden border border-border rounded-sm">
              <table className="w-full">
                <thead>
                    <tr className="bg-surface">
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Client</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Type</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Montant</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Paiement</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Statut</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {subscriptions.slice(0, 10).map(sub => (
                      <tr key={sub._id} className="hover:bg-surface">
                        <td className="px-5 py-3 text-sm text-foreground">{sub.client}</td>
                        <td className="px-5 py-3 text-sm text-muted">{sub.type}</td>
                        <td className="px-5 py-3 text-sm text-muted">{sub.amount} {sub.currency}</td>
                        <td className="px-5 py-3">
                          <span className="px-2.5 py-0.5 text-xs font-medium rounded-sm bg-surface text-muted">
                            {sub.paymentMethod}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-sm font-mono ${
                            sub.status === 'actif' ? 'bg-foreground text-white' :
                            sub.status === 'suspendu' ? 'bg-blue-50 text-blue-600' :
                            sub.status === 'expire' ? 'bg-surface text-muted' :
                            'bg-red-50 text-red-500'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Clients & Payments Tab */}
      {activeTab === 'clients' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Clients & Modes de paiement</h2>
            <ExportButtons data={clients} filename="clients_staff" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Nom</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Abonnement</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Paiement</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Volume collecté</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map(client => {
                  const clientSubs = subscriptions.filter(s => s.client === client._id);
                  const clientCollectes = collectes.filter(c => c.client === client._id);
                  const clientVolume = clientCollectes.reduce((sum, c) => sum + (c.totalVolume || 0), 0);
                  const activeSub = clientSubs.find(s => s.status === 'actif');
                  return (
                    <tr key={client._id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{client.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{client.email}</td>
                      <td className="px-5 py-3">
                        {activeSub ? (
                          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-900 text-white">
                            {activeSub.type}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Aucun</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {activeSub ? (
                          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                            {activeSub.paymentMethod}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{clientVolume} kg</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collectes Tab */}
      {activeTab === 'collectes' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Collectes</h2>
            <ExportButtons data={collectes} filename="collectes_staff" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Site</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {collectes.slice(0, 20).map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-gray-900">
                      {new Date(c.date || c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{c.site}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{c.totalVolume || '-'} kg</td>
                    <td className="px-5 py-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        c.status === 'termine' ? 'bg-gray-900 text-white' :
                        c.status === 'en_cours' ? 'bg-blue-50 text-blue-600' :
                        c.status === 'planifie' ? 'bg-gray-100 text-gray-500' :
                        'bg-red-50 text-red-500'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">{c.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}