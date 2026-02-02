import React, { useState } from 'react';
import { User, BiomagneticPair, ApprovalPeriod } from '../types';
import { TrashIcon, ClipboardIcon, WhatsAppIcon, UserIcon, PlusIcon, InfoIcon, CheckIcon } from './icons/Icons';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  biomagneticPairs: BiomagneticPair[];
  onBack: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, biomagneticPairs, onBack }) => {
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [pendingExpiries, setPendingExpiries] = useState<{[key: string]: ApprovalPeriod}>({});
  const [savingUsername, setSavingUsername] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    username: '',
    password: '',
    approvalType: 'permanent' as ApprovalPeriod
  });

  const bytesToBase64 = (bytes: Uint8Array): string => {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const generateCompressedCode = async (userList: User[]) => {
    const syncPackage = {
        v: "2.0-compressed",
        users: userList,
        pairs: biomagneticPairs,
        timestamp: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(syncPackage);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonStr);
    const stream = new Blob([data]).stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    const response = new Response(compressedStream);
    const compressedBuffer = await response.arrayBuffer();
    return bytesToBase64(new Uint8Array(compressedBuffer));
  };

  const calculateExpiry = (type: ApprovalPeriod): string | undefined => {
    if (type === 'permanent') return undefined;
    const now = new Date();
    switch (type) {
      case '5min': return new Date(now.getTime() + 5 * 60 * 1000).toISOString();
      case '1month': return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
      case '3months': return new Date(now.setMonth(now.getMonth() + 3)).toISOString();
      case '6months': return new Date(now.setMonth(now.getMonth() + 6)).toISOString();
      case '1year': return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
      default: return undefined;
    }
  };

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.username || !newUser.password) {
        alert("Preencha Nome, Login e Senha Provisória.");
        return;
    }

    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
        alert("Este login já está em uso. Escolha outro.");
        return;
    }

    const expiry = calculateExpiry(newUser.approvalType);
    
    const createdUser: User = {
        username: newUser.username.trim(),
        password: newUser.password.trim(),
        fullName: newUser.fullName.trim(),
        email: newUser.email.trim(),
        whatsapp: newUser.whatsapp.trim(),
        isApproved: true,
        approvalType: newUser.approvalType,
        approvalExpiry: expiry,
        requiresPasswordChange: true 
    };

    setUsers(prev => [...prev, createdUser]);
    setNewUser({ fullName: '', email: '', whatsapp: '', username: '', password: '', approvalType: 'permanent' });
    alert(`Terapeuta ${createdUser.fullName} cadastrado com sucesso!\n\nLogin: ${createdUser.username}\nSenha Provisória: ${createdUser.password}`);
  };

  const handleUpdateExpiry = (username: string) => {
    const period = pendingExpiries[username];
    if (!period) return;

    setSavingUsername(username);
    const newExpiry = calculateExpiry(period);
    
    setTimeout(() => {
        setUsers(prev => prev.map(u => u.username === username ? { 
            ...u, 
            approvalType: period, 
            approvalExpiry: newExpiry,
            isApproved: true // Reativa automaticamente ao atualizar o prazo
        } : u));
        
        setPendingExpiries(prev => {
            const next = {...prev};
            delete next[username];
            return next;
        });
        setSavingUsername(null);
        alert("Prazo de validade atualizado e acesso liberado com sucesso!");
    }, 400);
  };

  const handleToggleBlock = (username: string) => {
    setUsers(prev => prev.map(u => {
        if (u.username === username) {
            const newStatus = !u.isApproved;
            return { ...u, isApproved: newStatus };
        }
        return u;
    }));
  };

  const handleExportSync = async () => {
    setIsGenerating(true);
    try {
        const code = await generateCompressedCode(users);
        setSyncCode(code);
    } catch(e) {
        alert('Erro ao gerar código de sincronização.');
    } finally {
        setIsGenerating(false);
    }
  };

  const shareInstructions = (user: User) => {
    const appUrl = "https://assistente-de-rastreio-no-biomagnet.vercel.app";
    const message = `Olá ${user.fullName}! Seu acesso ao aplicativo Assistente de Rastreios no Biomagnetismo foi liberado.\n\n👤 USUÁRIO: ${user.username}\n🔑 SENHA PROVISÓRIA: ${user.password}\n\nINSTRUÇÕES DE ACESSO:\n1. Abra o aplicativo pelo link abaixo.\n2. Clique em 'Sincronizar Dispositivo'.\n3. Cole o código que enviarei na próxima mensagem.\n4. Após o primeiro login, o sistema solicitará que você crie uma senha definitiva.\n\n🔗 LINK DO APP:\n${appUrl}\n\nCódigo sincronizador a seguir:`;

    const phone = (user.whatsapp || "").replace(/\D/g, '');
    if (!phone) { alert("WhatsApp não cadastrado para este terapeuta."); return; }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareOnlyCode = async (user: User) => {
    const code = await generateCompressedCode(users);
    const phone = (user.whatsapp || "").replace(/\D/g, '');
    if (!phone) { alert("WhatsApp não cadastrado para este terapeuta."); return; }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(code)}`, '_blank');
  };

  const deleteUser = (username: string) => {
    if (username === 'Vbsjunior.Biomagnetismo') return;
    if (window.confirm(`Remover acesso do terapeuta "${username}"?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* 1. CABEÇALHO E SINCRONIA GLOBAL */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Gestão de Acessos</h2>
            <p className="text-slate-500 text-sm font-medium">Administre logins, prazos e sincronismo da base master.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative group">
                <button 
                  onClick={handleExportSync}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-sky-600 text-white font-black rounded-2xl shadow-lg hover:bg-sky-700 transition-all uppercase text-xs tracking-widest disabled:opacity-50 flex items-center gap-3"
                >
                  <ClipboardIcon className="w-5 h-5" />
                  {isGenerating ? 'PROCESSANDO...' : 'Gerar Sincronia Global'}
                </button>
                {syncCode && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl p-4 border border-sky-100 z-50 animate-fade-in">
                        <p className="text-[8px] font-mono break-all text-slate-400 h-20 overflow-y-auto bg-slate-50 p-2 rounded-lg mb-2">{syncCode}</p>
                        <button onClick={() => { navigator.clipboard.writeText(syncCode!); alert('Código mestre copiado!'); }} className="w-full py-2 bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-sky-100 transition-all">Copiar Código Master</button>
                    </div>
                )}
            </div>
            <button onClick={onBack} className="px-8 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all border border-slate-200 uppercase text-xs tracking-widest">Voltar</button>
        </div>
      </div>

      {/* 2. CADASTRO DE TERAPEUTA */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-teal-100 text-teal-600 rounded-2xl shadow-sm">
                  <PlusIcon className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Novo Cadastro de Terapeuta</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Defina as credenciais de acesso inicial</p>
              </div>
          </div>
          
          <form onSubmit={handleRegisterUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.fullName}
                    onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    placeholder="Nome do terapeuta"
                  />
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Login (Acesso)</label>
                      <input 
                        type="text" 
                        required
                        value={newUser.username}
                        onChange={e => setNewUser({...newUser, username: e.target.value.replace(/\s/g, '').toLowerCase()})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-teal-700"
                        placeholder="ex: maria"
                      />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Senha Prov.</label>
                      <input 
                        type="text" 
                        required
                        value={newUser.password}
                        onChange={e => setNewUser({...newUser, password: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-600"
                        placeholder="123456"
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">E-mail</label>
                  <input 
                    type="email" 
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    placeholder="email@exemplo.com"
                  />
              </div>
              <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">WhatsApp (DDD + Número)</label>
                  <input 
                    type="tel" 
                    value={newUser.whatsapp}
                    onChange={e => setNewUser({...newUser, whatsapp: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    placeholder="5562988887777"
                  />
              </div>
              <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Prazo de Acesso</label>
                  <select 
                    value={newUser.approvalType}
                    onChange={e => setNewUser({...newUser, approvalType: e.target.value as ApprovalPeriod})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-black text-xs uppercase"
                  >
                    <option value="5min">5 Minutos (Teste)</option>
                    <option value="1month">1 Mês</option>
                    <option value="3months">3 Meses</option>
                    <option value="6months">6 Meses</option>
                    <option value="1year">1 Ano</option>
                    <option value="permanent">Permanente</option>
                  </select>
              </div>
              <div className="flex items-end">
                  <button type="submit" className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl shadow-lg hover:bg-teal-700 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                      <CheckIcon className="w-5 h-5" /> Ativar Novo Terapeuta
                  </button>
              </div>
          </form>
      </div>

      {/* 3. TERAPEUTAS NA BASE */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Terapeutas na Base</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Controle de ativação e validade dos acessos</p>
              </div>
              <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 border border-slate-200 uppercase tracking-widest shadow-sm">{users.length} Registros</span>
          </div>
          
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                      <tr className="bg-slate-50/30">
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Terapeuta / Login</th>
                          <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status de Acesso</th>
                          <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Validade / Alteração</th>
                          <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviar Acesso (WhatsApp)</th>
                          <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {users.map(user => {
                          const isAdmin = user.username === 'Vbsjunior.Biomagnetismo';
                          const expiryDate = user.approvalExpiry ? new Date(user.approvalExpiry) : null;
                          const isExpired = expiryDate && expiryDate < new Date();
                          // O status é considerado bloqueado se não estiver aprovado OU se estiver expirado
                          const isBlocked = !user.isApproved || isExpired;
                          
                          const currentSelection = pendingExpiries[user.username] || user.approvalType;
                          const hasPendingChange = currentSelection !== user.approvalType;
                          const isCurrentlySaving = savingUsername === user.username;

                          return (
                              <tr key={user.username} className={`hover:bg-slate-50/50 transition-colors group ${isBlocked ? 'bg-slate-50/20' : ''}`}>
                                  <td className="px-8 py-6">
                                      <div className="flex items-center gap-4">
                                          <div className={`p-4 rounded-2xl transition-all shadow-sm ${isAdmin ? 'bg-amber-100 text-amber-600' : isBlocked ? 'bg-red-50 text-red-400' : 'bg-teal-50 text-teal-600'}`}>
                                              <UserIcon className="w-6 h-6" />
                                          </div>
                                          <div className="flex flex-col">
                                              <span className={`font-black text-sm ${isBlocked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{user.fullName || 'Sem Nome'}</span>
                                              <span className="text-[10px] text-teal-600 font-black uppercase tracking-widest">@{user.username}</span>
                                              <span className="text-[9px] text-slate-400 font-medium">{user.email || 'Sem e-mail'}</span>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-8 py-6 text-center">
                                      {isAdmin ? (
                                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">Mestre</span>
                                      ) : (
                                          <button 
                                            onClick={() => handleToggleBlock(user.username)}
                                            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm ${isBlocked ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}`}
                                          >
                                              {isExpired ? 'Bloqueado (Expirado)' : isBlocked ? 'Bloqueado' : 'Acesso Ativo'}
                                          </button>
                                      )}
                                  </td>
                                  <td className="px-8 py-6">
                                      {isAdmin ? (
                                          <div className="text-center">
                                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Vitalício</span>
                                          </div>
                                      ) : (
                                          <div className="flex flex-col items-center gap-3">
                                              <span className={`text-[10px] font-black uppercase ${isExpired ? 'text-red-500' : 'text-slate-500'}`}>
                                                  {user.approvalExpiry ? expiryDate?.toLocaleDateString('pt-BR') : 'Permanente'}
                                              </span>
                                              <div className="flex items-center gap-1">
                                                  <select 
                                                    value={currentSelection}
                                                    onChange={(e) => setPendingExpiries(prev => ({...prev, [user.username]: e.target.value as ApprovalPeriod}))}
                                                    className={`text-[9px] font-black uppercase tracking-widest border-none rounded-lg px-2 py-1.5 outline-none cursor-pointer transition-colors ${hasPendingChange ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                  >
                                                      <option value="5min">5 Minutos</option>
                                                      <option value="1month">1 Mês</option>
                                                      <option value="3months">3 Meses</option>
                                                      <option value="6months">6 Meses</option>
                                                      <option value="1year">1 Ano</option>
                                                      <option value="permanent">Permanente</option>
                                                  </select>
                                                  
                                                  {hasPendingChange && (
                                                      <button 
                                                        onClick={() => handleUpdateExpiry(user.username)}
                                                        disabled={isCurrentlySaving}
                                                        className="p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md transition-all animate-pulse flex items-center justify-center min-w-[30px]"
                                                        title="Salvar Novo Prazo e Reativar"
                                                      >
                                                          {isCurrentlySaving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckIcon className="w-4 h-4" />}
                                                      </button>
                                                  )}
                                              </div>
                                          </div>
                                      )}
                                  </td>
                                  <td className="px-8 py-6">
                                      {!isAdmin ? (
                                          <div className="flex justify-center gap-3">
                                              <button 
                                                onClick={() => shareInstructions(user)}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex flex-col items-center gap-1 group"
                                                title="Enviar Instruções via WhatsApp"
                                              >
                                                  <InfoIcon className="w-5 h-5" />
                                                  <span className="text-[7px] font-black uppercase">Instruções</span>
                                              </button>
                                              <button 
                                                onClick={() => shareOnlyCode(user)}
                                                className="px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm flex flex-col items-center gap-1"
                                                title="Enviar Apenas Código via WhatsApp"
                                              >
                                                  <ClipboardIcon className="w-5 h-5" />
                                                  <span className="text-[7px] font-black uppercase">Só Código</span>
                                              </button>
                                          </div>
                                      ) : (
                                          <div className="text-center">
                                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">Admin Mestre</span>
                                          </div>
                                      )}
                                  </td>
                                  <td className="px-8 py-6 text-center">
                                      {!isAdmin && (
                                          <button 
                                            onClick={() => deleteUser(user.username)}
                                            className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                            title="Excluir Terapeuta"
                                          >
                                              <TrashIcon className="w-6 h-6" />
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
    </div>
  );
};

export default UserManager;