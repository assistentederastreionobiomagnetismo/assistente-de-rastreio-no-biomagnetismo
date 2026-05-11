import React, { useState } from 'react';
import { User, BiomagneticPair, ApprovalPeriod } from '../types';
import { TrashIcon, ClipboardIcon, WhatsAppIcon, UserIcon, PlusIcon, InfoIcon, CheckIcon, KeyIcon, EyeIcon, EyeSlashIcon, UsersIcon, CogIcon, PlayIcon } from './icons/Icons';
import { dbService } from '../services/dbService';
import { hashPassword } from '../lib/crypto';
import ConfigManager from './ConfigManager';
import TutorialManager from './TutorialManager';
import { PlanType } from '../types';

interface UserManagerProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    biomagneticPairs: BiomagneticPair[];
    onBack: () => void;
    initialTab?: 'users' | 'settings' | 'tutorials';
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, biomagneticPairs, onBack, initialTab = 'users' }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const [pendingExpiries, setPendingExpiries] = useState<{ [key: string]: ApprovalPeriod }>({});
    const [pendingPlans, setPendingPlans] = useState<{ [key: string]: PlanType }>({});
    const [pendingExtras, setPendingExtras] = useState<{ [key: string]: number }>({});
    const [savingUsername, setSavingUsername] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'tutorials'>(initialTab);

    const [newUser, setNewUser] = useState({
        fullName: '',
        email: '',
        whatsapp: '',
        username: '',
        password: '',
        approvalType: 'permanent' as ApprovalPeriod,
        planType: 'annual' as PlanType
    });

    const [showPassword, setShowPassword] = useState(false);

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
            case '1month': return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
            case '1year': return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
            default: return undefined;
        }
    };

    const handleRegisterUser = async (e: React.FormEvent) => {
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
        const secureHash = await hashPassword(newUser.password.trim());

        const createdUser: User = {
            username: newUser.username.trim(),
            password: secureHash,
            fullName: newUser.fullName.trim(),
            email: newUser.email.trim(),
            whatsapp: newUser.whatsapp.trim(),
            isApproved: true,
            approvalType: newUser.approvalType,
            approvalExpiry: expiry,
            planType: newUser.planType,
            requiresPasswordChange: true
        };

        try {
            await dbService.updateUser(createdUser);
            setUsers(prev => [...prev, createdUser]);
            setNewUser({ fullName: '', email: '', whatsapp: '', username: '', password: '', approvalType: 'permanent', planType: 'annual' });
            alert(`Terapeuta ${createdUser.fullName} cadastrado com sucesso e protegido com criptografia!`);
        } catch (error) {
            console.error("Erro ao registrar no Supabase:", error);
            alert("Erro ao salvar no Supabase.");
        }
    };

    const handleUpdateExpiry = async (username: string) => {
        const period = pendingExpiries[username];
        if (!period) return;
        setSavingUsername(username);
        const newExpiry = calculateExpiry(period);
        const newPlan = pendingPlans[username];
        const newExtras = pendingExtras[username];

        try {
            const userToUpdate = users.find(u => u.username === username);
            if (userToUpdate) {
                const updatedUser = {
                    ...userToUpdate,
                    approvalType: period,
                    approvalExpiry: newExpiry,
                    isApproved: true,
                    planType: newPlan || (period === 'permanent' ? 'annual' : userToUpdate.planType),
                    extraSessions: newExtras !== undefined ? newExtras : userToUpdate.extraSessions,
                    paymentStatus: 'approved' as const // Resetar status de pagamento ao aprovar/alterar
                };
                await dbService.updateUser(updatedUser);
                setUsers(prev => prev.map(u => u.username === username ? updatedUser : u));

                setPendingExpiries(prev => { const next = { ...prev }; delete next[username]; return next; });
                setPendingPlans(prev => { const next = { ...prev }; delete next[username]; return next; });
                setPendingExtras(prev => { const next = { ...prev }; delete next[username]; return next; });
                
                alert("Dados atualizados com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            alert("Erro ao salvar no Supabase.");
        } finally {
            setSavingUsername(null);
        }
    };

    const handleToggleBlock = async (username: string) => {
        const userToUpdate = users.find(u => u.username === username);
        if (!userToUpdate) return;

        const updatedUser = { ...userToUpdate, isApproved: !userToUpdate.isApproved };
        try {
            await dbService.updateUser(updatedUser);
            setUsers(prev => prev.map(u => u.username === username ? updatedUser : u));
        } catch (error) {
            console.error("Erro ao alternar bloqueio:", error);
            alert("Erro ao salvar no Supabase.");
        }
    };

    const handleResetPassword = async (username: string, fullName: string) => {
        const generatedPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
        const tempPassword = window.prompt(`Defina a senha provisória para "${fullName}":\n(Sugestão gerada abaixo)`, generatedPassword);

        if (tempPassword === null) return; // Cancelado pelo usuário

        const finalPassword = tempPassword.trim() || generatedPassword;

        if (window.confirm(`Confirmar reset de senha para "${fullName}"?\n\nNova senha: ${finalPassword}\n\nO terapeuta deverá alterá-la no próximo login.`)) {
            try {
                const secureHash = await hashPassword(finalPassword);
                await dbService.resetUserPassword(username, secureHash);

                // Atualiza o estado local para que o login funcione imediatamente sem reload
                setUsers(prev => prev.map(u =>
                    u.username === username
                        ? { ...u, password: secureHash, requiresPasswordChange: true }
                        : u
                ));

                alert(`Senha de ${fullName} resetada com sucesso!\n\nSenha provisória: ${finalPassword}\n(O sistema guardou apenas o hash seguro)`);
            } catch (error) {
                console.error("Erro ao resetar senha:", error);
                alert("Erro ao resetar senha no Supabase.");
            }
        }
    };

    const deleteUser = async (username: string) => {
        if (username.toLowerCase() === 'vbsjunior.biomagnetismo') return;
        if (window.confirm(`Remover acesso do terapeuta "${username}"?`)) {
            try {
                await dbService.deleteUser(username);
                setUsers(prev => prev.filter(u => u.username !== username));
            } catch (error) {
                console.error("Erro ao excluir usuário:", error);
                alert("Erro ao excluir no Supabase.");
            }
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
                    <button onClick={onBack} className="px-8 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all border border-slate-200 uppercase text-xs tracking-widest">Voltar</button>
                </div>
            </div>
 
            {/* Header com Abas */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-100">
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 py-6 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'users' ? 'text-teal-600 bg-slate-50 border-b-4 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <UsersIcon className="w-5 h-5" />
                        Gestão de Usuários
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-6 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'settings' ? 'text-teal-600 bg-slate-50 border-b-4 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <CogIcon className="w-5 h-5" />
                        Links de Pagamento
                    </button>
                    <button 
                        onClick={() => setActiveTab('tutorials')}
                        className={`flex-1 py-6 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'tutorials' ? 'text-teal-600 bg-slate-50 border-b-4 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <PlayIcon className="w-5 h-5" />
                        Vídeo Tutoriais
                    </button>
                </div>
            </div>

            {activeTab === 'users' ? (
                <>
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
                            onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
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
                                onChange={e => setNewUser({ ...newUser, username: e.target.value.replace(/\s/g, '').toLowerCase() })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-teal-700"
                                placeholder="ex: maria"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Senha Prov.</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-600 pr-12"
                                    placeholder="123456"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">E-mail</label>
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                            placeholder="email@exemplo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">WhatsApp (DDD + Número)</label>
                        <input
                            type="tel"
                            value={newUser.whatsapp}
                            onChange={e => setNewUser({ ...newUser, whatsapp: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                            placeholder="5562988887777"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Prazo de Acesso</label>
                        <select
                            value={newUser.approvalType}
                            onChange={e => setNewUser({ ...newUser, approvalType: e.target.value as ApprovalPeriod })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-black text-xs uppercase"
                        >
                            <option value="1month">30 Dias (Trial)</option>
                            <option value="1year">1 Ano</option>
                            <option value="permanent">Permanente</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Tipo de Plano</label>
                        <select
                            value={newUser.planType}
                            onChange={e => setNewUser({ ...newUser, planType: e.target.value as PlanType })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-black text-xs uppercase"
                        >
                            <option value="trial">Trial (30 dias)</option>
                            <option value="annual">Anual / Vitalício (Ilimitado)</option>
                            <option value="hybrid">Start (5 sessões/mês)</option>
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
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano / Créditos</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status de Acesso</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Validade / Alteração</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações de Gestão</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(user => {
                                const isAdmin = user.username.toLowerCase() === 'vbsjunior.biomagnetismo';
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
                                                    {user.paymentStatus === 'pending' && (
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                                                            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                                                                <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest">🔔 Pagamento</span>
                                                                {user.paymentProofUrl && (
                                                                    <a 
                                                                        href={user.paymentProofUrl} 
                                                                        target="_blank" 
                                                                        rel="noreferrer"
                                                                        className="text-[8px] font-black text-blue-600 hover:underline uppercase tracking-widest"
                                                                    >
                                                                        (Ver Comprovante)
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <select
                                                    value={pendingPlans[user.username] || user.planType}
                                                    onChange={(e) => setPendingPlans(prev => ({ ...prev, [user.username]: e.target.value as PlanType }))}
                                                    className={`text-[9px] font-black uppercase tracking-widest border-none rounded-lg px-2 py-1.5 outline-none cursor-pointer transition-colors ${pendingPlans[user.username] ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400' : 'bg-slate-100 text-slate-500'}`}
                                                >
                                                    <option value="trial">Trial</option>
                                                    <option value="annual">Anual/Vitalício</option>
                                                    <option value="hybrid">Start (Sessões)</option>
                                                </select>

                                                {(pendingPlans[user.username] === 'hybrid' || (!pendingPlans[user.username] && user.planType === 'hybrid')) && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="text-[8px] font-black text-slate-400">Extras:</span>
                                                        <input 
                                                            type="number"
                                                            value={pendingExtras[user.username] !== undefined ? pendingExtras[user.username] : (user.extraSessions || 0)}
                                                            onChange={(e) => setPendingExtras(prev => ({ ...prev, [user.username]: parseInt(e.target.value) || 0 }))}
                                                            className={`w-12 text-center text-[9px] font-black border-none rounded bg-slate-50 outline-none ${pendingExtras[user.username] !== undefined ? 'ring-2 ring-amber-400' : ''}`}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex justify-center">
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
                                            </div>
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
                                                            value={pendingExpiries[user.username] || user.approvalType}
                                                            onChange={(e) => setPendingExpiries(prev => ({ ...prev, [user.username]: e.target.value as ApprovalPeriod }))}
                                                            className={`text-[9px] font-black uppercase tracking-widest border-none rounded-lg px-2 py-1.5 outline-none cursor-pointer transition-colors ${pendingExpiries[user.username] ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                        >
                                                            <option value="1month">30 Dias</option>
                                                            <option value="1year">1 Ano</option>
                                                            <option value="permanent">Permanente</option>
                                                        </select>

                                                        {(pendingExpiries[user.username] || pendingPlans[user.username] || pendingExtras[user.username] !== undefined) && (
                                                            <button
                                                                onClick={() => handleUpdateExpiry(user.username)}
                                                                disabled={savingUsername === user.username}
                                                                className="p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md transition-all animate-pulse flex items-center justify-center min-w-[30px]"
                                                                title="Salvar Alterações"
                                                            >
                                                                {savingUsername === user.username ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckIcon className="w-4 h-4" />}
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
                                                        onClick={() => handleResetPassword(user.username, user.fullName)}
                                                        className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm flex flex-col items-center gap-1 group"
                                                        title="Resetar Senha de Acesso"
                                                    >
                                                        <KeyIcon className="w-5 h-5" />
                                                        <span className="text-[7px] font-black uppercase">Resetar Senha</span>
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
                </>
            ) : activeTab === 'settings' ? (
                <ConfigManager />
            ) : (
                <TutorialManager />
            )}
        </div>
    );
};

export default UserManager;