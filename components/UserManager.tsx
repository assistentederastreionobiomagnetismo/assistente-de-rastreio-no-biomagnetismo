
import React, { useState } from 'react';
import { User, ApprovalPeriod } from '../types';
import { TrashIcon, InfoIcon, CheckIcon } from './icons/Icons';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onBack: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, onBack }) => {
  const [syncCode, setSyncCode] = useState<string | null>(null);

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

  const handleApproveNewPassword = (username: string) => {
    setUsers(prev => prev.map(u => {
        if (u.username === username && u.passwordResetPending && u.pendingPassword) {
            return {
                ...u,
                password: u.pendingPassword,
                passwordResetPending: false,
                pendingPassword: undefined
            };
        }
        return u;
    }));
  };

  const handleRevoke = (username: string) => {
    setUsers(prev => prev.map(u => 
      u.username === username ? { ...u, isApproved: false, approvalExpiry: undefined, approvalType: undefined } : u
    ));
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

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleString('pt-BR');
  };

  const handleExportSync = () => {
    const jsonStr = JSON.stringify(users);
    const code = btoa(jsonStr); // Base64 encoding
    setSyncCode(code);
  };

  const copySyncCode = () => {
    if (syncCode) {
        navigator.clipboard.writeText(syncCode);
        alert("Código copiado! Envie este código para os outros terapeutas sincronizarem seus dispositivos.");
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Gerenciar Acessos</h2>
        <div className="flex gap-4">
            <button 
                onClick={handleExportSync}
                className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-bold shadow-md hover:bg-sky-700 transition-colors"
            >
                Exportar Banco (Sincronizar)
            </button>
            <button onClick={onBack} className="text-teal-600 font-bold hover:underline">Voltar</button>
        </div>
      </div>

      {syncCode && (
          <div className="mb-8 p-6 bg-sky-50 border-2 border-sky-200 rounded-xl animate-fade-in">
            <h3 className="text-sky-800 font-bold mb-2">Código de Sincronização Gerado</h3>
            <p className="text-xs text-sky-700 mb-4 leading-relaxed">
                Este código contém todos os usuários e permissões atuais. <br/>
                No novo dispositivo (celular/tablet/PC), vá na tela de login, clique em <b>"Sincronizar Dispositivo"</b> e cole este código.
            </p>
            <div className="flex flex-col gap-3">
                <textarea 
                    readOnly 
                    value={syncCode}
                    className="w-full p-3 bg-white border border-sky-300 rounded font-mono text-[10px] h-32 outline-none focus:ring-2 focus:ring-sky-500"
                />
                <div className="flex gap-2">
                    <button onClick={copySyncCode} className="flex-1 py-2 bg-sky-600 text-white font-bold rounded-lg shadow hover:bg-sky-700 transition-all">Copiar Código</button>
                    <button onClick={() => setSyncCode(null)} className="px-4 py-2 bg-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-400">Fechar</button>
                </div>
            </div>
          </div>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status / Expiração</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Renovar Período</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Solicitações</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">Nenhum usuário cadastrado.</td>
              </tr>
            ) : (
              users.map(user => {
                const expired = isExpired(user);
                const isAdmin = user.username === 'Vbsjunior.Biomagnetismo';
                return (
                  <tr key={user.username} className={`hover:bg-slate-50 ${expired ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{user.username}</span>
                        {isAdmin && <span className="text-[10px] text-teal-600 font-bold uppercase">Administrador Permanente</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {isAdmin ? (
                        <span className="text-teal-600 font-bold flex items-center gap-1"><CheckIcon className="w-4 h-4"/> Acesso Vitalício</span>
                      ) : user.isApproved ? (
                        <div className="flex flex-col">
                          {expired ? (
                            <span className="font-bold text-red-600 uppercase animate-blink">Acesso Expirado</span>
                          ) : (
                            <span className="font-bold text-teal-600">Ativo até {formatDate(user.approvalExpiry)}</span>
                          )}
                          <span className="text-[10px] text-slate-400 uppercase">{user.approvalType}</span>
                        </div>
                      ) : (
                        <span className="text-red-400 italic">Aguardando Aprovação</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!isAdmin && (
                        <div className="flex flex-wrap justify-center gap-2">
                            <button onClick={() => handleSetApproval(user.username, '5min')} className="px-2 py-1 bg-white border border-slate-200 hover:bg-teal-50 text-[10px] font-bold rounded shadow-sm transition-colors">5 MIN</button>
                            <button onClick={() => handleSetApproval(user.username, '1month')} className="px-2 py-1 bg-white border border-slate-200 hover:bg-teal-50 text-[10px] font-bold rounded shadow-sm transition-colors">1 MÊS</button>
                            <button onClick={() => handleSetApproval(user.username, '3months')} className="px-2 py-1 bg-white border border-slate-200 hover:bg-teal-50 text-[10px] font-bold rounded shadow-sm transition-colors">3 MESES</button>
                            <button onClick={() => handleSetApproval(user.username, '6months')} className="px-2 py-1 bg-white border border-slate-200 hover:bg-teal-50 text-[10px] font-bold rounded shadow-sm transition-colors">6 MESES</button>
                            <button onClick={() => handleSetApproval(user.username, '1year')} className="px-2 py-1 bg-white border border-slate-200 hover:bg-teal-50 text-[10px] font-bold rounded shadow-sm transition-colors">1 ANO</button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                        {user.passwordResetPending && (
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold text-orange-600 uppercase animate-pulse">Reset de Senha</span>
                                <button 
                                    onClick={() => handleApproveNewPassword(user.username)}
                                    className="px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded shadow-sm hover:bg-orange-600 transition-colors"
                                >
                                    APROVAR
                                </button>
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        {!isAdmin && user.isApproved && !expired && (
                          <button 
                            onClick={() => handleRevoke(user.username)}
                            className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                            title="Revogar Acesso"
                          >
                            <InfoIcon className="w-5 h-5" />
                          </button>
                        )}
                        {!isAdmin && (
                          <button 
                            onClick={() => deleteUser(user.username)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Excluir"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;
