import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Plus, Tag, Edit2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  price: number;
}

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    const response = await api.get("/services");
    setServices(response.data);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const priceNumber = parseFloat(price.replace(",", "."));

    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, { name, price: priceNumber });
      } else {
        await api.post("/services", { name, price: priceNumber });
      }

      setIsModalOpen(false);
      setName("");
      setPrice("");
      setEditingId(null);
      loadServices();
    } catch (error) {
      alert("Erro ao salvar serviço");
    }
  }

  function handleEdit(service: Service) {
    setName(service.name);
    setPrice(service.price.toString());
    setEditingId(service.id);
    setIsModalOpen(true);
  }

  function handleNew() {
    setName("");
    setPrice("");
    setEditingId(null);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Tabela de Preços</h1>
        <button
          onClick={handleNew}
          className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={20} /> Novo Serviço
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="p-4">Nome da Peça / Serviço</th>
              <th className="p-4">Preço (R$)</th>
              <th className="p-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Tag size={18} />
                  </div>
                  {service.name}
                </td>
                <td className="p-4 text-gray-600">
                  R$ {service.price.toFixed(2)}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingId ? "Editar Serviço" : "Novo Serviço"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg p-2 mt-1"
                  placeholder="Ex: Edredom King"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preço
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border rounded-lg p-2 mt-1"
                  placeholder="0.00"
                />
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
