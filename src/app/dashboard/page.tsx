/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

// 🔹 Tipo fixo para as transações
type TipoTransacao = "RECEITA" | "DESPESA";

interface FormState {
  tipo: TipoTransacao;
  categoria: string;
  valor: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [form, setForm] = useState<FormState>({
    tipo: "RECEITA",
    categoria: "",
    valor: "",
  });
  const [loading, setLoading] = useState(false);

  // 🔹 Categorias fixas (definidas no front)
  const categorias: Record<TipoTransacao, string[]> = {
    RECEITA: ["Salário", "Investimentos", "Freelance", "Outros"],
    DESPESA: ["Alimentação", "Moradia", "Transporte", "Lazer", "Outros"],
  };

  // 🔹 Redireciona caso o usuário não esteja logado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  // 🔹 Busca os dados do resumo inicial
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/summary/");
        setSummary(res.data);
      } catch (error) {
        console.error("Erro ao carregar resumo:", error);
      }
    };
    fetchSummary();
  }, []);

  // 🔹 Envia nova transação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/transactions/", {
        tipo: form.tipo,
        valor: parseFloat(form.valor),
        categoria: form.categoria,
      });

      // Atualiza o resumo
      const res = await api.get("/summary/");
      setSummary(res.data);
      setForm({ tipo: "RECEITA", categoria: "", valor: "" });
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      alert("Erro ao adicionar transação.");
    } finally {
      setLoading(false);
    }
  };

  if (!summary) return <div className="p-8 text-center">Loading...</div>;

  // ✅ Agora o TypeScript entende o tipo
  const categoriasDisponiveis = categorias[form.tipo];

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Dashboard
      </h1>

      {/* 📊 Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-100 text-green-700 p-6 rounded-xl shadow text-center text-xl font-semibold">
          💰 Income
          <p className="text-3xl font-bold mt-2">
            R$ {summary.receitas.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-100 text-red-700 p-6 rounded-xl shadow text-center text-xl font-semibold">
          💸 Expenses
          <p className="text-3xl font-bold mt-2">
            R$ {summary.despesas.toFixed(2)}
          </p>
        </div>
        <div className="bg-blue-100 text-blue-700 p-6 rounded-xl shadow text-center text-xl font-semibold">
          🧾 Balance
          <p className="text-3xl font-bold mt-2">
            R$ {summary.saldo.toFixed(2)}
          </p>
        </div>
      </div>

      {/* 📂 Lista por categoria */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="font-semibold text-lg mb-4">By Category</h2>
        <ul className="space-y-2">
          {summary.por_categoria.map((c: any, i: number) => (
            <li
              key={i}
              className="flex justify-between border-b pb-1 text-gray-700"
            >
              <span>{c.categoria}</span>
              <span className="font-medium">
                R$ {c.total.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 🧾 Formulário de nova transação */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold text-lg mb-4">Add New Transaction</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {/* Tipo */}
          <select
            value={form.tipo}
            onChange={(e) =>
              setForm({
                ...form,
                tipo: e.target.value as TipoTransacao,
                categoria: "",
              })
            }
            className="border p-2 rounded"
          >
            <option value="RECEITA">Income</option>
            <option value="DESPESA">Expense</option>
          </select>

          {/* Categoria (fixas) */}
          <select
            value={form.categoria}
            onChange={(e) =>
              setForm({ ...form, categoria: e.target.value })
            }
            className="border p-2 rounded"
            required
          >
            <option value="">Select category</option>
            {categoriasDisponiveis.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Valor */}
          <input
            type="number"
            placeholder="Amount"
            value={form.valor}
            onChange={(e) =>
              setForm({ ...form, valor: e.target.value })
            }
            className="border p-2 rounded"
            required
          />

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className={`rounded p-2 text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Saving..." : "Add Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}
