
import React, { useState, useEffect } from 'react';
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
import { UserIcon, ClipboardIcon, MagnetIcon, LogoutIcon, SparklesIcon, InfoIcon, BrainIcon, SuccessIcon, ReportIcon } from './components/icons/Icons';
import { BIOMAGNETIC_PAIRS } from './constants';

enum Step {
  PATIENT_INFO,
  START_PROTOCOL,
  SCANNING_LEVEL_I,
  SCANNING_LEVEL_II,
  SCANNING_LEVEL_III,
  PHENOMENA,
  EMOTIONAL,
  TREATMENT,
  SUMMARY
}

type AppView = 'dashboard' | 'sessionWorkflow' | 'userManager' | 'changePassword';
const USERS_STORAGE_KEY = 'biomag_therapist_users';
const PAIRS_STORAGE_KEY = 'biomag_master_pair_list';
const LAST_SYNC_KEY = 'biomag_last_db_sync_date';

const App: React.FC = () => {
  // Session Active State
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
  const [levelINotes, setLevelINotes] = useState<string>('');
  const [levelIINotes, setLevelIINotes] = useState<string>('');
  const [levelIIINotes, setLevelIIINotes] = useState<string>('');
  const [phenomenaNotes, setPhenomenaNotes] = useState<string>('');

  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);

  // User-Bound Data State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Global Data State
  const [biomagneticPairs, setBiomagneticPairs] = useState<BiomagneticPair[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [lastSyncDate, setLastSyncDate] = useState<string>(localStorage.getItem(LAST_SYNC_KEY) || '');
  const [viewingHistoricalSession, setViewingHistoricalSession] = useState<Session | null>(null);

  // Auth & View State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appView, setAppView] = useState<AppView>('dashboard');
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  // Load Global master data
  useEffect(() => {
    const storedPairsRaw = localStorage.getItem(PAIRS_STORAGE_KEY);
    if (storedPairsRaw) setBiomagneticPairs(JSON.parse(storedPairsRaw));
    else setBiomagneticPairs(BIOMAGNETIC_PAIRS);

    const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    let usersList: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
    
    const adminExists = usersList.some(u => u.username.toLowerCase() === 'vbsjunior.biomagnetismo');
    if (!adminExists) {
      usersList.push({
        username: 'Vbsjunior.Biomagnetismo',
        password: '@Va135482',
        fullName: 'Administrador Mestre',
        isApproved: true,
        approvalType: 'permanent'
      });
    }
    setAllUsers(usersList);
  }, []);

  // Persist Global Data
  useEffect(() => {
    if (biomagneticPairs.length > 0) {
      localStorage.setItem(PAIRS_STORAGE_KEY, JSON.stringify(biomagneticPairs));
    }
  }, [biomagneticPairs]);

  useEffect(() => {
    if (allUsers.length > 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
    }
  }, [allUsers]);

  // Handle Load/Switch User Context (Patients & Sessions)
  useEffect(() => {
    if (currentUser) {
      const sessionsKey = `biomag_sessions_${currentUser.username}`;
      const patientsKey = `biomag_patients_${currentUser.username}`;
      const storedSessions = localStorage.getItem(sessionsKey);
      const storedPatients = localStorage.getItem(patientsKey);
      
      setSessions(storedSessions ? JSON.parse(storedSessions).map((s:any) => ({
          ...s, 
          startTime: s.startTime ? new Date(s.startTime) : null, 
          endTime: s.endTime ? new Date(s.endTime) : null
      })) : []);
      setPatients(storedPatients ? JSON.parse(storedPatients) : []);
    } else {
      setSessions([]);
      setPatients([]);
    }
  }, [currentUser]);

  // Persist Bound Data (Saves only when the corresponding list changes for the current user)
  useEffect(() => {
    if (currentUser && isAuthenticated) {
        const patientsKey = `biomag_patients_${currentUser.username}`;
        localStorage.setItem(patientsKey, JSON.stringify(patients));
    }
  }, [patients, currentUser, isAuthenticated]);

  useEffect(() => {
    if (currentUser && isAuthenticated) {
        const sessionsKey = `biomag_sessions_${currentUser.username}`;
        localStorage.setItem(sessionsKey, JSON.stringify(sessions));
    }
  }, [sessions, currentUser, isAuthenticated]);

  const handleImportUsers = (syncCode: string): boolean => {
    try {
        const decoded = atob(syncCode);
        const importedData = JSON.parse(decoded);
        
        if (typeof importedData === 'object' && !Array.isArray(importedData)) {
            if (importedData.users) setAllUsers(importedData.users);
            if (importedData.pairs) {
                setBiomagneticPairs(importedData.pairs);
                const now = new Date().toLocaleString('pt-BR');
                setLastSyncDate(now);
                localStorage.setItem(LAST_SYNC_KEY, now);
            }
            return true;
        } 
        else if (Array.isArray(importedData)) {
            setAllUsers(importedData);
            return true;
        }
    } catch (e) {
        console.error("Erro ao importar código de sincronização", e);
    }
    return false;
  };

  const handleTherapistLogin = (username: string, password: string): { success: boolean, message?: string } => {
    const foundUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!foundUser) return { success: false, message: 'Usuário ou senha inválidos.' };
    if (!foundUser.isApproved) return { success: false, message: 'Cadastro aguardando ativação pelo administrador.' };

    if (foundUser.approvalExpiry && foundUser.approvalType !== 'permanent') {
      if (new Date(foundUser.approvalExpiry) < new Date()) {
        return { success: false, message: 'Seu acesso expirou. Procure o administrador.' };
      }
    }

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
    alert('Senha alterada com sucesso!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAppView('dashboard');
    // State cleanup to ensure total isolation on logout
    setSessions([]);
    setPatients([]);
    setPatient({ name: '', mainComplaint: '' });
    setSelectedPairs([]);
    setCurrentStep(Step.PATIENT_INFO);
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
        levelINotes,
        levelIINotes,
        levelIIINotes,
        phenomenaNotes,
        startTime: sessionStartTime,
        endTime: sessionEndTime
    };
    
    setSessions(prev => [newSession, ...prev]);
    
    // Reset session form
    setCurrentStep(Step.PATIENT_INFO);
    setPatient({ name: '', mainComplaint: '' });
    setSelectedPairs([]);
    setProtocolData({ legResponse: '', antennaResponse: '', sessionType: '' });
    setPhenomena({ vascularAccidents: [], tumoralPhenomena: [], tumoralGenesis: [], traumas: [], portalPairs: [] });
    setSelectedEmotions([]);
    setSelectedSensations([]);
    setEmotionsNotes('');
    setSensationsNotes('');
    setImpactionTime('');
    setSessionNotes('');
    setProtocolNotes('');
    setLevelINotes('');
    setLevelIINotes('');
    setLevelIIINotes('');
    setPhenomenaNotes('');
    setSessionStartTime(null);
    setSessionEndTime(null);
    setAppView('dashboard');
  };

  if (!isAuthenticated) return <Login onLogin={handleTherapistLogin} onRequestReset={() => ({success: false, message: ''})} onImportSync={handleImportUsers} />;
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
          <p className="text-slate-500">Terapeuta: <span className="font-bold">{currentUser?.fullName || currentUser?.username}</span></p>
          {lastSyncDate && <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Base de Dados atualizada em: {lastSyncDate}</p>}
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
                <ol role="list" className="flex items-center min-w-[800px]">
                  {[
                    { name: 'Paciente', icon: <UserIcon />, step: Step.PATIENT_INFO },
                    { name: 'Início', icon: <InfoIcon />, step: Step.START_PROTOCOL },
                    { name: 'Nível I', icon: <ClipboardIcon />, step: Step.SCANNING_LEVEL_I },
                    { name: 'Nível II', icon: <ClipboardIcon />, step: Step.SCANNING_LEVEL_II },
                    { name: 'Nível III', icon: <ClipboardIcon />, step: Step.SCANNING_LEVEL_III },
                    { name: 'Fenômenos', icon: <SparklesIcon />, step: Step.PHENOMENA },
                    { name: 'Emocionais', icon: <BrainIcon />, step: Step.EMOTIONAL },
                    { name: 'Final', icon: <SuccessIcon />, step: Step.TREATMENT },
                    { name: 'Relatório', icon: <ReportIcon />, step: Step.SUMMARY }
                  ].map((s, idx) => (
                    <li key={s.name} className={`relative ${idx !== 8 ? 'flex-1' : ''}`}>
                      <button onClick={() => jumpToStep(s.step)} className="flex flex-col items-center text-sm w-full group">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full z-10 transition-all duration-300 transform group-hover:scale-110 ${currentStep >= s.step ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'} ${currentStep === s.step ? 'ring-4 ring-teal-100 scale-110' : ''}`}>
                          {React.cloneElement(s.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                        </span>
                        <span className={`mt-2 text-xs font-medium ${currentStep >= s.step ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>{s.name}</span>
                      </button>
                      {idx !== 8 && <div className="absolute inset-x-0 top-5 left-1/2 -z-0 h-0.5 w-full bg-slate-200" />}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
            <main className="p-6 md:p-10">
              {currentStep === Step.PATIENT_INFO && <PatientForm patient={patient} setPatient={setPatient} onNext={nextStep} patientsList={patients} setPatientsList={setPatients} />}
              {currentStep === Step.START_PROTOCOL && <StartProtocol data={protocolData} setData={setProtocolData} notes={protocolNotes} setNotes={setProtocolNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.PATIENT_INFO)} patientName={patient.name} />}
              {currentStep === Step.SCANNING_LEVEL_I && <Scanning levelTitle="Nível I" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelINotes} setNotes={setLevelINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.START_PROTOCOL)} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.SCANNING_LEVEL_II && <Scanning levelTitle="Nível II" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelIINotes} setNotes={setLevelIINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_I)} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.SCANNING_LEVEL_III && <Scanning levelTitle="Nível III" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelIIINotes} setNotes={setLevelIIINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_II)} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.PHENOMENA && <Phenomena data={phenomena} setData={setPhenomena} notes={phenomenaNotes} setNotes={setPhenomenaNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_III)} />}
              {currentStep === Step.EMOTIONAL && <Emocional selectedEmotions={selectedEmotions} setSelectedEmotions={setSelectedEmotions} selectedSensations={selectedSensations} setSelectedSensations={setSelectedSensations} emotionsNotes={emotionsNotes} setEmotionsNotes={setEmotionsNotes} sensationsNotes={sensationsNotes} setSensationsNotes={setSensationsNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.PHENOMENA)} />}
              {currentStep === Step.TREATMENT && <Treatment impactionTime={impactionTime} setImpactionTime={setImpactionTime} notes={sessionNotes} setNotes={setSessionNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.EMOTIONAL)} sessionType={protocolData.sessionType} />}
              {currentStep === Step.SUMMARY && <SessionSummary patient={patient} protocolData={protocolData} pairs={selectedPairs} phenomena={phenomena} emotions={selectedEmotions} sensations={selectedSensations} emotionsNotes={emotionsNotes} sensationsNotes={sensationsNotes} protocolNotes={protocolNotes} levelINotes={levelINotes} levelIINotes={levelIINotes} levelIIINotes={levelIIINotes} phenomenaNotes={phenomenaNotes} impactionTime={impactionTime} notes={sessionNotes} startTime={sessionStartTime} endTime={sessionEndTime} onFinish={handleFinishSession} onBack={() => setCurrentStep(Step.TREATMENT)} />}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
