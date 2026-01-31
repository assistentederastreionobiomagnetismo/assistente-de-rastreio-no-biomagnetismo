import React from 'react';
import { BiomagneticPair } from '../types';

interface PairDetailModalProps {
  pair: BiomagneticPair;
  onClose: () => void;
}

const PairDetailModal: React.FC<PairDetailModalProps> = ({ pair, onClose }) => {
  // Função para renderizar sintomas com realce em vermelho para textos entre parênteses
  const renderSymptoms = (text: string) => {
    if (!text) return '-';
    
    // Regex para identificar texto dentro de parênteses
    const parts = text.split(/(\(.*?\))/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('(') && part.endsWith(')')) {
        return <span key={i} className="text-red-600 font-bold">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-teal-700 text-white rounded-t-lg shadow-sm">
          <div className="flex items-center gap-3">
             <div className="bg-white text-teal-700 p-1 rounded font-bold text-xs">DETALHES DO PAR</div>
             <h3 className="text-xl font-bold">{pair.name}</h3>
          </div>
          <button onClick={onClose} className="text-white hover:bg-teal-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-2xl leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Image Column */}
            <div className="lg:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner flex flex-col items-center">
               <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">Imagem de Referência</h4>
               {pair.imageUrl ? (
                 <div className="w-full bg-white p-2 rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                   <img 
                    key={pair.imageUrl}
                    src={pair.imageUrl} 
                    alt={`Referência para ${pair.name}`} 
                    referrerPolicy="no-referrer"
                    className="w-full h-auto rounded object-contain max-h-[400px] block mx-auto" 
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.log("Erro ao carregar imagem do Drive");
                        target.onerror = null; 
                        target.src="https://via.placeholder.com/400x500?text=Imagem+Indisponivel";
                    }}
                   />
                 </div>
               ) : (
                 <div className="w-full aspect-[3/4] bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm italic text-center p-4">
                   Nenhuma imagem de referência cadastrada.
                 </div>
               )}
               <div className="mt-4 text-sm text-slate-600 text-center font-medium">
                 <p className="border-b border-slate-100 pb-1 mb-1"><strong>Ponto 1 (N):</strong> {pair.point1}</p>
                 <p><strong>Ponto 2 (P):</strong> {pair.point2}</p>
               </div>
            </div>
            
            {/* Information Spreadsheet Column */}
            <div className="lg:col-span-3">
              <h4 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-teal-500 pl-3">Planilha de Informações Clínicas</h4>
              
              <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-r">Especificação</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-r">Doença / Disfunção</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Sintomas e algumas dicas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {(pair.details && pair.details.length > 0) ? (
                      pair.details.map((detail, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 text-sm text-slate-700 border-r align-top whitespace-pre-wrap font-medium">{detail.specification || '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-700 border-r align-top whitespace-pre-wrap">{detail.disease || '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-700 align-top whitespace-pre-wrap">
                            {renderSymptoms(detail.symptoms)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-400 italic bg-slate-25">Nenhuma informação técnica cadastrada para este par.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 rounded-b-lg flex justify-end">
          <button onClick={onClose} className="px-10 py-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 shadow-md transition-all font-bold">Fechar Detalhes</button>
        </div>
      </div>
    </div>
  );
};

export default PairDetailModal;