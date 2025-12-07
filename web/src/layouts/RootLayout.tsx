import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

export function RootLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Área de Conteúdo (Deslocada para a direita por causa da Sidebar fixa) */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />{" "}
          {/* Aqui é onde as páginas (Dashboard, Clientes...) serão renderizadas */}
        </div>
      </main>
    </div>
  );
}
