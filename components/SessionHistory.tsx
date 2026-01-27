
import React from 'react';
import { Session } from '../types';
import { InfoIcon } from './icons/Icons';

interface SessionHistoryProps {
  sessions: Session[];
  onViewDetail: (session: Session) => void;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions, onViewDetail }) => {
  return (
    <div className="pt-8 border-t border-slate-200">
      <h3 className="text-xl font-semibold text-slate-700 text-center mb-6">Histórico de Atendimentos</h3>
      <div className="mt-4 bg-slate-50 rounded-xl p-2 md:p-6 max-h-[500px] overflow-y-auto shadow-inner border border-slate-200">
        {sessions.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <p className="text-lg">Nenhuma sessão registrada para este usuário.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {sessions.map(session => (
              <li key={session.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-teal-700 text-lg">{session.patient.name}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase font-bold">
                        {session.pairs.length} pares
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {session.startTime ? new Date(session.startTime).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' }) : 'Data Indisponível'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                    <button 
                      onClick={() => onViewDetail(session)}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-bold shadow-sm"
                    >
                      <InfoIcon className="w-5 h-5" />
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SessionHistory;
