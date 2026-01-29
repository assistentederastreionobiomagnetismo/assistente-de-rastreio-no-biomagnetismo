
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

const App: React.FC = () => {
  // Session State
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
  
  // Novas observações por etapa
  const [protocolNotes, setProtocolNotes] = useState<string>('');
  const [levelINotes, setLevelINotes] = useState<string>('');
  const [levelIINotes, setLevelIINotes] = useState<string>('');
  const [levelIIINotes, setLevelIIINotes] = useState<string>('');
  const [phenomenaNotes, setPhenomenaNotes] = useState<string>('');

  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);

  // App Data State
  const [biomagneticPairs, setBiomagneticPairs] = useState<BiomagneticPair[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [viewingHistoricalSession, setViewingHistoricalSession] = useState<Session | null>(null);

  // Auth & View State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appView, setAppView] = useState<AppView>('dashboard');
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  // Load master data and ensure Admin is present
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
    } else {
      usersList = usersList.map(u => 
        u.username.toLowerCase() === 'vbsjunior.biomagnetismo' ? { ...u, isApproved: true, approvalType: 'permanent', password: '@Va135482' } : u
      );
    }
    
    setAllUsers(usersList);
  }, []);

  // Persist Master Pairs
  useEffect(() => {
    if (biomagneticPairs.length > 0) {
      localStorage.setItem(PAIRS_STORAGE_KEY, JSON.stringify(biomagneticPairs));
    }
  }, [biomagneticPairs]);

  // Persist Users
  useEffect(() => {
    if (allUsers.length > 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
    }
  }, [allUsers]);

  // Sync isolated data
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
    }
  }, [currentUser]);

  // MONITORAMENTO DE EXPIRAÇÃO EM TEMPO REAL
  useEffect(() => {
    if (!isAuthenticated || !currentUser || currentUser.approvalType === 'permanent') {
      setRemainingTime(null);
      return;
    }

    const checkExpiry = () => {
      if (!currentUser.approvalExpiry) return;
      const now = new Date();
      const expiry = new Date(currentUser.approvalExpiry);
      const diffMs = expiry.getTime() - now.getTime();

      if (diffMs <= 0) {
        alert("Seu período de acesso expirou.");
        handleLogout();
        return;
      }
      
      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 5) { setRemainingTime(null); return; }
      if (days >= 1) { setRemainingTime(`${days} dia(s)`); return; }
      if (hours >= 1) { setRemainingTime(`${hours} hora(s)`); return; }
      setRemainingTime(`${minutes} minuto(s)`);
    };

    const timer = setInterval(checkExpiry, 10000);
    checkExpiry();
    return () => clearInterval(timer);
  }, [isAuthenticated, currentUser]);

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
    
    if (foundUser.requiresPasswordChange) {
      setAppView('changePassword');
    } else {
      setAppView('dashboard');
    }
    
    return { success: true };
  };

  const handleUpdatePassword = (newPassword: string) => {
    if (!currentUser) return;
    
    const updatedUsers = allUsers.map(u => 
      u.username === currentUser.username ? { ...u, password: newPassword, requiresPasswordChange: false } : u
    );
    
    setAllUsers(updatedUsers);
    setCurrentUser(prev => prev ? { ...prev, password: newPassword, requiresPasswordChange: false } : null);
    setAppView('dashboard');
    alert('Senha alterada com sucesso! Use sua nova senha nos próximos acessos.');
  };

  const handleImportUsers = (syncCode: string): boolean => {
    try {
        const decoded = atob(syncCode);
        const importedData = JSON.parse(decoded);
        
        // Verifica se é o novo formato (Objeto com users e pairs)
        if (typeof importedData === 'object' && !Array.isArray(importedData)) {
            if (importedData.users) setAllUsers(importedData.users);
            if (importedData.pairs) setBiomagneticPairs(importedData.pairs);
            return true;
        } 
        // Suporte ao formato antigo (Apenas Array de usuários)
        else if (Array.isArray(importedData)) {
            setAllUsers(importedData);
            return true;
        }
    } catch (e) {
        console.error("Erro ao importar código de sincronização", e);
    }
    return false;
  };

  const handleRequestPasswordReset = (username: string, newPass: string): { success: boolean, message: string } => {
    const userIndex = allUsers.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex === -1) return { success: false, message: "Usuário não encontrado." };

    const updatedUsers = [...allUsers];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], passwordResetPending: true, pendingPassword: newPass };
    setAllUsers(updatedUsers);
    return { success: true, message: "Solicitação enviada! Aguarde a sincronização do administrador." };
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAppView('dashboard');
    setRemainingTime(null);
  };

  const nextStep = () => {
    if (currentStep === Step.TREATMENT && !sessionEndTime) setSessionEndTime(new Date());
    if (currentStep < Step.SUMMARY) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > Step.PATIENT_INFO) setCurrentStep(currentStep - 1);
  };

  const jumpToStep = (step: Step) => {
    if (step === Step.SUMMARY && currentStep < Step.TREATMENT) return;
    setCurrentStep(step);
  };

  const resetSessionState = () => {
      setCurrentStep(Step.PATIENT_INFO);
      setPatient({ name: '', mainComplaint: '' });
      setProtocolData({ legResponse: '', antennaResponse: '', sessionType: '' });
      setSelectedPairs([]);
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
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    const sessionsKey = `biomag_sessions_${currentUser?.username}`;
    localStorage.setItem(sessionsKey, JSON.stringify(updatedSessions));
    resetSessionState();
    setAppView('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleTherapistLogin} onRequestReset={handleRequestPasswordReset} onImportSync={handleImportUsers} />;
  }

  if (appView === 'changePassword') {
    return <ChangePassword onUpdate={handleUpdatePassword} onLogout={handleLogout} />;
  }

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 relative notranslate" translate="no">
      {viewingHistoricalSession && (
          <SessionDetailModal session={viewingHistoricalSession} onClose={() => setViewingHistoricalSession(null)} />
      )}
      <div className="absolute top-4 right-4 z-10 print:hidden">
        <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-100 transition-colors">
          <LogoutIcon className="w-5 h-5" /> Sair
        </button>
      </div>
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8 print:hidden">
          <h1 className="text-4xl font-bold text-teal-600">Assistente para Rastreios no Biomagnetismo</h1>
          <p className="text-slate-500">Conectado como: <span className="font-bold">{currentUser?.fullName || currentUser?.username}</span></p>
          {remainingTime && (
            <div className="mt-2 max-w-2xl mx-auto">
              <p className="text-red-600 font-bold animate-blink text-sm">Atenção! Seu acesso expira em {remainingTime}.</p>
            </div>
          )}
        </header>
        
        {appView === 'dashboard' && (
          <Dashboard 
            currentUser={currentUser}
            onStartNewSession={() => { resetSessionState(); setSessionStartTime(new Date()); setAppView('sessionWorkflow'); }}
            sessions={sessions}
            patients={patients}
            setPatients={setPatients}
            biomagneticPairs={biomagneticPairs}
            setBiomagneticPairs={setBiomagneticPairs}
            onManageUsers={() => setAppView('userManager')}
            onViewSessionDetail={(s) => setViewingHistoricalSession(s)}
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
                      <button 
                        onClick={() => jumpToStep(s.step)}
                        className="flex flex-col items-center text-sm w-full focus:outline-none group"
                        title={`Ir para etapa ${s.name}`}
                      >
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full z-10 transition-all duration-300 transform group-hover:scale-110 ${currentStep >= s.step ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'} ${currentStep === s.step ? 'ring-4 ring-teal-100 scale-110' : ''}`}>
                          {React.cloneElement(s.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                        </span>
                        <span className={`mt-2 text-xs font-medium transition-colors ${currentStep >= s.step ? 'text-teal-600 font-bold' : 'text-slate-400'} group-hover:text-teal-700`}>{s.name}</span>
                      </button>
                      {idx !== 8 && <div className="absolute inset-x-0 top-5 left-1/2 -z-0 h-0.5 w-full bg-slate-200" />}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
            <main className="p-6 md:p-10">
              {currentStep > Step.START_PROTOCOL && (protocolData.legResponse || protocolData.antennaResponse) && (
                <div className="mb-6 p-4 bg-teal-50 border-l-4 border-teal-500 rounded-r shadow-md animate-fade-in print:hidden">
                  <div className="flex flex-col md:flex-row gap-x-8 gap-y-3">
                    {protocolData.legResponse && (
                      <p className="text-teal-800 font-black text-sm uppercase tracking-tight flex items-center">
                        Sim do paciente: <span className="bg-teal-600 text-white px-3 py-1 rounded-full ml-2 shadow-sm">{protocolData.legResponse}</span>
                      </p>
                    )}
                    {protocolData.sessionType === 'distancia' && protocolData.antennaResponse && (
                      <p className="text-indigo-800 font-black text-sm uppercase tracking-tight flex items-center border-l-0 md:border-l-2 md:pl-8 border-teal-200">
                        Sim da antena: <span className="bg-indigo-600 text-white px-3 py-1 rounded-full ml-2 shadow-sm">{protocolData.antennaResponse}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === Step.PATIENT_INFO && <PatientForm patient={patient} setPatient={setPatient} onNext={nextStep} patientsList={patients} setPatientsList={setPatients} />}
              {currentStep === Step.START_PROTOCOL && <StartProtocol data={protocolData} setData={setProtocolData} notes={protocolNotes} setNotes={setProtocolNotes} onNext={nextStep} onBack={prevStep} patientName={patient.name} />}
              {currentStep === Step.SCANNING_LEVEL_I && <Scanning levelTitle="Nível I" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelINotes} setNotes={setLevelINotes} onNext={nextStep} onBack={prevStep} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.SCANNING_LEVEL_II && <Scanning levelTitle="Nível II" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelIINotes} setNotes={setLevelIINotes} onNext={nextStep} onBack={prevStep} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.SCANNING_LEVEL_III && <Scanning levelTitle="Nível III" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelIIINotes} setNotes={setLevelIIINotes} onNext={nextStep} onBack={prevStep} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.PHENOMENA && <Phenomena data={phenomena} setData={setPhenomena} notes={phenomenaNotes} setNotes={setPhenomenaNotes} onNext={nextStep} onBack={prevStep} />}
              {currentStep === Step.EMOTIONAL && <Emocional 
                  selectedEmotions={selectedEmotions} setSelectedEmotions={setSelectedEmotions} 
                  selectedSensations={selectedSensations} setSelectedSensations={setSelectedSensations} 
                  emotionsNotes={emotionsNotes} setEmotionsNotes={setEmotionsNotes}
                  sensationsNotes={sensationsNotes} setSensationsNotes={setSensationsNotes}
                  onNext={nextStep} onBack={prevStep} />}
              {currentStep === Step.TREATMENT && <Treatment impactionTime={impactionTime} setImpactionTime={setImpactionTime} notes={sessionNotes} setNotes={setSessionNotes} onNext={nextStep} onBack={prevStep} sessionType={protocolData.sessionType} />}
              {currentStep === Step.SUMMARY && <SessionSummary 
                  patient={patient} protocolData={protocolData} pairs={selectedPairs} phenomena={phenomena} 
                  emotions={selectedEmotions} sensations={selectedSensations} 
                  emotionsNotes={emotionsNotes} sensationsNotes={sensationsNotes}
                  protocolNotes={protocolNotes} levelINotes={levelINotes} levelIINotes={levelIINotes} levelIIINotes={levelIIINotes} phenomenaNotes={phenomenaNotes}
                  impactionTime={impactionTime} notes={sessionNotes} startTime={sessionStartTime} endTime={sessionEndTime} onFinish={handleFinishSession} onBack={prevStep} />}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
