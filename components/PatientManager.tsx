
import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import { PlusIcon, SearchIcon, TrashIcon, PencilIcon, UserIcon } from './icons/Icons';

interface PatientManagerProps {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  onExit: () => void;
}

const PatientManager: React.FC<PatientManagerProps> = ({ patients, setPatients, onExit }) => {
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
      setPatients(prev => prev.map(p => p.id === editingPatient.id ? { ...formData, id: p.id } : p));
    } else {
      const newPatient = { ...formData, id: Date.now().toString() };
      setPatients(prev => [...prev, newPatient]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    if (window.confirm('Tem certeza que deseja excluir este paciente? Esta ação é irreversível.')) {
        setPatients(prev => prev.filter(p => p.id !== id));
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
                            onChange={e => setFormData({...formData, name: e.target.value})}
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
                            onChange={e => setFormData({...formData, birthDate: applyDateMask(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Telefone</label>
                        <input 
                            type="tel" 
                            className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-teal-500"
                            placeholder="(00) 00000-0000"
                            value={formData.phone || ''}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">E-mail</label>
                        <input 
                            type="email" 
                            className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-teal-500"
                            value={formData.email || ''}
                            onChange={e => setFormData({...formData, email: e.target.value})}
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

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Gestão de Pacientes</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input 
                type="text" 
                placeholder="Buscar paciente por nome ou email..."
                className="pl-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-teal-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <button onClick={openAddModal} className="ml-4 inline-flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-md shadow-md hover:bg-teal-700 font-bold transition-all">
            <PlusIcon className="w-5 h-5" /> Cadastrar Novo
        </button>
      </div>

      <div className="overflow-hidden border border-slate-200 rounded-lg bg-slate-50">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Nascimento</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Contato</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredPatients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 mr-3">
                        <UserIcon className="h-5 w-5" />
                    </div>
                    <div className="font-medium text-slate-900">{p.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                    {p.birthDate || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                    <div>{p.phone || '-'}</div>
                    <div className="text-xs text-slate-400">{p.email}</div>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                        <button onClick={() => openEditModal(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Editar"><PencilIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Excluir"><TrashIcon className="h-5 w-5" /></button>
                    </div>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Nenhum paciente encontrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center">
        <button onClick={onExit} className="text-teal-600 font-bold hover:underline">Voltar ao Painel Principal</button>
      </div>
    </div>
  );
};

export default PatientManager;
