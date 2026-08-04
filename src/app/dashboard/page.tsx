"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from '@/utils/api';
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, X, Calendar, 
  Activity, ArrowUpRight, ArrowDownRight, PackageMinus, Target,
  Clock, AlertTriangle, Smartphone, Wrench, AlertCircle, ShoppingCart, List, CheckCircle
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
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/dashboard/metricas?periodo=${periodoFiltrado}`)
      .then(res => res.json())
      .then(data => setMetricas(data))
      .catch(err => console.error(err));

    const dt = new Date();
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/transacoes/resumo?mes=${dt.getMonth() + 1}&ano=${dt.getFullYear()}`)
      .then(res => res.json())
      .then(data => setTransacoes(data.transacoes || []))
      .catch(err => console.error(err));
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-8 pb-10">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white flex items-center gap-2">
            <Activity className="text-indigo-500" />
            Central de Business Intelligence
          </h1>
          <p className="text-slate-400 mt-1">Visões analíticas avançadas para tomada de decisão.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="flex items-center gap-2 bg-slate-900/50 border border-white/10 rounded-lg p-1 text-white">
              <button 
                onClick={() => setPeriodoFiltrado("mensal")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${periodoFiltrado === 'mensal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                  Mensal
              </button>
              <button 
                onClick={() => setPeriodoFiltrado("anual")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${periodoFiltrado === 'anual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                  Anual
              </button>
           </div>
        </div>
      </div>

      {metricas && (
        <>
          {/* Seção 1: Eficiência Operacional (Bancada) */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Wrench className="text-emerald-400" /> Painel de Eficiência da Bancada</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-400 text-sm font-medium">Tempo Médio de Reparo (TMR)</p>
                          <h3 className="text-2xl font-bold text-white mt-1">
                              {metricas.tempoMedioReparoHoras ? metricas.tempoMedioReparoHoras.toFixed(1) : "0.0"} <span className="text-sm font-normal text-slate-500">horas</span>
                          </h3>
                      </div>
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <Clock className="text-emerald-400" size={20} />
                      </div>
                  </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-400 text-sm font-medium">Despesas do Período</p>
                          <h3 className="text-2xl font-bold text-white mt-1">
                              {formatCurrency(metricas.evolucaoFinanceira?.reduce((acc: number, p: any) => acc + (p.despesa || 0), 0) || 0)}
                          </h3>
                      </div>
                      <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                          <TrendingDown className="text-red-400" size={20} />
                      </div>
                  </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-400 text-sm font-medium">Faturamento Projetado (OS na Fila)</p>
                          <h3 className="text-2xl font-bold text-white mt-1">
                              {formatCurrency(metricas.faturamentoProjetado)}
                          </h3>
                      </div>
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                          <TrendingUp className="text-indigo-400" size={20} />
                      </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Controle Financeiro (Evolução e Categorias) */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><DollarSign className="text-emerald-400"/> Evolução Financeira</h3>
                  <div className="h-72 w-full">
                      {metricas.evolucaoFinanceira?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={metricas.evolucaoFinanceira} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><TrendingDown className="text-red-400"/> Despesas por Categoria</h3>
                  <div className="h-72 w-full">
                      {metricas.despesasPorCategoria?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={metricas.despesasPorCategoria}
                                      dataKey="valor"
                                      nameKey="categoria"
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={90}
                                      paddingAngle={5}
                                  >
                                      {metricas.despesasPorCategoria.map((entry: any, index: number) => (
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

          {/* Seção 2: Saúde do Estoque */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ShoppingCart className="text-yellow-400" /> Painel de Saúde do Estoque</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Capital Encalhado (+60 dias)</p>
                            <h3 className="text-2xl font-bold text-red-400 mt-1">
                                {formatCurrency(metricas.valorEstoqueEncalhado)}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">{metricas.qtdPecasEncalhadas || 0} peças sem giro</p>
                        </div>
                        <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                            <PackageMinus className="text-red-400" size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2"><AlertCircle size={16} className="text-yellow-500"/> Alertas de Reposição</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {metricas.pecasReposicao?.length > 0 ? metricas.pecasReposicao.map((p:any, idx:number) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <div>
                          <p className="text-sm font-medium text-white">{p.nome}</p>
                          <p className="text-xs text-slate-500">Fornecedor: {p.fornecedor || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-red-400">Estoque: {p.quantidadeEstoque}</p>
                          <p className="text-xs text-slate-400">Mínimo: {p.estoqueMinimo}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500">Nenhuma peça abaixo do estoque mínimo.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2"><List size={16} className="text-indigo-400"/> Curva ABC (Pareto)</h3>
                <div className="h-64 w-full">
                    {metricas.curvaAbc?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metricas.curvaAbc} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="nome" stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} />
                                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                                    formatter={(value: any) => formatCurrency(Number(value))}
                                />
                                <Bar dataKey="faturamentoTotal" name="Faturamento">
                                  {metricas.curvaAbc.map((entry:any, index:number) => (
                                    <Cell key={`cell-${index}`} fill={entry.classificacao === 'A' ? '#10b981' : entry.classificacao === 'B' ? '#f59e0b' : '#64748b'} />
                                  ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">Dados insuficientes para Curva ABC</div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3 e 4: Mercado e DRE */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Smartphone className="text-purple-400" /> Top Marcas Atendidas</h2>
              <div className="h-64 w-full">
                    {metricas.topMarcas?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metricas.topMarcas}
                                    dataKey="quantidade"
                                    nameKey="marca"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {metricas.topMarcas.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">Nenhum dado de marca registrado.</div>
                    )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><DollarSign className="text-emerald-400" /> DRE Analítica de Margem</h2>
              <div className="space-y-4 mt-6">
                 <div className="flex justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-medium">Margem Líquida em Peças</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(metricas.margemPecas)}</span>
                 </div>
                 <div className="flex justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-medium">Margem Bruta em Serviços (Mão de Obra)</span>
                    <span className="text-indigo-400 font-bold">{formatCurrency(metricas.margemServicos)}</span>
                 </div>
                 <div className="flex justify-between p-4 bg-slate-950 rounded-lg border border-red-500/20">
                    <span className="text-red-400 font-medium">Custo Oculto com Garantias</span>
                    <span className="text-red-400 font-bold">-{formatCurrency(metricas.custoGarantia)}</span>
                 </div>
                 <div className="flex justify-between p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <span className="text-emerald-400 font-bold">Lucro Líquido Real</span>
                    <span className="text-emerald-400 font-bold text-xl">{formatCurrency(metricas.lucroMes)}</span>
                 </div>
              </div>
            </div>

          </div>

          {/* Seção CRM: Aparelhos Abandonados */}
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><AlertCircle className="text-orange-400" /> CRM: Aparelhos Abandonados (&gt; 30 dias)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">OS # / Cliente</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Aparelho</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Dias Esquecido</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Valor Retido</th>
                  </tr>
                </thead>
                <tbody>
                  {metricas.aparelhosAbandonados?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        <CheckCircle size={48} className="mx-auto text-emerald-700 mb-3" />
                        Nenhum aparelho abandonado na bancada!
                      </td>
                    </tr>
                  ) : (
                    metricas.aparelhosAbandonados?.map((a: any) => (
                      <tr key={a.orcamentoId} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white">#{a.orcamentoId} - {a.clienteNome} <br/><span className="text-xs text-slate-500">{a.telefone}</span></td>
                        <td className="px-6 py-4">{a.aparelho}</td>
                        <td className="px-6 py-4"><span className="text-orange-400 font-bold">{a.diasAbandonado} dias</span></td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-400">{formatCurrency(a.valorDevido)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
