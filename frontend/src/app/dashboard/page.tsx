'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Bem-vindo, {user?.name}!</h1>
      <p className="text-slate-600">Cargo: {user?.role}</p>
      
      <button 
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded shadow"
      >
        Sair do Sistema
      </button>
    </div>
  );
}