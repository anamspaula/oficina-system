'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Owner, useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Save, Car, UserPlus, Pencil } from 'lucide-react';
import { OwnerForm } from '@/src/components/OwnerForm';
import { Lookup } from '@/src/components/Lookup';

export default function VehicleFormPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { vehicles, addVehicle, updateVehicle, owners, addOwner, updateOwner, fetchOwners } = useData();

  const isEdit = !!id;
  const existingVehicle = isEdit ? vehicles.find((v) => v.id === id) : undefined;

  // Estados do Veículo
  const [brand, setBrand] = useState(existingVehicle?.brand || '');
  const [license_plate, setLicensePlate] = useState(existingVehicle?.license_plate || '');
  const [model, setModel] = useState(existingVehicle?.model || '');
  const [year, setYear] = useState(String(existingVehicle?.year || ''));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados do Proprietário
  const [selectedOwnerId, setSelectedOwnerId] = useState(existingVehicle?.ownerId || '');
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerModalMode, setOwnerModalMode] = useState<'create' | 'edit'>('create');

  const ownerOptions = owners?.map((o) => ({
    value: String(o.id),
    label: `${o.name} - ${o.phone}`
  })) || [];
  const selectedOwner = owners.find((o) => String(o.id) === selectedOwnerId);

  useEffect(() => {
    void fetchOwners();
  }, [fetchOwners]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const userId = existingVehicle?.userId || user?.id;
    if (!userId) {
      setError('Usuário autenticado não encontrado. Faça login novamente.');
      return;
    }

    setIsSubmitting(true);
    
    const vehicleData = { 
      brand,
      license_plate, 
      model, 
      year: Number(year),
      userId,
      ownerId: selectedOwnerId 
    };
    
    if (isEdit && id) {
      const updatedVehicle = await updateVehicle(id, vehicleData);
      if (!updatedVehicle.success) {
        setError(
          updatedVehicle.status === 403
            ? 'Sua sessão expirou ou não tem permissão para atualizar veículos. Faça login novamente.'
            : 'Não foi possível atualizar o veículo. Verifique os dados e tente novamente.'
        );
        setIsSubmitting(false);
        return;
      }

      sessionStorage.setItem('@Oficina:lastSelectedVehicleId', String(id));
    } else {
      const savedVehicle = await addVehicle(vehicleData);
      if (!savedVehicle) {
        setError('Não foi possível cadastrar o veículo. Verifique os dados informados.');
        setIsSubmitting(false);
        return;
      }

      sessionStorage.setItem('@Oficina:lastSelectedVehicleId', String(savedVehicle.id));
    }
    
    setIsSubmitting(false);
    router.back();
  };

  const formatPlate = (value: string) => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 3) return cleaned;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
  };

  const handleOwnerAdded = (newOwner: Owner) => {
    const ownerId = String(newOwner.id);
    addOwner(newOwner);
    setSelectedOwnerId(ownerId);
    void fetchOwners();
    setShowOwnerModal(false);
  };

  const handleOwnerUpdated = (updatedOwner: Owner) => {
    const ownerId = String(updatedOwner.id);
    updateOwner(updatedOwner);
    setSelectedOwnerId(ownerId);
    void fetchOwners();
    setShowOwnerModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 relative">
      <div className="max-w-3xl mx-auto py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="bg-white rounded-xl shadow-xl border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 rounded-t-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isEdit ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
                </h1>
                <p className="text-blue-100 text-sm opacity-90">
                  Preencha os dados técnicos e vincule a um proprietário
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm text-sm">
                {error}
              </div>
            )}

            {/* Seção Veículo */}
            <section>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-6">Informações do Veículo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Placa *</label>
                  <input
                    type="text"
                    value={license_plate}
                    onChange={(e) => setLicensePlate(formatPlate(e.target.value))}
                    placeholder="ABC-1234"
                    maxLength={8}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Marca *</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ex: Fiat"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Modelo *</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ex: Uno"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ano *</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2026"
                    min={1950}
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Seção Proprietário */}
            <section className="border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-blue-600 uppercase tracking-wider">
                  Proprietário *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerModalMode('create');
                      setShowOwnerModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-200 transition"
                  >
                    <UserPlus className="w-3 h-3" />
                    NOVO CLIENTE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedOwner) return;
                      setOwnerModalMode('edit');
                      setShowOwnerModal(true);
                    }}
                    disabled={!selectedOwner}
                    className="flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full hover:bg-amber-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Pencil className="w-3 h-3" />
                    EDITAR CLIENTE
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <Lookup
                  options={ownerOptions}
                  value={selectedOwnerId}
                  onChange={(value) => setSelectedOwnerId(String(value))}
                  placeholder="Buscar por nome ou telefone do proprietário"
                />
              </div>
            </section>

            {/* Ações */}
            <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => router.back()} 
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={!selectedOwnerId || !license_plate || !brand || !model || !year || isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold transition shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting
                  ? 'Salvando...'
                  : isEdit
                    ? 'Salvar Alterações'
                    : 'Cadastrar Veículo'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL DE CADASTRO DE OWNER */}
      {showOwnerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-600">
               <h3 className="font-bold text-white">
                 {ownerModalMode === 'edit' ? 'Editar Proprietário' : 'Cadastrar Novo Proprietário'}
               </h3>
               <button onClick={() => setShowOwnerModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-8">
              <OwnerForm 
                mode={ownerModalMode}
                owner={ownerModalMode === 'edit' ? selectedOwner : undefined}
                onSuccess={ownerModalMode === 'edit' ? handleOwnerUpdated : handleOwnerAdded}
                onCancel={() => setShowOwnerModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}