import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Patient, SafetyCheck, ConsentForm, SessionScales } from '../types';
import { SearchIcon, UserIcon, PlusIcon, TrashIcon, PencilIcon, CheckIcon, WhatsAppIcon } from './icons/Icons';
import { dbService } from '../services/dbService';

interface PatientFormProps {
  patient: Patient;
  setPatient: React.Dispatch<React.SetStateAction<Patient>>;
  safetyCheck: SafetyCheck;
  setSafetyCheck: React.Dispatch<React.SetStateAction<SafetyCheck>>;
  consentForm: ConsentForm;
  setConsentForm: React.Dispatch<React.SetStateAction<ConsentForm>>;
  scalesBefore: SessionScales;
  setScalesBefore: React.Dispatch<React.SetStateAction<SessionScales>>;
  patientsList: Patient[];
  setPatientsList: React.Dispatch<React.SetStateAction<Patient[]>>;
  therapistUsername: string;
  onNext: () => void;
  onLoadLastSessionAdminData?: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ 
  patient, setPatient, 
  safetyCheck, setSafetyCheck,
  consentForm, setConsentForm,
  scalesBefore, setScalesBefore,
  patientsList, setPatientsList, therapistUsername, onNext, onLoadLastSessionAdminData 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [signatureCpf, setSignatureCpf] = useState('');
  const [hasAgreement, setHasAgreement] = useState(false);

  // New Patient Modal State
  const [newPatientData, setNewPatientData] = useState<Patient>({
    name: '',
    birthDate: '',
    email: '',
    phone: '',
    mainComplaint: ''
  });

  const [isWaitingSignature, setIsWaitingSignature] = useState(false);
  const [pendingSignatureId, setPendingSignatureId] = useState<string | null>(null);

  const calculateAge = (birthDate: string): number | undefined => {
    if (!birthDate || birthDate.length < 10) return undefined;
    const parts = birthDate.split('/');
    if (parts.length !== 3) return undefined;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;

    const today = new Date();
    const birth = new Date(year, month, day);

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const applyDateMask = (value: string) => {
    let val = value.replace(/\D/g, ''); // remove non-digits
    if (val.length > 8) val = val.slice(0, 8);

    let formatted = val;
    if (val.length > 2) formatted = val.slice(0, 2) + '/' + val.slice(2);
    if (val.length > 4) formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);

    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let finalValue = value;
    if (name === 'birthDate') {
      finalValue = applyDateMask(value);
    }

    setPatient(prev => {
      const updated = { ...prev, [name]: finalValue };
      if (name === 'birthDate') {
        updated.age = calculateAge(finalValue);
      }
      return updated;
    });
  };

  const handleNewPatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'birthDate') {
      finalValue = applyDateMask(value);
    }
    setNewPatientData(prev => ({ ...prev, [name]: finalValue }));
  };

  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return [];
    // Deduplicate by name and phone to ensure unique results in UI
    const seen = new Set();
    return patientsList.filter(p => {
      const isMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!isMatch) return false;
      const key = `${p.name}-${p.phone}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 5);
  }, [searchTerm, patientsList]);

  const selectExistingPatient = (p: Patient) => {
    setPatient({
      ...p,
      mainComplaint: '', // Reset complaint for new session context
      age: calculateAge(p.birthDate || '')
    });
    setSearchTerm(p.name);
    setShowDropdown(false);
  };

  const handleManualSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPatient(prev => ({ ...prev, name: e.target.value }));
    setShowDropdown(true);
  };

  const handleEditInSearch = (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setNewPatientData(p);
    setIsRegisterModalOpen(true);
    setShowDropdown(false);
  };

  const handleDeleteInSearch = async (id: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    if (window.confirm('Tem certeza que deseja excluir este paciente? Esta ação removerá o cadastro permanentemente.')) {
      try {
        await dbService.deletePatient(id, therapistUsername);
        setPatientsList(prev => prev.filter(p => p.id !== id));
        if (patient.id === id) {
          setPatient({ name: '', birthDate: '', email: '', phone: '', mainComplaint: '' });
          setSearchTerm('');
        }
        setShowDropdown(false);
      } catch (error) {
        console.error("Erro ao excluir paciente:", error);
        alert("Erro ao excluir paciente no banco de dados.");
      }
    }
  };

  const handleRegisterNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!newPatientData.id;
    const patientToSave = {
      ...newPatientData,
      id: newPatientData.id || Date.now().toString(),
      age: calculateAge(newPatientData.birthDate || '')
    };

    try {
      await dbService.savePatient(therapistUsername, patientToSave);

      if (isEditing) {
        setPatientsList(prev => prev.map(p => p.id === patientToSave.id ? patientToSave : p));
      } else {
        setPatientsList(prev => [...prev, patientToSave]);
      }

      selectExistingPatient(patientToSave);
      setIsRegisterModalOpen(false);
      setNewPatientData({ name: '', birthDate: '', email: '', phone: '', mainComplaint: '' });
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      alert("Erro ao salvar paciente no banco de dados.");
    }
  };

  const handleSafetyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSafetyCheck(prev => ({ ...prev, [name]: value }));
  };

  const isSafetyCheckComplete = [
    safetyCheck.hasMedicalFollowUp,
    safetyCheck.usesContinuousMedication,
    safetyCheck.hasPacemakerOrDevice,
    safetyCheck.isPregnantOrSuspected,
    safetyCheck.hasRelevantDiagnoses
  ].every(v => v === 'Sim' || v === 'Não');

  const showSafetyWarning = safetyCheck.hasPacemakerOrDevice === 'Sim' || safetyCheck.isPregnantOrSuspected === 'Sim';

  const isSafetyCheckValid = isSafetyCheckComplete;
  
  const isPatientDataValid = patient.name.trim() !== '' && (patient.birthDate || '').length === 10;
  
  const isConsentSigned = consentForm.status === 'signed_local' || consentForm.status === 'signed_remote';
  
  const isComplaintValid = (patient.mainComplaint || '').trim().length >= 3;

  const isFormValid = isPatientDataValid 
                      && isSafetyCheckValid 
                      && isConsentSigned
                      && isComplaintValid;

  const getSectionClass = (isLocked: boolean) => 
    `transition-all duration-500 ${isLocked ? 'opacity-30 blur-[1px] pointer-events-none' : 'opacity-100'}`;

  // --- Signature Canvas Logic ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const confirmSignature = () => {
    if (!hasAgreement) {
      alert("Você precisa marcar a caixa de seleção concordando com os termos.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Simplification check for blank canvas (heuristic)
    const ctx = canvas.getContext('2d');
    const pixelBuffer = new Uint32Array(ctx!.getImageData(0,0, canvas.width, canvas.height).data.buffer);
    const hasDrawn = pixelBuffer.some(color => color !== 0);
    
    if (!hasDrawn) {
      alert("Por favor, assine no campo indicado.");
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    
    setConsentForm({
      status: 'signed_local',
      dateSigned: new Date().toISOString(),
      signedName: signatureName || patient.name,
      cpf: signatureCpf,
      signatureImage: dataUrl
    });
    
    setIsSignatureModalOpen(false);
  };

  useEffect(() => {
     let intervalId: NodeJS.Timeout;
     
     if (isWaitingSignature && pendingSignatureId) {
        intervalId = setInterval(async () => {
           try {
              const statusData = await dbService.checkPendingSignatureStatus(pendingSignatureId);
              if (statusData && statusData.status === 'signed' && statusData.signedData) {
                 setIsWaitingSignature(false);
                 setPendingSignatureId(null);
                 setConsentForm({
                   status: 'signed_remote',
                   cpf: statusData.signedData.cpf || '',
                   dateSigned: new Date().toISOString(),
                   signedName: statusData.signedData.name || patient.name || '',
                   signatureImage: statusData.signedData.signatureImage || '',
                 });
                 alert('✅ O paciente assinou o termo com sucesso!');
              }
           } catch (error) {
              console.error("Erro ao verificar assinatura:", error);
           }
        }, 3000); // Check every 3 seconds
     }
     
     return () => {
        if (intervalId) clearInterval(intervalId);
     };
  }, [isWaitingSignature, pendingSignatureId, patient.name, setConsentForm]);

  const handleSendWhatsApp = async () => {
     if (!patient || !patient.id) {
       alert("Selecione um paciente primeiro.");
       return;
     }

     try {
        const signatureId = await dbService.createPendingSignature(patient.id, patient.name, therapistUsername);
        setPendingSignatureId(signatureId);
        setIsWaitingSignature(true);
        
        // Formatar app origin para o link local ou produção
        const appUrl = window.location.origin;
        const link = `${appUrl}/?sign=${signatureId}`;
        const encodedMessage = encodeURIComponent(`Olá ${patient.name}, por favor, acesse o link abaixo para assinar o seu Termo de Ciência e Autorização para a nossa sessão de Biomagnetismo:\n\n${link}`);
        // Abrir app ou web de forma genérica para o terapeuta escolher
        const waUrl = `https://wa.me/?text=${encodedMessage}`;
        
        window.open(waUrl, '_blank');
     } catch (error) {
        alert("Erro ao criar link de assinatura. Verifique sua conexão ou contate o suporte.");
        console.error(error);
     }
  };

  const cancelWaitingSignature = () => {
     setIsWaitingSignature(false);
     setPendingSignatureId(null);
  };

  const openSignatureModal = () => {
    if (consentForm.status !== 'pending') {
      setSignatureName(consentForm.signedName || patient.name);
      setSignatureCpf(consentForm.cpf || '');
      setHasAgreement(true);
    } else {
      setSignatureName(patient.name);
      setSignatureCpf('');
      setHasAgreement(false);
    }
    setIsSignatureModalOpen(true);
  };

  const handlePrintConsent = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in relative">
      {/* Printable Version of Consent Form - ONLY visible on print */}
      <div id="printable-consent-only" className="hidden print:block p-10 bg-white min-h-screen">
        <div className="text-center border-b-2 border-teal-600 pb-6 mb-8">
            <h1 className="text-2xl font-bold text-teal-700 uppercase">Termo de Ciência e Autorização</h1>
            <p className="text-slate-500 mt-1">Rastreios no Biomagnetismo</p>
        </div>

        <div className="space-y-6 text-justify text-slate-800 leading-relaxed">
            <p>
                {consentForm.signedName && consentForm.signedName.trim() !== patient.name.trim() ? (
                    <>Eu, <strong>{consentForm.signedName}</strong>, {consentForm.cpf ? `portador(a) do CPF nº ${consentForm.cpf},` : ''} na qualidade de <strong>responsável legal</strong> do(a) paciente <strong>{patient.name}</strong>, declaro para os devidos fins estar plenamente ciente das seguintes informações acerca do atendimento de Biomagnetismo:</>
                ) : (
                    <>Eu, <strong>{patient.name}</strong>, {consentForm.cpf ? `portador(a) do CPF nº ${consentForm.cpf},` : ''} declaro para os devidos fins estar plenamente ciente das seguintes informações acerca do atendimento de Biomagnetismo:</>
                )}
            </p>
            
            <div className="bg-slate-50 p-6 rounded border border-slate-200 space-y-4 italic">
                <p>1. O Biomagnetismo é uma terapia integrativa, complementar e não substitui, em hipótese alguma, o acompanhamento médico convencional, tratamentos alopáticos ou qualquer intervenção de saúde legalmente reconhecida.</p>
                <p>2. Compreendo que esta técnica utiliza campos magnéticos para auxiliar no equilíbrio do pH e na autorregulação natural do organismo, não sendo um método cirúrgico ou invasivo.</p>
                <p>3. Estou ciente de que não existem promessas de cura. Os resultados são individuais e podem variar de acordo com o organismo e o estilo de vida de cada pessoa.</p>
                <p>4. Comprometo-me a manter meus exames, consultas e tratamentos médicos em dia, informando ao terapeuta sobre qualquer condição preexistente relevante.</p>
            </div>

            <p className="font-bold text-teal-700 mt-8">Confirmação de Aceite:</p>
            <p>Declaro que li, compreendi e concordo com todos os termos acima citados, autorizando a realização da sessão de Biomagnetismo nesta data.</p>
            
            <div className="mt-12 flex flex-col items-center">
                <div className="w-full max-w-md border-b border-slate-400 pb-2 mb-2 flex flex-col items-center">
                    {consentForm.signatureImage ? (
                        <img src={consentForm.signatureImage} alt="Assinatura" className="h-24 object-contain mb-2" />
                    ) : (
                        <div className="h-24"></div>
                    )}
                    <p className="font-bold text-lg">{consentForm.signedName || patient.name}</p>
                    <p className="text-xs text-slate-500 uppercase">
                        {consentForm.signedName && consentForm.signedName.trim() !== patient.name.trim() 
                            ? `Responsável Legal (por: ${patient.name})` 
                            : 'Assinatura do Paciente'}
                    </p>
                </div>
                <div className="text-slate-400 text-sm mt-4">
                    Assinado digitalmente em: {consentForm.dateSigned ? new Date(consentForm.dateSigned).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}
                </div>
            </div>
            
            <div className="mt-16 pt-8 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                Documento gerado pelo Assistente para Rastreios no Biomagnetismo
            </div>
        </div>
      </div>

      {/* Main Form Content - Hidden on print */}
      <div className="print:hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-700">Informações do Atendimento</h2>
        <button 
          onClick={onLoadLastSessionAdminData} 
          className="text-xs font-bold text-teal-600 border border-teal-600 px-3 py-1.5 rounded hover:bg-teal-50 shadow-sm flex items-center gap-1 transition-colors"
          type="button"
        >
          <span>↺</span> Carregar última sessão do paciente
        </button>
      </div>

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-teal-700 mb-6">{newPatientData.id ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}</h3>
            <form onSubmit={handleRegisterNewPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600">Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  value={newPatientData.name}
                  onChange={handleNewPatientChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Data de Nascimento (DD/MM/AAAA)</label>
                <input
                  type="tel"
                  name="birthDate"
                  placeholder="DD/MM/AAAA"
                  inputMode="numeric"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  value={newPatientData.birthDate || ''}
                  onChange={handleNewPatientChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="(00) 00000-0000"
                  value={newPatientData.phone || ''}
                  onChange={handleNewPatientChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">E-mail</label>
                <input
                  type="email"
                  name="email"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="exemplo@email.com"
                  value={newPatientData.email || ''}
                  onChange={handleNewPatientChange}
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-md font-bold hover:bg-teal-700 shadow-md transition-all">Salvar e Selecionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-6">

        <div className="relative">
          <label htmlFor="name-search" className="block text-sm font-medium text-slate-600 mb-1">Buscar ou Nome do Paciente</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name-search"
                value={searchTerm}
                onChange={handleManualSearchChange}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
                className="block w-full px-3 py-2 pl-10 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Pesquise por um nome já cadastrado..."
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-teal-600 text-sm font-medium rounded-md text-teal-600 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors shadow-sm"
              title="Cadastrar Novo Paciente"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              <span>Novo Paciente</span>
            </button>
          </div>

          {showDropdown && filteredPatients.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {filteredPatients.map((p, idx) => (
                <div
                  key={p.id || idx}
                  onClick={() => selectExistingPatient(p)}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-teal-50 text-slate-900 flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-slate-400">{p.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleEditInSearch(p, e)}
                      className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-all"
                      title="Editar"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteInSearch(p.id, e)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded transition-all"
                      title="Excluir"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="birthDate" className="block text-sm font-medium text-slate-600">Nascimento (DD/MM/AAAA)</label>
            <input
              type="tel"
              id="birthDate"
              name="birthDate"
              placeholder="DD/MM/AAAA"
              inputMode="numeric"
              value={patient.birthDate || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="age" className="block text-sm font-medium text-slate-600">Idade Calculada</label>
            <div className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md shadow-sm text-slate-700 sm:text-sm h-10">
              {patient.age !== undefined ? `${patient.age} anos` : '---'}
            </div>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-600">Telefone para Contato</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={patient.phone || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-600">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={patient.email || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="exemplo@email.com"
          />
        </div>

        <div className={getSectionClass(!isPatientDataValid)}>
          <hr className="border-slate-200" />
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-2">
               <h3 className="text-lg font-bold text-teal-700">Check List de Segurança</h3>
             <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">Obrigatório</span>
          </div>
          
          {showSafetyWarning && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm text-red-700 animate-pulse">
              <p className="font-bold">⚠️ Atenção: este paciente requer avaliação especial antes de iniciar a sessão. Verifique as contraindicações orientadas no seu curso de formação antes de prosseguir.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">Está em acompanhamento médico atualmente?</p>
              <div className="flex gap-4">
                 <label className="flex items-center gap-1 text-sm"><input type="radio" name="hasMedicalFollowUp" value="Sim" checked={safetyCheck.hasMedicalFollowUp === 'Sim'} onChange={handleSafetyChange} /> Sim</label>
                 <label className="flex items-center gap-1 text-sm"><input type="radio" name="hasMedicalFollowUp" value="Não" checked={safetyCheck.hasMedicalFollowUp === 'Não'} onChange={handleSafetyChange} /> Não</label>
              </div>
              {safetyCheck.hasMedicalFollowUp === 'Sim' && (
                <div className="mt-2">
                  <input type="text" name="medicalSpecialty" value={safetyCheck.medicalSpecialty || ''} onChange={handleSafetyChange} placeholder="Qual especialidade?" className="w-full text-sm px-2 py-1 border border-slate-300 rounded focus:ring-teal-500" />
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">Usa medicamentos contínuos?</p>
              <div className="flex gap-4">
                 <label className="flex items-center gap-1 text-sm"><input type="radio" name="usesContinuousMedication" value="Sim" checked={safetyCheck.usesContinuousMedication === 'Sim'} onChange={handleSafetyChange} /> Sim</label>
                 <label className="flex items-center gap-1 text-sm"><input type="radio" name="usesContinuousMedication" value="Não" checked={safetyCheck.usesContinuousMedication === 'Não'} onChange={handleSafetyChange} /> Não</label>
              </div>
              {safetyCheck.usesContinuousMedication === 'Sim' && (
                <div className="mt-2">
                  <input type="text" name="medications" value={safetyCheck.medications || ''} onChange={handleSafetyChange} placeholder="Quais medicamentos?" className="w-full text-sm px-2 py-1 border border-slate-300 rounded focus:ring-teal-500" />
                </div>
              )}
            </div>

            <div className={`bg-slate-50 p-3 rounded border ${safetyCheck.hasPacemakerOrDevice === 'Sim' ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}>
              <p className="text-sm font-semibold text-slate-700 mb-2">Possui marcapasso ou dispositivo eletrônico implantado?</p>
              <div className="flex gap-4">
                 <label className="flex items-center gap-1 text-sm"><input type="radio" name="hasPacemakerOrDevice" value="Sim" checked={safetyCheck.hasPacemakerOrDevice === 'Sim'} onChange={handleSafetyChange} /> Sim</label>
                 <label className="flex items-center gap-1 text-sm"><input type="radio" name="hasPacemakerOrDevice" value="Não" checked={safetyCheck.hasPacemakerOrDevice === 'Não'} onChange={handleSafetyChange} /> Não</label>
              </div>
              {safetyCheck.hasPacemakerOrDevice === 'Sim' && (
                <div className="mt-2">
                  <input type="text" name="deviceDetails" value={safetyCheck.deviceDetails || ''} onChange={handleSafetyChange} placeholder="Qual dispositivo?" className="w-full text-sm px-2 py-1 border border-red-300 rounded focus:ring-red-500 bg-white" />
                </div>
              )}
            </div>

            <div className={`bg-slate-50 p-3 rounded border ${safetyCheck.isPregnantOrSuspected === 'Sim' ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}>
              <p className="text-sm font-semibold text-slate-700 mb-2">Está gestante ou suspeita de gestação?</p>
              <div className="flex gap-4">
                 <label className="flex items-center gap-1 text-sm"><input type="radio" name="isPregnantOrSuspected" value="Sim" checked={safetyCheck.isPregnantOrSuspected === 'Sim'} onChange={handleSafetyChange} /> Sim</label>
                 <label className="flex items-center gap-1 text-sm"><input type="radio" name="isPregnantOrSuspected" value="Não" checked={safetyCheck.isPregnantOrSuspected === 'Não'} onChange={handleSafetyChange} /> Não</label>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 md:col-span-2">
              <p className="text-sm font-semibold text-slate-700 mb-2">Possui diagnósticos médicos relevantes informados por médico?</p>
              <div className="flex gap-4">
                 <label className="flex items-center gap-1 text-sm"><input type="radio" name="hasRelevantDiagnoses" value="Sim" checked={safetyCheck.hasRelevantDiagnoses === 'Sim'} onChange={handleSafetyChange} /> Sim</label>
                 <label className="flex items-center gap-1 text-sm"><input type="radio" name="hasRelevantDiagnoses" value="Não" checked={safetyCheck.hasRelevantDiagnoses === 'Não'} onChange={handleSafetyChange} /> Não</label>
              </div>
              {safetyCheck.hasRelevantDiagnoses === 'Sim' && (
                <div className="mt-2">
                  <input type="text" name="diagnosesDetails" value={safetyCheck.diagnosesDetails || ''} onChange={handleSafetyChange} placeholder="Quais diagnósticos?" className="w-full text-sm px-2 py-1 border border-slate-300 rounded focus:ring-teal-500" />
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        <div className={getSectionClass(!isSafetyCheckValid || !isPatientDataValid)}>
          <hr className="border-slate-200" />
          <div className="space-y-4 mt-6">
          <div className="flex items-center gap-2">
             <h3 className="text-lg font-bold text-teal-700">Termo de Ciência do Paciente</h3>
             <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">Obrigatório</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 leading-relaxed italic">
            "O Biomagnetismo é uma terapia complementar e não substitui tratamento médico, terapêutico ou qualquer outro tratamento legalmente reconhecido. Não são feitas promessas de cura, e os resultados podem variar de pessoa para pessoa. O paciente deve manter seus exames, consultas e tratamentos em dia com os profissionais de saúde responsáveis."
          </div>

          {consentForm.status === 'pending' ? (
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
               <button type="button" onClick={openSignatureModal} className="flex-1 px-4 py-3 bg-teal-600 text-white font-bold rounded-lg shadow hover:bg-teal-700 transition-colors">
                   Assinar neste dispositivo
               </button>
               <button type="button" onClick={handleSendWhatsApp} className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                   <WhatsAppIcon className="w-5 h-5" />
                   Enviar termo via WhatsApp
               </button>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
               <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm">
                       <CheckIcon className="w-6 h-6" />
                   </div>
                   <div>
                       <p className="font-bold text-green-800">Termo assinado com sucesso.</p>
                       <p className="text-xs text-green-600">
                           {consentForm.signedName && consentForm.signedName.trim() !== patient.name.trim() 
                               ? `Responsável Legal: ${consentForm.signedName} (por: ${patient.name})` 
                               : `Assinado por: ${consentForm.signedName}`}
                       </p>
                   </div>
               </div>
               <div className="flex gap-3">
                   <button type="button" onClick={handlePrintConsent} className="text-sm font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 border border-teal-200 px-2 py-1 rounded bg-white shadow-sm">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                       Imprimir Termo
                   </button>
                   <button type="button" onClick={openSignatureModal} className="text-sm font-semibold text-teal-600 hover:text-teal-800">Ver Assinatura</button>
               </div>
            </div>
          )}
        </div>
        </div> {/* Closing div for getSectionClass(!isSafetyCheckValid || !isPatientDataValid) */}

        <div className={getSectionClass(!isConsentSigned || !isSafetyCheckValid)}>
          <hr className="border-slate-200" />
          <div className="space-y-4 mt-6">
            <div>
              <label htmlFor="mainComplaint" className="block text-sm font-medium text-slate-600 font-bold text-teal-700 flex justify-between items-center">
                <span>Queixas do dia (Obrigatório)</span>
                {isComplaintValid && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">Preenchido</span>}
              </label>
            <textarea
              id="mainComplaint"
              name="mainComplaint"
              value={patient.mainComplaint}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 sm:text-sm"
              placeholder="Descreva as queixas e sintomas para o atendimento de hoje (se houver)..."
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
            <h4 className="text-sm font-bold text-teal-700 mb-3 border-b pb-2">Como o paciente está agora (antes da sessão):</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1">Dor (0-10)</label>
                 <select value={scalesBefore.pain} onChange={(e) => setScalesBefore(prev => ({...prev, pain: e.target.value === '' ? '' : Number(e.target.value)}))} className="w-full text-sm border-slate-300 rounded focus:ring-teal-500 py-1.5 px-2">
                    <option value="">--</option>
                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={`p${n}`} value={n}>{n}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1">Ansiedade (0-10)</label>
                 <select value={scalesBefore.anxiety} onChange={(e) => setScalesBefore(prev => ({...prev, anxiety: e.target.value === '' ? '' : Number(e.target.value)}))} className="w-full text-sm border-slate-300 rounded focus:ring-teal-500 py-1.5 px-2">
                    <option value="">--</option>
                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={`a${n}`} value={n}>{n}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1">Cansaço (0-10)</label>
                 <select value={scalesBefore.tiredness} onChange={(e) => setScalesBefore(prev => ({...prev, tiredness: e.target.value === '' ? '' : Number(e.target.value)}))} className="w-full text-sm border-slate-300 rounded focus:ring-teal-500 py-1.5 px-2">
                    <option value="">--</option>
                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={`t${n}`} value={n}>{n}</option>)}
                 </select>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-all shadow-lg transform hover:scale-105 ${isFormValid ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Próxima Etapa: Iniciar Protocolo
          </button>
        </div>
      </form>
      </div>

      {/* Termo de Ciência Modal */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[70] flex justify-center items-center p-4">
           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 animate-fade-in flex flex-col max-h-[90vh]">
              <h3 className="text-xl font-bold text-teal-700 mb-4 border-b pb-2">Termo de Ciência do Paciente</h3>
              
              <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4 text-sm text-slate-700">
                  <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <p className="mb-2">O Biomagnetismo é uma terapia complementar e não substitui tratamento médico, terapêutico ou qualquer outro tratamento legalmente reconhecido.</p>
                      <p className="mb-2">Não são feitas promessas de cura, e os resultados podem variar de pessoa para pessoa.</p>
                      <p>O paciente deve manter seus exames, consultas e tratamentos em dia com os profissionais de saúde responsáveis.</p>
                  </div>

                  <label className={`flex items-start gap-3 bg-teal-50 p-3 rounded border border-teal-200 ${consentForm.status === 'pending' ? 'cursor-pointer' : 'opacity-80 cursor-default'}`}>
                      <input type="checkbox" disabled={consentForm.status !== 'pending'} className="mt-1 w-4 h-4 text-teal-600 rounded disabled:opacity-70 disabled:cursor-default" checked={hasAgreement} onChange={(e) => setHasAgreement(e.target.checked)} />
                      <span className="text-sm font-medium text-teal-900 leading-tight">
                          Li e declaro estar ciente de que o Biomagnetismo é uma terapia complementar e não substitui tratamento médico, terapêutico ou qualquer outro tratamento legalmente reconhecido. Não me foram feitas promessas de cura, resultados podem variar de pessoa para pessoa e ainda, que devo manter meus exames, consultas e tratamentos em dia com os profissionais de saúde responsáveis.
                      </span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Nome Completo (Paciente ou Responsável Legal)</label>
                          <input type="text" disabled={consentForm.status !== 'pending'} value={signatureName} onChange={(e) => setSignatureName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm disabled:bg-slate-100 disabled:text-slate-600" />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">CPF do Assinante (Opcional)</label>
                          <input type="text" disabled={consentForm.status !== 'pending'} value={signatureCpf} onChange={(e) => setSignatureCpf(e.target.value)} placeholder="000.000.000-00" className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-teal-500 text-sm disabled:bg-slate-100 disabled:text-slate-600" />
                      </div>
                  </div>

                  <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-600 mb-1 flex justify-between items-end">
                          <span>Assinatura (Desenhe no espaço abaixo) <span className="font-normal text-slate-500">- Pelo Paciente ou Responsável Legal</span></span>
                          {consentForm.status !== 'pending' && consentForm.signatureImage ? (
                             <button type="button" onClick={() => setConsentForm({status: 'pending'})} className="text-teal-600 hover:text-teal-800 underline">Refazer Assinatura</button>
                          ) : (
                             <button type="button" onClick={clearSignature} className="text-teal-600 hover:text-teal-800 underline">Limpar Assinatura</button>
                          )}
                      </label>
                      
                      {(consentForm.status === 'signed_local' || consentForm.status === 'signed_remote') && consentForm.signatureImage ? (
                         <div className="w-full h-40 border-2 border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center p-2 relative">
                             <img src={consentForm.signatureImage} alt="Assinatura do Paciente" className="max-h-full max-w-full object-contain" />
                             <div className="absolute bottom-2 right-2 text-xs text-slate-400 bg-white/80 px-2 py-1 rounded shadow-sm">
                                Assinado em: {consentForm.dateSigned ? new Date(consentForm.dateSigned).toLocaleDateString() : 'Data não registrada'}
                             </div>
                         </div>
                      ) : (
                         <canvas 
                            ref={canvasRef}
                            width={600}
                            height={200}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseOut={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full h-40 border-2 border-slate-300 rounded-lg bg-slate-50 cursor-crosshair touch-none"
                         />
                      )}
                  </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3 shrink-0">
                 <button type="button" onClick={() => setIsSignatureModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors font-medium">Cancelar</button>
                 {consentForm.status === 'pending' && (
                   <button type="button" onClick={confirmSignature} className="px-6 py-2 bg-teal-600 text-white rounded font-bold shadow hover:bg-teal-700 transition-colors">Confirmar e Assinar</button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Waiting WhatsApp Signature Modal */}
      {isWaitingSignature && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-[80] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center text-center">
                  <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Aguardando Assinatura</h3>
                  <p className="text-slate-600 mb-6 flex-1 text-sm">Enviamos um link para o WhatsApp de <strong>{patient.name}</strong>. Peça para o paciente abrir o link e assinar. Esta tela irá sair automaticamente quando o termo for assinado pelo paciente ou você pode cancelar abaixo.</p>
                  <button 
                     onClick={cancelWaitingSignature}
                     className="px-6 py-2 text-red-600 font-bold bg-red-100 rounded-full hover:bg-red-200 transition text-sm"
                  >
                     Cancelar Aguardo / Envio de Link
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default PatientForm;
