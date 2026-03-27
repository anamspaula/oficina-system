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

  useEffect(() => {
    if (!owner) return;

    setName(owner.name || '');
    setPhone(owner.phone || '');
    setCpf(owner.cpf || '');
    setEmail(owner.email || '');
  }, [owner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'edit' && owner?.id) {
        const response = await apiService.put<Owner>(`/owners/${owner.id}`, {
          name,
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

  // ... (Mantenha suas funções formatCPF e formatPhone aqui)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className="p-3 border rounded-lg w-full" required />
        <input placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} className="p-3 border rounded-lg w-full" required />
        {mode === 'create' && (
          <input placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} className="p-3 border rounded-lg w-full" />
        )}
        {mode === 'create' && (
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="p-3 border rounded-lg w-full" />
        )}
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