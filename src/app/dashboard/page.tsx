"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });

  useEffect(() => {
    // Buscar transações da API Java Spring Boot
    fetch("http://localhost:8080/api/transacoes")
      .then((res) => res.json())
      .then((data) => {
        setTransacoes(data);
        
        let receitas = 0;
        let despesas = 0;
        
        data.forEach((t: any) => {
          if (t.tipo === 'RECEITA') receitas += t.valor;
          if (t.tipo === 'DESPESA') despesas += t.valor;
        });
        
        setResumo({
          receitas,
          despesas,
          saldo: receitas - despesas
        });
      })
      .catch((err) => console.error("Erro ao buscar transações", err));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-outfit text-white">Visão Geral</h1>
        <p className="text-slate-400 mt-1">Acompanhe a saúde financeira da Inova Tech.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border-emerald-500/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Receitas do Mês</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                R$ {resumo.receitas.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-red-500/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Despesas do Mês</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                R$ {resumo.despesas.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl">
              <TrendingDown className="text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-cyan-500/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Saldo Líquido</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                R$ {resumo.saldo.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <DollarSign className="text-cyan-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Transações Recentes</h2>
          <span className="text-sm text-cyan-400 font-medium">API Conectada</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Descrição</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma transação encontrada ou API offline.
                  </td>
                </tr>
              ) : (
                transacoes.map((t: any) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{new Date(t.dataTransacao).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 font-medium text-white">{t.descricao}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${t.tipo === 'RECEITA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {t.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      R$ {t.valor.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
