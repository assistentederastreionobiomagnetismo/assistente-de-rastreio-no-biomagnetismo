
import React from 'react';
import { User, ApprovalPeriod } from '../types';
import { TrashIcon, InfoIcon } from './icons/Icons';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onBack: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, onBack }) => {
  
  const calculateExpiry = (period: ApprovalPeriod): string => {
    const now = new Date();
    switch (period) {
      case '5min': now.setMinutes(now.getMinutes() + 5); break;
      case '1month': now.setMonth(now.getMonth() + 1); break;
      case '3months': now.setMonth(now.getMonth() + 3); break;
      case '6months': now.setMonth(now.getMonth() + 6); break;
      case '1year': now.setFullYear(now.getFullYear() + 1); break;
      case 'permanent': return ''; // Tratar como permanente se necessário
      default: return '';
    }
    return now.toISOString();
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

  const handleRevoke = (username: string) => {
    setUsers(prev => prev.map(u => 
      u.username === username ? { ...u, isApproved: false, approvalExpiry: undefined, approvalType: undefined } : u
    ));
  };

  const deleteUser = (username: string) => {
    if (window.confirm(`Deseja realmente excluir o usuário ${username}?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleString('pt-BR');
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Gerenciar Acessos</h2>
        <button onClick={onBack} className="text-teal-600 font-bold hover:underline">Voltar</button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Expiração</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Período de Liberação</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">Nenhum usuário cadastrado além do administrador.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.username} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {user.isApproved ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-teal-600">{formatDate(user.approvalExpiry)}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{user.approvalType}</span>
                      </div>
                    ) : (
                      <span className="text-red-400 italic">Bloqueado</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => handleSetApproval(user.username, '5min')} className="px-2 py-1 bg-slate-100 hover:bg-teal-100 text-[10px] font-bold rounded">5 MIN</button>
                        <button onClick={() => handleSetApproval(user.username, '1month')} className="px-2 py-1 bg-slate-100 hover:bg-teal-100 text-[10px] font-bold rounded">1 MÊS</button>
                        <button onClick={() => handleSetApproval(user.username, '3months')} className="px-2 py-1 bg-slate-100 hover:bg-teal-100 text-[10px] font-bold rounded">3 MESES</button>
                        <button onClick={() => handleSetApproval(user.username, '6months')} className="px-2 py-1 bg-slate-100 hover:bg-teal-100 text-[10px] font-bold rounded">6 MESES</button>
                        <button onClick={() => handleSetApproval(user.username, '1year')} className="px-2 py-1 bg-slate-100 hover:bg-teal-100 text-[10px] font-bold rounded">1 ANO</button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      {user.isApproved && (
                        <button 
                          onClick={() => handleRevoke(user.username)}
                          className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                          title="Revogar Acesso"
                        >
                          <InfoIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteUser(user.username)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Excluir"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-100 text-xs text-teal-800">
          <strong>Dica do Administrador:</strong> Clique nos botões de tempo para aprovar ou renovar o acesso do usuário imediatamente. A expiração é calculada a partir do momento do clique.
      </div>
    </div>
  );
};

export default UserManager;
