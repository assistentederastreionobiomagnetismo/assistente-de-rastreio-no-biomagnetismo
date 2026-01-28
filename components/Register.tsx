
import React from 'react';

const Register: React.FC<{ onGoToLogin: () => void }> = ({ onGoToLogin }) => {
  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center border border-slate-200">
        <h1 className="text-3xl font-black text-teal-600 mb-6">Cadastro de Terapeuta</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
            Para garantir a segurança e o controle dos atendimentos, o cadastro de novos terapeutas é realizado exclusivamente pelo **Administrador**.
        </p>
        <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 text-sm text-teal-800 font-medium mb-8">
            Solicite seu acesso ao administrador. Ele criará seu usuário e lhe enviará um **Código de Sincronização** para ativar seu dispositivo.
        </div>
        <button onClick={onGoToLogin} className="w-full py-4 bg-teal-600 text-white font-black rounded-xl shadow-lg">
            Voltar ao Login
        </button>
      </div>
    </div>
  );
};

export default Register;
