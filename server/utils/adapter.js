/**
 * Adaptateur de base de données unifié
 * Fonctionne avec Mongoose (MongoDB) et NeDB (fichier local)
 * Les contrôleurs utilisent cette interface, pas Mongoose directement
 */
const { getDb, isMongoose, isNeDB } = require('./database');

function getModel(name) {
  const db = getDb();
  if (!db) {
    throw new Error('Base de données non connectée');
  }
  
  if (isMongoose()) {
    // Retourne le modèle Mongoose
    return require(`../models/${name}`);
  }
  
  if (isNeDB()) {
    // Retourne un proxy NeDB
    const collection = db.getCollection(name.toLowerCase());
    return createProxy(name, collection);
  }
  
  return null;
}

function createProxy(name, collection) {
  const refs = {
    User: ['Site', 'Collecte', 'Subscription'],
    Site: ['Collecte', 'Subscription'],
    Vehicle: ['Collecte'],
    Subscription: []
  };

  return {
    // CREATE
    async create(data) {
      const doc = await collection.insert(data);
      return { toJSON: () => doc, _doc: doc, ...doc };
    },

    // FIND
    async find(filter = {}) {
      const docs = await collection.find(filter);
      return docs.map(d => ({ toJSON: () => d, _doc: d, ...d }));
    },

    async findOne(filter) {
      const doc = await collection.findOne(filter);
      if (!doc) return null;
      return { toJSON: () => doc, _doc: doc, ...doc };
    },

    async findById(id) {
      const doc = await collection.findOne({ _id: id });
      if (!doc) return null;
      return { toJSON: () => doc, _doc: doc, ...doc };
    },

    // UPDATE
    async findByIdAndUpdate(id, update, opts = {}) {
      await collection.update(
        { _id: id },
        { $set: update },
        {}
      );
      const doc = await collection.findOne({ _id: id });
      if (!doc) return null;
      return { toJSON: () => doc, _doc: doc, ...doc };
    },

    // DELETE
    async findByIdAndDelete(id) {
      const doc = await collection.findOne({ _id: id });
      if (!doc) return null;
      await collection.remove({ _id: id });
      return { toJSON: () => doc, _doc: doc, ...doc };
    },

    // COUNT
    async countDocuments(filter = {}) {
      return await collection.count(filter);
    },

    // POPULATE
    populate(items, field) {
      return items.map(item => {
        if (!item[field]) return item;
        const refCollection = getDb().getCollection(field === 'createdBy' ? 'user' : field);
        // Laisser l'ID tel quel si pas de référence
        return item;
      });
    },

    // AGGREGATE (simplifié)
    async aggregate(pipeline) {
      let docs = await collection.find({});
      for (const stage of pipeline) {
        if (stage.$match) {
          docs = docs.filter(d => {
            return Object.entries(stage.$match).every(([k, v]) => {
              if (v && typeof v === 'object' && v.$gte) {
                return new Date(d[k]).getTime() >= new Date(v.$gte).getTime();
              }
              if (v && typeof v === 'object' && v.$lte) {
                return new Date(d[k]).getTime() <= new Date(v.$lte).getTime();
              }
              return d[k] === v;
            });
          });
        }
        if (stage.$group) {
          const grouped = {};
          docs.forEach(d => {
            const key = d._id;
            if (!grouped[key]) grouped[key] = { _id: key, total: 0, count: 0 };
            grouped[key].total += d.totalVolume || 0;
            grouped[key].count++;
          });
          docs = Object.values(grouped);
        }
        if (stage.$sort) {
          const [key, dir] = Object.entries(stage.$sort)[0];
          docs.sort((a, b) => {
            const va = a[key] || 0;
            const vb = b[key] || 0;
            return dir * (va > vb ? 1 : -1);
          });
        }
      }
      return docs;
    },

    // SORT helper
    sort(sortObj) {
      return {
        then: async (resolve) => {
          let docs = await collection.find({});
          const [key, dir] = Object.entries(sortObj)[0];
          docs.sort((a, b) => dir * ((a[key] || '') > (b[key] || '') ? 1 : -1));
          resolve(docs.map(d => ({ toJSON: () => d, _doc: d, ...d })));
        }
      };
    }
  };
}

module.exports = { getModel };