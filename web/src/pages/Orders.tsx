import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  DollarSign,
  ChevronDown,
  MessageCircle,
  XCircle,
  AlertCircle,
  Undo2,
} from "lucide-react";
import { PaymentModal } from "../components/PaymentModal";
import { toast } from "sonner";
import { generateWhatsAppLink } from "../lib/utils";
import { Printer } from "lucide-react";

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  customer: { name: string; phone: string };
  items: { name: string; quantity: number }[];
  payments: { amount: number }[];
}

const STATUS_OPTIONS = {
  PENDING: { label: "A Fazer", color: "bg-yellow-100 text-yellow-800" },
  WASHING: { label: "Lavando", color: "bg-blue-100 text-blue-800" },
  READY: { label: "Pronto", color: "bg-green-100 text-green-800" },
  DELIVERED: { label: "Entregue", color: "bg-gray-100 text-gray-600" },
};


function translateStatus(status: string) {
  return STATUS_OPTIONS[status as keyof typeof STATUS_OPTIONS]?.label || status;
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Estado para Modal de Pagamento
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let result = orders;

    if (search) {
      result = result.filter(
        (o) =>
          o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
          o.id.toString().includes(search)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [search, statusFilter, orders]);

  async function loadOrders() {
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error) {
      toast.error("Erro ao carregar pedidos");
    }
  }

  async function handleStatusChange(orderId: number, newStatus: string) {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
      toast.success("Status atualizado!");
    } catch (error) {
      toast.error("Não foi possível mudar o status.");
    }
  }

  async function handleCancelOrder(id: number) {
    if (!confirm("Tem certeza que deseja CANCELAR este pedido? Isso não pode ser desfeito.")) {
      return;
    }

    try {
      await api.patch(`/orders/${id}/status`, { status: "CANCELED" });
      toast.success("Pedido cancelado com sucesso.");
      loadOrders(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cancelar.");
    }
  }

  function openPaymentModal(order: Order) {
    setSelectedOrder(order);
    setPayModalOpen(true);
  }

  function handlePaymentSuccess() {
    setPayModalOpen(false);
    loadOrders();
    toast.success("Pagamento confirmado!");
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Histórico de Pedidos
        </h1>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar cliente ou nº..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            <select
              className="pl-10 pr-8 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Todos os Status</option>
              {Object.entries(STATUS_OPTIONS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
            <tr>
              <th className="p-4">Pedido</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Serviços</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Financeiro</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredOrders.map((order) => {
              const totalPaid = order.payments.reduce(
                (acc, p) => acc + p.amount,
                0
              );
              const remaining = order.total - totalPaid;
              const isPaid = remaining <= 0.01;

              return (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-mono text-gray-500">
                    #{order.id.toString().padStart(4, "0")}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800">
                      {order.customer.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-4 text-gray-600">
                    {order.items.slice(0, 2).map((i) => (
                      <div key={i.name}>
                        {i.quantity}x {i.name}
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-xs text-blue-500">
                        + {order.items.length - 2} outros
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="relative group">
                      <select
                        value={order.status}
                        disabled={order.status === 'CANCELED' || order.status === 'DELIVERED'}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold uppercase cursor-pointer border-0 ring-1 ring-inset ring-gray-200 ${
                          order.status === 'CANCELED' 
                            ? 'bg-red-100 text-red-700' 
                            : STATUS_OPTIONS[order.status as keyof typeof STATUS_OPTIONS]?.color || 'bg-gray-100'
                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                      >
                        {order.status === 'CANCELED' && <option value="CANCELED">CANCELADO</option>}
                        {Object.entries(STATUS_OPTIONS).map(([key, val]) => (
                          <option key={key} value={key}>
                            {val.label}
                          </option>
                        ))}
                      </select>
                       {!['CANCELED', 'DELIVERED'].includes(order.status) && (
                          <ChevronDown className="absolute right-2 top-1.5 h-3 w-3 text-gray-500 pointer-events-none" />
                       )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-gray-800">
                        R$ {order.total.toFixed(2)}
                      </span>
                      {isPaid ? (
                        <span className="text-xs text-green-600 font-bold flex items-center gap-1 bg-green-50 px-1.5 rounded">
                          <CheckCircle size={10} /> Pago
                        </span>
                      ) : (
                          <button
                            onClick={() => openPaymentModal(order)}
                            className="text-xs text-red-500 font-bold hover:underline bg-red-50 px-1.5 rounded flex items-center gap-1 mt-1 cursor-pointer"
                          >
                            <Clock size={10} /> Falta R$ {remaining.toFixed(2)}
                          </button>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-end gap-2">
                       {/* Botão do WhatsApp */}
                      {order.status !== 'CANCELED' && (
                        <a
                          href={generateWhatsAppLink(
                            order.customer.phone,
                            `Olá ${order.customer.name}, seu pedido #${order.id} mudou para: *${translateStatus(order.status)}*.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Avisar no WhatsApp"
                        >
                          <MessageCircle size={20} />
                        </a>
                      )}

                      {/* Botão Imprimir */}
                      <button
                        onClick={() => window.open(`/print/orders/${order.id}`, '_blank')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Imprimir Recibo"
                      >
                        <Printer size={20} />
                      </button>

                      {/* Botão Receber Pagamento */}
                      {!isPaid && order.status !== 'CANCELED' && (
                        <button
                          onClick={() => openPaymentModal(order)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Receber Pagamento"
                        >
                          <DollarSign size={20} />
                        </button>
                      )}

                      {/* Botão Cancelar */}
                       {!['CANCELED', 'DELIVERED'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="Cancelar Pedido"
                        >
                          <XCircle size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            Nenhum pedido encontrado.
          </div>
        )}
      </div>

      {/* Modal de Recebimento */}
      {/* Modal de Recebimento */}
      <PaymentModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        order={selectedOrder}
        onSuccess={handlePaymentSuccess}
      />
    </div>
    
  );
}
