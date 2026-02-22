import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import { PlusIcon, SearchIcon, TrashIcon, PencilIcon, UserIcon } from './icons/Icons';
import { dbService } from '../services/dbService';

interface PatientManagerProps {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  therapistUsername: string;
  onExit: () => void;
}

const PatientManager: React.FC<PatientManagerProps> = ({ patients, setPatients, therapistUsername, onExit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Modal Form State
  const [formData, setFormData] = useState<Patient>({ name: '', birthDate: '', email: '', phone: '', mainComplaint: '' });

  const filteredPatients = useMemo(() => {
    return patients.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [patients, searchTerm]);

  const applyDateMask = (value: string) => {
    let val = value.replace(/\D/g, ''); // remove non-digits
    if (val.length > 8) val = val.slice(0, 8);

    let formatted = val;
    if (val.length > 2) formatted = val.slice(0, 2) + '/' + val.slice(2);
    if (val.length > 4) formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);

    return formatted;
  };

  const openAddModal = () => {
    setEditingPatient(null);
    setFormData({ name: '', birthDate: '', email: '', phone: '', mainComplaint: '' });
    setModalOpen(true);
  };

  const openEditModal = (p: Patient) => {
    setEditingPatient(p);
    setFormData(p);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        const updatedPatient = { ...formData, id: editingPatient.id };
        await dbService.savePatient(therapistUsername, updatedPatient);
        setPatients(prev => prev.map(p => p.id === editingPatient.id ? updatedPatient : p));
      } else {
        const newPatient = { ...formData, id: Date.now().toString() }; // Supabase should generate UUID if not provided, but we keep this for local state
        await dbService.savePatient(therapistUsername, newPatient);
        setPatients(prev => [...prev, newPatient]);
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      alert("Erro ao salvar no Supabase.");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Tem certeza que deseja excluir este paciente? Esta ação é irreversível.')) {
      try {
        await dbService.deletePatient(id, therapistUsername);
        setPatients(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error("Erro ao excluir paciente:", error);
        alert("Erro ao excluir no Supabase.");
      }
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10">

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-teal-700 mb-6">{editingPatient ? 'Editar Paciente' : 'Novo Cadastro de Paciente'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600">Nome Completo</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-teal-500"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Data de Nascimento (DD/MM/AAAA)</label>
                <input
                  type="tel"
                  placeholder="DD/MM/AAAA"
                  inputMode="numeric"
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-teal-500"
                  value={formData.birthDate || ''}
                  onChange={e => setFormData({ ...formData, birthDate: applyDateMask(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Telefone</label>
                <input
                  type="tel"
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-teal-500"
                  placeholder="(00) 00000-0000"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">E-mail</label>
                <input
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-teal-500"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-md font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Gestão de Pacientes</h1>
      </div>

      {/* Barra de busca + botão */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            className="pl-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-teal-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={openAddModal} className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-md shadow-md hover:bg-teal-700 font-bold transition-all whitespace-nowrap">
          <PlusIcon className="w-5 h-5" /> Cadastrar Novo
        </button>
      </div>

      {/* Lista de pacientes — cards responsivos */}
      <div className="space-y-3">
        {filteredPatients.length === 0 && (
          <div className="py-16 text-center text-slate-400 italic border border-slate-200 rounded-xl bg-slate-50">
            Nenhum paciente encontrado.
          </div>
        )}
        {filteredPatients.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              {/* Avatar + dados */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-base leading-tight truncate">{p.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    {p.birthDate && (
                      <span className="text-xs text-slate-500">📅 {p.birthDate}</span>
                    )}
                    {p.phone && (
                      <span className="text-xs text-slate-500">📞 {p.phone}</span>
                    )}
                    {p.email && (
                      <span className="text-xs text-slate-400 truncate">{p.email}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de ação sempre visíveis */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-all"
                  title="Editar Paciente"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all"
                  title="Excluir Paciente"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={onExit} className="text-teal-600 font-bold hover:underline">Voltar ao Painel Principal</button>
      </div>
    </div>
  );
};

export default PatientManager;
