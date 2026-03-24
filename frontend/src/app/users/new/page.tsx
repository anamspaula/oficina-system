'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, UserPlus, Save } from 'lucide-react';

export default function CreateUserPage() {
  const { user, addUser } = useAuth(); 
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apenas admins podem acessar esta página
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await addUser({
        name,
        email,
        password,
        address,
        birthDate,
        phone,
        role,
      });

      if (success) {
        setSuccessMessage('Usuário criado com sucesso! Redirecionando...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError('Não foi possível criar o usuário. Verifique os dados informados.');
      }
    } catch {
      setError('Erro ao criar usuário');
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Criar Novo Usuário</h1>
                <p className="text-blue-100 text-sm opacity-90">
                  Preencha as informações para cadastrar um novo colaborador
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded shadow-sm text-sm">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm text-sm">
                {error}
              </div>
            )}

            <section>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-6">Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Endereço Residencial</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, cidade - UF"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </section>

            <section className="border-t border-slate-100 pt-8">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-6">Acesso ao Sistema</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Senha de Acesso *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmar Senha *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 w-full md:w-1/2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Perfil de Permissão *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                >
                  <option value="user">Colaborador (Padrão)</option>
                  <option value="admin">Administrador (Total)</option>
                </select>
              </div>
            </section>

            <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2.5 rounded-lg font-bold transition shadow-lg shadow-blue-200"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Salvando...' : 'Salvar Usuário'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}