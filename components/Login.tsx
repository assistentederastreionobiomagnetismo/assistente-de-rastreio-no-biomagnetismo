
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => { success: boolean; message?: string };
  onGoToAdmin: () => void;
  onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToAdmin, onGoToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onLogin(username, password);
    if (!result.success) {
      setError(result.message || 'Usuário ou senha inválidos.');
    }
  };

  const isApprovalError = error.includes('aguardando aprovação');

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-600">Assistente para Rastreios no Biomagnetismo</h1>
            <p className="text-slate-500 mt-2">Acesso ao Sistema</p>
          </header>

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
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                Entrar
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={onGoToRegister}
              className="text-sm font-medium text-teal-600 hover:text-teal-800"
            >
              Criar conta
            </button>
            <button
              onClick={onGoToAdmin}
              className="text-sm font-medium text-slate-500 hover:text-teal-600"
            >
              Acessar como Administrador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
