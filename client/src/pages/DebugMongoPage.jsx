import { useState, useEffect } from 'react';
import api from '../services/api';

export default function DebugMongoPage() {
  const [dbInfo, setDbInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/debug/mongo')
      .then(({ data }) => setDbInfo(data))
      .catch(() => setDbInfo({ error: 'Impossible de contacter le serveur' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-8">Diagnostic MongoDB</h1>

      {dbInfo && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Statut</p>
                <p className={`text-sm font-medium ${dbInfo.connected ? 'text-gray-900' : 'text-red-500'}`}>
                  {dbInfo.connected ? '✅ Connecté' : '❌ Déconnecté'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Mode</p>
                <p className="text-sm font-medium text-gray-900">{dbInfo.mode}</p>
              </div>
              {dbInfo.uri && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">URI</p>
                  <p className="text-xs text-gray-500 break-all">{dbInfo.uri}</p>
                </div>
              )}
            </div>
          </div>

          {dbInfo.logFile && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Logs</p>
              <pre className="text-xs text-gray-500 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                {dbInfo.logFile}
              </pre>
            </div>
          )}

          {dbInfo.instructions && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Instructions de résolution</p>
              <ul className="space-y-2">
                {dbInfo.instructions.map((inst, i) => (
                  <li key={i} className="text-sm text-gray-500 font-light flex items-start gap-2">
                    <span className="text-gray-300 mt-0.5">•</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}