
import React from 'react';
import { Patient, BiomagneticPair, PhenomenaData, ProtocolData, Session, SafetyCheck, ConsentForm, SessionScales } from '../types';
import { PrinterIcon } from './icons/Icons';

interface SessionSummaryProps {
  patient: Patient;
  protocolData?: ProtocolData;
  pairs: BiomagneticPair[];
  phenomena?: PhenomenaData;
  emotions?: string[];
  sensations?: string[];
  emotionsNotes?: string;
  sensationsNotes?: string;
  protocolNotes?: string;
  reservatoriosNotes?: string;
  levelINotes?: string;
  levelIINotes?: string;
  levelIIINotes?: string;
  phenomenaNotes?: string;
  impactionTime?: string;
  notes: string;
  startTime: Date | null;
  endTime: Date | null;
  safetyCheck?: SafetyCheck;
  consentForm?: ConsentForm;
  scalesBefore?: SessionScales;
  scalesAfter?: SessionScales;
  therapistSignature?: string;
  setTherapistSignature?: (val: string) => void;
  onFinish: (sig?: string) => void;
  onBack: () => void;
  isHistorical?: boolean;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ 
    patient, 
    protocolData, 
    pairs, 
    phenomena, 
    emotions, 
    sensations, 
    emotionsNotes,
    sensationsNotes,
    protocolNotes,
    reservatoriosNotes,
    levelINotes,
    levelIINotes,
    levelIIINotes,
    phenomenaNotes,
    impactionTime, 
    notes, 
    startTime, 
    endTime, 
    safetyCheck,
    consentForm,
    scalesBefore,
    scalesAfter,
    therapistSignature,
    setTherapistSignature,
    onFinish, 
    onBack,
    isHistorical = false
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  // Focus effect for signature to ensure consistency if it re-renders
  React.useEffect(() => {
     if (canvasRef.current && therapistSignature) {
         const ctx = canvasRef.current.getContext('2d');
         const img = new Image();
         img.onload = () => {
             ctx?.clearRect(0,0, canvasRef.current!.width, canvasRef.current!.height);
             ctx?.drawImage(img, 0, 0);
         };
         img.src = therapistSignature;
     }
  }, []); // Only once on mount to restore if navigating back

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isHistorical) return;
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
    if (!isDrawing || isHistorical) return;
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
    if (isHistorical) return;
    setIsDrawing(false);
    saveSignature();
  };

  const clearSignature = () => {
    if (isHistorical) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (setTherapistSignature) setTherapistSignature('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pixelBuffer = new Uint32Array(ctx!.getImageData(0,0, canvas.width, canvas.height).data.buffer);
    const hasDrawn = pixelBuffer.some(color => color !== 0);
    
    if (hasDrawn && setTherapistSignature) {
        setTherapistSignature(canvas.toDataURL('image/png'));
    } else if (setTherapistSignature) {
        setTherapistSignature('');
    }
  };

  const handleFinish = () => {
      // Get the latest signature from canvas
      const canvas = canvasRef.current;
      let finalSig = therapistSignature;
      
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const pixelBuffer = new Uint32Array(ctx!.getImageData(0,0, canvas.width, canvas.height).data.buffer);
        const hasDrawn = pixelBuffer.some(color => color !== 0);
        if (hasDrawn) {
            finalSig = canvas.toDataURL('image/png');
        }
      }
      
      onFinish(finalSig);
  };

  const formatDuration = (start: Date | null, end: Date | null) => {
    if (!start || !end) return 'N/A';
    const s = new Date(start);
    const e = new Date(end);
    const diffSeconds = Math.round((e.getTime() - s.getTime()) / 1000);
    if (diffSeconds < 0) return 'N/A';
    if (diffSeconds < 60) return `${diffSeconds} seg`;
    const minutes = Math.floor(diffSeconds / 60);
    const remainingSeconds = diffSeconds % 60;
    return `${minutes} min ${remainingSeconds} seg`;
  };

  const hasPhenomena = phenomena && (
    phenomena.vascularAccidents.length > 0 || 
    phenomena.tumoralPhenomena.length > 0 || 
    phenomena.tumoralGenesis.length > 0 || 
    phenomena.traumas.length > 0 ||
    phenomena.portalPairs.length > 0
  );

  const handlePrint = () => {
    window.print();
  };

  const getLevelLabel = (lvl: number) => {
      if (lvl === 1) return "Reservatórios";
      if (lvl === 2) return "Nível I";
      if (lvl === 3) return "Nível II";
      if (lvl === 4) return "Nível III";
      return "Nível " + lvl;
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
        <h2 className="text-2xl font-bold text-slate-700">Relatório da Sessão</h2>
        <div className="flex gap-3">
            <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-md"
            >
                <PrinterIcon className="w-5 h-5" />
                Imprimir / PDF
            </button>
        </div>
      </div>
      
      <div id="summary-content" className="space-y-6 bg-white p-6 md:p-10 rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Cabeçalho exclusivo para Impressão */}
        <div className="hidden print:block text-center border-b-2 border-teal-600 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-teal-700 uppercase">Assistente para Rastreios no Biomagnetismo</h1>
            <p className="text-slate-500 mt-1">Relatório Técnico de Atendimento Biomagnético</p>
            <div className="mt-4 flex justify-between text-xs text-slate-400">
                <span>Data do Documento: {new Date().toLocaleDateString('pt-BR')}</span>
                <span>Documento gerado digitalmente</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-teal-700 border-b border-teal-100 pb-1 mb-3">Identificação do Paciente</h3>
            <p className="text-sm"><strong className="font-bold text-slate-700">Nome:</strong> {patient.name}</p>
            <p className="text-sm"><strong className="font-bold text-slate-700">Data de Nasc.:</strong> {patient.birthDate || 'N/A'}</p>
            <p className="text-sm"><strong className="font-bold text-slate-700">Idade:</strong> {patient.age !== undefined ? `${patient.age} anos` : 'N/A'}</p>
            {patient.mainComplaint && (
                <div className="mt-2">
                    <strong className="text-sm font-bold text-slate-700 block">Queixas do dia:</strong>
                    <p className="text-sm text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100 mt-1">{patient.mainComplaint}</p>
                </div>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-teal-700 border-b border-teal-100 pb-1 mb-3">Dados do Atendimento</h3>
            <p className="text-sm"><strong className="font-bold text-slate-700">Data da Sessão:</strong> {startTime ? new Date(startTime).toLocaleDateString('pt-BR') : 'N/A'}</p>
            <p className="text-sm"><strong className="font-bold text-slate-700">Horário de Início:</strong> {startTime ? new Date(startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</p>
            <p className="text-sm"><strong className="font-bold text-slate-700">Duração Total:</strong> {formatDuration(startTime, endTime)}</p>
            {protocolData?.legResponse && (
                <p className="text-sm"><strong className="font-bold text-slate-700">Sim do Paciente:</strong> {protocolData.legResponse}</p>
            )}
            {protocolData?.sessionType === 'distancia' && protocolData?.antennaResponse && (
                <p className="text-sm"><strong className="font-bold text-indigo-700">Sim da Antena:</strong> {protocolData.antennaResponse}</p>
            )}
            {impactionTime && (
                <div className="mt-2 p-2 bg-teal-50 rounded border border-teal-100">
                    <p className="text-sm font-bold text-teal-800">Tempo de Impactação Recomendado:</p>
                    <p className="text-lg font-black text-teal-600">{impactionTime}</p>
                </div>
            )}
            
            {(consentForm?.status === 'signed_local' || consentForm?.status === 'signed_remote') && (
               <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                   <div className="flex flex-col md:flex-row md:items-center gap-4">
                       <div className="flex-1">
                           <p className="text-xs font-bold text-green-800 uppercase mb-1">Termo de Ciência</p>
                           <p className="text-sm font-semibold text-green-700">Assinado por: {consentForm.signedName}</p>
                           <p className="text-xs text-green-600">Em: {new Date(consentForm.dateSigned!).toLocaleString('pt-BR')}</p>
                       </div>
                       {consentForm.signatureImage && (
                           <div className="bg-white p-1 rounded border border-green-100 shadow-sm w-32 h-16 flex items-center justify-center">
                               <img src={consentForm.signatureImage} alt="Assinatura" className="max-h-full max-w-full object-contain" />
                           </div>
                       )}
                   </div>
               </div>
            )}
          </div>
        </div>

        {/* Evolução da Sessão (Escalas) */}
        {(scalesBefore || scalesAfter) && (
           <div className="pb-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-teal-700 mb-4">Evolução do Paciente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {/* Dor */}
                 <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center">
                    <strong className="text-xs uppercase text-slate-500 mb-2 block">Nível de Dor</strong>
                    <div className="flex justify-center items-center gap-3">
                       <span className="text-lg font-bold text-slate-700">{scalesBefore?.pain !== '' ? scalesBefore?.pain : '--'}</span>
                       <span className="text-slate-400">→</span>
                       <span className={`text-lg font-black ${String(scalesBefore?.pain) > String(scalesAfter?.pain) ? 'text-green-600' : 'text-slate-800'}`}>{scalesAfter?.pain !== '' ? scalesAfter?.pain : '--'}</span>
                    </div>
                 </div>

                 {/* Ansiedade */}
                 <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center">
                    <strong className="text-xs uppercase text-slate-500 mb-2 block">Ansiedade</strong>
                    <div className="flex justify-center items-center gap-3">
                       <span className="text-lg font-bold text-slate-700">{scalesBefore?.anxiety !== '' ? scalesBefore?.anxiety : '--'}</span>
                       <span className="text-slate-400">→</span>
                       <span className={`text-lg font-black ${String(scalesBefore?.anxiety) > String(scalesAfter?.anxiety) ? 'text-green-600' : 'text-slate-800'}`}>{scalesAfter?.anxiety !== '' ? scalesAfter?.anxiety : '--'}</span>
                    </div>
                 </div>

                 {/* Cansaço */}
                 <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center">
                    <strong className="text-xs uppercase text-slate-500 mb-2 block">Cansaço</strong>
                    <div className="flex justify-center items-center gap-3">
                       <span className="text-lg font-bold text-slate-700">{scalesBefore?.tiredness !== '' ? scalesBefore?.tiredness : '--'}</span>
                       <span className="text-slate-400">→</span>
                       <span className={`text-lg font-black ${String(scalesBefore?.tiredness) > String(scalesAfter?.tiredness) ? 'text-green-600' : 'text-slate-800'}`}>{scalesAfter?.tiredness !== '' ? scalesAfter?.tiredness : '--'}</span>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* NOTAS DE ETAPAS */}
        {(protocolNotes || reservatoriosNotes || levelINotes || levelIINotes || levelIIINotes || phenomenaNotes) && (
          <div className="pb-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-teal-700 mb-4">Observações por Etapa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {protocolNotes && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-sm">
                  <strong className="text-xs uppercase text-slate-500 block mb-1">Preparação / Protocolo</strong>
                  <p className="italic">{protocolNotes}</p>
                </div>
              )}
              {reservatoriosNotes && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-sm">
                  <strong className="text-xs uppercase text-slate-500 block mb-1">Reservatórios</strong>
                  <p className="italic">{reservatoriosNotes}</p>
                </div>
              )}
              {levelINotes && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-sm">
                  <strong className="text-xs uppercase text-slate-500 block mb-1">Rastreio Nível I</strong>
                  <p className="italic">{levelINotes}</p>
                </div>
              )}
              {levelIINotes && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-sm">
                  <strong className="text-xs uppercase text-slate-500 block mb-1">Rastreio Nível II</strong>
                  <p className="italic">{levelIINotes}</p>
                </div>
              )}
              {levelIIINotes && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-sm">
                  <strong className="text-xs uppercase text-slate-500 block mb-1">Rastreio Nível III</strong>
                  <p className="italic">{levelIIINotes}</p>
                </div>
              )}
              {phenomenaNotes && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-sm">
                  <strong className="text-xs uppercase text-slate-500 block mb-1">Fenômenos Bioenergéticos</strong>
                  <p className="italic">{phenomenaNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pb-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-teal-700 mb-4">Pares Biomagnéticos Identificados ({pairs.length})</h3>
          {pairs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pairs.map((pair, idx) => (
                <div key={`${pair.name}-${idx}`} className="bg-slate-50 px-3 py-2 rounded border border-slate-200 text-[10px] font-bold text-slate-800 shadow-sm flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span className="truncate">{pair.name}</span>
                  </div>
                  <span className="text-[8px] text-slate-400 uppercase ml-4">{getLevelLabel(pair.level)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">Nenhum par biomagnético foi impactado nesta sessão.</p>
          )}
        </div>

        {(emotions?.length || 0) > 0 && (
          <div className="pb-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-teal-700 mb-4">Equilíbrio Bioenergético (Emoções)</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {emotions?.map(emotion => (
                <span key={emotion} className="bg-teal-50 text-teal-700 px-4 py-1.5 rounded-lg text-xs font-black border border-teal-200 uppercase tracking-tight">
                  {emotion}
                </span>
              ))}
            </div>
            {emotionsNotes && (
                <div className="mt-2 p-3 bg-slate-50 rounded border italic text-sm text-slate-700">
                    <strong>Notas de Emoções:</strong> {emotionsNotes}
                </div>
            )}
          </div>
        )}

        {(sensations?.length || 0) > 0 && (
          <div className="pb-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-orange-700 mb-4">Sensações Liberadas</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {sensations?.map(s => (
                <span key={s} className="bg-orange-50 text-orange-700 px-4 py-1.5 rounded-lg text-xs font-black border border-orange-200 uppercase tracking-tight">
                  {s}
                </span>
              ))}
            </div>
            {sensationsNotes && (
                <div className="mt-2 p-3 bg-slate-50 rounded border italic text-sm text-slate-700">
                    <strong>Notas de Sensações:</strong> {sensationsNotes}
                </div>
            )}
          </div>
        )}

        {hasPhenomena && (
          <div className="pb-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-teal-700 mb-4">Fenômenos Registrados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {phenomena?.portalPairs?.length ? (
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <strong className="text-teal-800 text-xs uppercase block mb-1">Pares Portais</strong>
                  <span className="text-slate-700">{phenomena.portalPairs.join(', ')}</span>
                </div>
              ) : null}

              {phenomena?.vascularAccidents?.length ? (
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <strong className="text-teal-800 text-xs uppercase block mb-1">Alterações Vasculares</strong>
                  <span className="text-slate-700">{phenomena.vascularAccidents.join(', ')}</span>
                </div>
              ) : null}

              {phenomena?.tumoralPhenomena?.length ? (
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <strong className="text-teal-800 text-xs uppercase block mb-1">Fenômenos Tumorais</strong>
                  <span className="text-slate-700">{phenomena.tumoralPhenomena.join(', ')}</span>
                </div>
              ) : null}

              {phenomena?.tumoralGenesis?.length ? (
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <strong className="text-teal-800 text-xs uppercase block mb-1">Gênesis Tumoral</strong>
                  <span className="text-slate-700">{phenomena.tumoralGenesis.join(', ')}</span>
                </div>
              ) : null}

              {phenomena?.traumas?.length ? (
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <strong className="text-teal-800 text-xs uppercase block mb-1">Traumas Registrados</strong>
                  <span className="text-slate-700">{phenomena.traumas.join(', ')}</span>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="pb-6">
          <h3 className="text-lg font-bold text-teal-700 mb-4">Considerações Finais</h3>
          {notes ? (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-700 text-sm italic whitespace-pre-wrap leading-relaxed mb-6">
                {notes}
            </div>
          ) : (
            <p className="text-slate-400 italic text-sm mb-6">Nenhuma consideração adicional registrada.</p>
          )}

          {/* Therapist Signature Canvas Block (Visible in UI before saving) */}
          <div className="mt-8 print:hidden">
            <h4 className="text-sm font-bold text-slate-700 mb-2 flex justify-between items-end border-b pb-2">
                <span>Assinatura do Terapeuta</span>
                {!isHistorical && (
                    <button type="button" onClick={clearSignature} className="text-teal-600 hover:text-teal-800 text-xs font-semibold underline">Limpar Assinatura</button>
                )}
            </h4>
            
            {isHistorical && therapistSignature ? (
                <div className="w-full max-w-sm h-32 border-2 border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center p-2 mx-auto md:mx-0">
                   <img src={therapistSignature} alt="Assinatura do Terapeuta" className="max-h-full max-w-full object-contain" />
                </div>
            ) : isHistorical && !therapistSignature ? (
                <div className="w-full max-w-sm h-32 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center p-2 mx-auto md:mx-0">
                    <span className="text-sm text-slate-400 italic">Atendimento salvo sem assinatura do terapeuta.</span>
                </div>
            ) : (
                <div className="max-w-sm relative">
                    {!therapistSignature && !isDrawing && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                           <span className="text-slate-400 font-medium">Assine Aqui</span>
                        </div>
                    )}
                    <canvas 
                        ref={canvasRef}
                        width={400}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-32 border-2 border-slate-300 rounded-lg bg-white shadow-inner cursor-crosshair touch-none"
                    />
                </div>
            )}
            {!isHistorical && (
               <p className="text-xs text-slate-400 mt-2">Assine no quadro acima antes de concluir o atendimento.</p>
            )}
          </div>
        </div>

        {/* Termo de Ciência Completo - Integrado ao Relatório (Fim da página/Nova página na impressão) */}
        {(consentForm?.status === 'signed_local' || consentForm?.status === 'signed_remote') && (
            <div className="hidden print:block mt-12 pt-12 border-t-2 border-slate-100" style={{ pageBreakBefore: 'always' }}>
                <div className="text-center border-b-2 border-teal-600 pb-6 mb-8">
                    <h2 className="text-2xl font-bold text-teal-700 uppercase">Termo de Ciência e Autorização</h2>
                    <p className="text-slate-500 mt-1">Anexo ao Relatório de Atendimento</p>
                </div>

                <div className="space-y-6 text-justify text-slate-800 leading-relaxed max-w-4xl mx-auto">
                    <p>Eu, <strong>{consentForm.signedName || patient.name}</strong>, {consentForm.cpf ? `portador(a) do CPF nº ${consentForm.cpf},` : ''} declaro para os devidos fins estar plenamente ciente das seguintes informações acerca do atendimento de Biomagnetismo:</p>
                    
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
                            <p className="text-xs text-slate-500 uppercase">Assinatura do Paciente / Responsável</p>
                        </div>
                        <div className="text-slate-400 text-sm mt-2">
                            Assinado digitalmente em: {consentForm.dateSigned ? new Date(consentForm.dateSigned).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Disclaimer Impressão */}
        <div className="hidden print:block mt-8 p-4 border border-slate-300 rounded bg-slate-50 text-[10px] text-slate-600 italic text-justify leading-tight max-w-4xl mx-auto">
            <p><strong>Aviso Importante:</strong> O Biomagnetismo é uma técnica integrativa e complementar (PICS). Os rastreios e impactações magnéticas registrados neste relatório não constituem diagnóstico médico, prescrição de tratamento alopático, nem promessa de cura para qualquer enfermidade. É de responsabilidade exclusiva do paciente manter seus acompanhamentos e tratamentos convencionais com os profissionais e médicos competentes. A terapia biomagnética atua equilibrando o pH do corpo e auxiliando na autorregulação natural do organismo.</p>
        </div>

        {/* Espaço para assinatura em Impressão */}
        <div className="hidden print:block mt-16 pt-8">
            <div className="flex justify-around items-end">
                {therapistSignature ? (
                    <div className="text-center w-64 flex flex-col items-center">
                        <img src={therapistSignature} alt="Assinatura Terapeuta" className="h-16 object-contain mb-1" />
                        <div className="w-full border-t border-slate-400 pt-1">
                            <p className="text-sm font-bold text-slate-700">Assinatura do Terapeuta</p>
                            <p className="text-[10px] text-slate-400 uppercase">Especialista em Biomagnetismo</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center w-64">
                        <div className="border-t border-slate-400 pt-2">
                            <p className="text-sm font-bold text-slate-700">Assinatura do Terapeuta</p>
                            <p className="text-[10px] text-slate-400 uppercase">Especialista em Biomagnetismo</p>
                        </div>
                    </div>
                )}
                
                {!consentForm?.signatureImage ? (
                    <div className="text-center w-64">
                        <div className="border-t border-slate-400 pt-2">
                            <p className="text-sm font-bold text-slate-700">{patient.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase">Paciente / Responsável</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center w-64 flex flex-col items-center">
                        <img src={consentForm.signatureImage} alt="Assinatura" className="h-16 object-contain mb-1" />
                        <div className="w-full border-t border-slate-400 pt-1">
                            <p className="text-sm font-bold text-slate-700">{consentForm.signedName}</p>
                            <p className="text-[10px] text-slate-400 uppercase">Termo Assinado Digitalmente</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* FOOTER PDF */}
            <div className="mt-16 text-center border-t border-slate-200 pt-3">
                <p className="text-[9px] text-slate-400 font-mono">
                    Relatório gerado pelo Sistema de Gestão Rastreios no Biomagnetismo — {new Date().toLocaleString('pt-BR')}
                </p>
            </div>
        </div>
      </div>

      {!isHistorical && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4 print:hidden">
            <button
              onClick={onBack}
              className="w-full md:w-auto inline-flex justify-center items-center px-8 py-2 border border-slate-300 text-base font-bold rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Voltar
            </button>
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <button
                onClick={handleFinish}
                className="w-full md:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-black rounded-xl shadow-lg text-white bg-teal-600 hover:bg-teal-700 transition-all transform hover:scale-105"
              >
                Concluir e Salvar Atendimento
              </button>
            </div>
          </div>
      )}
    </div>
  );
};

export default SessionSummary;
