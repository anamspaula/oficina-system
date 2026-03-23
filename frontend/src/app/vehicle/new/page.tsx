'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { ArrowLeft, Save, Car } from 'lucide-react';

export default function VehicleFormPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { vehicles, addVehicle, updateVehicle } = useData();

  const isEdit = !!id;
  const existingVehicle = isEdit ? vehicles.find((v) => v.id === id) : undefined;

  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (existingVehicle) {
      setPlate(existingVehicle.plate);
      setModel(existingVehicle.model);
      setOwner(existingVehicle.owner);
      setPhone(existingVehicle.phone);
    }
  }, [existingVehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vehicleData = { plate, model, owner, phone };
    
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
    // Suporta formato antigo ABC-1234 e Mercosul ABC1D23 (limitando a 7 caracteres úteis)
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
  };

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlate(e.target.value);
    setPlate(formatted);
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned.length > 0 ? `(${cleaned}` : '';
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isEdit ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
                </h1>
                <p className="text-blue-100 text-sm opacity-90">
                  {isEdit ? 'Atualize as informações do veículo e proprietário' : 'Preencha os dados para registrar o veículo na oficina'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            <section>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-6">Informações do Veículo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="plate" className="block text-sm font-semibold text-slate-700 mb-2">
                    Placa *
                  </label>
                  <input
                    id="plate"
                    type="text"
                    value={plate}
                    onChange={handlePlateChange}
                    placeholder="ABC-1234"
                    maxLength={8}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition uppercase font-mono"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-semibold text-slate-700 mb-2">
                    Modelo e Marca *
                  </label>
                  <input
                    id="model"
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ex: Fiat Uno 2015 Prata"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-8">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-6">Dados do Proprietário</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="owner" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nome do Cliente *
                  </label>
                  <input
                    id="owner"
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                    Telefone de Contato *
                  </label>
                  <input
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-mono"
                    required
                  />
                </div>
              </div>
            </section>

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
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold transition shadow-lg shadow-blue-200"
              >
                <Save className="w-4 h-4" />
                {isEdit ? 'Salvar Alterações' : 'Cadastrar Veículo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}