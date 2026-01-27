
import React from 'react';
import { Patient, BiomagneticPair, PhenomenaData, ProtocolData, Session } from '../types';
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
  impactionTime?: string;
  notes: string;
  startTime: Date | null;
  endTime: Date | null;
  onFinish: () => void;
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
    impactionTime, 
    notes, 
    startTime, 
    endTime, 
    onFinish, 
    onBack,
    isHistorical = false
}) => {

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
            <p className="text-sm"><strong className="font-bold text-slate-700">Data de Nasc.:</strong> {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
            <p className="text-sm"><strong className="font-bold text-slate-700">Idade:</strong> {patient.age !== undefined ? `${patient.age} anos` : 'N/A'}</p>
            {patient.mainComplaint && (
                <div className="mt-2">
                    <strong className="text-sm font-bold text-slate-700 block">Queixa Principal:</strong>
                    <p className="text-sm text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100 mt-1">{patient.mainComplaint}</p>
                </div>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-teal-700 border-b border-teal-100 pb-1 mb-3">Dados do Atendimento</h3>
            <p className="text-sm"><strong className="font-bold text-slate-700">Data da Sessão:</strong> {startTime ? new Date(startTime).toLocaleDateString('pt-BR') : 'N/A'}</p>
            <p className="text-sm"><strong className="font-bold text-slate-700">Horário de Início:</strong> {startTime ? new Date(startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</p>
            <p className="text-sm"><strong className="font-bold text-slate-700">Duração Total:</strong> {formatDuration(startTime, endTime)}</p>
            {impactionTime && (
                <div className="mt-2 p-2 bg-teal-50 rounded border border-teal-100">
                    <p className="text-sm font-bold text-teal-800">Tempo de Impactação Recomendado:</p>
                    <p className="text-lg font-black text-teal-600">{impactionTime}</p>
                </div>
            )}
          </div>
        </div>

        <div className="pb-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-teal-700 mb-4">Pares Biomagnéticos Identificados ({pairs.length})</h3>
          {pairs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pairs.map((pair, idx) => (
                <div key={`${pair.name}-${idx}`} className="bg-slate-50 px-3 py-2 rounded border border-slate-200 text-xs font-bold text-slate-800 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  {pair.name}
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
          <h3 className="text-lg font-bold text-teal-700 mb-4">Observações e Recomendações</h3>
          {notes ? (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-700 text-sm italic whitespace-pre-wrap leading-relaxed">
                {notes}
            </div>
          ) : (
            <p className="text-slate-400 italic text-sm">Nenhuma observação adicional registrada.</p>
          )}
        </div>

        {/* Espaço para assinatura em Impressão */}
        <div className="hidden print:block mt-20 pt-10">
            <div className="flex justify-around items-end">
                <div className="text-center w-64">
                    <div className="border-t border-slate-400 pt-2">
                        <p className="text-sm font-bold text-slate-700">Assinatura do Terapeuta</p>
                        <p className="text-[10px] text-slate-400 uppercase">Especialista em Biomagnetismo</p>
                    </div>
                </div>
                <div className="text-center w-64">
                    <div className="border-t border-slate-400 pt-2">
                        <p className="text-sm font-bold text-slate-700">{patient.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Paciente / Responsável</p>
                    </div>
                </div>
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
                onClick={onFinish}
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
