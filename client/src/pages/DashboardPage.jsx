import { useState, useEffect } from 'react';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
    </div>
  );

  const cards = [
    { label: 'Collectes totales', value: stats?.totalCollectes },
    { label: 'Terminées', value: stats?.collectesTerminees },
    { label: 'En cours', value: stats?.collectesEnCours },
    { label: 'Planifiées', value: stats?.collectesPlanifiees },
    { label: 'Sites actifs', value: stats?.sitesActifs },
    { label: 'Véhicules actifs', value: stats?.vehiclesActifs },
    { label: 'Abonnements actifs', value: stats?.abonnementsActifs },
    { label: 'Volume total (kg/L)', value: stats?.volumeTotal },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-8">
        Tableau de bord
      </h1>

      {/* Bento cards style xAI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors cursor-default"
          >
            <p className="text-sm text-gray-400 font-light mb-2">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {card.value ?? <span className="text-gray-200">—</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Graphique 30 jours */}
      {stats?.collectesParJour?.length > 0 && (
        <div className="mt-10 bg-gray-50 rounded-2xl p-6">
          <h2 className="text-base font-medium text-gray-700 mb-5">
            Collectes — 30 derniers jours
          </h2>
          <div className="flex items-end gap-1.5 h-40">
            {stats.collectesParJour.map((day) => {
              const maxCount = Math.max(...stats.collectesParJour.map(d => d.count));
              const height = maxCount > 0 ? Math.max(8, (day.count / maxCount) * 160) : 8;
              return (
                <div key={day._id} className="flex-1 flex flex-col items-center group">
                  <span className="text-[10px] text-gray-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </span>
                  <div
                    className="w-full bg-gray-300 rounded-sm transition-all group-hover:bg-gray-900"
                    style={{ height: `${height}px` }}
                    title={`${day._id}: ${day.count} collectes`}
                  ></div>
                  <span className="text-[10px] text-gray-300 mt-1.5 truncate w-full text-center">
                    {day._id.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}