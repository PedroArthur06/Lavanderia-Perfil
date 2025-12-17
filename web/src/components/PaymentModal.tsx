import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { api } from "../services/api";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: number;
    total: number;
    payments: { amount: number }[];
    customer: { name: string };
  } | null;
  onSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: PaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("PIX");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      const totalPaid = order.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
      const remaining = Math.max(0, order.total - totalPaid);
      setAmount(remaining.toFixed(2));
      setMethod("PIX");
    }
  }, [isOpen, order]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;

    setIsLoading(true);
    try {
      await api.post(`/orders/${order.id}/payment`, {
        amount: parseFloat(amount),
        method,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || "Erro ao registrar pagamento";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  }

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receber Pagamento"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">
            Pedido #{order.id} - {order.customer?.name || "Cliente"}
          </p>
        </div>

        <form onSubmit={handleSubmit} id="payment-form" className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1 text-lg font-bold text-green-700"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Forma de Pagamento
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            >
              <option value="PIX">PIX</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="CARTAO_CREDITO">Cartão Crédito</option>
              <option value="CARTAO_DEBITO">Cartão Débito</option>
            </select>
          </div>
        </form>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="payment-form"
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
             {isLoading ? "Processando..." : "Confirmar Recebimento"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
