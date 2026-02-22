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
import { dbService } from './services/dbService';

// --- SUPABASE MIGRATION IN PROGRESS ---
// IndexedDB utils will be removed after full verification.

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
  const [sessionKey, setSessionKey] = useState<string>(Date.now().toString());

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initAppData = async () => {
      try {
        // Carrega pares do Supabase
        let localPairs: BiomagneticPair[] = await dbService.getPairs();

        if (localPairs.length === 0) {
          // Se o banco estiver vazio, inicializa com os pares constantes
          localPairs = BIOMAGNETIC_PAIRS.filter(p => p.order !== undefined);
          await dbService.savePairs(localPairs);
        }

        setBiomagneticPairs(localPairs);

        // Carregar sessão persistente
        const savedUser = localStorage.getItem('biomagnetismo_user');
        let authenticatedUser: User | null = null;
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser) as User;
            // Validar se o acesso ainda é válido
            if (user.approvalExpiry) {
              const expiry = new Date(user.approvalExpiry);
              if (expiry > new Date()) {
                authenticatedUser = user;
              } else {
                localStorage.removeItem('biomagnetismo_user');
                localStorage.removeItem('biomagnetismo_active_session');
              }
            } else {
              // Sem data de expiração ( Vitalício )
              authenticatedUser = user;
            }
          } catch (e) {
            console.error("Erro ao recuperar sessão do localStorage:", e);
            localStorage.removeItem('biomagnetismo_user');
          }
        }

        if (authenticatedUser) {
          setIsAuthenticated(true);
          setCurrentUser(authenticatedUser);

          // Tentar recuperar atendimento em curso
          const savedActiveSession = localStorage.getItem('biomagnetismo_active_session');
          if (savedActiveSession) {
            try {
              const data = JSON.parse(savedActiveSession);
              if (data.appView === 'sessionWorkflow') {
                setCurrentStep(data.currentStep);
                setPatient(data.patient);
                setProtocolData(data.protocolData);
                setSelectedPairs(data.selectedPairs);
                setPhenomena(data.phenomena);
                setSelectedEmotions(data.selectedEmotions);
                setSelectedSensations(data.selectedSensations);
                setEmotionsNotes(data.emotionsNotes);
                setSensationsNotes(data.sensationsNotes);
                setImpactionTime(data.impactionTime);
                setSessionNotes(data.sessionNotes);
                setProtocolNotes(data.protocolNotes);
                setReservatoriosNotes(data.reservatoriosNotes);
                setLevelINotes(data.levelINotes);
                setLevelIINotes(data.levelIINotes);
                setLevelIIINotes(data.levelIIINotes);
                setPhenomenaNotes(data.phenomenaNotes);
                setSessionStartTime(data.sessionStartTime ? new Date(data.sessionStartTime) : null);
                setSessionEndTime(data.sessionEndTime ? new Date(data.sessionEndTime) : null);
                setAppView('sessionWorkflow');
              }
            } catch (e) {
              console.error("Erro ao recuperar atendimento ativo:", e);
              localStorage.removeItem('biomagnetismo_active_session');
            }
          }

          if (authenticatedUser.requiresPasswordChange) setAppView('changePassword');
        }

        // Carrega usuários para login (inicialmente necessário para o componente Login)
        const users = await dbService.getUsers();
        setAllUsers(users);

        setIsLoading(false);
      } catch (e) {
        console.error("Erro na inicialização dos dados:", e);
        setIsLoading(false);
      }
    };
    initAppData();
  }, []);

  // Efeito de Auto-Save do Atendimento Ativo
  useEffect(() => {
    if (isAuthenticated && appView === 'sessionWorkflow') {
      const activeSessionData = {
        currentStep,
        patient,
        protocolData,
        selectedPairs,
        phenomena,
        selectedEmotions,
        selectedSensations,
        emotionsNotes,
        sensationsNotes,
        impactionTime,
        sessionNotes,
        protocolNotes,
        reservatoriosNotes,
        levelINotes,
        levelIINotes,
        levelIIINotes,
        phenomenaNotes,
        sessionStartTime,
        sessionEndTime,
        appView
      };
      localStorage.setItem('biomagnetismo_active_session', JSON.stringify(activeSessionData));
    }
  }, [
    isAuthenticated, appView, currentStep, patient, protocolData, selectedPairs,
    phenomena, selectedEmotions, selectedSensations, emotionsNotes, sensationsNotes,
    impactionTime, sessionNotes, protocolNotes, reservatoriosNotes, levelINotes,
    levelIINotes, levelIIINotes, phenomenaNotes, sessionStartTime, sessionEndTime
  ]);

  useEffect(() => {
    if (currentUser && !isLoading) {
      const loadUserBoundData = async () => {
        const storedSessions = await dbService.getSessions(currentUser.username);
        const storedPatients = await dbService.getPatients(currentUser.username);

        setSessions(storedSessions);
        setPatients(storedPatients);
      };
      loadUserBoundData();
    }
  }, [currentUser, isLoading]);

  const handleImportSync = async (syncCode: string): Promise<boolean> => {
    // Sincronização offline desativada em favor da persistência em nuvem (Supabase).
    console.warn("Sincronização por código não é mais necessária com o Supabase.");
    return false;
  };

  const handleTherapistLogin = (username: string, password: string): { success: boolean, message?: string } => {
    const foundUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!foundUser) return { success: false, message: 'Usuário ou senha inválidos.' };

    if (foundUser.approvalExpiry) {
      const expiry = new Date(foundUser.approvalExpiry);
      if (expiry < new Date()) {
        return { success: false, message: `Seu acesso expirou em ${expiry.toLocaleDateString('pt-BR')}. Entre em contato com o administrador.` };
      }
    }

    if (!foundUser.isApproved) return { success: false, message: 'Seu cadastro está bloqueado. Entre em contato com o administrador.' };

    setIsAuthenticated(true);
    setCurrentUser(foundUser);
    localStorage.setItem('biomagnetismo_user', JSON.stringify(foundUser));
    setAppView(foundUser.requiresPasswordChange ? 'changePassword' : 'dashboard');
    return { success: true };
  };

  const handleUpdatePassword = async (newPassword: string) => {
    if (!currentUser) return;
    try {
      const updatedUser: User = { ...currentUser, password: newPassword, requiresPasswordChange: false };

      await dbService.updateUser(updatedUser);

      const updatedUsers = allUsers.map(u => u.username === currentUser.username ? updatedUser : u);
      setAllUsers(updatedUsers);
      setCurrentUser(updatedUser);
      setAppView('dashboard');
    } catch (error) {
      console.error("Erro ao atualizar senha no Supabase:", error);
      alert("Erro ao salvar nova senha no banco de dados. Tente novamente.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('biomagnetismo_user');
    localStorage.removeItem('biomagnetismo_active_session');
    setAppView('dashboard');
    setSessions([]);
    setPatients([]);
  };

  const resetSessionState = useCallback(() => {
    setCurrentStep(Step.PATIENT_INFO);
    setPatient({ name: '', mainComplaint: '' });
    setProtocolData({ legResponse: '', antennaResponse: '', sessionType: '' });
    setSelectedPairs([]);
    setPhenomena({
      vascularAccidents: [],
      tumoralPhenomena: [],
      tumoralGenesis: [],
      traumas: [],
      portalPairs: []
    });
    setSelectedEmotions([]);
    setSelectedSensations([]);
    setEmotionsNotes('');
    setSensationsNotes('');
    setImpactionTime('');
    setSessionNotes('');
    setProtocolNotes('');
    setReservatoriosNotes('');
    setLevelINotes('');
    setLevelIINotes('');
    setLevelIIINotes('');
    setPhenomenaNotes('');
    setSessionStartTime(null);
    setSessionEndTime(null);
    setSessionKey(Date.now().toString()); // Força remontagem de todos os componentes de sessão
    localStorage.removeItem('biomagnetismo_active_session');
  }, []);

  const jumpToStep = (step: Step) => {
    if (step === Step.SUMMARY && currentStep < Step.TREATMENT) return;
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep === Step.TREATMENT && !sessionEndTime) setSessionEndTime(new Date());
    if (currentStep < Step.SUMMARY) setCurrentStep(currentStep + 1);
  };

  const handleFinishSession = async () => {
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

    try {
      await dbService.saveSession(currentUser!.username, newSession);
      const newSessions = [newSession, ...sessions];
      setSessions(newSessions);
      setAppView('dashboard');
      resetSessionState();
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
      alert("Erro ao salvar sessão no Supabase. Verifique sua conexão.");
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    if (window.confirm('Tem certeza que deseja excluir este atendimento? Esta ação é irreversível.')) {
      try {
        await dbService.deleteSession(id, currentUser.username);
        setSessions(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        console.error("Erro ao excluir sessão:", error);
        alert("Erro ao excluir sessão no banco de dados.");
      }
    }
  };

  const handleEditSession = (session: Session) => {
    // Carregar dados da sessão no estado global
    setPatient(session.patient);
    setProtocolData(session.protocolData || { legResponse: '', antennaResponse: '', sessionType: '' });
    setSelectedPairs(session.pairs || []);
    setPhenomena(session.phenomena || {
      vascularAccidents: [],
      tumoralPhenomena: [],
      tumoralGenesis: [],
      traumas: [],
      portalPairs: []
    });
    setSelectedEmotions(session.emotions || []);
    setSelectedSensations(session.sensations || []);
    setEmotionsNotes(session.emotionsNotes || '');
    setSensationsNotes(session.sensationsNotes || '');
    setImpactionTime(session.impactionTime || '');
    setSessionNotes(session.notes || '');
    setProtocolNotes(session.protocolNotes || '');
    setReservatoriosNotes(session.reservatoriosNotes || '');
    setLevelINotes(session.levelINotes || '');
    setLevelIINotes(session.levelIINotes || '');
    setLevelIIINotes(session.levelIIINotes || '');
    setPhenomenaNotes(session.phenomenaNotes || '');
    setSessionStartTime(session.startTime ? new Date(session.startTime) : new Date());
    setSessionEndTime(session.endTime ? new Date(session.endTime) : null);

    // Mudar para o fluxo de sessão
    setAppView('sessionWorkflow');
    setCurrentStep(Step.PATIENT_INFO);
  };

  const ValidityHeader = ({ user }: { user: User }) => {
    if (!user.approvalExpiry || user.approvalType === 'permanent') {
      return (
        <div className="flex flex-col items-center mt-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Validade</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seu acesso é Vitalício</p>
        </div>
      );
    }

    const expiry = new Date(user.approvalExpiry);
    const diff = expiry.getTime() - currentTime.getTime();
    const formattedExpiry = expiry.toLocaleDateString('pt-BR') + ' às ' + expiry.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (diff <= 0) return <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-1">Seu acesso expirou em {formattedExpiry}.</p>;

    const minutesRemaining = diff / (1000 * 60);
    const daysRemaining = diff / (1000 * 60 * 60 * 24);

    const isTest = user.approvalType === '5min';
    const isStandardTerm = ['1month', '3months', '6months', '1year'].includes(user.approvalType || '');

    const isUrgent = (isTest && minutesRemaining <= 2) || (isStandardTerm && daysRemaining <= 5);

    return (
      <div className="flex flex-col items-center mt-1">
        <p className={`text-xs font-bold uppercase tracking-widest ${isUrgent ? 'text-red-600' : 'text-slate-500'}`}>Validade</p>
        <p className={`text-sm font-black text-center max-w-xl ${isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
          Seu acesso expira em {formattedExpiry}. {isUrgent && 'Por favor, procure o administrador para revalidar seu acesso.'}
        </p>
      </div>
    );
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-100 font-bold text-teal-600">Carregando Banco de Dados...</div>;
  if (!isAuthenticated) return <Login onLogin={handleTherapistLogin} onRequestReset={() => ({ success: false, message: '' })} />;
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
          <div className="flex flex-col items-center mt-4">
            <p className="text-slate-600 text-sm font-medium">Terapeuta: <span className="text-lg font-black text-slate-800 uppercase">{currentUser?.fullName || currentUser?.username}</span></p>
            {currentUser && <ValidityHeader user={currentUser} />}
          </div>
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
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
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
          <div key={sessionKey} className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden relative">
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
            <main className="p-6 md:p-10 relative">
              {currentStep === Step.PATIENT_INFO && <PatientForm patient={patient} setPatient={setPatient} onNext={nextStep} patientsList={patients} setPatientsList={setPatients} therapistUsername={currentUser!.username} />}
              {currentStep === Step.START_PROTOCOL && <StartProtocol data={protocolData} setData={setProtocolData} notes={protocolNotes} setNotes={setProtocolNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.PATIENT_INFO)} patientName={patient.name} />}
              {currentStep === Step.SCANNING_RESERVATORIOS && <Scanning levelTitle="Reservatórios" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={reservatoriosNotes} setNotes={setReservatoriosNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.START_PROTOCOL)} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.SCANNING_LEVEL_I && <Scanning levelTitle="Nível I" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelINotes} setNotes={setLevelINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_RESERVATORIOS)} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.SCANNING_LEVEL_II && <Scanning levelTitle="Nível II" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelIINotes} setNotes={setLevelIINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_I)} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.SCANNING_LEVEL_III && <Scanning levelTitle="Nível III" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelIIINotes} setNotes={setLevelIIINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_II)} biomagneticPairs={biomagneticPairs} />}
              {currentStep === Step.PHENOMENA && <Phenomena data={phenomena} setData={setPhenomena} notes={phenomenaNotes} setNotes={setPhenomenaNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_III)} />}
              {currentStep === Step.EMOTIONAL && <Emocional selectedEmotions={selectedEmotions} setSelectedEmotions={setSelectedEmotions} selectedSensations={selectedSensations} setSelectedSensations={setSelectedSensations} emotionsNotes={emotionsNotes} setEmotionsNotes={setEmotionsNotes} sensationsNotes={sensationsNotes} setSensationsNotes={setSensationsNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.PHENOMENA)} />}
              {currentStep === Step.TREATMENT && <Treatment impactionTime={impactionTime} setImpactionTime={setImpactionTime} notes={sessionNotes} setNotes={setSessionNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.EMOTIONAL)} sessionType={protocolData.sessionType} />}
              {currentStep === Step.SUMMARY && <SessionSummary patient={patient} protocolData={protocolData} pairs={selectedPairs} phenomena={phenomena} emotions={selectedEmotions} sensations={selectedSensations} emotionsNotes={emotionsNotes} sensationsNotes={sensationsNotes} protocolNotes={protocolNotes} reservatoriosNotes={reservatoriosNotes} levelINotes={levelINotes} levelIINotes={levelIINotes} levelIIINotes={levelIIINotes} phenomenaNotes={phenomenaNotes} impactionTime={impactionTime} notes={sessionNotes} startTime={sessionStartTime} endTime={sessionEndTime} onFinish={handleFinishSession} onBack={() => setCurrentStep(Step.TREATMENT)} />}

              {currentStep === Step.PATIENT_INFO && (
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 print:hidden">
                  <button
                    onClick={() => { resetSessionState(); setAppView('dashboard'); }}
                    className="px-6 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border border-slate-200"
                  >
                    Voltar ao Painel
                  </button>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div >
  );
};

export default App; // atualizando para ler variaveis
// Tentativa final para conectar banco.