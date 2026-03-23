'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData, OrderStatus } from '@/context/DataContext';
import { ArrowLeft, ArrowRight, CheckCircle, Play, Edit, Save, X } from 'lucide-react';

const STATUS_FLOW: Record<OrderStatus, { next?: OrderStatus; label?: string; icon?: any }> = {
  waiting: { next: 'maintenance', label: 'Iniciar manutenção', icon: Play },
  maintenance: { next: 'ready', label: 'Marcar como pronto', icon: ArrowRight },
  ready: { next: 'finished', label: 'Finalizar', icon: CheckCircle },
  finished: {},
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  waiting: 'Aguardando atendimento',
  maintenance: 'Em manutenção',
  ready: 'Pronto para retirada',
  finished: 'Finalizado',
};

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const { orders, getVehicle, getResponsible, updateOrderStatus, updateOrderDescription } = useData();

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  const order = orders.find((o) => o.id === id);
  const vehicle = order ? getVehicle(order.vehicleId) : undefined;
  const responsible = order ? getResponsible(order.responsibleId) : undefined;

  if (!order || !vehicle) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-600 font-medium">Ordem de serviço não encontrada</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 justify-center w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusFlow = STATUS_FLOW[order.status];
  const ButtonIcon = statusFlow.icon;

  const handleStatusChange = () => {
    if (statusFlow.next) {
      updateOrderStatus(order.id, statusFlow.next);
      router.push('/dashboard');
    }
  };

  const handleEditDescription = () => {
    setEditedDescription(order.description);
    setIsEditingDescription(true);
  };

  const handleSaveDescription = () => {
    if (editedDescription.trim()) {
      updateOrderDescription(order.id, editedDescription);
      setIsEditingDescription(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingDescription(false);
    setEditedDescription('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header*/}
          <div className="bg-blue-600 px-8 pt-8 pb-6 rounded-t-2xl text-white">
            <h1 className="text-3xl font-bold text-white mb-4">
              Detalhes da Ordem de Serviço
            </h1>
            
            <div className="flex items-center gap-3">
              <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap">
                {STATUS_LABELS[order.status]}
              </span>
              
              <span className="text-white/90 text-sm font-mono">
                ID: #{order.id}
              </span>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="px-8 py-8 space-y-8">
            {/* Informações do Veículo e Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">
                  Veículo
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Placa</label>
                    <p className="font-mono text-xl font-bold text-slate-800 leading-tight">{vehicle.plate}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Modelo</label>
                    <p className="font-semibold text-slate-700">{vehicle.model}</p>
                  </div>
                </div>
              </section>

              <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">
                  Proprietário
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Nome</label>
                    <p className="font-bold text-slate-800 leading-tight">{vehicle.owner}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Telefone</label>
                    <p className="font-semibold text-blue-600">{vehicle.phone}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Descrição */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  Descrição do Problema
                </h2>
                {!isEditingDescription && (
                  <button
                    onClick={handleEditDescription}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-bold transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    EDITAR
                  </button>
                )}
              </div>
              
              {isEditingDescription ? (
                <div className="space-y-3">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none bg-slate-50"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveDescription}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                    >
                      <Save className="w-4 h-4" />
                      SALVAR
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition"
                    >
                      <X className="w-4 h-4" />
                      CANCELAR
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-slate-700 leading-relaxed bg-white border border-slate-200 p-5 rounded-xl shadow-sm italic">
                  "{order.description}"
                </div>
              )}
            </div>

            {/* Rodapé de Informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div className="flex flex-col">
                <label className="text-[10px] text-blue-600 font-bold uppercase mb-1">Data de abertura</label>
                <p className="text-sm font-semibold text-slate-700">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-blue-600 font-bold uppercase mb-1">Mecânico Responsável</label>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500" />
                   <p className="text-sm font-bold text-slate-800">{responsible?.name || 'Não atribuído'}</p>
                </div>
              </div>
            </div>

            {/* Botão de Ação de Fluxo */}
           {statusFlow.next && statusFlow.label && (
              <div className="pt-8 border-t border-slate-100">
                <button
                  onClick={handleStatusChange}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-blue-200"
                >
                  {ButtonIcon && <ButtonIcon className="w-5 h-5" />}
                  {statusFlow.label.toUpperCase()}
                </button>
              </div>
            )}

            {order.status === 'finished' && (
              <div className="pt-6">
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 p-5 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-bold text-sm uppercase tracking-wide">Ordem de serviço finalizada e arquivada</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}