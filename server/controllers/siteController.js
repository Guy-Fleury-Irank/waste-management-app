const { getModel } = require('../utils/adapter');

// @route   GET /api/sites
exports.getSites = async (req, res) => {
  try {
    const Site = getModel('Site');
    let filter = {};
    // Staff/Admin voient tout, client voit tous les sites actifs disponibles
    if (req.user.role === 'client') {
      filter.isActive = true;
    }
    const sites = await Site.find(filter);
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   GET /api/sites/:id
exports.getSite = async (req, res) => {
  try {
    const Site = getModel('Site');
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ message: 'Site non trouvé' });
    res.json(site);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   POST /api/sites
exports.createSite = async (req, res) => {
  try {
    const Site = getModel('Site');
    const site = await Site.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(site);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   PUT /api/sites/:id
exports.updateSite = async (req, res) => {
  try {
    const Site = getModel('Site');
    const site = await Site.findByIdAndUpdate(req.params.id, req.body);
    if (!site) return res.status(404).json({ message: 'Site non trouvé' });
    const updatedSite = await Site.findById(req.params.id);
    res.json(updatedSite);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   DELETE /api/sites/:id
exports.deleteSite = async (req, res) => {
  try {
    const Site = getModel('Site');
    const site = await Site.findByIdAndDelete(req.params.id);
    if (!site) return res.status(404).json({ message: 'Site non trouvé' });
    res.json({ message: 'Site supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};