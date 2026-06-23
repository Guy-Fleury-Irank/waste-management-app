const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_DIR = path.join(__dirname, '..', 'logs');

// S'assurer que le dossier logs existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getLogFile() {
  return path.join(LOG_DIR, `mongodb-error-${new Date().toISOString().slice(0, 10)}.log`);
}

function logMongoError(err) {
  const timestamp = new Date().toISOString();
  const logEntries = [];

  logEntries.push(`=== ERREUR MONGODB [${timestamp}] ===`);
  logEntries.push(`Message: ${err.message}`);
  logEntries.push(`Code: ${err.code}`);
  logEntries.push(`Errno: ${err.errno}`);
  logEntries.push(`Syscall: ${err.syscall}`);
  logEntries.push(`Hostname: ${err.hostname}`);
  logEntries.push(`Stack: ${err.stack}`);
  logEntries.push('');

  // Informations réseau pour aider le diagnostic
  logEntries.push('--- Infos réseau ---');
  logEntries.push(`Hostname: ${os.hostname()}`);
  logEntries.push(`Platform: ${os.platform()}`);
  logEntries.push(`Network interfaces:`);
  const interfaces = os.networkInterfaces();
  for (const [name, nets] of Object.entries(interfaces)) {
    if (nets) {
      nets.forEach(net => {
        if (net.family === 'IPv4') {
          logEntries.push(`  ${name}: ${net.address}`);
        }
      });
    }
  }

  logEntries.push('');
  logEntries.push('--- URI utilisée (masquée) ---');
  const uri = process.env.MONGO_URI || 'NON_DEFINI';
  const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//USER:PASSWORD@');
  logEntries.push(`URI: ${maskedUri}`);

  logEntries.push('');
  logEntries.push('================================\n');

  const content = logEntries.join('\n');
  fs.appendFileSync(getLogFile(), content, 'utf8');
  console.error('📝 Erreur MongoDB enregistrée dans:', getLogFile());
  console.error(content);
}

function getLogContent() {
  const logFile = getLogFile();
  if (fs.existsSync(logFile)) {
    return fs.readFileSync(logFile, 'utf8');
  }
  return 'Aucune erreur MongoDB enregistrée aujourd\'hui.';
}

module.exports = { logMongoError, getLogContent };