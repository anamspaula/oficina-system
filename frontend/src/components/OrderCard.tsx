'use client'; 

import { useRouter } from 'next/navigation';
import { useData, Order } from '@/context/DataContext';
import { FileText } from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const { getVehicle } = useData();
  const router = useRouter();
  const vehicle = getVehicle(order.vehicleId);

  // Se o veículo não existir, não renderiza o card para evitar erros
  if (!vehicle) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer group">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-slate-800 text-lg uppercase tracking-tight">
              {vehicle.plate}
            </p>
            <p className="text-sm text-slate-600 font-medium">{vehicle.model}</p>
          </div>
        </div>
        
        <div className="border-t border-slate-100 pt-2">
          <p className="text-xs text-slate-400 uppercase font-bold mb-1">Proprietário</p>
          <p className="text-sm font-semibold text-slate-700">{vehicle.owner}</p>
          <p className="text-sm text-slate-600 mt-2 line-clamp-2 italic">
            &ldquo;{order.description}&rdquo;
          </p>
        </div>
        
        <button
          onClick={() => router.push(`/order/${order.id}`)}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-all mt-3"
        >
          <FileText className="w-4 h-4" />
          Ver detalhes
        </button>
      </div>
    </div>
  );
}