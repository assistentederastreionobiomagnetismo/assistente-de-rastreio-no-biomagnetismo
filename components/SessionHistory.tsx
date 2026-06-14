
import React, { useState, useMemo } from 'react';
import { Session } from '../types';
import { InfoIcon, TrashIcon, PencilIcon, SearchIcon, XIcon } from './icons/Icons';

interface SessionHistoryProps {
  sessions: Session[];
  onViewDetail: (session: Session) => void;
  onEdit: (session: Session) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions, onViewDetail, onEdit, onDelete }) => {
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Filtro por nome (case-insensitive, parcial)
      const matchesName = nameFilter.trim() === '' ||
        session.patient.name.toLowerCase().includes(nameFilter.trim().toLowerCase());

      // Filtro por data: compara a data da sessão com a data selecionada (YYYY-MM-DD)
      let matchesDate = true;
      if (dateFilter) {
        const sessionDate = session.startTime
          ? new Date(session.startTime).toLocaleDateString('en-CA') // 'en-CA' retorna YYYY-MM-DD
          : null;
        matchesDate = sessionDate === dateFilter;
      }

      return matchesName && matchesDate;
    });
  }, [sessions, nameFilter, dateFilter]);

  const hasActiveFilters = nameFilter.trim() !== '' || dateFilter !== '';

  const clearFilters = () => {
    setNameFilter('');
    setDateFilter('');
  };

  return (
    <div className="pt-8 border-t border-slate-200">
      <h3 className="text-xl font-semibold text-slate-700 text-center mb-6">Histórico de Atendimentos</h3>

      {/* Barra de Filtros */}
      {sessions.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          {/* Filtro por Nome */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar por nome do paciente..."
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all shadow-sm"
            />
            {nameFilter && (
              <button
                onClick={() => setNameFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Limpar filtro de nome"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro por Data */}
          <div className="relative sm:w-52">
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all shadow-sm cursor-pointer"
              title="Filtrar por data"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Limpar filtro de data"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Botão Limpar Tudo */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all border border-slate-200 whitespace-nowrap shadow-sm"
            >
              <XIcon className="w-3.5 h-3.5" />
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Contador de Resultados quando filtro ativo */}
      {hasActiveFilters && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            {filteredSessions.length} resultado{filteredSessions.length !== 1 ? 's' : ''} encontrado{filteredSessions.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="mt-2 bg-slate-50 rounded-xl p-2 md:p-6 max-h-[500px] overflow-y-auto shadow-inner border border-slate-200">
        {sessions.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <p className="text-lg">Nenhuma sessão registrada para este usuário.</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center text-slate-400 py-12 flex flex-col items-center gap-3">
            <SearchIcon className="w-10 h-10 text-slate-300" />
            <p className="text-base font-semibold text-slate-500">Nenhuma sessão encontrada</p>
            <p className="text-sm text-slate-400">
              Tente ajustar os filtros ou{' '}
              <button onClick={clearFilters} className="text-teal-600 font-bold hover:underline">
                limpar a pesquisa
              </button>
              .
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filteredSessions.map(session => (
              <li key={session.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-teal-700 text-lg">{session.patient.name}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase font-bold">
                        {session.pairs.length} pares
                      </span>
                      {session.editedAt && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase font-black border border-amber-200" title={`Editado em ${new Date(session.editedAt).toLocaleString('pt-BR')}`}>
                          ✏ Editado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {session.startTime ? new Date(session.startTime).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' }) : 'Data Indisponível'}
                    </p>
                    {session.editedAt && (
                      <p className="text-xs text-amber-600 font-medium mt-0.5">
                        Última edição: {new Date(session.editedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                    <button
                      onClick={() => onEdit(session)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                      title="Editar Atendimento"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => onDelete(session.id, e)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                      title="Excluir Atendimento"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onViewDetail(session)}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-bold shadow-sm"
                    >
                      <InfoIcon className="w-5 h-5" />
                      Detalhes
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
