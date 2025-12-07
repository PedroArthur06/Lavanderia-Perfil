import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Search, Plus, Trash2, Save, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export function NewOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Carrinho
  const [cart, setCart] = useState<{ service: Service; quantity: number }[]>(
    []
  );
  const [selectedCustomer, setSelectedCustomer] = useState("");

  // Filtros
  const [searchService, setSearchService] = useState("");

  useEffect(() => {
    api.get("/customers").then((res) => setCustomers(res.data));
    api.get("/services").then((res) => setServices(res.data));
  }, []);

  function addToCart(service: Service) {
    setCart((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFinishOrder() {
    if (!selectedCustomer) return alert("Selecione um cliente!");
    if (cart.length === 0) return alert("Adicione itens ao pedido!");

    try {
      await api.post("/orders", {
        customerId: selectedCustomer,
        items: cart.map((i) => ({
          name: i.service.name,
          quantity: i.quantity,
          unitPrice: i.service.price,
        })),
      });

      // Feedback e Redirecionamento
      const confirmPay = window.confirm(
        "Pedido criado! Deseja registrar o pagamento agora?"
      );
      if (confirmPay) {
        navigate("/orders"); // Vai pra lista para pagar
      } else {
        navigate("/orders"); // Vai pra lista (como fiado)
      }
    } catch (error) {
      alert("Erro ao criar pedido");
    }
  }

  const total = cart.reduce(
    (acc, item) => acc + item.service.price * item.quantity,
    0
  );
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchService.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* Coluna Esquerda: Seleção de Serviços */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-700 mb-2">
            Selecione os Serviços
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar peça (ex: Camisa)..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-none"
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
          {filteredServices.map((service) => (
            <button
              key={service.id}
              onClick={() => addToCart(service)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95 group"
            >
              <span className="font-medium text-gray-700 group-hover:text-blue-700 text-center text-sm">
                {service.name}
              </span>
              <span className="font-bold text-gray-900 mt-1">
                R$ {service.price.toFixed(2)}
              </span>
              <Plus
                size={16}
                className="mt-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Coluna Direita: Carrinho e Cliente */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col">
        {/* Seleção de Cliente */}
        <div className="p-5 bg-primary text-white rounded-t-xl">
          <label className="text-xs font-bold text-blue-200 uppercase mb-1 block">
            Cliente
          </label>
          <div className="flex gap-2">
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg p-2 text-white placeholder-blue-300 focus:bg-white/20 outline-none [&>option]:text-gray-800"
            >
              <option value="">Selecione...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => navigate("/customers")}
              className="bg-white/20 p-2 rounded-lg hover:bg-white/30"
              title="Novo Cliente"
            >
              <UserPlus size={20} />
            </button>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
              <div className="w-16 h-1 bg-gray-100 rounded-full"></div>
              <p>Carrinho vazio</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {item.service.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantity}x R$ {item.service.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700">
                    R$ {(item.quantity * item.service.price).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumo e Botão */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-medium">Total a Pagar</span>
            <span className="text-3xl font-bold text-gray-800">
              R$ {total.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleFinishOrder}
            disabled={cart.length === 0 || !selectedCustomer}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 text-lg transition-all active:scale-95"
          >
            <Save size={24} /> Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
