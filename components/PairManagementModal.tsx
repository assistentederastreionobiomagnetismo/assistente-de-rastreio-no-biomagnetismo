
import React, { useState, useEffect } from 'react';
import { BiomagneticPair, PairDetail } from '../types';
import { TrashIcon, PlusIcon } from './icons/Icons';

interface PairManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pair: BiomagneticPair, originalName?: string) => void;
  initialPair: BiomagneticPair | null;
  existingPairNames: string[];
}

const PairManagementModal: React.FC<PairManagementModalProps> = ({ isOpen, onClose, onSave, initialPair, existingPairNames }) => {
  const emptyPair: BiomagneticPair = { name: '', point1: '', point2: '', imageUrl: '', details: [] };
  const [pair, setPair] = useState<BiomagneticPair>(emptyPair);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic');
  
  const isEditing = initialPair !== null;
  const originalName = initialPair?.name;

  useEffect(() => {
    if (isOpen) {
      if (initialPair) {
        setPair({ 
            ...initialPair, 
            imageUrl: initialPair.imageUrl || '',
            details: initialPair.details || [] 
        });
      } else {
        setPair(emptyPair);
      }
      setError('');
      setActiveTab('basic');
    }
  }, [isOpen, initialPair]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPair(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDetailChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newDetails = [...(pair.details || [])];
    newDetails[index] = { ...newDetails[index], [name]: value };
    setPair(prev => ({ ...prev, details: newDetails }));
  };
  
  const addDetailRow = () => {
    const newDetail: PairDetail = { specification: '', disease: '', symptoms: '', tips: '' };
    setPair(prev => ({ ...prev, details: [...(prev.details || []), newDetail] }));
  };

  const removeDetailRow = (index: number) => {
    setPair(prev => ({ ...prev, details: (prev.details || []).filter((_, i) => i !== index) }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPair(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setPair(prev => ({ ...prev, imageUrl: '' }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair.name.trim() || !pair.point1.trim() || !pair.point2.trim()) {
      setError('Os campos Nome, Ponto 1 e Ponto 2 são obrigatórios.');
      setActiveTab('basic');
      return;
    }
    
    if (pair.name !== originalName && existingPairNames.includes(pair.name)) {
        setError('Já existe um par com este nome.');
        return;
    }

    onSave(pair, originalName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex-shrink-0">
            <h3 className="text-xl font-bold text-teal-700">{isEditing ? 'Editar Par' : 'Adicionar Novo Par'}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</p>}
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-slate-600">Nome do Par</label>
              <input
                type="text"
                id="name"
                name="name"
                value={pair.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Ex: Timo - Reto"
                required
              />
            </div>

            <div className="border-b border-gray-200 flex-shrink-0">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors ${
                    activeTab === 'basic'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Informações Básicas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors ${
                    activeTab === 'details'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Planilha de Detalhes
                </button>
              </nav>
            </div>

            <div className="pt-2">
              {activeTab === 'basic' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="point1" className="block text-sm font-medium text-slate-600">Ponto 1 (Negativo)</label>
                          <input type="text" id="point1" name="point1" value={pair.point1} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="Ex: Timo" required />
                      </div>
                      <div>
                          <label htmlFor="point2" className="block text-sm font-medium text-slate-600">Ponto 2 (Positivo)</label>
                          <input type="text" id="point2" name="point2" value={pair.point2} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="Ex: Reto" required />
                      </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600">Imagem de Referência (Opcional)</label>
                    <div className="mt-2 flex items-center gap-4 p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                      {pair.imageUrl ? (
                        <div className="relative">
                          <img src={pair.imageUrl} alt="Preview" className="w-32 h-32 rounded object-cover shadow-md" />
                          <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs text-center p-2">Sem imagem</div>
                      )}
                      <div className="flex-1">
                          <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                          <p className="mt-2 text-xs text-slate-400">Arraste uma imagem ou clique para selecionar.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="animate-fade-in space-y-4">
                  <div className="flex justify-between items-center bg-teal-50 p-3 rounded-lg border border-teal-100">
                      <div className="text-sm text-teal-800 font-medium">Preencha as informações detalhadas que aparecerão para o terapeuta.</div>
                      <button type="button" onClick={addDetailRow} className="inline-flex items-center gap-1 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 transition-colors">
                          <PlusIcon className="w-4 h-4" /> Adicionar Linha
                      </button>
                  </div>
                  
                  <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Especificação</th>
                          <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Doença/Disfunção</th>
                          <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Sintomas</th>
                          <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Dicas</th>
                          <th className="px-2 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-12">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {(pair.details || []).map((detail, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2 py-2 align-top">
                              <textarea name="specification" value={detail.specification} onChange={(e) => handleDetailChange(index, e)} rows={3} className="block w-full text-xs p-2 border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 resize-none"></textarea>
                            </td>
                            <td className="px-2 py-2 align-top">
                              <textarea name="disease" value={detail.disease} onChange={(e) => handleDetailChange(index, e)} rows={3} className="block w-full text-xs p-2 border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 resize-none"></textarea>
                            </td>
                            <td className="px-2 py-2 align-top">
                              <textarea name="symptoms" value={detail.symptoms} onChange={(e) => handleDetailChange(index, e)} rows={3} className="block w-full text-xs p-2 border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 resize-none"></textarea>
                            </td>
                            <td className="px-2 py-2 align-top">
                              <textarea name="tips" value={detail.tips} onChange={(e) => handleDetailChange(index, e)} rows={3} className="block w-full text-xs p-2 border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 resize-none"></textarea>
                            </td>
                            <td className="px-2 py-2 align-middle text-center">
                              <button type="button" onClick={() => removeDetailRow(index)} className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-all" title="Excluir linha">
                                <TrashIcon className="w-5 h-5"/>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(pair.details || []).length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400 italic">Nenhuma linha de detalhe adicionada. Clique em "Adicionar Linha".</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t bg-slate-50 flex justify-end space-x-3 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors font-medium">Cancelar</button>
            <button type="submit" className="px-8 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 shadow-md transition-all font-bold">Salvar Par</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PairManagementModal;
