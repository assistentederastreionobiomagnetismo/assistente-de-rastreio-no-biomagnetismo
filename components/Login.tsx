
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => { success: boolean; message?: string };
  onGoToRegister: () => void;
  onRequestReset: (username: string, newPass: string) => { success: boolean; message: string };
  onImportSync: (code: string) => boolean;
}

type ViewMode = 'login' | 'forgotPassword' | 'sync';

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister, onRequestReset, onImportSync }) => {
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
    // Sanitização para evitar erros de teclado mobile (espaços acidentais)
    const result = onLogin(username.trim(), password.trim());
    if (!result.success) {
      setError(result.message || 'Usuário ou senha inválidos.');
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

  const handleSyncImport = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const ok = onImportSync(syncCode.trim());
    if (ok) {
        setSuccess('Dispositivo sincronizado com sucesso! Agora você pode fazer login.');
        setTimeout(() => setViewMode('login'), 2000);
    } else {
        setError('Código de sincronização inválido.');
    }
  };

  const isApprovalError = error.includes('aguardando aprovação');

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-600">Assistente para Rastreios no Biomagnetismo</h1>
            <p className="text-slate-500 mt-2">
              {viewMode === 'login' ? 'Acesso ao Sistema' : 
               viewMode === 'forgotPassword' ? 'Redefinir Senha' : 
               'Sincronizar Dispositivo'}
            </p>
          </header>

          {viewMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className={`px-4 py-3 rounded relative border ${isApprovalError ? 'bg-white border-red-500 text-red-600 font-bold text-center animate-blink' : 'bg-red-100 border-red-400 text-red-700'}`} role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm font-bold">{success}</div>}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-600">Usuário</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Seu usuário"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-600">Senha</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Sua senha"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  Entrar
                </button>
              </div>
            </form>
          )}

          {viewMode === 'forgotPassword' && (
            <form onSubmit={handleResetRequest} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{success}</span>
                </div>
              )}
              <p className="text-xs text-slate-500 italic">Sua solicitação de nova senha deverá ser aprovada pelo administrador.</p>
              <div>
                <label htmlFor="username-reset" className="block text-sm font-medium text-slate-600">Usuário</label>
                <input
                  type="text"
                  id="username-reset"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Nome de usuário cadastrado"
                  required
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-slate-600">Nova Senha Desejada</label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  Solicitar Alteração
                </button>
              </div>
            </form>
          )}

          {viewMode === 'sync' && (
            <form onSubmit={handleSyncImport} className="space-y-6">
              {error && <div className="bg-red-100 text-red-700 p-3 rounded text-sm">{error}</div>}
              {success && <div className="bg-green-100 text-green-700 p-3 rounded text-sm">{success}</div>}
              <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-xs text-teal-800 leading-relaxed">
                  <strong>Como sincronizar:</strong> Peça ao administrador para gerar um "Código de Sincronização" no computador dele. Cole o código abaixo para que este dispositivo reconheça as contas cadastradas.
              </div>
              <div>
                <label htmlFor="sync-code" className="block text-sm font-medium text-slate-600">Código de Sincronização</label>
                <textarea
                  id="sync-code"
                  value={syncCode}
                  onChange={(e) => setSyncCode(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm font-mono text-[10px]"
                  placeholder="Cole o código aqui..."
                  rows={6}
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  Importar Dados
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-between w-full gap-2">
                <button onClick={onGoToRegister} className="text-sm font-bold text-teal-600 hover:underline">Criar conta</button>
                <button
                  onClick={() => {
                    if (viewMode === 'login') setViewMode('sync');
                    else setViewMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm font-bold text-sky-600 hover:underline"
                >
                  {viewMode === 'sync' ? 'Voltar para Login' : 'Sincronizar Dispositivo'}
                </button>
            </div>
            {viewMode === 'login' && (
                <button
                  onClick={() => {
                    setViewMode('forgotPassword');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs font-medium text-slate-400 hover:text-teal-600"
                >
                  Esqueci minha senha
                </button>
            )}
            {viewMode !== 'login' && viewMode !== 'sync' && (
                 <button onClick={() => setViewMode('login')} className="text-sm font-medium text-slate-500">Voltar para Login</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
