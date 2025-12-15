import React, { useState } from 'react';
import { Transaction, TypeTransaction } from '../types';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FinanceManagerProps {
  transactions: Transaction[];
  onAdd: (t: Transaction) => void;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ transactions, onAdd }) => {
  const [showForm, setShowForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: TypeTransaction.DEPENSE,
    montant: 0,
    categorie: '',
    description: ''
  });

  const totalRecettes = transactions
    .filter(t => t.type === TypeTransaction.VENTE)
    .reduce((acc, curr) => acc + curr.montant, 0);

  const totalDepenses = transactions
    .filter(t => t.type !== TypeTransaction.VENTE)
    .reduce((acc, curr) => acc + curr.montant, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.montant || !newTransaction.description) return;

    onAdd({
      id: Date.now().toString(),
      date: newTransaction.date!,
      montant: Number(newTransaction.montant),
      type: newTransaction.type!,
      categorie: newTransaction.categorie || 'Autre',
      description: newTransaction.description!
    });

    setShowForm(false);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      type: TypeTransaction.DEPENSE,
      montant: 0,
      categorie: '',
      description: ''
    });
  };

  const pieData = [
    { name: 'Ventes', value: totalRecettes, color: '#16a34a' },
    { name: 'Dépenses', value: totalDepenses, color: '#ef4444' }
  ];

  return (
    <div className="pb-20 md:pb-0 h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Finances</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-cuni-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-cuni-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Opération
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6 border-l-4 border-cuni-500 dark:border-cuni-400">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select 
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={newTransaction.type}
                onChange={e => setNewTransaction({...newTransaction, type: e.target.value as TypeTransaction})}
              >
                <option value={TypeTransaction.DEPENSE}>Dépense</option>
                <option value={TypeTransaction.ACHAT}>Achat (Lapin)</option>
                <option value={TypeTransaction.VENTE}>Vente (Recette)</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant (€)</label>
              <input 
                type="number" step="0.01"
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={newTransaction.montant}
                onChange={e => setNewTransaction({...newTransaction, montant: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <input 
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Granulés 25kg"
                value={newTransaction.description}
                onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
              <input 
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Alimentation, Soins..."
                value={newTransaction.categorie}
                onChange={e => setNewTransaction({...newTransaction, categorie: e.target.value})}
              />
            </div>
            <button type="submit" className="md:col-span-2 bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-900 dark:hover:bg-gray-600 mt-2">
              Enregistrer
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                <TrendingUp className="w-4 h-4" /> Recettes
              </div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-300">{totalRecettes.toFixed(2)} €</div>
            </div>
            <div className="flex-1 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1">
                <TrendingDown className="w-4 h-4" /> Dépenses
              </div>
              <div className="text-2xl font-bold text-red-800 dark:text-red-300">{totalDepenses.toFixed(2)} €</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                <tr>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Description</th>
                  <th className="p-3 font-medium">Catégorie</th>
                  <th className="p-3 font-medium text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-3 text-sm text-gray-900 dark:text-gray-200 font-medium">{t.description}</td>
                    <td className="p-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{t.categorie}</span>
                    </td>
                    <td className={`p-3 text-sm font-bold text-right ${t.type === TypeTransaction.VENTE ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === TypeTransaction.VENTE ? '+' : '-'}{t.montant.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 self-start">Répartition</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                        backgroundColor: '#1f2937',
                        color: '#f3f4f6'
                       }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <span className="text-gray-400 dark:text-gray-500 text-sm">Bénéfice Net</span>
              <div className={`text-3xl font-bold ${(totalRecettes - totalDepenses) >= 0 ? 'text-cuni-600 dark:text-cuni-400' : 'text-red-500 dark:text-red-400'}`}>
                {(totalRecettes - totalDepenses).toFixed(2)} €
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceManager;