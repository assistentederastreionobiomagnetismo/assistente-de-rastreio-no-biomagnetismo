
import React, { useState, useEffect, useCallback } from 'react';
import { Patient, BiomagneticPair, User, Session, PhenomenaData, ProtocolData } from './types';
import PatientForm from './components/PatientForm';
import StartProtocol from './components/StartProtocol';
import Scanning from './components/Scanning';
import Phenomena from './components/Phenomena';
import Emocional from './components/Emocional';
import Treatment from './components/Treatment';
import SessionSummary from './components/SessionSummary';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserManager from './components/UserManager';
import ChangePassword from './components/ChangePassword';
import SessionDetailModal from './components/SessionDetailModal';
import { UserIcon, ClipboardIcon, MagnetIcon, LogoutIcon, SparklesIcon, InfoIcon, BrainIcon, SuccessIcon, ReportIcon, CheckIcon } from './components/icons/Icons';
import { BIOMAGNETIC_PAIRS } from './constants';

// --- DATABASE UTILS ---
const DB_NAME = 'BiomagDB_v20'; // Atualizado para v20
const DB_VERSION = 1;
const STORES = {
  PAIRS: 'pairs',
  USERS: 'users',
  SESSIONS: 'sessions',
  PATIENTS: 'patients',
  CONFIG: 'config'
};

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db = request.result;
      Object.values(STORES).forEach(store => {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const dbSave = async (storeName: string, key: string, data: any) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const dbLoad = async (storeName: string, key: string): Promise<any> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

enum Step {
  PATIENT_INFO,
  START_PROTOCOL,
  SCANNING_RESERVATORIOS,
  SCANNING_LEVEL_I,
  SCANNING_LEVEL_II,
  SCANNING_LEVEL_III,
  PHENOMENA,
  EMOTIONAL,
  TREATMENT,
  SUMMARY
}

type AppView = 'dashboard' | 'sessionWorkflow' | 'userManager' | 'changePassword';
const LAST_SYNC_KEY = 'biomag_last_db_sync_date';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.PATIENT_INFO);
  const [patient, setPatient] = useState<Patient>({ name: '', mainComplaint: '' });
  const [protocolData, setProtocolData] = useState<ProtocolData>({ legResponse: '', antennaResponse: '', sessionType: '' });
  const [selectedPairs, setSelectedPairs] = useState<BiomagneticPair[]>([]);
  const [phenomena, setPhenomena] = useState<PhenomenaData>({
    vascularAccidents: [],
    tumoralPhenomena: [],
    tumoralGenesis: [],
    traumas: [],
    portalPairs: []
  });
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedSensations, setSelectedSensations] = useState<string[]>([]);
  const [emotionsNotes, setEmotionsNotes] = useState<string>('');
  const [sensationsNotes, setSensationsNotes] = useState<string>('');
  const [impactionTime, setImpactionTime] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [protocolNotes, setProtocolNotes] = useState<string>('');
  const [reservatoriosNotes, setReservatoriosNotes] = useState<string>('');
  const [levelINotes, setLevelINotes] = useState<string>('');
  const [levelIINotes, setLevelIINotes] = useState<string>('');
  const [levelIIINotes, setLevelIIINotes] = useState<string>('');
  const [phenomenaNotes, setPhenomenaNotes] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [biomagneticPairs, setBiomagneticPairs] = useState<BiomagneticPair[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [lastSyncDate, setLastSyncDate] = useState<string>('');
  const [viewingHistoricalSession, setViewingHistoricalSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appView, setAppView] = useState<AppView>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAppData = async () => {
      try {
        const storedSync = await dbLoad(STORES.CONFIG, 'lastSync') || '';
        setLastSyncDate(storedSync);

        let localPairs = await dbLoad(STORES.PAIRS, 'masterList') || [];
        const pairMap = new Map();
        localPairs.forEach((p: any) => pairMap.set(p.name, p));

        BIOMAGNETIC_PAIRS.forEach(masterPair => {
            if (masterPair.isDefinitive === true) {
                pairMap.set(masterPair.name, masterPair);
            } else if (!pairMap.has(masterPair.name)) {
                pairMap.set(masterPair.name, masterPair);
            }
        });
        
        const mergedPairsList = Array.from(pairMap.values()) as BiomagneticPair[];
        await dbSave(STORES.PAIRS, 'masterList', mergedPairsList);
        setBiomagneticPairs(mergedPairsList);

        let users = await dbLoad(STORES.USERS, 'list') || [];
        const adminExists = users.some((u: any) => u.username.toLowerCase() === 'vbsjunior.biomagnetismo');
        if (!adminExists) {
          users.push({
            username: 'Vbsjunior.Biomagnetismo',
            password: '@Va135482',
            fullName: 'Administrador Mestre',
            isApproved: true,
            approvalType: 'permanent'
          });
        }
        setAllUsers(users);
        await dbSave(STORES.USERS, 'list', users);

        setIsLoading(false);
      } catch (e) {
        console.error("Erro na inicialização dos dados:", e);
        setIsLoading(false);
      }
    };
    initAppData();
  }, []);

  useEffect(() => {
    if (!isLoading && biomagneticPairs.length > 0) {
      dbSave(STORES.PAIRS, 'masterList', biomagneticPairs);
    }
  }, [biomagneticPairs, isLoading]);

  useEffect(() => {
    if (!isLoading && allUsers.length > 0) {
      dbSave(STORES.USERS, 'list', allUsers);
    }
  }, [allUsers, isLoading]);

  useEffect(() => {
    if (currentUser && !isLoading) {
      const loadUserBoundData = async () => {
        const storedSessions = await dbLoad(STORES.SESSIONS, currentUser.username);
        const storedPatients = await dbLoad(STORES.PATIENTS, currentUser.username);
        
        setSessions(storedSessions ? storedSessions.map((s:any) => ({
            ...s, 
            startTime: s.startTime ? new Date(s.startTime) : null, 
            endTime: s.endTime ? new Date(s.endTime) : null
        })) : []);
        setPatients(storedPatients ? storedPatients : []);
      };
      loadUserBoundData();
    }
  }, [currentUser, isLoading]);

  const handleImportSync = async (syncCode: string): Promise<boolean> => {
    try {
        const binaryString = atob(syncCode.trim());
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const decoded = new TextDecoder().decode(bytes);
        const importedData = JSON.parse(decoded);
        
        if (typeof importedData === 'object' && !Array.isArray(importedData)) {
            if (importedData.users) {
              setAllUsers(importedData.users);
              await dbSave(STORES.USERS, 'list', importedData.users);
            }
            if (importedData.pairs) {
                setBiomagneticPairs(importedData.pairs);
                await dbSave(STORES.PAIRS, 'masterList', importedData.pairs);
                const syncTime = new Date().toLocaleString('pt-BR');
                setLastSyncDate(syncTime);
                await dbSave(STORES.CONFIG, 'lastSync', syncTime);
            }
            return true;
        } 
    } catch (e) { console.error(e); }
    return false;
  };

  const handleTherapistLogin = (username: string, password: string): { success: boolean, message?: string } => {
    const foundUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!foundUser) return { success: false, message: 'Usuário ou senha inválidos.' };
    if (!foundUser.isApproved) return { success: false, message: 'Cadastro aguardando ativação.' };
    setIsAuthenticated(true);
    setCurrentUser(foundUser);
    setAppView(foundUser.requiresPasswordChange ? 'changePassword' : 'dashboard');
    return { success: true };
  };

  const handleUpdatePassword = (newPassword: string) => {
    if (!currentUser) return;
    const updatedUsers = allUsers.map(u => u.username === currentUser.username ? { ...u, password: newPassword, requiresPasswordChange: false } : u);
    setAllUsers(updatedUsers);
    setCurrentUser(prev => prev ? { ...prev, password: newPassword, requiresPasswordChange: false } : null);
    setAppView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAppView('dashboard');
    setSessions([]);
    setPatients([]);
  };

  const jumpToStep = (step: Step) => {
    if (step === Step.SUMMARY && currentStep < Step.TREATMENT) return;
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep === Step.TREATMENT && !sessionEndTime) setSessionEndTime(new Date());
    if (currentStep < Step.SUMMARY) setCurrentStep(currentStep + 1);
  };

  const handleFinishSession = () => {
    const newSession: Session = {
        id: new Date().toISOString(),
        patient,
        protocolData,
        pairs: selectedPairs,
        phenomena,
        emotions: selectedEmotions,
        sensations: selectedSensations,
        emotionsNotes,
        sensationsNotes,
        impactionTime,
        notes: sessionNotes,
        protocolNotes,
        reservatoriosNotes,
        levelINotes,
        levelIINotes,
        levelIIINotes,
        phenomenaNotes,
        startTime: sessionStartTime,
        endTime: sessionEndTime
    };
    const newSessions = [newSession, ...sessions];
    setSessions(newSessions);
    dbSave(STORES.SESSIONS, currentUser!.username, newSessions);
    setAppView('dashboard');
    // Reset states for next
    setPatient({ name: '', mainComplaint: '' });
    setSelectedPairs([]);
    setCurrentStep(Step.PATIENT_INFO);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-100 font-bold text-teal-600">Carregando Banco de Dados...</div>;
  if (!isAuthenticated) return <Login onLogin={handleTherapistLogin} onRequestReset={() => ({success: false, message: ''})} onImportSync={handleImportSync} />;
  if (appView === 'changePassword') return <ChangePassword onUpdate={handleUpdatePassword} onLogout={handleLogout} />;

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 relative notranslate" translate="no">
      {viewingHistoricalSession && <SessionDetailModal session={viewingHistoricalSession} onClose={() => setViewingHistoricalSession(null)} />}
      <div className="absolute top-4 right-4 z-10 print:hidden">
        <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-100 transition-colors"><LogoutIcon className="w-5 h-5" /> Sair</button>
      </div>
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8 print:hidden">
          <h1 className="text-4xl font-bold text-teal-600">Assistente para Rastreios no Biomagnetismo</h1>
          <div className="flex flex-col items-center mt-2">
            <p className="text-slate-500">Terapeuta: <span className="font-bold">{currentUser?.fullName || currentUser?.username}</span></p>
            {lastSyncDate && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white border border-teal-100 rounded-full shadow-sm">
                    <CheckIcon className="w-3 h-3 text-teal-600" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Sincronizada</span>
                </div>
            )}
          </div>
        </header>
        
        {appView === 'dashboard' && (
          <Dashboard 
            currentUser={currentUser}
            onStartNewSession={() => { setSessionStartTime(new Date()); setAppView('sessionWorkflow'); }}
            sessions={sessions}
            patients={patients}
            setPatients={setPatients}
            biomagneticPairs={biomagneticPairs}
            setBiomagneticPairs={setBiomagneticPairs}
            onManageUsers={() => setAppView('userManager')}
            onViewSessionDetail={(s) => setViewingHistoricalSession(s)}
            lastSyncDate={lastSyncDate}
          />
        )}
        
        {appView === 'userManager' && (
          <UserManager 
            users={allUsers} 
            setUsers={setAllUsers} 
            biomagneticPairs={biomagneticPairs}
            onBack={() => setAppView('dashboard')} 
          />
        )}
        
        {appView === 'sessionWorkflow' && (
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden relative">
            <div className="p-4 md:p-6 border-b border-slate-200 overflow-x-auto print:hidden">
              <nav aria-label="Progress">
                <ol role="list" className="flex items-center min-w-[1000px]">
                  {[
                    { name: 'Paciente', icon: <UserIcon />, step: Step.PATIENT_INFO },
                    { name: 'Início', icon: <InfoIcon />, step: Step.START_PROTOCOL },
                    { name: 'Reserv.', icon: <ClipboardIcon />, step: Step.SCANNING_RESERVATORIOS },
                    { name: 'Nível I', icon: <ClipboardIcon />, step: Step.SCANNING_LEVEL_I },
                    { name: 'Nível II', icon: <ClipboardIcon />, step: Step.SCANNING_LEVEL_II },
                    { name: 'Nível III', icon: <ClipboardIcon />, step: Step.SCANNING_LEVEL_III },
                    { name: 'Fenômenos', icon: <SparklesIcon />, step: Step.PHENOMENA },
                    { name: 'Emocionais', icon: <BrainIcon />, step: Step.EMOTIONAL },
                    { name: 'Final', icon: <SuccessIcon />, step: Step.TREATMENT },
                    { name: 'Relatório', icon: <ReportIcon />, step: Step.SUMMARY }
                  ].map((s, idx) => (
                    <li key={s.name} className={`relative ${idx !== 9 ? 'flex-1' : ''}`}>
                      <button onClick={() => jumpToStep(s.step)} className="flex flex-col items-center text-sm w-full group">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full z-10 transition-all duration-300 transform group-hover:scale-110 ${currentStep >= s.step ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'} ${currentStep === s.step ? 'ring-4 ring-teal-100 scale-110' : ''}`}>
                          {React.cloneElement(s.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                        </span>
                        <span className={`mt-2 text-[10px] font-bold ${currentStep >= s.step ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>{s.name}</span>
                      </button>
                      {idx !== 9 && <div className="absolute inset-x-0 top-5 left-1/2 -z-0 h-0.5 w-full bg-slate-200" />}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
            <main className="p-6 md:p-10">
              {currentStep === Step.PATIENT_INFO && <PatientForm patient={patient} setPatient={setPatient} onNext={nextStep} patientsList={patients} setPatientsList={setPatients} />}
              {currentStep === Step.START_PROTOCOL && <StartProtocol data={protocolData} setData={setProtocolData} notes={protocolNotes} setNotes={setProtocolNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.PATIENT_INFO)} patientName={patient.name} />}
              {currentStep === Step.SCANNING_RESERVATORIOS && <Scanning levelTitle="Reservatórios" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={reservatoriosNotes} setNotes={setReservatoriosNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.START_PROTOCOL)} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.SCANNING_LEVEL_I && <Scanning levelTitle="Nível I" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelINotes} setNotes={setLevelINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_RESERVATORIOS)} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.SCANNING_LEVEL_II && <Scanning levelTitle="Nível II" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelIINotes} setNotes={setLevelIINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_I)} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.SCANNING_LEVEL_III && <Scanning levelTitle="Nível III" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelIIINotes} setNotes={setLevelIIINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_II)} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.PHENOMENA && <Phenomena data={phenomena} setData={setPhenomena} notes={phenomenaNotes} setNotes={setPhenomenaNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_III)} />}
              {currentStep === Step.EMOTIONAL && <Emocional selectedEmotions={selectedEmotions} setSelectedEmotions={setSelectedEmotions} selectedSensations={selectedSensations} setSelectedSensations={setSelectedSensations} emotionsNotes={emotionsNotes} setEmotionsNotes={setEmotionsNotes} sensationsNotes={sensationsNotes} setSensationsNotes={setSensationsNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.PHENOMENA)} />}
              {currentStep === Step.TREATMENT && <Treatment impactionTime={impactionTime} setImpactionTime={setImpactionTime} notes={sessionNotes} setNotes={setSessionNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.EMOTIONAL)} sessionType={protocolData.sessionType} />}
              {currentStep === Step.SUMMARY && <SessionSummary patient={patient} protocolData={protocolData} pairs={selectedPairs} phenomena={phenomena} emotions={selectedEmotions} sensations={selectedSensations} emotionsNotes={emotionsNotes} sensationsNotes={sensationsNotes} protocolNotes={protocolNotes} reservatoriosNotes={reservatoriosNotes} levelINotes={levelINotes} levelIINotes={levelIINotes} levelIIINotes={levelIIINotes} phenomenaNotes={phenomenaNotes} impactionTime={impactionTime} notes={sessionNotes} startTime={sessionStartTime} endTime={sessionEndTime} onFinish={handleFinishSession} onBack={() => setCurrentStep(Step.TREATMENT)} />}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
