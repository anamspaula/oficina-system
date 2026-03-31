'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { apiService } from '@/src/services/api';
import { useAuth } from '@/context/AuthContext';

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

interface UserApiResponse {
  id: string;
  name: string;
}

interface MechanicApiResponse {
  id: string;
  name: string;
}

interface OrderApiResponse {
  id: string;
  description: string;
  createdAt: string;
  vehicle?: {
    id: string;
  };
  responsible?: {
    id: string;
    name?: string;
  };
}

interface DataContextType {
  vehicles: Vehicle[];
  owners: Owner[];
  orders: Order[];
  mechanics: { id: string; name: string }[];
  users: { id: string; name: string }[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<Vehicle | null>;
  updateVehicle: (id: string, vehicle: Omit<Vehicle, 'id'>) => Promise<{ success: boolean; status: number }>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; status: number; error?: string }>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrderDescription: (id: string, description: string) => void;
  getVehicle: (id: string) => Vehicle | undefined;
  getResponsible: (id: string) => { id: string; name: string } | undefined;
  addOwner: (owner: Owner) => void;
  updateOwner: (owner: Owner) => void;
  fetchOwners: () => Promise<void>;
  fetchVehicles: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INITIAL_VEHICLES: Vehicle[] = [];
const INITIAL_ORDERS: Order[] = [];

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [mechanics, setMechanics] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  const mapApiVehicleToContext = useCallback(
    (vehicle: VehicleApiResponse): Vehicle => ({
      id: vehicle.id,
      brand: vehicle.brand,
      license_plate: vehicle.licensePlate,
      model: vehicle.model,
      year: vehicle.year,
      userId: vehicle.userId,
      ownerId: vehicle.owner?.id || '',
    }),
    []
  );

  const mapApiOrderToContext = useCallback(
    (order: OrderApiResponse): Order => ({
      id: order.id,
      vehicleId: order.vehicle?.id || '',
      description: order.description,
      responsibleId: order.responsible?.id || '',
      // O backend ainda nao expoe status, entao mantemos o valor inicial no frontend.
      status: 'waiting',
      createdAt: order.createdAt,
    }),
    []
  );

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

  const fetchOrders = useCallback(async () => {
    const response = await apiService.get<OrderApiResponse[]>('/orders');
    if (response.success && response.data) {
      setOrders(response.data.map(mapApiOrderToContext));

      const usersFromOrders = response.data
        .filter((item) => item.responsible?.id && item.responsible?.name)
        .map((item) => ({
          id: item.responsible!.id,
          name: item.responsible!.name!,
        }));

      if (usersFromOrders.length > 0) {
        setUsers((prev) => {
          const merged = [...prev];
          usersFromOrders.forEach((candidate) => {
            const exists = merged.some((item) => item.id === candidate.id);
            if (!exists) {
              merged.push(candidate);
            }
          });
          return merged;
        });
      }
    }
  }, [mapApiOrderToContext]);

  const fetchMechanics = useCallback(async () => {
    const response = await apiService.get<MechanicApiResponse[]>('/user/mechanics');
    if (response.success && response.data) {
      setMechanics(response.data.map((item) => ({ id: item.id, name: item.name })));
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    const response = await apiService.get<UserApiResponse>('/user/me');
    if (response.success && response.data) {
      const currentUser = response.data;
      setUsers((prev) => {
        const alreadyExists = prev.some((user) => user.id === currentUser.id);
        if (alreadyExists) return prev;
        return [...prev, { id: currentUser.id, name: currentUser.name }];
      });
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setVehicles(INITIAL_VEHICLES);
      setOwners([]);
      setOrders(INITIAL_ORDERS);
      setMechanics([]);
      setUsers([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void Promise.all([fetchOwners(), fetchVehicles(), fetchOrders(), fetchCurrentUser(), fetchMechanics()]);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [user, fetchOwners, fetchVehicles, fetchOrders, fetchCurrentUser, fetchMechanics]);

  const addOwner = (newOwner: Owner) => {
    setOwners((prev) => [...prev, newOwner]);
  };

  const updateOwner = (updatedOwner: Owner) => {
    setOwners((prev) => prev.map((owner) => (owner.id === updatedOwner.id ? updatedOwner : owner)));
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
    const payload = {
      brand: vehicle.brand,
      model: vehicle.model,
      license_plate: vehicle.license_plate,
      year: vehicle.year,
      ownerId: vehicle.ownerId,
    };

    const response = await apiService.put<VehicleApiResponse>(`/vehicles/${id}`, payload);
    if (!response.success || !response.data) {
      return { success: false, status: response.status };
    }

    const updatedVehicle = mapApiVehicleToContext(response.data);
    setVehicles((prev) => prev.map((item) => (item.id === id ? updatedVehicle : item)));

    return { success: true, status: response.status };
  };

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const payload = {
      vehicleId: order.vehicleId,
      description: order.description,
      responsibleId: order.responsibleId,
    };

    const response = await apiService.post<OrderApiResponse>('/orders', payload);
    if (!response.success || !response.data) {
      return {
        success: false,
        status: response.status,
        error: response.error || 'Nao foi possível criar a ordem',
      };
    }

    const createdOrder = response.data;
    const savedOrder = mapApiOrderToContext(createdOrder);
    setOrders((prev) => [...prev, savedOrder]);

    const responsible = createdOrder.responsible;
    if (responsible?.id && responsible?.name) {
      const responsibleId = responsible.id;
      const responsibleName = responsible.name;

      setUsers((prev) => {
        const alreadyExists = prev.some((user) => user.id === responsibleId);
        if (alreadyExists) return prev;
        return [...prev, { id: responsibleId, name: responsibleName }];
      });
    }

    return {
      success: true,
      status: response.status,
    };
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const updateOrderDescription = (id: string, description: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, description } : o)));
  };

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);
  const getResponsible = (id: string) => users.find((u) => u.id === id);

  return (
    <DataContext.Provider
      value={{
        vehicles,
        owners,
        orders,
        mechanics,
        users,
        addVehicle,
        updateVehicle,
        addOwner,
        updateOwner,
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

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
