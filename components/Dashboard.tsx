
import React, { useState } from 'react';
import { BiomagneticPair, Session, User, Patient } from '../types';
import { PlusIcon, MagnetIcon, UserIcon, CheckIcon, ClipboardIcon, StoreIcon, PlayIcon } from './icons/Icons';
import SessionHistory from './SessionHistory';
import PairListManager from './PairListManager';
import PatientManager from './PatientManager';
import StoreCTA from './StoreCTA';
import { SessionUtils } from '../utils';

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
  onEditSession: (session: Session) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  lastSyncDate: string;
  onOpenStore: () => void;
  onManageOffers: () => void;
  onOpenTutorials: () => void;
  onManageTutorials: () => void;
  monthlyUsage?: number;
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
  onViewSessionDetail,
  onEditSession,
  onDeleteSession,
  lastSyncDate,
  onOpenStore,
  onManageOffers,
  onOpenTutorials,
  onManageTutorials,
  monthlyUsage = 0
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
        exitButtonText="Voltar"
        currentUser={currentUser}
      />
    )
  }

  if (view === 'patientManagement') {
    return (
      <PatientManager
        patients={patients}
        setPatients={setPatients}
        therapistUsername={currentUser?.username || ''}
        onExit={() => setView('main')}
      />
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden p-6 md:p-10">
          <div className="text-center relative mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Painel Principal</h2>
            <div className="flex flex-col items-center mt-2 gap-2">
              <p className="text-slate-500 italic">Selecione uma ação abaixo.</p>
              
              {/* Contador de Sessões (Plano Start) */}
              {currentUser?.planType === 'hybrid' && !isCurrentUserAdmin && (
                <div className="mt-4 flex flex-col gap-2 animate-fade-in w-full">
                  <div className="bg-teal-50 border border-teal-100 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-sm w-full">
                    <div className="flex flex-col items-start flex-1">
                      <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Pacote Mensal</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-teal-700">{Math.max(0, 5 - monthlyUsage)}</span>
                        <span className="text-xs font-bold text-teal-600">sessões do ciclo</span>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-teal-200" />
                    <div className="text-left flex-1">
                      <p className="text-[9px] font-bold text-teal-600 uppercase leading-tight">Plano Start Ativo</p>
                      <p className="text-[9px] text-teal-500 leading-tight">
                        Seu ciclo de 5 sessões reinicia em {currentUser ? new Date(SessionUtils.getActiveCycleStart(currentUser).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') : ''}.
                      </p>
                    </div>
                  </div>
                  
                  {currentUser.sessionPackages && currentUser.sessionPackages.filter(p => new Date(p.expiresAt) > new Date() && p.amount > p.used).length > 0 && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-3 flex flex-col gap-2 shadow-sm w-full">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest text-left">Pacotes Avulsos Adquiridos</span>
                        <div className="flex flex-col gap-1.5">
                            {currentUser.sessionPackages.filter(p => new Date(p.expiresAt) > new Date() && p.amount > p.used).map(p => {
                                const remaining = Math.max(0, p.amount - p.used);
                                const expiresStr = new Date(p.expiresAt).toLocaleDateString('pt-BR');
                                return (
                                    <div key={p.id} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-indigo-100 text-xs">
                                        <span className="font-bold text-indigo-700">{remaining} sessões disponíveis</span>
                                        <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Válido até {expiresStr}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                  )}

                  {SessionUtils.getAvailableSessions(currentUser, monthlyUsage) <= 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-3 flex flex-col gap-1 shadow-sm w-full mt-2">
                          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest text-center">Aviso de Limite</span>
                          <p className="text-red-600 text-[11px] text-center font-medium">As sessões do mês vigente esgotaram. Adquira um pacote avulso em "Nova Sessão" ou altere seu plano para Ilimitado.</p>
                      </div>
                  )}
                </div>
              )}
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <button
            onClick={onStartNewSession}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all transform hover:scale-105"
          >
            <PlusIcon className="w-10 h-10 mb-2" />
            <span className="text-sm font-semibold text-center">Nova Sessão</span>
          </button>

          <button
            onClick={() => setView('patientManagement')}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50 transition-all transform hover:scale-105"
          >
            <UserIcon className="w-10 h-10 mb-2" />
            <span className="text-sm font-semibold text-center">Pacientes</span>
          </button>

          {!isCurrentUserAdmin && (
            <>
              <button
                onClick={onOpenStore}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-all transform hover:scale-105"
              >
                <StoreIcon className="w-10 h-10 mb-2" />
                <span className="text-sm font-semibold text-center">Nossa Loja</span>
              </button>

              <button
                onClick={onOpenTutorials}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50 transition-all transform hover:scale-105"
              >
                <PlayIcon className="w-10 h-10 mb-2" />
                <span className="text-sm font-semibold text-center">Tutoriais</span>
              </button>
            </>
          )}

          {isCurrentUserAdmin && (
            <>
              <button
                onClick={() => setView('pairManagement')}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all transform hover:scale-105"
              >
                <MagnetIcon className="w-10 h-10 mb-2" />
                <span className="text-sm font-semibold text-center">Base de Pares</span>
              </button>

              <button
                onClick={onManageUsers}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all transform hover:scale-105"
              >
                <CheckIcon className="w-10 h-10 mb-2" />
                <span className="text-sm font-semibold text-center">Acessos</span>
              </button>

              <button
                onClick={onManageOffers}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all transform hover:scale-105"
              >
                <div className="relative">
                  <StoreIcon className="w-10 h-10 mb-2" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm font-semibold text-center">Gerenciar Ofertas</span>
              </button>

              <button
                onClick={onManageTutorials}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50 transition-all transform hover:scale-105"
              >
                <div className="relative">
                  <PlayIcon className="w-10 h-10 mb-2" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm font-semibold text-center">Gerenciar Tutoriais</span>
              </button>
            </>
          )}
        </div>

        <SessionHistory
          sessions={sessions}
          onViewDetail={onViewSessionDetail}
          onEdit={onEditSession}
          onDelete={onDeleteSession}
        />
      </div>
      
      {!isCurrentUserAdmin && (
        <StoreCTA onOpenStore={onOpenStore} className="max-w-4xl" />
      )}
    </div>
  );
};

export default Dashboard;
