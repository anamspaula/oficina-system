'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { apiService } from '@/src/services/api';

// --- Interfaces ---

export type OrderStatus = 'waiting' | 'maintenance' | 'ready' | 'finished';

export interface Order {
  id: string;
  vehicleId: string;
  description: string;
  responsibleId: string;
  status: OrderStatus;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  license_plate: string;
  model: string;
  year: number;
  userId: string;
  ownerId: string;
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
  email?: string;
}

interface VehicleApiResponse {
  id: string;
  brand: string;
  licensePlate: string;
  model: string;
  year: number;
  userId: string;
  owner?: {
    id: string;
  };
}

interface DataContextType {
  vehicles: Vehicle[];
  owners: Owner[];
  orders: Order[];
  users: { id: string; name: string }[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<Vehicle | null>;
  updateVehicle: (id: string, vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrderDescription: (id: string, description: string) => void;
  getVehicle: (id: string) => Vehicle | undefined;
  getResponsible: (id: string) => { id: string; name: string } | undefined;
  addOwner: (owner: Owner) => void;
  fetchOwners: () => Promise<void>;
  fetchVehicles: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Dados Mockados ---

const MOCK_USERS = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Carlos Oliveira' },
];

const INITIAL_VEHICLES: Vehicle[] = [];

const INITIAL_ORDERS: Order[] = [
  {
    id: '1',
    vehicleId: '1',
    description: 'Troca de óleo e filtros',
    responsibleId: '1',
    status: 'waiting',
    createdAt: '2026-02-10T09:00:00',
  },
  {
    id: '2',
    vehicleId: '2',
    description: 'Problema no motor, barulho estranho ao acelerar',
    responsibleId: '2',
    status: 'maintenance',
    createdAt: '2026-02-11T10:30:00',
  },
  {
    id: '3',
    vehicleId: '3',
    description: 'Revisão completa dos freios',
    responsibleId: '1',
    status: 'ready',
    createdAt: '2026-02-09T14:00:00',
  },
];

// --- Provider ---

export function DataProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const mapApiVehicleToContext = useCallback((vehicle: VehicleApiResponse): Vehicle => ({
    id: vehicle.id,
    brand: vehicle.brand,
    license_plate: vehicle.licensePlate,
    model: vehicle.model,
    year: vehicle.year,
    userId: vehicle.userId,
    ownerId: vehicle.owner?.id || '',
  }), []);

  const fetchOwners = useCallback(async () => {
    const response = await apiService.get<Owner[]>('/owners');
    if (response.success && response.data) {
      setOwners(response.data);
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    const response = await apiService.get<VehicleApiResponse[]>('/vehicles');
    if (response.success && response.data) {
      setVehicles(response.data.map(mapApiVehicleToContext));
    }
  }, [mapApiVehicleToContext]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void Promise.all([fetchOwners(), fetchVehicles()]);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchOwners, fetchVehicles]);

  // --- FUNÇÕES DE MANIPULAÇÃO ---

  const addOwner = (newOwner: Owner) => {
    setOwners((prev) => [...prev, newOwner]);
  };

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle | null> => {
    const payload = {
      brand: vehicle.brand,
      model: vehicle.model,
      license_plate: vehicle.license_plate,
      year: vehicle.year,
      ownerId: vehicle.ownerId,
      userId: vehicle.userId,
    };

    const response = await apiService.post<VehicleApiResponse>('/vehicles', payload);
    if (!response.success || !response.data) {
      return null;
    }

    const savedVehicle = mapApiVehicleToContext(response.data);
    setVehicles((prev) => [...prev, savedVehicle]);
    return savedVehicle;
  };

  const updateVehicle = async (id: string, vehicle: Omit<Vehicle, 'id'>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...vehicle, id } : v))
    );
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [...prev, newOrder]);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const updateOrderDescription = (id: string, description: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, description } : o))
    );
  };

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);
  const getResponsible = (id: string) => MOCK_USERS.find((u) => u.id === id);

  return (
    <DataContext.Provider
      value={{
        vehicles,
        owners,
        orders,
        users: MOCK_USERS,
        addVehicle,
        updateVehicle,
        addOwner,
        addOrder,
        updateOrderStatus,
        updateOrderDescription,
        getVehicle,
        getResponsible,
        fetchOwners,
        fetchVehicles,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// --- Hook Customizado ---

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}