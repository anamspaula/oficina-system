import { useState } from 'react';
import { Save, X } from 'lucide-react';

interface OwnerFormProps {
  onSuccess?: (owner: any) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export function OwnerForm({ onSuccess, onCancel, isModal = false }: OwnerFormProps) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const ownerData = { name, cpf, email, phone };

    try {
      const response = await fetch('http://localhost:8080/owners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(ownerData)
      });

      if (response.ok) {
        const savedOwner = await response.json();
        if (onSuccess) onSuccess(savedOwner);
      } else {
        alert("Erro ao cadastrar proprietário. Verifique os dados.");
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // ... (Mantenha suas funções formatCPF e formatPhone aqui)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className="p-3 border rounded-lg w-full" required />
        <input placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} className="p-3 border rounded-lg w-full" required />
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="p-3 border rounded-lg w-full" />
        <input placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} className="p-3 border rounded-lg w-full" required />
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg text-slate-600">Cancelar</button>
        )}
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Save className="w-4 h-4" /> {loading ? 'Salvando...' : 'Salvar Proprietário'}
        </button>
      </div>
    </form>
  );
}