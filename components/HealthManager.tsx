import React, { useState } from 'react';
import { Lapin, Vaccination, Tache, StatutLapin, NoteSante, TypeNote, PlanAlimentaire } from '../types';
import { Syringe, Plus, Calendar, Trash2, Search, CheckCircle, AlertTriangle, ShieldCheck, FileText, Activity, Stethoscope, Utensils, Clock, Check } from 'lucide-react';

interface HealthManagerProps {
  lapins: Lapin[];
  vaccinations: Vaccination[];
  notes: NoteSante[];
  plans: PlanAlimentaire[];
  onAddVaccination: (vaccin: Vaccination) => void;
  onAddTask: (tache: Tache) => void;
  onDeleteVaccination: (id: string) => void;
  onAddNote: (note: NoteSante) => void;
  onDeleteNote: (id: string) => void;
  onAddPlan: (plan: PlanAlimentaire) => void;
  onDeletePlan: (id: string) => void;
  onDistributeFood: (id: string) => void;
}

const HealthManager: React.FC<HealthManagerProps> = ({ 
  lapins, 
  vaccinations, 
  notes,
  plans,
  onAddVaccination, 
  onAddTask, 
  onDeleteVaccination,
  onAddNote,
  onDeleteNote,
  onAddPlan,
  onDeletePlan,
  onDistributeFood
}) => {
  const [activeTab, setActiveTab] = useState<'VACCINS' | 'NOTES' | 'ALIMENTATION'>('VACCINS');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State pour le formulaire Vaccin
  const [newVaccin, setNewVaccin] = useState<Partial<Vaccination>>({
    date: new Date().toISOString().split('T')[0],
    nomVaccin: 'Filavac VHD K C+V',
    prochainRappel: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  // State pour le formulaire Note
  const [newNote, setNewNote] = useState<Partial<NoteSante>>({
    date: new Date().toISOString().split('T')[0],
    type: 'OBSERVATION',
    contenu: ''
  });

  // State pour le formulaire Plan Alimentaire
  const [newPlan, setNewPlan] = useState<Partial<PlanAlimentaire>>({
    nourriture: '',
    frequenceJours: 1,
    prochaineDistribution: new Date().toISOString().split('T')[0]
  });

  const handleSubmitVaccin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccin.lapinId || !newVaccin.date || !newVaccin.nomVaccin) return;

    const vaccination: Vaccination = {
      id: Date.now().toString(),
      lapinId: newVaccin.lapinId,
      date: newVaccin.date,
      nomVaccin: newVaccin.nomVaccin,
      lot: newVaccin.lot,
      prochainRappel: newVaccin.prochainRappel,
      veterinaire: newVaccin.veterinaire
    };

    onAddVaccination(vaccination);

    // Création automatique de la tâche de rappel
    if (newVaccin.prochainRappel) {
      const lapin = lapins.find(l => l.id === newVaccin.lapinId);
      const tache: Tache = {
        id: `task-vac-${Date.now()}`,
        titre: `Rappel Vaccin (${newVaccin.nomVaccin}) - ${lapin?.nom || 'Lapin'}`,
        dateEcheance: newVaccin.prochainRappel,
        terminee: false,
        lapinId: newVaccin.lapinId,
        type: 'VACCIN'
      };
      onAddTask(tache);
    }

    setShowForm(false);
    setNewVaccin(prev => ({ ...prev, lapinId: '', lot: '', veterinaire: '' }));
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.lapinId || !newNote.contenu) return;

    const note: NoteSante = {
      id: `note-${Date.now()}`,
      lapinId: newNote.lapinId,
      date: newNote.date || new Date().toISOString().split('T')[0],
      type: newNote.type || 'OBSERVATION',
      contenu: newNote.contenu
    };

    onAddNote(note);
    setShowForm(false);
    setNewNote({
      date: new Date().toISOString().split('T')[0],
      type: 'OBSERVATION',
      contenu: ''
    });
  };

  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newPlan.nourriture || !newPlan.frequenceJours || !newPlan.prochaineDistribution) return;

    const plan: PlanAlimentaire = {
       id: `plan-${Date.now()}`,
       nourriture: newPlan.nourriture,
       frequenceJours: Number(newPlan.frequenceJours),
       prochaineDistribution: newPlan.prochaineDistribution,
       actif: true
    };
    onAddPlan(plan);
    setShowForm(false);
    setNewPlan({
       nourriture: '',
       frequenceJours: 1,
       prochaineDistribution: new Date().toISOString().split('T')[0]
    });
  };

  // Filtrer les lapins actifs pour la liste déroulante
  const activeLapins = lapins.filter(l => l.statut !== StatutLapin.DECEDE && l.statut !== StatutLapin.VENDU);

  // Préparer la liste d'affichage (Vaccinations)
  const vaccinationList = vaccinations
    .map(v => {
      const lapin = lapins.find(l => l.id === v.lapinId);
      return { ...v, lapinNom: lapin?.nom || 'Inconnu' };
    })
    .filter(v => 
      v.lapinNom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.nomVaccin.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Préparer la liste d'affichage (Notes)
  const notesList = notes
    .map(n => {
      const lapin = lapins.find(l => l.id === n.lapinId);
      return { ...n, lapinNom: lapin?.nom || 'Inconnu' };
    })
    .filter(n => 
      n.lapinNom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.contenu.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  // Vérifier le statut vaccinal global des lapins actifs
  const getVaccinationStatus = (lapinId: string) => {
    const lastVaccin = vaccinations
      .filter(v => v.lapinId === lapinId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastVaccin) return 'NONE';
    
    if (lastVaccin.prochainRappel) {
      const today = new Date();
      const rappelDate = new Date(lastVaccin.prochainRappel);
      if (rappelDate < today) return 'EXPIRED';
      
      const diffTime = rappelDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 30) return 'SOON';
    }

    return 'OK';
  };

  const getTypeLabel = (type: TypeNote) => {
    switch(type) {
      case 'OBSERVATION': return { label: 'Observation', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
      case 'SYMPTOME': return { label: 'Symptôme', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' };
      case 'TRAITEMENT': return { label: 'Traitement', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
      case 'VETO': return { label: 'Vétérinaire', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' };
      default: return { label: type, color: 'bg-gray-100 text-gray-700' };
    }
  }

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Syringe className="w-6 h-6 mr-2 text-cuni-600 dark:text-cuni-400" />
            Santé & Soins
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Suivi vaccinal et carnet de santé</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-cuni-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-cuni-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          {activeTab === 'VACCINS' ? 'Enregistrer un vaccin' : 
           activeTab === 'NOTES' ? 'Ajouter une note' : 'Planifier nourriture'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6 border-l-4 border-cuni-500 dark:border-cuni-400 animate-in slide-in-from-top-4">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
            {activeTab === 'VACCINS' ? 'Nouvelle Vaccination' : 
             activeTab === 'NOTES' ? 'Nouvelle Note de Santé' : 'Nouveau Plan Alimentaire'}
          </h3>
          
          {activeTab === 'VACCINS' ? (
            <form onSubmit={handleSubmitVaccin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lapin</label>
                  <select 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    value={newVaccin.lapinId || ''}
                    onChange={e => setNewVaccin({...newVaccin, lapinId: e.target.value})}
                  >
                    <option value="">Sélectionner un lapin...</option>
                    {activeLapins.map(l => (
                      <option key={l.id} value={l.id}>{l.nom} ({l.tatouage || 'Sans tatouage'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du Vaccin</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    placeholder="Ex: Filavac, Myxo-RHD..."
                    value={newVaccin.nomVaccin}
                    onChange={e => setNewVaccin({...newVaccin, nomVaccin: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'injection</label>
                  <input 
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    value={newVaccin.date}
                    onChange={e => {
                       const d = new Date(e.target.value);
                       const nextYear = new Date(d.setFullYear(d.getFullYear() + 1)).toISOString().split('T')[0];
                       setNewVaccin({...newVaccin, date: e.target.value, prochainRappel: nextYear});
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date du rappel (estimée)</label>
                  <input 
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={newVaccin.prochainRappel}
                    onChange={e => setNewVaccin({...newVaccin, prochainRappel: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numéro de Lot</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Optionnel"
                    value={newVaccin.lot || ''}
                    onChange={e => setNewVaccin({...newVaccin, lot: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vétérinaire</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Optionnel"
                    value={newVaccin.veterinaire || ''}
                    onChange={e => setNewVaccin({...newVaccin, veterinaire: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-cuni-600 text-white rounded-lg hover:bg-cuni-700 flex items-center">
                  <Syringe className="w-4 h-4 mr-2" /> Enregistrer
                </button>
              </div>
            </form>
          ) : activeTab === 'NOTES' ? (
            // Formulaire NOTES
            <form onSubmit={handleSubmitNote} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lapin</label>
                    <select 
                      className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      value={newNote.lapinId || ''}
                      onChange={e => setNewNote({...newNote, lapinId: e.target.value})}
                    >
                      <option value="">Sélectionner un lapin...</option>
                      {activeLapins.map(l => (
                        <option key={l.id} value={l.id}>{l.nom} ({l.tatouage || 'Sans tatouage'})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de note</label>
                    <select 
                      className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      value={newNote.type}
                      onChange={e => setNewNote({...newNote, type: e.target.value as TypeNote})}
                    >
                      <option value="OBSERVATION">Observation</option>
                      <option value="SYMPTOME">Symptôme</option>
                      <option value="TRAITEMENT">Traitement</option>
                      <option value="VETO">Visite Vétérinaire</option>
                    </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                     <input 
                      type="date"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      value={newNote.date}
                      onChange={e => setNewNote({...newNote, date: e.target.value})}
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu de la note</label>
                  <textarea
                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
                    required
                    placeholder="Décrivez les symptômes, le traitement ou les observations..."
                    value={newNote.contenu}
                    onChange={e => setNewNote({...newNote, contenu: e.target.value})}
                  ></textarea>
               </div>
               <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-cuni-600 text-white rounded-lg hover:bg-cuni-700 flex items-center">
                  <FileText className="w-4 h-4 mr-2" /> Enregistrer la note
                </button>
              </div>
            </form>
          ) : (
            // Formulaire ALIMENTATION
             <form onSubmit={handleSubmitPlan} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de Nourriture</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      placeholder="Ex: Granulés, Foin, Vitamines..."
                      value={newPlan.nourriture}
                      onChange={e => setNewPlan({...newPlan, nourriture: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fréquence (en jours)</label>
                    <input 
                      type="number"
                      min="1"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      value={newPlan.frequenceJours}
                      onChange={e => setNewPlan({...newPlan, frequenceJours: parseInt(e.target.value)})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Tous les {newPlan.frequenceJours} jour(s)</p>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Première distribution</label>
                     <input 
                      type="date"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      value={newPlan.prochaineDistribution}
                      onChange={e => setNewPlan({...newPlan, prochaineDistribution: e.target.value})}
                    />
                  </div>
               </div>
               
               <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-cuni-600 text-white rounded-lg hover:bg-cuni-700 flex items-center">
                  <Utensils className="w-4 h-4 mr-2" /> Créer le plan
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Summary */}
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <h3 className="font-semibold text-gray-800 dark:text-white mb-3">État du cheptel</h3>
             <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
               {activeLapins.map(lapin => {
                 const status = getVaccinationStatus(lapin.id);
                 return (
                   <div key={lapin.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{lapin.nom}</span>
                      {status === 'OK' && <span className="flex items-center text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full"><ShieldCheck className="w-3 h-3 mr-1"/> À jour</span>}
                      {status === 'SOON' && <span className="flex items-center text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full"><AlertTriangle className="w-3 h-3 mr-1"/> Rappel -30j</span>}
                      {status === 'EXPIRED' && <span className="flex items-center text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full"><AlertTriangle className="w-3 h-3 mr-1"/> Expiré</span>}
                      {status === 'NONE' && <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">Non vacciné</span>}
                   </div>
                 )
               })}
             </div>
           </div>
        </div>

        {/* Main Content Area with Tabs */}
        <div className="lg:col-span-2">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
             
             {/* Tabs Header */}
             <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
               <button 
                 onClick={() => setActiveTab('VACCINS')}
                 className={`flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 min-w-[120px] ${activeTab === 'VACCINS' ? 'text-cuni-600 dark:text-cuni-400 border-b-2 border-cuni-600 dark:border-cuni-400 bg-gray-50 dark:bg-gray-700/50' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
               >
                 <Syringe className="w-4 h-4" /> Vaccins
               </button>
               <button 
                 onClick={() => setActiveTab('NOTES')}
                 className={`flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 min-w-[120px] ${activeTab === 'NOTES' ? 'text-cuni-600 dark:text-cuni-400 border-b-2 border-cuni-600 dark:border-cuni-400 bg-gray-50 dark:bg-gray-700/50' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
               >
                 <FileText className="w-4 h-4" /> Notes
               </button>
               <button 
                 onClick={() => setActiveTab('ALIMENTATION')}
                 className={`flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 min-w-[120px] ${activeTab === 'ALIMENTATION' ? 'text-cuni-600 dark:text-cuni-400 border-b-2 border-cuni-600 dark:border-cuni-400 bg-gray-50 dark:bg-gray-700/50' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
               >
                 <Utensils className="w-4 h-4" /> Alimentation
               </button>
             </div>

             <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-gray-800">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={
                        activeTab === 'VACCINS' ? "Rechercher un vaccin..." : 
                        activeTab === 'NOTES' ? "Rechercher une note..." : "Rechercher un plan..."
                    }
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cuni-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
             </div>

             <div className="overflow-x-auto min-h-[300px]">
               {activeTab === 'VACCINS' ? (
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs uppercase">
                      <tr>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Lapin</th>
                        <th className="p-4 font-medium">Vaccin</th>
                        <th className="p-4 font-medium hidden sm:table-cell">Rappel</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {vaccinationList.length === 0 ? (
                         <tr>
                           <td colSpan={5} className="p-8 text-center text-gray-400">Aucun historique de vaccination.</td>
                         </tr>
                      ) : (
                        vaccinationList.map(vaccin => (
                          <tr key={vaccin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                               {new Date(vaccin.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="p-4">
                               <div className="font-medium text-gray-900 dark:text-white text-sm">{vaccin.lapinNom}</div>
                               {vaccin.lot && <div className="text-xs text-gray-500 dark:text-gray-500">Lot: {vaccin.lot}</div>}
                            </td>
                            <td className="p-4 text-sm text-gray-800 dark:text-gray-200">
                               {vaccin.nomVaccin}
                            </td>
                            <td className="p-4 hidden sm:table-cell">
                               {vaccin.prochainRappel ? (
                                 <span className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                   <Calendar className="w-3 h-3 mr-1" />
                                   {new Date(vaccin.prochainRappel).toLocaleDateString('fr-FR')}
                                 </span>
                               ) : '-'}
                            </td>
                            <td className="p-4 text-right">
                               <button 
                                 onClick={() => {
                                   if(window.confirm('Supprimer cette entrée ?')) onDeleteVaccination(vaccin.id);
                                 }}
                                 className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                 </table>
               ) : activeTab === 'NOTES' ? (
                 <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {notesList.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">Aucune note enregistrée.</div>
                    ) : (
                      notesList.map(note => {
                        const style = getTypeLabel(note.type);
                        return (
                          <div key={note.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex flex-col sm:flex-row gap-4">
                            <div className="sm:w-32 flex-shrink-0">
                               <div className="font-bold text-gray-900 dark:text-white mb-1">{note.lapinNom}</div>
                               <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(note.date).toLocaleDateString('fr-FR')}</div>
                               <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold ${style.color}`}>
                                 {style.label}
                               </span>
                            </div>
                            <div className="flex-1">
                               <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.contenu}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                               <button 
                                 onClick={() => {
                                   if(window.confirm('Supprimer cette note ?')) onDeleteNote(note.id);
                                 }}
                                 className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                 </div>
               ) : (
                 // TAB ALIMENTATION
                 <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {plans.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">Aucun plan alimentaire défini.</div>
                    ) : (
                        plans.map(plan => {
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            const nextDate = new Date(plan.prochaineDistribution);
                            nextDate.setHours(0,0,0,0);
                            const isLate = nextDate <= today;

                            return (
                                <div key={plan.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 rounded-full flex-shrink-0 ${isLate ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-cuni-100 dark:bg-cuni-900/30 text-cuni-600'}`}>
                                            <Utensils className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{plan.nourriture}</h4>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    Tous les {plan.frequenceJours} jours
                                                </span>
                                                <span className={`flex items-center font-medium ${isLate ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    Prochaine: {new Date(plan.prochaineDistribution).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        {isLate && (
                                            <button 
                                                onClick={() => onDistributeFood(plan.id)}
                                                className="px-4 py-2 bg-cuni-600 text-white rounded-lg hover:bg-cuni-700 flex items-center shadow-sm text-sm"
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                Distribué
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => {
                                                if(window.confirm('Supprimer ce plan alimentaire ?')) onDeletePlan(plan.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HealthManager;