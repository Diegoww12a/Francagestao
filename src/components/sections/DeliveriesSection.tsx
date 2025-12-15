import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Delivery {
  id: string;
  description: string;
  recipient: string;
  status: 'pending' | 'completed';
  created_at: string;
  completed_at: string | null;
}

export default function DeliveriesSection() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [newDelivery, setNewDelivery] = useState({
    description: '',
    recipient: '',
    status: 'pending' as const
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDeliveries(data);
    }
  };

  const addDelivery = async () => {
    if (!newDelivery.description.trim() || !newDelivery.recipient.trim()) return;

    const { error } = await supabase
      .from('deliveries')
      .insert([newDelivery]);

    if (!error) {
      setNewDelivery({ description: '', recipient: '', status: 'pending' });
      setIsAdding(false);
      fetchDeliveries();
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    const { error } = await supabase
      .from('deliveries')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (!error) {
      fetchDeliveries();
    }
  };

  const deleteDelivery = async (id: string) => {
    const { error } = await supabase
      .from('deliveries')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchDeliveries();
    }
  };

  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');
  const completedDeliveries = deliveries.filter(d => d.status === 'completed');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Entregas</h2>
          <p className="text-gray-400 mt-1">Controle de entregas e destinatários</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Nova Entrega
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-100 text-sm">Entregas Pendentes</p>
            <Package size={24} className="text-orange-200" />
          </div>
          <p className="text-3xl font-bold">{pendingDeliveries.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100 text-sm">Entregas Concluídas</p>
            <CheckCircle2 size={24} className="text-green-200" />
          </div>
          <p className="text-3xl font-bold">{completedDeliveries.length}</p>
        </div>
      </div>

      {isAdding && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Adicionar Nova Entrega</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Destinatário"
              value={newDelivery.recipient}
              onChange={(e) => setNewDelivery({ ...newDelivery, recipient: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <textarea
              placeholder="Descrição da entrega"
              value={newDelivery.description}
              onChange={(e) => setNewDelivery({ ...newDelivery, description: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={addDelivery}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Adicionar
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-orange-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Pendentes</h3>
          <div className="space-y-3">
            {pendingDeliveries.map(delivery => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onToggleStatus={toggleStatus}
                onDelete={deleteDelivery}
              />
            ))}
            {pendingDeliveries.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma entrega pendente</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Concluídas</h3>
          <div className="space-y-3">
            {completedDeliveries.map(delivery => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onToggleStatus={toggleStatus}
                onDelete={deleteDelivery}
              />
            ))}
            {completedDeliveries.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma entrega concluída</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliveryCard({ delivery, onToggleStatus, onDelete }: {
  delivery: Delivery;
  onToggleStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{delivery.recipient}</h4>
          <p className="text-sm text-gray-400">{delivery.description}</p>
        </div>
        <button
          onClick={() => onDelete(delivery.id)}
          className="text-gray-400 hover:text-red-400 transition-colors ml-2"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
        <span className="text-xs text-gray-500">
          {formatDate(delivery.status === 'completed' && delivery.completed_at
            ? delivery.completed_at
            : delivery.created_at)}
        </span>
        <button
          onClick={() => onToggleStatus(delivery.id, delivery.status)}
          className={`text-sm px-3 py-1 rounded transition-colors ${
            delivery.status === 'completed'
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-green-400 hover:text-green-300'
          }`}
        >
          {delivery.status === 'completed' ? 'Reabrir' : 'Concluir'}
        </button>
      </div>
    </div>
  );
}
