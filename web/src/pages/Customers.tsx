import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Plus, Search, User, AlertCircle, CheckCircle } from "lucide-react";
import { formatCurrency, formatPhone } from "../lib/utils";

interface Customer {
  id: string;
  name: string;
  phone: string;
  debt: number;
  hasDebt: boolean;
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  // Estados do Modal de Novo Cliente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [initialDebt, setInitialDebt] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const response = await api.get("/customers");
    setCustomers(response.data);
  }

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/customers", {
        name: newName,
        phone: newPhone,
        initialDebt: initialDebt
          ? parseFloat(initialDebt.replace(",", "."))
          : 0,
      });

      // alert("Cliente cadastrado com sucesso!");
      setIsModalOpen(false);
      setNewName("");
      setNewPhone("");
      setInitialDebt("");
      loadCustomers();
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro ao criar cliente");
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          className="flex-1 outline-none text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                <User size={24} />
              </div>
              {customer.hasDebt ? (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                  <AlertCircle size={12} /> Deve R$ {formatCurrency(customer.debt)}
                </span>
              ) : (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> Em dia
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg text-gray-800">{customer.name}</h3>
            <p className="text-gray-500 text-sm">{formatPhone(customer.phone)}</p>
          </div>
        ))}
      </div>

      {/* Modal Simples de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Novo Cliente
            </h2>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telefone (WhatsApp)
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                  value={formatPhone(newPhone)} 
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="(11) 99999-9999"
                  maxLength={15} 
                />
              </div>

              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <label className="block text-sm font-bold text-red-800 mb-1">
                  Dívida Antiga (Caderno)
                </label>
                <p className="text-xs text-red-600 mb-2">
                  Se o cliente já deve algo antes de usar o sistema, coloque
                  aqui.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={initialDebt}
                    onChange={(e) => setInitialDebt(e.target.value)}
                    className="w-full border border-red-200 rounded-lg p-2 pl-8 focus:ring-red-500"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-900 font-bold"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
