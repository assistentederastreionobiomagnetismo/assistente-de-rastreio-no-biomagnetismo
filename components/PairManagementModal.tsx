
import React, { useState, useEffect, useRef } from 'react';
import { BiomagneticPair, PairDetail } from '../types';
import { TrashIcon, PlusIcon, CheckIcon } from './icons/Icons';

interface PairManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pair: BiomagneticPair, originalName?: string) => void;
  initialPair: BiomagneticPair | null;
  existingPairNames: string[];
}

const PairManagementModal: React.FC<PairManagementModalProps> = ({ isOpen, onClose, onSave, initialPair, existingPairNames }) => {
  const emptyPair: BiomagneticPair = { name: '', point1: '', point2: '', imageUrl: '', details: [], isDefinitive: true, level: 1 };
  const [pair, setPair] = useState<BiomagneticPair>(emptyPair);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const isEditing = initialPair !== null;
  const originalName = initialPair?.name;

  useEffect(() => {
    if (isOpen) {
      if (initialPair) {
        setPair({ 
            ...initialPair, 
            imageUrl: initialPair.imageUrl || '',
            details: initialPair.details || [],
            isDefinitive: initialPair.isDefinitive !== undefined ? initialPair.isDefinitive : true,
            level: initialPair.level || 1
        });
      } else {
        setPair(emptyPair);
      }
      setError('');
      setActiveTab('basic');
    }
  }, [isOpen, initialPair]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'level') {
      setPair(prev => ({ ...prev, level: parseInt(value) as 1 | 2 | 3 | 4 }));
    } else {
      setPair(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleDefinitive = () => {
    setPair(prev => ({ ...prev, isDefinitive: !prev.isDefinitive }));
  };
  
  const handleDetailChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newDetails = [...(pair.details || [])];
    newDetails[index] = { ...newDetails[index], [name]: value } as any;
    setPair(prev => ({ ...prev, details: newDetails }));
  };
  
  const addDetailRow = () => {
    const newDetail: PairDetail = { specification: '', disease: '', symptoms: '' };
    setPair(prev => ({ ...prev, details: [...(prev.details || []), newDetail] }));
  };

  const removeDetailRow = (index: number) => {
    setPair(prev => ({ ...prev, details: (pair.details || []).filter((_, i) => i !== index) }));
  };

  // --- IMAGE COMPRESSION LOGIC ---
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 600; 
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessingImage(true);
      try {
        const compressed = await compressImage(e.target.files[0]);
        setPair(prev => ({ ...prev, imageUrl: compressed }));
      } catch (err) {
        setError("Erro ao processar imagem.");
      } finally {
        setIsProcessingImage(false);
      }
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
        setError('Já existe un par com este nome.');
        return;
    }

    onSave(pair, originalName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex-shrink-0 flex justify-between items-center">
            <h3 className="text-xl font-bold text-teal-700">{isEditing ? 'Editar Par da Base Master' : 'Adicionar Novo Par Definitivo'}</h3>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-teal-200">
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Base Global</span>
                    <button 
                      type="button" 
                      onClick={toggleDefinitive}
                      className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${pair.isDefinitive ? 'bg-teal-600' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${pair.isDefinitive ? 'left-5' : 'left-0.5'}`}></div>
                    </button>
                </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="md:col-span-1">
                  <label htmlFor="name" className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Nome do Par</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={pair.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700"
                    placeholder="Ex: Timo - Reto"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="level" className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Classificação Técnica</label>
                  <select
                    id="level"
                    name="level"
                    value={pair.level}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700 cursor-pointer"
                    required
                  >
                    <option value={1}>Reservatórios</option>
                    <option value={2}>Nível I - Básico</option>
                    <option value={3}>Nível II - Específicos</option>
                    <option value={4}>Nível III - Patógenos Nome</option>
                  </select>
                </div>
                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 md:col-span-1">
                    <p className="text-[10px] text-teal-700 font-bold leading-snug">
                        {isProcessingImage ? 'Otimizando imagem...' : '* Fotos enviadas agora são otimizadas para economizar memória do navegador.'}
                    </p>
                </div>
            </div>

            <div className="border-b border-gray-200 flex-shrink-0">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-black text-xs uppercase tracking-widest focus:outline-none transition-colors ${
                    activeTab === 'basic'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Identificação e Imagem
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-black text-xs uppercase tracking-widest focus:outline-none transition-colors ${
                    activeTab === 'details'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Planilha de Dados Clínicos
                </button>
              </nav>
            </div>

            <div className="pt-2">
              {activeTab === 'basic' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="point1" className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Ponto 1 (Negativo)</label>
                          <input type="text" id="point1" name="point1" value={pair.point1} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium" placeholder="Ex: Timo" required />
                      </div>
                      <div>
                          <label htmlFor="point2" className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Ponto 2 (Positivo)</label>
                          <input type="text" id="point2" name="point2" value={pair.point2} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium" placeholder="Ex: Reto" required />
                      </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Imagem Técnica de Referência</label>
                    <div className="mt-2 flex items-center gap-4 p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      {pair.imageUrl ? (
                        <div className="relative">
                          <img src={pair.imageUrl} alt="Preview" className="w-32 h-32 rounded-xl object-cover shadow-xl border-4 border-white" />
                          <button type="button" onClick={removeImage} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-[10px] font-black uppercase text-center p-2 tracking-widest">
                          {isProcessingImage ? 'Otimizando...' : 'Sem Imagem'}
                        </div>
                      )}
                      <div className="flex-1">
                          <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer" />
                          <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase">PNG ou JPG. O sistema comprimirá fotos pesadas automaticamente para garantir a sincronia rápida.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="animate-fade-in space-y-4">
                  <div className="flex justify-between items-center bg-teal-50 p-4 rounded-xl border border-teal-100">
                      <div className="text-[11px] text-teal-800 font-bold uppercase tracking-tight">Conteúdo técnico disponível para todos os terapeutas.</div>
                      <button type="button" onClick={addDetailRow} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md text-white bg-teal-600 hover:bg-teal-700 transition-all">
                          <PlusIcon className="w-4 h-4" /> Adicionar Linha
                      </button>
                  </div>
                  
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3 border-r">Especificação</th>
                          <th className="px-3 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3 border-r">Doença/Disfunção</th>
                          <th className="px-3 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Sintomas e algumas dicas</th>
                          <th className="px-2 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {(pair.details || []).map((detail, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2 py-2 align-top">
                              <textarea name="specification" value={detail.specification} onChange={(e) => handleDetailChange(index, e)} rows={3} className="block w-full text-xs p-3 border-slate-200 rounded-xl shadow-inner focus:ring-teal-500 resize-none font-medium text-slate-700"></textarea>
                            </td>
                            <td className="px-2 py-2 align-top">
                              <textarea name="disease" value={detail.disease} onChange={(e) => handleDetailChange(index, e)} rows={3} className="block w-full text-xs p-3 border-slate-200 rounded-xl shadow-inner focus:ring-teal-500 resize-none font-medium text-slate-700"></textarea>
                            </td>
                            <td className="px-2 py-2 align-top">
                              <textarea name="symptoms" value={detail.symptoms} onChange={(e) => handleDetailChange(index, e)} rows={3} className="block w-full text-xs p-3 border-slate-200 rounded-xl shadow-inner focus:ring-teal-500 resize-none font-medium text-slate-700"></textarea>
                            </td>
                            <td className="px-2 py-2 align-middle text-center">
                              <button type="button" onClick={() => removeDetailRow(index)} className="text-slate-300 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-all">
                                <TrashIcon className="w-5 h-5"/>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 border-t bg-slate-50 flex justify-end space-x-3 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-8 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all font-black uppercase text-xs tracking-widest">Cancelar</button>
            <button type="submit" disabled={isProcessingImage} className="px-12 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-xl transition-all font-black uppercase text-xs tracking-widest disabled:bg-slate-300">
              {isProcessingImage ? 'Processando Imagem...' : 'Salvar na Base Master'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PairManagementModal;
