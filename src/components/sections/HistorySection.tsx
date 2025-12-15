import { useState, useEffect } from 'react';
import { CheckCircle2, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HistoryItem {
  id: string;
  type: 'task' | 'mission' | 'purchase' | 'delivery';
  title: string;
  description?: string;
  completed_at: string;
}

export default function HistorySection() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'task' | 'mission' | 'purchase' | 'delivery'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatBR = (v: number) =>
  new Intl.NumberFormat('pt-BR').format(v);

  const fetchHistory = async () => {
    const items: HistoryItem[] = [];

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (tasks) {
      items.push(...tasks.map(t => ({
        id: t.id,
        type: 'task' as const,
        title: t.title,
        description: t.description,
        completed_at: t.completed_at!
      })));
    }

    const { data: missions } = await supabase
      .from('missions')
      .select('*')
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (missions) {
      items.push(...missions.map(m => ({
        id: m.id,
        type: 'mission' as const,
        title: m.title,
        description: m.description,
        completed_at: m.completed_at!
      })));
    }

    const { data: purchases } = await supabase
      .from('purchases')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (purchases) {
      items.push(...purchases.map(p => ({
        id: p.id,
        type: 'purchase' as const,
       title: `${p.item} (${formatBR(p.quantity)}x)`,
        description: `R$ ${formatBR(p.price * p.quantity)}`,
        completed_at: p.created_at
      })));
    }

    const { data: deliveries } = await supabase
      .from('deliveries')
      .select('*')
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (deliveries) {
      items.push(...deliveries.map(d => ({
        id: d.id,
        type: 'delivery' as const,
        title: `Entrega para ${d.recipient}`,
        description: d.description,
        completed_at: d.completed_at!
      })));
    }

    items.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    setHistory(items);
  };

  const filteredHistory = filter === 'all'
    ? history
    : history.filter(item => item.type === filter);

  const typeLabels = {
    task: 'Tarefa',
    mission: 'Missão',
    purchase: 'Compra',
    delivery: 'Entrega'
  };

  const typeColors = {
    task: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    mission: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    purchase: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    delivery: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupByDate = (items: HistoryItem[]) => {
    const groups: { [key: string]: HistoryItem[] } = {};

    items.forEach(item => {
      const date = new Date(item.completed_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });

    return groups;
  };

  const groupedHistory = groupByDate(filteredHistory);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Histórico de Atividades</h2>
        <p className="text-gray-400 mt-1">Visualize todas as atividades concluídas</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-400 text-sm font-semibold">Filtrar por:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('task')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'task'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Tarefas
          </button>
          <button
            onClick={() => setFilter('mission')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'mission'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Missões
          </button>
          <button
            onClick={() => setFilter('purchase')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'purchase'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Compras
          </button>
          <button
            onClick={() => setFilter('delivery')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'delivery'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Entregas
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar size={20} className="text-gray-400" />
              <h3 className="text-lg font-semibold text-white capitalize">{date}</h3>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            <div className="space-y-3">
              {items.map(item => (
                <div key={`${item.type}-${item.id}`} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 size={20} className="text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${typeColors[item.type]}`}>
                          {typeLabels[item.type]}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-500">{formatDate(item.completed_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma atividade concluída no histórico</p>
          </div>
        )}
      </div>
    </div>
  );
}
