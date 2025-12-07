import { useState } from "react";
import { api } from "../services/api";
import logoImg from "../assets/logo.png";
import { Lock, Mail, Loader2, LogIn } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      alert("Preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      // 1. Bate na rota de login
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // 2. Salva o token e o user no LocalStorage
      localStorage.setItem("@lavanderia:token", token);
      localStorage.setItem("@lavanderia:user", JSON.stringify(user));

      // 3. Força o recarregamento para entrar no Dashboard
      // (Poderíamos usar useNavigate, mas window.location garante reset de estado limpo)
      window.location.href = "/";
    } catch (error: any) {
      console.error(error);
      alert(
        error.response?.data?.error ||
          "Erro ao fazer login. Verifique seus dados."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Cabeçalho do Card */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoImg} alt="Lavanderia Perfil" className="h-16 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Acesso Restrito</h1>
          <p className="text-gray-500 text-sm">
            Entre com suas credenciais de administrador
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="admin@perfil.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                <LogIn className="h-5 w-5" /> Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
