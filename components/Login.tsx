
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/Icons';

interface LoginProps {
  onLogin: (username: string, password: string) => { success: boolean; message?: string };
  onRequestReset: (username: string, newPass: string) => { success: boolean; message: string };
  onImportSync: (code: string) => boolean;
}

type ViewMode = 'login' | 'forgotPassword' | 'sync';

const Login: React.FC<LoginProps> = ({ onLogin, onRequestReset, onImportSync }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [syncCode, setSyncCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('login');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onLogin(username.trim(), password.trim());
    if (!result.success) setError(result.message || 'Dados inválidos.');
  };

  const handleSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (onImportSync(syncCode.trim())) {
        alert('Banco sincronizado! Agora faça login com os dados fornecidos pelo administrador.');
        setViewMode('login');
    } else {
        alert('Código inválido.');
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-black text-teal-600">Biomagnetismo Assistant</h1>
            <p className="text-slate-400 mt-2 text-xs uppercase font-bold tracking-widest">
                {viewMode === 'login' ? 'Acesso ao Sistema' : viewMode === 'sync' ? 'Sincronizar Dispositivo' : 'Recuperar Acesso'}
            </p>
          </header>

          {viewMode === 'login' && (
            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">{error}</div>}
                <input
                    type="text"
                    placeholder="Usuário"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    required
                />
                <button type="submit" className="w-full py-4 bg-teal-600 text-white font-black rounded-xl shadow-lg hover:bg-teal-700 transition-all">
                  Entrar
                </button>
              </form>
              <div className="flex flex-col gap-3">
                <button onClick={() => setViewMode('sync')} className="w-full py-3 border-2 border-dashed border-teal-200 text-teal-600 font-bold rounded-xl flex items-center justify-center gap-2">
                    <ClipboardIcon className="w-5 h-5" /> Sincronizar Dispositivo
                </button>
                <div className="text-center">
                    <button onClick={() => setViewMode('forgotPassword')} className="text-xs text-slate-400 font-bold hover:text-slate-600">Esqueci minha senha</button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'sync' && (
            <form onSubmit={handleSync} className="space-y-6">
                <p className="text-xs text-slate-500 italic text-center">Cole o código fornecido pelo administrador:</p>
                <textarea
                    value={syncCode}
                    onChange={e => setSyncCode(e.target.value)}
                    className="w-full p-4 bg-slate-50 border rounded-xl font-mono text-[10px] h-32 outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Cole o código aqui..."
                    required
                />
                <button type="submit" className="w-full py-4 bg-teal-600 text-white font-black rounded-xl">Ativar Dispositivo</button>
                <button onClick={() => setViewMode('login')} className="w-full text-sm font-bold text-slate-400">Voltar</button>
            </form>
          )}

          {viewMode === 'forgotPassword' && (
            <div className="space-y-6 text-center">
                <p className="text-sm text-slate-600">Para recuperar seu acesso, entre em contato com o administrador do sistema.</p>
                <button onClick={() => setViewMode('login')} className="w-full py-3 bg-slate-200 text-slate-600 font-bold rounded-xl">Voltar ao Login</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
