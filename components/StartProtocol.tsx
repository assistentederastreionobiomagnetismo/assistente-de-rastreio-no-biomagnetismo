
import React from 'react';
import { ProtocolData } from '../types';

interface StartProtocolProps {
  data: ProtocolData;
  setData: React.Dispatch<React.SetStateAction<ProtocolData>>;
  notes: string;
  setNotes: (notes: string) => void;
  onNext: () => void;
  onBack: () => void;
  patientName?: string;
  patientComplaint?: string;
}

const StartProtocol: React.FC<StartProtocolProps> = ({ data, setData, notes, setNotes, onNext, onBack, patientName, patientComplaint }) => {
  const isDistancia = data.sessionType === 'distancia';

  const handleLegResponseChange = (val: 'Encurtado' | 'Estendido' | 'Normal') => {
    setData(prev => ({ ...prev, legResponse: val }));
  };

  const handleAntennaResponseChange = (val: 'Encurtado' | 'Estendido' | 'Normal') => {
    setData(prev => ({ ...prev, antennaResponse: val }));
  };

  const isNextDisabled = !data.sessionType || !data.legResponse || (isDistancia && !data.antennaResponse);

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <div className="text-center border-b pb-6">
        <h2 className="text-2xl font-bold text-slate-700 uppercase tracking-widest">
          {isDistancia ? 'PREPARAÇÃO PARA INICIAR O TRATAMENTO - SESSÃO A DISTÂNCIA' : 'PREPARAÇÃO PARA INICIAR O TRATAMENTO'}
        </h2>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 space-y-6 text-sm text-slate-700 leading-relaxed">

          {/* ITEM 1 */}
          <div className="flex gap-4 items-start border-b pb-6">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">1</span>
            <div className="flex-1">
              <p className="mb-3">
                Esta sessão é presencial ou à distância (via antena)?
              </p>
              <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-sm font-black text-teal-700 uppercase tracking-tight w-full sm:w-auto">Tipo de Sessão:</span>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="sessionType"
                    value="presencial"
                    checked={data.sessionType === 'presencial'}
                    onChange={() => setData({ ...data, sessionType: 'presencial', antennaResponse: '' })}
                    className="w-5 h-5 text-teal-600 focus:ring-teal-500 border-slate-300"
                  />
                  <span className={`text-sm font-bold transition-colors ${data.sessionType === 'presencial' ? 'text-teal-700' : 'text-slate-500 group-hover:text-slate-700'}`}>Sessão Presencial</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="sessionType"
                    value="distancia"
                    checked={data.sessionType === 'distancia'}
                    onChange={() => setData({ ...data, sessionType: 'distancia' })}
                    className="w-5 h-5 text-teal-600 focus:ring-teal-500 border-slate-300"
                  />
                  <span className={`text-sm font-bold transition-colors ${data.sessionType === 'distancia' ? 'text-teal-700' : 'text-slate-500 group-hover:text-slate-700'}`}>Sessão à Distância (via antena)</span>
                </label>
              </div>
            </div>
          </div>

          {/* ITEM 2 */}
          <div className="flex gap-4 items-start border-b pb-6">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">2</span>
            <div className="flex-1">
              <p className="mb-3">
                Polarizar os 3 planos corporais (terapeuta e paciente) e em seguida fazer o risco no pé direito, transferindo para o pé esquerdo para obter o SIM.
              </p>
              <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-sm font-black text-teal-700 uppercase tracking-tight w-full sm:w-auto">Sim do paciente:</span>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="legResponse"
                    value="Encurtado"
                    checked={data.legResponse === 'Encurtado'}
                    onChange={() => handleLegResponseChange('Encurtado')}
                    className="w-5 h-5 text-teal-600 focus:ring-teal-500 border-slate-300"
                  />
                  <span className={`text-sm font-bold transition-colors ${data.legResponse === 'Encurtado' ? 'text-teal-700' : 'text-slate-500 group-hover:text-slate-700'}`}>Encurtado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="legResponse"
                    value="Estendido"
                    checked={data.legResponse === 'Estendido'}
                    onChange={() => handleLegResponseChange('Estendido')}
                    className="w-5 h-5 text-teal-600 focus:ring-teal-500 border-slate-300"
                  />
                  <span className={`text-sm font-bold transition-colors ${data.legResponse === 'Estendido' ? 'text-teal-700' : 'text-slate-500 group-hover:text-slate-700'}`}>Estendido</span>
                </label>
              </div>
            </div>
          </div>

          {/* ITEM 3 */}
          <div className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">3</span>
            <p className="pt-1">
              <strong>Pedir permissão:</strong> Universo, licença para entrar em contato com esse Organismo. Organismo, licença para entrar em contato com você. Confirme com o sim do organismo.
            </p>
          </div>

          {/* ITEM 4 - PROTOCOLO ANTENA (SOMENTE DISTÂNCIA) */}
          {isDistancia && (
            <div className="flex gap-4 p-5 bg-indigo-50 border-2 border-indigo-100 rounded-xl animate-fade-in ring-4 ring-indigo-50">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">4</span>
              <div className="flex-1 space-y-4">
                <p className="font-bold text-indigo-900 uppercase text-xs tracking-widest border-b border-indigo-200 pb-2">Protocolo de Conexão (Antena)</p>

                {/* CAIXAS DE SELEÇÃO SOLICITADAS NO ITEM 4 */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-indigo-200 shadow-sm">
                  <span className="text-sm font-black text-indigo-700 uppercase tracking-tight w-full sm:w-auto">Sim da Antena:</span>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="antennaResponse"
                      value="Encurtado"
                      checked={data.antennaResponse === 'Encurtado'}
                      onChange={() => handleAntennaResponseChange('Encurtado')}
                      className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className={`text-sm font-bold transition-colors ${data.antennaResponse === 'Encurtado' ? 'text-indigo-800' : 'text-slate-500 group-hover:text-indigo-700'}`}>Encurtado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="antennaResponse"
                      value="Estendido"
                      checked={data.antennaResponse === 'Estendido'}
                      onChange={() => handleAntennaResponseChange('Estendido')}
                      className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className={`text-sm font-bold transition-colors ${data.antennaResponse === 'Estendido' ? 'text-indigo-800' : 'text-slate-500 group-hover:text-indigo-700'}`}>Estendido</span>
                  </label>
                </div>

                <p className="text-indigo-900 leading-relaxed text-sm">
                  <strong>Pedir permissão:</strong> Organismo, você aceita ser antena para <span className="bg-indigo-200 px-2 py-0.5 rounded font-black text-indigo-900">{patientName || 'O PACIENTE'}</span>?
                  Se a antena responder sim, dar o comando: <br />
                  <span className="italic font-medium text-indigo-700 block my-2">"Declaro então que, a partir de agora, você é o(a) {patientName || 'O PACIENTE'}!"</span>
                  Confirmar com o sim do organismo se a conexão aconteceu: <br />
                  <span className="italic font-medium text-indigo-700">"Organismo, você é o(a) {patientName || 'O PACIENTE'}?"</span>.
                  <br />Em caso positivo, dar continuidade à sessão.
                </p>
                <p className="text-red-600 font-black text-[10px] uppercase italic tracking-tighter pt-2 border-t border-indigo-100">A partir de agora, seguem-se os mesmos passos já descritos abaixo nos passos 5 até 11.</p>
              </div>
            </div>
          )}

          {/* ITENS RESTANTES (RE-NUMERADOS AUTOMATICAMENTE) */}
          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '5' : '4'}</span>
            <p className="pt-1">
              <strong>Pedir permissão:</strong> Organismo, há algum programa ou sistema neste Organismo que impede a eficiência desta terapia? Se a resposta do organismo for sim, dar o comando: <span className="text-purple-700 font-bold italic">Desativando programa ou sistema que impede a eficiência desta terapia. Desativando, desativando, desativando!</span> Confirmar com o sim do organismo, se foi desativado.
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '6' : '5'}</span>
            <p className="pt-1">Pedir permissão ao organismo para rastrear em todas as camadas.</p>
          </div>

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '7' : '6'}</span>
            <p className="pt-1">
              <strong>Dar o comando:</strong> Inserindo a frequência – <span className="bg-yellow-100 px-3 py-1 rounded-md font-mono font-black text-teal-800 tracking-[0.3em] border border-yellow-300">4 4 3 2 5 7 9 3 3 3</span> (verbalizar número por número).
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '8' : '7'}</span>
            <div className="pt-1 w-full">
              <p className="text-slate-700 font-medium">
                Validar com o Organismo a(s) queixa(s) ou sintoma(s) do dia:
              </p>
              
              {patientComplaint ? (
                <div className="my-3 p-4 bg-rose-50 text-rose-800 font-black text-xl uppercase rounded-xl border-2 border-rose-200 shadow-sm text-center">
                  "{patientComplaint}"
                </div>
              ) : (
                <span className="text-slate-400 italic block my-2">(nenhuma queixa registrada)</span>
              )}
              
              <p className="text-slate-500 text-sm italic mb-1 mt-2">Após validação, dar o comando:</p>
              <p className="text-purple-700 font-bold italic text-lg">
                "Organismo, convenciono que a(s) sua(s) queixa(s) do dia é/são... (mencionar a(s) queixa(s) acima validadas pelo organismo)."
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '9' : '8'}</span>
            <p className="pt-1">
              Organismo, comando que você me passe todos os pontos que suportam informações, presença, frequência, ressonância, reservatório, pontos de sobrevivências, toxinas, venenos, mucoproteínas tóxicas, lesões, doenças, desconfortos, produtos e subprodutos de qualquer patógeno e qualquer de suas versões, distorções de PH, disfunção de glândulas que tenha ligação ou causa a(s) sua(s) queixa(s) do dia.
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '10' : '9'}</span>
            <p className="pt-1">
              <strong>Dar o comando:</strong> <span className="text-purple-700 font-bold italic">Organismo, eu fecho e lacro todos os seus reservatórios.</span>
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold animate-bounce">{isDistancia ? '11' : '10'}</span>
            <p className="font-black text-teal-700 uppercase tracking-tighter pt-1">Ir para o rastreio dos pares na planilha, até finalizar.</p>
          </div>

        </div>
      </div>

      {/* OBSERVAÇÕES DA PREPARAÇÃO */}
      <div className="max-w-4xl mx-auto">
        <label htmlFor="protocolNotes" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Observações da Preparação</label>
        <textarea
          id="protocolNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anote aqui algo relevante durante a preparação..."
          rows={3}
          className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm"
        ></textarea>
      </div>

      <div className="flex justify-between pt-8 max-w-4xl mx-auto border-t">
        <button
          onClick={onBack}
          className="inline-flex items-center px-8 py-3 border-2 border-slate-300 text-base font-bold rounded-xl shadow-sm text-slate-600 bg-white hover:bg-slate-50 transition-all"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className="inline-flex items-center px-12 py-3 border border-transparent text-base font-black rounded-xl shadow-lg text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
        >
          Próximo: Rastreio
        </button>
      </div>
    </div>
  );
};

export default StartProtocol;
