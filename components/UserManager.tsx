
import React, { useState } from 'react';
import { User, ApprovalPeriod } from '../types';
import { TrashIcon, CheckIcon, PlusIcon, ClipboardIcon } from './icons/Icons';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onBack: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, onBack }) => {
  const [syncCode, setSyncCode] = useState<string | null>(null);
  
  // Novo Usuário Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPeriod, setNewPeriod] = useState<ApprovalPeriod>('1month');

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

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    if (users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      alert('Este nome de usuário já existe no sistema.');
      return;
    }

    const newUser: User = {
      username: newUsername.trim(),
      password: newPassword.trim(),
      isApproved: true,
      approvalType: newPeriod,
      approvalExpiry: calculateExpiry(newPeriod)
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Limpa campos
    setNewUsername('');
    setNewPassword('');
    setNewPeriod('1month');
    
    alert('Terapeuta cadastrado! Agora clique em "Gerar Código de Sincronização" e envie para o terapeuta.');
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

  const handleExportSync = () => {
    const jsonStr = JSON.stringify(users);
    setSyncCode(btoa(jsonStr));
    alert('Código de sincronização gerado!');
  };

  const deleteUser = (username: string) => {
    if (username === 'Vbsjunior.Biomagnetismo') {
        alert("O administrador mestre não pode ser excluído.");
        return;
    }
    if (window.confirm(`Deseja remover o acesso de ${username}?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Vitalício';
    return new Date(isoStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-slate-200">
      <div className="flex justify-between items-center mb-10">
        <div>
            <h2 className="text-3xl font-black text-slate-800">Controle de Acessos</h2>
            <p className="text-slate-500 text-sm italic">Gestão centralizada de terapeutas e períodos de uso.</p>
        </div>
        <button onClick={onBack} className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200">Voltar ao Painel</button>
      </div>

      {/* Formulário de Cadastro pelo Admin */}
      <div className="mb-12 p-8 bg-slate-50 border-2 border-slate-200 rounded-3xl shadow-sm">
        <h3 className="text-slate-800 font-black mb-6 flex items-center gap-2 text-xl">
            <PlusIcon className="w-7 h-7 text-teal-600" /> Cadastrar Novo Terapeuta
        </h3>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Nome de Usuário</label>
                <input 
                    type="text" 
                    placeholder="joao.biomag" 
                    value={newUsername} 
                    onChange={e => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Senha de Acesso</label>
                <input 
                    type="text" 
                    placeholder="Defina a senha" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Tempo de Acesso</label>
                <select 
                    value={newPeriod}
                    onChange={e => setNewPeriod(e.target.value as ApprovalPeriod)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer font-bold text-slate-700"
                >
                    <option value="5min">Teste (5 minutos)</option>
                    <option value="1month">1 Mês</option>
                    <option value="3months">3 Meses</option>
                    <option value="6months">6 Meses</option>
                    <option value="1year">1 Ano</option>
                    <option value="permanent">Permanente (Vitalício)</option>
                </select>
            </div>
            <button type="submit" className="bg-teal-600 text-white font-black rounded-xl py-4 hover:bg-teal-700 transition-all shadow-lg transform active:scale-95 text-sm uppercase tracking-widest">
                Confirmar Cadastro
            </button>
        </form>
      </div>

      <div className="mb-10 flex flex-col items-center border-b border-slate-100 pb-10">
        <button onClick={handleExportSync} className="px-12 py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl hover:bg-sky-700 transition-all flex items-center gap-3 transform hover:scale-[1.02]">
            Gerar Código de Sincronização
        </button>
        <p className="text-[10px] text-slate-400 mt-4 font-black uppercase tracking-[0.2em] text-center max-w-sm">
            Gere o código acima após qualquer alteração e envie para o terapeuta sincronizar o dispositivo dele.
        </p>
      </div>

      {syncCode && (
        <div className="mb-12 p-6 bg-sky-50 border-2 border-sky-200 rounded-2xl animate-fade-in shadow-inner">
          <p className="text-xs text-sky-700 font-black mb-3 flex items-center gap-2 uppercase tracking-widest">
            <CheckIcon className="w-4 h-4" /> Código de Sincronização Disponível
          </p>
          <div className="relative">
            <textarea 
                readOnly 
                value={syncCode} 
                className="w-full p-4 bg-white border border-sky-200 rounded-xl font-mono text-[9px] h-32 mb-4 shadow-sm outline-none resize-none leading-relaxed" 
            />
            <button 
                onClick={() => { navigator.clipboard.writeText(syncCode); alert('Código copiado!'); }} 
                className="absolute bottom-8 right-3 p-3 bg-sky-100 text-sky-600 rounded-xl hover:bg-sky-200 transition-all shadow-sm"
                title="Copiar Código"
            >
                <ClipboardIcon className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => { navigator.clipboard.writeText(syncCode); alert('Código copiado para a área de transferência!'); }} 
            className="w-full py-4 bg-sky-600 text-white font-black rounded-xl flex justify-center items-center gap-3 hover:bg-sky-700 shadow-md transition-all uppercase text-sm tracking-widest"
          >
            Copiar para o WhatsApp / Área de Transferência
          </button>
        </div>
      )}

      <div className="overflow-hidden border border-slate-200 rounded-3xl shadow-sm bg-slate-25">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Terapeuta</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status / Expiração</th>
              <th className="px-6 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Alterar Período</th>
              <th className="px-6 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(user => {
              const isAdmin = user.username === 'Vbsjunior.Biomagnetismo';
              const isExpired = !isAdmin && user.approvalExpiry && new Date(user.approvalExpiry) < new Date();
              
              return (
                <tr key={user.username} className={`hover:bg-slate-50 transition-colors ${isExpired ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-sm">{user.username}</span>
                        {isAdmin && <span className="text-[9px] text-teal-600 font-black uppercase tracking-widest">Master Admin</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin ? (
                        <span className="text-teal-600 font-black text-[10px] uppercase tracking-widest">Vitalício</span>
                    ) : (
                        <div className="flex flex-col">
                            <span className={`text-xs font-black uppercase tracking-tighter ${isExpired ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
                                {isExpired ? 'ACESSO EXPIRADO' : formatDate(user.approvalExpiry)}
                            </span>
                            {!isExpired && (
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{user.approvalType === 'permanent' ? 'Vitalício' : user.approvalType}</span>
                            )}
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!isAdmin && (
                        <div className="flex justify-center flex-wrap gap-1.5 max-w-[200px] mx-auto">
                            {(['1month', '6months', '1year', 'permanent'] as ApprovalPeriod[]).map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => handleSetApproval(user.username, p)} 
                                    className={`px-3 py-1.5 text-[9px] font-black border-2 rounded-lg transition-all ${user.approvalType === p ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-slate-400 border-slate-100 hover:border-teal-300 hover:text-teal-600'}`}
                                >
                                    {p === 'permanent' ? 'VIT' : p.replace('month', 'M').replace('year', 'A')}
                                </button>
                            ))}
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {!isAdmin && (
                        <button 
                            onClick={() => deleteUser(user.username)} 
                            className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                            title="Remover Terapeuta"
                        >
                            <TrashIcon className="w-6 h-6" />
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
