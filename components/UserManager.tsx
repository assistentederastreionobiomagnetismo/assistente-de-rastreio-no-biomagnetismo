
import React, { useState } from 'react';
import { User, ApprovalPeriod, BiomagneticPair } from '../types';
import { TrashIcon, CheckIcon, PlusIcon, ClipboardIcon, WhatsAppIcon, MagnetIcon } from './icons/Icons';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  biomagneticPairs: BiomagneticPair[];
  onBack: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, biomagneticPairs, onBack }) => {
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportSync = () => {
    setIsGenerating(true);
    try {
        const syncPackage = {
            users: users,
            pairs: biomagneticPairs,
            timestamp: new Date().toISOString()
        };
        const jsonStr = JSON.stringify(syncPackage);
        
        // Uso de TextEncoder para suportar strings massivas e caracteres especiais sem quebra de btoa
        const bytes = new TextEncoder().encode(jsonStr);
        let binary = "";
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const code = btoa(binary);
        
        setSyncCode(code);
        
        // Alerta sobre tamanho da base se necessário
        if (code.length > 50000) {
            console.warn("Base de dados grande detectada:", code.length, "caracteres.");
        }
        
        alert('Código de Sincronização Master gerado com sucesso! Este código contém TODOS os usuários e TODA a biblioteca de pares atualizada.');
    } catch(e) {
        console.error("Erro na geração do código:", e);
        alert('Erro ao gerar código. Verifique se existem imagens excessivamente grandes na base de pares.');
    } finally {
        setIsGenerating(false);
    }
  };

  const deleteUser = (username: string) => {
    if (username === 'Vbsjunior.Biomagnetismo') return;
    if (window.confirm(`Tem certeza que deseja remover o acesso do terapeuta "${username}"?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-12 border border-slate-200">
      <div className="flex justify-between items-center mb-10">
        <div>
            <h2 className="text-3xl font-black text-slate-800">Controle de Acessos e Base Master</h2>
            <p className="text-slate-500 text-sm">Gestão centralizada de terapeutas e distribuição de dados.</p>
        </div>
        <button onClick={onBack} className="px-8 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200">Voltar</button>
      </div>

      <div className="mb-12 p-8 bg-sky-50 rounded-3xl border-2 border-dashed border-sky-200 text-center">
        <div className="flex justify-center mb-4">
            <MagnetIcon className="w-12 h-12 text-sky-600" />
        </div>
        <h3 className="text-sky-900 font-black text-lg mb-2 uppercase tracking-tight">Sincronização Master do Aplicativo</h3>
        <p className="text-sm text-sky-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sempre que você realizar inclusões ou alterações significativas nos <strong>Pares Biomagnéticos</strong>, utilize o botão abaixo para gerar um novo código. 
            Este código deve ser enviado aos terapeutas para que suas bases locais sejam atualizadas com as novas informações.
        </p>
        
        <button 
            onClick={handleExportSync} 
            disabled={isGenerating}
            className="px-12 py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl hover:bg-sky-700 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-3 mx-auto disabled:bg-slate-300"
        >
            {isGenerating ? 'PROCESSANDO BASE DE DADOS...' : 'GERAR CÓDIGO DE ATUALIZAÇÃO GLOBAL'}
        </button>
        
        {syncCode && (
            <div className="mt-10 animate-fade-in">
                <div className="bg-white p-6 rounded-2xl shadow-inner border border-sky-100">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Código de Sincronização Pronto</span>
                        <span className="text-[9px] text-slate-400 font-mono">Size: {(syncCode.length / 1024).toFixed(1)} KB</span>
                    </div>
                    <textarea 
                        readOnly 
                        value={syncCode} 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[9px] h-40 mb-4 outline-none resize-none leading-relaxed" 
                    />
                    <div className="flex flex-col md:flex-row gap-4">
                        <button 
                            onClick={() => { navigator.clipboard.writeText(syncCode); alert('Código copiado para a área de transferência!'); }} 
                            className="flex-1 py-4 bg-white text-sky-600 border-2 border-sky-100 font-black rounded-xl hover:bg-sky-50 transition-all flex justify-center items-center gap-2 uppercase text-xs tracking-widest"
                        >
                            <ClipboardIcon className="w-5 h-5" /> Copiar Código
                        </button>
                        <a 
                            href={`https://wa.me/?text=${encodeURIComponent("*CÓDIGO DE ATUALIZAÇÃO BIOMAGNETISMO*\n\nCopie e cole este código no seu aplicativo para atualizar a base de pares e usuários:\n\n" + syncCode)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all flex justify-center items-center gap-2 uppercase text-xs tracking-widest shadow-lg"
                        >
                            <WhatsAppIcon className="w-5 h-5" /> Enviar via WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="overflow-hidden border border-slate-200 rounded-3xl shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h4 className="text-sm font-black text-slate-600 uppercase tracking-widest">Terapeutas Cadastrados</h4>
            <span className="text-xs bg-white px-3 py-1 rounded-full text-slate-400 font-bold border border-slate-200">{users.length} usuários</span>
        </div>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Terapeuta</th>
              <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status de Acesso</th>
              <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(user => {
                const isAdmin = user.username === 'Vbsjunior.Biomagnetismo';
                return (
                  <tr key={user.username} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800">{user.fullName || user.username}</span>
                            <span className="text-[10px] text-slate-400 font-bold">@{user.username}</span>
                        </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                            {isAdmin ? 'ADMIN MASTER' : 'TERAPEUTA ATIVO'}
                        </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {!isAdmin && (
                          <button 
                            onClick={() => deleteUser(user.username)} 
                            className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                            title="Remover Acesso"
                          >
                              <TrashIcon className="w-5 h-5" />
                          </button>
                      )}
                    </td>
                  </tr>
                );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;
