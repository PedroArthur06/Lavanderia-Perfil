import { useEffect, useState } from "react";
import { api } from "../services/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, DollarSign, Wallet, TrendingUp, Info, ShoppingBag } from "lucide-react";

interface DashboardData {
  financial: {
    todaySales: number;
    totalReceivable: number;
  };
  chart: { name: string; value: number }[];
  totalOrders: number;
}

const COLORS = ["#F59E0B", "#3B82F6", "#10B981"]; // Amarelo, Azul, Verde

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Erro dashboard:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800">Visão Geral</h1>

      {/* --- PARTE 1: CARDS (Compactos e iguais ao estilo anterior) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Vendas Hoje */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-700 rounded-lg">
            <DollarSign size={32} />
          </div>
          <div>
            <span className="text-sm text-green-700 font-medium block">Vendas Hoje</span>
            <span className="text-2xl font-bold text-gray-800 block">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.financial.todaySales || 0)}
            </span>
          </div>
        </div>

        {/* A Receber (Fiado) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <span className="text-sm text-red-500 font-medium block">Total a Receber</span>
            <span className="text-2xl font-bold text-gray-800 block">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.financial.totalReceivable || 0)}
            </span>
          </div>
        </div>

        {/* Total Pedidos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
            <ShoppingBag size={32} />
          </div>
          <div>
            <span className="text-sm text-blue-700 font-medium block">Total Pedidos</span>
            <span className="text-2xl font-bold text-gray-800 block">
              {data?.totalOrders}
            </span>
          </div>
        </div>
      </div>

      {/* --- PARTE 2: GRID ASSIMÉTRICO  --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: Gráfico de Ritmo */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-lg font-bold text-gray-700 mb-4 w-full text-left flex items-center gap-2">
            Ritmo de Trabalho
          </h2>
          
          {data?.chart.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <CheckCircle size={40} className="mb-2 opacity-20"/>
                <p>Tudo entregue!</p>
             </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.chart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60} 
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data?.chart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} pedidos`, 'Quantidade']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: Aviso do Sistema */}
        <div className="lg:col-span-1 bg-blue-900 rounded-xl p-6 text-white flex flex-col shadow-lg h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 opacity-80">
                <Info size={20} />
                <span className="font-bold text-sm uppercase tracking-wider">Dica do Dia</span>
              </div>
              <p className="text-lg font-medium leading-relaxed opacity-90">
                Mantenha os pedidos atualizados.
              </p>
              <p className="text-sm mt-2 opacity-60">
                Marcar como <strong>Entregue</strong> remove o item do gráfico e libera a visão.
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-blue-800/50">
               <p className="text-xs opacity-50 text-center">Sistema v1.0</p>
            </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    )
}