import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { apiService } from '@/src/services/api';

export interface Owner {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
  email?: string;
}

interface OwnerFormProps {
  owner?: Owner;
  onSuccess?: (owner: Owner) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export function OwnerForm({ owner, onSuccess, onCancel, mode = 'create' }: OwnerFormProps) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  useEffect(() => {
    if (!owner) return;

    setName(owner.name || '');
    setPhone(formatPhone(owner.phone || ''));
    setCpf(formatCPF(owner.cpf || ''));
    setEmail(owner.email || '');
  }, [owner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'edit' && owner?.id) {
        const response = await apiService.put<Owner>(`/owners/${owner.id}`, {
          name,
          cpf,
          email,
          phone,
        });

        if (response.success && response.data) {
          if (onSuccess) onSuccess(response.data);
        } else {
          alert('Erro ao atualizar proprietário. Verifique os dados.');
        }

        return;
      }

      const ownerData = { name, cpf, email, phone };
      const response = await apiService.post<Owner>('/owners', ownerData);

      if (response.success && response.data) {
        if (onSuccess) onSuccess(response.data);
      } else {
        alert('Erro ao cadastrar proprietário. Verifique os dados.');
      }
    } catch {
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className="p-3 border rounded-lg w-full" required />
        <input placeholder="Telefone" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} maxLength={15} className="p-3 border rounded-lg w-full" required />
        <input placeholder="CPF" value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} maxLength={14} className="p-3 border rounded-lg w-full" />
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="p-3 border rounded-lg w-full" />
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg text-slate-600">Cancelar</button>
        )}
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Save className="w-4 h-4" />
          {loading ? 'Salvando...' : mode === 'edit' ? 'Salvar Alterações' : 'Salvar Proprietário'}
        </button>
      </div>
    </form>
  );
}