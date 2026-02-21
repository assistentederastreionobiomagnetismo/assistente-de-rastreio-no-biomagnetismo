import React, { useState, useEffect } from 'react';
import { ClipboardIcon, WhatsAppIcon } from './icons/Icons';

interface LoginProps {
  onLogin: (username: string, password: string) => { success: boolean; message?: string };
  onRequestReset: (username: string, newPass: string) => { success: boolean; message: string };
  onImportSync?: (code: string) => Promise<boolean>;
}

type ViewMode = 'login' | 'forgot';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('login');



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onLogin(username.trim(), password.trim());
    if (!result.success) setError(result.message || 'Dados de acesso incorretos.');
  };



  const adminWhatsApp = "5562982458451";

  const handleForgotRedirect = () => {
    const msg = `Olá! Sou terapeuta e esqueci minha senha de acesso ao App de Biomagnetismo. Meu usuário é: ${username || '_______'}`;
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleRequestAccess = () => {
    const msg = "Olá! Gostaria de me cadastrar como usuário no aplicativo Assistente de Rastreios no Biomagnetismo.";
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
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Usuário / Login</label>
                  <input
                    type="text"
                    placeholder="Digite seu login"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-bold transition-all"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                    <button type="button" onClick={() => setViewMode('forgot')} className="text-[9px] font-black text-teal-600 uppercase tracking-widest hover:underline">Esqueci a senha</button>
                  </div>
                  <input
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 transition-all transform active:scale-95 uppercase tracking-widest text-sm">
                  Entrar no Painel
                </button>
              </form>

              <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">


                <div className="mt-4 text-center">
                  <button
                    onClick={handleRequestAccess}
                    className="w-full py-4 bg-green-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-green-700 transition-all text-xs uppercase tracking-widest shadow-lg transform active:scale-95"
                  >
                    <WhatsAppIcon className="w-6 h-6" /> Solicitar Acesso
                  </button>
                </div>
              </div>
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