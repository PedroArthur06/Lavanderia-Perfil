import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { formatCurrency, formatPhone } from "../lib/utils";
import { Loader2, Printer } from "lucide-react";

export function PrintOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders`).then((res) => {
      const found = res.data.find((o: any) => o.id === Number(id));
      setOrder(found);
      setLoading(false);
      
      if (found) {
        setTimeout(() => {
          window.print();
        }, 500);
      }
    });
  }, [id]);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (!order) return <div className="text-center p-10">Pedido não encontrado</div>;

  // (Via Cliente e Via Loja)
  const Receipt = ({ title }: { title: string }) => (
    <div className="w-[80mm] p-4 text-black font-mono text-sm leading-tight border-b-2 border-dashed border-gray-400 mb-8 pb-8">
      {/* Cabeçalho */}
      <div className="text-center border-b border-black pb-2 mb-2">
        <h1 className="font-bold text-lg uppercase">Lavanderia Perfil</h1>
        <p className="text-xs">Rua coronel Benedito Leite, 2001 - Goiabeiras</p>
        <p className="text-xs">Tel: (65) 99210-7684</p>
      </div>

      {/* Info do Pedido */}
      <div className="mb-2">
        <p className="font-bold text-base">PEDIDO #{order.id}</p>
        <p className="text-xs">{new Date(order.createdAt).toLocaleString()}</p>
        <p className="font-bold mt-1 border-b border-black inline-block">
          {title}
        </p>
      </div>

      {/* Cliente */}
      <div className="mb-2 border-b border-gray-300 pb-2">
        <p className="font-bold">Cliente:</p>
        <p>{order.customer.name}</p>
        <p>{formatPhone(order.customer.phone)}</p>
      </div>

      {/* Itens */}
      <table className="w-full text-xs mb-2">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left">Qtd</th>
            <th className="text-left">Item</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item: any) => (
            <tr key={item.id}>
              <td>{item.quantity}x</td>
              <td>{item.name}</td>
              <td className="text-right">
                {formatCurrency(item.unitPrice * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totais */}
      <div className="text-right border-t border-black pt-2">
        <p>Subtotal: {formatCurrency(order.total + order.discount)}</p>
        {order.discount > 0 && (
          <p className="text-xs">Desconto: -{formatCurrency(order.discount)}</p>
        )}
        <p className="text-lg font-bold mt-1">
          TOTAL: {formatCurrency(order.total)}
        </p>
      </div>

      {/* Status Pagamento */}
      <div className="mt-4 text-center border border-black p-1 font-bold">
        {order.payments.reduce((acc: number, p: any) => acc + p.amount, 0) >= order.total 
          ? "PAGO" 
          : "PENDENTE DE PAGAMENTO"}
      </div>
      
      <p className="text-[10px] text-center mt-2">
        Obrigado pela preferência!
      </p>
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Botão para reimprimir manual */}
      <div className="print:hidden p-4 bg-gray-100 flex gap-4 shadow-md mb-4">
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
        >
          <Printer size={20} /> Imprimir Agora
        </button>
        <span className="text-sm text-gray-500 flex items-center">
          Dica: Nas configurações de impressão, remova "Cabeçalhos e Rodapés"
        </span>
      </div>

      {/* Área de Impressão Real */}
      <div className="flex flex-col items-center">
        {/* Via da Loja */}
        <Receipt title="VIA DA LAVANDERIA" />
        
        {/* Espaço ou Corte */}
        <div className="print:block hidden text-center text-xs my-2">
          - - - - - - CORTE AQUI - - - - - -
        </div>

        {/* Via do Cliente */}
        <Receipt title="VIA DO CLIENTE" />
      </div>
    </div>
  );
}