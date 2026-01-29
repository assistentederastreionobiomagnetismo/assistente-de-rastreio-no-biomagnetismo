
import React, { useState } from 'react';
import { User, ApprovalPeriod, BiomagneticPair } from '../types';
import { TrashIcon, CheckIcon, PlusIcon, ClipboardIcon, WhatsAppIcon } from './icons/Icons';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  biomagneticPairs: BiomagneticPair[];
  onBack: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, biomagneticPairs, onBack }) => {
  const [syncCode, setSyncCode] = useState<string | null>(null);

  const handleExportSync = () => {
    try {
        const syncPackage = {
            users: users,
            pairs: biomagneticPairs,
            timestamp: new Date().toISOString()
        };
        const jsonStr = JSON.stringify(syncPackage);
        const code = btoa(unescape(encodeURIComponent(jsonStr)));
        setSyncCode(code);
        alert('Código de Sincronização gerado! Envie aos usuários.');
    } catch(e) {
        alert('Erro ao gerar código. Verifique o tamanho da base de dados.');
    }
  };

  const deleteUser = (username: string) => {
    if (username === 'Vbsjunior.Biomagnetismo') return;
    if (window.confirm(`Excluir usuário ${username}?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10 border border-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Gerenciar Acessos</h2>
        <button onClick={onBack} className="text-teal-600 font-bold">Voltar</button>
      </div>

      <div className="mb-10 p-6 bg-sky-50 rounded-xl border border-sky-200 text-center">
        <p className="text-sm text-sky-800 mb-4 font-medium">Clique abaixo para gerar o código que sincroniza a base de pares e usuários com outros dispositivos.</p>
        <button onClick={handleExportSync} className="px-8 py-3 bg-sky-600 text-white font-bold rounded-lg shadow-md hover:bg-sky-700 transition-all">
            GERAR CÓDIGO DE SINCRONIZAÇÃO
        </button>
        {syncCode && (
            <div className="mt-6">
                <textarea readOnly value={syncCode} className="w-full p-4 bg-white border rounded-lg font-mono text-xs h-32 mb-2" />
                <button onClick={() => { navigator.clipboard.writeText(syncCode); alert('Copiado!'); }} className="text-sky-600 font-bold uppercase text-xs">Copiar Código</button>
            </div>
        )}
      </div>

      <div className="overflow-hidden border rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Usuário</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(user => (
              <tr key={user.username}>
                <td className="px-6 py-4 font-medium text-slate-800">{user.fullName || user.username}</td>
                <td className="px-6 py-4 text-center">
                  {user.username !== 'Vbsjunior.Biomagnetismo' && (
                      <button onClick={() => deleteUser(user.username)} className="text-red-500 hover:text-red-700">Excluir</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;
