
import React from 'react';
import { Session } from '../types';
import SessionSummary from './SessionSummary';

interface SessionDetailModalProps {
  session: Session;
  onClose: () => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex justify-center items-start overflow-y-auto p-4 md:p-10 animate-fade-in backdrop-blur-sm">
      <div className="bg-slate-100 rounded-2xl shadow-2xl max-w-5xl w-full relative min-h-min my-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[110] bg-white text-slate-500 hover:text-red-600 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors text-2xl font-bold print:hidden"
          title="Fechar"
        >
          &times;
        </button>
        
        <div className="p-2 md:p-6">
            <SessionSummary 
                patient={session.patient}
                protocolData={session.protocolData}
                pairs={session.pairs}
                phenomena={session.phenomena}
                emotions={session.emotions}
                sensations={session.sensations}
                emotionsNotes={session.emotionsNotes}
                sensationsNotes={session.sensationsNotes}
                protocolNotes={session.protocolNotes}
                levelINotes={session.levelINotes}
                levelIINotes={session.levelIINotes}
                levelIIINotes={session.levelIIINotes}
                phenomenaNotes={session.phenomenaNotes}
                impactionTime={session.impactionTime}
                notes={session.notes}
                startTime={session.startTime}
                endTime={session.endTime}
                onFinish={() => {}}
                onBack={() => {}}
                isHistorical={true}
            />
            
            <div className="text-center pb-8 print:hidden">
                <button 
                  onClick={onClose}
                  className="px-12 py-3 bg-slate-500 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors shadow-lg uppercase tracking-widest text-sm"
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
