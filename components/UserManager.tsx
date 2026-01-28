
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
  
  // Novo Usuário Form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const calculateExpiry = (period: ApprovalPeriod): string => {
    const now = new Date();
    switch (period) {
      case '5min': now.setMinutes(now.getMinutes() + 5); break;
      case '1month': now.setMonth(now.getMonth() + 1); break;
      case '3months': now.setMonth(now.getMonth() + 3); break;
      case '6months': now.setMonth(now.getMonth() + 6); break;
      case '1year': now.setFullYear(now.getFullYear() + 1); break;
      default: return '';
    }
    return now.toISOString();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
      alert('Usuário já existe.');
      return;
    }

    const newUser: User = {
      username: newUsername.trim(),
      password: newPassword.trim(),
      isApproved: true, // Já cria aprovado por padrão
      approvalType: '1month',
      approvalExpiry: calculateExpiry('1month')
    };

    setUsers(prev => [...prev, newUser]);
    setNewUsername('');
    setNewPassword('');
    alert('Terapeuta criado! Lembre-se de clicar em "Exportar Banco" para que ele possa sincronizar.');
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
    if (username === 'Vbsjunior.Biomagnetismo') return;
    if (window.confirm(`Excluir ${username}?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-slate-200">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-slate-800">Gerenciar Acessos</h2>
        <button onClick={onBack} className="text-teal-600 font-bold hover:underline">Voltar</button>
      </div>

      {/* Formulário de Cadastro pelo Admin */}
      <div className="mb-12 p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-slate-800 font-black mb-4 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Cadastrar Novo Terapeuta
        </h3>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
                type="text" 
                placeholder="Nome de Usuário" 
                value={newUsername} 
                onChange={e => setNewUsername(e.target.value)}
                className="px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                required
            />
            <input 
                type="password" 
                placeholder="Senha" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                className="px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                required
            />
            <button type="submit" className="bg-teal-600 text-white font-bold rounded-xl py-2 hover:bg-teal-700 transition-all">
                Criar Conta
            </button>
        </form>
      </div>

      <div className="mb-8 flex justify-center">
        <button onClick={handleExportSync} className="px-10 py-3 bg-sky-600 text-white font-black rounded-xl shadow-lg hover:bg-sky-700 transition-all">
            Exportar Banco de Dados (Sincronizar)
        </button>
      </div>

      {syncCode && (
        <div className="mb-8 p-6 bg-sky-50 border-2 border-sky-200 rounded-2xl animate-fade-in">
          <p className="text-xs text-sky-700 font-bold mb-2">Envie este código para o terapeuta usar em "Sincronizar Dispositivo":</p>
          <textarea readOnly value={syncCode} className="w-full p-4 bg-white border rounded-xl font-mono text-[10px] h-24 mb-3" />
          <button onClick={() => { navigator.clipboard.writeText(syncCode); alert('Copiado!'); }} className="w-full py-2 bg-sky-600 text-white font-bold rounded-lg flex justify-center items-center gap-2">
            <ClipboardIcon className="w-5 h-5" /> Copiar Código
          </button>
        </div>
      )}

      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Usuário</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase">Renovar</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase">Ação</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(user => {
              const isAdmin = user.username === 'Vbsjunior.Biomagnetismo';
              return (
                <tr key={user.username} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-800">{user.username}</td>
                  <td className="px-6 py-4 text-xs font-bold uppercase">
                    {isAdmin ? <span className="text-teal-600">Admin</span> : user.isApproved ? <span className="text-green-600">Ativo</span> : <span className="text-red-400">Pendente</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {!isAdmin && (
                        <div className="flex justify-center gap-1">
                            {['1month', '6months', '1year'].map(p => (
                                <button key={p} onClick={() => handleSetApproval(user.username, p as ApprovalPeriod)} className="px-2 py-1 text-[9px] font-black border rounded hover:bg-teal-50">
                                    {p.replace('month', 'M').replace('year', 'A')}
                                </button>
                            ))}
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {!isAdmin && (
                        <button onClick={() => deleteUser(user.username)} className="text-red-400 hover:text-red-600">
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
