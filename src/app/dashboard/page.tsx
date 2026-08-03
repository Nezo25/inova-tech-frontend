"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from '@/utils/api';
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, X, Calendar, 
  Activity, ArrowUpRight, ArrowDownRight, PackageMinus, Target 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';

export default function DashboardPage() {
  const [metricas, setMetricas] = useState<any>(null);
  const [transacoes, setTransacoes] = useState([]);
  const [periodoFiltrado, setPeriodoFiltrado] = useState("mensal");
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    descricao: "", valor: "", tipo: "RECEITA"
  });

  useEffect(() => {
    fetchDados();
  }, [periodoFiltrado]);

  const fetchDados = () => {
    // Busca métricas do novo endpoint
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/dashboard/metricas?periodo=${periodoFiltrado}`)
      .then(res => res.json())
      .then(data => setMetricas(data))
      .catch(err => console.error(err));

    // Busca ultimas transacoes (mantido do original)
    const dt = new Date();
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/transacoes/resumo?mes=${dt.getMonth()+1}&ano=${dt.getFullYear()}`)
      .then(res => res.json())
      .then(data => setTransacoes(data.transacoes || []))
      .catch(err => console.error(err));
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
              fetchDados();
              toast.success("Transação salva com sucesso!", { id: loadingToast });
          } else {
              throw new Error();
          }
      })
      .catch(() => {
         toast.error("Erro ao salvar transação.", { id: loadingToast });
      });
  };

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-8 pb-10">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">Dashboard Analítico</h1>
          <p className="text-slate-400 mt-1">Visão geral do desempenho e saúde financeira.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="flex items-center gap-2 bg-slate-900/50 border border-white/10 rounded-lg p-1 text-white">
              <button 
                onClick={() => setPeriodoFiltrado("mensal")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${periodoFiltrado === 'mensal' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                  Mensal
              </button>
              <button 
                onClick={() => setPeriodoFiltrado("anual")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${periodoFiltrado === 'anual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                  Anual
              </button>
           </div>
           
           <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-yellow-600/20">
              <Plus size={18} />
              <span className="hidden sm:inline">Nova Despesa / Receita</span>
           </button>
        </div>
      </div>

      {/* KPIs Row */}
      {metricas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-400 text-sm font-medium">Ticket Médio (OS)</p>
                          <h3 className="text-2xl font-bold text-white mt-1">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.ticketMedio || 0)}
                          </h3>
                      </div>
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <Activity className="text-emerald-400" size={20} />
                      </div>
                  </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-400 text-sm font-medium">Taxa de Conversão</p>
                          <h3 className="text-2xl font-bold text-white mt-1">
                              {(metricas.taxaConversao || 0).toFixed(1)}%
                          </h3>
                      </div>
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                          <Target className="text-indigo-400" size={20} />
                      </div>
                  </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-400 text-sm font-medium">Estoque Parado</p>
                          <h3 className="text-2xl font-bold text-white mt-1">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.estoqueParado || 0)}
                          </h3>
                      </div>
                      <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                          <PackageMinus className="text-yellow-400" size={20} />
                      </div>
                  </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                  <div className="flex justify-between items-start relative z-10">
                      <div>
                          <p className="text-indigo-200 text-sm font-medium">Lucro Líquido Estimado</p>
                          <h3 className="text-2xl font-bold text-white mt-1">
                              {/* TODO: Connect with real lucro data */}
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.lucroMes || 0)}
                          </h3>
                      </div>
                      <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
                          <DollarSign className="text-white" size={20} />
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Gráficos Row */}
      {metricas && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">Evolução Financeira</h3>
                <div className="h-72 w-full">
                    {metricas.graficoEvolucao?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metricas.graficoEvolucao} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="data" stroke="#64748b" tick={{fill: '#64748b'}} tickFormatter={(v) => {
                                    // format "YYYY-MM-DD" to "DD/MM"
                                    if(!v) return "";
                                    const parts = v.split('-');
                                    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : v;
                                }} />
                                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend />
                                <Area type="monotone" name="Receitas" dataKey="receita" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" />
                                <Area type="monotone" name="Despesas" dataKey="despesa" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesa)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">Dados insuficientes para o gráfico</div>
                    )}
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">Despesas por Categoria</h3>
                <div className="h-72 w-full">
                    {metricas.graficoDespesas?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metricas.graficoDespesas}
                                    dataKey="valor"
                                    nameKey="categoria"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                >
                                    {metricas.graficoDespesas.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                                    formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)}
                                />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">Dados insuficientes para o gráfico</div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Lista de Transações (mantido simplificado) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-6">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Transações Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Data</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Descrição</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Tipo</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <DollarSign size={48} className="mx-auto text-slate-700 mb-3" />
                    Nenhuma transação registrada.
                  </td>
                </tr>
              ) : (
                transacoes.slice(0, 10).map((t: any) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
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

      {/* Modal Nova Transação (Avulso) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl relative my-auto">
             <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10">
                <X size={24} />
             </button>
             
             <h2 className="text-xl font-bold font-outfit text-white mb-6 flex items-center gap-2">
                 <DollarSign size={24} className="text-yellow-500" />
                 Lançamento Financeiro Avulso
             </h2>
             
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                     <button type="button" onClick={() => setFormData({...formData, tipo: "RECEITA"})} className={`py-3 rounded-xl border-2 font-bold transition-all ${formData.tipo === "RECEITA" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-slate-700 bg-slate-950 text-slate-500 hover:border-slate-500"}`}>
                         RECEITA
                     </button>
                     <button type="button" onClick={() => setFormData({...formData, tipo: "DESPESA"})} className={`py-3 rounded-xl border-2 font-bold transition-all ${formData.tipo === "DESPESA" ? "border-red-500 bg-red-500/10 text-red-400" : "border-slate-700 bg-slate-950 text-slate-500 hover:border-slate-500"}`}>
                         DESPESA
                     </button>
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                     <input required type="text" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Conta de Luz, Venda de Capinha..." className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none transition-colors" />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-slate-400 mb-1">Valor (R$)</label>
                     <input required type="text" value={formData.valor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.valor)) : ""} onChange={handleCurrencyChange} placeholder="R$ 0,00" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none transition-colors font-bold text-emerald-400" />
                 </div>

                 <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-3 rounded-lg transition-colors mt-6 shadow-lg shadow-indigo-600/20">
                     Registrar {formData.tipo === "RECEITA" ? "Receita" : "Despesa"}
                 </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
