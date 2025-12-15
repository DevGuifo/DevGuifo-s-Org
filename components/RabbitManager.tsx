import React, { useState } from 'react';
import { Lapin, Sexe, StatutLapin, Vaccination } from '../types';
import { RACES_COMMUNES, SEXE_LABELS, STATUS_LABELS } from '../constants';
import { Plus, Search, Filter, Edit2, Trash2, X, Save, Camera, LineChart as LineChartIcon, CheckSquare, Square, RefreshCw, AlertTriangle, GitFork, ShieldCheck, Syringe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RabbitManagerProps {
  lapins: Lapin[];
  vaccinations: Vaccination[];
  onAdd: (lapin: Lapin) => void;
  onUpdate: (lapin: Lapin) => void;
  onDelete: (id: string) => void;
}

const RabbitManager: React.FC<RabbitManagerProps> = ({ lapins, vaccinations, onAdd, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentRabbit, setCurrentRabbit] = useState<Partial<Lapin>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSexe, setFilterSexe] = useState<'ALL' | Sexe>('ALL');
  
  // États pour la sélection multiple
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<StatutLapin | ''>('');

  // État pour la confirmation de suppression
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'SINGLE' | 'BULK', id?: string } | null>(null);

  // État pour la modale du graphique
  const [statRabbit, setStatRabbit] = useState<Lapin | null>(null);

  // État pour la modale de généalogie
  const [pedigreeRabbit, setPedigreeRabbit] = useState<Lapin | null>(null);

  const filteredLapins = lapins.filter(l => {
    const matchesSearch = l.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (l.tatouage && l.tatouage.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSexe = filterSexe === 'ALL' || l.sexe === filterSexe;
    return matchesSearch && matchesSexe;
  });

  const getVaccinationStatus = (lapinId: string) => {
    const lastVaccin = vaccinations
      .filter(v => v.lapinId === lapinId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastVaccin) return 'NONE';
    
    if (lastVaccin.prochainRappel) {
      const today = new Date();
      const rappelDate = new Date(lastVaccin.prochainRappel);
      // On compare seulement les dates, pas les heures
      today.setHours(0,0,0,0);
      rappelDate.setHours(0,0,0,0);

      if (rappelDate < today) return 'EXPIRED';
      
      const diffTime = rappelDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 30) return 'SOON';
    }

    return 'OK';
  };

  const handleOpenForm = (lapin?: Lapin) => {
    if (lapin) {
      setCurrentRabbit({ ...lapin });
    } else {
      setCurrentRabbit({
        id: Date.now().toString(),
        nom: '',
        race: RACES_COMMUNES[0],
        sexe: Sexe.FEMELLE,
        couleur: '',
        dateNaissance: new Date().toISOString().split('T')[0],
        poidsActuel: 0,
        statut: StatutLapin.ACTIF,
        cage: ''
      });
    }
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRabbit.nom) return;

    let finalRabbit = { ...currentRabbit } as Lapin;

    // Logique de mise à jour de l'historique de poids
    const existingRabbit = lapins.find(l => l.id === finalRabbit.id);
    const hasWeightChanged = !existingRabbit || existingRabbit.poidsActuel !== finalRabbit.poidsActuel;

    if (hasWeightChanged && finalRabbit.poidsActuel > 0) {
      const newEntry = {
        date: new Date().toISOString().split('T')[0],
        poids: finalRabbit.poidsActuel
      };
      
      finalRabbit.poidsHistorique = [
        ...(existingRabbit?.poidsHistorique || []),
        newEntry
      ];
    } else if (existingRabbit) {
      // Préserver l'historique si on modifie autre chose que le poids
      finalRabbit.poidsHistorique = existingRabbit.poidsHistorique;
    }

    if (existingRabbit) {
      onUpdate(finalRabbit);
    } else {
      // Initialiser l'historique pour un nouveau lapin si poids renseigné
      if (finalRabbit.poidsActuel > 0 && !finalRabbit.poidsHistorique) {
        finalRabbit.poidsHistorique = [{
          date: new Date().toISOString().split('T')[0],
          poids: finalRabbit.poidsActuel
        }];
      }
      onAdd(finalRabbit);
    }
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentRabbit(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestion de la sélection multiple
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLapins.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLapins.map(l => l.id)));
    }
  };

  const handleBulkDelete = () => {
    setDeleteConfirm({ type: 'BULK' });
  };

  const performDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'SINGLE' && deleteConfirm.id) {
      onDelete(deleteConfirm.id);
    } else if (deleteConfirm.type === 'BULK') {
      selectedIds.forEach(id => onDelete(id));
      setSelectedIds(new Set());
    }
    setDeleteConfirm(null);
  };

  const handleBulkStatusChange = () => {
    if (!bulkStatus) return;
    if (window.confirm(`Voulez-vous changer le statut de ${selectedIds.size} lapins en "${STATUS_LABELS[bulkStatus]}" ?`)) {
      selectedIds.forEach(id => {
        const rabbit = lapins.find(l => l.id === id);
        if (rabbit) {
          onUpdate({ ...rabbit, statut: bulkStatus });
        }
      });
      setSelectedIds(new Set());
      setBulkStatus('');
    }
  };

  // Helper pour afficher une carte de généalogie
  const PedigreeCard = ({ id, role, emptyLabel }: { id?: string, role: string, emptyLabel: string }) => {
    const rabbit = lapins.find(l => l.id === id);
    
    if (!rabbit) {
      return (
        <div className="flex flex-col justify-center items-center p-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg h-full min-h-[80px] bg-gray-50 dark:bg-gray-700/30">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">{role}</span>
          <span className="text-sm text-gray-400 dark:text-gray-500 italic text-center">{emptyLabel}</span>
        </div>
      );
    }

    const isMale = rabbit.sexe === Sexe.MALE;
    const colorClass = isMale 
      ? 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-100' 
      : 'bg-pink-50 border-pink-200 text-pink-900 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-100';

    return (
      <div className={`flex flex-col p-2 border rounded-lg h-full min-h-[80px] shadow-sm relative overflow-hidden ${colorClass}`}>
        <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1">{role}</span>
        <div className="font-bold text-sm truncate">{rabbit.nom}</div>
        <div className="text-xs opacity-80 truncate">{rabbit.race}</div>
        {rabbit.tatouage && <div className="text-[10px] opacity-70 mt-auto">{rabbit.tatouage}</div>}
      </div>
    );
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {currentRabbit.id && lapins.find(l => l.id === currentRabbit.id) ? 'Modifier' : 'Ajouter'} un lapin
          </h2>
          <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom / Numéro</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cuni-500 focus:border-cuni-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={currentRabbit.nom || ''}
                onChange={e => setCurrentRabbit({ ...currentRabbit, nom: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tatouage / Puce</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cuni-500 focus:border-cuni-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={currentRabbit.tatouage || ''}
                onChange={e => setCurrentRabbit({ ...currentRabbit, tatouage: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Race</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cuni-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={currentRabbit.race}
                onChange={e => setCurrentRabbit({ ...currentRabbit, race: e.target.value })}
              >
                {RACES_COMMUNES.map(race => (
                  <option key={race} value={race}>{race}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sexe</label>
              <div className="flex space-x-4 mt-2">
                <label className="inline-flex items-center text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    className="form-radio text-cuni-600"
                    name="sexe"
                    checked={currentRabbit.sexe === Sexe.MALE}
                    onChange={() => setCurrentRabbit({ ...currentRabbit, sexe: Sexe.MALE })}
                  />
                  <span className="ml-2">Mâle</span>
                </label>
                <label className="inline-flex items-center text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    className="form-radio text-cuni-600"
                    name="sexe"
                    checked={currentRabbit.sexe === Sexe.FEMELLE}
                    onChange={() => setCurrentRabbit({ ...currentRabbit, sexe: Sexe.FEMELLE })}
                  />
                  <span className="ml-2">Femelle</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de Naissance</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={currentRabbit.dateNaissance}
                onChange={e => setCurrentRabbit({ ...currentRabbit, dateNaissance: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poids (kg)</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={currentRabbit.poidsActuel}
                onChange={e => setCurrentRabbit({ ...currentRabbit, poidsActuel: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Changer le poids ajoutera une entrée à l'historique.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={currentRabbit.statut}
                onChange={e => setCurrentRabbit({ ...currentRabbit, statut: e.target.value as StatutLapin })}
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cage / Localisation</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={currentRabbit.cage || ''}
                onChange={e => setCurrentRabbit({ ...currentRabbit, cage: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <GitFork className="w-4 h-4" /> Généalogie
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Père (ID)</label>
                  <select
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                     value={currentRabbit.pereId || ''}
                     onChange={e => setCurrentRabbit({ ...currentRabbit, pereId: e.target.value })}
                  >
                     <option value="">Inconnu</option>
                     {lapins.filter(l => l.sexe === Sexe.MALE && l.id !== currentRabbit.id).map(l => (
                       <option key={l.id} value={l.id}>{l.nom} ({l.tatouage || '?'})</option>
                     ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mère (ID)</label>
                  <select
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                     value={currentRabbit.mereId || ''}
                     onChange={e => setCurrentRabbit({ ...currentRabbit, mereId: e.target.value })}
                  >
                     <option value="">Inconnue</option>
                     {lapins.filter(l => l.sexe === Sexe.FEMELLE && l.id !== currentRabbit.id).map(l => (
                       <option key={l.id} value={l.id}>{l.nom} ({l.tatouage || '?'})</option>
                     ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo</label>
              <div className="flex items-center space-x-4">
                {currentRabbit.photoUrl && (
                  <img src={currentRabbit.photoUrl} alt="Aperçu" className="w-16 h-16 rounded-full object-cover border dark:border-gray-600" />
                )}
                <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Choisir une photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
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
    );
  }

  return (
    <div className="pb-28 md:pb-0 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Mes Lapins</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={toggleSelectAll}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1 md:flex-none justify-center"
          >
             {selectedIds.size === filteredLapins.length && filteredLapins.length > 0 ? (
               <CheckSquare className="w-5 h-5 mr-2 text-cuni-600 dark:text-cuni-400" />
             ) : (
               <Square className="w-5 h-5 mr-2 text-gray-400" />
             )}
            Tout
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="bg-cuni-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-cuni-700 transition-colors flex-1 md:flex-none justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, tatouage..."
              className="pl-10 w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cuni-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <button
              onClick={() => setFilterSexe('ALL')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filterSexe === 'ALL' ? 'bg-gray-800 dark:bg-gray-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterSexe(Sexe.MALE)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filterSexe === Sexe.MALE ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            >
              Mâles
            </button>
            <button
              onClick={() => setFilterSexe(Sexe.FEMELLE)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filterSexe === Sexe.FEMELLE ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            >
              Femelles
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLapins.map(lapin => {
          const vacStatus = getVaccinationStatus(lapin.id);
          
          return (
            <div 
              key={lapin.id} 
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all ${
                selectedIds.has(lapin.id) 
                  ? 'border-cuni-500 ring-1 ring-cuni-500 dark:border-cuni-400 dark:ring-cuni-400' 
                  : 'border-gray-100 dark:border-gray-700'
              } p-4 flex gap-4`}
            >
              {/* Checkbox de sélection */}
              <div className="absolute top-2 left-2 z-10">
                <button onClick={() => toggleSelection(lapin.id)} className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                  {selectedIds.has(lapin.id) ? (
                    <CheckSquare className="w-5 h-5 text-cuni-600 dark:text-cuni-400" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden ml-4">
                {lapin.photoUrl ? (
                  <img src={lapin.photoUrl} alt={lapin.nom} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{lapin.nom}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{lapin.tatouage || 'Pas de tatouage'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    lapin.sexe === Sexe.MALE ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                  }`}>
                    {SEXE_LABELS[lapin.sexe]}
                  </span>
                </div>
                
                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>{lapin.race}</p>
                  <p className="text-xs">Cage: <span className="font-semibold">{lapin.cage || 'N/A'}</span></p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs">Statut: <span className={`font-semibold ${lapin.statut === StatutLapin.ACTIF ? 'text-green-600 dark:text-green-400' : ''}`}>{STATUS_LABELS[lapin.statut]}</span></p>
                    
                    {/* Indicateur Vaccin */}
                    <div className="flex items-center" title="Statut Vaccinal">
                      {vacStatus === 'OK' && <ShieldCheck className="w-4 h-4 text-green-500" />}
                      {vacStatus === 'SOON' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                      {vacStatus === 'EXPIRED' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {vacStatus === 'NONE' && <Syringe className="w-4 h-4 text-gray-300" />}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-3 border-t border-gray-100 dark:border-gray-700 pt-2">
                  <button 
                    onClick={() => setPedigreeRabbit(lapin)}
                    className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                    title="Généalogie"
                  >
                    <GitFork className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setStatRabbit(lapin)}
                    className="p-1.5 text-cuni-600 dark:text-cuni-400 hover:bg-cuni-50 dark:hover:bg-cuni-900/20 rounded-lg"
                    title="Voir évolution poids"
                  >
                    <LineChartIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleOpenForm(lapin)}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm({ type: 'SINGLE', id: lapin.id })}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredLapins.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400">
            Aucun lapin trouvé.
          </div>
        )}
      </div>

       {/* Floating Action Bar for Bulk Selection */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 md:px-0 md:left-64 z-40 flex justify-center animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row items-center gap-3 md:gap-6 w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-white border-r border-gray-200 dark:border-gray-700 pr-4">
              <span className="bg-cuni-600 text-white text-xs rounded-full px-2 py-0.5">{selectedIds.size}</span>
              <span className="text-sm hidden md:inline">sélectionnés</span>
            </div>

            <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
               <select
                  className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cuni-500"
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as StatutLapin)}
               >
                 <option value="">Changer statut...</option>
                 {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
               </select>
               <button 
                 onClick={handleBulkStatusChange}
                 disabled={!bulkStatus}
                 className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-200 dark:hover:bg-blue-900/50"
                 title="Appliquer le statut"
               >
                 <RefreshCw className="w-4 h-4" />
               </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
               <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-sm font-medium transition-colors"
               >
                 <Trash2 className="w-4 h-4" />
                 Supprimer
               </button>
               <button 
                onClick={() => setSelectedIds(new Set())}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg"
                title="Annuler la sélection"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Généalogie */}
      {pedigreeRabbit && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setPedigreeRabbit(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl p-6 overflow-x-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                 <GitFork className="w-6 h-6 mr-2 text-purple-600" />
                 Généalogie : {pedigreeRabbit.nom}
              </h3>
              <button onClick={() => setPedigreeRabbit(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="min-w-[800px]">
              <div className="grid grid-cols-3 gap-6 h-[400px]">
                {/* Generation 1: Enfant */}
                <div className="flex flex-col justify-center">
                   <div className="h-full max-h-[120px]">
                     <PedigreeCard id={pedigreeRabbit.id} role="Sujet" emptyLabel="-" />
                   </div>
                </div>

                {/* Generation 2: Parents */}
                <div className="flex flex-col justify-around gap-4">
                   <div className="h-full max-h-[100px]">
                     <PedigreeCard id={pedigreeRabbit.pereId} role="Père" emptyLabel="Père inconnu" />
                   </div>
                   <div className="h-full max-h-[100px]">
                     <PedigreeCard id={pedigreeRabbit.mereId} role="Mère" emptyLabel="Mère inconnue" />
                   </div>
                </div>

                {/* Generation 3: Grands-Parents */}
                <div className="flex flex-col justify-between gap-2">
                   {/* Grand-parents paternels */}
                   <div className="h-full max-h-[80px]">
                     <PedigreeCard 
                       id={lapins.find(l => l.id === pedigreeRabbit.pereId)?.pereId} 
                       role="Grand-Père (P)" 
                       emptyLabel="Inconnu" 
                     />
                   </div>
                   <div className="h-full max-h-[80px]">
                     <PedigreeCard 
                       id={lapins.find(l => l.id === pedigreeRabbit.pereId)?.mereId} 
                       role="Grand-Mère (P)" 
                       emptyLabel="Inconnue" 
                     />
                   </div>
                   
                   {/* Divider visuel (optionnel) */}
                   <div className="h-4"></div>

                   {/* Grand-parents maternels */}
                   <div className="h-full max-h-[80px]">
                     <PedigreeCard 
                       id={lapins.find(l => l.id === pedigreeRabbit.mereId)?.pereId} 
                       role="Grand-Père (M)" 
                       emptyLabel="Inconnu" 
                     />
                   </div>
                   <div className="h-full max-h-[80px]">
                      <PedigreeCard 
                       id={lapins.find(l => l.id === pedigreeRabbit.mereId)?.mereId} 
                       role="Grand-Mère (M)" 
                       emptyLabel="Inconnue" 
                     />
                   </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center flex justify-center gap-6">
               <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-sm"></span> Mâles</span>
               <span className="flex items-center gap-2"><span className="w-3 h-3 bg-pink-100 dark:bg-pink-900 border border-pink-200 dark:border-pink-700 rounded-sm"></span> Femelles</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Statistiques */}
      {statRabbit && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setStatRabbit(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Évolution du poids : {statRabbit.nom}</h3>
              <button onClick={() => setStatRabbit(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="h-64 w-full">
              {statRabbit.poidsHistorique && statRabbit.poidsHistorique.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statRabbit.poidsHistorique}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit'})}
                      tick={{fontSize: 12, fill: '#9ca3af'}}
                    />
                    <YAxis unit=" kg" domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{fill: '#9ca3af'}} />
                    <Tooltip 
                       contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                        backgroundColor: '#1f2937',
                        color: '#f3f4f6'
                       }}
                       labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                    />
                    <Line type="monotone" dataKey="poids" stroke="#16a34a" strokeWidth={2} dot={{fill: '#16a34a'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <LineChartIcon className="w-10 h-10 mb-2 opacity-50" />
                  <p>Pas assez de données pour afficher le graphique.</p>
                  <p className="text-xs mt-1">Mettez à jour le poids pour commencer le suivi.</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              Poids actuel : <span className="font-bold text-gray-800 dark:text-white">{statRabbit.poidsActuel} kg</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {deleteConfirm.type === 'SINGLE' 
                  ? "Êtes-vous sûr de vouloir supprimer ce lapin ? Cette action est irréversible et toutes les données associées seront perdues."
                  : `Êtes-vous sûr de vouloir supprimer ces ${selectedIds.size} lapins ? Cette action est irréversible.`
                }
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={performDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RabbitManager;