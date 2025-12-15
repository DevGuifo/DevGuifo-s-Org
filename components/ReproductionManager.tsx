import React, { useState } from 'react';
import { Lapin, Reproduction, Sexe, StatutReproduction } from '../types';
import { Plus, Calendar, Baby, Heart, Save, X, Activity, Check } from 'lucide-react';
import { DUREE_GESTATION } from '../constants';

interface ReproductionManagerProps {
  reproductions: Reproduction[];
  lapins: Lapin[];
  onAdd: (repro: Reproduction) => void;
  onUpdate: (repro: Reproduction) => void;
}

const ReproductionManager: React.FC<ReproductionManagerProps> = ({ reproductions, lapins, onAdd, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [newRepro, setNewRepro] = useState<Partial<Reproduction>>({
    dateAccouplement: new Date().toISOString().split('T')[0]
  });

  // Modal State
  const [selectedRepro, setSelectedRepro] = useState<Reproduction | null>(null);
  const [birthData, setBirthData] = useState({
    date: new Date().toISOString().split('T')[0],
    nes: 0,
    vivants: 0
  });

  const males = lapins.filter(l => l.sexe === Sexe.MALE);
  const femelles = lapins.filter(l => l.sexe === Sexe.FEMELLE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepro.pereId || !newRepro.mereId || !newRepro.dateAccouplement) return;

    const dateAcc = new Date(newRepro.dateAccouplement);
    const datePrevue = new Date(dateAcc.setDate(dateAcc.getDate() + DUREE_GESTATION));

    const reproduction: Reproduction = {
      id: Date.now().toString(),
      pereId: newRepro.pereId,
      mereId: newRepro.mereId,
      dateAccouplement: newRepro.dateAccouplement,
      dateMiseBasPrevue: datePrevue.toISOString().split('T')[0],
      statut: StatutReproduction.ACCOUPLEMENT
    };

    onAdd(reproduction);
    setShowForm(false);
    setNewRepro({ dateAccouplement: new Date().toISOString().split('T')[0] });
  };

  const updateStatus = (repro: Reproduction, newStatus: StatutReproduction) => {
    onUpdate({ ...repro, statut: newStatus });
  };

  const openBirthModal = (repro: Reproduction) => {
    setSelectedRepro(repro);
    setBirthData({
      date: new Date().toISOString().split('T')[0],
      nes: 0,
      vivants: 0
    });
  };

  const handleBirthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepro) return;
    
    onUpdate({
      ...selectedRepro,
      statut: StatutReproduction.MISE_BAS,
      dateMiseBasReelle: birthData.date,
      nombreNes: Number(birthData.nes),
      nombreVivants: Number(birthData.vivants)
    });
    setSelectedRepro(null);
  };

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Reproduction</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-cuni-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-cuni-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvel Accouplement
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6 border-l-4 border-cuni-500 dark:border-cuni-400">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Planifier un accouplement</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mâle</label>
              <select 
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                onChange={e => setNewRepro({...newRepro, pereId: e.target.value})}
                value={newRepro.pereId || ''}
              >
                <option value="">Choisir...</option>
                {males.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Femelle</label>
              <select 
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                onChange={e => setNewRepro({...newRepro, mereId: e.target.value})}
                value={newRepro.mereId || ''}
              >
                <option value="">Choisir...</option>
                {femelles.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                value={newRepro.dateAccouplement}
                onChange={e => setNewRepro({...newRepro, dateAccouplement: e.target.value})}
              />
            </div>
            <button type="submit" className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-900 dark:hover:bg-gray-600">
              Valider
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {reproductions.map(repro => {
          const pere = lapins.find(l => l.id === repro.pereId);
          const mere = lapins.find(l => l.id === repro.mereId);
          
          return (
            <div key={repro.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="bg-pink-100 dark:bg-pink-900/40 p-3 rounded-full flex-shrink-0">
                  <Heart className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {pere?.nom || 'Inconnu'} + {mere?.nom || 'Inconnue'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Accouplement: {new Date(repro.dateAccouplement).toLocaleDateString()}
                  </div>
                  {repro.statut === StatutReproduction.ACCOUPLEMENT && (
                     <div className="text-sm text-cuni-600 dark:text-cuni-400 font-medium flex items-center gap-2">
                        <Baby className="w-3 h-3" />
                        Mise bas prévue: {new Date(repro.dateMiseBasPrevue).toLocaleDateString()}
                     </div>
                  )}
                  {(repro.statut !== StatutReproduction.ACCOUPLEMENT && repro.nombreNes !== undefined) && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2 mt-1">
                        <Activity className="w-3 h-3 text-cuni-500" />
                        <span>Résultat: {repro.nombreNes} nés / {repro.nombreVivants} vivants</span>
                      </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  repro.statut === StatutReproduction.TERMINE ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                }`}>
                  {repro.statut}
                </span>

                {repro.statut === StatutReproduction.ACCOUPLEMENT && (
                  <button 
                    onClick={() => openBirthModal(repro)}
                    className="text-xs bg-cuni-100 dark:bg-cuni-900/40 text-cuni-700 dark:text-cuni-300 px-3 py-1 rounded hover:bg-cuni-200 dark:hover:bg-cuni-900/60"
                  >
                    Valider Mise Bas
                  </button>
                )}
                 {repro.statut === StatutReproduction.MISE_BAS && (
                  <button 
                    onClick={() => updateStatus(repro, StatutReproduction.SEVRAGE)}
                    className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-3 py-1 rounded hover:bg-orange-200 dark:hover:bg-orange-900/60"
                  >
                    Sevrage
                  </button>
                )}
                 {repro.statut === StatutReproduction.SEVRAGE && (
                  <button 
                    onClick={() => updateStatus(repro, StatutReproduction.TERMINE)}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Terminer
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {reproductions.length === 0 && (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                Aucune reproduction enregistrée.
            </div>
        )}
      </div>

       {/* Modal Mise Bas */}
       {selectedRepro && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRepro(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <Baby className="w-6 h-6 mr-2 text-cuni-500" />
                Validation Mise Bas
              </h3>
              <button onClick={() => setSelectedRepro(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBirthSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de Mise Bas</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={birthData.date}
                    onChange={e => setBirthData({...birthData, date: e.target.value})}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Nés</label>
                      <input
                        type="number"
                        min="0"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={birthData.nes}
                        onChange={e => setBirthData({...birthData, nes: parseInt(e.target.value)})}
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nés Vivants</label>
                      <input
                        type="number"
                        min="0"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={birthData.vivants}
                        onChange={e => setBirthData({...birthData, vivants: parseInt(e.target.value)})}
                      />
                   </div>
               </div>
               
               <div className="flex justify-end pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRepro(null)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cuni-600 text-white rounded-lg hover:bg-cuni-700 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReproductionManager;