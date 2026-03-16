import React, { useEffect } from 'react';
import { EmotionRelease, SensationRelease } from '../types';

interface EmocionalProps {
  selectedEmotions: string[];
  setSelectedEmotions: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSensations: string[];
  setSelectedSensations: React.Dispatch<React.SetStateAction<string[]>>;
  emotionsData: EmotionRelease[];
  setEmotionsData: React.Dispatch<React.SetStateAction<EmotionRelease[]>>;
  sensationsData: SensationRelease[];
  setSensationsData: React.Dispatch<React.SetStateAction<SensationRelease[]>>;
  emotionsNotes: string;
  setEmotionsNotes: React.Dispatch<React.SetStateAction<string>>;
  sensationsNotes: string;
  setSensationsNotes: React.Dispatch<React.SetStateAction<string>>;
  onNext: () => void;
  onBack: () => void;
  patientName: string;
}

const EMOTIONS_CHART = [
  {
    fila: "FILA 1 Coração ou intestino delgado",
    colA: ["Abandono", "Traição", "Desamparo", "Sentir-se perdido", "O amor não recebido"],
    colB: ["Esforço não reconhecido", "Angústia", "Insegurança", "Euforia", "Vulnerabilidade"]
  },
  {
    fila: "FILA 2 Baço ou estômago",
    colA: ["Ansiedade", "Desespero", "Repulsão", "Nervosismo"],
    colB: ["Fracasso", "Impotência", "Desesperança", "Falta de Controle"]
  },
  {
    fila: "FILA 3 Pulmão ou cólon",
    colA: ["Pranto (choro interno)", "Desânimo", "Rejeição", "Tristeza", "Pesar"],
    colB: ["Confusão", "Estar na defensiva", "Sofrimento", "Auto-punição (sente-se culpado)", "Não aceita NÃO como resposta"]
  },
  {
    fila: "FILA 4 Fígado ou vesícula",
    colA: ["Ira", "Amargura", "Culpa (sentir-se culpado)", "Ódio", "Ressentimento"],
    colB: ["Depressão", "Frustração", "Indecisão", "Pânico", "Falta de reconhecimento"]
  },
  {
    fila: "FILA 5 Rins ou bexiga",
    colA: ["Vitimização (Se fazer de vítima)", "Terror-Pavor", "Medo", "Horror", "Irritação"],
    colB: ["Conflito", "Insegurança criativa", "Terror", "Falta de Apoio", "Falta de Personalidade"]
  },
  {
    fila: "FILA 6 Glândulas e órgãos sexuais",
    colA: ["Humilhação", "Ciúme", "Anseio (Forte desejo)", "Luxúria", "Sobrecarga (Sentir-se pressionado)"],
    colB: ["Orgulho", "Vergonha", "Choque", "Indignidade", "Desprezo"]
  }
];

const SENSATIONS_MAIN = [
  "Abandono", "Agressão", "Amor difícil", "Angústia", "Quase morto", "Desvalorização", "Desvalorização Estética", "Frustração", "Fome", "Humilhação/Vergonha", "Impotência", "Infelicidade", "Insatisfação", "Ira", "Perseguição", "Saudade", "Suicídio", "Traição", "Vazio", "Vulnerabilidade"
];

const SENSATIONS_COMP_A = [
  "Estagnação", "Agitação", "Esgotamento", "Agressividade", "Altivez", "Alucinação", "Anorgasmia", "Ansiedade", "Anêmico", "Caprichoso", "Consumição", "Ciúmes", "Covardia", "Confusão", "Enfraquecimento", "Depressão", "Falta de amor", "Desconfiança", "Insatisfação", "Decepção", "Dor Moral", "Egoísmo", "Exigência", "Animação"
];

const SENSATIONS_COMP_B = [
  "Frenesi", "Impaciência", "Indecisão", "Indiferença", "Indolência", "Inexistência", "Preocupação", "Insatisfação", "Intolerância", "Iracibilidade", "Irritabilidade", "Choro", "Preguiça", "Possessão", "Estar prisioneiro", "Proibição", "Sentindo-se doente", "Sensível", "Assustado", "Assustar", "Terror", "Timidez", "Cansaço", "Violência"
];

const Emocional: React.FC<EmocionalProps> = ({ 
    selectedEmotions, setSelectedEmotions, 
    selectedSensations, setSelectedSensations, 
    emotionsData, setEmotionsData,
    sensationsData, setSensationsData,
    emotionsNotes, setEmotionsNotes,
    sensationsNotes, setSensationsNotes,
    onNext, onBack, patientName
}) => {
  
  const generateEmotionCommand = (name: string, age?: string, context?: string, physicalSensation?: string) => {
    const agePart = age ? ` aos ${age} anos de idade` : '';
    const contextPart = context ? `, relacionado a ${context}` : '';
    const sensationPart = physicalSensation ? `. Sensação física associada: ${physicalSensation}.` : '';
    const info = `${name}${agePart}${contextPart}${sensationPart}`;
    
    return `Todos os pontos anatômicos, orgânicos, sistêmicos, que carreguem informação, presença, frequência e ressonância da(s) emoção(ões) ${info}, Façam-se presente (falar 3x). Alinhem-se, equilibrem-se, entreguem-se (3x) com a carga magnética de 1 bilhão de Gauss ou quanto se faz necessário. Enviando agora essa(s) emoção(ões) para os buracos negros do universo. Fechando esses portais.`;
  };

  const generateSensationCommand = (name: string, location?: string, intensity?: number, situation?: string) => {
    const locationPart = location ? ` na região de ${location}` : '';
    const intensityPart = intensity !== undefined ? `, com intensidade aproximada ${intensity}/10` : '';
    const situationPart = situation ? `, mais presente quando ${situation}` : '';
    const info = `${name}${locationPart}${intensityPart}${situationPart}`;

    return `Todos os pontos anatômicos, orgânicos, sistêmicos, que carreguem informação, presença, frequência e ressonância da(s) sensação(ões) ${info}, Façam-se presente (falar 3x). Alinhem-se, equilibrem-se, entreguem-se (3x) com a carga magnética de 1 bilhão de Gauss ou quanto se faz necessário. Enviando agora essa(s) sensação(ões) para os buracos negros do universo. Fechando esses portais.`;
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => {
      const isSelecting = !prev.includes(emotion);
      if (isSelecting) {
        setEmotionsData(curr => [...curr, { name: emotion, command: generateEmotionCommand(emotion) }]);
        return [...prev, emotion];
      } else {
        setEmotionsData(curr => curr.filter(e => e.name !== emotion));
        return prev.filter(e => e !== emotion);
      }
    });
  };

  const toggleSensation = (sensation: string) => {
    setSelectedSensations(prev => {
      const isSelecting = !prev.includes(sensation);
      if (isSelecting) {
        setSensationsData(curr => [...curr, { name: sensation, intensity: 5, description: generateSensationCommand(sensation, '', 5) }]);
        return [...prev, sensation];
      } else {
        setSensationsData(curr => curr.filter(s => s.name !== sensation));
        return prev.filter(s => s !== sensation);
      }
    });
  };

  const updateEmotionField = (emotionName: string, field: keyof EmotionRelease, value: string) => {
    setEmotionsData(curr => curr.map(e => {
      if (e.name === emotionName) {
        const updated = { ...e, [field]: value };
        if (field !== 'command') {
          updated.command = generateEmotionCommand(updated.name, updated.age, updated.context, updated.physicalSensation);
        }
        return updated;
      }
      return e;
    }));
  };

  const updateSensationField = (sensationName: string, field: keyof SensationRelease, value: string | number) => {
    setSensationsData(curr => curr.map(s => {
      if (s.name === sensationName) {
        const updated = { ...s, [field]: value };
        if (field !== 'description') {
          updated.description = generateSensationCommand(updated.name, updated.location, updated.intensity, updated.situation);
        }
        return updated;
      }
      return s;
    }));
  };

  return (
    <div className="animate-fade-in space-y-12 pb-10">
      {/* SEÇÃO 1: EMOÇÕES */}
      <section className="space-y-6">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-700 uppercase tracking-wide border-b-2 border-teal-500 inline-block pb-1">QUADRO DAS EMOÇÕES OU MUROS DE CORAÇÃO</h2>
            <p className="mt-4 text-red-500 font-bold text-sm italic">
                Pergunta: Organismo, existe alguma emoção represada ou muro de coração que tenha causa ou efeito à sua queixa do dia, em que eu possa liberar hoje? Quantas?
            </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="flex-1 overflow-x-auto shadow-md border rounded-xl">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 bg-slate-100 border-r w-32"></th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-teal-600 uppercase border-r">COLUNA A</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-teal-600 uppercase">COLUNA B</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {EMOTIONS_CHART.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 bg-slate-50 text-[10px] font-bold text-red-700 uppercase leading-tight border-r">
                                    {row.fila}
                                </td>
                                <td className="px-4 py-2 border-r align-top">
                                    <div className="space-y-1">
                                        {row.colA.map(e => (
                                            <label key={e} className="flex items-center group cursor-pointer">
                                                <input type="checkbox" checked={selectedEmotions.includes(e)} onChange={() => toggleEmotion(e)} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
                                                <span className={`ml-3 text-xs ${selectedEmotions.includes(e) ? 'font-bold text-teal-800' : 'text-slate-600'} group-hover:text-teal-500 transition-all`}>{e}</span>
                                            </label>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-2 align-top">
                                    <div className="space-y-1">
                                        {row.colB.map(e => (
                                            <label key={e} className="flex items-center group cursor-pointer">
                                                <input type="checkbox" checked={selectedEmotions.includes(e)} onChange={() => toggleEmotion(e)} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
                                                <span className={`ml-3 text-xs ${selectedEmotions.includes(e) ? 'font-bold text-teal-800' : 'text-slate-600'} group-hover:text-teal-500 transition-all`}>{e}</span>
                                            </label>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>

        {/* Blocos de Identificação do Gatilho Emocional */}
        {emotionsData.length > 0 && (
          <div className="space-y-6 mt-8">
            <h3 className="text-lg font-bold text-teal-700 uppercase tracking-tight border-l-4 border-teal-500 pl-3">Identificação do Gatilho Emocional</h3>
            <div className="grid grid-cols-1 gap-6">
              {emotionsData.map((emo, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-white bg-teal-500 px-3 py-1 rounded-full uppercase">{emo.name}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Campos de Identificação */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">E1 — Emoção identificada</label>
                        <input 
                          type="text" 
                          value={emo.name} 
                          onChange={(e) => updateEmotionField(emo.name, 'name', e.target.value)}
                          className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">E2 — Idade aproximada</label>
                          <input 
                            type="text" 
                            value={emo.age || ''} 
                            onChange={(e) => updateEmotionField(emo.name, 'age', e.target.value)}
                            placeholder="Ex: 8"
                            className="w-full text-sm p-2 border border-slate-200 rounded focus:ring-1 focus:ring-teal-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">E4 — Sensação física (opcional)</label>
                          <input 
                            type="text" 
                            value={emo.physicalSensation || ''} 
                            onChange={(e) => updateEmotionField(emo.name, 'physicalSensation', e.target.value)}
                            placeholder="Ex: Aperto no peito"
                            className="w-full text-sm p-2 border border-slate-200 rounded focus:ring-1 focus:ring-teal-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">E3 — Contexto ou situação associada</label>
                        <input 
                          type="text" 
                          value={emo.context || ''} 
                          onChange={(e) => updateEmotionField(emo.name, 'context', e.target.value)}
                          placeholder="Ex: Separação dos pais"
                          className="w-full text-sm p-2 border border-slate-200 rounded focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Comando de Liberação */}
                    <div className="h-full flex flex-col">
                      <p className="text-xs font-bold text-teal-700 uppercase mb-2">Comando de Liberação (Emoção):</p>
                      <textarea 
                        value={emo.command || ''} 
                        onChange={(e) => updateEmotionField(emo.name, 'command', e.target.value)}
                        className="w-full flex-grow text-xs p-3 bg-teal-50 border border-teal-100 rounded-lg text-slate-700 italic outline-none focus:ring-1 focus:ring-teal-500 min-h-[150px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anotações de Emoções */}
        <div className="mt-4">
            <label htmlFor="emotionsNotes" className="block text-sm font-bold text-teal-700 mb-2 uppercase tracking-tight">Anotações do Quadro de Emoções</label>
            <textarea 
                id="emotionsNotes"
                value={emotionsNotes}
                onChange={(e) => setEmotionsNotes(e.target.value)}
                placeholder="Registre aqui observações específicas sobre as emoções liberadas..."
                rows={3}
                className="w-full p-3 bg-teal-25 border border-teal-100 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
            ></textarea>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* SEÇÃO 2: SENSAÇÕES */}
      <section className="space-y-6">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-700 uppercase tracking-wide border-b-2 border-orange-400 inline-block pb-1">QUADRO DAS SENSAÇÕES PRIMORDIAIS</h2>
            <p className="mt-4 text-red-500 font-bold text-sm italic">
                Pergunta: Existe alguma sensação primordial que alimenta a queixa do dia? Quantas?
            </p>
        </div>

        <div className="flex flex-col gap-8 items-stretch">
            <div className="grid grid-cols-1 md:grid-cols-2 shadow-md border rounded-xl overflow-hidden bg-white">
                {/* Principais */}
                <div className="border-r border-slate-200">
                    <div className="bg-orange-50 p-3 text-center border-b font-bold text-xs uppercase text-orange-800 tracking-wider">SENSAÇÕES PRINCIPAIS (MEMÓRIAS)</div>
                    <div className="p-4 space-y-1">
                        {SENSATIONS_MAIN.map((s, idx) => (
                            <label key={s} className="flex items-center group cursor-pointer hover:bg-orange-25 p-1 rounded transition-colors">
                                <span className="w-6 text-[10px] text-slate-300 font-mono">{idx + 1}</span>
                                <input type="checkbox" checked={selectedSensations.includes(s)} onChange={() => toggleSensation(s)} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400" />
                                <span className={`ml-3 text-xs ${selectedSensations.includes(s) ? 'font-bold text-orange-700' : 'text-slate-600'} group-hover:text-orange-600`}>{s}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Complementares */}
                <div>
                    <div className="bg-orange-50 p-3 text-center border-b font-bold text-xs uppercase text-orange-800 tracking-wider">COMPLEMENTARES OU SECUNDÁRIAS</div>
                    <div className="grid grid-cols-2 p-3 gap-x-2">
                        <div className="space-y-1">
                            {SENSATIONS_COMP_A.map((s, idx) => (
                                <label key={s} className="flex items-center group cursor-pointer hover:bg-orange-25 p-1 rounded transition-colors">
                                    <span className="w-5 text-[9px] text-slate-300 font-mono">{idx + 1}</span>
                                    <input type="checkbox" checked={selectedSensations.includes(s)} onChange={() => toggleSensation(s)} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400" />
                                    <span className={`ml-2 text-[10px] truncate ${selectedSensations.includes(s) ? 'font-bold text-orange-700' : 'text-slate-600'}`}>{s}</span>
                                </label>
                            ))}
                        </div>
                        <div className="space-y-1">
                            {SENSATIONS_COMP_B.map((s, idx) => (
                                <label key={s} className="flex items-center group cursor-pointer hover:bg-orange-25 p-1 rounded transition-colors">
                                    <span className="w-5 text-[9px] text-slate-300 font-mono">{idx + 25}</span>
                                    <input type="checkbox" checked={selectedSensations.includes(s)} onChange={() => toggleSensation(s)} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400" />
                                    <span className={`ml-2 text-[10px] truncate ${selectedSensations.includes(s) ? 'font-bold text-orange-700' : 'text-slate-600'}`}>{s}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Blocos de Detalhamento da Sensação */}
        {sensationsData.length > 0 && (
          <div className="space-y-6 mt-8">
            <h3 className="text-lg font-bold text-orange-700 uppercase tracking-tight border-l-4 border-orange-400 pl-3">Detalhamento da Sensação</h3>
            <div className="grid grid-cols-1 gap-6">
              {sensationsData.map((sens, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-white bg-orange-400 px-3 py-1 rounded-full uppercase">{sens.name}</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Campos de Identificação */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">S1 — Sensação identificada</label>
                          <input 
                            type="text" 
                            value={sens.name} 
                            onChange={(e) => updateSensationField(sens.name, 'name', e.target.value)}
                            className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-orange-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">S2 — Sensação física (opcional)</label>
                          <input 
                            type="text" 
                            value={sens.location || ''} 
                            onChange={(e) => updateSensationField(sens.name, 'location', e.target.value)}
                            placeholder="Ex: Aperto no peito, Frio na barriga"
                            className="w-full text-sm p-2 border border-slate-200 rounded focus:ring-1 focus:ring-orange-500 outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">S3 — Intensidade (0–10): <span className="text-orange-600 font-black">{sens.intensity}</span></label>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          value={sens.intensity || 0} 
                          onChange={(e) => updateSensationField(sens.name, 'intensity', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">S4 — Situação de Gatilho</label>
                        <input 
                          type="text" 
                          value={sens.situation || ''} 
                          onChange={(e) => updateSensationField(sens.name, 'situation', e.target.value)}
                          placeholder="Ex: Quando pensa no trabalho"
                          className="w-full text-sm p-2 border border-slate-200 rounded focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Descrição da Sensação */}
                    <div className="h-full flex flex-col">
                      <p className="text-xs font-bold text-orange-800 uppercase mb-2">Descrição da Sensação:</p>
                      <textarea 
                        value={sens.description || ''} 
                        onChange={(e) => updateSensationField(sens.name, 'description', e.target.value)}
                        className="w-full flex-grow text-xs p-3 bg-orange-50 border border-orange-100 rounded-lg text-slate-700 italic outline-none focus:ring-1 focus:ring-orange-500 min-h-[150px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anotações de Sensações */}
        <div className="mt-4">
            <label htmlFor="sensationsNotes" className="block text-sm font-bold text-orange-800 mb-2 uppercase tracking-tight">Anotações do Quadro de Sensações</label>
            <textarea 
                id="sensationsNotes"
                value={sensationsNotes}
                onChange={(e) => setSensationsNotes(e.target.value)}
                placeholder="Registre aqui observações específicas sobre as sensações primordiais..."
                rows={3}
                className="w-full p-3 bg-orange-25 border border-orange-100 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none"
            ></textarea>
        </div>
      </section>

      <div className="flex justify-between pt-8 border-t">
        <button onClick={onBack} className="px-8 py-2 border border-slate-300 rounded-md text-slate-600 font-bold hover:bg-slate-50 transition-all">Voltar</button>
        <button onClick={onNext} className="px-10 py-2 bg-teal-600 text-white rounded-md font-bold hover:bg-teal-700 shadow-lg transition-all">Próximo</button>
      </div>
    </div>
  );
};

export default Emocional;
