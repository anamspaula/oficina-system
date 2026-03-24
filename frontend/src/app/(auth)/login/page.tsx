'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { useAuth } from '@/context/AuthContext';
import { Mail, Car, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword] = useState(false);
  
  const { login, user, loading, error: contextError } = useAuth();
  const router = useRouter();

  // Se o usuário já estiver logado, manda para o dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enquanto verifica se o usuário está logado (pelo localStorage)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-600 p-3 rounded-full">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full mb-4">
            <Car className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-center text-slate-800 mb-1">
            Apollo Veículos
          </h1>
          <p className="text-center text-slate-600">
            Sistema de Gestão
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-slate-100"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-slate-100"
              placeholder="••••••"
              required
            />
          </div>

          {contextError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {contextError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition duration-200 shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600 text-center italic">
            Acesso administrativo e operacional
          </p>
        </div>
      </div>
    </div>
  );
}