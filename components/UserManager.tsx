
import React, { useState } from 'react';
import { User, ApprovalPeriod, BiomagneticPair } from '../types';
import { TrashIcon, CheckIcon, PlusIcon, ClipboardIcon, WhatsAppIcon } from './icons/Icons';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  biomagneticPairs: BiomagneticPair[];
  onBack: () => void;
  onSyncExported?: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, biomagneticPairs, onBack, onSyncExported }) => {
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [lastCreatedUser, setLastCreatedUser] = useState<User | null>(null);
  
  // Novo Usuário Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    whatsapp: '',
    period: '1month' as ApprovalPeriod
  });

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

  const applyPhoneMask = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password, fullName, email, whatsapp, period } = formData;

    if (!username.trim() || !password.trim() || !fullName.trim()) {
      alert('Por favor, preencha ao menos o nome completo, usuário e senha.');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      alert('Este nome de usuário já existe no sistema.');
      return;
    }

    const newUser: User = {
      username: username.trim(),
      password: password.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      whatsapp: whatsapp.replace(/\D/g, ''),
      isApproved: true,
      approvalType: period,
      approvalExpiry: calculateExpiry(period),
      requiresPasswordChange: true
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setLastCreatedUser(newUser);
    
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      whatsapp: '',
      period: '1month'
    });
    
    alert('Terapeuta cadastrado! Agora gere o código e envie as mensagens via WhatsApp.');
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
    const syncPackage = {
        users: users,
        pairs: biomagneticPairs,
        timestamp: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(syncPackage);
    const code = btoa(unescape(encodeURIComponent(jsonStr)));
    setSyncCode(code);
    
    if (onSyncExported) onSyncExported();
    
    alert('Código MASTER gerado! Envie aos seus terapeutas para atualizar as permissões e a base de pares para a nova versão de hoje.');
  };

  const handleSendInstructions = () => {
    if (!lastCreatedUser?.whatsapp || !syncCode) return;
    const appUrl = window.location.origin;
    const message = encodeURIComponent(
      `*MENSAGEM 1 DE 2 - ACESSO LIBERADO*\n\n` +
      `Olá ${lastCreatedUser.fullName}! Seu acesso ao Assistente de Biomagnetismo foi configurado.\n\n` +
      `👤 *USUÁRIO:* ${lastCreatedUser.username}\n` +
      `🔑 *SENHA PROVISÓRIA:* ${lastCreatedUser.password}\n\n` +
      `*COMO ATIVAR:*\n` +
      `1. Abra o link do App.\n` +
      `2. Clique em 'Sincronizar Dispositivo'.\n` +
      `3. Cole o código que enviarei a seguir.\n\n` +
      `🔗 *LINK:* ${appUrl}`
    );
    window.open(`https://wa.me/55${lastCreatedUser.whatsapp}?text=${message}`, '_blank');
  };

  const handleSendOnlyCode = () => {
    const targetPhone = lastCreatedUser?.whatsapp;
    if (!targetPhone || !syncCode) {
        if (!syncCode) { alert('Gere o código primeiro!'); return; }
        const manualPhone = window.prompt('Digite o WhatsApp do terapeuta (apenas números com DDD):');
        if (manualPhone) {
            const message = encodeURIComponent(`*CÓDIGO DE SINCRONIZAÇÃO (COLE NO APP):*\n\n${syncCode}`);
            window.open(`https://wa.me/55${manualPhone.replace(/\D/g, '')}?text=${message}`, '_blank');
        }
        return;
    }
    const message = encodeURIComponent(`*CÓDIGO DE SINCRONIZAÇÃO (COLE NO APP):*\n\n${syncCode}`);
    window.open(`https://wa.me/55${targetPhone}?text=${message}`, '_blank');
  };

  const deleteUser = (username: string) => {
    if (username === 'Vbsjunior.Biomagnetismo') return;
    if (window.confirm(`Deseja remover o acesso de ${username}?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Vitalício';
    return new Date(isoStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-slate-200 notranslate" translate="no">
      <div className="flex justify-between items-center mb-10">
        <div>
            <h2 className="text-3xl font-black text-slate-800">Sincronização Master</h2>
            <p className="text-slate-500 text-sm italic">Aqui você distribui sua base de pares para todos os outros dispositivos.</p>
        </div>
        <button onClick={onBack} className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200">Voltar</button>
      </div>

      <div className="mb-10 flex flex-col items-center bg-sky-50 p-8 rounded-3xl border-2 border-sky-100 shadow-sm">
        <div className="text-center mb-6">
            <h4 className="text-sky-800 font-black uppercase text-xs tracking-widest">Botão de Publicação Global</h4>
            <p className="text-[11px] text-sky-600 mt-2 max-w-lg font-bold leading-relaxed italic">
                Sempre que você cadastrar um novo terapeuta OU editar qualquer par biomagnético, você deve clicar no botão abaixo. Isso empacota todas as suas alterações em um novo código para envio.
            </p>
        </div>
        <button onClick={handleExportSync} className="px-12 py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl hover:bg-sky-700 transition-all flex items-center gap-3 transform hover:scale-[1.02] uppercase tracking-widest text-sm">
            PUBLICAR ATUALIZAÇÕES AGORA
        </button>
      </div>

      {syncCode && (
        <div className="mb-12 p-8 bg-sky-50 border-2 border-sky-200 rounded-3xl animate-fade-in shadow-inner">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <p className="text-xs text-sky-700 font-black flex items-center gap-2 uppercase tracking-widest">
                <CheckIcon className="w-5 h-5" /> Código de Versão Gerado
            </p>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <button 
                    onClick={handleSendInstructions}
                    className="flex-1 py-3 px-6 bg-green-600 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg transition-all text-xs uppercase"
                >
                    <WhatsAppIcon className="w-5 h-5" /> Enviar p/ Novo Terapeuta
                </button>
                <button 
                    onClick={handleSendOnlyCode}
                    className="flex-1 py-3 px-6 bg-teal-600 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-teal-700 shadow-lg transition-all text-xs uppercase"
                >
                    <WhatsAppIcon className="w-5 h-5" /> Enviar Apenas Código
                </button>
            </div>
          </div>
          
          <div className="relative">
            <textarea 
                readOnly 
                value={syncCode} 
                className="w-full p-5 bg-white border border-sky-200 rounded-2xl font-mono text-[9px] h-32 mb-4 shadow-sm outline-none resize-none leading-relaxed" 
            />
            <button 
                onClick={() => { navigator.clipboard.writeText(syncCode); alert('Código copiado!'); }} 
                className="absolute bottom-8 right-3 p-3 bg-sky-100 text-sky-600 rounded-xl hover:bg-sky-200 transition-all shadow-sm"
            >
                <ClipboardIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Seção Cadastro de Novo Terapeuta... */}
      <div className="mb-12 p-8 bg-slate-50 border-2 border-slate-200 rounded-3xl shadow-sm">
        <h3 className="text-slate-800 font-black mb-6 flex items-center gap-2 text-xl">
            <PlusIcon className="w-7 h-7 text-teal-600" /> Cadastro de Novo Terapeuta
        </h3>
        <form onSubmit={handleCreateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Nome Completo</label>
                    <input type="text" placeholder="Nome Completo" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium" required />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Usuário</label>
                    <input type="text" placeholder="joao.biomag" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium" required />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Senha Provisória</label>
                    <input type="text" placeholder="Senha provisória" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium" required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">WhatsApp (DDD + Número)</label>
                    <input type="tel" placeholder="(00) 00000-0000" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: applyPhoneMask(e.target.value)})} className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Tempo de Acesso</label>
                    <select value={formData.period} onChange={e => setFormData({...formData, period: e.target.value as ApprovalPeriod})} className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer font-bold text-slate-700">
                        <option value="5min">Teste (5 minutos)</option>
                        <option value="1month">1 Mês</option>
                        <option value="6months">6 Meses</option>
                        <option value="1year">1 Ano</option>
                        <option value="permanent">Vitalício</option>
                    </select>
                </div>
                <button type="submit" className="bg-teal-600 text-white font-black rounded-xl py-4 hover:bg-teal-700 transition-all shadow-lg uppercase text-sm tracking-widest">
                    Salvar Terapeuta
                </button>
            </div>
        </form>
      </div>

      {/* Lista de Terapeutas... */}
      <div className="overflow-hidden border border-slate-200 rounded-3xl shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Terapeuta / Usuário</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Contatos</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Expira em</th>
              <th className="px-6 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Remover</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(user => {
              const isAdmin = user.username === 'Vbsjunior.Biomagnetismo';
              return (
                <tr key={user.username} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-sm">{user.fullName || user.username}</span>
                        <span className="text-[10px] text-slate-400 font-bold">@{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-slate-500 font-bold">{user.whatsapp || 'Não informado'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-slate-600 uppercase">{formatDate(user.approvalExpiry)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {!isAdmin && (
                        <button onClick={() => deleteUser(user.username)} className="p-3 text-slate-200 hover:text-red-600 transition-all"><TrashIcon className="w-5 h-5" /></button>
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
