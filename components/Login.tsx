import React, { useState, useEffect } from 'react';
import { ClipboardIcon, WhatsAppIcon } from './icons/Icons';

interface LoginProps {
  onLogin: (username: string, password: string) => { success: boolean; message?: string };
  onRequestReset: (username: string, newPass: string) => { success: boolean; message: string };
  onImportSync: (code: string) => Promise<boolean>;
}

type ViewMode = 'login' | 'sync' | 'forgot';

const Login: React.FC<LoginProps> = ({ onLogin, onImportSync }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [syncCode, setSyncCode] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('login');

  // Verifica se há um código de sincronização na URL ao carregar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('sync');
    if (codeFromUrl) {
      onImportSync(codeFromUrl).then(success => {
        if (success) {
          alert('Dispositivo sincronizado automaticamente com sucesso! Agora você pode fazer o login.');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }, [onImportSync]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onLogin(username.trim(), password.trim());
    if (!result.success) setError(result.message || 'Dados de acesso incorretos.');
  };

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onImportSync(syncCode.trim());
    if (success) {
        alert('Dispositivo sincronizado! O banco de dados foi atualizado. Agora faça seu login.');
        setViewMode('login');
    } else {
        alert('Código de sincronização inválido ou expirado.');
    }
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
                {viewMode === 'login' ? 'Identificação do Terapeuta' : viewMode === 'sync' ? 'Sincronizar Dispositivo' : 'Recuperar Acesso'}
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
                <button onClick={() => setViewMode('sync')} className="w-full py-4 border-2 border-dashed border-teal-200 text-teal-600 font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-teal-50 transition-all text-xs uppercase tracking-widest">
                    <ClipboardIcon className="w-5 h-5" /> Sincronizar Dispositivo
                </button>
                
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

          {viewMode === 'sync' && (
            <form onSubmit={handleSync} className="space-y-6 animate-fade-in">
                <div className="p-5 bg-teal-50 border border-teal-100 rounded-2xl">
                    <p className="text-[11px] text-teal-800 font-bold leading-relaxed text-center italic">
                        Insira o código enviado pelo administrador para liberar seu acesso e atualizar os dados do dispositivo.
                    </p>
                </div>
                <textarea
                    value={syncCode}
                    onChange={e => setSyncCode(e.target.value)}
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[10px] h-40 outline-none focus:ring-2 focus:ring-teal-500 shadow-inner resize-none leading-relaxed"
                    placeholder="Cole o código compactado aqui..."
                    required
                />
                <button type="submit" className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 transition-all transform active:scale-95 uppercase tracking-widest text-sm">
                    Sincronizar Agora
                </button>
                <button onClick={() => setViewMode('login')} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors text-center">
                    Voltar para o Login
                </button>
            </form>
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