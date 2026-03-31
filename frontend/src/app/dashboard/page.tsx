'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData, OrderStatus } from '@/context/DataContext';
import { Plus, Search } from 'lucide-react';
import { OrderCard } from '@/src/components/OrderCard';
import { Lookup } from '@/src/components/Lookup';
import { UserMenu } from '@/src/components/UserMenu';

const STATUS_CONFIG: Record<OrderStatus, { title: string; color: string; border: string }> = {
  waiting: { title: 'Aguardando', color: 'bg-yellow-50', border: 'border-yellow-200' },
  maintenance: { title: 'Em Manutenção', color: 'bg-blue-50', border: 'border-blue-200' },
  ready: { title: 'Pronto para Retirada', color: 'bg-green-50', border: 'border-green-200' },
  finished: { title: 'Finalizado', color: 'bg-slate-50', border: 'border-slate-200' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { orders, vehicles, mechanics, owners } = useData();
  const router = useRouter();
  
  const [selectedResponsible, setSelectedResponsible] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  // Filtrar ordens
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchResponsible = !selectedResponsible || order.responsibleId === selectedResponsible;
      const matchVehicle = !selectedVehicleId || order.vehicleId === selectedVehicleId;
      return matchResponsible && matchVehicle;
    });
  }, [orders, selectedResponsible, selectedVehicleId]);

  // Agrupar ordens por status
  const ordersByStatus = useMemo(() => {
    const grouped: Record<OrderStatus, typeof orders> = {
      waiting: [],
      maintenance: [],
      ready: [],
      finished: [],
    };
    
    filteredOrders.forEach((order) => {
      grouped[order.status].push(order);
    });
    
    return grouped;
  }, [filteredOrders]);

  // Opções para os lookups
  const responsibleOptions = mechanics.map((u) => ({ value: u.id, label: u.name }));
  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.license_plate} - ${owners.find((o) => o.id === v.ownerId)?.name || 'Sem proprietário'}`,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-none">Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">
              Olá, <span className="font-semibold text-blue-600">{user?.name || 'Operador'}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/order/new')}
              className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Ordem
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />
            <UserMenu />
          </div>
        </div>

        {/* Barra de Filtros (Opcional: manter aqui ou logo abaixo como fizemos antes) */}
        <div className="bg-slate-50/50 border-t border-slate-100 py-3">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Search className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Filtros:</span>
            </div>
            
            <div className="w-full sm:w-64">
              <Lookup
                options={responsibleOptions}
                value={selectedResponsible}
                onChange={setSelectedResponsible}
                placeholder="Responsável"
              />
            </div>
            
            <div className="w-full sm:w-72">
              <Lookup
                options={vehicleOptions}
                value={selectedVehicleId}
                onChange={setSelectedVehicleId}
                placeholder="Veículo ou Cliente"
              />
            </div>

            {(selectedResponsible || selectedVehicleId) && (
              <button
                onClick={() => {
                  setSelectedResponsible('');
                  setSelectedVehicleId('');
                }}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((status) => (
            <div key={status} className="flex flex-col min-w-[280px]">
              
              {/* Cabeçalho da Coluna com Cor, Título e Contador Detalhado */}
              <div className={`rounded-t-lg border-2 border-b-0 ${STATUS_CONFIG[status].color} ${STATUS_CONFIG[status].border} px-4 py-3`}>
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  {STATUS_CONFIG[status].title}
                </h2>
                {/* Totalizador com lógica de plural */}
                <span className="text-xs text-slate-600 font-medium">
                  {ordersByStatus[status].length} {ordersByStatus[status].length === 1 ? 'ordem' : 'ordens'}
                </span>
              </div>
              
              {/* Corpo da Coluna (Lista de Cards) */}
              <div className="bg-white border-2 border-t-0 border-slate-200 rounded-b-lg p-3 flex-1 space-y-4 min-h-[400px] shadow-sm">
                {ordersByStatus[status].map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
                
                {ordersByStatus[status].length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-12 italic uppercase tracking-widest text-[10px]">
                    Nenhuma ordem neste status
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}