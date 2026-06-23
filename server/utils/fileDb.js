/**
 * Base de données de secours basée sur des fichiers JSON
 * Utilisée quand MongoDB n'est pas disponible
 */
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');

// Faire en sorte que le répertoire de données existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class FileDb {
  constructor(collection) {
    this.collection = collection;
    this.filePath = path.join(DB_DIR, `${collection}.json`);
    this._ensureFile();
  }

  _ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]', 'utf8');
    }
  }

  _readAll() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  _writeAll(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  // CREATE
  async create(doc) {
    const all = this._readAll();
    const newDoc = { _id: this._generateId(), ...doc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    all.push(newDoc);
    this._writeAll(all);
    return newDoc;
  }

  // FIND (tous)
  async find(filter = {}) {
    let all = this._readAll();
    if (Object.keys(filter).length > 0) {
      all = all.filter(item => {
        return Object.entries(filter).every(([key, value]) => {
          if (key === '_id') return item._id === value;
          if (key === '$gte' || key === '$lte') return true; // simplifié
          return item[key] === value;
        });
      });
    }
    return all;
  }

  // FIND ONE
  async findById(id) {
    const all = this._readAll();
    return all.find(item => item._id === id) || null;
  }

  async findOne(filter) {
    const all = this._readAll();
    return all.find(item => {
      return Object.entries(filter).every(([key, value]) => item[key] === value);
    }) || null;
  }

  // UPDATE
  async findByIdAndUpdate(id, update, opts = {}) {
    const all = this._readAll();
    const index = all.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    all[index] = { ...all[index], ...update, _id: id, updatedAt: new Date().toISOString() };
    this._writeAll(all);
    return all[index];
  }

  // DELETE
  async findByIdAndDelete(id) {
    const all = this._readAll();
    const index = all.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deleted = all.splice(index, 1)[0];
    this._writeAll(all);
    return deleted;
  }

  // COUNT
  async countDocuments(filter = {}) {
    const all = await this.find(filter);
    return all.length;
  }

  // AGGREGATE (simplifié)
  async aggregate(pipeline) {
    let data = this._readAll();
    for (const stage of pipeline) {
      if (stage.$match) {
        data = data.filter(item => {
          return Object.entries(stage.$match).every(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              if (value.$gte && value.$lte) {
                const d = new Date(item[key]).getTime();
                return d >= new Date(value.$gte).getTime() && d <= new Date(value.$lte).getTime();
              }
              return true;
            }
            return item[key] === value;
          });
        });
      }
      if (stage.$group) {
        const grouped = {};
        data.forEach(item => {
          const key = item[stage.$group._id?.$dateToString?.date || '_id'];
          if (!grouped[key]) grouped[key] = { _id: key, count: 0 };
          grouped[key].count++;
        });
        data = Object.values(grouped);
      }
      if (stage.$sort) {
        const [key, dir] = Object.entries(stage.$sort)[0];
        data.sort((a, b) => dir * (a[key] > b[key] ? 1 : -1));
      }
    }
    return data;
  }

  // POPULATE (simplifié - remplace les IDs par les objets)
  populate(items, field, refDb) {
    return items.map(item => {
      if (!item[field]) return item;
      const ref = refDb._readAll().find(r => r._id === item[field]);
      return { ...item, [field]: ref || item[field] };
    });
  }
}

// Collectiones
const collections = {};

function getCollection(name) {
  if (!collections[name]) {
    collections[name] = new FileDb(name);
  }
  return collections[name];
}

module.exports = { getCollection, FileDb };