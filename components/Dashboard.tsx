import React from 'react';
import { Lapin, Reproduction, Tache, Transaction, StatutLapin, TypeTransaction } from '../types';
import { Rabbit, Activity, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  lapins: Lapin[];
  reproductions: Reproduction[];
  transactions: Transaction[];
  taches: Tache[];
}

const Dashboard: React.FC<DashboardProps> = ({ lapins, reproductions, transactions, taches }) => {
  const totalLapins = lapins.filter(l => l.statut !== StatutLapin.DECEDE && l.statut !== StatutLapin.VENDU).length;
  const activeReproductions = reproductions.filter(r => r.statut !== 'TERMINE').length;
  
  const totalRecettes = transactions
    .filter(t => t.type === TypeTransaction.VENTE)
    .reduce((acc, curr) => acc + curr.montant, 0);
    
  const totalDepenses = transactions
    .filter(t => t.type === TypeTransaction.DEPENSE || t.type === TypeTransaction.ACHAT)
    .reduce((acc, curr) => acc + curr.montant, 0);

  const solde = totalRecettes - totalDepenses;

  const urgentTasks = taches.filter(t => !t.terminee).slice(0, 5);

  const dataFinance = [
    { name: 'Recettes', amount: totalRecettes, color: '#16a34a' }, // emerald-600
    { name: 'Dépenses', amount: totalDepenses, color: '#ef4444' }, // red-500
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tableau de bord</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Cheptel Actif</span>
            <Rabbit className="w-5 h-5 text-cuni-600 dark:text-cuni-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalLapins}</div>
          <div className="text-xs text-cuni-600 dark:text-cuni-400 font-medium">+2 ce mois</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Reproduction</span>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeReproductions}</div>
          <div className="text-xs text-blue-500 font-medium">Portées en cours</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Solde</span>
            <DollarSign className="w-5 h-5 text-yellow-500" />
          </div>
          <div className={`text-2xl font-bold ${solde >= 0 ? 'text-cuni-600 dark:text-cuni-400' : 'text-red-500'}`}>
            {solde.toFixed(2)} €
          </div>
          <div className="text-xs text-gray-400 font-medium">Global</div>
        </div>

         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Tâches</span>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{urgentTasks.length}</div>
          <div className="text-xs text-purple-500 font-medium">À faire</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
            Finances
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataFinance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                    backgroundColor: '#1f2937',
                    color: '#f3f4f6'
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {dataFinance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">À Faire</h3>
          {urgentTasks.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune tâche urgente.</p>
          ) : (
            <ul className="space-y-3">
              {urgentTasks.map(task => (
                <li key={task.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                  <div className={`w-2 h-10 rounded-full mr-3 ${
                    task.type === 'VACCIN' ? 'bg-red-400' :
                    task.type === 'PALPATION' ? 'bg-blue-400' : 'bg-gray-400'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{task.titre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pour le {new Date(task.dateEcheance).toLocaleDateString('fr-FR')}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;