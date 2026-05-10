import React, { useState, useEffect } from 'react';
import { Tutorial } from '../types';
import { dbService } from '../services/dbService';
import { PlayIcon, ChevronLeftIcon, XIcon } from './icons/Icons';

interface TutorialsProps {
    onBack: () => void;
}

const Tutorials: React.FC<TutorialsProps> = ({ onBack }) => {
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('Todos');

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

    const categories = ['Todos', ...Array.from(new Set(tutorials.map(t => t.category)))];

    const filteredTutorials = activeCategory === 'Todos'
        ? tutorials
        : tutorials.filter(t => t.category === activeCategory);

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-30 px-4 py-4 flex items-center justify-between">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Centro de Treinamento</h2>
                <div className="w-10"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-6">
                {/* Categorias */}
                <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                                activeCategory === cat
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-500">Carregando aulas...</p>
                    </div>
                ) : filteredTutorials.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <PlayIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum tutorial encontrado nesta categoria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {filteredTutorials.map(tutorial => (
                            <div 
                                key={tutorial.id}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                                onClick={() => setSelectedVideo(tutorial.videoUrl)}
                            >
                                <div className="relative aspect-video bg-gray-900">
                                    <img 
                                        src={`https://img.youtube.com/vi/${getYoutubeId(tutorial.videoUrl)}/mqdefault.jpg`}
                                        alt={tutorial.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                            <PlayIcon className="w-8 h-8 text-blue-600 ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 left-3">
                                        <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded uppercase tracking-wider">
                                            {tutorial.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {tutorial.title}
                                    </h3>
                                    {tutorial.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {tutorial.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Player */}
            {selectedVideo && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <button 
                        onClick={() => setSelectedVideo(null)}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                    >
                        <XIcon className="w-8 h-8" />
                    </button>
                    
                    <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo)}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tutorials;
