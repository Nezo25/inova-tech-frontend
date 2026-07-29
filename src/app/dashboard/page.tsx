"use client";
import { apiFetch } from '@/utils/api';

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Plus, X, Calendar } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function DashboardPage() {
  const dataAtual = new Date();
  const [mes, setMes] = useState(dataAtual.getMonth() + 1);
  const [ano, setAno] = useState(dataAtual.getFullYear());

  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    tipo: "RECEITA"
  });

  useEffect(() => {
    fetchResumo();
  }, [mes, ano]);

  const fetchResumo = () => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/transacoes/resumo?mes=${mes}&ano=${ano}`)
      .then((res) => res.json())
      .then((data) => {
        setTransacoes(data.transacoes || []);
        setResumo({
          receitas: data.receitas || 0,
          despesas: data.despesas || 0,
          saldo: data.saldo || 0
        });
      })
      .catch((err) => {
         console.error(err);
         toast.error("Erro ao carregar dados financeiros.");
      });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val) {
       setFormData({...formData, valor: ""});
       return;
    }
    const floatVal = parseInt(val) / 100;
    setFormData({...formData, valor: floatVal.toString()});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor) {
        toast.error("Preencha todos os campos.");
        return;
    }
    
    const loadingToast = toast.loading("Salvando transação...");
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/transacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          descricao: formData.descricao,
          valor: parseFloat(formData.valor),
          tipo: formData.tipo
      })
    })
      .then((res) => {
          if (res.ok) {
              setShowModal(false);
              setFormData({ descricao: "", valor: "", tipo: "RECEITA" });
              fetchResumo();
              toast.success("Transação salva com sucesso!", { id: loadingToast });
          } else {
              throw new Error();
          }
      })
      .catch((err) => {
         console.error(err);
         toast.error("Erro ao salvar transação.", { id: loadingToast });
      });
  };

  const meses = [
    { value: 1, label: "Janeiro" }, { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" }, { value: 4, label: "Abril" },
    { value: 5, label: "Maio" }, { value: 6, label: "Junho" },
    { value: 7, label: "Julho" }, { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" }, { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" }, { value: 12, label: "Dezembro" }
  ];

  const anos = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <div className="space-y-8 pb-10">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">Caixa da Loja</h1>
          <p className="text-slate-400 mt-1">Acompanhe a saúde financeira da Inova Tech.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="flex items-center gap-2 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white">
              <Calendar size={18} className="text-slate-400" />
              <select value={mes} onChange={e => setMes(parseInt(e.target.value))} className="bg-transparent outline-none cursor-pointer">
                  {meses.map(m => (
                      <option key={m.value} value={m.value} className="bg-slate-900">{m.label}</option>
                  ))}
              </select>
              <span className="text-slate-500">/</span>
              <select value={ano} onChange={e => setAno(parseInt(e.target.value))} className="bg-transparent outline-none cursor-pointer">
                  {anos.map(a => (
                      <option key={a} value={a} className="bg-slate-900">{a}</option>
                  ))}
              </select>
           </div>
           
           <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Plus size={18} />
              <span className="hidden sm:inline">Nova Transação</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border-emerald-500/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Receitas ({meses.find(m => m.value === mes)?.label})</p>
              <h3 className="text-3xl font-bold text-white mt-2">
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
              <p className="text-slate-400 text-sm font-medium">Despesas ({meses.find(m => m.value === mes)?.label})</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                R$ {resumo.despesas.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl">
              <TrendingDown className="text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium">Saldo Líquido</p>
              <h3 className={`text-3xl font-bold mt-2 ${resumo.saldo >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
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
          <h2 className="text-xl font-semibold text-white">Transações do Mês</h2>
          <span className="text-sm text-cyan-400 font-medium">Filtro Ativo</span>
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
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <DollarSign size={48} className="mx-auto text-slate-700 mb-3" />
                    Nenhuma transação registrada neste mês.
                  </td>
                </tr>
              ) : (
                transacoes.map((t: any) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{new Date(t.dataTransacao).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 font-medium text-white">{t.descricao}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${t.tipo === 'RECEITA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {t.tipo}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${t.tipo === 'RECEITA' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.tipo === 'RECEITA' ? '+' : '-'} R$ {t.valor.toFixed(2)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass p-8 rounded-2xl w-full max-w-md border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.1)] relative my-auto">
             <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors z-10">
                <X size={20} />
             </button>
             
             <h2 className="text-2xl font-bold font-outfit text-white mb-6 flex items-center gap-2">
                 <DollarSign size={24} className="text-yellow-500" />
                 Lançamento Avulso
             </h2>
             
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                     <button type="button" onClick={() => setFormData({...formData, tipo: "RECEITA"})} className={`py-3 rounded-xl border-2 font-bold transition-all ${formData.tipo === "RECEITA" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-white/5 bg-slate-900/50 text-slate-500 hover:border-white/10"}`}>
                         RECEITA
                     </button>
                     <button type="button" onClick={() => setFormData({...formData, tipo: "DESPESA"})} className={`py-3 rounded-xl border-2 font-bold transition-all ${formData.tipo === "DESPESA" ? "border-red-500 bg-red-500/10 text-red-400" : "border-white/5 bg-slate-900/50 text-slate-500 hover:border-white/10"}`}>
                         DESPESA
                     </button>
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                     <input required type="text" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Conta de Luz, Venda de Capinha..." className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none transition-colors" />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-slate-400 mb-1">Valor (R$)</label>
                     <input required type="text" value={formData.valor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.valor)) : ""} onChange={handleCurrencyChange} placeholder="R$ 0,00" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none transition-colors" />
                 </div>

                 <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-4 py-3 rounded-lg transition-colors mt-6 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                     Registrar {formData.tipo === "RECEITA" ? "Receita" : "Despesa"}
                 </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
