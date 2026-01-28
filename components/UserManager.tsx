
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
    if (!newUsername || !newPassword) return;

    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
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

    setUsers(prev => [...prev, newUser]);
    setNewUsername('');
    setNewPassword('');
    setNewPeriod('1month'); // reset para padrão
    alert('Terapeuta cadastrado com sucesso! Clique em "Exportar Banco" para gerar o código de acesso dele.');
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
  };

  const deleteUser = (username: string) => {
    if (username === 'Vbsjunior.Biomagnetismo') {
        alert("O administrador mestre não pode ser excluído.");
        return;
    }
    if (window.confirm(`Tem certeza que deseja excluir o acesso de ${username}?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Vitalício';
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-slate-200">
      <div className="flex justify-between items-center mb-10">
        <div>
            <h2 className="text-3xl font-black text-slate-800">Controle de Terapeutas</h2>
            <p className="text-slate-500 text-sm">Cadastre, gerencie e libere acessos.</p>
        </div>
        <button onClick={onBack} className="text-teal-600 font-bold hover:underline bg-teal-50 px-4 py-2 rounded-lg transition-colors">Voltar ao Painel</button>
      </div>

      {/* Formulário de Cadastro pelo Admin */}
      <div className="mb-12 p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-slate-800 font-black mb-4 flex items-center gap-2 text-lg">
            <PlusIcon className="w-6 h-6 text-teal-600" /> Cadastrar Novo Terapeuta
        </h3>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Usuário</label>
                <input 
                    type="text" 
                    placeholder="Ex: joao.biomag" 
                    value={newUsername} 
                    onChange={e => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Senha</label>
                <input 
                    type="text" 
                    placeholder="Defina uma senha" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Tempo de Acesso</label>
                <select 
                    value={newPeriod}
                    onChange={e => setNewPeriod(e.target.value as ApprovalPeriod)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white appearance-none cursor-pointer"
                >
                    <option value="5min">Apenas Teste (5 min)</option>
                    <option value="1month">1 Mês</option>
                    <option value="3months">3 Meses</option>
                    <option value="6months">6 Meses</option>
                    <option value="1year">1 Ano</option>
                    <option value="permanent">Permanente (Vitalício)</option>
                </select>
            </div>
            <button type="submit" className="bg-teal-600 text-white font-black rounded-xl py-3.5 hover:bg-teal-700 transition-all shadow-md transform active:scale-95">
                CADASTRAR
            </button>
        </form>
      </div>

      <div className="mb-10 flex flex-col items-center">
        <button onClick={handleExportSync} className="group relative px-10 py-4 bg-sky-600 text-white font-black rounded-2xl shadow-lg hover:bg-sky-700 transition-all flex items-center gap-3 overflow-hidden">
            <span className="relative z-10">Exportar Banco de Dados e Sincronizar</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </button>
        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Clique acima sempre que cadastrar ou alterar um usuário</p>
      </div>

      {syncCode && (
        <div className="mb-8 p-6 bg-sky-50 border-2 border-sky-200 rounded-2xl animate-fade-in shadow-inner">
          <p className="text-xs text-sky-700 font-bold mb-3 flex items-center gap-2">
            <CheckIcon className="w-4 h-4" /> Código de Sincronização Gerado com Sucesso!
          </p>
          <div className="relative">
            <textarea 
                readOnly 
                value={syncCode} 
                className="w-full p-4 bg-white border border-sky-200 rounded-xl font-mono text-[9px] h-24 mb-3 shadow-sm outline-none resize-none" 
            />
            <button 
                onClick={() => { navigator.clipboard.writeText(syncCode); alert('Código copiado com sucesso!'); }} 
                className="absolute bottom-6 right-2 p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors"
                title="Copiar Código"
            >
                <ClipboardIcon className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => { navigator.clipboard.writeText(syncCode); alert('Código copiado para a área de transferência!'); }} 
            className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-sky-700 shadow-md transition-all"
          >
            Copiar Código de Sincronização
          </button>
        </div>
      )}

      <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-tighter">Terapeuta</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-tighter">Expiração</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-tighter">Alterar Prazo</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-tighter">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(user => {
              const isAdmin = user.username === 'Vbsjunior.Biomagnetismo';
              const isExpired = user.approvalExpiry && new Date(user.approvalExpiry) < new Date();
              
              return (
                <tr key={user.username} className={`hover:bg-slate-50 transition-colors ${isExpired ? 'bg-red-25' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{user.username}</span>
                        {isAdmin && <span className="text-[10px] text-teal-600 font-black uppercase">Administrador Mestre</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin ? (
                        <span className="text-teal-600 font-black text-xs uppercase">VITALÍCIO</span>
                    ) : (
                        <div className="flex flex-col">
                            <span className={`text-xs font-bold ${isExpired ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
                                {isExpired ? 'ACESSO EXPIRADO' : formatDate(user.approvalExpiry)}
                            </span>
                            {!isExpired && user.approvalType && (
                                <span className="text-[10px] text-slate-400 font-medium uppercase">{user.approvalType}</span>
                            )}
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {!isAdmin && (
                        <div className="flex justify-center gap-1.5">
                            {(['1month', '6months', '1year', 'permanent'] as ApprovalPeriod[]).map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => handleSetApproval(user.username, p)} 
                                    className={`px-2 py-1 text-[9px] font-black border rounded-md transition-all shadow-sm ${user.approvalType === p ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-400 hover:border-teal-300 hover:text-teal-600'}`}
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
                            className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Remover Terapeuta"
                        >
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
