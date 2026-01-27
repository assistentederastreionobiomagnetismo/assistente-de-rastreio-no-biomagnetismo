
import React from 'react';
import { Session } from '../types';
import SessionSummary from './SessionSummary';

interface SessionDetailModalProps {
  session: Session;
  onClose: () => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex justify-center items-start md:items-center overflow-y-auto p-4 animate-fade-in">
      <div className="bg-slate-100 rounded-2xl shadow-2xl max-w-5xl w-full relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[110] bg-white text-slate-500 hover:text-red-600 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors text-2xl font-bold print:hidden"
        >
          &times;
        </button>
        
        <div className="p-4 md:p-8">
            <SessionSummary 
                patient={session.patient}
                protocolData={session.protocolData}
                pairs={session.pairs}
                phenomena={session.phenomena}
                emotions={session.emotions}
                sensations={session.sensations}
                impactionTime={session.impactionTime}
                notes={session.notes}
                startTime={session.startTime}
                endTime={session.endTime}
                onFinish={() => {}}
                onBack={() => {}}
                isHistorical={true}
            />
            
            <div className="text-center mt-4 print:hidden">
                <button 
                  onClick={onClose}
                  className="px-10 py-2 bg-slate-400 text-white rounded-lg font-bold hover:bg-slate-500 transition-colors"
                >
                    Fechar Detalhes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailModal;
