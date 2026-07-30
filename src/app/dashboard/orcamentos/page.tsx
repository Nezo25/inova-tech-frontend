"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import { Plus, X, Trash2, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OrcamentosPage() {
  const [pecas, setPecas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  
  // States para busca (listagem atual)
  const [marcaBusca, setMarcaBusca] = useState('');
  const [modeloBusca, setModeloBusca] = useState('');
  
  // States para aprovação
  const [orcamentoIdAprovar, setOrcamentoIdAprovar] = useState('');

  // States para Novo Orçamento (Modal)
  const [showModal, setShowModal] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  
  // Itens do carrinho
  const [itensCarrinho, setItensCarrinho] = useState<any[]>([]);
  const [selectedPecaId, setSelectedPecaId] = useState('');
  const [quantidadeItem, setQuantidadeItem] = useState('1');

  useEffect(() => {
    buscarOrcamentos();
    buscarPecas(); // Busca todas as peças sem filtro para o Select do modal
    buscarClientes();
  }, []);

  const getHeaders = () => {
    const { 'inova.token': token } = parseCookies();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Bypass-Tunnel-Reminder': 'true'
    };
  };

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'https://shaggy-chicken-read.loca.lt';

  const buscarOrcamentos = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/orcamentos`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOrcamentos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
    }
  };

  const buscarClientes = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/clientes`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setClientes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const buscarPecas = async (filtros?: { marca?: string, modelo?: string }) => {
    try {
      let url = `${getApiUrl()}/api/pecas?`;
      if (filtros?.marca) url += `marca=${filtros.marca}&`;
      if (filtros?.modelo) url += `modelo=${filtros.modelo}`;

      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPecas(data);
      }
    } catch (error) {
      console.error("Erro ao buscar peças:", error);
    }
  };

  const aprovarOrcamento = async () => {
    if (!orcamentoIdAprovar) {
      toast.error('Informe o ID do Orçamento.');
      return;
    }

    const t = toast.loading("Aprovando...");
    try {
      const res = await fetch(`${getApiUrl()}/api/orcamentos/${orcamentoIdAprovar}/aprovar`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (res.ok) {
        toast.success('Orçamento aprovado com sucesso! Estoque e financeiro atualizados.', { id: t });
        setOrcamentoIdAprovar('');
        buscarOrcamentos();
        buscarPecas();
      } else {
        toast.error('Erro ao aprovar. Verifique o estoque ou se já foi aprovado.', { id: t });
      }
    } catch (error) {
      toast.error('Erro de conexão ao aprovar.', { id: t });
    }
  };

  // Funções do Modal de Criação
  const adicionarItem = () => {
    if (!selectedPecaId) {
      toast.error('Selecione uma peça.');
      return;
    }
    const peca = pecas.find(p => p.id.toString() === selectedPecaId);
    if (!peca) return;
    
    const qtd = parseInt(quantidadeItem) || 1;
    if (qtd > peca.quantidadeEstoque) {
      toast.error(`Quantidade maior que o estoque atual (${peca.quantidadeEstoque}).`);
      return;
    }

    const novoItem = {
      pecaId: peca.id,
      nome: peca.nome,
      quantidade: qtd,
      precoUnitario: peca.precoVenda,
      subtotal: qtd * peca.precoVenda
    };

    setItensCarrinho([...itensCarrinho, novoItem]);
    setSelectedPecaId('');
    setQuantidadeItem('1');
  };

  const removerItem = (index: number) => {
    const novos = [...itensCarrinho];
    novos.splice(index, 1);
    setItensCarrinho(novos);
  };

  const valorTotal = useMemo(() => {
    return itensCarrinho.reduce((acc, item) => acc + item.subtotal, 0);
  }, [itensCarrinho]);

  const salvarOrcamento = async () => {
    if (!selectedClienteId) {
      toast.error('Selecione o cliente.');
      return;
    }
    if (itensCarrinho.length === 0) {
      toast.error('Adicione ao menos uma peça ao orçamento.');
      return;
    }

    const payload = {
      clienteId: parseInt(selectedClienteId),
      itens: itensCarrinho.map(item => ({
        pecaId: item.pecaId,
        quantidade: item.quantidade,
        precoUnitarioAplicado: item.precoUnitario
      }))
    };

    const t = toast.loading("Salvando orçamento...");
    try {
      const res = await fetch(`${getApiUrl()}/api/orcamentos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Orçamento salvo com sucesso!", { id: t });
        setShowModal(false);
        setItensCarrinho([]);
        setSelectedClienteId('');
        buscarOrcamentos();
      } else {
        toast.error("Erro ao salvar orçamento.", { id: t });
      }
    } catch (error) {
      toast.error("Erro de conexão.", { id: t });
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-fade-in text-white font-outfit">
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black tracking-tighter">
          Orçamentos e Estoque
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 px-6 rounded flex items-center gap-2 transition-colors shadow-lg"
        >
          <Plus size={20} /> Novo Orçamento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Aprovar Orçamento */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <CheckCircle className="text-emerald-500" size={24} /> Aprovação e Baixa
            </h2>
            <p className="text-sm text-slate-400 mb-6">Aprove um orçamento para dar baixa automática no estoque e registrar a receita no financeiro.</p>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-slate-400">ID do Orçamento</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-white/10 rounded px-4 py-2 text-white focus:border-yellow-500 outline-none transition-colors"
                  value={orcamentoIdAprovar}
                  onChange={(e) => setOrcamentoIdAprovar(e.target.value)}
                  placeholder="Ex: 5"
                />
              </div>
            </div>
          </div>
          <button 
            onClick={aprovarOrcamento}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded transition-colors shadow-lg"
          >
            Aprovar Serviço/Orçamento
          </button>
        </div>

        {/* Busca de Peças */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-white">Consulta Rápida de Estoque</h2>
          <div className="flex gap-4 items-end mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-slate-400">Marca</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-white/10 rounded px-4 py-2 text-white focus:border-yellow-500 outline-none"
                value={marcaBusca}
                onChange={(e) => setMarcaBusca(e.target.value)}
                placeholder="Ex: Apple"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-slate-400">Modelo</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-white/10 rounded px-4 py-2 text-white focus:border-yellow-500 outline-none"
                value={modeloBusca}
                onChange={(e) => setModeloBusca(e.target.value)}
                placeholder="Ex: iPhone 12"
              />
            </div>
            <button 
              onClick={() => buscarPecas({ marca: marcaBusca, modelo: modeloBusca })}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Buscar
            </button>
          </div>

          <div className="overflow-y-auto max-h-[200px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-black/40 text-slate-400 sticky top-0">
                <tr>
                  <th className="px-4 py-3 rounded-tl">ID</th>
                  <th className="px-4 py-3">Peça</th>
                  <th className="px-4 py-3">Estoque</th>
                  <th className="px-4 py-3 rounded-tr">Venda</th>
                </tr>
              </thead>
              <tbody>
                {pecas.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-slate-300">#{p.id}</td>
                    <td className="px-4 py-3">
                      <div>{p.nome}</div>
                      <div className="text-[10px] text-slate-500">{p.marca} {p.modelo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded font-bold ${p.quantidadeEstoque > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {p.quantidadeEstoque}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-400">R$ {p.precoVenda?.toFixed(2)}</td>
                  </tr>
                ))}
                {pecas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Nenhuma peça no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Histórico de Orçamentos</h2>
          <button 
            onClick={buscarOrcamentos}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
          >
            Atualizar Lista
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase bg-black/40 text-slate-400">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Itens</th>
                <th className="px-6 py-4 rounded-tr-xl">Total</th>
              </tr>
            </thead>
            <tbody>
              {orcamentos.map((o: any) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 font-bold text-slate-300">#{o.id}</td>
                  <td className="px-6 py-4 text-white font-medium">{o.cliente?.nomeCliente || 'Desconhecido'}</td>
                  <td className="px-6 py-4 text-slate-400">{o.dataCriacao ? new Date(o.dataCriacao).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      o.status === 'APROVADO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : o.status === 'ENTREGUE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {o.itens?.map((i: any) => (
                      <div key={i.id} className="text-xs mb-1">
                        <span className="text-white">{i.quantidade}x</span> {i.peca?.nome} <span className="text-slate-500">(R$ {i.precoUnitarioAplicado?.toFixed(2)})</span>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-400">R$ {o.valorTotal?.toFixed(2)}</td>
                </tr>
              ))}
              {orcamentos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum orçamento encontrado. Comece clicando em "Novo Orçamento".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVO ORÇAMENTO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-slate-800/50">
              <h2 className="text-2xl font-bold text-white">Criar Novo Orçamento</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Seleção de Cliente */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Selecione o Cliente</label>
                <select 
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Escolha um cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nomeCliente} (Cel: {c.numeroCelular})</option>
                  ))}
                </select>
              </div>

              {/* Inserção de Peças */}
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-3">Adicionar Peças / Serviços</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <select 
                      value={selectedPecaId}
                      onChange={(e) => setSelectedPecaId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 outline-none cursor-pointer"
                    >
                      <option value="" disabled>-- Buscar Peça no Estoque --</option>
                      {pecas.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nome} {p.cor ? `(${p.cor})` : ''} - R$ {p.precoVenda?.toFixed(2)} (Estoque: {p.quantidadeEstoque})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full md:w-32">
                    <input 
                      type="number" 
                      min="1"
                      value={quantidadeItem}
                      onChange={(e) => setQuantidadeItem(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 outline-none"
                      placeholder="Qtd"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={adicionarItem}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Tabela Temporária (Carrinho) */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Itens do Orçamento</h3>
                <div className="bg-slate-950 border border-white/5 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-black/40 text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Peça</th>
                        <th className="px-4 py-3">Qtd</th>
                        <th className="px-4 py-3">Valor Unit.</th>
                        <th className="px-4 py-3">Subtotal</th>
                        <th className="px-4 py-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensCarrinho.map((item, idx) => (
                        <tr key={idx} className="border-t border-white/5">
                          <td className="px-4 py-3 text-white font-medium">{item.nome}</td>
                          <td className="px-4 py-3 text-slate-300">{item.quantidade}x</td>
                          <td className="px-4 py-3 text-slate-400">R$ {item.precoUnitario.toFixed(2)}</td>
                          <td className="px-4 py-3 font-bold text-emerald-400">R$ {item.subtotal.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => removerItem(idx)} className="text-slate-500 hover:text-red-500 transition-colors p-1">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {itensCarrinho.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                            Nenhum item adicionado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-black/40 border-t border-white/5">
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-right font-bold text-slate-400">TOTAL DO ORÇAMENTO:</td>
                        <td colSpan={2} className="px-4 py-4 font-black text-emerald-400 text-lg">R$ {valorTotal.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-white/5 bg-slate-800/30 flex justify-end gap-4">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-6 py-2.5 rounded text-slate-300 hover:bg-slate-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={salvarOrcamento}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-8 py-2.5 rounded transition-colors shadow-lg"
              >
                Salvar Orçamento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
