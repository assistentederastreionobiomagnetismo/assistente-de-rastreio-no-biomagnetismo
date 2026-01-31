
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
  
  // Estado para os checks de guia (apenas para o terapeuta se guiar na lista)
  const [guidedChecks, setGuidedChecks] = useState<Set<string>>(new Set());

  // Mapeia o título da aba para o nível numérico
  const targetLevel = useMemo(() => {
    if (levelTitle.includes("Reservatórios")) return 1;
    if (levelTitle.includes("Nível III")) return 4;
    if (levelTitle.includes("Nível II")) return 3;
    if (levelTitle.includes("Nível I")) return 2;
    return 1;
  }, [levelTitle]);

  const toggleGuidedCheck = (pairName: string) => {
    setGuidedChecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pairName)) {
        newSet.delete(pairName);
      } else {
        newSet.add(pairName);
      }
      return newSet;
    });
  };

  const addPairToSession = (pair: BiomagneticPair) => {
    if (!selectedPairs.some(p => p.name === pair.name)) {
      setSelectedPairs(prev => [...prev, pair]);
    }
  };
  
  const removePairFromSession = (pairName: string) => {
    setSelectedPairs(prev => prev.filter(p => p.name !== pairName));
  }
  
  const filteredPairs = useMemo(() => {
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

  const pairInOtherLevel = useMemo(() => {
    if (!searchTerm || filteredPairs.length > 0) return null;
    
    const foundGlobal = biomagneticPairs.find(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.level !== targetLevel
    );
    
    return foundGlobal || null;
  }, [searchTerm, filteredPairs, biomagneticPairs, targetLevel]);

  const getLevelLabel = (lvl: number) => {
      if (lvl === 1) return "Reservatórios";
      if (lvl === 2) return "Nível I";
      if (lvl === 3) return "Nível II";
      if (lvl === 4) return "Nível III";
      return "Nível " + lvl;
  };

  return (
    <div className="animate-fade-in">
      {infoModalPair && <PairDetailModal pair={infoModalPair} onClose={() => setInfoModalPair(null)} />}
      
      <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-slate-700">Rastreio {levelTitle}</h2>
          </div>
          <div className="flex items-center gap-3">
             {guidedChecks.size > 0 && (
               <button 
                 onClick={() => setGuidedChecks(new Set())}
                 className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
               >
                 Limpar Guia
               </button>
             )}
             <span className="px-3 py-1 bg-teal-100 text-teal-800 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">Pares Ativos</span>
          </div>
      </div>

      {targetLevel === 4 && (
        <div className="mb-8 p-5 bg-red-50 border-2 border-red-500 rounded-2xl flex items-center gap-6">
          <div className="bg-red-600 p-3 rounded-full text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-red-600 font-black text-lg uppercase tracking-widest">Atenção!</span>
            <p className="text-red-700 font-black text-xl leading-tight">
              Os patógenos a seguir devem ser chamados pelo nome!
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-600">Lista de Pares</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase">Testados: {guidedChecks.size} / {filteredPairs.length}</span>
          </div>
          <div className="relative mb-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder={`Pesquisar em ${levelTitle}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-xl border-slate-300 py-3 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 shadow-inner"
            />
          </div>

          {pairInOtherLevel && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-bounce">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-tight leading-relaxed">
                    Atenção: O par "{pairInOtherLevel.name}" não pertence a {levelTitle}. <br/>
                    Ele está classificado como <span className="underline">{getLevelLabel(pairInOtherLevel.level)}</span>. <br/>
                    Mude a aba acima para encontrá-lo.
                </p>
            </div>
          )}

          <div className="h-96 overflow-y-auto border rounded-2xl p-2 bg-slate-50 shadow-inner">
            <ul className="divide-y divide-slate-200">
              {filteredPairs.map(pair => {
                const isChecked = guidedChecks.has(pair.name);
                const isSelected = selectedPairs.some(p => p.name === pair.name);
                
                return (
                  <li key={pair.name} className={`flex items-center justify-between p-3 rounded-xl transition-all group ${isChecked ? 'bg-slate-100 opacity-70' : 'hover:bg-white'}`}>
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      {/* BOTAO DE CHECK (GUIA) */}
                      <button 
                        onClick={() => toggleGuidedCheck(pair.name)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'border-slate-300 text-transparent hover:border-green-400'}`}
                        title="Marcar como Testado (Guia)"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      
                      <div className="flex flex-col truncate">
                        <span className={`text-sm font-bold transition-colors truncate ${isSelected ? 'text-teal-700' : isChecked ? 'text-slate-400' : 'text-slate-800'}`}>
                          {pair.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase truncate">{pair.point1} / {pair.point2}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                      <button 
                        onClick={() => setInfoModalPair(pair)} 
                        className="p-2 bg-white text-sky-600 hover:text-sky-800 rounded-lg shadow-sm border border-slate-100 transition-all" 
                        title={"Ver Detalhes do Par"}
                      >
                          <InfoIcon className="w-4 h-4"/>
                      </button>
                      <button
                        onClick={() => addPairToSession(pair)}
                        disabled={isSelected}
                        className={`p-2 rounded-lg shadow-sm border transition-all ${isSelected ? 'bg-teal-50 text-teal-400 border-teal-100' : 'bg-white text-teal-600 hover:text-white hover:bg-teal-600 border-slate-100'}`}
                        title="Selecionar para Sessão (Positivo)"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
              {filteredPairs.length === 0 && !pairInOtherLevel && (
                <div className="p-10 text-center text-slate-400">
                    <p className="text-xs font-bold uppercase tracking-widest italic">Nenhum par encontrado para esta categoria.</p>
                </div>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-slate-600 mb-4">Pares Selecionados Positivos ({selectedPairs.length})</h3>
            <div className="h-96 overflow-y-auto border rounded-2xl p-2 bg-white mb-4 shadow-inner">
                {selectedPairs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <p className="text-xs font-bold uppercase tracking-widest italic">Aguardando seleção de pares positivos...</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                    {selectedPairs.map(pair => (
                        <li key={pair.name} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">{pair.name}</span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-black uppercase tracking-tighter w-fit">{getLevelLabel(pair.level)}</span>
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
          className="inline-flex items-center px-8 py-3 border border-slate-300 text-sm font-black uppercase tracking-widest rounded-xl shadow-sm text-slate-600 bg-white hover:bg-slate-50 transition-all"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center px-10 py-3 border border-transparent text-sm font-black uppercase tracking-widest rounded-xl shadow-lg text-white bg-teal-600 hover:bg-teal-700 transition-all transform hover:scale-[1.02]"
        >
          Avançar
        </button>
      </div>
    </div>
  );
};

export default Scanning;
