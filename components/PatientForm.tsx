
import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import { SearchIcon, UserIcon, PlusIcon } from './icons/Icons';

interface PatientFormProps {
  patient: Patient;
  setPatient: React.Dispatch<React.SetStateAction<Patient>>;
  patientsList: Patient[];
  setPatientsList: React.Dispatch<React.SetStateAction<Patient[]>>;
  onNext: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, setPatient, patientsList, setPatientsList, onNext }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // New Patient Modal State
  const [newPatientData, setNewPatientData] = useState<Patient>({
    name: '',
    birthDate: '',
    email: '',
    phone: '',
    mainComplaint: ''
  });

  const calculateAge = (birthDate: string): number | undefined => {
    if (!birthDate) return undefined;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setPatient(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'birthDate') {
        updated.age = calculateAge(value);
      }
      return updated;
    });
  };

  const handleNewPatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPatientData(prev => ({ ...prev, [name]: value }));
  };

  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return patientsList.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, patientsList]);

  const selectExistingPatient = (p: Patient) => {
    setPatient({
        ...p,
        mainComplaint: '', // Reset complaint for new session context
        age: calculateAge(p.birthDate || '')
    });
    setSearchTerm(p.name);
    setShowDropdown(false);
  };

  const handleManualSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setPatient(prev => ({ ...prev, name: e.target.value }));
      setShowDropdown(true);
  };

  const handleRegisterNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Date.now().toString();
    const createdPatient = { ...newPatientData, id: newId };
    
    // Update global list
    setPatientsList(prev => [...prev, createdPatient]);
    
    // Select for current session
    selectExistingPatient(createdPatient);
    
    // Close modal and reset
    setIsRegisterModalOpen(false);
    setNewPatientData({ name: '', birthDate: '', email: '', phone: '', mainComplaint: '' });
  };

  const isFormValid = patient.name.trim() !== '' && (patient.birthDate || '').trim() !== '';

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-700 mb-6">Informações do Atendimento</h2>
      
      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-teal-700 mb-6">Cadastrar Novo Paciente</h3>
            <form onSubmit={handleRegisterNewPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600">Nome Completo</label>
                <input 
                  type="text" 
                  name="name"
                  required 
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  value={newPatientData.name}
                  onChange={handleNewPatientChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Data de Nascimento</label>
                <input 
                  type="date" 
                  name="birthDate"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  value={newPatientData.birthDate || ''}
                  onChange={handleNewPatientChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Telefone</label>
                <input 
                  type="tel" 
                  name="phone"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="(00) 00000-0000"
                  value={newPatientData.phone || ''}
                  onChange={handleNewPatientChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">E-mail</label>
                <input 
                  type="email" 
                  name="email"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="exemplo@email.com"
                  value={newPatientData.email || ''}
                  onChange={handleNewPatientChange}
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-md font-bold hover:bg-teal-700 shadow-md transition-all">Salvar e Selecionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <form onSubmit={(e) => {e.preventDefault(); onNext();}} className="space-y-6">
        
        <div className="relative">
          <label htmlFor="name-search" className="block text-sm font-medium text-slate-600 mb-1">Buscar ou Nome do Paciente</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name-search"
                  value={searchTerm}
                  onChange={handleManualSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  className="block w-full px-3 py-2 pl-10 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Pesquise por um nome já cadastrado..."
                  required
                />
            </div>
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-teal-600 text-sm font-medium rounded-md text-teal-600 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors shadow-sm"
              title="Cadastrar Novo Paciente"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              <span>Novo Paciente</span>
            </button>
          </div>

          {showDropdown && filteredPatients.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredPatients.map((p, idx) => (
                      <div 
                        key={p.id || idx} 
                        onClick={() => selectExistingPatient(p)}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-teal-50 text-slate-900"
                      >
                          <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-2 text-slate-400" />
                              <span className="font-medium">{p.name}</span>
                              <span className="ml-2 text-xs text-slate-400">{p.phone}</span>
                          </div>
                      </div>
                  ))}
              </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label htmlFor="birthDate" className="block text-sm font-medium text-slate-600">Data de Nascimento</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={patient.birthDate || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                required
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="age" className="block text-sm font-medium text-slate-600">Idade Calculada</label>
              <div className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md shadow-sm text-slate-700 sm:text-sm h-10">
                {patient.age !== undefined ? `${patient.age} anos` : '---'}
              </div>
            </div>
            <div className="md:col-span-1">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-600">Telefone para Contato</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={patient.phone || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="(00) 00000-0000"
              />
            </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-600">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={patient.email || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="exemplo@email.com"
          />
        </div>

        <div>
          <label htmlFor="mainComplaint" className="block text-sm font-medium text-slate-600">Queixa Principal (Opcional)</label>
          <textarea
            id="mainComplaint"
            name="mainComplaint"
            value={patient.mainComplaint}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="Descreva o motivo da consulta atual..."
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!isFormValid}
            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            Próximo: Rastreio
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
