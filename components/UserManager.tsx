
import React, { useState } from 'react';
import { User, ApprovalPeriod } from '../types';
import { TrashIcon, CheckIcon, PlusIcon, ClipboardIcon, WhatsAppIcon } from './icons/Icons';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onBack: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, onBack }) => {
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
      approvalExpiry: calculateExpiry(period)
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setLastCreatedUser(newUser);
    
    // Limpa campos
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
    const jsonStr = JSON.stringify(users);
    const code = btoa(jsonStr);
    setSyncCode(code);
  };

  // Mensagem 1: Instruções e Link
  const handleSendInstructions = () => {
    if (!lastCreatedUser?.whatsapp || !syncCode) return;
    const appUrl = window.location.origin;
    const message = encodeURIComponent(
      `*MENSAGEM 1 DE 2 - INSTRUÇÕES*\n\n` +
      `Olá ${lastCreatedUser.fullName}! Seu acesso ao Assistente de Biomagnetismo foi liberado.\n\n` +
      `👤 *USUÁRIO:* ${lastCreatedUser.username}\n` +
      `🔑 *SENHA:* ${lastCreatedUser.password}\n\n` +
      `*INSTRUÇÕES DE ACESSO:*\n` +
      `1. Abra o aplicativo pelo link abaixo.\n` +
      `2. Clique em 'Sincronizar Dispositivo'.\n` +
      `3. Cole o código que enviarei na próxima mensagem.\n\n` +
      `🔗 *LINK DO APP:*\n${appUrl}`
    );
    window.open(`https://wa.me/55${lastCreatedUser.whatsapp}?text=${message}`, '_blank');
  };

  // Mensagem 2: Somente o Código (Puro, sem nada escrito)
  const handleSendOnlyCode = () => {
    if (!lastCreatedUser?.whatsapp || !syncCode) return;
    // Removido qualquer texto adicional para facilitar a cópia
    const message = encodeURIComponent(syncCode);
    window.open(`https://wa.me/55${lastCreatedUser.whatsapp}?text=${message}`, '_blank');
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
            <h2 className="text-3xl font-black text-slate-800">Controle de Terapeutas</h2>
            <p className="text-slate-500 text-sm italic">Gestão de acessos, dados e compartilhamento.</p>
        </div>
        <button onClick={onBack} className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200">Voltar</button>
      </div>

      {/* Formulário Estendido */}
      <div className="mb-12 p-8 bg-slate-50 border-2 border-slate-200 rounded-3xl shadow-sm">
        <h3 className="text-slate-800 font-black mb-6 flex items-center gap-2 text-xl">
            <PlusIcon className="w-7 h-7 text-teal-600" /> Cadastro de Novo Terapeuta
        </h3>
        <form onSubmit={handleCreateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Nome Completo</label>
                    <input 
                        type="text" 
                        placeholder="Nome Completo do Terapeuta" 
                        value={formData.fullName} 
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                        required
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">E-mail</label>
                    <input 
                        type="email" 
                        placeholder="email@exemplo.com" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">WhatsApp</label>
                    <input 
                        type="tel" 
                        placeholder="(00) 00000-0000" 
                        value={formData.whatsapp} 
                        onChange={e => setFormData({...formData, whatsapp: applyPhoneMask(e.target.value)})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Usuário (Login)</label>
                    <input 
                        type="text" 
                        placeholder="Ex: joao.biomag" 
                        value={formData.username} 
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                        required
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Senha</label>
                    <input 
                        type="text" 
                        placeholder="Senha provisória" 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                        required
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Tempo de Acesso</label>
                    <select 
                        value={formData.period}
                        onChange={e => setFormData({...formData, period: e.target.value as ApprovalPeriod})}
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
                <button type="submit" className="bg-teal-600 text-white font-black rounded-xl py-4 hover:bg-teal-700 transition-all shadow-lg uppercase text-sm tracking-widest">
                    Salvar Terapeuta
                </button>
            </div>
        </form>
      </div>

      <div className="mb-10 flex flex-col items-center">
        <button onClick={handleExportSync} className="px-12 py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl hover:bg-sky-700 transition-all flex items-center gap-3 transform hover:scale-[1.02]">
            GERAR CÓDIGO DE ACESSO
        </button>
      </div>

      {syncCode && (
        <div className="mb-12 p-8 bg-sky-50 border-2 border-sky-200 rounded-3xl animate-fade-in shadow-inner">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <p className="text-xs text-sky-700 font-black flex items-center gap-2 uppercase tracking-widest">
                <CheckIcon className="w-5 h-5" /> Dados prontos para {lastCreatedUser?.fullName || 'o novo terapeuta'}
            </p>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <button 
                    onClick={handleSendInstructions}
                    disabled={!lastCreatedUser?.whatsapp}
                    className="flex-1 py-3 px-6 bg-green-600 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 disabled:bg-slate-300 shadow-lg transition-all text-xs uppercase"
                >
                    <WhatsAppIcon className="w-5 h-5" /> 1. Instruções + Link
                </button>
                <button 
                    onClick={handleSendOnlyCode}
                    disabled={!lastCreatedUser?.whatsapp}
                    className="flex-1 py-3 px-6 bg-teal-600 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-teal-700 disabled:bg-slate-300 shadow-lg transition-all text-xs uppercase"
                >
                    <WhatsAppIcon className="w-5 h-5" /> 2. Somente Código
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
                title="Copiar Código"
            >
                <ClipboardIcon className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            onClick={() => { navigator.clipboard.writeText(syncCode); alert('Código copiado!'); }} 
            className="w-full py-4 bg-sky-100 text-sky-700 font-black rounded-xl flex justify-center items-center gap-3 hover:bg-sky-200 transition-all uppercase text-xs tracking-widest border border-sky-200"
          >
            Copiar Código Manualmente
          </button>
        </div>
      )}

      {/* Lista de Terapeutas */}
      <div className="overflow-hidden border border-slate-200 rounded-3xl shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Terapeuta / Usuário</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Contatos</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status / Expira</th>
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
                        <span className="font-black text-slate-800 text-sm">{user.fullName || user.username}</span>
                        <span className="text-[10px] text-slate-400 font-bold">@{user.username}</span>
                        {isAdmin && <span className="text-[9px] text-teal-600 font-black uppercase tracking-widest mt-1">Master Admin</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-[10px] gap-1">
                        {user.email && <span className="text-slate-500">📧 {user.email}</span>}
                        {user.whatsapp && <span className="text-slate-500">📱 {user.whatsapp}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin ? (
                        <span className="text-teal-600 font-black text-[10px] uppercase tracking-widest">Vitalício</span>
                    ) : (
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isExpired ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
                                {isExpired ? 'ACESSO EXPIRADO' : formatDate(user.approvalExpiry)}
                            </span>
                            <div className="flex gap-1 mt-2">
                                {(['1month', '6months', '1year', 'permanent'] as ApprovalPeriod[]).map(p => (
                                    <button 
                                        key={p} 
                                        onClick={() => handleSetApproval(user.username, p)} 
                                        className={`px-2 py-1 text-[8px] font-black border rounded transition-all ${user.approvalType === p ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-300 hover:border-teal-300 hover:text-teal-600'}`}
                                    >
                                        {p === 'permanent' ? 'VIT' : p.replace('month', 'M').replace('year', 'A')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {!isAdmin && (
                        <button 
                            onClick={() => deleteUser(user.username)} 
                            className="p-3 text-slate-200 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                            title="Remover"
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
