import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  DollarSign,
  LogOut,
  PlusCircle,
  Package,
} from "lucide-react";
import logoImg from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("@lavanderia:token");
    localStorage.removeItem("@lavanderia:user");
    window.location.href = "/login";
  }

  // Estilo base para os links
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
      isActive
        ? "bg-blue-800 text-white shadow-md"
        : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-primary text-white h-screen flex flex-col fixed left-0 top-0 shadow-xl z-20">
      {/* Logo */}
      <div className="p-6 flex flex-col items-center border-b border-blue-800/50">
        <img
          src={logoImg}
          alt="Perfil"
          className="h-12 bg-white rounded p-1 mb-2"
        />
        <span className="font-bold text-lg">Lavanderia Perfil</span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/" className={linkClass}>
          <LayoutDashboard size={20} />
          Painel Geral
        </NavLink>

        <NavLink to="/orders" className={linkClass}>
          <ShoppingBag size={20} />
          Pedidos
        </NavLink>

        <NavLink to="/services" className={linkClass}>
          <Package size={20} />
          Serviços / Preços
        </NavLink>

        <NavLink to="/customers" className={linkClass}>
          <Users size={20} />
          Clientes / Fiado
        </NavLink>

        <NavLink to="/finance" className={linkClass}>
          <DollarSign size={20} />
          Financeiro
        </NavLink>
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-blue-800/50 space-y-3">
        {/* Botão de Ação Rápida (será configurado depois para abrir o modal) */}
        <button
          onClick={() => navigate("/orders/new")}
          className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
        >
          <PlusCircle size={20} />
          Novo Pedido
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-red-300 hover:text-red-100 hover:bg-red-900/30 py-2 rounded-lg transition-colors text-sm"
        >
          <LogOut size={16} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
