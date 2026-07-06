/**
 * Script de seeding automatique — Initialise la base de données avec les données critiques
 * 
 * Données à créer au démarrage (idempotent, vérification avant insertion) :
 * - 1 Admin : admin@wastemanager.com
 * - 1 Staff : staff@wastemanager.com
 * - 1 Client : client@wastemanager.com
 * - 3 Sites : Entrepôt Sud, Site centre-ville, Local recyclage Nord
 * - 3 Véhicules : RV-9001/Volvo FM, SN-1122/Renault Master, CA-7703/Iveco Daily
 * 
 * Note : Les Abonnements ne sont PAS seeded — ils sont créés par les clients via l'API
 */

const bcrypt = require('bcryptjs');
const { getModel } = require('./adapter');

async function seedDatabase() {
  try {
    console.log('\n🌱 Démarrage du seeding de la base de données...\n');

    // 1. Seed Admin par défaut
    await seedAdmin();

    // 2. Seed Staff par défaut
    await seedStaff();

    // 3. Seed Client par défaut
    await seedClient();

    // 4. Seed Sites
    await seedSites();

    // 5. Seed Véhicules
    await seedVehicles();

    console.log('\n✅ Seeding complété avec succès !\n');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error.message);
  }
}

/**
 * Seed Admin par défaut
 */
async function seedAdmin() {
  try {
    const User = getModel('User');
    const existingAdmin = await User.findOne({ email: 'admin@wastemanager.com' });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Administrateur',
        email: 'admin@wastemanager.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+243000000000',
        address: 'Siège social'
      });
      console.log('👤 Admin créé : admin@wastemanager.com / admin123');
      console.log('   ⚠️  Changez ce mot de passe immédiatement !');
    } else {
      console.log('👤 Admin existe déjà');
    }
  } catch (error) {
    console.error('❌ Erreur création admin:', error.message);
  }
}

/**
 * Seed Staff par défaut
 */
async function seedStaff() {
  try {
    const User = getModel('User');
    const existingStaff = await User.findOne({ email: 'staff@wastemanager.com' });

    if (!existingStaff) {
      const hashedPassword = await bcrypt.hash('staff123', 10);
      await User.create({
        name: 'Staff',
        email: 'staff@wastemanager.com',
        password: hashedPassword,
        role: 'staff',
        phone: '+243123456789',
        address: '15 Rue du Personnel'
      });
      console.log('👤 Staff créé : staff@wastemanager.com / staff123');
    } else {
      console.log('👤 Staff existe déjà');
    }
  } catch (error) {
    console.error('❌ Erreur création staff:', error.message);
  }
}

/**
 * Seed Client par défaut
 */
async function seedClient() {
  try {
    const User = getModel('User');
    const existingClient = await User.findOne({ email: 'client@wastemanager.com' });

    if (!existingClient) {
      const hashedPassword = await bcrypt.hash('client123', 10);
      await User.create({
        name: 'Client',
        email: 'client@wastemanager.com',
        password: hashedPassword,
        role: 'client',
        phone: '+243987654321',
        address: '12 Boulevard Client'
      });
      console.log('👤 Client créé : client@wastemanager.com / client123');
    } else {
      console.log('👤 Client existe déjà');
    }
  } catch (error) {
    console.error('❌ Erreur création client:', error.message);
  }
}

/**
 * Seed 3 Sites par défaut
 */
async function seedSites() {
  try {
    const Site = getModel('Site');
    const User = getModel('User');

    // Récupérer l'admin pour le champ createdBy
    const admin = await User.findOne({ email: 'admin@wastemanager.com' });
    const adminId = admin ? admin._id : null;

    const sitesData = [
      {
        name: 'Entrepôt Sud',
        address: '55 Avenue de la République, 92110 Clichy',
        city: 'Clichy',
        type: 'residentiel',
        contactName: 'Jean Dupont',
        contactPhone: '+33 1 41 27 00 00',
        isActive: true,
        createdBy: adminId
      },
      {
        name: 'Site centre-ville',
        address: '12 Boulevard Saint-Germain, 75005 Paris',
        city: 'Paris',
        type: 'commercial',
        contactName: 'Marie Martin',
        contactPhone: '+33 1 43 26 10 10',
        isActive: true,
        createdBy: adminId
      },
      {
        name: 'Local de recyclage Nord',
        address: '8 Rue du Nord, 93500 Pantin',
        city: 'Pantin',
        type: 'industriel',
        contactName: 'Pierre Leclerc',
        contactPhone: '+33 1 48 89 00 00',
        isActive: true,
        createdBy: adminId
      }
    ];

    for (const siteData of sitesData) {
      const existingSite = await Site.findOne({ name: siteData.name });
      if (!existingSite) {
        await Site.create(siteData);
        console.log(`📍 Site créé : ${siteData.name}`);
      } else {
        console.log(`📍 Site existe déjà : ${siteData.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur création sites:', error.message);
  }
}

/**
 * Seed 3 Véhicules par défaut
 */
async function seedVehicles() {
  try {
    const Vehicle = getModel('Vehicle');

    const vehiclesData = [
      {
        plate: 'RV-9001',
        brand: 'Volvo',
        model: 'FM',
        year: 2022,
        type: 'benne',
        capacity: 2500,
        fuelType: 'diesel',
        status: 'actif',
        isActive: true
      },
      {
        plate: 'SN-1122',
        brand: 'Renault',
        model: 'Master',
        year: 2021,
        type: 'benne',
        capacity: 1200,
        fuelType: 'diesel',
        status: 'actif',
        isActive: true
      },
      {
        plate: 'CA-7703',
        brand: 'Iveco',
        model: 'Daily',
        year: 2020,
        type: 'utilitaire',
        capacity: 900,
        fuelType: 'diesel',
        status: 'actif',
        isActive: true
      }
    ];

    for (const vehicleData of vehiclesData) {
      const existingVehicle = await Vehicle.findOne({ plate: vehicleData.plate });
      if (!existingVehicle) {
        await Vehicle.create(vehicleData);
        console.log(`🚚 Véhicule créé : ${vehicleData.plate} / ${vehicleData.brand} ${vehicleData.model}`);
      } else {
        console.log(`🚚 Véhicule existe déjà : ${vehicleData.plate}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur création véhicules:', error.message);
  }
}

module.exports = { seedDatabase };
