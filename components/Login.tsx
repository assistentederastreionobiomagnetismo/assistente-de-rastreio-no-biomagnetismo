
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => { success: boolean; message?: string };
  onGoToRegister: () => void;
  onRequestReset: (username: string, newPass: string) => { success: boolean; message: string };
}

type ViewMode = 'login' | 'forgotPassword';

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister, onRequestReset }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('login');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onLogin(username, password);
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

    const result = onRequestReset(username, newPassword);
    if (result.success) {
        setSuccess(result.message);
        setTimeout(() => setViewMode('login'), 3000);
    } else {
        setError(result.message);
    }
  };

  const isApprovalError = error.includes('aguardando aprovação');

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-600">Assistente para Rastreios no Biomagnetismo</h1>
            <p className="text-slate-500 mt-2">{viewMode === 'login' ? 'Acesso ao Sistema' : 'Redefinir Senha'}</p>
          </header>

          {viewMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className={`px-4 py-3 rounded relative border ${isApprovalError ? 'bg-white border-red-500 text-red-600 font-bold text-center animate-blink' : 'bg-red-100 border-red-400 text-red-700'}`} role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-600">Usuário</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Nome de usuário"
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
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Senha de acesso"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  Entrar
                </button>
              </div>
            </form>
          ) : (
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
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
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
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  Solicitar Alteração
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex justify-between w-full">
                <button
                  onClick={onGoToRegister}
                  className="text-sm font-medium text-teal-600 hover:text-teal-800"
                >
                  Criar conta
                </button>
                <button
                  onClick={() => {
                    setViewMode(viewMode === 'login' ? 'forgotPassword' : 'login');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-teal-600"
                >
                  {viewMode === 'login' ? 'Esqueci minha senha' : 'Voltar para Login'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
