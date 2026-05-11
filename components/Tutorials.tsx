import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Tutorial } from '../types';
import { PlayIcon, MagnetIcon, ChevronLeftIcon } from './icons/Icons';

interface TutorialsProps {
    onBack: () => void;
}

const Tutorials: React.FC<TutorialsProps> = ({ onBack }) => {
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

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
            setIsLoading(false);
        }
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (isLoading) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Carregando Treinamentos...</div>;

    const categories = Array.from(new Set(tutorials.map(t => t.category)));

    return (
        <div className="animate-fade-in space-y-10 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase leading-none">Treinamentos</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Domine o Assistente de Biomagnetismo.</p>
                    </div>
                </div>
                <div className="hidden md:block p-4 bg-teal-50 text-teal-600 rounded-2xl">
                    <PlayIcon className="w-8 h-8" />
                </div>
            </div>

            {tutorials.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
                    <MagnetIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Nenhum tutorial disponível no momento.</p>
                </div>
            ) : (
                categories.map(category => (
                    <div key={category} className="space-y-6">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-3">
                            <span className="w-8 h-px bg-slate-200"></span>
                            {category}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {tutorials.filter(t => t.category === category).map(tutorial => (
                                <div key={tutorial.id} className="bg-white rounded-[32px] shadow-lg border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col">
                                    {/* Video Placeholder/Thumbnail */}
                                    <div 
                                        className="aspect-video bg-slate-900 relative cursor-pointer overflow-hidden"
                                        onClick={() => setSelectedVideo(tutorial.videoUrl)}
                                    >
                                        <div className="absolute inset-0 bg-teal-600/20 group-hover:bg-teal-600/0 transition-all z-10" />
                                        <div className="absolute inset-0 flex items-center justify-center z-20 group-hover:scale-110 transition-transform duration-500">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white ring-4 ring-white/30">
                                                <PlayIcon className="w-8 h-8 fill-current" />
                                            </div>
                                        </div>
                                        <img 
                                            src={`https://img.youtube.com/vi/${getYoutubeId(tutorial.videoUrl)}/maxresdefault.jpg`} 
                                            className="w-full h-full object-cover opacity-60"
                                            alt={tutorial.title}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop";
                                            }}
                                        />
                                    </div>

                                    <div className="p-6 flex-grow flex flex-col">
                                        <h4 className="text-lg font-black text-slate-800 leading-tight mb-2 uppercase tracking-tight">{tutorial.title}</h4>
                                        <p className="text-slate-500 text-[11px] font-medium line-clamp-3 mb-6 flex-grow leading-relaxed">{tutorial.description || 'Assista a este treinamento para aprender mais sobre este módulo.'}</p>
                                        <button 
                                            onClick={() => setSelectedVideo(tutorial.videoUrl)}
                                            className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-teal-600 hover:text-white transition-all uppercase text-[10px] tracking-widest"
                                        >
                                            Assistir Aula
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Modal de Vídeo */}
            {selectedVideo && (
                <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
                    <div className="max-w-5xl w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative animate-scale-in" onClick={e => e.stopPropagation()}>
                        <button 
                            className="absolute top-4 right-4 z-30 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                            onClick={() => setSelectedVideo(null)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <iframe 
                            src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo)}?autoplay=1`}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tutorials;
