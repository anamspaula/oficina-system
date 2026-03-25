'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { ArrowLeft, Plus, FileText, Edit, Car } from 'lucide-react';
import { Lookup } from '@/src/components/Lookup';

export default function CreateOrderPage() {
  const router = useRouter();
  const { vehicles, owners, users, addOrder } = useData();

  const [vehicleId, setVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [responsibleId, setResponsibleId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addOrder({
      vehicleId,
      description,
      responsibleId,
    });
    
    router.push('/dashboard');
  };

  const vehicleOptions = vehicles.map((v) => {
    const owner = owners.find(o => o.id === v.ownerId);
    return {
      value: v.id,
      label: `${v.license_plate} - ${owner ? owner.name : 'Sem Proprietário'}`,
    };
  }); 

  const responsibleOptions = users.map((u) => ({
    value: u.id,
    label: u.name,
  }));

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Nova Ordem de Serviço</h1>
                <p className="text-blue-100 text-sm opacity-90">
                  Inicie um novo atendimento registrando o veículo e o problema
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            
            {/* Seleção de Veículo */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-blue-600 uppercase tracking-wider">
                  Veículo *
                </label>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <Lookup
                    options={vehicleOptions}
                    value={vehicleId}
                    onChange={setVehicleId}
                    placeholder="Buscar por placa ou proprietário"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/vehicle/new')}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition shadow-md"
                  title="Cadastrar novo veículo"
                >
                  <Plus className="w-4 h-4" />
                  <Car className="w-4 h-4" />
                </button>
                {selectedVehicle && (
                  <button
                    type="button"
                    onClick={() => router.push(`/vehicle/edit/${vehicleId}`)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition shadow-md"
                    title="Editar veículo"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </section>

            {/* Card de Resumo do Veículo */}
            {selectedVehicle && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="text-xs font-bold text-blue-700 uppercase mb-4 flex items-center gap-2">
                  <Car className="w-3 h-3" /> Detalhes do Veículo
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Placa</span>
                    <span className="font-mono text-lg font-bold text-slate-700">{selectedVehicle.license_plate}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Modelo</span>
                    <span className="font-semibold text-slate-700">{selectedVehicle.model}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Proprietário</span>
                    <span className="font-semibold text-slate-700">{owners.find(o => o.id === selectedVehicle.ownerId)?.name || 'Não informado'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Contato</span>
                    <span className="font-semibold text-slate-700">
                      {/* Buscamos o dono na lista de owners para pegar o telefone real */}
                      {owners.find(o => o.id === selectedVehicle.ownerId)?.phone || 'Não informado'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Descrição do Problema */}
            <section className="pt-4 border-t border-slate-100">
              <label htmlFor="description" className="block text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">
                Descrição do Problema *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva detalhadamente o que o cliente relatou..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none bg-slate-50/30"
                required
              />
            </section>

            {/* Responsável */}
            <section className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">
                Mecânico Responsável *
              </label>
              <div className="max-w-sm">
                <Lookup
                  options={responsibleOptions}
                  value={responsibleId}
                  onChange={setResponsibleId}
                  placeholder="Selecionar mecânico"
                />
              </div>
            </section>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!vehicleId || !description || !responsibleId}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Plus className="w-5 h-5" />
                Criar Ordem
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}