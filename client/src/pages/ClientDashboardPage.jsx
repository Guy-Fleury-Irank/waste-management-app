import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ExportButtons from '../components/ExportButtons';

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [collectes, setCollectes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes, collecteRes] = await Promise.all([
          api.get('/subscriptions'),
          api.get('/collectes'),
        ]);
        setSubscriptions(subRes.data || []);
        setCollectes(collecteRes.data || []);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeSub = subscriptions.find(s => s.status === 'actif');
  const totalCollected = collectes.reduce((sum, c) => sum + (c.totalVolume || 0), 0);
  const collectesTerminees = collectes.filter(c => c.status === 'termine').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-6 w-6 border-2 border-gray-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Bonjour, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-muted font-light">
          Votre espace client — Suivez vos abonnements et collectes
        </p>
      </div>

      {/* Active Subscription Card */}
      {activeSub ? (
        <div className="bg-surface border border-border rounded-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Abonnement actif</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                {activeSub.type} — {activeSub.amount} {activeSub.currency}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                {new Date(activeSub.startDate).toLocaleDateString()}
                {activeSub.endDate ? ` → ${new Date(activeSub.endDate).toLocaleDateString()}` : ''}
                {activeSub.isOrganization && ' · Organisation'}
              </p>
            </div>
            <span className="px-4 py-2 text-sm font-medium rounded-sm bg-foreground text-white font-mono">
              {activeSub.status}
            </span>
          </div>
          <div className="mt-4 flex gap-3">
            <span className="px-3 py-1 text-xs font-medium rounded-sm bg-surface text-muted">
              Paiement: {activeSub.paymentMethod}
            </span>
            <span className={`px-3 py-1 text-xs font-medium rounded-sm ${
              activeSub.paymentStatus === 'paye' ? 'bg-green-50 text-green-600' :
              activeSub.paymentStatus === 'en_attente' ? 'bg-yellow-50 text-yellow-600' :
              'bg-red-50 text-red-500'
            } font-mono`}>
              {activeSub.paymentStatus}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-sm p-6 text-center">
          <p className="text-muted">Vous n'avez pas d'abonnement actif.</p>
          <button onClick={() => navigate('/abonnements')}
            className="mt-3 px-5 py-2 border border-border bg-surface text-foreground text-sm font-medium rounded-sm hover:border-strong transition-all">
            Souscrire maintenant
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-sm p-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Abonnements</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{subscriptions.length}</p>
          <p className="mt-1 text-xs text-muted">total</p>
        </div>
        <div className="bg-surface border border-border rounded-sm p-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Collectes</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{collectesTerminees}</p>
          <p className="mt-1 text-xs text-muted">terminées</p>
        </div>
        <div className="bg-surface border border-border rounded-sm p-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Volume</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{totalCollected} kg</p>
          <p className="mt-1 text-xs text-muted">collectés</p>
        </div>
      </div>

      {/* Subscription History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Historique des abonnements</h2>
          <ExportButtons data={subscriptions} filename="abonnements_client" />
        </div>
        {subscriptions.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-400">Aucun abonnement.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Montant</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Paiement</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Période</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscriptions.map(sub => (
                  <tr key={sub._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      {sub.type}
                      {sub.isOrganization && <span className="ml-1 text-xs text-gray-400">(org)</span>}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{sub.amount} {sub.currency}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                        {sub.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        sub.status === 'actif' ? 'bg-gray-900 text-white' :
                        sub.status === 'suspendu' ? 'bg-blue-50 text-blue-600' :
                        sub.status === 'expire' ? 'bg-gray-100 text-gray-500' :
                        'bg-red-50 text-red-500'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {new Date(sub.startDate).toLocaleDateString()}
                      {sub.endDate ? ` → ${new Date(sub.endDate).toLocaleDateString()}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collection History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Historique des collectes</h2>
          <ExportButtons data={collectes} filename="collectes_client" />
        </div>
        {collectes.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-400">Aucune collecte pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {collectes.slice(0, 10).map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-gray-900">
                      {new Date(c.date || c.createdAt).toLocaleDateString()}
                    </td>
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
                    <td className="px-5 py-3 text-sm text-gray-500">{c.totalVolume || '-'} kg</td>
                    <td className="px-5 py-3 text-sm text-gray-400">{c.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}