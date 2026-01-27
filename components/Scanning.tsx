
import React, { useState, useMemo } from 'react';
import { BiomagneticPair } from '../types';
import { PlusIcon, SearchIcon, InfoIcon, TrashIcon } from './icons/Icons';
import PairDetailModal from './PairDetailModal';

interface ScanningProps {
  levelTitle: string;
  selectedPairs: BiomagneticPair[];
  setSelectedPairs: React.Dispatch<React.SetStateAction<BiomagneticPair[]>>;
  biomagneticPairs: BiomagneticPair[];
  onNext: () => void;
  onBack: () => void;
}

const Scanning: React.FC<ScanningProps> = ({ levelTitle, selectedPairs, setSelectedPairs, onNext, onBack, biomagneticPairs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [infoModalPair, setInfoModalPair] = useState<BiomagneticPair | null>(null);

  const addPairToSession = (pair: BiomagneticPair) => {
    if (!selectedPairs.some(p => p.name === pair.name)) {
      setSelectedPairs(prev => [...prev, pair]);
    }
  };
  
  const removePairFromSession = (pairName: string) => {
    setSelectedPairs(prev => prev.filter(p => p.name !== pairName));
  }
  
  const filteredPairs = useMemo(() => {
    const sorted = [...biomagneticPairs].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    if (!searchTerm) {
        return sorted;
    }
    return sorted.filter(pair =>
      pair.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, biomagneticPairs]);

  return (
    <div className="animate-fade-in">
      {infoModalPair && <PairDetailModal pair={infoModalPair} onClose={() => setInfoModalPair(null)} />}
      
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-700">Rastreio {levelTitle}</h2>
          <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full uppercase">Pares Ativos</span>
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
              placeholder="Buscar par..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600"
            />
          </div>

          {/* Observação condicional: Apenas para Nível III */}
          {levelTitle === "Nível III" && (
            <div className="mb-2 text-center">
              <p className="text-red-600 font-bold text-sm animate-pulse">
                Atenção!!! Estes patógenos devem ser chamados pelo nome!
              </p>
            </div>
          )}

          <div className="h-96 overflow-y-auto border rounded-lg p-2 bg-slate-50">
            <ul className="divide-y divide-slate-200">
              {filteredPairs.map(pair => (
                <li key={pair.name} className="flex items-center justify-between p-3 hover:bg-slate-100 rounded-md">
                  <span className="text-sm text-slate-800 flex-1 truncate pr-2">{pair.name}</span>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button 
                      onClick={() => setInfoModalPair(pair)} 
                      className="p-1 text-sky-600 hover:text-sky-800 transition-colors" 
                      title={"Ver Detalhes do Par"}
                    >
                        <InfoIcon className="w-5 h-5"/>
                    </button>
                    <button
                      onClick={() => addPairToSession(pair)}
                      disabled={selectedPairs.some(p => p.name === pair.name)}
                      className="p-1 text-teal-600 hover:text-teal-800 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                      title="Adicionar à Sessão"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-slate-600 mb-4">Pares Selecionados ({selectedPairs.length})</h3>
            <div className={`h-[${levelTitle === "Nível III" ? '432px' : '384px'}] overflow-y-auto border rounded-lg p-2 bg-white`}>
                {selectedPairs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <p>Nenhum par selecionado.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                    {selectedPairs.map(pair => (
                        <li key={pair.name} className="flex items-center justify-between p-3">
                            <span className="text-sm font-medium text-slate-900">{pair.name}</span>
                            <button onClick={() => removePairFromSession(pair.name)} className="p-1 text-red-500 hover:text-red-700 transition-colors" title="Remover Par">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </li>
                    ))}
                    </ul>
                )}
            </div>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <button
          onClick={onBack}
          className="inline-flex items-center px-6 py-2 border border-slate-300 text-base font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Scanning;
