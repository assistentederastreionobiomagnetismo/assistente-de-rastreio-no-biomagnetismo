import React, { useState } from 'react';
import { WhatsAppIcon, EyeIcon, EyeSlashIcon } from './icons/Icons';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  onRegister: (data: { fullName: string; username: string; password: string; whatsapp: string }) => Promise<{ success: boolean; message?: string }>;
  onRequestReset: (username: string, newPass: string) => { success: boolean; message: string };
  onImportSync?: (code: string) => Promise<boolean>;
}

type ViewMode = 'login' | 'forgot' | 'register';

const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Campos de Registro
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      const result = await onLogin(username.trim(), password.trim());
      if (!result.success) setError(result.message || 'Dados de acesso incorretos.');
    } catch (err) {
      console.error(err);
      setError('Erro ao processar login. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      const result = await onRegister({
        fullName: regFullName.trim(),
        username: regUsername.trim().toLowerCase(),
        password: regPassword.trim(),
        whatsapp: regWhatsapp.trim()
      });
      if (result.success) {
        alert("Conta criada com sucesso! Você já pode entrar com seu login e senha.");
        setViewMode('login');
        setUsername(regUsername.trim().toLowerCase());
      } else {
        setError(result.message || 'Erro ao criar conta. Verifique os dados.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao processar cadastro. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const adminWhatsApp = "5562982458451";

  const handleForgotRedirect = () => {
    const msg = `Olá! Sou terapeuta e esqueci minha senha de acesso ao App de Biomagnetismo. Meu usuário é: ${username || '_______'}`;
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(msg)}`, '_blank');
  };


  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 notranslate" translate="no">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-10">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-black text-teal-600 leading-tight">Assistente de Rastreios no Biomagnetismo</h1>
            <p className="text-slate-400 mt-2 text-[10px] uppercase font-black tracking-[0.2em]">
              {viewMode === 'login' ? 'Identificação do Terapeuta' : 'Recuperar Acesso'}
            </p>
          </header>

          {viewMode === 'login' && (
            <div className="space-y-8">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black border border-red-100 animate-shake">{error}</div>}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Seu E-mail de Acesso</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold transition-all"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="username"
                    spellCheck={false}
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                    <button type="button" onClick={() => setViewMode('forgot')} className="text-[9px] font-black text-teal-600 uppercase tracking-widest hover:underline">Esqueci a senha</button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all pr-12"
                      autoComplete="current-password"
                      autoCorrect="off"
                      autoCapitalize="none"
                      required
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
                <button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 transition-all transform active:scale-95 uppercase tracking-widest text-sm disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoggingIn && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {isLoggingIn ? 'Verificando Segurança...' : 'Entrar no Painel'}
                </button>
              </form>

              <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setViewMode('register')}
                    className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-all text-xs uppercase tracking-widest shadow-lg transform active:scale-95"
                  >
                    Não tem conta? Cadastre-se Grátis
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'register' && (
            <div className="space-y-8 animate-fade-in">
              <form onSubmit={handleRegister} className="space-y-5">
                {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black border border-red-100 animate-shake">{error}</div>}
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-teal-600 uppercase mb-2 tracking-widest ml-1">Seu Melhor E-mail (Será seu login de acesso)</label>
                  <p className="text-[9px] text-slate-400 font-bold mb-2 ml-1">* O e-mail é obrigatório para garantir seu acesso e suporte.</p>
                  <input
                    type="email"
                    placeholder="exemplo@email.com"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-teal-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium pr-12"
                      required
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

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="DDD + Número"
                    value={regWhatsapp}
                    onChange={e => setRegWhatsapp(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 transition-all transform active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                >
                  {isLoggingIn ? 'Criando sua Conta...' : 'Começar 30 Dias Grátis'}
                </button>
              </form>

              <button onClick={() => setViewMode('login')} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors text-center">
                Já tenho conta? Entrar agora
              </button>
            </div>
          )}

          {viewMode === 'forgot' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl text-center">
                <p className="text-sm font-bold text-amber-800 leading-relaxed mb-4">
                  Por questões de segurança, a recuperação de senha é feita diretamente com o Administrador Mestre.
                </p>
                <p className="text-xs text-amber-700">
                  Informe seu nome ou login para que possamos resetar seu acesso.
                </p>
              </div>

              <button
                onClick={handleForgotRedirect}
                className="w-full py-5 bg-green-600 text-white font-black rounded-2xl shadow-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                <WhatsAppIcon className="w-6 h-6" /> Falar com Administrador
              </button>

              <button onClick={() => setViewMode('login')} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors text-center">
                Voltar para o Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;