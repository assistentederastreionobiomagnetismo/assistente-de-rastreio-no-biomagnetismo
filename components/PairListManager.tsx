
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
  currentUser: User | null;
}

const PairListManager: React.FC<PairListManagerProps> = ({ 
    biomagneticPairs, 
    setBiomagneticPairs, 
    onExit,
    title,
    currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isManageModalOpen, setManageModalOpen] = useState(false);
  const [editingPair, setEditingPair] = useState<BiomagneticPair | null>(null);

  const handleSavePair = (savedPair: BiomagneticPair, originalName?: string) => {
    if (originalName) {
        setBiomagneticPairs(prev => prev.map(p => p.name === originalName ? savedPair : p));
    } else {
        setBiomagneticPairs(prev => [...prev, savedPair]);
    }
  };

  const handleDelete = (name: string) => {
    if (window.confirm(`Excluir par ${name}?`)) {
        setBiomagneticPairs(prev => prev.filter(p => p.name !== name));
    }
  };

  const filteredPairs = useMemo(() => {
    return biomagneticPairs.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [biomagneticPairs, searchTerm]);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10">
      <PairManagementModal 
        isOpen={isManageModalOpen}
        onClose={() => setManageModalOpen(false)}
        onSave={handleSavePair}
        initialPair={editingPair}
        existingPairNames={biomagneticPairs.map(p => p.name)}
      />
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
        <button onClick={() => { setEditingPair(null); setManageModalOpen(true); }} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold">Novo Par</button>
      </div>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-full p-2 border rounded-lg" />
      </div>

      <div className="h-96 overflow-y-auto border rounded-lg divide-y bg-slate-50">
        {filteredPairs.map(p => (
            <div key={p.name} className="flex justify-between items-center p-3 hover:bg-white transition-colors">
                <span className="font-medium text-slate-700">{p.name}</span>
                <div className="flex gap-2">
                    <button onClick={() => { setEditingPair(p); setManageModalOpen(true); }} className="text-blue-600 p-1"><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(p.name)} className="text-red-500 p-1"><TrashIcon className="h-4 w-4" /></button>
                </div>
            </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={onExit} className="text-teal-600 font-bold">Voltar ao Painel</button>
      </div>
    </div>
  );
};

export default PairListManager;
