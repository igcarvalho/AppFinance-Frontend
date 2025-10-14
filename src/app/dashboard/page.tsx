/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [form, setForm] = useState({
    tipo: "RECEITA",
    categoria: "",
    valor: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("/summary/");
      setSummary(res.data);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/transactions/", {
        tipo: form.tipo,
        valor: parseFloat(form.valor),
        category: form.categoria,
      });
      const res = await api.get("/summary/");
      setSummary(res.data);
      setForm({ tipo: "RECEITA", categoria: "", valor: "" });
    } catch (error) {
      console.error(error);
      alert("Erro ao criar transação");
    } finally {
      setLoading(false);
    }
  };

  if (!summary) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 min-h-screen bg-gray-500">
      <h1 className="text-3xl text-black-shadow font-thin mb-6 text-center">Dashboard</h1>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-100 text-green-700 p-6 rounded-xl shadow text-center text-xl font-semibold">
          💰 Income
          <p className="text-3xl font-bold mt-2">R$ {summary.receitas.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 text-red-700 p-6 rounded-xl shadow text-center text-xl font-semibold">
          💸 Expenses
          <p className="text-3xl font-bold mt-2">R$ {summary.despesas.toFixed(2)}</p>
        </div>
        <div className="bg-blue-100 text-blue-700 p-6 rounded-xl shadow text-center text-xl font-semibold">
          🧾 Balance
          <p className="text-3xl font-bold mt-2">R$ {summary.saldo.toFixed(2)}</p>
        </div>
      </div>

      {/* Lista por categoria */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="font-semibold text-lg text-black-shadow mb-4">By Category</h2>
        <ul className="space-y-2">
          {summary.por_categoria.map((c: any, i: number) => (
            <li
              key={i}
              className="flex justify-between border-b pb-1 text-gray-700"
            >
              <span>{c.categoria}</span>
              <span className="font-medium">R$ {c.total.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Formulário de nova transação */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold text-lg mb-4">Add New Transaction</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="RECEITA">Income</option>
            <option value="DESPESA">Expense</option>
          </select>

          <input
            type="text"
            placeholder="Category"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="border p-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Amount"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            className="border p-2 rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white rounded p-2 hover:bg-green-700 transition"
          >
            {loading ? "Saving..." : "Add Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}
