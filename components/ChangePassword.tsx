
import React, { useState } from 'react';

interface ChangePasswordProps {
  onUpdate: (newPassword: string) => void;
  onLogout: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onUpdate, onLogout }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    onUpdate(newPassword);
  };

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 notranslate" translate="no">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-10">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-black text-teal-600">Definir Senha Definitiva</h1>
          <p className="text-slate-500 mt-2 text-xs font-bold leading-relaxed">
            Detectamos que este é seu primeiro acesso com a senha provisória. Por segurança, crie uma nova senha agora.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nova Senha</label>
            <input
              type="password"
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Confirmar Nova Senha</label>
            <input
              type="password"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all"
              required
            />
          </div>

          <button type="submit" className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-sm">
            Salvar e Continuar
          </button>
          
          <button type="button" onClick={onLogout} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-red-600 transition-colors">
            Cancelar e Sair
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
