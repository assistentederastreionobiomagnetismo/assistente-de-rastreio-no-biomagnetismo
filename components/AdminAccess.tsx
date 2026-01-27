
import React, { useState } from 'react';

interface AdminAccessProps {
  onLoginSuccess: (username: string, password: string) => void;
  onGoToTherapist: () => void;
}

// Hardcoded admin credentials as requested
const ADMIN_USERNAME = 'Vbsjunior.Biomagnetismo';
const ADMIN_PASSWORD = '@Va135482';

const AdminAccess: React.FC<AdminAccessProps> = ({ onLoginSuccess, onGoToTherapist }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        onLoginSuccess(username, password);
    } else {
        setError('Usuário ou senha de administrador inválidos.');
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600">Acesso do Administrador</h1>
            <p className="text-slate-500 mt-2">Faça login para gerenciar os pares</p>
          </header>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-600">Usuário Admin</label>
              <input 
                type="text" 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" 
                required 
                placeholder="Vbsjunior.Biomagnetismo"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600">Senha</label>
              <input 
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" 
                required 
                placeholder="********"
              />
            </div>
            <div>
              <button type="submit" className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Entrar no Painel</button>
            </div>
          </form>

          <div className="text-center mt-6">
            <button onClick={onGoToTherapist} className="text-sm font-medium text-slate-500 hover:text-teal-600">
                Voltar para o login de Terapeuta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccess;
