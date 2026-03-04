
import React from 'react';
import { Session } from '../types';
import SessionSummary from './SessionSummary';

interface SessionDetailModalProps {
  session: Session;
  onClose: () => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex justify-center items-start overflow-y-auto p-4 md:p-10 animate-fade-in backdrop-blur-sm print:relative print:bg-white print:p-0 print:block">
      <div className="bg-slate-100 rounded-2xl shadow-2xl max-w-5xl w-full relative min-h-min my-auto print:bg-white print:shadow-none print:max-w-none print:m-0 print:rounded-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[110] bg-white text-slate-500 hover:text-red-600 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors text-2xl font-bold print:hidden"
          title="Fechar"
        >
          &times;
        </button>

        <div className="p-2 md:p-6 print:p-0">
          {session.editedAt && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
              <span className="text-amber-600 text-xl">✏</span>
              <div>
                <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Atendimento Editado</p>
                <p className="text-xs text-amber-600 font-medium">Última alteração em: {new Date(session.editedAt).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</p>
              </div>
            </div>
          )}
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
            onFinish={() => { }}
            onBack={() => { }}
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
