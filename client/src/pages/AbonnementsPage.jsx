import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { CreditCard, Wallet, Smartphone, Building2 } from 'lucide-react';
import ExportButtons from '../components/ExportButtons';

const iconClass = "w-4 h-4 stroke-[1.5] inline-block align-middle";

const PAYMENT_METHODS = [
  { id: 'carte_credit', label: 'Carte de crédit', icon: <CreditCard className={iconClass} /> },
  { id: 'paypal', label: 'PayPal', icon: <Wallet className={iconClass} /> },
  { id: 'lumicash', label: 'Lumicash', icon: <Smartphone className={iconClass} /> },
  { id: 'depot_siege', label: 'Dépôt au siège', icon: <Building2 className={iconClass} /> },
];

export default function AbonnementsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [form, setForm] = useState({
    type: 'mensuel',
    site: '',
    isOrganization: false,
    paymentMethod: 'carte_credit',
    notes: ''
  });

  const fetchSubscriptions = async () => {
    try {
      const [subRes, sitesRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/sites'),
      ]);
      setSubscriptions(subRes.data || []);
      setSites(sitesRes.data || []);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const fetchPricing = async () => {
    try {
      const { data } = await api.get('/subscriptions/plans/pricing');
      setPricing(data);
    } catch {
      // fallback
      setPricing({
        plans: [
          { type: 'hebdomadaire', label: 'Hebdomadaire', price: 25, period: 'semaine' },
          { type: 'mensuel', label: 'Mensuel', price: 80, period: 'mois' },
          { type: 'annuel', label: 'Annuel', price: 800, period: 'année' }
        ],
        organizationSurcharge: 0.30,
        currency: 'USD',
        paymentMethods: PAYMENT_METHODS
      });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchSubscriptions();
        await fetchPricing();
      } catch {
        // handled by interceptor/fallback
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subscriptions', form);
      toast.success('Abonnement créé avec succès');
      setShowSubscribe(false);
      setForm({ type: 'mensuel', site: '', isOrganization: false, paymentMethod: 'carte_credit', notes: '' });
      fetchSubscriptions();
    } catch {
      // handled by interceptor
    }
  };

  const getPlanPrice = (type) => {
    if (!pricing) return 0;
    const plan = pricing.plans.find(p => p.type === type);
    return plan ? plan.price : 0;
  };

  const getDisplayPrice = (type, isOrg) => {
    const base = getPlanPrice(type);
    return isOrg ? Math.round(base * 1.3) : base;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-6 w-6 border-2 border-foreground border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Abonnements</h1>
          <p className="mt-1 text-sm text-muted font-light">
            {user?.role === 'client' ? 'Gérez vos abonnements et souscrivez à un plan' : 'Gestion des abonnements clients'}
          </p>
        </div>
        {user?.role === 'client' && (
          <button onClick={() => setShowSubscribe(true)}
            className="px-4 py-2 border border-border bg-surface text-foreground text-sm font-medium rounded-sm hover:border-strong transition-all">
            + Souscrire
          </button>
        )}
      </div>

      {/* Plans (client view) */}
      {user?.role === 'client' && pricing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pricing.plans.map(plan => (
            <div key={plan.type}
              className={`p-6 border transition-all cursor-pointer rounded-sm ${
                form.type === plan.type ? 'border-foreground bg-surface/80' : 'border-border bg-surface hover:border-strong'
              }`}
              onClick={() => setForm(prev => ({ ...prev, type: plan.type }))}>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">{plan.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {plan.price} <span className="text-sm font-normal text-muted">USD/{plan.period}</span>
              </p>
              <p className="mt-1 text-xs text-muted">
                {form.isOrganization ? `+30% org = ${Math.round(plan.price * 1.3)} USD` : 'Particulier'}
              </p>
            </div>
          ))}
        </div>
      )}

        {/* Subscriptions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {user?.role === 'client' ? 'Mes abonnements' : 'Tous les abonnements'}
          </h2>
          <ExportButtons data={subscriptions} filename="abonnements" />
        </div>
        {subscriptions.length === 0 ? (
          <div className="bg-surface border border-border rounded-sm p-6 text-center">
            <p className="text-sm text-muted">Aucun abonnement pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-surface border border-border rounded-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-surface">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Montant</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Paiement</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Statut</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Période</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscriptions.map(sub => (
                  <tr key={sub._id} className="hover:bg-surface">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {sub.type}
                      {sub.isOrganization && <span className="ml-1 text-xs text-muted">(org)</span>}
                    </td>
                    <td className="px-5 py-3 text-sm font-mono text-foreground">{sub.amount} {sub.currency}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-sm bg-surface text-muted">
                        {sub.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-sm ${
                        sub.status === 'actif' ? 'bg-foreground text-white' :
                        sub.status === 'suspendu' ? 'bg-blue-50 text-blue-600' :
                        sub.status === 'expire' ? 'bg-surface text-muted' :
                        'bg-red-50 text-red-500'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted">
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

      {/* Subscribe Modal */}
      {showSubscribe && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-sm p-8 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-6">Souscrire à un abonnement</h3>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="label-xai">Plan</label>
                <select name="type" value={form.type} onChange={handleChange} className="input-xai">
                  <option value="hebdomadaire">Hebdomadaire — {getPlanPrice('hebdomadaire')} USD/sem</option>
                  <option value="mensuel">Mensuel — {getPlanPrice('mensuel')} USD/mois</option>
                  <option value="annuel">Annuel — {getPlanPrice('annuel')} USD/an</option>
                </select>
              </div>
              <div>
                <label className="label-xai">Site</label>
                <select name="site" value={form.site} onChange={handleChange} required className="input-xai">
                  <option value="">Choisir un site</option>
                  {sites.map(s => <option key={s._id} value={s._id}>{s.name} — {s.city}</option>)}
                </select>
              </div>
              <div>
                <label className="label-xai">Mode de paiement</label>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="input-xai">
                  {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" name="isOrganization" checked={form.isOrganization} onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300" />
                <label className="text-sm text-gray-600">Je représente une organisation (+30%)</label>
              </div>
              <div>
                <label className="label-xai">Notes (optionnel)</label>
                <input name="notes" value={form.notes} onChange={handleChange}
                  className="input-xai" placeholder="Informations supplémentaires" />
              </div>
              <div className="bg-surface border border-border rounded-sm p-4">
                <p className="text-sm text-muted">Montant total</p>
                <p className="text-2xl font-bold text-foreground">
                  {getDisplayPrice(form.type, form.isOrganization)} USD
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSubscribe(false)}
                  className="flex-1 py-2.5 border border-border text-sm font-medium rounded-sm text-muted hover:text-strong transition-all">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-foreground text-white text-sm font-medium rounded-sm hover:bg-strong transition-all">
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}