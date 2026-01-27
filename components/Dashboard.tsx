
import React, { useState } from 'react';
import { BiomagneticPair, Session, User, Patient } from '../types';
import { PlusIcon, MagnetIcon, UserIcon, CheckIcon } from './icons/Icons';
import SessionHistory from './SessionHistory';
import PairListManager from './PairListManager';
import PatientManager from './PatientManager';

interface DashboardProps {
  onStartNewSession: () => void;
  sessions: Session[];
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  biomagneticPairs: BiomagneticPair[];
  setBiomagneticPairs: React.Dispatch<React.SetStateAction<BiomagneticPair[]>>;
  currentUser: User | null;
  onManageUsers: () => void;
  onViewSessionDetail: (session: Session) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    onStartNewSession, 
    sessions, 
    patients, 
    setPatients, 
    biomagneticPairs, 
    setBiomagneticPairs, 
    currentUser,
    onManageUsers,
    onViewSessionDetail
}) => {
  const [view, setView] = useState<'main' | 'pairManagement' | 'patientManagement'>('main');

  const isCurrentUserAdmin = currentUser?.username.toLowerCase() === 'vbsjunior.biomagnetismo';

  if (view === 'pairManagement' && isCurrentUserAdmin) {
    return (
        <PairListManager 
            biomagneticPairs={biomagneticPairs}
            setBiomagneticPairs={setBiomagneticPairs}
            title="Gerenciamento de Pares (Admin)"
            onExit={() => setView('main')}
            exitButtonText="Voltar para o Painel Principal"
            currentUser={currentUser}
        />
    )
  }

  if (view === 'patientManagement') {
      return (
          <PatientManager 
            patients={patients}
            setPatients={setPatients}
            onExit={() => setView('main')}
          />
      )
  }

  // Define as colunas do grid: 2 para terapeuta comum, 4 para administrador
  const gridCols = isCurrentUserAdmin ? 'md:grid-cols-4' : 'md:grid-cols-2';

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden p-6 md:p-10">
        <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Painel Principal</h2>
            <p className="text-slate-500 mt-2 mb-8">Gerencie seus atendimentos e base de dados.</p>
        </div>

        <div className={`grid grid-cols-1 ${gridCols} gap-6 mb-12`}>
            <button
              onClick={onStartNewSession}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all transform hover:scale-105"
            >
              <PlusIcon className="w-10 h-10 mb-2" />
              <span className="text-sm font-semibold text-center">Iniciar Nova Sessão</span>
            </button>
            
            <button
              onClick={() => setView('patientManagement')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50 transition-all transform hover:scale-105"
            >
              <UserIcon className="w-10 h-10 mb-2" />
              <span className="text-sm font-semibold text-center">Gerenciar Pacientes</span>
            </button>
            
            {isCurrentUserAdmin && (
              <>
                <button
                  onClick={() => setView('pairManagement')}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all transform hover:scale-105"
                >
                  <MagnetIcon className="w-10 h-10 mb-2" />
                  <span className="text-sm font-semibold text-center">Gerenciar Pares (Admin)</span>
                </button>

                <button
                  onClick={onManageUsers}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all transform hover:scale-105"
                >
                  <CheckIcon className="w-10 h-10 mb-2" />
                  <span className="text-sm font-semibold text-center">Gerenciar Acessos</span>
                </button>
              </>
            )}
        </div>
        
        <SessionHistory sessions={sessions} onViewDetail={onViewSessionDetail} />
      </div>
    </div>
  );
};

export default Dashboard;
