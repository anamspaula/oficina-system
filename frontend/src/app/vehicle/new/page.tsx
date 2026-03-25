'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { ArrowLeft, Save, Car, UserPlus } from 'lucide-react';
import { OwnerForm } from '@/src/components/OwnerForm';
import { Lookup } from '@/src/components/Lookup';

export default function VehicleFormPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { vehicles, addVehicle, updateVehicle, owners } = useData();

  const isEdit = !!id;
  const existingVehicle = isEdit ? vehicles.find((v) => v.id === id) : undefined;

  // Estados do Veículo
  const [brand, setBrand] = useState(existingVehicle?.brand || '');
  const [license_plate, setLicensePlate] = useState(existingVehicle?.license_plate || '');
  const [model, setModel] = useState(existingVehicle?.model || '');
  const [year, setYear] = useState(existingVehicle?.year || new Date().getFullYear());
  const [userId, setUserId] = useState(existingVehicle?.userId || 'd47e19d7-3861-48a9-bbeb-d029aba2e9c0');
  
  // Estados do Proprietário
  const [selectedOwnerId, setSelectedOwnerId] = useState(existingVehicle?.ownerId || '');
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  const ownerOptions = owners?.map((o: any) => ({
    value: o.id,
    label: `${o.name} - ${o.phone}`
  })) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vehicleData = { 
      brand,
      license_plate, 
      model, 
      year,
      userId,
      ownerId: selectedOwnerId 
    };
    
    if (isEdit && id) {
      updateVehicle(id, vehicleData);
    } else {
      addVehicle(vehicleData);
    }
    
    router.back();
  };

  const formatPlate = (value: string) => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 3) return cleaned;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
  };

  const handleOwnerAdded = (newOwner: any) => {
    setSelectedOwnerId(newOwner.id);
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Modelo e Marca *</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ex: Fiat Uno"
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
                <button
                  type="button"
                  onClick={() => setShowOwnerModal(true)}
                  className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-200 transition"
                >
                  <UserPlus className="w-3 h-3" />
                  NOVO CLIENTE
                </button>
              </div>

              <div className="relative z-10">
                <Lookup
                  options={ownerOptions}
                  value={selectedOwnerId}
                  onChange={setSelectedOwnerId}
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
                disabled={!selectedOwnerId || !license_plate || !model}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold transition shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isEdit ? 'Salvar Alterações' : 'Cadastrar Veículo'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL DE CADASTRO DE OWNER */}
      {showOwnerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-slate-800">Cadastrar Novo Proprietário</h3>
               <button onClick={() => setShowOwnerModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-8">
              <OwnerForm 
                isModal={true} 
                onSuccess={handleOwnerAdded} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}