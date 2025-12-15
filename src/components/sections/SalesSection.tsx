import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Sale {
  id: string;
  item: string;
  quantity: number;
  price: number;
  buyer: string;
  created_at: string;
}

export default function SalesSection() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [newSale, setNewSale] = useState({
    item: '',
    quantity: '',
    price: '',
    buyer: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSales(data);
    }
  };

  const addSale = async () => {
    if (!newSale.item.trim() || newSale.price.trim() === '') return;

    const formattedQuantity = Number(newSale.quantity.replace(/\./g, "")) || 0;
    const formattedPrice = Number(newSale.price.replace(/\./g, "")) || 0;

    const { error } = await supabase
      .from('sales')
      .insert([{
        item: newSale.item,
        quantity: formattedQuantity,
        price: formattedPrice,
        buyer: newSale.buyer
      }]);

    if (!error) {
      setNewSale({ item: '', quantity: '', price: '', buyer: '' });
      setIsAdding(false);
      fetchSales();
    }
  };

  const deleteSale = async (id: string) => {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);

    if (!error) fetchSales();
  };

  const formatNumber = (n: number) => {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const totalRevenue = sales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  const totalItems = sales.reduce((sum, s) => sum + s.quantity, 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
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
          <h2 className="text-3xl font-bold text-white">Vendas</h2>
          <p className="text-gray-400 mt-1">Registre e acompanhe suas vendas</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Nova Venda
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100 text-sm">Receita Total</p>
            <TrendingUp size={24} className="text-green-200" />
          </div>
          <p className="text-3xl font-bold">R$ {formatNumber(totalRevenue)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <p className="text-blue-100 text-sm mb-2">Total de Vendas</p>
          <p className="text-3xl font-bold">{sales.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <p className="text-purple-100 text-sm mb-2">Itens Vendidos</p>
          <p className="text-3xl font-bold">{formatNumber(totalItems)}</p>
        </div>
      </div>

      {/* FORM */}
      {isAdding && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Registrar Nova Venda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Item vendido"
              value={newSale.item}
              onChange={(e) => setNewSale({ ...newSale, item: e.target.value })}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500"
            />

            {/* QUANTIDADE */}
            <input
              type="text"
              placeholder="Quantidade"
              value={newSale.quantity}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                setNewSale({ ...newSale, quantity: formatted });
              }}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500"
            />

            {/* PREÇO */}
            <input
              type="text"
              placeholder="Preço"
              value={newSale.price}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                setNewSale({ ...newSale, price: formatted });
              }}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Comprador (opcional)"
              value={newSale.buyer}
              onChange={(e) => setNewSale({ ...newSale, buyer: e.target.value })}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={addSale}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Registrar Venda
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* TABELA */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Qtd</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Preço Unit.</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Comprador</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Data</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {sales.map(sale => (
              <tr key={sale.id}>
                <td className="px-6 py-4 text-white">{sale.item}</td>
                <td className="px-6 py-4 text-gray-300">{formatNumber(sale.quantity)}</td>
                <td className="px-6 py-4 text-gray-300">R$ {formatNumber(sale.price)}</td>
                <td className="px-6 py-4 text-green-400 font-semibold">
                  R$ {formatNumber(sale.price * sale.quantity)}
                </td>
                <td className="px-6 py-4 text-gray-300">{sale.buyer || '-'}</td>
                <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(sale.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => deleteSale(sale.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma venda registrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
