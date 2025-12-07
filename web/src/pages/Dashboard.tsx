import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, AlertCircle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "../services/api";

interface DashboardData {
  todaySales: number;
  activeOrders: number;
  totalReceivable: number;
  chartData: { status: string; count: number }[];
}

// Cores para o gráfico (combinando com as tags que usamos antes)
const COLORS: Record<string, string> = {
  PENDING: "#fbbf24", // Amarelo (Aguardando)
  WASHING: "#3b82f6", // Azul (Lavando)
  DRYING: "#60a5fa", // Azul Claro (Secando)
  IRONING: "#818cf8", // Roxo (Passando)
  READY: "#22c55e", // Verde (Pronto)
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando",
  WASHING: "Lavando",
  DRYING: "Secando",
  IRONING: "Passando",
  READY: "Pronto p/ Retirar",
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const response = await api.get("/dashboard");
      setData(response.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    }
  }

  if (!data) {
    return <div className="p-8 text-gray-500">Carregando painel...</div>;
  }

  // Prepara dados para o gráfico (Traduz nomes e cores)
  const pieData = data.chartData.map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: COLORS[item.status] || "#94a3b8",
  }));

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Painel de Controle</h1>
        <p className="text-gray-500">Visão geral em tempo real</p>
      </div>

      {/* 1. Cards de KPI (Indicadores) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vendas Hoje */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-700 rounded-lg">
            <DollarSign size={32} />
          </div>
          <div>
            <span className="block text-sm text-gray-500 font-medium">
              Vendas Hoje
            </span>
            <span className="block text-2xl font-bold text-gray-800">
              R$ {data.todaySales.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pedidos Ativos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
            <ShoppingBag size={32} />
          </div>
          <div>
            <span className="block text-sm text-gray-500 font-medium">
              Roupas na Loja
            </span>
            <span className="block text-2xl font-bold text-gray-800">
              {data.activeOrders} pedidos
            </span>
          </div>
        </div>

        {/* Total a Receber */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">
            <AlertCircle size={32} />
          </div>
          <div>
            <span className="block text-sm text-gray-500 font-medium">
              Total a Receber (Geral)
            </span>
            <span className="block text-2xl font-bold text-gray-800">
              R$ {data.totalReceivable.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Área Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Pizza: Status dos Pedidos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-bold text-gray-700 mb-2">
            Situação da Lavanderia
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Pedidos ativos por etapa do processo
          </p>

          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} pedidos`]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <ShoppingBag size={48} className="mb-2 opacity-20" />
                <p>Nenhum pedido ativo no momento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Card de Informação Rápida / Dica */}
        <div className="bg-primary text-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xl mb-2">Dica do Sistema</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Mantenha o status dos pedidos atualizado na aba "Pedidos". Isso
              ajuda a saber exatamente o que está pronto para entregar e libera
              espaço na visão de "Lavando".
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-blue-400/30">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-200">Precisa de ajuda?</span>
              <button className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                Suporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
