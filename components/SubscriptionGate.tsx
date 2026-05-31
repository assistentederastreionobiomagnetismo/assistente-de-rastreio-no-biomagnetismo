import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { CheckIcon, SparklesIcon, WhatsAppIcon, MagnetIcon } from './icons/Icons';
import { dbService } from '../services/dbService';

interface SubscriptionGateProps {
    user: User;
    onClose?: () => void;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ user, onClose }) => {
    const [settings, setSettings] = useState<{[key: string]: string}>({});
    
    useEffect(() => {
        dbService.getSettings().then(setSettings);
    }, []);

    // Verificação se é bloqueio total (Trial expirado)
    const createdDate = user.createdAt ? new Date(user.createdAt) : new Date();
    
    // Se o usuário tem uma data de expiração de aprovação (setada pelo admin), usamos ela. 
    // Caso contrário, o fallback é 30 dias após a criação.
    const trialExpiry = user.approvalExpiry 
        ? new Date(user.approvalExpiry) 
        : new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        
    const isTrialExpired = (user.planType === 'trial' || !user.planType) && trialExpiry < new Date();
    const isAnnualExpired = user.planType !== 'trial' && user.approvalExpiry && new Date(user.approvalExpiry) < new Date();
    
    const diff = trialExpiry.getTime() - new Date().getTime();
    const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const isTrialNearExpiry = (user.planType === 'trial' || !user.planType) && daysRemaining <= 5 && daysRemaining > 0;
    
    const isHardBlocked = (isTrialExpired || isAnnualExpired) && user.username !== 'vbsjunior.biomagnetismo';
    
    // Links de Pagamento Dinâmicos (Carregados do Admin)
    const PAYMENT_LINKS = {
        ANNUAL: settings.link_anual || "https://pay.infinitepay.io/seu-link-anual",
        ADHESION: settings.link_adesao || "https://pay.infinitepay.io/seu-link-adesao",
        REFILL_5: settings.link_pacote_5 || "https://pay.infinitepay.io/refill-5",
        REFILL_10: settings.link_pacote_10 || "https://pay.infinitepay.io/refill-10",
        REFILL_20: settings.link_pacote_20 || "https://pay.infinitepay.io/refill-20",
        REFILL_50: settings.link_pacote_50 || "https://pay.infinitepay.io/refill-50"
    };

    const handlePayment = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-start justify-center p-2 md:p-4 overflow-y-auto">
            <div className="max-w-5xl w-full bg-white rounded-[24px] md:rounded-[40px] shadow-2xl overflow-hidden animate-scale-in my-4 md:my-10">
                
                {/* Header */}
                <div className="bg-teal-600 p-6 md:p-8 text-center text-white relative">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-10">
                        <MagnetIcon className="w-24 h-24 md:w-32 md:h-32" />
                    </div>
                    
                    {!isHardBlocked && onClose && (
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-20"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}

                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 relative z-10">Escolha seu Plano de Acesso</h2>
                    <p className="text-sm md:text-base text-teal-100 font-medium relative z-10">Continue transformando vidas com o Assistente de Biomagnetismo</p>
                </div>

                <div className="p-4 md:p-12">
                    {/* Alerta de Trial Expirado ou Perto de Expirar */}
                    {(isTrialExpired || isTrialNearExpiry) && (
                        <div className={`mb-6 md:mb-8 p-4 md:p-6 border-2 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center gap-4 md:gap-6 animate-scale-in ${isTrialExpired ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                            <div className={`p-3 md:p-4 rounded-full shrink-0 ${isTrialExpired ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className={`${isTrialExpired ? 'text-red-800' : 'text-amber-800'} font-black text-lg md:text-xl mb-1`}>
                                    {isTrialExpired ? 'Seu período de testes venceu!' : `Seu período de testes vence em: ${trialExpiry.toLocaleDateString('pt-BR')} às ${trialExpiry.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                                </h3>
                                <p className={`${isTrialExpired ? 'text-red-600' : 'text-amber-700'} font-medium text-xs md:text-sm`}>
                                    {isTrialExpired 
                                        ? 'Escolha abaixo o pacote que mais se adequa às suas necessidades para continuar utilizando o Assistente de Biomagnetismo.' 
                                        : 'Aproveite seus últimos dias de teste! Para garantir o acesso contínuo após essa data, escolha um dos planos abaixo.'}
                                </p>
                            </div>
                            {isTrialNearExpiry && onClose && (
                                <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                                    <button 
                                        onClick={onClose}
                                        className="w-full md:w-auto px-6 py-3 bg-white text-amber-700 font-black rounded-xl border-2 border-amber-200 shadow-sm hover:bg-amber-100 transition-all uppercase tracking-widest text-xs text-center"
                                    >
                                        Ir para meu painel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
                        
                        {/* Plano Anual - DESTAQUE */}
                        <div className="relative border-4 border-teal-500 rounded-[24px] md:rounded-[32px] p-6 md:p-8 bg-teal-50/30 flex flex-col group hover:shadow-2xl transition-all duration-500 mt-4 md:mt-0">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-4 md:px-6 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                                Mais Popular & Melhor Valor
                            </div>
                            
                            <div className="mb-4 md:mb-6 mt-2 md:mt-0">
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">Plano Master Anual</h3>
                                <p className="text-slate-500 text-xs md:text-sm font-medium">Acesso total e ilimitado por 1 ano</p>
                            </div>

                            <div className="mb-6 md:mb-8">
                                <div className="text-slate-400 text-xs md:text-sm line-through font-bold">R$ 699,00</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl md:text-4xl font-black text-teal-600 tracking-tighter">R$ 598,80</span>
                                    <span className="text-slate-500 font-bold text-xs md:text-sm uppercase">à vista</span>
                                </div>
                                <div className="text-teal-600 font-black text-base md:text-lg mt-1 animate-pulse">Ou 12x de R$ 49,90</div>
                            </div>

                            <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-grow text-sm md:text-base">
                                {[
                                    'Sessões ILIMITADAS',
                                    'Todos os Protocolos Liberados',
                                    'Geração de Relatórios PDF',
                                    'Assinatura Digital de Prontuários',
                                    'Suporte Prioritário'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                                        <div className="p-1 md:p-1.5 bg-teal-100 text-teal-600 rounded-full shrink-0">
                                            <CheckIcon className="w-3 h-3 md:w-4 md:h-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => handlePayment(PAYMENT_LINKS.ANNUAL)}
                                className="w-full py-4 md:py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 md:gap-3"
                            >
                                <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" /> Quero Acesso Ilimitado
                            </button>
                        </div>

                        {/* Plano Híbrido */}
                        <div className="border-2 border-slate-200 rounded-[24px] md:rounded-[32px] p-6 md:p-8 bg-white flex flex-col hover:border-teal-200 transition-all duration-300">
                            <div className="mb-4 md:mb-6">
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">Plano Start (Híbrido)</h3>
                                <p className="text-slate-500 text-xs md:text-sm font-medium">Para quem usa ocasionalmente</p>
                            </div>

                            <div className="mb-6 md:mb-8">
                                <div className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Taxa de Adesão Única</div>
                                <div className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter">R$ 97,00</div>
                                <div className="text-teal-600 font-black text-xs md:text-sm mt-2 uppercase tracking-wide bg-teal-50 px-3 py-1 rounded-lg inline-block">5 Sessões Gratuitas/Mês</div>
                            </div>

                            <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-grow text-sm md:text-base">
                                {[
                                    'Incluso 5 sessões por mês',
                                    'Sem mensalidade fixa',
                                    'Recarregue apenas se precisar',
                                    'Acesso a todos os protocolos',
                                    'Relatórios inclusos'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-slate-600 font-medium">
                                        <div className="p-1 md:p-1.5 bg-slate-100 text-slate-400 rounded-full shrink-0">
                                            <CheckIcon className="w-3 h-3 md:w-4 md:h-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => handlePayment(PAYMENT_LINKS.ADHESION)}
                                className="w-full py-4 md:py-5 bg-slate-800 text-white font-black rounded-2xl shadow-lg hover:bg-slate-900 transition-all transform active:scale-95 uppercase tracking-widest text-xs md:text-sm"
                            >
                                Ativar Plano Start
                            </button>
                        </div>
                    </div>

                    {/* Pacotes de Refil */}
                    {(!isTrialExpired && !isAnnualExpired && user.planType && user.planType !== 'trial') && (
                        <div className="bg-slate-50 rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-slate-200 mb-8 md:mb-12">
                        <div className="text-center mb-6 md:mb-8">
                            <h4 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">Precisa de mais sessões?</h4>
                            <p className="text-slate-600 text-xs md:text-sm font-bold mt-1">Compre pacotes de recarga (Disponível apenas para Plano Start)</p>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                            {[
                                { sessions: 5, price: '9,90', url: PAYMENT_LINKS.REFILL_5 },
                                { sessions: 10, price: '14,90', url: PAYMENT_LINKS.REFILL_10 },
                                { sessions: 20, price: '25,90', url: PAYMENT_LINKS.REFILL_20 },
                                { sessions: 50, price: '54,90', url: PAYMENT_LINKS.REFILL_50, highlight: true }
                            ].map((pack, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handlePayment(pack.url)}
                                    className={`p-4 md:p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 md:gap-2 ${pack.highlight ? 'bg-white border-teal-500 shadow-md md:scale-105' : 'bg-white border-slate-200 hover:border-teal-200'}`}
                                >
                                    <span className="text-xl md:text-2xl font-black text-slate-800">{pack.sessions}</span>
                                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessões</span>
                                    <div className="h-px w-full bg-slate-100 my-1 md:my-2" />
                                    <span className="text-base md:text-lg font-black text-teal-600">R$ {pack.price}</span>
                                </button>
                            ))}
                        </div>
                        {user.planType === 'annual' && (
                            <p className="text-center text-[9px] md:text-[10px] text-teal-600 font-bold mt-6 uppercase tracking-widest">Seu plano atual é Ilimitado. Não é necessário comprar recargas.</p>
                        )}
                    </div>
                    )}

                    {/* Footer Info */}
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-6">
                            <div className="flex items-center gap-3 w-full lg:w-auto justify-center">
                                <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="text-[10px] md:text-xs font-bold text-slate-500 text-center md:text-left">Pagamento Seguro via InfinitePay</span>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full lg:w-auto justify-center">
                                <button 
                                    onClick={() => window.open('https://wa.me/5562982458451?text=Olá, acabei de realizar o pagamento e gostaria de enviar meu comprovante.', '_blank')}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 md:py-3 bg-amber-100 text-amber-700 font-black rounded-xl cursor-pointer hover:bg-amber-200 transition-all text-[10px] uppercase tracking-widest shadow-sm"
                                >
                                    <span>JÁ PAGUEI / COMPROVANTE</span>
                                </button>
                                <button 
                                    onClick={() => window.open('https://wa.me/5562982458451?text=Olá, estou na tela de planos e tenho uma dúvida.', '_blank')}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 md:py-3 md:px-2 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none text-xs font-black text-slate-500 uppercase tracking-widest hover:text-teal-600 transition-colors"
                                >
                                    <WhatsAppIcon className="w-4 h-4" /> Dúvidas?
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default SubscriptionGate;
