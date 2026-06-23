const mongoose = require('mongoose');
const path = require('path');
const { logMongoError } = require('./logger');

let isConnected = false;
let usingFallback = false;
let db = null;

async function connectDatabase() {
  const atlasUri = process.env.MONGO_URI;

  // Étape 1: Essayer MongoDB Atlas
  console.log('🔌 Tentative de connexion à MongoDB Atlas...');
  try {
    await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000
    });
    isConnected = true;
    usingFallback = false;
    db = mongoose;
    console.log('✅ Connecté à MongoDB Atlas');
    return 'mongodb';
  } catch (err) {
    console.error('❌ MongoDB Atlas indisponible:', err.message);
    logMongoError(err);
  }

  // Étape 2: Fallback vers NeDB (base embarquée, aucune dépendance réseau)
  console.log('🔄 Passage en mode base de données locale (NeDB)...');
  try {
    const Datastore = require('nedb-promises');
    const dataDir = path.join(__dirname, '..', 'data');
    
    const fs = require('fs');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Interface compatible Mongoose
    const fallbackDb = {
      collections: {},
      
      getCollection(name) {
        if (!this.collections[name]) {
          this.collections[name] = Datastore.create({
            filename: path.join(dataDir, `${name}.db`),
            autoload: true
          });
        }
        return this.collections[name];
      },
      
      // Helper pour convertir _id string en ObjectId compatible
      toId(id) { return id; },
      
      async createCollection(name) {
        this.getCollection(name);
        return true;
      }
    };
    
    db = fallbackDb;
    isConnected = true;
    usingFallback = true;
    console.log('✅ Connecté à NeDB (base locale)');
    console.log('   Les données sont persistées dans server/data/');
    return 'nedb';
  } catch (err) {
    console.error('❌ Erreur avec NeDB:', err.message);
    isConnected = false;
    return null;
  }
}

function getDb() {
  return db;
}

function getStatus() {
  return {
    connected: isConnected,
    usingFallback,
    type: usingFallback ? 'nedb' : (isConnected ? 'mongodb' : 'none'),
    uri: usingFallback 
      ? 'nedb://server/data/'
      : process.env.MONGO_URI?.replace(/\/\/[^:]+:[^@]+@/, '//USER:PASSWORD@') || 'non défini'
  };
}

function isMongoose() {
  return isConnected && !usingFallback;
}

function isNeDB() {
  return isConnected && usingFallback;
}

module.exports = { connectDatabase, getDb, getStatus, isMongoose, isNeDB };