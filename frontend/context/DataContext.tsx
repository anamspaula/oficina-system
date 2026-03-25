'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

interface DataContextType {
  vehicles: Vehicle[];
  owners: any[];
  orders: Order[];
  users: { id: string; name: string }[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (id: string, vehicle: Omit<Vehicle, 'id'>) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrderDescription: (id: string, description: string) => void;
  getVehicle: (id: string) => Vehicle | undefined;
  getResponsible: (id: string) => { id: string; name: string } | undefined;
  addOwner: (owner: any) => void;
  fetchOwners: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Dados Mockados ---

const MOCK_USERS = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Carlos Oliveira' },
];

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: '1', brand: 'Fiat', license_plate: 'ABC-1234', model: 'Fiat Uno 2015', year: 2015, userId: 'd47e19d7-3861-48a9-bbeb-d029aba2e9c0', ownerId: '1'
  },
  {
    id: '2', brand: 'VW', license_plate: 'DEF-5678', model: 'VW Gol 2018', year: 2018, userId: 'd47e19d7-3861-48a9-bbeb-d029aba2e9c0', ownerId: '2'
  },
  {
    id: '3', brand: 'Chevrolet', license_plate: 'GHI-9012', model: 'Chevrolet Onix 2020', year: 2020, userId: 'd47e19d7-3861-48a9-bbeb-d029aba2e9c0', ownerId: '3'
  },
];

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
  const [owners, setOwners] = useState<any[]>([]); // Estado dos proprietários
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // --- BUSCA DE PROPRIETÁRIOS NO BACKEND ---
  const fetchOwners = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8080/owners', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOwners(data);
      }
    } catch (error) {
      console.error("Erro ao carregar proprietários:", error);
    }
  };

  // Carrega automaticamente ao iniciar o app
  useEffect(() => {
    fetchOwners();
  }, []);

  // --- FUNÇÕES DE MANIPULAÇÃO ---

  const addOwner = (newOwner: any) => {
    setOwners((prev) => [...prev, newOwner]);
  };

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>): Vehicle => {
    const newVehicle = {
      ...vehicle,
      id: Date.now().toString(),
    };
    setVehicles((prev) => [...prev, newVehicle]);
    return newVehicle;
  };

  const updateVehicle = (id: string, vehicle: Omit<Vehicle, 'id'>) => {
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