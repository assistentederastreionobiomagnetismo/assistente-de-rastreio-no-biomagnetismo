import React, { useState } from 'react';
import { WhatsAppIcon, EyeIcon, EyeSlashIcon, CheckIcon, SparklesIcon } from './icons/Icons';

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
    <div className="bg-slate-50 min-h-screen overflow-y-auto notranslate" translate="no">
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Lado Esquerdo - Informações da Plataforma */}
          <div className="space-y-8 animate-fade-in order-2 lg:order-1">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
               <SparklesIcon className="w-4 h-4" /> Plataforma Completa para Terapeutas
             </div>
             
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-[1.1] tracking-tight">
               Transforme seus <span className="text-teal-600 inline-block">Atendimentos de Biomagnetismo</span>
             </h1>
             
             <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
               O Assistente definitivo projetado para facilitar a sua rotina. Organize seus pacientes, conduza rastreios com precisão, consulte o dicionário de pares e gere relatórios profissionais automaticamente em uma única plataforma.
             </p>
             
             <div className="space-y-5 pt-4">
               {[
                 "Dicionário completo e atualizado de Pares Biomagnéticos",
                 "Rastreio passo-a-passo guiado de forma inteligente pelo sistema",
                 "Prontuário eletrônico unificado e histórico detalhado de pacientes",
                 "Geração automática de relatórios em PDF com sua assinatura digital",
                 "Integração nativa de termos de consentimento e checagem de segurança",
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center gap-4 text-slate-700 font-bold text-base md:text-lg">
                   <div className="p-2 bg-teal-100 text-teal-600 rounded-full flex-shrink-0 shadow-sm">
                     <CheckIcon className="w-5 h-5" />
                   </div>
                   {item}
                 </div>
               ))}
             </div>
          </div>

          {/* Lado Direito - Formulário */}
          <div className="w-full max-w-md mx-auto lg:ml-auto lg:mr-0 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative order-1 lg:order-2">
            <div className="p-8 md:p-10">
              <header className="text-center mb-10">
                <h2 className="text-2xl font-black text-teal-600 leading-tight">Painel do Terapeuta</h2>
                <p className="text-slate-400 mt-2 text-[10px] uppercase font-black tracking-[0.2em]">
                  {viewMode === 'login' ? 'Identificação do Terapeuta' : viewMode === 'register' ? 'Crie sua Conta Grátis' : 'Recuperar Acesso'}
                </p>
              </header>

          {viewMode === 'login' && (
            <div className="space-y-8">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black border border-red-100 animate-shake">{error}</div>}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Seu E-mail ou Usuário de Acesso</label>
                  <input
                    type="text"
                    placeholder="seu@email.com ou usuário"
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
                    className="w-full py-4 bg-sky-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-sky-700 transition-all text-xs uppercase tracking-widest shadow-lg transform active:scale-95"
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
      </div>

      {/* Seção de Planos e Teste Grátis */}
      <div className="bg-white border-t border-slate-200 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-6 tracking-tight">Escolha o Plano Ideal para a Sua Rotina</h2>
            <p className="text-slate-500 font-medium text-lg md:text-xl leading-relaxed">
              Comece hoje mesmo com nosso <strong className="text-teal-600">teste gratuito de 30 dias</strong> e depois escolha o plano que melhor se adapta à quantidade de atendimentos que você realiza.
            </p>
          </div>

          {/* Banner 30 Dias Grátis */}
          <div className="bg-gradient-to-r from-teal-600 to-sky-600 rounded-[32px] p-8 md:p-12 text-white shadow-2xl mb-16 flex flex-col md:flex-row items-center justify-between gap-8 transform hover:-translate-y-1 transition-transform border border-teal-500/30 relative overflow-hidden">
             {/* Efeito visual de fundo */}
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
             
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-5 backdrop-blur-md shadow-sm border border-white/10">
                  <SparklesIcon className="w-4 h-4" /> Sem Cartão de Crédito
                </div>
                <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">30 Dias de Teste Grátis Ilimitado</h3>
                <p className="text-teal-50 font-medium text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
                  Crie sua conta agora e tenha acesso total a <strong className="text-white">todas as funcionalidades</strong> do sistema por 1 mês inteiramente grátis, sem nenhum compromisso.
                </p>
             </div>
             <button 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setViewMode('register');
                }}
                className="relative z-10 whitespace-nowrap px-8 py-5 bg-white text-teal-700 font-black rounded-2xl shadow-xl hover:bg-slate-50 hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-sm w-full md:w-auto text-center"
             >
                Quero meu Teste Grátis
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            
            {/* Plano Master Anual */}
            <div className="relative border-4 border-teal-500 rounded-[32px] p-8 md:p-10 bg-teal-50/30 flex flex-col group hover:shadow-2xl transition-all duration-500">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl whitespace-nowrap">
                    Assinatura Ilimitada
                </div>
                
                <div className="mb-6">
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">Plano Master Anual</h3>
                    <p className="text-slate-500 text-base font-medium">Acesso total e ilimitado ao sistema por 1 ano inteiro.</p>
                </div>

                <div className="mb-10 bg-white p-6 rounded-2xl border border-teal-100 shadow-sm">
                    <div className="text-slate-400 text-sm line-through font-bold mb-1">R$ 699,00</div>
                    <div className="flex flex-wrap items-baseline gap-2 mb-2">
                        <span className="text-4xl md:text-5xl font-black text-teal-600 tracking-tighter whitespace-nowrap">R$ 598,80</span>
                        <span className="text-slate-500 font-bold text-sm uppercase whitespace-nowrap">à vista</span>
                    </div>
                    <div className="inline-block bg-teal-50 text-teal-700 font-black text-sm md:text-lg px-4 py-2 rounded-xl">Ou 12x de R$ 49,90</div>
                </div>

                <ul className="space-y-5 mb-10 flex-grow">
                    {[
                        'Sessões ILIMITADAS o ano todo',
                        'Acesso liberado a Todos os Protocolos',
                        'Geração Ilimitada de Relatórios PDF',
                        'Assinatura Digital Integrada em Prontuários',
                        'Suporte Técnico Prioritário'
                    ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-4 text-slate-700 font-bold">
                            <div className="p-1.5 bg-teal-100 text-teal-600 rounded-full shadow-sm">
                                <CheckIcon className="w-5 h-5" />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setViewMode('register');
                    }}
                    className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                >
                    <SparklesIcon className="w-5 h-5" /> Testar 30 Dias e Assinar
                </button>
            </div>

            {/* Plano Start (Híbrido) */}
            <div className="border-2 border-slate-200 rounded-[32px] p-8 md:p-10 bg-white flex flex-col hover:border-teal-200 hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">Plano Start (Híbrido)</h3>
                    <p className="text-slate-500 text-base font-medium">O plano perfeito para terapeutas que atendem ocasionalmente.</p>
                </div>

                <div className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Taxa Única de Adesão</div>
                    <div className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter mb-3 whitespace-nowrap">R$ 97,00</div>
                    <div className="text-teal-700 font-black text-xs md:text-sm uppercase tracking-wide bg-teal-100/50 px-3 md:px-4 py-2 rounded-xl inline-block border border-teal-100">
                      Inclui 5 Sessões Gratuitas/Mês
                    </div>
                </div>

                <ul className="space-y-5 mb-10 flex-grow">
                    {[
                        'Incluso 5 sessões gratuitas todos os meses',
                        'Sem NENHUMA mensalidade fixa obrigatória',
                        'Recarregue pacotes de sessões apenas se precisar',
                        'Acesso integral a todos os protocolos',
                        'Relatórios PDF inclusos sem custo extra'
                    ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-4 text-slate-600 font-bold">
                            <div className="p-1.5 bg-slate-100 text-slate-500 rounded-full">
                                <CheckIcon className="w-5 h-5" />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setViewMode('register');
                    }}
                    className="w-full py-5 bg-slate-800 text-white font-black rounded-2xl shadow-lg hover:bg-slate-900 transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-sm"
                >
                    Testar 30 Dias e Aderir ao Start
                </button>
            </div>
          </div>

          {/* Pacotes de Refil */}
          <div className="bg-slate-50 rounded-[32px] p-8 md:p-12 border border-slate-200">
              <div className="text-center mb-12">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Ultrapassou as 5 sessões mensais gratuitas?</h4>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">Pacotes de Sessões Avulsos</h3>
                  <p className="text-slate-600 text-base font-medium max-w-2xl mx-auto">
                    Caso precise de mais sessões em um determinado mês, você pode comprar recargas avulsas. 
                    <strong className="block mt-1 text-teal-600">Esses pacotes são exclusivos para quem aderiu ao Plano Start.</strong>
                  </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                  {/* Decorative element behind the highlight card */}
                  <div className="hidden lg:block absolute top-1/2 left-[75%] -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-200/50 rounded-full blur-3xl pointer-events-none"></div>

                  {[
                      { sessions: 5, price: '9,90' },
                      { sessions: 10, price: '14,90' },
                      { sessions: 20, price: '25,90' },
                      { sessions: 50, price: '54,90', highlight: true }
                  ].map((pack, idx) => (
                      <div 
                          key={idx}
                          className={`p-8 rounded-[24px] border-2 transition-all duration-300 flex flex-col items-center gap-3 relative ${
                            pack.highlight 
                            ? 'bg-white border-teal-500 shadow-2xl lg:scale-110 z-10 ring-4 ring-teal-500/10' 
                            : 'bg-white border-slate-200 hover:border-teal-300 shadow-md hover:shadow-lg z-0'
                          }`}
                      >
                          {pack.highlight && (
                             <div className="absolute -top-3 bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                               Melhor Custo-Benefício
                             </div>
                          )}
                          <span className={`text-5xl font-black ${pack.highlight ? 'text-teal-600' : 'text-slate-800'} mt-2`}>{pack.sessions}</span>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Sessões</span>
                          <div className="h-px w-full bg-slate-100 my-3" />
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-slate-400 mb-1">Por apenas</span>
                            <span className={`text-3xl font-black ${pack.highlight ? 'text-slate-800' : 'text-teal-600'}`}>R$ {pack.price}</span>
                          </div>
                          
                          <button 
                             onClick={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                setViewMode('register');
                             }}
                             className={`w-full mt-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${
                                pack.highlight 
                                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/30' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                             }`}
                          >
                             Quero este pacote
                          </button>
                      </div>
                  ))}
              </div>
          </div>

        </div>
      </div>
      
      {/* Footer simples da Landing Page */}
      <footer className="bg-slate-900 text-slate-400 py-10 text-center border-t border-slate-800">
        <p className="text-sm font-medium">Assistente de Rastreios no Biomagnetismo &copy; {new Date().getFullYear()}</p>
        <p className="text-xs mt-2 opacity-70">Feito para simplificar a vida do terapeuta.</p>
      </footer>
    </div>
  );
};

export default Login;