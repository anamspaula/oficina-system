'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function EditUserPage() {
  const { user, getUserByIdAsAdmin, updateUserByAdmin } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params?.id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [isMechanic, setIsMechanic] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isEditingSelf = useMemo(() => user?.id === userId, [user?.id, userId]);

  useEffect(() => {
    if (!userId) return;

    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const loadUser = async () => {
      const response = await getUserByIdAsAdmin(userId);
      if (!response.success || !response.data) {
        setError(response.error || 'Nao foi possível carregar usuário');
        setLoading(false);
        return;
      }

      const managedUser = response.data;
      setName(managedUser.name);
      setEmail(managedUser.email);
      setPhone(managedUser.phone || '');
      setAddress(managedUser.address || '');
      setBirthDate(managedUser.birthDate || '');
      setRole(managedUser.role);
      setIsMechanic(Boolean(managedUser.isMechanic));
      setLoading(false);
    };

    if (user?.role === 'admin') {
      void loadUser();
    }
  }, [user, userId, router, getUserByIdAsAdmin]);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned.length > 0 ? `(${cleaned}` : '';
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!userId) {
      setError('Usuário inválido');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('A confirmação da nova senha não confere');
      return;
    }

    setSaving(true);

    const response = await updateUserByAdmin(userId, {
      name,
      email,
      phone,
      address,
      birthDate,
      role,
      isMechanic,
      newPassword,
    });

    if (!response.success || !response.data) {
      setError(response.error || 'Nao foi possível atualizar usuário');
      setSaving(false);
      return;
    }

    setMessage('Cadastro atualizado com sucesso!');
    setNewPassword('');
    setConfirmPassword('');

    if (isEditingSelf) {
      setRole(response.data.role);
      setIsMechanic(Boolean(response.data.isMechanic));
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <p className="text-slate-600 font-medium">Carregando usuário...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={() => router.push('/users/manage')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para gerenciamento
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 bg-blue-600 text-white">
            <h1 className="text-2xl font-bold">Editar Cadastro de Usuário</h1>
            <p className="text-sm text-blue-100 mt-1">Atualize dados pessoais, permissão e vínculo de mecânico</p>
          </div>

          {(error || message || isEditingSelf) && (
            <div className="px-8 pt-6 space-y-3">
              {isEditingSelf && (
                <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 px-4 py-3 rounded text-sm flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 mt-0.5" />
                  Ao editar seu próprio cadastro, role e status de mecânico permanecem bloqueados.
                </div>
              )}
              {message && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded text-sm">
                  {message}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Data de Nascimento</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Telefone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 98765-4321"
                  maxLength={15}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </section>

            <section>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Endereço Residencial</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </section>

            <section className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Perfil de Permissão</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                  disabled={isEditingSelf}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isMechanic}
                    onChange={(e) => setIsMechanic(e.target.checked)}
                    disabled={isEditingSelf}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  Marcar como mecânico
                </label>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nova Senha (opcional)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </section>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/users/manage')}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2.5 rounded-lg font-bold transition"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
