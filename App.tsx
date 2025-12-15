import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Rabbit, 
  Heart, 
  DollarSign, 
  Settings, 
  Menu,
  X,
  Bell,
  AlertCircle,
  Info,
  Syringe
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import RabbitManager from './components/RabbitManager';
import ReproductionManager from './components/ReproductionManager';
import FinanceManager from './components/FinanceManager';
import HealthManager from './components/HealthManager';
import { Lapin, Reproduction, Tache, Transaction, AppNotification, StatutReproduction, Vaccination, NoteSante, PlanAlimentaire } from './types';
import { mockLapins, mockReproductions, mockTaches, mockTransactions, mockVaccinations, mockNotes, mockPlansAlimentaires } from './services/mockData';

type View = 'dashboard' | 'rabbits' | 'reproduction' | 'finances' | 'health' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const notifPanelRef = useRef<HTMLDivElement>(null);

  // State Management (Simulating local database)
  const [lapins, setLapins] = useState<Lapin[]>([]);
  const [reproductions, setReproductions] = useState<Reproduction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [notesSante, setNotesSante] = useState<NoteSante[]>([]);
  const [plansAlimentaires, setPlansAlimentaires] = useState<PlanAlimentaire[]>([]);

  // Initialize Data
  useEffect(() => {
    const savedLapins = localStorage.getItem('cuni_lapins');
    if (savedLapins) {
      setLapins(JSON.parse(savedLapins));
      setReproductions(JSON.parse(localStorage.getItem('cuni_repros') || '[]'));
      setTransactions(JSON.parse(localStorage.getItem('cuni_transactions') || '[]'));
      setTaches(JSON.parse(localStorage.getItem('cuni_taches') || '[]'));
      setVaccinations(JSON.parse(localStorage.getItem('cuni_vaccinations') || '[]'));
      setNotesSante(JSON.parse(localStorage.getItem('cuni_notes') || '[]'));
      setPlansAlimentaires(JSON.parse(localStorage.getItem('cuni_plans_alim') || '[]'));
    } else {
      setLapins(mockLapins);
      setReproductions(mockReproductions);
      setTransactions(mockTransactions);
      setTaches(mockTaches);
      setVaccinations(mockVaccinations);
      setNotesSante(mockNotes);
      setPlansAlimentaires(mockPlansAlimentaires);
    }
  }, []);

  // Persist Data
  useEffect(() => {
    localStorage.setItem('cuni_lapins', JSON.stringify(lapins));
    localStorage.setItem('cuni_repros', JSON.stringify(reproductions));
    localStorage.setItem('cuni_transactions', JSON.stringify(transactions));
    localStorage.setItem('cuni_taches', JSON.stringify(taches));
    localStorage.setItem('cuni_vaccinations', JSON.stringify(vaccinations));
    localStorage.setItem('cuni_notes', JSON.stringify(notesSante));
    localStorage.setItem('cuni_plans_alim', JSON.stringify(plansAlimentaires));
  }, [lapins, reproductions, transactions, taches, vaccinations, notesSante, plansAlimentaires]);

  // Generate Notifications Logic
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifs: AppNotification[] = [];
      const today = new Date();
      // Reset hours to compare dates only
      today.setHours(0, 0, 0, 0);
      
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);

      // 1. Check Tasks (Overdue or Upcoming)
      taches.forEach(tache => {
        if (!tache.terminee) {
          const dateEcheance = new Date(tache.dateEcheance);
          dateEcheance.setHours(0, 0, 0, 0);
          
          const isVaccin = tache.type === 'VACCIN';
          
          if (dateEcheance < today) {
            newNotifs.push({
              id: `task-overdue-${tache.id}`,
              title: isVaccin ? 'Vaccin en retard !' : 'Tâche en retard',
              message: `${tache.titre} était prévu(e) pour le ${dateEcheance.toLocaleDateString('fr-FR')}.`,
              date: tache.dateEcheance,
              type: 'ALERT',
              linkTo: 'dashboard'
            });
          } else if (dateEcheance <= threeDaysLater) {
             newNotifs.push({
              id: `task-soon-${tache.id}`,
              title: isVaccin ? 'Rappel Vaccin' : 'Tâche à venir',
              message: `${tache.titre} est prévu(e) pour le ${dateEcheance.toLocaleDateString('fr-FR')}.`,
              date: tache.dateEcheance,
              type: 'INFO',
              linkTo: 'dashboard'
            });
          }
        }
      });

      // 2. Check Reproduction (Births)
      reproductions.forEach(repro => {
        if (repro.statut === StatutReproduction.GESTATION || repro.statut === StatutReproduction.ACCOUPLEMENT) {
          const dateMiseBas = new Date(repro.dateMiseBasPrevue);
          dateMiseBas.setHours(0, 0, 0, 0);
          
          const lapinMere = lapins.find(l => l.id === repro.mereId);
          const nomMere = lapinMere ? lapinMere.nom : 'Inconnue';

          if (dateMiseBas <= today) {
             newNotifs.push({
              id: `birth-now-${repro.id}`,
              title: 'Mise bas prévue !',
              message: `La lapine ${nomMere} doit mettre bas aujourd'hui ou est en retard.`,
              date: repro.dateMiseBasPrevue,
              type: 'ALERT',
              linkTo: 'reproduction'
            });
          } else if (dateMiseBas <= threeDaysLater) {
             newNotifs.push({
              id: `birth-soon-${repro.id}`,
              title: 'Mise bas imminente',
              message: `Préparez le nid pour ${nomMere} (prévu le ${dateMiseBas.toLocaleDateString('fr-FR')}).`,
              date: repro.dateMiseBasPrevue,
              type: 'INFO',
              linkTo: 'reproduction'
            });
          }
        }
      });

      // 3. Check Food Plans
      plansAlimentaires.forEach(plan => {
         if(plan.actif) {
            const nextDate = new Date(plan.prochaineDistribution);
            nextDate.setHours(0,0,0,0);

            if(nextDate <= today) {
               newNotifs.push({
                  id: `food-plan-${plan.id}`,
                  title: 'Distribution de nourriture',
                  message: `${plan.nourriture} à distribuer aujourd'hui.`,
                  date: plan.prochaineDistribution,
                  type: 'INFO',
                  linkTo: 'health'
               });
            }
         }
      });

      // Sort by priority (Alerts first) then date
      newNotifs.sort((a, b) => {
        if (a.type === 'ALERT' && b.type !== 'ALERT') return -1;
        if (a.type !== 'ALERT' && b.type === 'ALERT') return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setNotifications(newNotifs);
    };

    generateNotifications();
  }, [taches, reproductions, lapins, plansAlimentaires]);

  // Close notification panel on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(event.target as Node)) {
        setIsNotifPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleAddRabbit = (newRabbit: Lapin) => {
    setLapins(prev => [...prev, newRabbit]);
  };

  const handleUpdateRabbit = (updatedRabbit: Lapin) => {
    setLapins(prev => prev.map(l => l.id === updatedRabbit.id ? updatedRabbit : l));
  };

  const handleDeleteRabbit = (id: string) => {
    setLapins(prev => prev.filter(l => l.id !== id));
  };

  const handleAddRepro = (repro: Reproduction) => {
    setReproductions(prev => [...prev, repro]);
  };

  const handleUpdateRepro = (repro: Reproduction) => {
    setReproductions(prev => prev.map(r => r.id === repro.id ? repro : r));
  };

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const handleAddVaccination = (vaccin: Vaccination) => {
    setVaccinations(prev => [...prev, vaccin]);
  };

  const handleAddTask = (tache: Tache) => {
    setTaches(prev => [...prev, tache]);
  };

  const handleDeleteVaccination = (id: string) => {
    setVaccinations(prev => prev.filter(v => v.id !== id));
  };

  const handleAddNote = (note: NoteSante) => {
    setNotesSante(prev => [...prev, note]);
  };

  const handleDeleteNote = (id: string) => {
    setNotesSante(prev => prev.filter(n => n.id !== id));
  };

  const handleAddPlan = (plan: PlanAlimentaire) => {
    setPlansAlimentaires(prev => [...prev, plan]);
  };

  const handleDeletePlan = (id: string) => {
     setPlansAlimentaires(prev => prev.filter(p => p.id !== id));
  };

  const handleDistributeFood = (id: string) => {
    setPlansAlimentaires(prev => prev.map(plan => {
       if(plan.id === id) {
         // Set next date based on TODAY + frequency
         const nextDate = new Date();
         nextDate.setDate(nextDate.getDate() + plan.frequenceJours);
         return { ...plan, prochaineDistribution: nextDate.toISOString().split('T')[0] };
       }
       return plan;
    }));
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-colors ${
        currentView === view 
          ? 'bg-cuni-100 dark:bg-cuni-900/30 text-cuni-800 dark:text-cuni-400 font-medium' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-cuni-600 dark:text-cuni-400' : 'text-gray-400'}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full shadow-sm z-20">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
          <div className="bg-cuni-600 p-2 rounded-lg">
            <Rabbit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 dark:text-white text-lg leading-tight">CuniGestion</h1>
            <p className="text-xs text-cuni-600 dark:text-cuni-400 font-medium">Pro</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Tableau de bord" />
          <NavItem view="rabbits" icon={Rabbit} label="Mes Lapins" />
          <NavItem view="reproduction" icon={Heart} label="Reproduction" />
          <NavItem view="health" icon={Syringe} label="Santé" />
          <NavItem view="finances" icon={DollarSign} label="Finances" />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
           <NavItem view="settings" icon={Settings} label="Paramètres" />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
           <div className="bg-cuni-600 p-1.5 rounded-lg">
            <Rabbit className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-800 dark:text-white">CuniGestion Pro</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)} 
            className="p-2 text-gray-600 dark:text-gray-300 relative"
          >
            <Bell className="w-6 h-6" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            )}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-14 left-0 w-full bg-white dark:bg-gray-800 shadow-lg p-4 space-y-2 border-b border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
            <NavItem view="dashboard" icon={LayoutDashboard} label="Tableau de bord" />
            <NavItem view="rabbits" icon={Rabbit} label="Mes Lapins" />
            <NavItem view="reproduction" icon={Heart} label="Reproduction" />
            <NavItem view="health" icon={Syringe} label="Santé" />
            <NavItem view="finances" icon={DollarSign} label="Finances" />
            <NavItem view="settings" icon={Settings} label="Paramètres" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative pt-16 md:pt-0">
        
        {/* Top Bar Desktop */}
        <header className="hidden md:flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-8 justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">
            {currentView === 'dashboard' ? 'Tableau de bord' : 
             currentView === 'rabbits' ? 'Gestion des lapins' : 
             currentView === 'reproduction' ? 'Suivi Reproduction' : 
             currentView === 'health' ? 'Santé & Soins' : 
             currentView === 'finances' ? 'Comptabilité' : 'Paramètres'}
          </h2>
          <div className="flex items-center gap-4">
             {/* Notification Bell Desktop */}
            <div className="relative" ref={notifPanelRef}>
              <button 
                onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative transition-colors"
              >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
              </button>

              {/* Notification Panel */}
              {isNotifPanelOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">Notifications</h3>
                    <span className="bg-cuni-100 dark:bg-cuni-900 text-cuni-700 dark:text-cuni-300 text-xs px-2 py-1 rounded-full">{notifications.length}</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Rien à signaler pour le moment.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              if (notif.linkTo) setCurrentView(notif.linkTo as View);
                              setIsNotifPanelOpen(false);
                            }}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors flex gap-3 items-start"
                          >
                            {notif.type === 'ALERT' ? (
                              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <h4 className={`text-sm font-semibold ${notif.type === 'ALERT' ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                {notif.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                {new Date(notif.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

         {/* Notification Panel Mobile */}
         {isNotifPanelOpen && (
            <div className="md:hidden fixed top-14 right-4 left-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden" ref={notifPanelRef}>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200">Notifications</h3>
                  <button onClick={() => setIsNotifPanelOpen(false)}><X className="w-4 h-4 text-gray-500 dark:text-gray-400" /></button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                        <p className="text-sm">Rien à signaler.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {notifications.map(notif => (
                          <div 
                            key={notif.id} 
                             onClick={() => {
                              if (notif.linkTo) setCurrentView(notif.linkTo as View);
                              setIsNotifPanelOpen(false);
                            }}
                            className="p-4 active:bg-gray-50 dark:active:bg-gray-700 flex gap-3 items-start"
                          >
                            {notif.type === 'ALERT' ? (
                              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <h4 className={`text-sm font-semibold ${notif.type === 'ALERT' ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                {notif.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
            </div>
         )}


        <div className="flex-1 overflow-auto p-4 md:p-8 no-scrollbar bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-6xl mx-auto h-full">
            {currentView === 'dashboard' && (
              <Dashboard 
                lapins={lapins} 
                reproductions={reproductions} 
                transactions={transactions} 
                taches={taches}
              />
            )}
            {currentView === 'rabbits' && (
              <RabbitManager 
                lapins={lapins} 
                vaccinations={vaccinations}
                onAdd={handleAddRabbit} 
                onUpdate={handleUpdateRabbit}
                onDelete={handleDeleteRabbit}
              />
            )}
            {currentView === 'reproduction' && (
              <ReproductionManager 
                reproductions={reproductions}
                lapins={lapins}
                onAdd={handleAddRepro}
                onUpdate={handleUpdateRepro}
              />
            )}
            {currentView === 'health' && (
              <HealthManager 
                lapins={lapins}
                vaccinations={vaccinations}
                notes={notesSante}
                plans={plansAlimentaires}
                onAddVaccination={handleAddVaccination}
                onAddTask={handleAddTask}
                onDeleteVaccination={handleDeleteVaccination}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onAddPlan={handleAddPlan}
                onDeletePlan={handleDeletePlan}
                onDistributeFood={handleDistributeFood}
              />
            )}
            {currentView === 'finances' && (
              <FinanceManager 
                transactions={transactions}
                onAdd={handleAddTransaction}
              />
            )}
            {currentView === 'settings' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Paramètres</h2>
                <p className="text-gray-600 dark:text-gray-400">Version 1.1.0 - Web</p>
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm border border-yellow-100 dark:border-yellow-800">
                  Les données sont stockées localement dans votre navigateur. Pensez à exporter vos données si vous changez d'appareil.
                </div>
                <button 
                  onClick={() => {
                    if(window.confirm("Ceci effacera toutes les données. Continuer ?")) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="mt-6 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Réinitialiser les données
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;