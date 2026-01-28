
import React, { useState } from 'react';
import { User, ApprovalPeriod } from '../types';
import { TrashIcon, InfoIcon, CheckIcon, PlusIcon, WhatsAppIcon, ClipboardIcon } from './icons/Icons';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onBack: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, onBack }) => {
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [solicitationInput, setSolicitationInput] = useState('');
  const [importError, setImportError] = useState('');

  const calculateExpiry = (period: ApprovalPeriod): string => {
    const now = new Date();
    switch (period) {
      case '5min': now.setMinutes(now.getMinutes() + 5); break;
      case '1month': now.setMonth(now.getMonth() + 1); break;
      case '3months': now.setMonth(now.getMonth() + 3); break;
      case '6months': now.setMonth(now.getMonth() + 6); break;
      case '1year': now.setFullYear(now.getFullYear() + 1); break;
      case 'permanent': return '';
      default: return '';
    }
    return now.toISOString();
  };

  const handleImportSolicitation = () => {
    setImportError('');
    try {
        const decoded = atob(solicitationInput.trim());
        const newUser = JSON.parse(decoded) as User;
        
        if (!newUser.username || !newUser.password) throw new Error('Invalido');

        const alreadyExists = users.find(u => u.username.toLowerCase() === newUser.username.toLowerCase());
        if (alreadyExists) {
            setImportError('Usuário já cadastrado no sistema.');
            return;
        }

        setUsers(prev => [...prev, { ...newUser, isApproved: false }]);
        setSolicitationInput('');
        alert(`Solicitação de ${newUser.username} importada! Agora aprove e gere a Chave de Liberação.`);
    } catch (e) {
        setImportError('Código de solicitação inválido.');
    }
  };

  const handleSetApproval = (username: string, period: ApprovalPeriod) => {
    const expiry = calculateExpiry(period);
    setUsers(prev => prev.map(u => 
      u.username === username ? { 
        ...u, 
        isApproved: true, 
        approvalType: period, 
        approvalExpiry: expiry 
      } : u
    ));
  };

  const handleSendReleaseKey = (user: User) => {
    // A chave de liberação é o banco de dados completo atualizado (para garantir que ele veja o status approved)
    const releaseCode = btoa(JSON.stringify(users));
    const message = `Olá ${user.username}! Seu acesso foi liberado. Aqui está sua Chave de Ativação:\n\n${releaseCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const copyReleaseKey = () => {
    const code = btoa(JSON.stringify(users));
    navigator.clipboard.writeText(code);
    alert('Chave de Liberação copiada!');
  };

  const deleteUser = (username: string) => {
    if (username === 'Vbsjunior.Biomagnetismo') {
      alert("Não é possível excluir o Administrador Permanente.");
      return;
    }
    if (window.confirm(`Deseja realmente excluir o usuário ${username}?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  const isExpired = (user: User) => {
    if (!user.isApproved || !user.approvalExpiry || user.approvalType === 'permanent') return false;
    return new Date(user.approvalExpiry) < new Date();
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
            <h2 className="text-3xl font-black text-slate-800">Gerenciar Acessos</h2>
            <p className="text-slate-500 text-sm">Aprove novos terapeutas e defina prazos de uso.</p>
        </div>
        <button onClick={onBack} className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Voltar ao Painel</button>
      </div>

      {/* Seção de Importar Solicitação */}
      <div className="mb-12 p-8 bg-teal-50 border-2 border-teal-200 rounded-3xl shadow-sm">
        <h3 className="text-teal-800 font-black mb-4 flex items-center gap-2 text-lg">
            <PlusIcon className="w-6 h-6" /> Importar Chave de Terapeuta
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
            <input 
                type="text" 
                value={solicitationInput}
                onChange={e => setSolicitationInput(e.target.value)}
                placeholder="Cole a Chave de Solicitação aqui..."
                className="flex-1 px-4 py-3 bg-white border border-teal-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-mono text-xs shadow-inner"
            />
            <button 
                onClick={handleImportSolicitation}
                className="px-8 py-3 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 shadow-md transition-all whitespace-nowrap"
            >
                Adicionar Terapeuta
            </button>
        </div>
        {importError && <p className="mt-3 text-red-600 font-bold text-xs">{importError}</p>}
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm bg-slate-25">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Terapeuta</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Acesso</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Definir Período</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Liberação</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Remover</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(user => {
              const isAdmin = user.username === 'Vbsjunior.Biomagnetismo';
              const expired = isExpired(user);
              return (
                <tr key={user.username} className={`hover:bg-slate-50 transition-colors ${expired ? 'bg-red-25' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-black text-slate-800">{user.username}</span>
                        {isAdmin && <span className="text-[10px] text-teal-600 font-bold">MASTER ADMIN</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin ? (
                        <span className="text-teal-600 font-black text-xs">VITALÍCIO</span>
                    ) : user.isApproved ? (
                        <div className="flex flex-col">
                            <span className={`text-xs font-black ${expired ? 'text-red-600 animate-blink' : 'text-green-600'}`}>
                                {expired ? 'EXPIRADO' : 'ATIVO'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">{user.approvalType}</span>
                        </div>
                    ) : (
                        <span className="text-red-400 italic font-bold text-xs">PENDENTE</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!isAdmin && (
                        <div className="flex flex-wrap justify-center gap-1.5">
                            {['5min', '1month', '3months', '6months', '1year'].map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => handleSetApproval(user.username, p as ApprovalPeriod)}
                                    className={`px-2 py-1 text-[9px] font-black rounded border transition-all ${user.approvalType === p ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-500 border-slate-200 hover:border-teal-400'}`}
                                >
                                    {p.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {!isAdmin && user.isApproved && (
                        <div className="flex justify-center gap-2">
                            <button 
                                onClick={() => handleSendReleaseKey(user)}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors shadow-sm"
                                title="Enviar Liberação via WhatsApp"
                            >
                                <WhatsAppIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={copyReleaseKey}
                                className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
                                title="Copiar Chave de Liberação"
                            >
                                <ClipboardIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {!isAdmin && (
                        <button onClick={() => deleteUser(user.username)} className="p-2 text-red-300 hover:text-red-600 transition-colors">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;
