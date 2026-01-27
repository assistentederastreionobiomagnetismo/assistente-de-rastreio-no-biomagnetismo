
import React, { useState, useMemo, useEffect } from 'react';
import { BiomagneticPair, User } from '../types';
import { PlusIcon, SearchIcon, TrashIcon, PencilIcon } from './icons/Icons';
import PairManagementModal from './PairManagementModal';

interface PairListManagerProps {
  biomagneticPairs: BiomagneticPair[];
  setBiomagneticPairs: React.Dispatch<React.SetStateAction<BiomagneticPair[]>>;
  onExit: () => void;
  title: string;
  exitButtonText: string;
  mode: 'admin' | 'therapist';
  currentUser: User | null;
}

const PairListManager: React.FC<PairListManagerProps> = ({ 
    biomagneticPairs, 
    setBiomagneticPairs, 
    onExit,
    title,
    exitButtonText,
    mode,
    currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isManageModalOpen, setManageModalOpen] = useState<boolean>(false);
  const [editingPair, setEditingPair] = useState<BiomagneticPair | null>(null);
  const [localPairs, setLocalPairs] = useState<BiomagneticPair[]>([]);

  useEffect(() => {
    // Sync and sort pairs when the main prop changes
    const sorted = [...biomagneticPairs].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    setLocalPairs(sorted);
  }, [biomagneticPairs]);

  const isFullAdminView = mode === 'admin' && currentUser?.username === 'Vbsjunior.Biomagnetismo';
  const canAddPairs = isFullAdminView || mode === 'therapist';

  const handleOpenAddModal = () => {
    setEditingPair(null);
    setManageModalOpen(true);
  }

  const handleOpenEditModal = (pair: BiomagneticPair) => {
    setEditingPair(pair);
    setManageModalOpen(true);
  }

  const handleDeletePair = (pairToDelete: BiomagneticPair) => {
    if (window.confirm(`Tem certeza que deseja excluir o par "${pairToDelete.name}"? Esta ação não pode ser desfeita.`)) {
        setBiomagneticPairs(prev => prev.filter(p => p.name !== pairToDelete.name));
    }
  }
  
  const handleSavePair = (savedPair: BiomagneticPair, originalName?: string) => {
    if (editingPair && originalName) {
        // Editing existing pair - keep original order
        const originalOrder = biomagneticPairs.find(p => p.name === originalName)?.order;
        setBiomagneticPairs(prev => prev.map(p => (
            p.name === originalName ? {...savedPair, order: originalOrder } : p
        )));
    } else {
        // Adding new pair - add to the end
        setBiomagneticPairs(prev => {
            const maxOrder = prev.length > 0 ? Math.max(...prev.map(p => p.order || 0)) : 0;
            const newPairWithCustomFlag: BiomagneticPair = {
                ...savedPair,
                isCustom: true,
                order: maxOrder + 1
            };
            return [...prev, newPairWithCustomFlag];
        });
    }
  };

  const handleOrderChange = (pairName: string, newOrderValue: string) => {
    const newOrder = parseInt(newOrderValue, 10);
    setLocalPairs(prev =>
        prev.map(p =>
            p.name === pairName ? { ...p, order: isNaN(newOrder) ? undefined : newOrder } : p
        )
    );
  };

  const handleSortAndSave = () => {
    // Sort based on the current values in the input fields (localPairs)
    const sorted = [...localPairs].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    // Persist the changes up to the parent component
    setBiomagneticPairs(sorted);
    alert('Ordem classificada e salva com sucesso!');
  };

  const filteredPairs = useMemo(() => {
    // The localPairs state is already sorted, so filtering will preserve the order.
    return localPairs.filter(pair =>
      pair.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, localPairs]);
  

  return (
    <div className="animate-fade-in max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10">
      <PairManagementModal 
        isOpen={isManageModalOpen}
        onClose={() => setManageModalOpen(false)}
        onSave={handleSavePair}
        initialPair={editingPair}
        existingPairNames={biomagneticPairs.map(p => p.name)}
      />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{title}</h1>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-700">Pares Cadastrados ({biomagneticPairs.length})</h3>
        <div className="flex items-center gap-4">
            {isFullAdminView &&
                <button onClick={handleSortAndSave} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Classificar por Ordem
                </button>
            }
            {canAddPairs &&
                <button onClick={handleOpenAddModal} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                    <PlusIcon className="w-5 h-5" />
                    Adicionar Novo Par
                </button>
            }
        </div>
      </div>
      <div className="relative mb-4">
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
      <div className="h-[60vh] overflow-y-auto border rounded-lg p-2 bg-slate-50">
        <ul className="divide-y divide-slate-200">
          {filteredPairs.map((pair) => {
            const canModify = isFullAdminView || !!pair.isCustom;
            return (
              <li key={pair.name} className="flex items-center justify-between p-3 rounded-md hover:bg-slate-100">
                  <div className="flex items-center flex-1 truncate">
                      {isFullAdminView && (
                          <input
                              type="number"
                              value={pair.order ?? ''}
                              onChange={(e) => handleOrderChange(pair.name, e.target.value)}
                              className="w-16 text-center mr-4 p-1 rounded-md border-slate-300 focus:ring-teal-500 focus:border-teal-500"
                              aria-label={`Ordem de ${pair.name}`}
                          />
                      )}
                      <span className="text-sm text-slate-800 truncate">{pair.name}</span>
                      {!pair.isCustom && <span className="text-xs text-slate-400 ml-2 flex-shrink-0">(Padrão)</span>}
                  </div>
                <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                  <button onClick={() => handleOpenEditModal(pair)} disabled={!canModify} className="p-1 text-slate-500 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors" title={canModify ? "Editar Par" : "Permissão negada"}>
                      <PencilIcon className="w-5 h-5"/>
                  </button>
                   <button onClick={() => handleDeletePair(pair)} disabled={!canModify} className="p-1 text-slate-500 hover:text-red-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors" title={canModify ? "Excluir Par" : "Permissão negada"}>
                      <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
       <div className="text-center mt-6">
        <button onClick={onExit} className="text-teal-600 hover:text-teal-800 font-medium">
            {exitButtonText}
        </button>
       </div>
    </div>
  );
};

export default PairListManager;