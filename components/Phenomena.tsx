
import React from 'react';
import { PhenomenaData } from '../types';

interface PhenomenaProps {
  data: PhenomenaData;
  setData: React.Dispatch<React.SetStateAction<PhenomenaData>>;
  onNext: () => void;
  onBack: () => void;
}

const Phenomena: React.FC<PhenomenaProps> = ({ data, setData, onNext, onBack }) => {
  
  const toggleItem = (category: keyof PhenomenaData, item: string) => {
    setData(prev => {
      const current = prev[category] as string[];
      if (current.includes(item)) {
        return { ...prev, [category]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [category]: [...current, item] };
      }
    });
  };

  const chakras = ["Básico", "Umbilical", "Plexo Solar", "Cardíaco", "Laríngeo", "Frontal", "Coronário", "Bulbo Raquídeo", "Colon Terminal"];
  const vascular = ["Edemas", "Aneurismas", "Hemorragias", "Coágulos", "Hematomas", "Fibroses", "Espasmos", "Envenenamento", "Trombo"];
  
  const portalPairsList = [
    { p1: "Apêndice", l1: "Lado D do abdomen, próximo ao cólon ascendente", p2: "Músculo Psoas", l2: "Sai da lombar até a região pélvica" },
    { p1: "Pênis", l1: "Região Pélvica", p2: "Pênis", l2: "Região Pélvica" },
    { p1: "Arco do pé (D/E)", l1: "Sola do pé", p2: "Calcanhar", l2: "Final do pé" },
    { p1: "Coração", l1: "Tórax à esquerda", p2: "Coração", l2: "Tórax à esquerda" },
    { p1: "Apêndice", l1: "Lado D do abdomen, próximo ao cólon ascendente", p2: "Triângulo Escarpa (D/E)", l2: "Região do nervo inguinal" },
    { p1: "Boca", l1: "Meio da boca", p2: "Coração", l2: "Tórax à esquerda" },
    { p1: "Ânus", l1: "Parte traseira abaixo do cóccix", p2: "Vagina", l2: "Região Pélvica" }
  ];

  const tumoralPhenomena = [
    { name: "EXSUDADOS", formula: "B ou F ou P", desc: "Elementos extravasados em um processo inflamatório – externo – Muco / Líquido / Inflamação" },
    { name: "INFILTRADOS", formula: "V + V", desc: "Elementos extravasados em um processo inflamatório – interno (pulmão, ossos, coração) – Pus / Inflamação" },
    { name: "CISTOS, QUISTOS OU PÓLIPOS", formula: "V + B ou F", desc: "Seguem sendo líquidos (bolsas de água hipogênicas – densidade baixa)" },
    { name: "ABCESSOS", formula: "B + B", desc: "98% confundido com Câncer (bolsa de pus – alta densidade – hiperecogênicas). Diafragmas, pregas inguinais." },
    { name: "DISPLASIA", formula: "B + B + V", desc: "Ex. Celulite – Aumento exagerado do tamanho celular sem perder sua morfologia e função." },
    { name: "NEOPLASIA BENIGNA (Lenta)", formula: "B + B + B + V", desc: "Falso Câncer, com crescimento lento devido à ausência de fungos." },
    { name: "NEOPLASIA BENIGNA (Rápida)", formula: "B + B + B + V + F", desc: "Falso Câncer, com crescimento RÁPIDO devido à presença de fungos." },
    { name: "CÂNCER VERDADEIRO", formula: "B + B + V + F + M. leprae", desc: "Desenvolvimento de neoplasia maligna." },
    { name: "METÁSTASES", formula: "B + B + V + F + M. leprae + Clostridium ou Pseudomona", desc: "Focos ocorrem em locais não específicos." },
    { name: "NECROSES", formula: "B + B + V + F + M. leprae + Parasita", desc: "Degeneração total de tecidos." },
    { name: "CÂNCER COMPLICADO", formula: "Todos + Iatrogenia (ato médico)", desc: "Erros de diagnóstico / medicação." },
    { name: "CÂNCER INCURÁVEL", formula: "Todos + Emocional", desc: "Desinformação ou Desânimo." },
    { name: "FALSO CÂNCER", formula: "Diagnóstico de Câncer, porém, sem a Mycobacterium leprae.", desc: "" }
  ];

  const genesis = [
    { name: "Intracreneal", pair: "Occiptal - Rim mesmo lado" },
    { name: "Intraraquídeo", pair: "Coluna (buscar qual) e Rim que organismo escolher" },
    { name: "Mediastinal", pair: "Mediastino Sup-Med-Inf e Rim que organismo escolher" },
    { name: "Diafragmático", pair: "Diafragma D-E e Rim mesmo lado" },
    { name: "Cintura para baixo (Direita)", pair: "Prega Inguinal Direita - Rim Direito" },
    { name: "Cintura para baixo (Esquerda)", pair: "Prega Inguinal Esquerda - Rim Esquerdo" }
  ];

  return (
    <div className="animate-fade-in space-y-10 pb-10">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-700">Fenômenos Bioenergéticos</h2>
        <p className="text-slate-500">Perguntar se existe algum fenômeno conforme as tabelas a seguir.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bioquímica e Vasculares */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-red-50 p-4 border-b border-red-100">
            <h3 className="text-red-700 font-bold uppercase text-sm tracking-wider">Bioquímica e Vasculares</h3>
          </div>
          <div className="p-4 space-y-4 flex-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-red-100">
              <div className="ml-1">
                <span className="font-bold text-slate-700 block text-sm">Alteração Bioquímica?</span>
                <p className="text-xs text-red-600 font-bold mt-1">Colocar cadeia pancreática (- + - +)</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Acidentes Vasculares</h4>
              <div className="grid grid-cols-1 gap-1">
                {vascular.map(v => (
                  <label key={v} className="flex items-center text-xs p-1.5 hover:bg-slate-100 rounded cursor-pointer transition-colors group">
                    <input 
                      type="checkbox" 
                      checked={data.vascularAccidents.includes(v)} 
                      onChange={() => toggleItem('vascularAccidents', v)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500" 
                    />
                    <span className="ml-3 text-slate-700 group-hover:text-red-700 transition-colors">{v}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chakras */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-purple-50 p-4 border-b border-purple-100">
            <h3 className="text-purple-700 font-bold uppercase text-sm tracking-wider">Chakras</h3>
          </div>
          <div className="p-4 bg-slate-50 flex-1">
            <div className="grid grid-cols-1 gap-2">
              {chakras.map(c => (
                <div key={c} className="flex items-center p-2 bg-white rounded-lg border border-purple-100 text-sm font-medium text-slate-700">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mr-3"></div>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gênesis do Fenômeno Tumoral */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-teal-50 p-4 border-b border-teal-100">
            <h3 className="text-teal-700 font-bold uppercase text-sm tracking-wider">Gênesis Tumoral</h3>
          </div>
          <div className="p-4 space-y-3">
            {genesis.map(g => (
              <label key={g.name} className="block p-2 border rounded-lg hover:bg-teal-50 cursor-pointer group transition-all">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={data.tumoralGenesis.includes(g.name)} 
                    onChange={() => toggleItem('tumoralGenesis', g.name)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" 
                  />
                  <span className="ml-3 text-xs font-bold text-slate-800 group-hover:text-teal-700">{g.name}</span>
                </div>
                <div className="ml-7 mt-1 text-[10px] text-teal-600 font-medium italic">
                  {g.pair}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Fenômeno Tumoral */}
      <div className="bg-white border rounded-xl shadow-md overflow-hidden">
        <div className="bg-red-600 p-4 text-white text-center">
          <h3 className="text-lg font-bold uppercase tracking-widest">Fenômeno Tumoral</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Check</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Fenômeno</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Fórmula / Patógenos</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Descrição</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tumoralPhenomena.map((t, idx) => (
                <tr key={idx} className={`hover:bg-slate-50 transition-colors ${data.tumoralPhenomena.includes(t.name) ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={data.tumoralPhenomena.includes(t.name)} 
                      onChange={() => toggleItem('tumoralPhenomena', t.name)}
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500" 
                    />
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-800">{t.name}</td>
                  <td className="px-4 py-3 text-xs font-medium text-red-600">{t.formula}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-600 italic leading-snug">{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traumas */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="bg-orange-500 p-3 text-white text-center">
          <h3 className="text-lg font-bold uppercase tracking-widest">Traumas</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
             {["Reumatismo não infeccioso monoarticular", "Artrose Crônica"].map(item => (
                <label key={item} className="flex items-center p-3 border rounded-lg hover:bg-orange-50 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={data.traumas.includes(item)} 
                    onChange={() => toggleItem('traumas', item)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" 
                  />
                  <span className="ml-3 text-sm font-bold text-slate-800 group-hover:text-orange-700">{item}</span>
                </label>
             ))}
          </div>
          <div className="space-y-2 p-3 bg-slate-50 border rounded-lg">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Pós-Traumas</h4>
              {["Físico", "Químico", "Psicológico"].map(p => (
                <label key={p} className="flex items-center text-sm font-medium text-slate-700 p-1 hover:bg-white rounded cursor-pointer group">
                   <input 
                    type="checkbox" 
                    checked={data.traumas.includes(`Pós ${p}`)} 
                    onChange={() => toggleItem('traumas', `Pós ${p}`)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" 
                   />
                   <span className="ml-3 group-hover:text-orange-600 transition-colors">Pós trauma {p}</span>
                </label>
              ))}
          </div>
        </div>
      </div>

      {/* PARES PORTAIS - POSICIONADO AO FINAL */}
      <div className="bg-white border rounded-xl shadow-md overflow-hidden">
        <div className="bg-teal-600 p-4 text-white text-center">
          <h3 className="text-xl font-bold uppercase tracking-widest">Pares Portais</h3>
        </div>
        
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {/* Headers Desktop */}
            <div className="hidden md:grid grid-cols-2 text-center mb-2 font-bold text-sm">
                <div className="bg-cyan-100 text-cyan-800 py-2 border rounded-tl-lg">Ponto</div>
                <div className="bg-purple-100 text-purple-800 py-2 border rounded-tr-lg">Local no corpo</div>
            </div>
            <div className="hidden md:grid grid-cols-2 text-center mb-2 font-bold text-sm">
                <div className="bg-cyan-100 text-cyan-800 py-2 border rounded-tl-lg">Ponto</div>
                <div className="bg-purple-100 text-purple-800 py-2 border rounded-tr-lg">Local no corpo</div>
            </div>

            {portalPairsList.map((item, idx) => (
              <React.Fragment key={idx}>
                {/* Par 1 */}
                <div className="grid grid-cols-2 text-left items-stretch group">
                  <div className="border bg-slate-50 p-2 flex items-center justify-start hover:bg-cyan-50 transition-colors">
                    <label className="flex items-center cursor-pointer w-full">
                      <input 
                        type="checkbox" 
                        checked={data.portalPairs.includes(item.p1)}
                        onChange={() => toggleItem('portalPairs', item.p1)}
                        className="w-4 h-4 flex-shrink-0 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className="ml-3 text-xs font-bold text-slate-700 group-hover:text-teal-700">{item.p1}</span>
                    </label>
                  </div>
                  <div className="border bg-green-50 p-2 text-[10px] text-slate-600 flex items-center italic leading-tight">
                    {item.l1}
                  </div>
                </div>
                {/* Par 2 */}
                <div className="grid grid-cols-2 text-left items-stretch group">
                  <div className="border bg-slate-50 p-2 flex items-center justify-start hover:bg-cyan-50 transition-colors">
                    <label className="flex items-center cursor-pointer w-full">
                      <input 
                        type="checkbox" 
                        checked={data.portalPairs.includes(item.p2)}
                        onChange={() => toggleItem('portalPairs', item.p2)}
                        className="w-4 h-4 flex-shrink-0 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className="ml-3 text-xs font-bold text-slate-700 group-hover:text-teal-700">{item.p2}</span>
                    </label>
                  </div>
                  <div className="border bg-green-50 p-2 text-[10px] text-slate-600 flex items-center italic leading-tight">
                    {item.l2}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Comando Verbal Box */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 items-center gap-6">
            <div className="md:col-span-1 bg-purple-500 rounded-xl p-6 text-center shadow-lg border-2 border-purple-400">
              <span className="text-lg font-bold text-white uppercase tracking-wider block">Comando Verbal</span>
            </div>
            <div className="md:col-span-3 bg-cyan-50 rounded-2xl p-6 shadow-md border-2 border-cyan-200 text-slate-800">
              <p className="text-sm font-medium leading-relaxed">
                Todos os pontos anatômicos, orgânicos, sistêmicos, que suportem presença, frequência, ressonância, energia de malignidade, 
                <span className="text-purple-700 font-bold"> ("façam-se presente" - repita 3x)</span>. Alinhem-se, equilibrem-se e integrem-se, com cargas de 10 bilhões de gaus ou quantos se façam necessários. 
                Envio agora essa malignidade para os buracos negros do Universo, com essas cargas magnéticas. 
                <span className="text-purple-700 font-bold"> ("Fechando o portal" - repita 3x)</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <button onClick={onBack} className="px-8 py-2 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 font-bold transition-colors">Voltar</button>
        <button onClick={onNext} className="px-10 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-bold shadow-md transition-all">Próximo</button>
      </div>
    </div>
  );
};

export default Phenomena;
