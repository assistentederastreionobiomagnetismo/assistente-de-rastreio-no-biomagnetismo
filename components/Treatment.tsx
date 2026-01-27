
import React from 'react';

interface TreatmentProps {
  impactionTime: string;
  setImpactionTime: (time: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const Treatment: React.FC<TreatmentProps> = ({ impactionTime, setImpactionTime, notes, setNotes, onNext, onBack }) => {
  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-700 uppercase tracking-widest">Finalização da Sessão</h2>
        <p className="text-slate-500 mt-2 italic">Siga os comandos abaixo para encerrar o atendimento.</p>
      </div>

      <div className="max-w-4xl mx-auto bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          
          <div className="flex gap-4 p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">1</span>
            <p>
              <strong>Antes de tirar os ímãs, dar o comando:</strong> <br />
              <span className="text-purple-700 font-bold italic">"Organismo, ativo e potencializo todos os ímãs aqui impactados."</span>
            </p>
          </div>

          <div className="flex gap-4 p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">2</span>
            <p>
              <span className="text-purple-700 font-bold italic">"Organismo, utilizar todos os seus recursos para que não tenhas nenhum efeito colateral desta impactação."</span>
            </p>
          </div>

          <div className="flex gap-4 p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">3</span>
            <p>
              <span className="text-purple-700 font-bold italic">"Organismo, registrar, em seu sistema imunológico, dados e informações sobre todos os patógenos já eliminados nesta sessão, para que eles não te recontaminem. Grato!"</span>
            </p>
          </div>

          <div className="flex gap-4 p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">4</span>
            <div className="flex-1">
              <p className="mb-3">
                <strong>Organismo, por quanto tempo você precisa estar sob o efeito desta impactação?</strong> <br />
                <span className="text-slate-500 italic text-xs">(Descobrir o tempo perguntando... 1 dia, 2 dias, etc) Anotar a informação obtida abaixo.</span>
              </p>
              <div className="mt-2">
                <label htmlFor="impactionTime" className="block text-xs font-bold text-teal-600 uppercase mb-1">Tempo de Impactação</label>
                <input
                  type="text"
                  id="impactionTime"
                  value={impactionTime}
                  onChange={(e) => setImpactionTime(e.target.value)}
                  placeholder="Ex: 2 dias, 24 horas..."
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 text-sm"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        <div>
          <label htmlFor="sessionNotes" className="block text-lg font-semibold text-slate-600 mb-2">Anotações da Sessão</label>
          <p className="text-xs text-slate-500 mb-2">Faça suas considerações finais, observações técnicas ou recomendações para o paciente.</p>
          <textarea
            id="sessionNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="Digite aqui suas considerações..."
          />
        </div>
      </div>

      <div className="flex justify-between pt-8 max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center px-8 py-2 border border-slate-300 text-base font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center px-10 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors font-bold shadow-lg"
        >
          Próximo: Relatório Final
        </button>
      </div>
    </div>
  );
};

export default Treatment;
