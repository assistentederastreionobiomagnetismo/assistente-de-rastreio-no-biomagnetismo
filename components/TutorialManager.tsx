import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Tutorial } from '../types';
import { TrashIcon, PlusIcon, PlayIcon, CheckIcon } from './icons/Icons';

const TutorialManager: React.FC = () => {
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [newTutorial, setNewTutorial] = useState<Partial<Tutorial>>({
        title: '',
        category: 'Início Rápido',
        videoUrl: '',
        description: '',
        displayOrder: 0
    });

    useEffect(() => {
        loadTutorials();
    }, []);

    const loadTutorials = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getTutorials();
            setTutorials(data);
        } catch (error) {
            console.error("Erro ao carregar tutoriais:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTutorial.title || !newTutorial.videoUrl) return;

        setIsSaving(true);
        try {
            const tutorialToSave: Tutorial = {
                id: Math.random().toString(36).substring(2, 15),
                title: newTutorial.title!,
                category: newTutorial.category || 'Geral',
                videoUrl: newTutorial.videoUrl!,
                description: newTutorial.description || '',
                displayOrder: tutorials.length,
                createdAt: new Date().toISOString()
            };

            await dbService.saveTutorial(tutorialToSave);
            setTutorials(prev => [...prev, tutorialToSave]);
            setNewTutorial({ title: '', category: 'Início Rápido', videoUrl: '', description: '', displayOrder: 0 });
            alert("Tutorial adicionado com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar tutorial:", error);
            alert("Erro ao salvar.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este tutorial?")) return;
        try {
            await dbService.deleteTutorial(id);
            setTutorials(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    };

    if (isLoading) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Carregando Gerenciador...</div>;

    return (
        <div className="space-y-10">
            {/* Form de Cadastro */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-teal-100 text-teal-600 rounded-2xl">
                        <PlusIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Adicionar Novo Treinamento</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Cadastre vídeos do YouTube ou Vimeo</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Vídeo</label>
                        <input
                            type="text"
                            required
                            value={newTutorial.title}
                            onChange={e => setNewTutorial({ ...newTutorial, title: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm"
                            placeholder="Ex: Como realizar o primeiro rastreio"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                        <select
                            value={newTutorial.category}
                            onChange={e => setNewTutorial({ ...newTutorial, category: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm"
                        >
                            <option value="Início Rápido">Início Rápido</option>
                            <option value="Protocolos">Protocolos</option>
                            <option value="Relatórios">Relatórios</option>
                            <option value="Gestão de Pacientes">Gestão de Pacientes</option>
                            <option value="Avançado">Avançado</option>
                        </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL do Vídeo (YouTube/Vimeo)</label>
                        <input
                            type="url"
                            required
                            value={newTutorial.videoUrl}
                            onChange={e => setNewTutorial({ ...newTutorial, videoUrl: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm"
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Breve Descrição</label>
                        <textarea
                            value={newTutorial.description}
                            onChange={e => setNewTutorial({ ...newTutorial, description: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm min-h-[100px]"
                            placeholder="O que o terapeuta vai aprender neste vídeo?"
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-10 py-4 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 uppercase text-xs tracking-widest flex items-center gap-3"
                        >
                            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckIcon className="w-5 h-5" />}
                            Salvar Tutorial
                        </button>
                    </div>
                </form>
            </div>

            {/* Lista de Tutoriais */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Tutoriais Ativos</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Gerencie a ordem e o conteúdo exibido</p>
                </div>

                <div className="divide-y divide-slate-100">
                    {tutorials.map(tutorial => (
                        <div key={tutorial.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 text-slate-400 rounded-xl">
                                    <PlayIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 uppercase text-xs">{tutorial.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded">{tutorial.category}</span>
                                        <span className="text-[9px] text-slate-400 font-medium truncate max-w-[200px]">{tutorial.videoUrl}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(tutorial.id!)}
                                className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {tutorials.length === 0 && (
                        <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                            Nenhum tutorial cadastrado ainda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TutorialManager;
