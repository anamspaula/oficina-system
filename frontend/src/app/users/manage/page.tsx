'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PencilLine, Shield, User as UserIcon, Wrench } from 'lucide-react';
import { useAuth, type User } from '@/context/AuthContext';

export default function ManageUsersPage() {
  const { user, getUsersForAdmin } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const loadUsers = async () => {
      const response = await getUsersForAdmin();
      if (!response.success || !response.data) {
        setError(response.error || 'Nao foi possível carregar usuários');
        setLoading(false);
        return;
      }

      setUsers(response.data);
      setLoading(false);
    };

    if (user?.role === 'admin') {
      void loadUsers();
    }
  }, [user, router, getUsersForAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <p className="text-slate-600 font-medium">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-5xl mx-auto py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-blue-600">
            <h1 className="text-xl font-bold text-white">Gerenciar Usuários</h1>
            <p className="text-sm text-white mt-1">Edite permissões e dados de cadastro dos usuários</p>
          </div>

          {error && (
            <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="p-6 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="pb-3">Usuário</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Perfil</th>
                  <th className="pb-3">Mecânico</th>
                  <th className="pb-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((managedUser) => (
                  <tr key={managedUser.id} className="border-b last:border-b-0 border-slate-100">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-slate-100">
                          <UserIcon className="w-4 h-4 text-slate-600" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{managedUser.name}</p>
                          <p className="text-xs text-slate-500">{managedUser.phone || 'Sem telefone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-700">{managedUser.email}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        <Shield className="w-3 h-3" />
                        {managedUser.role === 'admin' ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td className="py-4">
                      {managedUser.isMechanic ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                          <Wrench className="w-3 h-3" />
                          Sim
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                          Não
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => router.push(`/users/${managedUser.id}/edit`)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
                      >
                        <PencilLine className="w-4 h-4" />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
