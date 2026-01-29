
import React, { useState, useMemo, useEffect } from 'react';
import { BiomagneticPair, User } from '../types';
import { PlusIcon, SearchIcon, TrashIcon, PencilIcon } from './icons/Icons';
import PairManagementModal from './PairManagementModal';

interface PairListManagerProps {
  biomagneticPairs: BiomagneticPair[];
  setBiomagneticPairs: (pairs: BiomagneticPair[]) => void;
  onExit: () => void;
  title: string;
  exitButtonText: string;
  currentUser: User | null;
}

const PairListManager: React.FC<PairListManagerProps> = ({ 
    biomagneticPairs, 
    setBiomagneticPairs, 
    onExit,
    title,
    exitButtonText,
    currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isManageModalOpen, setManageModalOpen] = useState<boolean>(false);
  const [editingPair, setEditingPair] = useState<BiomagneticPair | null>(null);
  const [localPairs, setLocalPairs] = useState<BiomagneticPair[]>([]);

  useEffect(() => {
    const sorted = [...biomagneticPairs].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    setLocalPairs(sorted);
  }, [biomagneticPairs]);

  const isFullAdmin = currentUser?.username.toLowerCase() === 'vbsjunior.biomagnetismo';

  const handleOpenAddModal = () => {
    if (!isFullAdmin) return;
    setEditingPair(null);
    setManageModalOpen(true);
  }

  const handleOpenEditModal = (pair: BiomagneticPair) => {
    if (!isFullAdmin) return;
    setEditingPair(pair);
    setManageModalOpen(true);
  }

  const handleDeletePair = (pairToDelete: BiomagneticPair) => {
    if (!isFullAdmin) return;
    if (window.confirm(`Tem certeza que deseja excluir o par "${pairToDelete.name}"?`)) {
        const updated = biomagneticPairs.filter(p => p.name !== pairToDelete.name);
        setBiomagneticPairs(updated);
    }
  }
  
  const handleSavePair = (savedPair: BiomagneticPair, originalName?: string) => {
    if (!isFullAdmin) return;
    
    let updatedList: BiomagneticPair[];
    if (editingPair && originalName) {
        // Editando par existente (pode ter mudado o nome)
        updatedList = biomagneticPairs.map(p => 
            p.name === originalName ? { ...savedPair, order: p.order } : p
        );
    } else {
        // Adicionando novo par
        const maxOrder = biomagneticPairs.length > 0 ? Math.max(...biomagneticPairs.map(p => p.order || 0)) : 0;
        updatedList = [...biomagneticPairs, { ...savedPair, isCustom: true, order: maxOrder + 1 }];
    }
    
    setBiomagneticPairs(updatedList);
    alert('Par salvo na sua base local! Não esqueça de Gerar o Código de Sincronização no painel de acessos para enviar aos outros usuários.');
  };

  const handleOrderChange = (pairName: string, newOrderValue: string) => {
    if (!isFullAdmin) return;
    const newOrder = parseInt(newOrderValue, 10);
    setLocalPairs(prev =>
        prev.map(p =>
            p.name === pairName ? { ...p, order: isNaN(newOrder) ? undefined : newOrder } : p
        )
    );
  };

  const handleSortAndSave = () => {
    if (!isFullAdmin) return;
    const sorted = [...localPairs].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    setBiomagneticPairs(sorted);
    alert('Ordem atualizada!');
  };

  const filteredPairs = useMemo(() => {
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
        <p className="text-xs text-slate-400 mt-2 font-bold italic">As alterações salvas aqui precisam ser "Publicadas" via Código de Sincronismo.</p>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-700">Pares ({biomagneticPairs.length})</h3>
        <div className="flex items-center gap-4">
            <button onClick={handleSortAndSave} className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-lg hover:bg-blue-700 transition-colors">
                Salvar Ordem
            </button>
            <button onClick={handleOpenAddModal} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-xs font-black rounded-lg hover:bg-teal-700 transition-colors">
                <PlusIcon className="w-4 h-4" /> Novo Par
            </button>
        </div>
      </div>

      <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input type="text" placeholder="Buscar par..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full rounded-md border-slate-300 py-2 pl-10 text-sm focus:ring-teal-600" />
      </div>

      <div className="h-[50vh] overflow-y-auto border rounded-lg p-2 bg-slate-50 shadow-inner">
        <ul className="divide-y divide-slate-200">
          {filteredPairs.map((pair) => (
            <li key={pair.name} className="flex items-center justify-between p-3 rounded-md hover:bg-slate-100">
                <div className="flex items-center flex-1 truncate">
                    <input type="number" value={pair.order ?? ''} onChange={(e) => handleOrderChange(pair.name, e.target.value)} className="w-12 text-center mr-4 p-1 rounded-md border-slate-300 text-xs font-bold" />
                    <span className="text-sm text-slate-800 truncate font-black">{pair.name}</span>
                </div>
              <div className="flex items-center space-x-3 ml-4">
                <button onClick={() => handleOpenEditModal(pair)} className="p-1 text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                 <button onClick={() => handleDeletePair(pair)} className="p-1 text-red-600"><TrashIcon className="w-4 h-4"/></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
       <div className="text-center mt-6">
        <button onClick={onExit} className="text-teal-600 hover:text-teal-800 font-bold uppercase text-xs">Voltar ao Painel</button>
       </div>
    </div>
  );
};

export default PairListManager;
