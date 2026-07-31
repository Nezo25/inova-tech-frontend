"use client";
import { apiFetch } from '@/utils/api';

import React, { useEffect, useState } from "react";
import { Plus, ArrowDown, ArrowUp, DollarSign, Trash2, CheckCircle2, Clock, CalendarDays, Wallet, Link as LinkIcon, Copy } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function FinanceiroPage() {
  const [resumo, setResumo] = useState({
    receitas: 0, despesas: 0, saldo: 0, aReceber: 0, aPagar: 0, transacoes: [], contasFixas: []
  });
  
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("UNICA"); // UNICA, PARCELADA, RECORRENTE
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    tipo: "RECEITA",
    totalParcelas: 1,
    taxaCartao: 0,
    dataVencimento: new Date().toISOString().split('T')[0],
    categoriaDespesa: "OUTROS",
    quantidadeRecorrencias: 12,
    statusPagamento: "PAGO" // Para transações únicas, já pode nascer PAGO ou PENDENTE
  });

  useEffect(() => {
    fetchResumo();
  }, [mes, ano]);

  const fetchResumo = () => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/transacoes/resumo?mes=${mes}&ano=${ano}`)
      .then((res) => res.json())
      .then((data) => setResumo(data))
      .catch((err) => console.error(err));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      tipo: formData.tipo,
      statusPagamento: modalMode === 'UNICA' ? formData.statusPagamento : 'PENDENTE',
      totalParcelas: modalMode === 'PARCELADA' ? formData.totalParcelas : 1,
      taxaCartao: modalMode === 'PARCELADA' ? formData.taxaCartao : 0,
      isRecorrente: modalMode === 'RECORRENTE',
      dataVencimento: formData.dataVencimento,
      categoriaDespesa: modalMode === 'RECORRENTE' ? formData.categoriaDespesa : null,
      quantidadeRecorrencias: modalMode === 'RECORRENTE' ? formData.quantidadeRecorrencias : 12
    };

    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/transacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then(() => {
        toast.success("Transação salva com sucesso!");
        setShowModal(false);
        setFormData({ descricao: "", valor: "", tipo: "RECEITA", totalParcelas: 1, taxaCartao: 0, dataVencimento: new Date().toISOString().split('T')[0], categoriaDespesa: "OUTROS", quantidadeRecorrencias: 12, statusPagamento: "PAGO" });
        fetchResumo();
      })
      .catch((err) => {
        toast.error("Erro ao salvar transação.");
        console.error(err);
      });
  };

  const deletarTransacao = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    
    const t = toast.loading("Excluindo...");
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/transacoes/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success("Transação excluída!", { id: t });
        fetchResumo();
      } else {
        toast.error("Erro ao excluir transação.", { id: t });
      }
    } catch (error) {
      toast.error("Erro de conexão.", { id: t });
    }
  };

  const deletarEmLote = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedIds.length} transações?`)) return;

    const t = toast.loading(`Excluindo ${selectedIds.length} transações...`);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/transacoes/excluir-em-lote`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });

      if (res.ok) {
        toast.success("Transações excluídas com sucesso!", { id: t });
        setSelectedIds([]);
        fetchResumo();
      } else {
        toast.error("Erro ao excluir transações em lote.", { id: t });
      }
    } catch (error) {
      toast.error("Erro de conexão.", { id: t });
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(resumo.transacoes.map((t: any) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const darBaixa = async (id: number) => {
    const t = toast.loading("Baixando transação...");
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/transacoes/${id}/baixa`, {
        method: 'PATCH'
      });

      if (res.ok) {
        toast.success("Baixa realizada com sucesso!", { id: t });
        fetchResumo();
      } else {
        toast.error("Erro ao dar baixa.", { id: t });
      }
    } catch (error) {
      toast.error("Erro de conexão.", { id: t });
    }
  };

  const copyAsaasLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link do Asaas copiado para a área de transferência!");
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">Fluxo de Caixa</h1>
          <p className="text-slate-400 mt-1">Gestão de pagamentos, recebimentos e recorrências.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900/50 rounded-lg p-1 border border-white/5">
            <button onClick={() => setMes(mes === 1 ? 12 : mes - 1)} className="px-3 py-1 text-slate-400 hover:text-white">&lt;</button>
            <div className="px-4 py-1 text-white font-medium">Mês {mes}/{ano}</div>
            <button onClick={() => setMes(mes === 12 ? 1 : mes + 1)} className="px-3 py-1 text-slate-400 hover:text-white">&gt;</button>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Nova Transação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border-l-4 border-emerald-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-slate-400">Saldo Atual (PAGO)</p>
            <Wallet size={20} className="text-emerald-500" />
          </div>
          <h3 className="text-3xl font-bold text-white font-outfit">
            R$ {resumo.saldo ? resumo.saldo.toFixed(2) : "0.00"}
          </h3>
        </div>

        <div className="glass p-6 rounded-2xl border-l-4 border-cyan-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-slate-400">A Receber (Pendente)</p>
            <ArrowUp size={20} className="text-cyan-500" />
          </div>
          <h3 className="text-3xl font-bold text-white font-outfit">
            R$ {resumo.aReceber ? resumo.aReceber.toFixed(2) : "0.00"}
          </h3>
        </div>

        <div className="glass p-6 rounded-2xl border-l-4 border-red-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-slate-400">A Pagar (Pendente)</p>
            <ArrowDown size={20} className="text-red-500" />
          </div>
          <h3 className="text-3xl font-bold text-white font-outfit">
            R$ {resumo.aPagar ? resumo.aPagar.toFixed(2) : "0.00"}
          </h3>
        </div>
      </div>

      {resumo.contasFixas && resumo.contasFixas.length > 0 && (
        <div className="glass p-6 rounded-2xl border border-white/5">
          <h2 className="text-lg font-bold text-white mb-4">Contas Fixas do Mês</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {resumo.contasFixas.map((conta: any) => (
              <div key={conta.id} className="bg-slate-900/50 p-3 rounded-lg flex items-center justify-between border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{conta.categoriaDespesa || 'Recorrente'}</p>
                  <p className="text-xs text-slate-400">R$ {conta.valor.toFixed(2)}</p>
                </div>
                {conta.statusPagamento === 'PAGO' ? (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full font-medium">
                    <CheckCircle2 size={10} /> Pago
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full font-medium">
                    <Clock size={10} /> Dia {conta.dataVencimento ? new Date(conta.dataVencimento + "T00:00:00").getDate() : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        {selectedIds.length > 0 && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-center justify-between">
            <span className="text-red-400 font-medium">{selectedIds.length} transação(ões) selecionada(s)</span>
            <button onClick={deletarEmLote} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Trash2 size={16} />
              Excluir Selecionados
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium w-10">
                  <input type="checkbox" onChange={toggleAll} checked={resumo.transacoes.length > 0 && selectedIds.length === resumo.transacoes.length} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" />
                </th>
                <th className="px-6 py-4 font-medium">Vencimento</th>
                <th className="px-6 py-4 font-medium">Descrição</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Valor</th>
                <th className="px-6 py-4 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {resumo.transacoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma movimentação neste mês.
                  </td>
                </tr>
              ) : (
                resumo.transacoes.map((t: any) => (
                  <tr key={t.id} className={`border-b border-white/5 transition-colors ${selectedIds.includes(t.id) ? 'bg-slate-800/50' : 'hover:bg-white/5'}`}>
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleSelection(t.id)} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-slate-500"/>
                        {t.dataVencimento ? new Date(t.dataVencimento + "T00:00:00").toLocaleDateString('pt-BR') : new Date(t.dataTransacao).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{t.descricao}</div>
                      {t.isRecorrente && <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full ml-2">Recorrente</span>}
                    </td>
                    <td className="px-6 py-4">
                      {t.statusPagamento === 'PAGO' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">
                          <CheckCircle2 size={12} /> Pago
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400">
                          <Clock size={12} /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      <span className={t.tipo === 'RECEITA' ? 'text-emerald-400' : 'text-red-400'}>
                        {t.tipo === 'RECEITA' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2 items-center">
                      {t.asaasPaymentUrl && (
                        <button onClick={() => copyAsaasLink(t.asaasPaymentUrl)} className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900 px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1" title="Copiar Link de Pagamento">
                          <LinkIcon size={12} /> Link
                        </button>
                      )}
                      {t.statusPagamento === 'PENDENTE' && (
                        <button onClick={() => darBaixa(t.id)} className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                          Baixar
                        </button>
                      )}
                      <button onClick={() => deletarTransacao(t.id)} className="text-slate-500 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass p-8 rounded-2xl w-full max-w-lg border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative">
            <h2 className="text-2xl font-bold font-outfit text-white mb-6">Lançamento Financeiro</h2>
            
            <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-lg">
              <button type="button" onClick={() => setModalMode('UNICA')} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${modalMode === 'UNICA' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Única</button>
              <button type="button" onClick={() => setModalMode('PARCELADA')} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${modalMode === 'PARCELADA' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Parcelada (Cartão)</button>
              <button type="button" onClick={() => setModalMode('RECORRENTE')} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${modalMode === 'RECORRENTE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Recorrente</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                  <input required type="text" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors" placeholder="Ex: Venda iPhone 13" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Valor Total (R$)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-slate-500" />
                    </div>
                    <input required type="number" step="0.01" min="0.01" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors" placeholder="0.00" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
                  <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors appearance-none">
                    <option value="RECEITA">Receita</option>
                    <option value="DESPESA">Despesa</option>
                  </select>
                </div>

                {modalMode === 'UNICA' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Data do Recebimento/Pagamento</label>
                      <input required type="date" value={formData.dataVencimento} onChange={e => setFormData({...formData, dataVencimento: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                      <select value={formData.statusPagamento} onChange={e => setFormData({...formData, statusPagamento: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors appearance-none">
                        <option value="PAGO">Pago (Caiu na conta)</option>
                        <option value="PENDENTE">Pendente (A Receber / A Pagar)</option>
                      </select>
                    </div>
                  </>
                )}

                {modalMode === 'PARCELADA' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Nº Parcelas</label>
                      <input required type="number" min="2" max="24" value={formData.totalParcelas} onChange={e => setFormData({...formData, totalParcelas: parseInt(e.target.value)})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Taxa Máquina (%)</label>
                      <input required type="number" step="0.01" min="0" value={formData.taxaCartao} onChange={e => setFormData({...formData, taxaCartao: parseFloat(e.target.value)})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors" />
                    </div>
                  </>
                )}

                {modalMode === 'RECORRENTE' && (
                  <>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Data do Primeiro Vencimento</label>
                      <input required type="date" value={formData.dataVencimento} onChange={e => setFormData({...formData, dataVencimento: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Categoria da Despesa</label>
                      <select required value={formData.categoriaDespesa} onChange={e => setFormData({...formData, categoriaDespesa: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors appearance-none">
                        <option value="ALUGUEL">Aluguel</option>
                        <option value="AGUA_LUZ">Água e Luz</option>
                        <option value="INTERNET">Internet</option>
                        <option value="SERVIDORES">Servidores</option>
                        <option value="FORNECEDORES">Fornecedores</option>
                        <option value="MARKETING">Marketing</option>
                        <option value="OUTROS">Outros</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Projetar por quantos meses?</label>
                      <input required type="number" min="1" max="60" value={formData.quantidadeRecorrencias} onChange={e => setFormData({...formData, quantidadeRecorrencias: parseInt(e.target.value)})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-400 outline-none transition-colors" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-2 rounded-lg transition-colors">Lançar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
