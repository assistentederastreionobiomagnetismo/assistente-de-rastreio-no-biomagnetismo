
import React, { useState } from 'react';
import { WhatsAppIcon, ClipboardIcon } from './icons/Icons';

interface RegisterProps {
  onRegister: (username: string, password: string) => { success: boolean; token?: string };
  onGoToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onGoToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [solicitationToken, setSolicitationToken] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
        setSolicitationToken(result.token || '');
        setStep(2);
    } else {
        setError('Este nome de usuário já está em uso.');
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(solicitationToken);
    alert('Chave de Solicitação copiada!');
  };

  const sendWhatsApp = () => {
    const message = `Olá! Acabei de me cadastrar no Assistente de Biomagnetismo. Poderia liberar meu acesso? Minha Chave de Solicitação é: ${solicitationToken}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-600">Cadastro de Terapeuta</h1>
            <div className="flex justify-center mt-4 gap-2">
                <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
                <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
            </div>
            <p className="text-slate-500 mt-2 text-sm">
                {step === 1 ? 'Crie suas credenciais de acesso' : 'Envie sua chave para o administrador'}
            </p>
          </header>

          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-bold" role="alert">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="username-reg" className="block text-sm font-bold text-slate-600">Nome de Usuário</label>
                <input
                  type="text"
                  id="username-reg"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  placeholder="Ex: joao.terapeuta"
                  required
                />
              </div>
              <div>
                <label htmlFor="password-reg" className="block text-sm font-bold text-slate-600">Senha</label>
                <input
                  type="password"
                  id="password-reg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
               <div>
                <label htmlFor="confirmPassword-reg" className="block text-sm font-bold text-slate-600">Confirmar Senha</label>
                <input
                  type="password"
                  id="confirmPassword-reg"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  placeholder="Repita sua senha"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-black rounded-xl shadow-lg text-white bg-teal-600 hover:bg-teal-700 transition-all transform hover:scale-[1.02]"
                >
                  Criar Conta Local
                </button>
              </div>
              <div className="text-center">
                <button
                    type="button"
                    onClick={onGoToLogin}
                    className="text-sm font-medium text-slate-500 hover:text-teal-600 underline"
                >
                    Já tem uma conta? Voltar ao Login
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8 animate-fade-in">
                <div className="bg-teal-50 border-2 border-teal-200 p-6 rounded-2xl text-center">
                    <p className="text-teal-800 font-bold text-sm leading-relaxed">
                        Sua conta foi criada no dispositivo! <br/>
                        Agora você precisa enviar sua <b>Chave de Solicitação</b> para o Administrador liberar seu acesso.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Sua Chave de Solicitação</label>
                        <textarea 
                            readOnly 
                            value={solicitationToken}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] h-24 outline-none resize-none shadow-inner"
                        />
                        <button 
                            onClick={copyToken}
                            className="absolute bottom-2 right-2 p-2 bg-white text-slate-500 hover:text-teal-600 rounded-lg shadow-sm border border-slate-200 transition-colors"
                            title="Copiar Chave"
                        >
                            <ClipboardIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={sendWhatsApp}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-black rounded-xl shadow-lg hover:bg-green-700 transition-all transform hover:scale-[1.02]"
                        >
                            <WhatsAppIcon className="w-6 h-6" />
                            Enviar via WhatsApp
                        </button>
                        
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-800 italic text-center">
                            Após enviar, o administrador lhe enviará uma <b>Chave de Liberação</b>. Você deverá usá-la na tela de login.
                        </div>

                        <button
                            onClick={onGoToLogin}
                            className="w-full py-3 bg-white text-slate-500 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all"
                        >
                            Voltar para o Login
                        </button>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
