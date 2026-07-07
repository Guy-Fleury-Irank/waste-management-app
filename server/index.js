const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { connectDatabase, getStatus } = require('./utils/database');
const { seedDatabase } = require('./utils/seed');

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true // Allow credentials (cookies) to be sent
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware pour vérifier la connexion MongoDB
app.use('/api', (req, res, next) => {
  const dbStatus = getStatus();
  // Permettre auth (register/login) même si DB pas encore prête — elles gèrent l'erreur
  if (!dbStatus.connected && !req.path.startsWith('/health') && !req.path.startsWith('/debug') && !req.path.startsWith('/auth')) {
    return res.status(503).json({
      message: 'Base de données MongoDB indisponible',
      details: 'Impossible de se connecter à MongoDB Atlas ni de démarrer un serveur local.',
      actions: [
        '1. Allez sur https://cloud.mongodb.com > Network Access',
        '2. Ajoutez 0.0.0.0/0 (Allow All) ou votre IP actuelle',
        '3. Vérifiez le nom d\'utilisateur et mot de passe dans server/.env',
        '4. Vérifiez que vous avez une connexion internet stable',
        '5. Redémarrez le serveur: cd server && npm run dev'
      ]
    });
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sites', require('./routes/sites'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/collectes', require('./routes/collectes'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Route de test
app.get('/api/health', (req, res) => {
  const dbStatus = getStatus();
  res.json({
    status: 'OK',
    message: 'Backend OK',
    mongo: dbStatus.connected ? 'connecté' : 'déconnecté',
    mode: dbStatus.usingLocalDb ? 'local (mémoire)' : 'Atlas',
    uri: dbStatus.uri
  });
});

// Route de debug MongoDB
app.get('/api/debug/mongo', (req, res) => {
  const { getLogContent } = require('./utils/logger');
  const logContent = getLogContent();
  const dbStatus = getStatus();
  
  res.json({
    connected: dbStatus.connected,
    mode: dbStatus.usingLocalDb ? 'local (mémoire)' : (dbStatus.connected ? 'Atlas' : 'aucun'),
    uri: dbStatus.uri,
    logFile: logContent,
    instructions: [
      'Pour résoudre le problème de connexion MongoDB:',
      '  Option 1: Allez sur https://cloud.mongodb.com > Network Access > Ajouter 0.0.0.0/0',
      '  Option 2: Vérifiez les identifiants dans server/.env',
      '  Option 3: Vérifiez votre connexion internet / firewall'
    ]
  });
});

const PORT = process.env.PORT || 5000;

// Démarrer le serveur APRÈS avoir connecté la DB
async function start() {
  await connectDatabase();
  await seedDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur sur http://localhost:${PORT}`);
    console.log(`🔍 Debug MongoDB: http://localhost:${PORT}/api/debug/mongo`);
    
    const dbStatus = getStatus();
    if (dbStatus.connected) {
      if (dbStatus.usingLocalDb) {
        console.log('\n⚠️  Utilisation de MongoDB en mémoire locale');
        console.log('   Les données seront perdues au redémarrage du serveur.');
        console.log('   Pour utiliser MongoDB Atlas, vérifiez votre connexion réseau.');
      }
      console.log('\n✅ L\'application est prête !');
      console.log(`   Frontend: http://localhost:5173`);
    }
  });
}

start();