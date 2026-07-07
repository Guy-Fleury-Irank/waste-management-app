/**
 * Utilitaires d'exportation de données (JSON / CSV)
 * Utilisation : import { exportToJSON, exportToCSV } from '../utils/exportUtils';
 */

/**
 * Exporte un tableau d'objets au format JSON et déclenche le téléchargement.
 * @param {Array} data - Tableau d'objets à exporter
 * @param {string} filename - Nom du fichier (sans extension)
 */
export function exportToJSON(data, filename = 'export') {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ exportToJSON : Aucune donnée à exporter');
      return;
    }

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ Fichier JSON téléchargé : ${filename}.json (${data.length} entrées)`);
  } catch (error) {
    console.error('❌ Erreur exportToJSON :', error);
  }
}

/**
 * Exporte un tableau d'objets au format CSV et déclenche le téléchargement.
 * Utilise le point-virgule (;) comme séparateur pour compatibilité Excel français.
 * @param {Array} data - Tableau d'objets à exporter
 * @param {string} filename - Nom du fichier (sans extension)
 */
export function exportToCSV(data, filename = 'export') {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ exportToCSV : Aucune donnée à exporter');
      return;
    }

    // Extraire les en-têtes à partir des clés du premier objet
    const headers = Object.keys(data[0]);

    // Construire la ligne d'en-tête
    const headerRow = headers
      .map(header => `"${String(header).replace(/"/g, '""')}"`)
      .join(';');

    // Construire les lignes de données
    const dataRows = data.map(item => {
      return headers
        .map(header => {
          let value = item[header];
          // Gérer les objets imbriqués (ex: site.name, vehicle.plate)
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }
          if (value === null || value === undefined) {
            return '""';
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(';');
    });

    // Assembler le CSV complet avec BOM UTF-8 pour Excel
    const bom = '\uFEFF';
    const csvContent = bom + [headerRow, ...dataRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ Fichier CSV téléchargé : ${filename}.csv (${data.length} entrées)`);
  } catch (error) {
    console.error('❌ Erreur exportToCSV :', error);
  }
}