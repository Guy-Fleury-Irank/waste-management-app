/**
 * Script de test de connexion MongoDB
 * Exécute: node test-mongo.js
 */
const mongoose = require('mongoose');
const dns = require('dns').promises;
const dotenv = require('dotenv');
const { URL } = require('url');

dotenv.config();

const uri = process.env.MONGO_URI;
console.log('\n🔍 DIAGNOSTIC DE CONNEXION MONGODB\n');

// 1. Analyser l'URI
console.log('--- 1. Analyse de l\'URI ---');
try {
  const parsed = new URL(uri.replace('mongodb+srv://', 'https://'));
  console.log(`   Hôte: ${parsed.hostname}`);
  console.log(`   Port: ${parsed.port || '27017 (défaut)'}`);
  console.log(`   Base de données: ${parsed.pathname ? parsed.pathname.slice(1) || 'test (défaut)' : 'test (défaut)'}`);
  console.log(`   Utilisateur: ${parsed.username}`);
  console.log(`   Mot de passe: ${'*'.repeat(parsed.password.length)}`);
  console.log(`   Options: ${parsed.search || 'aucune'}`);
} catch (e) {
  console.log(`   ❌ Erreur d'analyse de l'URI: ${e.message}`);
}

// 2. Test DNS
console.log('\n--- 2. Test DNS (résolution SRV) ---');
(async () => {
  try {
    // Extraire le hostname
    const hostname = uri.split('@')[1]?.split('/')[0]?.split('?')[0];
    
    // Tester DNS normal d'abord
    const dnsResult = await dns.resolve4(hostname);
    console.log(`   ✅ DNS direct OK: ${hostname} → ${dnsResult.join(', ')}`);
    
    // Tester SRV
    const srvResult = await dns.resolveSrv(`_mongodb._tcp.${hostname}`);
    console.log(`   ✅ DNS SRV OK: ${srvResult.length} hôtes trouvés`);
    srvResult.forEach((h, i) => {
      console.log(`      Hôte ${i+1}: ${h.name}:${h.port}`);
    });
  } catch (err) {
    console.log(`   ❌ Erreur DNS: ${err.code} - ${err.message}`);
    
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.log('\n⚠️  LE PROBLÈME EST IDENTIFIÉ:');
      console.log('   Ton réseau (FAI, firewall, proxy) BLOQUE les connexions DNS vers MongoDB Atlas.');
      console.log('\n🔧 SOLUTIONS:');
      console.log('   1. Change de DNS (p.ex. Google DNS 8.8.8.8):');
      console.log('      - Windows: Paramètres réseau > Modifier le DNS > 8.8.8.8 / 8.8.4.4');
      console.log('   2. Ou utilise un VPN');
      console.log('   3. Ou contacte ton FAI pour débloquer mongodb.net');
      console.log('   4. Ou installe MongoDB en local (voir ci-dessous)');
      console.log('\n📦 INSTALLER MONGODB EN LOCAL (solution de repli):');
      console.log('   1. Télécharge MongoDB Community depuis:');
      console.log('      https://www.mongodb.com/try/download/community');
      console.log('   2. Installe et démarre le service MongoDB');
      console.log('   3. Modifie server/.env:');
      console.log('      MONGO_URI=mongodb://localhost:27017/waste_management');
      console.log('   4. Redémarre le serveur');
    }
  }
})();

// 3. Test connexion (30 secondes timeout)
console.log('\n--- 3. Test de connexion directe ---');
mongoose.connect(uri, { 
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000
})
.then(() => {
  console.log('   ✅ Connexion réussie à MongoDB Atlas !');
  process.exit(0);
})
.catch(err => {
  console.log(`   ❌ Échec de connexion: ${err.name}`);
  console.log(`   Message: ${err.message}`);
  console.log(`   Code: ${err.code}`);
  
  if (err.message && err.message.includes('getaddrinfo')) {
    console.log('\n⚠️  DNS bloqué - voir solution ci-dessus');
  }
  if (err.message && err.message.includes('Authentication')) {
    console.log('\n⚠️  Problème d\'authentification - vérifie user/password dans .env');
  }
  if (err.message && err.message.includes('IP')) {
    console.log('\n⚠️  IP non whitelistée - va sur https://cloud.mongodb.com > Network Access');
  }
  
  process.exit(1);
});