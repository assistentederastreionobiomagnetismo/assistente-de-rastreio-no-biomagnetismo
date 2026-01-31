import React, { useState, useEffect } from 'react';
import { ClipboardIcon, WhatsAppIcon } from './icons/Icons';

interface LoginProps {
  onLogin: (username: string, password: string) => { success: boolean; message?: string };
  onRequestReset: (username: string, newPass: string) => { success: boolean; message: string };
  // Fixed: Changed return type to Promise<boolean> to match the async implementation in App.tsx
  onImportSync: (code: string) => Promise<boolean>;
}

type ViewMode = 'login' | 'sync';

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
      // Fixed: onImportSync is now async, so we use .then() to handle the result
      onImportSync(codeFromUrl).then(success => {
        if (success) {
          alert('Dispositivo sincronizado automaticamente com sucesso! Agora você pode fazer o login.');
          // Limpa a URL para evitar re-sincronização acidental
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          console.error("Código de sincronização automático inválido.");
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

  // Fixed: Made handleSync async to properly await the result of onImportSync
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

  const whatsappLink = `https://wa.me/5562982458451?text=${encodeURIComponent("Olá! Gostaria de me cadastrar como usuário no aplicativo Assistente de Rastreios no Biomagnetismo.")}`;

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 notranslate" translate="no">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-10">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-black text-teal-600 leading-tight">Assistente de Rastreios no Biomagnetismo</h1>
            <p className="text-slate-400 mt-2 text-[10px] uppercase font-black tracking-[0.2em]">
                {viewMode === 'login' ? 'Identificação do Terapeuta' : 'Sincronizar Dispositivo'}
            </p>
          </header>

          {viewMode === 'login' && (
            <div className="space-y-8">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black border border-red-100 animate-shake">{error}</div>}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Usuário</label>
                    <input
                        type="text"
                        placeholder="Seu nome de usuário"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all"
                        required
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Senha</label>
                    <input
                        type="password"
                        placeholder="Sua senha de acesso"
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
              
              <div className="pt-6 border-t border-slate-100">
                <button onClick={() => setViewMode('sync')} className="w-full py-4 border-2 border-dashed border-teal-200 text-teal-600 font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-teal-50 transition-all text-xs uppercase tracking-widest">
                    <ClipboardIcon className="w-5 h-5" /> Sincronizar Dispositivo
                </button>
                
                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase leading-relaxed mb-4">
                        CASO NÃO TENHA ACESSO, CLIQUE NO BOTÃO ABAIXO PARA FALAR COM O ADMINISTRADOR PARA CADASTRAR SEU DISPOSITIVO.
                    </p>
                    <a 
                      href={whatsappLink}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-green-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-green-700 transition-all text-xs uppercase tracking-widest shadow-lg transform active:scale-95"
                    >
                        <WhatsAppIcon className="w-6 h-6" /> Falar com Administrador
                    </a>
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
                    placeholder="Cole o código criptografado aqui..."
                    required
                />
                <button type="submit" className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 transition-all transform active:scale-95 uppercase tracking-widest text-sm">
                    Sincronizar Agora
                </button>
                <button onClick={() => setViewMode('login')} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                    Voltar para o Login
                </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;