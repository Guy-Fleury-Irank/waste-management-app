import { exportToJSON, exportToCSV } from '../utils/exportUtils';

/**
 * Composant réutilisable de boutons d'exportation (JSON / CSV).
 * @param {Object} props
 * @param {Array} props.data - Tableau d'objets à exporter
 * @param {string} props.filename - Nom de base du fichier (sans extension)
 * @param {string} [props.className] - Classes supplémentaires pour le conteneur
 */
export default function ExportButtons({ data, filename = 'export', className = '' }) {
  const handleExportJSON = () => {
    try {
      exportToJSON(data, filename);
    } catch (error) {
      console.error('❌ Erreur export JSON :', error);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(data, filename);
    } catch (error) {
      console.error('❌ Erreur export CSV :', error);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleExportJSON}
        className="px-3 py-1.5 text-xs font-medium rounded-sm bg-surface border border-border text-muted hover:text-strong hover:border-strong transition-colors"
      >
        Exporter JSON
      </button>
      <button
        onClick={handleExportCSV}
        className="px-3 py-1.5 text-xs font-medium rounded-sm bg-surface border border-border text-muted hover:text-strong hover:border-strong transition-colors"
      >
        Exporter CSV
      </button>
    </div>
  );
}