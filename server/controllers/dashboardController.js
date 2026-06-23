const { getModel, isMongoose } = require('../utils/adapter');

// @route   GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const Collecte = getModel('Collecte');
    const Site = getModel('Site');
    const Vehicle = getModel('Vehicle');
    const Subscription = getModel('Subscription');

    const totalCollectes = await Collecte.countDocuments();
    const collectesTerminees = await Collecte.countDocuments({ status: 'termine' });
    const collectesEnCours = await Collecte.countDocuments({ status: 'en_cours' });
    const collectesPlanifiees = await Collecte.countDocuments({ status: 'planifie' });
    const sitesActifs = await Site.countDocuments({ isActive: true });
    const vehiclesActifs = await Vehicle.countDocuments({ status: 'actif' });
    const abonnementsActifs = await Subscription.countDocuments({ status: 'actif' });

    let volumeTotal = 0;
    let collectesParJour = [];

    if (isMongoose()) {
      // Utiliser l'agrégation Mongoose
      const volumeResult = await Collecte.aggregate([
        { $match: { status: 'termine' } },
        { $group: { _id: null, total: { $sum: '$totalVolume' } } }
      ]);
      volumeTotal = volumeResult.length > 0 ? volumeResult[0].total : 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      collectesParJour = await Collecte.aggregate([
        { $match: { date: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    } else {
      // Mode NeDB: calculer manuellement
      const allCollectes = await Collecte.find({ status: 'termine' });
      volumeTotal = allCollectes.reduce((sum, c) => sum + (c.totalVolume || 0), 0);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentCollectes = allCollectes.filter(c => new Date(c.date || c.createdAt) >= thirtyDaysAgo);
      const dateGroups = {};
      recentCollectes.forEach(c => {
        const dateKey = new Date(c.date || c.createdAt).toISOString().slice(0, 10);
        if (!dateGroups[dateKey]) dateGroups[dateKey] = { _id: dateKey, count: 0 };
        dateGroups[dateKey].count++;
      });
      collectesParJour = Object.values(dateGroups).sort((a, b) => a._id.localeCompare(b._id));
    }

    res.json({
      totalCollectes,
      collectesTerminees,
      collectesEnCours,
      collectesPlanifiees,
      sitesActifs,
      vehiclesActifs,
      abonnementsActifs,
      volumeTotal,
      collectesParJour
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};