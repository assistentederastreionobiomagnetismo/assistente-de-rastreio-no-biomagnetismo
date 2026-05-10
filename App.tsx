import React, { useState, useEffect, useCallback } from 'react';
import { Patient, BiomagneticPair, User, Session, PhenomenaData, ProtocolData, SafetyCheck, ConsentForm, SessionScales, EmotionRelease, SensationRelease, Product } from './types';
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
import Store from './components/Store';
import OfferManager from './components/OfferManager';
import Tutorials from './components/Tutorials';
import TutorialManager from './components/TutorialManager';
import { UserIcon, ClipboardIcon, MagnetIcon, LogoutIcon, SparklesIcon, InfoIcon, BrainIcon, SuccessIcon, ReportIcon, CheckIcon, DropletIcon, LayerOneIcon, LayerTwoIcon, LayerThreeIcon, HeartPulseIcon, StoreIcon, ExternalLinkIcon } from './components/icons/Icons';
import { BIOMAGNETIC_PAIRS } from './constants';
import { dbService } from './services/dbService';
import RemoteSignature from './components/RemoteSignature';
import { hashPassword } from './lib/crypto';
import StoreCTA from './components/StoreCTA';
import SubscriptionGate from './components/SubscriptionGate';

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

type AppView = 'dashboard' | 'sessionWorkflow' | 'userManager' | 'changePassword' | 'store' | 'offerManager' | 'tutorials' | 'tutorialManager';



const App: React.FC = () => {
  const [appView, setAppView] = useState<AppView>('dashboard');
  const [previousView, setPreviousView] = useState<AppView>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>(Step.PATIENT_INFO);
  const [patient, setPatient] = useState<Patient>({ name: '', mainComplaint: '' });
  const [safetyCheck, setSafetyCheck] = useState<SafetyCheck>({
    hasMedicalFollowUp: '',
    usesContinuousMedication: '',
    hasPacemakerOrDevice: '',
    isPregnantOrSuspected: '',
    hasRelevantDiagnoses: ''
  });
  const [consentForm, setConsentForm] = useState<ConsentForm>({ status: 'pending' });
  const [scalesBefore, setScalesBefore] = useState<SessionScales>({ pain: '', anxiety: '', tiredness: '' });
  const [scalesAfter, setScalesAfter] = useState<SessionScales>({ pain: '', anxiety: '', tiredness: '' });
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
  const [emotionsData, setEmotionsData] = useState<EmotionRelease[]>([]);
  const [sensationsData, setSensationsData] = useState<SensationRelease[]>([]);
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
  const [therapistSignature, setTherapistSignature] = useState<string>('');
  const [sessionKey, setSessionKey] = useState<string>(Date.now().toString());

  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [biomagneticPairs, setBiomagneticPairs] = useState<BiomagneticPair[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lastSyncDate, setLastSyncDate] = useState<string>('');
  const [viewingHistoricalSession, setViewingHistoricalSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [showSubscriptionGate, setShowSubscriptionGate] = useState(false);
  const [monthlyUsage, setMonthlyUsage] = useState(0);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('biomagnetismo_user');
    localStorage.removeItem('biomagnetismo_active_session');
    setAppView('dashboard');
    setSessions([]);
    setPatients([]);
  }, []);

  const resetSessionState = useCallback(() => {
    setCurrentStep(Step.PATIENT_INFO);
    setPatient({ name: '', mainComplaint: '' });
    setSafetyCheck({
      hasMedicalFollowUp: '',
      usesContinuousMedication: '',
      hasPacemakerOrDevice: '',
      isPregnantOrSuspected: '',
      hasRelevantDiagnoses: ''
    });
    setConsentForm({ status: 'pending' });
    setScalesBefore({ pain: '', anxiety: '', tiredness: '' });
    setScalesAfter({ pain: '', anxiety: '', tiredness: '' });
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
    setEmotionsData([]);
    setSensationsData([]);
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
    setTherapistSignature('');
    setEditingSessionId(null); // Limpar modo de edição
    setSessionKey(Date.now().toString()); // Força remontagem de todos os componentes de sessão
    localStorage.removeItem('biomagnetismo_active_session');
  }, []);

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
                setSafetyCheck(data.safetyCheck || {
                  hasMedicalFollowUp: '',
                  usesContinuousMedication: '',
                  hasPacemakerOrDevice: '',
                  isPregnantOrSuspected: '',
                  hasRelevantDiagnoses: ''
                });
                setConsentForm(data.consentForm || { status: 'pending' });
                setScalesBefore(data.scalesBefore || { pain: '', anxiety: '', tiredness: '' });
                setScalesAfter(data.scalesAfter || { pain: '', anxiety: '', tiredness: '' });
                setProtocolData(data.protocolData);
                setSelectedPairs(data.selectedPairs);
                setPhenomena(data.phenomena);
                setSelectedEmotions(data.selectedEmotions);
                setSelectedSensations(data.selectedSensations);
                setEmotionsData(data.emotionsData || []);
                setSensationsData(data.sensationsData || []);
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
                setTherapistSignature(data.therapistSignature || '');
                setAppView('sessionWorkflow');
              }
            } catch (e) {
              console.error("Erro ao recuperar atendimento ativo:", e);
              localStorage.removeItem('biomagnetismo_active_session');
            }
          }

          if (authenticatedUser.requiresPasswordChange) setAppView('changePassword');

          // Verificação de Trial de 30 dias
          const createdDate = authenticatedUser.createdAt ? new Date(authenticatedUser.createdAt) : new Date();
          const trialExpiry = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          const isTrialExpired = (authenticatedUser.planType === 'trial' || !authenticatedUser.planType) && trialExpiry < new Date();
          
          if (isTrialExpired && authenticatedUser.username !== 'vbsjunior.biomagnetismo') {
            setShowSubscriptionGate(true);
          }

          // Carregar uso mensal se for plano híbrido
          if (authenticatedUser.planType === 'hybrid') {
            const usage = await dbService.getMonthlyUsage(authenticatedUser.username);
            setMonthlyUsage(usage);
          }
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

  // Remote Signature URL Parameter Handling
  const urlParams = new URLSearchParams(window.location.search);
  const signatureIdParam = urlParams.get('sign');
  
  if (signatureIdParam) {
     return <RemoteSignature signatureId={signatureIdParam} />;
  }

  // Efeito de Auto-Save do Atendimento Ativo
  useEffect(() => {
    if (isAuthenticated && appView === 'sessionWorkflow') {
      const activeSessionData = {
        currentStep,
        patient,
        safetyCheck,
        consentForm,
        scalesBefore,
        scalesAfter,
        protocolData,
        selectedPairs,
        phenomena,
        selectedEmotions,
        selectedSensations,
        emotionsData,
        sensationsData,
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
        therapistSignature,
        appView
      };
      localStorage.setItem('biomagnetismo_active_session', JSON.stringify(activeSessionData));
    }
  }, [
    isAuthenticated, appView, currentStep, patient, safetyCheck, consentForm, scalesBefore, scalesAfter, protocolData, selectedPairs,
    phenomena, selectedEmotions, selectedSensations, emotionsData, sensationsData, emotionsNotes, sensationsNotes,
    impactionTime, sessionNotes, protocolNotes, reservatoriosNotes, levelINotes,
    levelIINotes, levelIIINotes, phenomenaNotes, sessionStartTime, sessionEndTime, therapistSignature
  ]);

  // Efeito para monitorar expiração de acesso + 5 minutos de carência
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.approvalExpiry && currentUser.approvalType !== 'permanent') {
      const expiry = new Date(currentUser.approvalExpiry);
      const gracePeriodMs = 5 * 60 * 1000;
      const logoutTimeLimit = expiry.getTime() + gracePeriodMs;

      if (currentTime.getTime() >= logoutTimeLimit) {
        console.warn("Acesso expirado há mais de 5 minutos. Logout automático realizado.");
        handleLogout();
        window.location.reload(); // Refresh automático solicitado pelo usuário
      }
    }
  }, [currentTime, isAuthenticated, currentUser, handleLogout]);

  useEffect(() => {
    if (currentUser && !isLoading) {
      const loadUserBoundData = async () => {
        try {
          const [storedSessions, storedPatients, storedProducts] = await Promise.all([
            dbService.getSessions(currentUser.username),
            dbService.getPatients(currentUser.username),
            dbService.getProducts()
          ]);
  
          setSessions(storedSessions);
          setPatients(storedPatients);
          setProducts(storedProducts);
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      };
      loadUserBoundData();
    }
  }, [currentUser, isLoading]);

  const handleImportSync = async (syncCode: string): Promise<boolean> => {
    // Sincronização offline desativada em favor da persistência em nuvem (Supabase).
    console.warn("Sincronização por código não é mais necessária com o Supabase.");
    return false;
  };

  const handleTherapistLogin = async (username: string, password: string): Promise<{ success: boolean, message?: string }> => {
    const inputHash = await hashPassword(password);
    
    // 1. Verificar se o usuário existe (case-insensitive no username)
    const foundUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!foundUser) return { success: false, message: 'Usuário ou senha inválidos.' };

    // 2. Verificação de Segurança (Hash vs Plaintext)
    // Se a senha no banco tiver 64 caracteres, é provavelmente um hash SHA-256
    const isStoredAsHash = foundUser.password && foundUser.password.length === 64;
    
    let isMatch = false;
    if (isStoredAsHash) {
      isMatch = (foundUser.password === inputHash);
    } else {
      // Compatibilidade com usuários antigos: verifica texto puro
      isMatch = (foundUser.password === password);
      
      // MIGRAÇÃO AUTOMÁTICA: Se o texto puro bateu, converte agora para hash no banco
      if (isMatch) {
        try {
          const migratedUser = { ...foundUser, password: inputHash };
          await dbService.updateUser(migratedUser);
          // Atualiza o estado local também
          setAllUsers(prev => prev.map(u => u.username === foundUser.username ? migratedUser : u));
        } catch (e) {
          console.error("Erro na migração silenciosa de senha:", e);
        }
      }
    }

    if (!isMatch) return { success: false, message: 'Usuário ou senha inválidos.' };

    // 3. Verificar se está bloqueado manualmente
    if (!foundUser.isApproved) return { success: false, message: 'Seu cadastro está bloqueado. Entre em contato com o administrador.' };

    // 4. Se precisa trocar senha (resultado de reset), deixar entrar independentemente de expiração
    if (foundUser.requiresPasswordChange) {
      const normalizedUser = { ...foundUser, username: foundUser.username.toLowerCase() };
      setIsAuthenticated(true);
      setCurrentUser(normalizedUser);
      localStorage.setItem('biomagnetismo_user', JSON.stringify(normalizedUser));
      setAppView('changePassword');
      return { success: true };
    }

    // 5. Verificar expiração
    if (foundUser.approvalExpiry) {
      const expiry = new Date(foundUser.approvalExpiry);
      if (expiry < new Date()) {
        return { success: false, message: `Seu acesso expirou em ${expiry.toLocaleDateString('pt-BR')}. Entre em contato com o administrador.` };
      }
    }

    const normalizedUser = { ...foundUser, username: foundUser.username.toLowerCase() };
    setIsAuthenticated(true);
    setCurrentUser(normalizedUser);
    localStorage.setItem('biomagnetismo_user', JSON.stringify(normalizedUser));
    setAppView('dashboard');
    return { success: true };
  };

  const handleUpdatePassword = async (newPassword: string) => {
    if (!currentUser) return;
    try {
      const secureHash = await hashPassword(newPassword);
      const updatedUser: User = {
        ...currentUser,
        username: currentUser.username.toLowerCase(),
        password: secureHash,
        requiresPasswordChange: false
      };

      await dbService.updateUser(updatedUser);
      
      const updatedUsers = allUsers.map(u => u.username.toLowerCase() === currentUser.username.toLowerCase() ? updatedUser : u);
      setAllUsers(updatedUsers);
      setCurrentUser(updatedUser);
      setAppView('dashboard');
    } catch (error) {
      console.error("Erro ao atualizar senha no Supabase:", error);
      alert("Erro ao salvar nova senha no banco de dados. Tente novamente.");
    }
  };


  const jumpToStep = (step: Step) => {
    if (step === Step.SUMMARY && currentStep < Step.TREATMENT) return;
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep === Step.TREATMENT && !sessionEndTime) setSessionEndTime(new Date());
    if (currentStep < Step.SUMMARY) setCurrentStep(currentStep + 1);
  };

  const handleStartSession = async () => {
    if (!currentUser) return;
    
    // Verificação de Limites (Plano Híbrido)
    if (currentUser.planType === 'hybrid' && currentUser.username !== 'vbsjunior.biomagnetismo') {
        const usage = await dbService.getMonthlyUsage(currentUser.username);
        const totalAvailable = 5 + (currentUser.extraSessions || 0);
        if (usage >= totalAvailable) {
            setShowSubscriptionGate(true);
            return;
        }
    }

    // Verificação de Expiração Anual / Trial
    if (currentUser.approvalExpiry) {
        const expiry = new Date(currentUser.approvalExpiry);
        if (expiry < new Date() && currentUser.username !== 'vbsjunior.biomagnetismo') {
            setShowSubscriptionGate(true);
            return;
        }
    }

    resetSessionState(); 
    setSessionStartTime(new Date()); 
    setAppView('sessionWorkflow');
  };

  const handleFinishSession = async (finalTherapistSig?: string) => {
    const isEditing = !!editingSessionId;
    const currentTherapistSig = finalTherapistSig !== undefined ? finalTherapistSig : therapistSignature;
    
    const newSession: Session = {
      id: isEditing ? editingSessionId! : new Date().toISOString(),
      patient,
      safetyCheck,
      consentForm,
      scalesBefore,
      scalesAfter,
      protocolData,
      pairs: selectedPairs,
      phenomena,
      emotions: selectedEmotions,
      sensations: selectedSensations,
      emotionsData,
      sensationsData,
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
      endTime: sessionEndTime,
      therapistSignature: currentTherapistSig,
      ...(isEditing ? { editedAt: new Date().toISOString() } : {})
    };

    try {
      await dbService.saveSession(currentUser!.username, newSession);
      
      // Registrar log de uso se não for edição
      if (!isEditing) {
          await dbService.logUsage(currentUser!.username, newSession.id);
          if (currentUser!.planType === 'hybrid') {
              setMonthlyUsage(prev => prev + 1);
          }
      }

      if (isEditing) {
        // Substituir a sessão existente no array (sem duplicar)
        setSessions(prev => prev.map(s => s.id === editingSessionId ? newSession : s));
      } else {
        // Nova sessão: adicionar ao topo do histórico
        setSessions(prev => [newSession, ...prev]);
      }

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
    // Salvar o ID da sessão sendo editada para não criar duplicata
    setEditingSessionId(session.id);

    // Carregar dados da sessão no estado global
    setPatient(session.patient);
    setSafetyCheck(session.safetyCheck || {
      hasMedicalFollowUp: '',
      usesContinuousMedication: '',
      hasPacemakerOrDevice: '',
      isPregnantOrSuspected: '',
      hasRelevantDiagnoses: ''
    });
    setConsentForm(session.consentForm || { status: 'pending' });
    setScalesBefore(session.scalesBefore || { pain: '', anxiety: '', tiredness: '' });
    setScalesAfter(session.scalesAfter || { pain: '', anxiety: '', tiredness: '' });
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
    setEmotionsData(session.emotionsData || []);
    setSensationsData(session.sensationsData || []);
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
    setTherapistSignature(session.therapistSignature || '');

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
    const formattedExpiryDay = expiry.toLocaleDateString('pt-BR');
    const formattedExpiryTime = expiry.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Período de carência de 5 minutos solicitado
    const gracePeriodMs = 5 * 60 * 1000;
    const timeSinceExpiry = currentTime.getTime() - expiry.getTime();
    const remainingGraceMs = gracePeriodMs - timeSinceExpiry;

    if (diff <= 0) {
      const minutesRemaining = Math.max(0, Math.ceil(remainingGraceMs / (1000 * 60)));
      return (
        <div className="flex flex-col items-center mt-1 bg-red-50 p-3 rounded-2xl border border-red-100 shadow-sm animate-pulse">
          <p className="text-xs font-black text-red-600 uppercase tracking-widest">Acesso Expirado</p>
          <p className="text-[11px] font-bold text-red-500 mt-1">
            Logout automático em aproximadamente {minutesRemaining} minuto{minutesRemaining !== 1 ? 's' : ''}.
          </p>
          <p className="text-[9px] font-medium text-red-400 uppercase tracking-widest mt-1">Procure o administrador para revalidar agora.</p>
        </div>
      );
    }

    const minutesRemaining = diff / (1000 * 60);
    const daysRemaining = diff / (1000 * 60 * 60 * 24);

    const isTest = user.approvalType === '5min';
    const isStandardTerm = ['1month', '3months', '6months', '1year'].includes(user.approvalType || '');

    const isUrgent = (isTest && minutesRemaining <= 2) || (isStandardTerm && daysRemaining <= 5);

    return (
      <div className="flex flex-col items-center mt-1">
        <p className={`text-xs font-bold uppercase tracking-widest ${isUrgent ? 'text-red-600' : 'text-slate-500'}`}>Validade</p>
        <p className={`text-sm font-black text-center max-w-xl ${isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
          Seu acesso expira em {formattedExpiryDay} às {formattedExpiryTime}. {isUrgent && 'Por favor, procure o administrador para revalidar seu acesso.'}
        </p>
      </div>
    );
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-100 font-bold text-teal-600">Carregando Banco de Dados...</div>;
  if (!isAuthenticated) return <Login onLogin={handleTherapistLogin} onRequestReset={() => ({ success: false, message: '' })} />;
  if (appView === 'changePassword') return <ChangePassword onUpdate={handleUpdatePassword} onLogout={handleLogout} />;

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 relative notranslate" translate="no">
      {showSubscriptionGate && <SubscriptionGate user={currentUser} />}
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
            onStartNewSession={handleStartSession}
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
            onOpenStore={() => { setPreviousView(appView); setAppView('store'); }}
            onManageOffers={() => setAppView('offerManager')}
            onOpenTutorials={() => { setPreviousView(appView); setAppView('tutorials'); }}
            onManageTutorials={() => setAppView('tutorialManager')}
            monthlyUsage={monthlyUsage}
          />
        )}

        {appView === 'tutorials' && (
          <Tutorials 
            onBack={() => setAppView(previousView)}
          />
        )}

        {appView === 'tutorialManager' && (
          <TutorialManager 
            onBack={() => setAppView('dashboard')}
          />
        )}

        {appView === 'store' && (
          <Store 
            products={products} 
            onExit={() => setAppView(previousView)}
            onGoToDashboard={() => setAppView('dashboard')}
          />
        )}

        {appView === 'offerManager' && (
          <OfferManager 
            products={products} 
            setProducts={setProducts} 
            onExit={() => setAppView('dashboard')} 
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
            <div className="p-3 md:p-6 border-b border-slate-200 overflow-x-auto print:hidden">
              <nav aria-label="Progress">
                <ol role="list" className="flex items-center min-w-[720px] md:min-w-0">
                  {[
                    { name: 'Paciente', icon: <UserIcon />, step: Step.PATIENT_INFO },
                    { name: 'Início', icon: <InfoIcon />, step: Step.START_PROTOCOL },
                    { name: 'Reserv.', icon: <DropletIcon />, step: Step.SCANNING_RESERVATORIOS },
                    { name: 'Nível I', icon: <LayerOneIcon />, step: Step.SCANNING_LEVEL_I },
                    { name: 'Nível II', icon: <LayerTwoIcon />, step: Step.SCANNING_LEVEL_II },
                    { name: 'Nível III', icon: <LayerThreeIcon />, step: Step.SCANNING_LEVEL_III },
                    { name: 'Fenôm.', icon: <SparklesIcon />, step: Step.PHENOMENA },
                    { name: 'Emoc.', icon: <HeartPulseIcon />, step: Step.EMOTIONAL },
                    { name: 'Final', icon: <SuccessIcon />, step: Step.TREATMENT },
                    { name: 'Relatório', icon: <ReportIcon />, step: Step.SUMMARY }
                  ].map((s, idx) => (
                    <li key={s.name} className={`relative ${idx !== 9 ? 'flex-1' : ''}`}>
                      <button onClick={() => jumpToStep(s.step)} className="flex flex-col items-center text-sm w-full group">
                        <span className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full z-10 transition-all duration-300 transform group-hover:scale-110 ${currentStep >= s.step ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'} ${currentStep === s.step ? 'ring-4 ring-teal-100 scale-110' : ''}`}>
                          {React.cloneElement(s.icon as React.ReactElement<any>, { className: "w-5 h-5 md:w-6 md:h-6" })}
                        </span>
                        <span className={`mt-1 text-[9px] md:text-[10px] font-bold ${currentStep >= s.step ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>{s.name}</span>
                      </button>
                      {idx !== 9 && <div className="absolute inset-x-0 top-4 md:top-5 left-1/2 -z-0 h-0.5 w-full bg-slate-200" />}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
            <main className="p-6 md:p-10 relative">
              <div className={currentStep === Step.PATIENT_INFO ? 'block' : 'hidden'}>
                <PatientForm 
                  patient={patient} 
                  setPatient={setPatient} 
                  safetyCheck={safetyCheck}
                  setSafetyCheck={setSafetyCheck}
                  consentForm={consentForm}
                  setConsentForm={setConsentForm}
                  scalesBefore={scalesBefore}
                  setScalesBefore={setScalesBefore}
                  onNext={nextStep} 
                  patientsList={patients} 
                  setPatientsList={setPatients} 
                  therapistUsername={currentUser!.username} 
                  onLoadLastSessionAdminData={async () => {
                     try {
                       const sessionsRecord = await dbService.getSessions(currentUser!.username);
                       const patientSessions = sessionsRecord.filter(s => s.patient.id === patient.id).sort((a, b) => {
                          const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
                          const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
                          return dateB - dateA;
                       });

                       if (patientSessions.length > 0) {
                         const lastSession = patientSessions[0];
                         
                         // Fill Safety Check
                         if (lastSession.safetyCheck) {
                           setSafetyCheck(lastSession.safetyCheck);
                         }

                         // Fill Protocol Type / Session Type
                         if (lastSession.protocolData) {
                           setProtocolData(prev => ({
                             ...prev,
                             sessionType: lastSession.protocolData?.sessionType || prev.sessionType,
                           }));
                         }
                         
                         alert("Dados administrativos da última sessão carregados. Verifique e atualize se necessário antes de prosseguir.");
                       } else {
                         alert("Nenhuma sessão anterior encontrada para este paciente.");
                       }
                     } catch (error) {
                       console.error("Erro ao buscar a última sessão:", error);
                       alert("Não foi possível carregar os dados da última sessão.");
                     }
                  }}
                  onResetSession={resetSessionState}
                />
              </div>
              <div className={currentStep === Step.START_PROTOCOL ? 'block' : 'hidden'}>
                <StartProtocol data={protocolData} setData={setProtocolData} notes={protocolNotes} setNotes={setProtocolNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.PATIENT_INFO)} patientName={patient.name} patientComplaint={patient.mainComplaint} />
              </div>
              <div className={currentStep === Step.SCANNING_RESERVATORIOS ? 'block' : 'hidden'}>
                <Scanning levelTitle="Reservatórios" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={reservatoriosNotes} setNotes={setReservatoriosNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.START_PROTOCOL)} biomagneticPairs={biomagneticPairs} />
              </div>
              <div className={currentStep === Step.SCANNING_LEVEL_I ? 'block' : 'hidden'}>
                <Scanning levelTitle="Nível I" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelINotes} setNotes={setLevelINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_RESERVATORIOS)} biomagneticPairs={biomagneticPairs} />
              </div>
              <div className={currentStep === Step.SCANNING_LEVEL_II ? 'block' : 'hidden'}>
                <Scanning levelTitle="Nível II" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelIINotes} setNotes={setLevelIINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_I)} biomagneticPairs={biomagneticPairs} />
              </div>
              <div className={currentStep === Step.SCANNING_LEVEL_III ? 'block' : 'hidden'}>
                <Scanning levelTitle="Nível III" selectedPairs={selectedPairs} setSelectedPairs={setSelectedPairs} notes={levelIIINotes} setNotes={setLevelIIINotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_II)} biomagneticPairs={biomagneticPairs} />
              </div>
              <div className={currentStep === Step.PHENOMENA ? 'block' : 'hidden'}>
                <Phenomena data={phenomena} setData={setPhenomena} notes={phenomenaNotes} setNotes={setPhenomenaNotes} onNext={nextStep} onBack={() => setCurrentStep(Step.SCANNING_LEVEL_III)} />
              </div>
              <div className={currentStep === Step.EMOTIONAL ? 'block' : 'hidden'}>
                <Emocional 
                  selectedEmotions={selectedEmotions} 
                  setSelectedEmotions={setSelectedEmotions} 
                  selectedSensations={selectedSensations} 
                  setSelectedSensations={setSelectedSensations} 
                  emotionsData={emotionsData}
                  setEmotionsData={setEmotionsData}
                  sensationsData={sensationsData}
                  setSensationsData={setSensationsData}
                  emotionsNotes={emotionsNotes} 
                  setEmotionsNotes={setEmotionsNotes} 
                  sensationsNotes={sensationsNotes} 
                  setSensationsNotes={setSensationsNotes} 
                  onNext={nextStep} 
                  onBack={() => setCurrentStep(Step.PHENOMENA)} 
                  patientName={patient.name}
                />
              </div>
              <div className={currentStep === Step.TREATMENT ? 'block' : 'hidden'}>
                <Treatment impactionTime={impactionTime} setImpactionTime={setImpactionTime} notes={sessionNotes} setNotes={setSessionNotes} scalesBefore={scalesBefore} scalesAfter={scalesAfter} setScalesAfter={setScalesAfter} onNext={nextStep} onBack={() => setCurrentStep(Step.EMOTIONAL)} sessionType={protocolData.sessionType} />
              </div>
              <div className={currentStep === Step.SUMMARY ? 'block' : 'hidden'}>
                <SessionSummary 
                  patient={patient} 
                  protocolData={protocolData} 
                  pairs={selectedPairs} 
                  phenomena={phenomena} 
                  emotions={selectedEmotions} 
                  sensations={selectedSensations} 
                  emotionsData={emotionsData}
                  sensationsData={sensationsData}
                  emotionsNotes={emotionsNotes} 
                  sensationsNotes={sensationsNotes} 
                  protocolNotes={protocolNotes} 
                  reservatoriosNotes={reservatoriosNotes} 
                  levelINotes={levelINotes} 
                  levelIINotes={levelIINotes} 
                  levelIIINotes={levelIIINotes} 
                  phenomenaNotes={phenomenaNotes} 
                  impactionTime={impactionTime} 
                  notes={sessionNotes} 
                  startTime={sessionStartTime} 
                  endTime={sessionEndTime} 
                  safetyCheck={safetyCheck} 
                  consentForm={consentForm} 
                  scalesBefore={scalesBefore} 
                  scalesAfter={scalesAfter} 
                  therapistSignature={therapistSignature} 
                  setTherapistSignature={setTherapistSignature} 
                  onFinish={handleFinishSession} 
                  onBack={() => setCurrentStep(Step.TREATMENT)} 
                />
              </div>

              <div className={`absolute bottom-6 left-6 md:bottom-10 md:left-10 print:hidden ${currentStep === Step.PATIENT_INFO ? 'block' : 'hidden'}`}>
                <button
                  onClick={() => { resetSessionState(); setAppView('dashboard'); }}
                  className="px-6 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border border-slate-200"
                >
                  Voltar ao Painel
                </button>
              </div>
            </main>
          </div>
        )}

        {/* Global Store CTA - Only for non-admin users and not in Store/OfferManager views */}
        {currentUser && 
         currentUser.username !== 'vbsjunior.biomagnetismo' && 
         appView === 'sessionWorkflow' && (
          <StoreCTA 
            onOpenStore={() => { setPreviousView(appView); setAppView('store'); }} 
            className="max-w-6xl"
          />
        )}
      </div>
    </div >
  );
};

export default App; // atualizando para ler variaveis
// Tentativa final para conectar banco.