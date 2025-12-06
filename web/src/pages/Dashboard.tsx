import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Order } from "../types";
import { Clock, Shirt, CheckCircle, Package, Plus, Search } from "lucide-react";
import logoImg from "../assets/logo.png";
import { NewOrderModal } from "../components/NewOrderModal";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> =
  {
    PENDING: {
      label: "Aguardando",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    WASHING: {
      label: "Em Processo",
      color: "bg-blue-100 text-brand-blue border-blue-200",
      icon: Shirt,
    },
    READY: {
      label: "Pronto",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
    DELIVERED: {
      label: "Entregue",
      color: "bg-gray-100 text-gray-600 border-gray-200",
      icon: Package,
    },
  };

export function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadOrders();
  }, []);

  // Atualiza a data automaticamente à meia-noite
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      setCurrentDate(new Date());
      // Agenda a próxima atualização
      const interval = setInterval(() => {
        setCurrentDate(new Date());
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(interval);
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  async function loadOrders() {
    const response = await api.get("/orders");
    setOrders(response.data);
  }

  const getOrdersByStatus = (status: string) =>
    orders.filter((order) => {
      if (status === "WASHING")
        return ["WASHING", "DRYING", "IRONING"].includes(order.status);
      return order.status === status;
    });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função para lidar com drag-and-drop
  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;

    // Se não há destino ou se soltou no mesmo lugar
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Se moveu para a mesma coluna, não faz nada
    if (destination.droppableId === source.droppableId) {
      return;
    }

    // Mapear droppableId para status do backend
    type OrderStatus =
      | "PENDING"
      | "WASHING"
      | "DRYING"
      | "IRONING"
      | "READY"
      | "DELIVERED";
    const statusMap: Record<string, OrderStatus> = {
      PENDING: "PENDING",
      WASHING: "WASHING",
      READY: "READY",
      DELIVERED: "DELIVERED",
    };

    const newStatus = statusMap[destination.droppableId];
    const orderId = Number(draggableId);

    // Atualização otimista da UI
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);

    try {
      // Atualizar no backend
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      // Reverter em caso de erro
      loadOrders();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabeçalho da Marca */}
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          {/* Logo + Título */}
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Logo"
              className="h-10 bg-white rounded-md p-1"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">
                Lavanderia Perfil
              </span>
              <span className="text-xs text-blue-200 leading-tight">
                Painel de Controle
              </span>
            </div>
          </div>

          {/* Data + Botão */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Hoje:{" "}
              {currentDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors shadow-md"
            >
              <Plus size={18} />
              Novo Pedido
            </button>
          </div>
        </div>
      </header>

      {/* Área do Kanban */}
      <main className="flex-1 p-6">
        <div className="overflow-x-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-w-[1000px] md:min-w-0">
              <KanbanColumn
                title="Fila de Entrada"
                orders={getOrdersByStatus("PENDING")}
                statusKey="PENDING"
              />
              <KanbanColumn
                title="Lavando / Secando"
                orders={getOrdersByStatus("WASHING")}
                statusKey="WASHING"
              />
              <KanbanColumn
                title="Pronto p/ Retirada"
                orders={getOrdersByStatus("READY")}
                statusKey="READY"
              />
              <KanbanColumn
                title="Histórico Recente"
                orders={getOrdersByStatus("DELIVERED")}
                statusKey="DELIVERED"
              />
            </div>
          </DragDropContext>
        </div>
      </main>
      <NewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadOrders}
      />
    </div>
  );
}

// Componente da Coluna
function KanbanColumn({
  title,
  orders,
  statusKey,
}: {
  title: string;
  orders: Order[];
  statusKey: string;
}) {
  const config = STATUS_MAP[statusKey];
  const Icon = config.icon;

  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex items-center gap-2 mb-3 p-3 rounded-t-lg border-b-4 bg-white shadow-sm ${
          config.color.replace("text-", "border-").split(" ")[2]
        }`}
      >
        <div className={`p-2 rounded-lg ${config.color}`}>
          <Icon size={18} />
        </div>
        <h3 className="font-bold text-gray-700">{title}</h3>
        <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">
          {orders.length}
        </span>
      </div>

      <Droppable droppableId={statusKey}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded-b-lg p-2 space-y-3 min-h-[500px] transition-colors ${
              snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-100"
            }`}
          >
            {orders.map((order, index) => (
              <Draggable
                key={order.id}
                draggableId={String(order.id)}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-brand-blue transition-all cursor-grab active:cursor-grabbing group ${
                      snapshot.isDragging
                        ? "shadow-lg ring-2 ring-brand-blue"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-gray-400">
                        #{order.id.toString().padStart(4, "0")}
                      </span>
                      <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        R$ {order.total.toFixed(2)}
                      </span>
                    </div>

                    <p className="font-semibold text-gray-800 mb-1 truncate">
                      {order.customer.name}
                    </p>

                    <div className="space-y-1 mb-3">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="text-xs text-gray-500 flex justify-between"
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-brand-blue font-medium">
                          + {order.items.length - 3} itens...
                        </span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
