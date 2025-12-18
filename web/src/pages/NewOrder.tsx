import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Search, Plus, Trash2, Save, UserPlus, Loader2 } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { Modal } from "../components/Modal";
import { PaymentModal } from "../components/PaymentModal";
import { Toaster, toast } from "sonner";
import { formatCurrency } from "../lib/utils"; 

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

  const [cart, setCart] = useState<{ service: Service; quantity: number }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [discount, setDiscount] = useState("");
  
  // UX States
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [searchService, setSearchService] = useState("");

  // Modais
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [showRealPaymentModal, setShowRealPaymentModal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/customers"),
      api.get("/services")
    ]).then(([custRes, servRes]) => {
      setCustomers(custRes.data);
      setServices(servRes.data);
    }).catch(() => toast.error("Erro ao carregar dados iniciais."));
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

    toast.success(`${service.name} adicionado!`, { duration: 1000, position: 'bottom-center' });
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFinishOrder() {
    if (!selectedCustomer) return toast.warning("Selecione um cliente para continuar.");
    if (cart.length === 0) return toast.warning("O carrinho está vazio.");

    setIsSubmitting(true); 

    try {
      const response = await api.post("/orders", {
        customerId: selectedCustomer,
        items: cart.map((i) => ({
          serviceId: i.service.id,
          quantity: i.quantity,
        })),
        discount: parseFloat(discount) || 0,
      });

      setCreatedOrder(response.data);
      setShowPaymentModal(true);
      toast.success("Pedido criado com sucesso!");

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Erro desconhecido ao criar pedido.";
      
      if (error.response?.data?.errors) {
         const zodErrors = error.response.data.errors.map((e: any) => e.message).join(", ");
         toast.error(`Erro de validação: ${zodErrors}`);
      } else {
         toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false); 
    }
  }

  function handlePaymentSuccess() {
    setShowRealPaymentModal(false);
    navigate("/orders");
    toast.success("Pagamento registrado!");
  }

  function handleNavigateToOrders() {
    navigate("/orders");
  }

  function handleOpenRealPayment() {
    setShowPaymentModal(false);
    setShowRealPaymentModal(true);
  }

  const subtotal = cart.reduce((acc, item) => acc + item.service.price * item.quantity, 0);
  const discountValue = parseFloat(discount) || 0;
  const finalTotal = Math.max(0, subtotal - discountValue);
  
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchService.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
      <Toaster richColors />

      {/* Coluna Esquerda: Catálogo */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-700 mb-2">Selecione os Serviços</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar peça..."
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
                {formatCurrency(service.price)}
              </span>
              <Plus size={16} className="mt-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Coluna Direita: Carrinho */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col">
        <div className="p-5 bg-blue-700 text-white rounded-t-xl"> 
          <label className="text-xs font-bold text-blue-100 uppercase mb-1 block">
            Cliente
          </label>
          <div className="flex gap-2">
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg p-2 text-white placeholder-blue-300 focus:bg-white/20 outline-none [&>option]:text-gray-800"
            >
              <option value="">Selecione um cliente...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
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
              <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.service.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity}x {formatCurrency(item.service.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700">
                    {formatCurrency(item.quantity * item.service.price)}
                  </span>
                  <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumo e Ações */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-red-500">
              <span className="text-sm font-medium">Desconto (-):</span>
              <div className="flex items-center gap-1 bg-red-50 rounded-md px-2 border border-red-100 w-32 focus-within:ring-2 ring-red-200 transition-all">
                <span className="text-xs">R$</span>
                <input 
                  type="number"
                  min="0"
                  placeholder="0,00"
                  className="bg-transparent border-none outline-none text-right w-full font-bold text-red-600"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xl font-bold text-gray-800 border-t border-dashed border-gray-200 pt-3">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          <button
            onClick={handleFinishOrder}
            disabled={cart.length === 0 || !selectedCustomer || isSubmitting}
            className={`
              w-full py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg font-bold text-white transition-all
              ${isSubmitting || cart.length === 0 || !selectedCustomer 
                ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-green-900/20'}
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Processando...
              </>
            ) : (
              <>
                <Save size={24} /> Finalizar Pedido
              </>
            )}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showPaymentModal}
        onClose={handleNavigateToOrders}
        title="Pedido Criado! 🎉"
        variant="success"
        footer={
          <>
            <button
              onClick={handleNavigateToOrders}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Pagar depois
            </button>
            <button
              onClick={handleOpenRealPayment}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-md"
            >
              Receber Agora
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p>O pedido foi salvo. Deseja registrar o pagamento agora?</p>
        </div>
      </Modal>

      <PaymentModal 
        isOpen={showRealPaymentModal}
        onClose={handleNavigateToOrders}
        order={createdOrder}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}