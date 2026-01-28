
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/Icons';

interface LoginProps {
  onLogin: (username: string, password: string) => { success: boolean; message?: string };
  onGoToRegister: () => void;
  onRequestReset: (username: string, newPass: string) => { success: boolean; message: string };
  onImportSync: (code: string) => boolean;
}

type ViewMode = 'login' | 'forgotPassword' | 'activate';

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister, onRequestReset, onImportSync }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [activationKey, setActivationKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('login');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onLogin(username.trim(), password.trim());
    if (!result.success) {
      setError(result.message || 'Usuário ou senha inválidos.');
    }
  };

  const handleActivation = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const ok = onImportSync(activationKey.trim());
    if (ok) {
        setSuccess('Dispositivo ativado com sucesso! Você já pode entrar com seus dados.');
        setActivationKey('');
        setTimeout(() => setViewMode('login'), 2500);
    } else {
        setError('Chave de liberação inválida.');
    }
  };

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword.length < 6) {
        setError('A nova senha deve ter pelo menos 6 caracteres.');
        return;
    }
    const result = onRequestReset(username.trim(), newPassword.trim());
    if (result.success) {
        setSuccess(result.message);
        setTimeout(() => setViewMode('login'), 3000);
    } else {
        setError(result.message);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-black text-teal-600 leading-tight">Biomagnetismo Assistant</h1>
            <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-[0.2em]">
              {viewMode === 'login' ? 'Área de Acesso' : 
               viewMode === 'activate' ? 'Ativação de Conta' : 
               'Recuperação de Acesso'}
            </p>
          </header>

          {viewMode === 'login' && (
            <div className="space-y-8">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold animate-fade-in">{error}</div>}
                {success && <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-bold animate-fade-in">{success}</div>}
                
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Seu Usuário</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700 shadow-inner"
                    placeholder="usuário"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Sua Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700 shadow-inner"
                    placeholder="senha"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl shadow-lg hover:bg-teal-700 transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  Entrar no Sistema
                </button>
              </form>

              <div className="flex flex-col gap-4">
                <button 
                    onClick={() => setViewMode('activate')}
                    className="w-full py-4 border-2 border-dashed border-teal-200 text-teal-600 font-black rounded-2xl hover:bg-teal-50 transition-all flex items-center justify-center gap-2"
                >
                    <ClipboardIcon className="w-5 h-5" /> Ativar Conta / Liberar Acesso
                </button>
                
                <div className="flex justify-between items-center px-2">
                    <button onClick={onGoToRegister} className="text-xs font-black text-teal-600 uppercase tracking-tight hover:underline">Criar Nova Conta</button>
                    <button onClick={() => setViewMode('forgotPassword')} className="text-xs font-bold text-slate-400 uppercase tracking-tight hover:text-slate-600">Esqueci Senha</button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'activate' && (
            <form onSubmit={handleActivation} className="space-y-6 animate-fade-in">
                <div className="p-5 bg-teal-50 border border-teal-100 rounded-2xl text-xs text-teal-800 leading-relaxed font-medium">
                    Se o administrador liberou seu acesso, cole a <b>Chave de Liberação</b> abaixo para sincronizar seu dispositivo imediatamente.
                </div>
                {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">{error}</div>}
                {success && <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-bold">{success}</div>}
                
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Chave de Liberação</label>
                    <textarea
                        value={activationKey}
                        onChange={e => setActivationKey(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[10px] h-32 outline-none focus:ring-2 focus:ring-teal-500 shadow-inner resize-none"
                        placeholder="Cole aqui o código longo recebido..."
                        required
                    />
                </div>

                <button type="submit" className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl shadow-lg hover:bg-teal-700 transition-all">
                    Ativar Dispositivo
                </button>
                
                <button onClick={() => setViewMode('login')} className="w-full text-sm font-bold text-slate-400">Voltar ao Login</button>
            </form>
          )}

          {viewMode === 'forgotPassword' && (
            <form onSubmit={handleResetRequest} className="space-y-6 animate-fade-in">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 leading-relaxed">
                    Sua solicitação será enviada localmente. O administrador precisa aprovar o reset para que a nova senha funcione após a próxima sincronização.
                </div>
                {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">{error}</div>}
                {success && <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-bold">{success}</div>}
                
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Usuário</label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nova Senha</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500"
                        required
                    />
                </div>

                <button type="submit" className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl shadow-lg">Solicitar Alteração</button>
                <button onClick={() => setViewMode('login')} className="w-full text-sm font-bold text-slate-400">Voltar ao Login</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
