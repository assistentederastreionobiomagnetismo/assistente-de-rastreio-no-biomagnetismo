
import React, { useState, useMemo } from 'react';
import { BiomagneticPair } from '../types';
import { POINT_DEFINITIONS } from '../pointCoordinates';
import { ANATOMY_IMAGES } from './AnatomyImages';

interface AnatomyViewerProps {
  pair: BiomagneticPair;
}

interface Point {
    x: number;
    y: number;
    view: 'front' | 'back';
    color: string;
    label: string;
}

const AnatomyViewer: React.FC<AnatomyViewerProps> = ({ pair }) => {
    const [gender, setGender] = useState<'female' | 'male'>('female');
    const [view, setView] = useState<'front' | 'back'>('front');

    const pointsToDraw = useMemo<Point[]>(() => {
        const points: Point[] = [];
        const p1_def = POINT_DEFINITIONS[pair.point1];
        const p2_def = POINT_DEFINITIONS[pair.point2];

        if (pair.name === 'Nervo Vago - Rim Contralateral') {
            const nvDef = { x: 46, y: 35 };
            points.push({ ...POINT_DEFINITIONS['Nervo Vago'], ...nvDef, color: '#4A5568', label: 'N. Vago Esq.' });
            points.push({ ...POINT_DEFINITIONS['Rim Direito'], color: '#A0AEC0', label: 'Rim Dir.' });
            points.push({ ...POINT_DEFINITIONS['Nervo Vago'], x: 54, y: 35, color: '#4A5568', label: 'N. Vago Dir.' });
            points.push({ ...POINT_DEFINITIONS['Rim Esquerdo'], color: '#A0AEC0', label: 'Rim Esq.' });
        } else if (pair.point1 === pair.point2 && p1_def && p1_def.offset) {
            points.push({ x: p1_def.x - p1_def.offset, y: p1_def.y, view: p1_def.view, color: 'black', label: pair.point1 });
            points.push({ x: p1_def.x + p1_def.offset, y: p1_def.y, view: p1_def.view, color: '#e53e3e', label: pair.point2 });
        } else {
            if (p1_def) points.push({ ...p1_def, color: 'black', label: pair.point1 });
            if (p2_def) points.push({ ...p2_def, color: '#e53e3e', label: pair.point2 });
        }
        return points;
    }, [pair]);

    const imageHref = ANATOMY_IMAGES[gender][view];
    const visiblePoints = pointsToDraw.filter(p => p.view === view);

    return (
        <div className="flex flex-col items-center">
             <div className="w-full p-2 bg-slate-100 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setGender('female')} className={`px-3 py-1 text-sm rounded-md transition-colors ${gender === 'female' ? 'bg-teal-600 text-white' : 'bg-white hover:bg-slate-200'}`}>Feminino</button>
                    <button onClick={() => setGender('male')} className={`px-3 py-1 text-sm rounded-md transition-colors ${gender === 'male' ? 'bg-teal-600 text-white' : 'bg-white hover:bg-slate-200'}`}>Masculino</button>
                    <button onClick={() => setView('front')} className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'front' ? 'bg-teal-600 text-white' : 'bg-white hover:bg-slate-200'}`}>Frente</button>
                    <button onClick={() => setView('back')} className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'back' ? 'bg-teal-600 text-white' : 'bg-white hover:bg-slate-200'}`}>Costas</button>
                </div>
            </div>

            <div className="relative w-full max-w-[250px] bg-white rounded-lg aspect-[100/160]">
                <svg viewBox="0 0 100 160" className="w-full h-full">
                    <image href={imageHref} x="0" y="0" width="100" height="160" preserveAspectRatio="xMidYMid slice" />
                    {visiblePoints.map((p, i) => (
                        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
                            <circle r="3.5" fill={p.color} stroke="white" strokeWidth="0.5" opacity="0.9" />
                            <text
                                y="1.5"
                                fontSize="4"
                                textAnchor="middle"
                                fill="white"
                                fontWeight="bold"
                                style={{ pointerEvents: 'none' }}
                            >
                                {p.color === 'black' ? 'N' : 'P'}
                            </text>
                            <title>{p.label}</title>
                        </g>
                    ))}
                </svg>
            </div>
             <div className="mt-4 text-xs text-slate-600 w-full">
                <ul className="space-y-1">
                    {pointsToDraw.map((p, i) => (
                        <li key={i} className="flex items-center">
                            <span className="w-4 h-4 rounded-full mr-2 flex items-center justify-center" style={{ backgroundColor: p.color }}>
                                <span className="text-white font-bold text-[8px]">{p.color === 'black' ? 'N' : 'P'}</span>
                            </span>
                            <span>{p.label} ({p.view === 'front' ? 'Frente' : 'Costas'})</span>
                        </li>
                    ))}
                </ul>
             </div>
        </div>
    );
};

export default AnatomyViewer;
