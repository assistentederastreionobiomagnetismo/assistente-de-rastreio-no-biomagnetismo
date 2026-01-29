
import React, { useState, useMemo } from 'react';
import { BiomagneticPair, User } from '../types';
import { PlusIcon, SearchIcon, TrashIcon, PencilIcon, CheckIcon } from './icons/Icons';
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePair = async (savedPair: BiomagneticPair, originalName?: string) => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    // Pequeno delay para feedback visual e garantir atomicidade do estado
    setTimeout(() => {
        setBiomagneticPairs(prev => {
            if (originalName) {
                // Atualiza mantendo a ordem se possível
                return prev.map(p => p.name === originalName ? savedPair : p);
            } else {
                // Adiciona novo par ao final
                const newOrder = prev.length > 0 ? Math.max(...prev.map(p => p.order || 0)) + 1 : 1;
                return [...prev, { ...savedPair, order: newOrder }];
            }
        });
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    }, 100);
  };

  const handleDelete = (name: string) => {
    if (window.confirm(`Tem certeza que deseja EXCLUIR permanentemente o par "${name}" da base master?`)) {
        setBiomagneticPairs(prev => prev.filter(p => p.name !== name));
    }
  };

  const filteredPairs = useMemo(() => {
    return biomagneticPairs.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.point1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.point2.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [biomagneticPairs, searchTerm]);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-slate-200">
      <PairManagementModal 
        isOpen={isManageModalOpen}
        onClose={() => setManageModalOpen(false)}
        onSave={handleSavePair}
        initialPair={editingPair}
        existingPairNames={biomagneticPairs.map(p => p.name)}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
            <h2 className="text-3xl font-black text-slate-800">{title}</h2>
            <p className="text-slate-500 text-sm">Administre a biblioteca global de pares biomagnéticos.</p>
        </div>
        <div className="flex items-center gap-3">
            {saveSuccess && (
                <span className="flex items-center gap-1 text-teal-600 font-bold text-xs animate-fade-in">
                    <CheckIcon className="w-4 h-4" /> Alteração Salva!
                </span>
            )}
            <button 
                onClick={() => { setEditingPair(null); setManageModalOpen(true); }} 
                className="bg-teal-600 text-white px-8 py-3 rounded-xl font-black shadow-lg hover:bg-teal-700 transition-all transform active:scale-95 uppercase text-sm tracking-widest"
                disabled={isSaving}
            >
                {isSaving ? 'Salvando...' : 'Adicionar Novo Par'}
            </button>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input 
            type="text" 
            placeholder="Buscar por nome ou pontos anatômicos..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium shadow-inner" 
        />
        <div className="absolute inset-y-0 right-4 flex items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredPairs.length} resultados</span>
        </div>
      </div>

      <div className="h-[500px] overflow-y-auto border border-slate-200 rounded-2xl bg-slate-50 shadow-inner">
        <div className="grid grid-cols-1 divide-y divide-slate-200">
            {filteredPairs.length > 0 ? filteredPairs.map(p => (
                <div key={p.name} className="flex justify-between items-center p-5 hover:bg-white transition-all group">
                    <div className="flex flex-col">
                        <span className="font-black text-slate-800 group-hover:text-teal-700 transition-colors">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.point1} / {p.point2}</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { setEditingPair(p); setManageModalOpen(true); }} 
                            className="p-3 bg-white text-blue-600 rounded-xl shadow-sm border border-slate-100 hover:bg-blue-50 transition-all"
                            title="Editar Dados do Par"
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={() => handleDelete(p.name)} 
                            className="p-3 bg-white text-red-500 rounded-xl shadow-sm border border-slate-100 hover:bg-red-50 transition-all"
                            title="Excluir Par"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )) : (
                <div className="p-20 text-center">
                    <MagnetIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic">Nenhum par encontrado com esses critérios.</p>
                </div>
            )}
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-100 flex justify-center">
        <button onClick={onExit} className="px-10 py-2 text-slate-400 hover:text-teal-600 font-black uppercase text-xs tracking-[0.2em] transition-all">
            Voltar ao Painel Principal
        </button>
      </div>
    </div>
  );
};

export default PairListManager;
