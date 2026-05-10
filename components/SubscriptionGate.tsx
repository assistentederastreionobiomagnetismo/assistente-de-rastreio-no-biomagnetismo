import React from 'react';
import { User } from '../types';
import { CheckIcon, SparklesIcon, WhatsAppIcon, MagnetIcon } from './icons/Icons';

interface SubscriptionGateProps {
    user: User;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ user }) => {
    
    // Links de Pagamento (Você precisará substituir pelos seus links reais da InfinitePay)
    const PAYMENT_LINKS = {
        ANNUAL: "https://pay.infinitepay.io/seu-link-anual",
        ADHESION: "https://pay.infinitepay.io/seu-link-adesao",
        REFILL_5: "https://pay.infinitepay.io/refill-5",
        REFILL_10: "https://pay.infinitepay.io/refill-10",
        REFILL_20: "https://pay.infinitepay.io/refill-20",
        REFILL_50: "https://pay.infinitepay.io/refill-50"
    };

    const handlePayment = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-5xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden animate-scale-in my-8">
                
                {/* Header */}
                <div className="bg-teal-600 p-8 text-center text-white relative">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-10">
                        <MagnetIcon className="w-32 h-32" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-2 relative z-10">Escolha seu Plano de Acesso</h2>
                    <p className="text-teal-100 font-medium relative z-10">Continue transformando vidas com o Assistente de Biomagnetismo</p>
                </div>

                <div className="p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        
                        {/* Plano Anual - DESTAQUE */}
                        <div className="relative border-4 border-teal-500 rounded-[32px] p-8 bg-teal-50/30 flex flex-col group hover:shadow-2xl transition-all duration-500">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                Mais Popular & Melhor Valor
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">Plano Master Anual</h3>
                                <p className="text-slate-500 text-sm font-medium">Acesso total e ilimitado por 1 ano</p>
                            </div>

                            <div className="mb-8">
                                <div className="text-slate-400 text-sm line-through font-bold">R$ 699,00</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-teal-600 tracking-tighter">R$ 598,80</span>
                                    <span className="text-slate-500 font-bold text-sm uppercase">à vista</span>
                                </div>
                                <div className="text-teal-600 font-black text-lg mt-1 animate-pulse">Ou 12x de R$ 49,90</div>
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {[
                                    'Sessões ILIMITADAS',
                                    'Todos os Protocolos Liberados',
                                    'Geração de Relatórios PDF',
                                    'Assinatura Digital de Prontuários',
                                    'Suporte Prioritário'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                                        <div className="p-1 bg-teal-100 text-teal-600 rounded-full">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => handlePayment(PAYMENT_LINKS.ANNUAL)}
                                className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                            >
                                <SparklesIcon className="w-5 h-5" /> Quero Acesso Ilimitado
                            </button>
                        </div>

                        {/* Plano Híbrido */}
                        <div className="border-2 border-slate-200 rounded-[32px] p-8 bg-white flex flex-col hover:border-teal-200 transition-all duration-300">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">Plano Start (Híbrido)</h3>
                                <p className="text-slate-500 text-sm font-medium">Para quem usa ocasionalmente</p>
                            </div>

                            <div className="mb-8">
                                <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Taxa de Adesão Única</div>
                                <div className="text-4xl font-black text-slate-800 tracking-tighter">R$ 97,00</div>
                                <div className="text-teal-600 font-black text-sm mt-2 uppercase tracking-wide bg-teal-50 px-3 py-1 rounded-lg inline-block">5 Sessões Gratuitas/Mês</div>
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {[
                                    'Incluso 5 sessões por mês',
                                    'Sem mensalidade fixa',
                                    'Recarregue apenas se precisar',
                                    'Acesso a todos os protocolos',
                                    'Relatórios inclusos'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-slate-600 font-medium">
                                        <div className="p-1 bg-slate-100 text-slate-400 rounded-full">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => handlePayment(PAYMENT_LINKS.ADHESION)}
                                className="w-full py-5 bg-slate-800 text-white font-black rounded-2xl shadow-lg hover:bg-slate-900 transition-all transform active:scale-95 uppercase tracking-widest text-sm"
                            >
                                Ativar Plano Start
                            </button>
                        </div>
                    </div>

                    {/* Pacotes de Refil */}
                    <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200">
                        <div className="text-center mb-8">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Precisa de mais sessões?</h4>
                            <p className="text-slate-600 text-sm font-bold">Compre pacotes de recarga (Disponível apenas para Plano Start)</p>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { sessions: 5, price: '9,90', url: PAYMENT_LINKS.REFILL_5 },
                                { sessions: 10, price: '14,90', url: PAYMENT_LINKS.REFILL_10 },
                                { sessions: 20, price: '25,90', url: PAYMENT_LINKS.REFILL_20 },
                                { sessions: 50, price: '54,90', url: PAYMENT_LINKS.REFILL_50, highlight: true }
                            ].map((pack, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handlePayment(pack.url)}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${pack.highlight ? 'bg-white border-teal-500 shadow-md scale-105' : 'bg-white border-slate-200 hover:border-teal-200'}`}
                                >
                                    <span className="text-2xl font-black text-slate-800">{pack.sessions}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessões</span>
                                    <div className="h-px w-full bg-slate-100 my-1" />
                                    <span className="text-lg font-black text-teal-600">R$ {pack.price}</span>
                                </button>
                            ))}
                        </div>
                        {user.planType === 'annual' && (
                            <p className="text-center text-[10px] text-teal-600 font-bold mt-6 uppercase tracking-widest">Seu plano atual é Ilimitado. Não é necessário comprar recargas.</p>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
                        <div className="flex items-center gap-4">
                            <img src="https://infinitepay.io/favicon.ico" className="w-5 h-5 grayscale" alt="InfinitePay" />
                            <span className="text-xs font-bold text-slate-500">Pagamento Processado com Segurança via InfinitePay</span>
                        </div>
                        <button className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-teal-600 transition-colors">
                            <WhatsAppIcon className="w-4 h-4" /> Dúvidas? Fale Conosco
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionGate;
