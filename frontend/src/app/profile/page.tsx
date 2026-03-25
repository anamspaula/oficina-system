'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Save, Lock, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <p className="text-slate-600 font-medium">Carregando perfil...</p>
      </div>
    );
  }

  const profileFormKey = [
    user.id,
    user.name,
    user.birthDate || '',
    user.phone || '',
    user.address || '',
  ].join('|');

  return (
    <ProfileFormContent
      key={profileFormKey}
      user={user}
      onUpdateProfile={updateProfile}
      onChangePassword={changePassword}
      onBackToDashboard={() => router.push('/dashboard')}
    />
  );
}

interface ProfileFormContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    address?: string;
    birthDate?: string;
    phone?: string;
  };
  onUpdateProfile: (data: {
    name?: string;
    address?: string;
    birthDate?: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  onChangePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  onBackToDashboard: () => void;
}

function ProfileFormContent({
  user,
  onUpdateProfile,
  onChangePassword,
  onBackToDashboard,
}: ProfileFormContentProps) {

  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSavingProfile(true);

    const result = await onUpdateProfile({ name, address, birthDate, phone });
    if (result.success) {
      setMessage('Perfil atualizado com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setError(result.error || 'Nao foi possível atualizar o perfil.');
    }

    setSavingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setSavingPassword(true);

    const result = await onChangePassword(currentPassword, newPassword);
    if (result.success) {
      setMessage('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setError(result.error || 'Senha atual incorreta');
    }

    setSavingPassword(false);
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
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          
          {/* Header */}
          <div className="bg-blue-600 px-8 pt-8 pb-6 rounded-t-2xl text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
                <p className="text-blue-100 text-sm opacity-90">
                  Gerencie suas informações e segurança da conta
                </p>
              </div>
            </div>
          </div>

          {/* Área de Mensagens de Feedback */}
          {(message || error) && (
            <div className="px-8 pt-6">
              {message && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded shadow-sm text-sm animate-in fade-in zoom-in duration-200">
                  {message}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm text-sm animate-in fade-in zoom-in duration-200">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Formulário de Dados Básicos */}
          <form onSubmit={handleProfileSubmit} className="px-8 py-8 space-y-8">
            <section>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                Dados Pessoais
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">E-mail Corporativo</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Data de Nascimento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Telefone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-sm font-bold text-slate-700">Endereço Residencial</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, cidade - Estado"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50/50"
                />
              </div>
            </section>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold transition shadow-lg shadow-blue-200"
              >
                <Save className="w-4 h-4" />
                {savingProfile ? 'Atualizando...' : 'Atualizar Perfil'}
              </button>
            </div>
          </form>

          {/* Seção de Alteração de Senha */}
          <div className="px-8 pb-10">
            <div className="pt-8 border-t border-slate-100">
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm transition group"
              >
                <Lock className="w-4 h-4 group-hover:scale-110 transition" />
                {showPasswordSection ? 'OCULTAR OPÇÕES DE SENHA' : 'ALTERAR SENHA'}
              </button>

              {showPasswordSection && (
                <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Senha Atual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Nova Senha</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 dígitos"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-2.5 rounded-lg font-bold transition shadow-md"
                  >
                    <Lock className="w-4 h-4" />
                    {savingPassword ? 'Atualizando...' : 'Confirmar Nova Senha'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}