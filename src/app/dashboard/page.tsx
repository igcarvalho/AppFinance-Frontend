/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import router from "next/router";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("/summary/");
      setSummary(res.data);
    };
    fetchData();
  }, []);

    useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  if (!summary) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-100 rounded">💰 Income: {summary.receitas}</div>
        <div className="p-4 bg-red-100 rounded">💸 Expenses: {summary.despesas}</div>
        <div className="p-4 bg-blue-100 rounded">🧾 Balance: {summary.saldo}</div>
      </div>
      <div className="mt-6">
        <h2 className="font-semibold text-lg mb-2">By Category</h2>
        <ul>
          {summary.por_categoria.map((c: any, i: number) => (
            <li key={i}>{c.categoria}: {c.total}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
