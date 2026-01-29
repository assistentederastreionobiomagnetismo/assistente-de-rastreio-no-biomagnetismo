
import React, { useState, useMemo } from 'react';
import { BiomagneticPair } from '../types';
import { PlusIcon, SearchIcon, InfoIcon, TrashIcon, CheckIcon } from './icons/Icons';
import PairDetailModal from './PairDetailModal';

interface ScanningProps {
  levelTitle: string;
  selectedPairs: BiomagneticPair[];
  setSelectedPairs: React.Dispatch<React.SetStateAction<BiomagneticPair[]>>;
  notes: string;
  setNotes: (notes: string) => void;
  biomagneticPairs: BiomagneticPair[];
  onNext: () => void;
  onBack: () => void;
}

const Scanning: React.FC<ScanningProps> = ({ levelTitle, selectedPairs, setSelectedPairs, notes, setNotes, onNext, onBack, biomagneticPairs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [infoModalPair, setInfoModalPair] = useState<BiomagneticPair | null>(null);

  // Mapeia o título da aba para o nível numérico
  const targetLevel = useMemo(() => {
    if (levelTitle.includes("Nível I")) return 1;
    if (levelTitle.includes("Nível II")) return 2;
    if (levelTitle.includes("Nível III")) return 3;
    return 1;
  }, [levelTitle]);

  const addPairToSession = (pair: BiomagneticPair) => {
    if (!selectedPairs.some(p => p.name === pair.name)) {
      setSelectedPairs(prev => [...prev, pair]);
    }
  };
  
  const removePairFromSession = (pairName: string) => {
    setSelectedPairs(prev => prev.filter(p => p.name !== pairName));
  }
  
  const filteredPairs = useMemo(() => {
    // FILTRO RÍGIDO: Apenas pares do nível atual
    const sorted = [...biomagneticPairs]
      .filter(p => p.level === targetLevel)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    if (!searchTerm) {
        return sorted;
    }
    return sorted.filter(pair =>
      pair.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, biomagneticPairs, targetLevel]);

  // Lógica para avisar se o par buscado existe em outro nível
  const pairInOtherLevel = useMemo(() => {
    if (!searchTerm || filteredPairs.length > 0) return null;
    
    const foundGlobal = biomagneticPairs.find(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.level !== targetLevel
    );
    
    return foundGlobal || null;
  }, [searchTerm, filteredPairs, biomagneticPairs, targetLevel]);

  return (
    <div className="animate-fade-in">
      {infoModalPair && <PairDetailModal pair={infoModalPair} onClose={() => setInfoModalPair(null)} />}
      
      <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-slate-700">Rastreio {levelTitle}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Exibindo apenas pares de Nível {targetLevel}</p>
          </div>
          <span className="px-3 py-1 bg-teal-100 text-teal-800 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">Pares Ativos</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-600">Lista de Pares</h3>
          </div>
          <div className="relative mb-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder={`Pesquisar no nível ${targetLevel}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-xl border-slate-300 py-3 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 shadow-inner"
            />
          </div>

          {/* Aviso de Par em outro Nível */}
          {pairInOtherLevel && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-bounce">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-tight leading-relaxed">
                    Atenção: O par "{pairInOtherLevel.name}" não pertence ao Nível {targetLevel}. <br/>
                    Ele está classificado como <span className="underline">Nível {pairInOtherLevel.level}</span>. <br/>
                    Mude a aba acima para encontrá-lo.
                </p>
            </div>
          )}

          {/* Observação condicional: Apenas para Nível III */}
          {targetLevel === 3 && (
            <div className="mb-2 text-center">
              <p className="text-red-600 font-black text-[10px] uppercase animate-pulse tracking-tight">
                Atenção!!! Estes patógenos devem ser chamados pelo nome!
              </p>
            </div>
          )}

          <div className="h-96 overflow-y-auto border rounded-2xl p-2 bg-slate-50 shadow-inner">
            <ul className="divide-y divide-slate-200">
              {filteredPairs.map(pair => (
                <li key={pair.name} className="flex items-center justify-between p-3 hover:bg-white rounded-xl transition-all group">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{pair.name}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{pair.point1} / {pair.point2}</span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button 
                      onClick={() => setInfoModalPair(pair)} 
                      className="p-2 bg-white text-sky-600 hover:text-sky-800 rounded-lg shadow-sm border border-slate-100 transition-all" 
                      title={"Ver Detalhes do Par"}
                    >
                        <InfoIcon className="w-5 h-5"/>
                    </button>
                    <button
                      onClick={() => addPairToSession(pair)}
                      disabled={selectedPairs.some(p => p.name === pair.name)}
                      className="p-2 bg-white text-teal-600 hover:text-teal-800 disabled:text-slate-200 disabled:bg-slate-50 rounded-lg shadow-sm border border-slate-100 transition-all"
                      title="Adicionar à Sessão"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
              {filteredPairs.length === 0 && !pairInOtherLevel && (
                <div className="p-10 text-center text-slate-400">
                    <p className="text-xs font-bold uppercase tracking-widest italic">Nenhum par encontrado para este nível.</p>
                </div>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-slate-600 mb-4">Pares Selecionados ({selectedPairs.length})</h3>
            <div className="h-96 overflow-y-auto border rounded-2xl p-2 bg-white mb-4 shadow-inner">
                {selectedPairs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <p className="text-xs font-bold uppercase tracking-widest italic">Aguardando seleção...</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                    {selectedPairs.map(pair => (
                        <li key={pair.name} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">{pair.name}</span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-black uppercase tracking-tighter w-fit">Nível {pair.level}</span>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <button 
                                  onClick={() => setInfoModalPair(pair)} 
                                  className="p-1 text-sky-600 hover:text-sky-800 transition-colors" 
                                  title={"Ver Detalhes do Par"}
                                >
                                    <InfoIcon className="w-5 h-5"/>
                                </button>
                                <button onClick={() => removePairFromSession(pair.name)} className="p-1 text-red-500 hover:text-red-700 transition-colors" title="Remover Par">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </li>
                    ))}
                    </ul>
                )}
            </div>
            
            <div className="mt-auto">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-tight">Observações Técnicas - {levelTitle}</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={`Anotações importantes...`}
                rows={3}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm"
              ></textarea>
            </div>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-slate-100 mt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-8 py-3 border border-slate-300 text-sm font-black uppercase tracking-widest rounded-xl shadow-sm text-slate-400 bg-white hover:bg-slate-50 transition-all"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center px-10 py-3 border border-transparent text-sm font-black uppercase tracking-widest rounded-xl shadow-lg text-white bg-teal-600 hover:bg-teal-700 transition-all transform hover:scale-[1.02]"
        >
          Finalizar {levelTitle} e Avançar
        </button>
      </div>
    </div>
  );
};

export default Scanning;
