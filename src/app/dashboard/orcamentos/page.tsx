"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import { Plus, X, Trash2, CheckCircle, PenTool } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { SignatureModal } from '@/components/ui/SignatureModal';

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

  // States para Assinatura Digital
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [orcamentoParaAssinar, setOrcamentoParaAssinar] = useState<number | null>(null);
  
  // Itens do carrinho
  const [itensCarrinho, setItensCarrinho] = useState<any[]>([]);
  const [selectedPecaId, setSelectedPecaId] = useState('');
  const [quantidadeItem, setQuantidadeItem] = useState('1');

  // Cadastro Rápido de Peça Zero Estoque
  const [mostrarCadastroRapido, setMostrarCadastroRapido] = useState(false);
  const [novaPecaRapida, setNovaPecaRapida] = useState({
    nome: '',
    marca: '',
    modelo: '',
    custo: '',
    precoVenda: '',
    quantidadePedido: '1'
  });

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

    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      newWindow.document.write("<html><body style='font-family:sans-serif; padding: 20px;'>Aguarde, redirecionando para o WhatsApp...</body></html>");
      newWindow.document.close();
    }

    const t = toast.loading("Aprovando...");
    try {
      const res = await fetch(`${getApiUrl()}/api/orcamentos/${orcamentoIdAprovar}/aprovar`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Orçamento aprovado com sucesso! Estoque e financeiro atualizados.', { id: t });
        
        if (data.whatsappUrl && newWindow) {
          newWindow.location.href = data.whatsappUrl;
          // Fallback just in case location.href gets blocked
          newWindow.document.body.innerHTML = `
            <h3>Mensagem gerada com sucesso!</h3>
            <p>Se o WhatsApp não abrir automaticamente, <a href="${data.whatsappUrl}" target="_blank" style="color: #25D366; font-weight: bold; font-size: 18px;">clique aqui para abrir</a>.</p>
            <p><small>Você pode fechar esta aba depois.</small></p>
          `;
        } else if (newWindow) {
          newWindow.close();
        }

        setOrcamentoIdAprovar('');
        buscarOrcamentos();
        buscarPecas();
      } else {
        if (newWindow) newWindow.close();
        try {
          const data = await res.json();
          toast.error(data.message || 'Erro ao aprovar. Verifique o estoque.', { id: t, duration: 5000 });
        } catch (e) {
          toast.error('Erro ao aprovar. Verifique o estoque ou se já foi aprovado.', { id: t });
        }
      }
    } catch (error) {
      if (newWindow) newWindow.close();
      toast.error('Erro de conexão ao aprovar.', { id: t });
    }
  };

  const cadastrarPecaRapida = async (cliente: any) => {
    if (!novaPecaRapida.nome || !novaPecaRapida.precoVenda) {
      toast.error('Preencha pelo menos o nome e o preço de venda da peça.');
      return;
    }
    const t = toast.loading("Cadastrando peça inicial...");
    try {
      const payload = {
        nome: novaPecaRapida.nome,
        modelo: novaPecaRapida.modelo || cliente.modeloProduto || "",
        marca: novaPecaRapida.marca || cliente.marcaAparelho || "",
        cor: "",
        sku: "",
        custo: parseFloat(novaPecaRapida.custo.replace(',', '.')) || 0,
        precoVenda: parseFloat(novaPecaRapida.precoVenda.replace(',', '.')) || 0,
        quantidadeEstoque: parseInt(novaPecaRapida.quantidadePedido) || 1, 
        estoqueMinimo: 3,
        categoria: "PECA",
        ativo: true
      };
      
      const res = await fetch(`${getApiUrl()}/api/pecas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const pecaCriada = await res.json();
        
        // Add to cart directly
        const qtd = parseInt(novaPecaRapida.quantidadePedido) || 1;
        setItensCarrinho(prev => [...prev, {
          pecaId: pecaCriada.id,
          nome: pecaCriada.nome,
          quantidade: qtd,
          precoUnitario: pecaCriada.precoVenda,
          subtotal: (pecaCriada.precoVenda * qtd)
        }]);
        
        toast.success("Peça cadastrada e adicionada ao orçamento!", { id: t });
        setMostrarCadastroRapido(false);
        setNovaPecaRapida({ nome: '', marca: '', modelo: '', custo: '', precoVenda: '', quantidadePedido: '1' });
        buscarPecas(); // reload pieces
      } else {
        toast.error("Erro ao cadastrar peça.", { id: t });
      }
    } catch(error) {
      toast.error("Erro de conexão", { id: t });
    }
  };

  const cancelarOrcamento = async (id: number) => {
    if (!confirm("Tem certeza que deseja cancelar/estornar este orçamento? As peças voltarão ao estoque e o financeiro será estornado.")) return;
    
    const t = toast.loading("Cancelando...");
    try {
      const res = await fetch(`${getApiUrl()}/api/orcamentos/${id}/cancelar`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (res.ok) {
        toast.success("Orçamento cancelado com sucesso!", { id: t });
        buscarOrcamentos();
        buscarPecas();
      } else {
        toast.error("Erro ao cancelar orçamento.", { id: t });
      }
    } catch (error) {
      toast.error("Erro de conexão.", { id: t });
    }
  };

  const imprimirComprovante = async (orcamento: any) => {
    const t = toast.loading("Gerando comprovante...");
    let config = {
      nomeFantasia: 'InovaTech Assistência',
      cnpj: '00.000.000/0000-00',
      endereco: 'Rua Principal, 1000',
      telefone: '(00) 0000-0000',
      termoGarantia: 'Garantia padrão de 90 dias para defeitos de fabricação ou serviços prestados.'
    };

    try {
      const res = await fetch(`${getApiUrl()}/api/configuracoes-loja`, { headers: getHeaders() });
      if (res.ok) {
        config = await res.json();
      }
    } catch (e) {
      console.warn("Erro ao buscar configs da loja, usando padrão.");
    }
    toast.dismiss(t);

    const dataStr = new Date(orcamento.dataCriacao).toLocaleDateString();
    let itensHtml = orcamento.itens.map((i: any) => {
      const skuStr = i.peca?.sku ? `<br><small style="color: #666;">SKU: ${i.peca.sku}</small>` : '';
      return `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.quantidade}x</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.peca?.nome} ${skuStr}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R$ ${i.precoUnitarioAplicado?.toFixed(2)}</td>
      </tr>`;
    }).join('');

    const assinaturaHtml = orcamento.assinaturaBase64 
      ? `<div style="text-align: center; margin-top: 20px;">
           <img src="${orcamento.assinaturaBase64}" style="max-height: 100px; display: block; margin: 0 auto;" />
           <div style="width: 200px; border-top: 1px solid #333; margin: 5px auto 0;">Assinatura do Cliente</div>
         </div>`
      : `<div style="text-align: center; margin-top: 60px;">
           <div style="width: 200px; border-top: 1px solid #333; margin: 0 auto;">Assinatura do Cliente</div>
         </div>`;

    const html = `
      <html>
        <head>
          <title>Comprovante - Orçamento #${orcamento.id}</title>
          <style>
            @media print {
              @page { margin: 0.5cm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0 0 5px 0; font-size: 24px; }
            .header p { margin: 2px 0; font-size: 14px; color: #555; }
            .info-box { display: flex; justify-content: space-between; background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee; }
            .info-col p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f2f2f2; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
            th:last-child { text-align: right; }
            .total-row { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 10px; padding-top: 10px; border-top: 2px solid #333; }
            .status { font-weight: bold; padding: 3px 8px; border-radius: 4px; color: #fff; background: ${orcamento.status === 'CANCELADO' ? '#ef4444' : orcamento.status === 'APROVADO' ? '#10b981' : '#f59e0b'}; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: justify; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${config.nomeFantasia}</h1>
            <p>CNPJ: ${config.cnpj} | Tel: ${config.telefone}</p>
            <p>${config.endereco}</p>
          </div>
          
          <div class="info-box">
            <div class="info-col">
              <p><strong>Comprovante de Orçamento / Serviço</strong></p>
              <p><strong>Cliente:</strong> ${orcamento.cliente?.nomeCliente || 'Desconhecido'}</p>
            </div>
            <div class="info-col" style="text-align: right;">
              <p><strong>Orçamento:</strong> #${orcamento.id.toString().padStart(4, '0')}</p>
              <p><strong>Data:</strong> ${dataStr}</p>
              <p><strong>Status:</strong> <span class="status">${orcamento.status}</span></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Qtd</th>
                <th>Peça / Serviço</th>
                <th>Valor Unit.</th>
              </tr>
            </thead>
            <tbody>
              ${itensHtml}
            </tbody>
          </table>
          <div class="total-row">
            Total Geral: R$ ${orcamento.valorTotal?.toFixed(2)}
          </div>
          
          <div class="footer termo-garantia">
            <strong>Termo de Garantia:</strong><br><br>
            ${config.termoGarantia.replace(/\\n/g, '<br>')}
            <br><br>
            <p style="text-align: center; margin-top: 30px; font-weight: bold;">Obrigado pela preferência!</p>
            ${assinaturaHtml}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
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

  const deletarOrcamento = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento permanentemente?")) return;
    
    const t = toast.loading("Excluindo...");
    try {
      const res = await fetch(`${getApiUrl()}/api/orcamentos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        toast.success("Orçamento excluído com sucesso!", { id: t });
        buscarOrcamentos();
      } else {
        toast.error("Erro ao excluir orçamento.", { id: t });
      }
    } catch (error) {
      toast.error("Erro de conexão.", { id: t });
    }
  };

  const salvarAssinatura = async (base64: string) => {
    if (!orcamentoParaAssinar) return;

    const t = toast.loading("Salvando assinatura...");
    try {
      const res = await fetch(`${getApiUrl()}/api/orcamentos/${orcamentoParaAssinar}/assinar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ assinaturaBase64: base64 })
      });

      if (res.ok) {
        toast.success("Assinatura salva com sucesso!", { id: t });
        setShowSignatureModal(false);
        setOrcamentoParaAssinar(null);
        buscarOrcamentos();
      } else {
        toast.error("Erro ao salvar assinatura.", { id: t });
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
                {pecas.filter(p => p.quantidadeEstoque > 0 && p.categoria !== 'APARELHO').map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-slate-300">#{p.id}</td>
                    <td className="px-4 py-3">
                      <div>{p.nome} {p.sku && <span className="text-[10px] ml-2 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{p.sku}</span>}</div>
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
                {pecas.filter(p => p.quantidadeEstoque > 0 && p.categoria !== 'APARELHO').length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Nenhuma peça com estoque disponível no momento.
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
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 rounded-tr-xl text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {[...orcamentos].sort((a: any, b: any) => {
                const aEntregue = a.status === 'ENTREGUE_E_PAGO';
                const bEntregue = b.status === 'ENTREGUE_E_PAGO';
                if (aEntregue !== bEntregue) return aEntregue ? 1 : -1;
                const dataA = new Date(a.dataCriacao || a.createdAt || 0).getTime();
                const dataB = new Date(b.dataCriacao || b.createdAt || 0).getTime();
                return dataB - dataA;
              }).map((o: any) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 font-bold text-slate-300">#{o.id}</td>
                  <td className="px-6 py-4 text-white font-medium">{o.cliente?.nomeCliente || 'Desconhecido'}</td>
                  <td className="px-6 py-4 text-slate-400">{o.dataCriacao ? new Date(o.dataCriacao).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      o.status === 'ORCAMENTO_APROVADO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : o.status === 'CANCELADO' ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                      : o.status === 'ORCAMENTO_WEB' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      : o.status === 'AGUARDANDO_PECA_ESTOQUE_ZERADO' || o.status === 'AGUARDANDO_PECA' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : o.status === 'PECA_EM_ESTOQUE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : o.status === 'EM_MANUTENCAO' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : o.status === 'AGUARDANDO_RETIRADA' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : o.status === 'ENTREGUE_E_PAGO' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                      {o.status === 'AGUARDANDO_PECA_ESTOQUE_ZERADO' ? 'ESTOQUE ZERADO (AGUARD. PEÇA)' : o.status ? o.status.replace(/_/g, ' ') : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {o.itens?.map((i: any) => (
                      <div key={i.id} className="text-xs mb-1">
                        <span className="text-white">{i.quantidade}x</span> {i.peca?.nome} {i.peca?.sku && <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded mx-1">{i.peca.sku}</span>} <span className="text-slate-500">(R$ {i.precoUnitarioAplicado?.toFixed(2)})</span>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-400">R$ {o.valorTotal?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => {
                        setOrcamentoParaAssinar(o.id);
                        setShowSignatureModal(true);
                      }} 
                      className="text-slate-500 hover:text-indigo-400 transition-colors p-2 text-xs font-bold" 
                      title="Assinar"
                    >
                      ✍️ Assinar
                    </button>
                    <button onClick={() => imprimirComprovante(o)} className="text-slate-500 hover:text-blue-400 transition-colors p-2 text-xs font-bold" title="Imprimir Comprovante">
                      🖨️ PDF
                    </button>
                    {o.status !== 'CANCELADO' && (
                      <button onClick={() => cancelarOrcamento(o.id)} className="text-slate-500 hover:text-yellow-500 transition-colors p-2 text-xs font-bold" title="Cancelar / Estornar">
                        🚫 Cancelar
                      </button>
                    )}
                    <button onClick={() => deletarOrcamento(o.id)} className="text-slate-500 hover:text-red-500 transition-colors p-2" title="Excluir Definitivamente">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {orcamentos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
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
                  <option value="" disabled>-- Escolha um cliente / OS --</option>
                  {clientes
                    .filter(c => !orcamentos.some(o => o.cliente?.id === c.id))
                    .map(c => (
                    <option key={c.id} value={c.id}>OS #{c.id} - {c.nomeCliente} ({c.marcaAparelho} {c.modeloProduto})</option>
                  ))}
                </select>

                {/* Info do Aparelho do Cliente */}
                {(() => {
                  const clienteSelecionado = clientes.find(c => c.id.toString() === selectedClienteId);
                  if (clienteSelecionado && clienteSelecionado.modeloProduto) {
                    const normalizarTexto = (texto: string) => {
                      return (texto || '')
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
                        .replace(/[^a-z0-9]/g, "");     // Remove espaços e caracteres especiais
                    };
                    
                    const termoBusca = normalizarTexto(clienteSelecionado.modeloProduto);
                    const pecasParaManutencao = pecas.filter((p: any) => p.categoria !== 'APARELHO');
                    
                    const pecasDoModelo = pecasParaManutencao.filter((p: any) => 
                      normalizarTexto(p.nome).includes(termoBusca) || 
                      normalizarTexto(p.modelo).includes(termoBusca)
                    );
                    const temEstoque = pecasDoModelo.some(p => p.quantidadeEstoque > 0);

                    return (
                      <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-white/10 text-sm">
                        <p className="text-slate-300 mb-2">
                          📱 Cliente possui um <strong>{clienteSelecionado.marcaAparelho} {clienteSelecionado.modeloProduto}</strong>.
                        </p>
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                          <span className="font-bold">⚠️ Defeito Relatado:</span> {clienteSelecionado.defeitoRelatado || 'Nenhum defeito especificado.'}
                        </div>
                        {temEstoque ? (
                          <p className="text-emerald-400 font-medium">
                            ✅ Temos peças (telas/componentes) compatíveis em estoque! Busque abaixo.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <p className="text-red-400 font-medium flex items-center gap-2 flex-wrap">
                              ❌ Sem peças em estoque para este modelo.
                              <a 
                                href={`https://lista.mercadolivre.com.br/tela-${clienteSelecionado.modeloProduto.replace(/\\s+/g, '-')}`}
                                target="_blank" 
                                rel="noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center gap-1"
                              >
                                Buscar no fornecedor
                              </a>
                            </p>
                            
                            {!mostrarCadastroRapido ? (
                              <button 
                                type="button"
                                onClick={() => {
                                  setNovaPecaRapida({
                                    ...novaPecaRapida, 
                                    marca: clienteSelecionado.marcaAparelho || '', 
                                    modelo: clienteSelecionado.modeloProduto || ''
                                  });
                                  setMostrarCadastroRapido(true);
                                }}
                                className="text-sm bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/30 px-3 py-1.5 rounded-lg w-fit transition-colors"
                              >
                                + Cadastrar peça zerada pro pedido
                              </button>
                            ) : (
                              <div className="bg-black/40 p-3 rounded-lg border border-yellow-500/30 flex flex-col gap-2 mt-2">
                                <h4 className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-1">Cadastro Rápido (Lançar Estoque Inicial)</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Nome da peça (ex: Tela Original)"
                                    value={novaPecaRapida.nome}
                                    onChange={e => setNovaPecaRapida({...novaPecaRapida, nome: e.target.value})}
                                    className="bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-yellow-500 outline-none"
                                  />
                                  <div className="flex gap-2">
                                    <input 
                                      type="text" 
                                      placeholder="Marca"
                                      value={novaPecaRapida.marca}
                                      onChange={e => setNovaPecaRapida({...novaPecaRapida, marca: e.target.value})}
                                      className="bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-yellow-500 outline-none w-1/2"
                                    />
                                    <input 
                                      type="text" 
                                      placeholder="Modelo"
                                      value={novaPecaRapida.modelo}
                                      onChange={e => setNovaPecaRapida({...novaPecaRapida, modelo: e.target.value})}
                                      className="bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-yellow-500 outline-none w-1/2"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text" 
                                      placeholder="Custo (R$)"
                                      value={novaPecaRapida.custo}
                                      onChange={e => setNovaPecaRapida({...novaPecaRapida, custo: e.target.value})}
                                      className="bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-yellow-500 outline-none w-1/3"
                                    />
                                    <input 
                                      type="text" 
                                      placeholder="Venda (R$)"
                                      value={novaPecaRapida.precoVenda}
                                      onChange={e => setNovaPecaRapida({...novaPecaRapida, precoVenda: e.target.value})}
                                      className="bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-yellow-500 outline-none w-1/3"
                                    />
                                    <input 
                                      type="number" 
                                      min="1"
                                      placeholder="Qtd"
                                      value={novaPecaRapida.quantidadePedido}
                                      onChange={e => setNovaPecaRapida({...novaPecaRapida, quantidadePedido: e.target.value})}
                                      className="bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-yellow-500 outline-none w-1/3"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-1">
                                  <button 
                                    type="button"
                                    onClick={() => setMostrarCadastroRapido(false)}
                                    className="text-xs text-slate-400 hover:text-white px-2 py-1"
                                  >
                                    Cancelar
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => cadastrarPecaRapida(clienteSelecionado)}
                                    className="text-xs bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-3 py-1 rounded transition-colors"
                                  >
                                    Salvar e Adicionar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
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
                      {pecas
                        .filter(p => p.quantidadeEstoque > 0 && p.categoria !== 'APARELHO')
                        .filter(p => {
                          if (!selectedClienteId) return true;
                          const cli = clientes.find(c => c.id.toString() === selectedClienteId);
                          if (!cli || !cli.modeloProduto) return true;
                          
                          const termoBusca = normalizarTexto(cli.modeloProduto);
                          const isGeral = normalizarTexto(p.modelo || '').includes('geral') || normalizarTexto(p.marca || '').includes('geral');
                          
                          // Match bi-direcional mais inteligente
                          const modeloPeca = normalizarTexto(p.modelo || '');
                          const nomePeca = normalizarTexto(p.nome);
                          
                          const isCompatible = 
                            (modeloPeca && (termoBusca.includes(modeloPeca) || modeloPeca.includes(termoBusca))) ||
                            (nomePeca && (termoBusca.includes(nomePeca) || nomePeca.includes(termoBusca))) ||
                            // Fallback caso a pessoa tenha digitado "apple iphone 12" e a peça tenha "iphone 12" no nome
                            termoBusca.split('').filter(c => c !== ' ').join('').includes(modeloPeca.replace(/ /g, '')) ||
                            modeloPeca.replace(/ /g, '').includes(termoBusca.replace(/ /g, '')) ||
                            nomePeca.replace(/ /g, '').includes(termoBusca.replace(/ /g, '')) ||
                            termoBusca.replace(/ /g, '').includes(nomePeca.replace(/ /g, ''));
                          
                          return isCompatible || isGeral;
                        })
                        .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.sku ? `[${p.sku}] ` : ''}{p.nome} {p.marca || p.modelo ? `(${p.marca ? p.marca + ' ' : ''}${p.modelo || ''})` : ''} {p.cor ? `(${p.cor})` : ''} - R$ {p.precoVenda?.toFixed(2)} (Estoque: {p.quantidadeEstoque})
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

      {/* MODAL DE ASSINATURA */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => {
          setShowSignatureModal(false);
          setOrcamentoParaAssinar(null);
        }}
        onSave={salvarAssinatura}
      />
    </div>
  );
}
