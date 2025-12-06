import { useEffect, useState } from "react";
import { X, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { api } from "../services/api";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Tipagem dos dados que vêm da API
interface Service {
  id: string;
  name: string;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

export function NewOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: NewOrderModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado do Formulário
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Carrinho de Itens (Local)
  const [cart, setCart] = useState<
    { serviceId: string; name: string; quantity: number; price: number }[]
  >([]);

  // Carrega clientes e serviços sempre que o modal abre
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      Promise.all([api.get("/customers"), api.get("/services")])
        .then(([customersRes, servicesRes]) => {
          setCustomers(customersRes.data);
          setServices(servicesRes.data);
        })
        .finally(() => setIsLoading(false));

      // Limpa o formulário
      setCart([]);
      setSelectedCustomer("");
      setSelectedService("");
      setQuantity(1);
    }
  }, [isOpen]);

  const handleAddItem = () => {
    if (!selectedService) return;

    const service = services.find((s) => s.id === selectedService);
    if (!service) return;

    setCart([
      ...cart,
      {
        serviceId: service.id,
        name: service.name,
        quantity: Number(quantity),
        price: service.price,
      },
    ]);

    // Reseta apenas a seleção de serviço para adicionar outro rápido
    setQuantity(1);
    setSelectedService("");
  };

  const handleRemoveItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleSaveOrder = async () => {
    if (!selectedCustomer || cart.length === 0) {
      alert("Por favor, selecione um cliente e adicione itens ao pedido.");
      return;
    }

    try {
      await api.post("/orders", {
        customerId: selectedCustomer,
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      });

      alert("Pedido Salvo com Sucesso!");
      onSuccess(); // Atualiza o Kanban
      onClose(); // Fecha o Modal
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar o pedido. Verifique o console.");
    }
  };

  // Cálculo do Total em Tempo Real
  const total = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

  if (!isOpen) return null;

  return (
    // Overlay Escuro (Fundo)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Janela do Modal */}
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Novo Pedido</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-10 text-gray-500 gap-2">
              <Loader2 className="animate-spin" /> Carregando dados...
            </div>
          ) : (
            <div className="space-y-6">
              {/* 1. Seleção de Cliente */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cliente
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-gray-700"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">Selecione um cliente...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Área de Adicionar Itens (Caixa Cinza) */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Peça / Serviço
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                    >
                      <option value="">Escolha o serviço...</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} - R$ {s.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Qtd.
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min="0.1"
                      step="0.1"
                    />
                  </div>

                  <button
                    onClick={handleAddItem}
                    disabled={!selectedService}
                    className="bg-accent hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors h-[38px]"
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>
              </div>

              {/* 3. Tabela de Itens */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex justify-between items-center">
                  <span>Itens no Carrinho</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {cart.length} itens
                  </span>
                </h3>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {cart.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm italic bg-gray-50">
                      Nenhum item adicionado ainda.
                    </div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                          <th className="p-3">Descrição</th>
                          <th className="p-3 text-center">Qtd</th>
                          <th className="p-3 text-right">Preço Un.</th>
                          <th className="p-3 text-right">Subtotal</th>
                          <th className="p-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cart.map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-3 text-gray-800">{item.name}</td>
                            <td className="p-3 text-center text-gray-600">
                              {item.quantity}
                            </td>
                            <td className="p-3 text-right text-gray-600">
                              R$ {item.price.toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-medium text-gray-800">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                title="Remover item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Totalizador */}
                <div className="flex justify-end items-center gap-4 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200 border-dashed">
                  <span className="text-gray-500 text-sm">
                    Total do Pedido:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Ações */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSaveOrder}
            disabled={isLoading || cart.length === 0}
            className="px-6 py-2.5 bg-primary hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            <Save size={18} />
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
