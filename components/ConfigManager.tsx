import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { CheckIcon } from './icons/Icons';

const ConfigManager: React.FC = () => {
    const [settings, setSettings] = useState<{[key: string]: string}>({});
    const [isLoading, setIsLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (key: string, value: string) => {
        setSavingKey(key);
        try {
            await dbService.updateSetting(key, value);
            alert("Configuração salva com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar no banco de dados.");
        } finally {
            setSavingKey(null);
        }
    };

    if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Carregando Configurações...</div>;

    const configFields = [
        { key: 'link_anual', label: 'Link Plano Anual (12x)', placeholder: 'https://pay.infinitepay.io/...' },
        { key: 'link_adesao', label: 'Link Taxa de Adesão (Plano Start)', placeholder: 'https://pay.infinitepay.io/...' },
        { key: 'link_pacote_5', label: 'Link Pacote 5 Sessões', placeholder: 'https://pay.infinitepay.io/...' },
        { key: 'link_pacote_10', label: 'Link Pacote 10 Sessões', placeholder: 'https://pay.infinitepay.io/...' },
        { key: 'link_pacote_20', label: 'Link Pacote 20 Sessões', placeholder: 'https://pay.infinitepay.io/...' },
        { key: 'link_pacote_50', label: 'Link Pacote 50 Sessões', placeholder: 'https://pay.infinitepay.io/...' },
        { key: 'chave_pix', label: 'Chave PIX para Exibição', placeholder: 'Sua chave PIX' },
    ];

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Configurações do Gateway de Pagamento</h2>
                <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">Gerencie seus links da InfinitePay e Chave PIX</p>
            </div>

            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {configFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={settings[field.key] || ''}
                                    onChange={(e) => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                                    placeholder={field.placeholder}
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                />
                                <button
                                    onClick={() => handleSave(field.key, settings[field.key] || '')}
                                    disabled={savingKey === field.key}
                                    className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-md disabled:opacity-50"
                                >
                                    {savingKey === field.key ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-2">💡 Dica Importante</h3>
                    <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        Os links inseridos aqui serão abertos automaticamente quando o usuário clicar em "Assinar" ou "Comprar" na tela de bloqueio do aplicativo. Certifique-se de usar links seguros (https).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConfigManager;
