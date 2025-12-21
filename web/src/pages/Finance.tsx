import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  DollarSign,
  Wallet,
  AlertCircle,
  ArrowUpCircle,
} from "lucide-react";

interface LedgerItem {
  id: string;
  date: string;
  description: string;
  entry: number;
  exit: number;
}

interface FinanceData {
  cards: {
    totalSales: number;
    totalIncome: number;
    pendingAmount: number;
    totalExpense: number;
    balance: number;
  };
  ledger: LedgerItem[];
}

export function Finance() {
  const [data, setData] = useState<FinanceData | null>(null);

  useEffect(() => {
    loadFinance();
  }, []);

  async function loadFinance() {
    const response = await api.get("/finance");
    setData(response.data);
  }

  if (!data)
    return <div className="p-8 text-gray-500">Carregando livro caixa...</div>;

  // Dados para o Gráfico de "Eficiência de Recebimento"
  const chartData = [
    {
      name: "Balanço do Período",
      Vendido: data.cards.totalSales,
      Recebido: data.cards.totalIncome,
      Despesas: data.cards.totalExpense,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <h1 className="text-3xl font-bold text-gray-800">
        Financeiro & Livro Caixa
      </h1>

      {/* 1. Métrica Principal: Onde foi parar o dinheiro? */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Vendas Totais */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">
                Total Vendido
              </p>
              <h3 className="text-2xl font-bold text-blue-900 mt-1">
                R$ {data.cards.totalSales.toFixed(2)}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Wallet size={20} />
            </div>
          </div>
        </div>

        {/* Recebido (Caixa) */}
        <div className="bg-white p-5 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1 bg-green-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">
                Entrada Real (Caixa)
              </p>
              <h3 className="text-2xl font-bold text-green-700 mt-1">
                R$ {data.cards.totalIncome.toFixed(2)}
              </h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <ArrowUpCircle size={20} />
            </div>
          </div>
        </div>

        {/* Não Pagaram (Fiado) */}
        <div className="bg-white p-5 rounded-xl border border-orange-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">
                Pendência (Fiado)
              </p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">
                R$ {data.cards.pendingAmount.toFixed(2)}
              </h3>
              <p className="text-xs text-orange-400 mt-1 font-medium">
                Dinheiro na rua
              </p>
            </div>
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>

        {/* Lucro Final */}
        <div className="bg-primary text-white p-5 rounded-xl shadow-lg border border-blue-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-blue-200 uppercase">
                Lucro Líquido
              </p>
              <h3 className="text-2xl font-bold mt-1">
                R$ {data.cards.balance.toFixed(2)}
              </h3>
              <p className="text-xs text-blue-200 mt-1 opacity-80">
                Entradas - Saídas
              </p>
            </div>
            <div className="p-2 bg-white/10 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. O Gráfico Visual (Vendido vs Recebido) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="font-bold text-gray-700 mb-6 text-sm uppercase">
            Fluxo Visual
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" barSize={30}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar
                  dataKey="Vendido"
                  fill="#93c5fd"
                  name="Total Vendido"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="Recebido"
                  fill="#22c55e"
                  name="Recebido em Caixa"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="Despesas"
                  fill="#ef4444"
                  name="Gastos/Saídas"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Se a barra <span className="text-blue-400 font-bold">Azul</span>{" "}
              for maior que a{" "}
              <span className="text-green-500 font-bold">Verde</span>, tem
              cliente devendo.
            </p>
          </div>
        </div>

        {/* 3. O Caderno Digital (Tabela) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">
              Movimento do Caixa (Caderno)
            </h3>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
              Últimos 30 dias
            </span>
          </div>

          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Histórico / Cliente</th>
                  <th className="p-3 text-right text-green-600">Entrada</th>
                  <th className="p-3 text-right text-red-600">Saída</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.ledger.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-gray-500 font-mono text-xs">
                      {new Date(item.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-3 font-medium text-gray-700">
                      {item.description}
                    </td>
                    <td className="p-3 text-right text-green-700 font-medium">
                      {item.entry > 0 ? `R$ ${item.entry.toFixed(2)}` : "-"}
                    </td>
                    <td className="p-3 text-right text-red-600 font-medium">
                      {item.exit > 0 ? `R$ ${item.exit.toFixed(2)}` : "-"}
                    </td>
                  </tr>
                ))}
                {data.ledger.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      Nenhuma movimentação registrada no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Rodapé da Tabela com Saldos */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-8">
            <div className="text-right">
              <span className="block text-xs text-gray-500">
                Total Entradas
              </span>
              <span className="font-bold text-green-600">
                R$ {data.cards.totalIncome.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-xs text-gray-500">Total Saídas</span>
              <span className="font-bold text-red-600">
                R$ {data.cards.totalExpense.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
