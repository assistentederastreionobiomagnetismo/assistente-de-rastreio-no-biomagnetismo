
import React from 'react';
import { ProtocolData } from '../types';

interface StartProtocolProps {
  data: ProtocolData;
  setData: React.Dispatch<React.SetStateAction<ProtocolData>>;
  onNext: () => void;
  onBack: () => void;
  patientName?: string;
}

const StartProtocol: React.FC<StartProtocolProps> = ({ data, setData, onNext, onBack, patientName }) => {
  const isDistancia = data.sessionType === 'distancia';

  const handleLegResponseChange = (val: 'Encurtado' | 'Estendido' | 'Normal') => {
    setData(prev => ({ ...prev, legResponse: val }));
  };

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <div className="text-center border-b pb-6">
        <h2 className="text-2xl font-bold text-slate-700 uppercase tracking-widest">
          {isDistancia ? 'PREPARAÇÃO PARA INICIAR O TRATAMENTO - SESSÃO A DISTÂNCIA' : 'PREPARAÇÃO PARA INICIAR O TRATAMENTO'}
        </h2>
        
        <div className="mt-6 mb-2">
            <p className="text-red-600 font-extrabold text-base uppercase tracking-tighter">IMPORTANTE!</p>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto font-medium leading-relaxed">
              Antes de iniciar o tratamento, realizar a anamnese do paciente para identificar a(s) queixa(s), identificar se não se enquadra em nenhuma das contra-indicações ou se não possui nenhuma restrição ao tratamento.
            </p>
        </div>

        {/* Botões Chamativos */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-6 print:hidden">
          <button
            onClick={() => setData({ ...data, sessionType: 'presencial' })}
            className={`group relative flex flex-col items-center justify-center w-full sm:w-64 py-4 px-6 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 ${data.sessionType === 'presencial' ? 'bg-teal-600 text-white border-teal-400 shadow-[0_10px_20px_rgba(13,148,136,0.3)]' : 'bg-white text-slate-500 border-slate-100 hover:border-teal-200 shadow-lg'}`}
          >
            <span className="text-lg font-black uppercase tracking-wider">Sessão Presencial</span>
            <span className={`text-[10px] mt-1 uppercase font-bold ${data.sessionType === 'presencial' ? 'text-teal-100' : 'text-slate-400'}`}>Atendimento Local</span>
            {data.sessionType === 'presencial' && <div className="absolute -top-3 -right-3 bg-white text-teal-600 rounded-full p-1 border-2 border-teal-600">✓</div>}
          </button>

          <button
            onClick={() => setData({ ...data, sessionType: 'distancia' })}
            className={`group relative flex flex-col items-center justify-center w-full sm:w-64 py-4 px-6 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 ${data.sessionType === 'distancia' ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_10px_20px_rgba(79,70,229,0.3)]' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200 shadow-lg'}`}
          >
            <span className="text-lg font-black uppercase tracking-wider">Sessão à Distância</span>
            <span className={`text-[10px] mt-1 uppercase font-bold ${data.sessionType === 'distancia' ? 'text-indigo-100' : 'text-slate-400'}`}>Uso de Antena</span>
            {data.sessionType === 'distancia' && <div className="absolute -top-3 -right-3 bg-white text-indigo-600 rounded-full p-1 border-2 border-indigo-600">✓</div>}
          </button>
        </div>

        <p className="text-slate-700 font-bold text-sm mt-8 border-t pt-4">Feito conforme descrito acima, proceder com o protocolo a seguir:</p>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          
          <div className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">1</span>
            <div className="flex-1">
              <p className="mb-3">
                Polarizar os 3 planos corporais (terapeuta e paciente) e em seguida fazer o risco no pé direito, transferindo para o pé esquerdo para obter o SIM.
              </p>
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-sm font-black text-teal-700 uppercase tracking-tight">Sim do paciente:</span>
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

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">2</span>
            <p>
              <strong>Pedir permissão:</strong> Universo, licença para entrar em contato com esse Organismo. Organismo, licença para entrar em contato com você. Confirme com o sim do organismo.
            </p>
          </div>

          {/* PROTOCOLO ANTENA - SESSÃO A DISTÂNCIA */}
          {isDistancia && (
            <div className="flex gap-4 p-5 bg-indigo-50 border-2 border-indigo-100 rounded-xl animate-fade-in ring-4 ring-indigo-50">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">3</span>
              <div>
                <p className="font-bold text-indigo-900 mb-2 uppercase text-xs tracking-widest">Protocolo de Conexão (Antena):</p>
                <p className="text-indigo-900 leading-relaxed">
                  <strong>Pedir permissão:</strong> Organismo, você aceita ser antena para <span className="bg-indigo-200 px-2 py-0.5 rounded font-black text-indigo-900">{patientName || 'O PACIENTE'}</span>? 
                  Se a antena responder sim, dar o comando: <br />
                  <span className="italic font-medium text-indigo-700 block my-2">"Declaro então que, a partir de agora, você é o(a) {patientName || 'O PACIENTE'}!"</span>
                  Confirmar com o sim do organismo se a conexão aconteceu: <br />
                  <span className="italic font-medium text-indigo-700">"Organismo, você é o(a) {patientName || 'O PACIENTE'}?"</span>. 
                  <br />Em caso positivo, dar continuidade à sessão.
                </p>
                <p className="mt-3 text-red-600 font-black text-[10px] uppercase italic tracking-tighter">A partir de agora, seguem-se os mesmos passos da página anterior conforme já descrito nos passos 3 até 11.</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '4' : '3'}</span>
            <p>
              <strong>Pedir permissão:</strong> Organismo, há algum programa ou sistema neste Organismo que impede a eficiência desta terapia? Se a resposta do organismo for sim, dar o comando: <span className="text-purple-700 font-bold italic">Desativando programa ou sistema que impede a eficiência desta terapia. Desativando, desativando, desativando!</span> Confirmar com o sim do organismo, se foi desativado.
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '5' : '4'}</span>
            <p>Pedir permissão ao organismo para rastrear em todas as camadas.</p>
          </div>

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '6' : '5'}</span>
            <p>
              <strong>Dar o comando:</strong> Inserindo a frequência – <span className="bg-yellow-100 px-3 py-1 rounded-md font-mono font-black text-teal-800 tracking-[0.3em] border border-yellow-300">4 4 3 2 5 7 9 3 3 3</span> (verbalizar número por número).
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '7' : '6'}</span>
            <p>
              Validar com o Organismo a queixa ou sintomas. Após validação da(s) queixa(s), dar o comando: <span className="text-purple-700 font-bold italic">Organismo, convenciono que a(s) sua(s) queixa(s) do dia é... (mencionar a(s) queixa(s) validadas pelo organismo).</span>
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '8' : '7'}</span>
            <p>
              Organismo, comando que você me passe todos os pontos que suportam informações, presença, frequência, ressonância, reservatório, pontos de sobrevivências, toxinas, venenos, mucoproteínas tóxicas, lesões, doenças, desconfortos, produtos e subprodutos de qualquer patógeno e qualquer de suas versions, distorções de PH, disfunção de glândulas que tenha ligação ou causa a(s) sua(s) queixa(s) do dia.
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">{isDistancia ? '9' : '8'}</span>
            <p>
              <strong>Dar o comando:</strong> <span className="text-purple-700 font-bold italic">Organismo, eu fecho e lacro todos os seus reservatórios.</span>
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold animate-bounce">{isDistancia ? '10' : '9'}</span>
            <p className="font-black text-teal-700 uppercase tracking-tighter">Ir para o rastreio dos pares na planilha, até finalizar.</p>
          </div>

        </div>
      </div>

      {/* QUADRO DE LEMBRETES TÉCNICOS */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-slate-200 rounded-2xl p-6 bg-white shadow-md space-y-4">
          <h4 className="font-black text-slate-800 border-b-2 border-teal-500 pb-2 text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span> Lembretes Técnicos
          </h4>
          <ul className="text-xs space-y-2 font-bold">
            <li className="flex items-center gap-2 text-slate-700">➤ <span className="text-slate-900">NEGATIVO:</span> <span className="px-2 py-0.5 bg-black text-white rounded">Preto</span></li>
            <li className="flex items-center gap-2 text-slate-700">➤ <span className="text-slate-900">POSITIVO:</span> <span className="px-2 py-0.5 bg-red-600 text-white rounded">Vermelho</span></li>
          </ul>
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Os três planos corporais:</p>
            <ul className="text-xs space-y-1 ml-2 font-bold text-slate-700">
              <li>• Sagital</li>
              <li>• Medial</li>
              <li>• Antero Posterior</li>
            </ul>
          </div>
        </div>

        <div className="border-2 border-slate-200 rounded-2xl p-6 bg-white shadow-md space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-slate-800 leading-tight"><span className="font-black text-teal-700 uppercase text-[10px]">Bipolar:</span> Dois ímãs juntos, negativo e positivo – usar quando o ponto e a ressonância for no mesmo local. <span className="italic text-slate-500">Ex: baço/baço, estômago/estômago, pineal/pineal...</span></p>
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-800 leading-tight"><span className="font-black text-teal-700 uppercase text-[10px]">Bilateral:</span> Usar quando a regra for um ímã de cada lado – direito e esquerdo. <span className="italic text-slate-500">Ex: olho/olho, rim/rim, joelho/joelho...</span></p>
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-800 leading-tight font-bold"><span className="font-black text-red-600 uppercase text-[10px]">Par Trauma:</span> <span className="underline decoration-red-500 decoration-2">Negativo no Trauma</span> e o positivo no rim do mesmo lado.</p>
          </div>
        </div>
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
          disabled={!data.sessionType || !data.legResponse}
          className="inline-flex items-center px-12 py-3 border border-transparent text-base font-black rounded-xl shadow-lg text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
        >
          Próximo: Rastreio
        </button>
      </div>
    </div>
  );
};

export default StartProtocol;
