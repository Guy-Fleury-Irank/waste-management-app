const { getModel } = require('../utils/adapter');

// Tarifs de base (USD)
const BASE_PRICES = {
  hebdomadaire: 25,
  mensuel: 80,
  annuel: 800
};

// Calculer le montant selon le type et le statut organization
function calculateAmount(type, isOrganization) {
  let base = BASE_PRICES[type] || 0;
  if (isOrganization) base = Math.round(base * 1.3); // +30% pour organisations
  return base;
}

// Calculer la date de fin selon le type
function calculateEndDate(startDate, type) {
  const end = new Date(startDate);
  if (type === 'hebdomadaire') end.setDate(end.getDate() + 7);
  else if (type === 'mensuel') end.setMonth(end.getMonth() + 1);
  else if (type === 'annuel') end.setFullYear(end.getFullYear() + 1);
  return end;
}

// @route   GET /api/subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    const Subscription = getModel('Subscription');
    let filter = {};
    
    // Client ne voit que ses propres abonnements
    if (req.user.role === 'client') {
      filter.client = req.user._id;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.type) filter.type = req.query.type;

    let subscriptions = await Subscription.find(filter);
    
    // Tri par date décroissante (compat NeDB)
    subscriptions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   GET /api/subscriptions/:id
exports.getSubscription = async (req, res) => {
  try {
    const Subscription = getModel('Subscription');
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Abonnement non trouvé' });
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   POST /api/subscriptions
// Les clients peuvent créer leur propre abonnement
exports.createSubscription = async (req, res) => {
  try {
    const Subscription = getModel('Subscription');
    const { type, site, isOrganization, paymentMethod, notes, startDate } = req.body;

    if (!type || !site || !paymentMethod) {
      return res.status(400).json({ message: 'Type, site et mode de paiement requis' });
    }

    const amount = calculateAmount(type, isOrganization);
    const start = startDate ? new Date(startDate) : new Date();
    const endDate = calculateEndDate(start, type);

    // Paiement au siège = en_attente, les autres = paye
    const paymentStatus = paymentMethod === 'depot_siege' ? 'en_attente' : 'paye';

    const sub = await Subscription.create({
      client: req.user._id,
      site,
      type,
      isOrganization: isOrganization || false,
      startDate: start,
      endDate,
      amount,
      paymentMethod,
      paymentStatus,
      status: 'actif',
      notes,
      createdBy: req.user._id
    });

    res.status(201).json(sub);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   PUT /api/subscriptions/:id
exports.updateSubscription = async (req, res) => {
  try {
    const Subscription = getModel('Subscription');
    const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body);
    if (!sub) return res.status(404).json({ message: 'Abonnement non trouvé' });
    const updatedSub = await Subscription.findById(req.params.id);
    res.json(updatedSub);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   DELETE /api/subscriptions/:id
exports.deleteSubscription = async (req, res) => {
  try {
    const Subscription = getModel('Subscription');
    const sub = await Subscription.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Abonnement non trouvé' });
    res.json({ message: 'Abonnement supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   GET /api/subscriptions/plans/pricing
// Retourne les tarifs (public)
exports.getPricing = async (req, res) => {
  res.json({
    plans: [
      { type: 'hebdomadaire', label: 'Hebdomadaire', price: BASE_PRICES.hebdomadaire, period: 'semaine' },
      { type: 'mensuel', label: 'Mensuel', price: BASE_PRICES.mensuel, period: 'mois' },
      { type: 'annuel', label: 'Annuel', price: BASE_PRICES.annuel, period: 'année' }
    ],
    organizationSurcharge: 0.30,
    currency: 'USD',
    paymentMethods: [
      { id: 'carte_credit', label: 'Carte de crédit' },
      { id: 'paypal', label: 'PayPal' },
      { id: 'lumicash', label: 'Lumicash' },
      { id: 'depot_siege', label: 'Dépôt au siège' }
    ]
  });
};