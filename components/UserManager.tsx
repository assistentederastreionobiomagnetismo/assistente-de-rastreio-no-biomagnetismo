import React, { useState } from 'react';
import { User, BiomagneticPair } from '../types';
import { TrashIcon, ClipboardIcon, WhatsAppIcon, MagnetIcon, UserIcon, EnvelopeIcon, PlusIcon } from './icons/Icons';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  biomagneticPairs: BiomagneticPair[];
  onBack: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, biomagneticPairs, onBack }) => {
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Estado para o formulário de novo usuário
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    whatsapp: ''
  });

  // Helper para converter bytes para Base64
  const bytesToBase64 = (bytes: Uint8Array): string => {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Função centralizada para gerar o código comprimido
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

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email) return;

    const username = newUser.email.split('@')[0].toLowerCase() + Math.floor(Math.random() * 100);
    
    const createdUser: User = {
        username,
        password: '@Biomag123', // Senha padrão inicial
        fullName: newUser.fullName,
        email: newUser.email,
        whatsapp: newUser.whatsapp,
        isApproved: true,
        approvalType: 'permanent',
        requiresPasswordChange: true
    };

    setUsers(prev => [...prev, createdUser]);
    setNewUser({ fullName: '', email: '', whatsapp: '' });
    alert(`Terapeuta ${newUser.fullName} cadastrado com sucesso! Use o botão "Enviar Convite" na lista abaixo.`);
  };

  const handleExportSync = async () => {
    setIsGenerating(true);
    try {
        const code = await generateCompressedCode(users);
        setSyncCode(code);
        alert('CÓDIGO GERAL GERADO COM SUCESSO!');
    } catch(e) {
        alert('Erro ao gerar código de sincronização.');
    } finally {
        setIsGenerating(false);
    }
  };

  const shareWithUser = async (user: User, method: 'whatsapp' | 'email') => {
    const code = await generateCompressedCode(users);
    const message = `Olá ${user.fullName}!\n\nSeu acesso ao App de Biomagnetismo está pronto.\n\nUsuário: ${user.username}\nSenha Inicial: ${user.password}\n\nCOPIE O CÓDIGO ABAIXO e use no botão "Sincronizar Dispositivo" ao abrir o app:\n\n${code}`;

    if (method === 'whatsapp' && user.whatsapp) {
        const phone = user.whatsapp.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    } else if (method === 'email') {
        window.location.href = `mailto:${user.email}?subject=Acesso ao App Biomagnetismo&body=${encodeURIComponent(message)}`;
    } else {
        navigator.clipboard.writeText(code);
        alert('Código copiado para a área de transferência!');
    }
  };

  const deleteUser = (username: string) => {
    if (username === 'Vbsjunior.Biomagnetismo') return;
    if (window.confirm(`Remover acesso do terapeuta "${username}"?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Administração de Terapeutas</h2>
            <p className="text-slate-500 text-sm font-medium">Cadastre usuários e distribua a base master via convite.</p>
        </div>
        <button onClick={onBack} className="px-8 py-3 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all border border-slate-200 uppercase text-xs tracking-widest">Voltar</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna 1: Formulário de Cadastro */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-teal-100 text-teal-600 rounded-xl">
                          <PlusIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Novo Terapeuta</h3>
                  </div>
                  
                  <form onSubmit={handleRegisterUser} className="space-y-4">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest ml-1">Nome Completo</label>
                          <input 
                            type="text" 
                            required
                            value={newUser.fullName}
                            onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                            placeholder="Ex: João da Silva"
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest ml-1">E-mail de Acesso</label>
                          <input 
                            type="email" 
                            required
                            value={newUser.email}
                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                            placeholder="exemplo@email.com"
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest ml-1">WhatsApp (com DDD)</label>
                          <input 
                            type="tel" 
                            value={newUser.whatsapp}
                            onChange={e => setNewUser({...newUser, whatsapp: e.target.value})}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                            placeholder="62988887777"
                          />
                      </div>
                      <button type="submit" className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl shadow-lg hover:bg-teal-700 transition-all uppercase text-xs tracking-widest mt-2">
                          Cadastrar Terapeuta
                      </button>
                  </form>
              </div>

              {/* Box de Sincronia Geral */}
              <div className="bg-sky-600 rounded-3xl shadow-xl p-8 text-white">
                  <h3 className="text-lg font-black uppercase tracking-tight mb-2">Sincronia Global</h3>
                  <p className="text-xs text-sky-100 mb-6 leading-relaxed">Gere um código único contendo todos os terapeutas e todos os pares biomagnéticos da base master.</p>
                  <button 
                    onClick={handleExportSync}
                    disabled={isGenerating}
                    className="w-full py-4 bg-white text-sky-600 font-black rounded-2xl shadow-lg hover:bg-sky-50 transition-all uppercase text-xs tracking-widest disabled:opacity-50"
                  >
                    {isGenerating ? 'COMPRIMINDO...' : 'Gerar Código Master'}
                  </button>
                  {syncCode && (
                      <div className="mt-4 p-3 bg-sky-700 rounded-xl border border-sky-500 overflow-hidden">
                          <p className="text-[9px] font-mono break-all opacity-70 h-10 overflow-y-auto">{syncCode}</p>
                          <button onClick={() => { navigator.clipboard.writeText(syncCode!); alert('Código mestre copiado!'); }} className="mt-2 w-full text-[10px] font-black uppercase tracking-widest py-1 border border-sky-400 rounded-lg hover:bg-sky-500 transition-colors">Copiar código</button>
                      </div>
                  )}
              </div>
          </div>

          {/* Coluna 2 e 3: Tabela de Usuários */}
          <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Terapeutas na Base</h3>
                      <span className="bg-white px-4 py-1 rounded-full text-[10px] font-black text-slate-400 border border-slate-200 uppercase tracking-widest">{users.length} Registros</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100">
                          <thead>
                              <tr className="bg-slate-50/30">
                                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Terapeuta</th>
                                  <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviar Acesso</th>
                                  <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {users.map(user => {
                                  const isAdmin = user.username === 'Vbsjunior.Biomagnetismo';
                                  return (
                                      <tr key={user.username} className="hover:bg-slate-50/50 transition-colors group">
                                          <td className="px-8 py-5">
                                              <div className="flex items-center gap-4">
                                                  <div className={`p-3 rounded-2xl ${isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-teal-50 text-teal-600'}`}>
                                                      <UserIcon className="w-6 h-6" />
                                                  </div>
                                                  <div className="flex flex-col">
                                                      <span className="font-black text-slate-800 text-sm">{user.fullName || user.username}</span>
                                                      <span className="text-[10px] text-slate-400 font-bold">{user.email || 'Sem e-mail'}</span>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-8 py-5">
                                              {!isAdmin ? (
                                                  <div className="flex justify-center gap-2">
                                                      <button 
                                                        onClick={() => shareWithUser(user, 'whatsapp')}
                                                        className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                        title="Enviar via WhatsApp"
                                                      >
                                                          <WhatsAppIcon className="w-5 h-5" />
                                                      </button>
                                                      <button 
                                                        onClick={() => shareWithUser(user, 'email')}
                                                        className="p-3 bg-sky-50 text-sky-600 rounded-2xl hover:bg-sky-600 hover:text-white transition-all shadow-sm"
                                                        title="Enviar via E-mail"
                                                      >
                                                          <EnvelopeIcon className="w-5 h-5" />
                                                      </button>
                                                  </div>
                                              ) : (
                                                  <div className="text-center">
                                                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">Administrador Mestre</span>
                                                  </div>
                                              )}
                                          </td>
                                          <td className="px-8 py-5 text-center">
                                              {!isAdmin && (
                                                  <button 
                                                    onClick={() => deleteUser(user.username)}
                                                    className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                  >
                                                      <TrashIcon className="w-5 h-5" />
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
      </div>
    </div>
  );
};

export default UserManager;