const { getModel } = require('../utils/adapter');

// @route   GET /api/collectes
exports.getCollectes = async (req, res) => {
  try {
    const Collecte = getModel('Collecte');
    let filter = {};
    // Client ne voit que ses propres collectes
    if (req.user.role === 'client') {
      filter.client = req.user._id;
    }
    // Filtres optionnels
    if (req.query.status) filter.status = req.query.status;
    if (req.query.site) filter.site = req.query.site;
    if (req.query.vehicle) filter.vehicle = req.query.vehicle;
    if (req.query.client) filter.client = req.query.client;

    let collectes = await Collecte.find(filter);
    
    // Tri par date décroissante (compat NeDB)
    collectes.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    
    res.json(collectes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   GET /api/collectes/:id
exports.getCollecte = async (req, res) => {
  try {
    const Collecte = getModel('Collecte');
    const collecte = await Collecte.findById(req.params.id);
    if (!collecte) return res.status(404).json({ message: 'Collecte non trouvée' });
    res.json(collecte);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   POST /api/collectes
exports.createCollecte = async (req, res) => {
  try {
    const Collecte = getModel('Collecte');
    const collecte = await Collecte.create(req.body);
    res.status(201).json(collecte);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   PUT /api/collectes/:id
exports.updateCollecte = async (req, res) => {
  try {
    const Collecte = getModel('Collecte');
    const collecte = await Collecte.findByIdAndUpdate(req.params.id, req.body);
    if (!collecte) return res.status(404).json({ message: 'Collecte non trouvée' });
    const updatedCollecte = await Collecte.findById(req.params.id);
    res.json(updatedCollecte);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   DELETE /api/collectes/:id
exports.deleteCollecte = async (req, res) => {
  try {
    const Collecte = getModel('Collecte');
    const collecte = await Collecte.findByIdAndDelete(req.params.id);
    if (!collecte) return res.status(404).json({ message: 'Collecte non trouvée' });
    res.json({ message: 'Collecte supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};