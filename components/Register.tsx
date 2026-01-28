
import React, { useState } from 'react';

interface RegisterProps {
  onRegister: (username: string, password: string) => { success: boolean; solicitationCode?: string };
  onGoToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onGoToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [solicitationCode, setSolicitationCode] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    const result = onRegister(username.trim(), password.trim());
    if (result.success) {
        setSuccessMessage('Cadastro criado com sucesso! Copie o código abaixo e envie para o Administrador aprovar seu acesso.');
        if (result.solicitationCode) setSolicitationCode(result.solicitationCode);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
    } else {
        setError('Este nome de usuário já está em uso.');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(solicitationCode);
    alert('Código copiado! Envie para o Administrador.');
  };

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-600">Cadastro de Terapeuta</h1>
            <p className="text-slate-500 mt-2">Crie sua conta para começar</p>
          </header>

          {successMessage ? (
            <div className="text-center space-y-6">
                <div className="p-4 bg-green-50 border-2 border-teal-500 text-teal-800 font-medium rounded-lg">
                    {successMessage}
                </div>
                
                {solicitationCode && (
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase">Seu Código de Solicitação:</p>
                        <textarea 
                            readOnly 
                            value={solicitationCode}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-[10px] h-24 outline-none"
                        />
                        <button 
                            onClick={copyCode}
                            className="w-full py-2 bg-teal-600 text-white font-bold rounded shadow hover:bg-teal-700 transition-all"
                        >
                            Copiar Código
                        </button>
                    </div>
                )}

                <div className="p-4 border-2 border-red-500 text-red-600 font-bold text-sm animate-blink rounded-lg bg-white">
                    Seu acesso só será liberado após o administrador adicionar seu código no sistema dele!
                </div>
                
                <button
                    onClick={onGoToLogin}
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-teal-600 text-base font-medium rounded-md text-teal-600 bg-white hover:bg-teal-50 transition-colors"
                >
                    Ir para o Login
                </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <div>
                <label htmlFor="username-reg" className="block text-sm font-medium text-slate-600">Usuário</label>
                <input
                  type="text"
                  id="username-reg"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="password-reg" className="block text-sm font-medium text-slate-600">Senha</label>
                <input
                  type="password"
                  id="password-reg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  required
                />
              </div>
               <div>
                <label htmlFor="confirmPassword-reg" className="block text-sm font-medium text-slate-600">Confirmar Senha</label>
                <input
                  type="password"
                  id="confirmPassword-reg"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  Cadastrar e Gerar Código
                </button>
              </div>
            </form>
          )}
          
          {!successMessage && (
            <div className="text-center mt-6">
              <button
                onClick={onGoToLogin}
                className="text-sm font-medium text-slate-500 hover:text-teal-600"
              >
                Já tem uma conta? Faça login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
