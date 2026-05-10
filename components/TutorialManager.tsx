import React, { useState, useEffect } from 'react';
import { Tutorial } from '../types';
import { dbService } from '../services/dbService';
import { PlusIcon, TrashIcon, ChevronLeftIcon, PlayIcon, InfoIcon } from './icons/Icons';

interface TutorialManagerProps {
    onBack: () => void;
}

const TutorialManager: React.FC<TutorialManagerProps> = ({ onBack }) => {
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    const [formData, setFormData] = useState<Tutorial>({
        title: '',
        category: '',
        videoUrl: '',
        description: '',
        displayOrder: 0
    });

    useEffect(() => {
        loadTutorials();
    }, []);

    const loadTutorials = async () => {
        try {
            const data = await dbService.getTutorials();
            setTutorials(data);
        } catch (error) {
            console.error("Erro ao carregar tutoriais:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.videoUrl || !formData.category) {
            alert("Preencha Título, Categoria e URL do Vídeo.");
            return;
        }

        try {
            setLoading(true);
            await dbService.saveTutorial(formData);
            await loadTutorials();
            setIsAdding(false);
            setFormData({ title: '', category: '', videoUrl: '', description: '', displayOrder: tutorials.length + 1 });
            alert("Aula salva com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar tutorial:", error);
            alert("Erro ao salvar tutorial.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir esta aula?")) return;
        try {
            await dbService.deleteTutorial(id);
            setTutorials(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Erro ao deletar:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-30 px-4 py-4 flex items-center justify-between">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Gerenciar Tutoriais</h2>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    <PlusIcon className="w-5 h-5" />
                    {isAdding ? "Cancelar" : "Nova Aula"}
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-6">
                {isAdding && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 mb-8 animate-in slide-in-from-top duration-300">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <PlusIcon className="w-5 h-5 text-blue-600" />
                            Cadastrar Nova Aula
                        </h3>
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Título da Aula</label>
                                <input 
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    placeholder="Ex: Como realizar o primeiro rastreio"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                                <input 
                                    type="text"
                                    list="categories"
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    placeholder="Ex: Primeiros Passos"
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                />
                                <datalist id="categories">
                                    {Array.from(new Set(tutorials.map(t => t.category))).map(cat => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">URL do YouTube</label>
                                <input 
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={formData.videoUrl}
                                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição Curta (Opcional)</label>
                                <textarea 
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none h-24"
                                    placeholder="O que o usuário aprenderá nesta aula?"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ordem de Exibição</label>
                                <input 
                                    type="number"
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    value={formData.displayOrder}
                                    onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t">
                                <button 
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                >
                                    Descartar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                >
                                    Salvar Aula
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 text-lg">Aulas Publicadas</h3>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                            {tutorials.length} Total
                        </span>
                    </div>

                    <div className="divide-y">
                        {tutorials.length === 0 ? (
                            <div className="p-12 text-center">
                                <InfoIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhuma aula cadastrada ainda.</p>
                            </div>
                        ) : (
                            tutorials.map(tutorial => (
                                <div key={tutorial.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="w-24 aspect-video bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative group">
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <PlayIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <img 
                                            src={`https://img.youtube.com/vi/${tutorial.videoUrl.split('v=')[1]?.split('&')[0] || tutorial.videoUrl.split('/').pop()}/mqdefault.jpg`}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 truncate">{tutorial.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">
                                                {tutorial.category}
                                            </span>
                                            <span className="text-xs text-gray-400">Ordem: {tutorial.displayOrder}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(tutorial.id!)}
                                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialManager;
