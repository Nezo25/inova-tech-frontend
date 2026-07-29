"use client";
import { apiFetch } from '@/utils/api';

import React, { useEffect, useState } from "react";
import { Plus, ArrowDown, ArrowUp, DollarSign } from "lucide-react";

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    tipo: "RECEITA"
  });

  useEffect(() => {
    fetchTransacoes();
  }, []);

  const fetchTransacoes = () => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/transacoes`)
      .then((res) => res.json())
      .then((data) => setTransacoes(data))
      .catch((err) => console.error(err));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/transacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        tipo: formData.tipo
      })
    })
      .then((res) => res.json())
      .then(() => {
        setShowModal(false);
        setFormData({ descricao: "", valor: "", tipo: "RECEITA" });
        fetchTransacoes();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">Financeiro</h1>
          <p className="text-slate-400 mt-1">Controle de receitas e despesas da loja.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Nova Transação
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
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
                    Nenhuma transação lançada.
                  </td>
                </tr>
              ) : (
                transacoes.map((t: any) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{new Date(t.dataTransacao).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 font-medium text-white">{t.descricao}</td>
                    <td className="px-6 py-4">
                      {t.tipo === 'RECEITA' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">
                          <ArrowUp size={12} /> Receita
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400">
                          <ArrowDown size={12} /> Despesa
                        </span>
                      )}
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

      {/* Modal Nova Transação */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass p-8 rounded-2xl w-full max-w-md border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative">
            <h2 className="text-2xl font-bold font-outfit text-white mb-6">Nova Transação</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                <input required type="text" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors" placeholder="Ex: Conserto Tela iPhone 13" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Valor (R$)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-slate-500" />
                  </div>
                  <input required type="number" step="0.01" min="0" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({...formData, tipo: "RECEITA"})} className={`py-2 rounded-lg font-medium transition-all ${formData.tipo === 'RECEITA' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-900/50 text-slate-400 border border-white/10 hover:bg-slate-800'}`}>
                    Receita
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, tipo: "DESPESA"})} className={`py-2 rounded-lg font-medium transition-all ${formData.tipo === 'DESPESA' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-900/50 text-slate-400 border border-white/10 hover:bg-slate-800'}`}>
                    Despesa
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-2 rounded-lg transition-colors">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
