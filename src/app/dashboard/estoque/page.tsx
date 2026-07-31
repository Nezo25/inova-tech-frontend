"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from '@/utils/api';
import { Plus, Edit, Trash2, Box, X, AlertTriangle, Camera } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { compressImage } from "@/utils/imageUtils";

export interface Peca {
  id: number;
  nome: string;
  sku: string;
  marca: string;
  modelo: string;
  categoria: string;
  quantidadeEstoque: number;
  quantidadePendente: number;
  precoVenda: number;
  custo: number;
  ativo: boolean;
  exibirNaVitrine?: boolean;
  fotoBase64?: string;
  cor?: string;
  estoqueMinimo?: number;
}

function EstoqueDashboardContent() {
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get("tipo") || "PECA";
  const isAparelho = tipoParam === "APARELHO";
  const titulo = isAparelho ? "Aparelhos / Smartphones" : tipoParam === "ACESSORIO" ? "Acessórios" : "Peças de Reposição";
  const botaoTexto = isAparelho ? "Aparelho" : tipoParam === "ACESSORIO" ? "Acessório" : "Peça";

  const [pecas, setPecas] = useState<Peca[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [modalEntradaAberta, setModalEntradaAberta] = useState(false);
  const [pecaSelecionada, setPecaSelecionada] = useState<Peca | null>(null);
  const [qtdEntrada, setQtdEntrada] = useState<number>(1);
  
  const [formData, setFormData] = useState({
    id: null as number | null,
    nome: "",
    modelo: "",
    marca: isAparelho ? "Apple" : "",
    cor: "",
    sku: "",
    custo: "",
    precoVenda: "",
    quantidadeEstoque: "",
    estoqueMinimo: "3",
    categoria: tipoParam,
    ativo: true,
    isMarcaOutra: false,
    fotoBase64: "",
    exibirNaVitrine: true
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImage(e.target.files[0]);
        setFormData({ ...formData, fotoBase64: compressed });
        toast.success("Foto anexada!");
      } catch (err) {
        console.error("Erro ao comprimir imagem:", err);
        toast.error("Erro ao processar imagem.");
      }
    }
  };

  useEffect(() => {
    fetchPecas();
  }, [tipoParam]); // Re-fetch on query change if needed

  // Efeito para disparar o Parse Preview ao digitar o Nome
  useEffect(() => {
    if (!formData.nome || formData.nome.trim().length < 4) return;

    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/pecas/parse-preview`, {
          method: 'POST',
          body: JSON.stringify({ texto: formData.nome })
        });
        const data = await res.json();

        // Só auto-preenche se o usuário ainda não tiver selecionado/digitado manualmente
        setFormData(prev => ({
          ...prev,
          categoria: prev.categoria || data.categoriaSugerida,
          marca: prev.marca || data.marcaSugerida,
          modelo: prev.modelo || data.modeloExtraido
        }));
      } catch (err) {
        console.error("Erro no parser preview:", err);
      }
    }, 400); // Debounce de 400ms

    return () => clearTimeout(timer);
  }, [formData.nome]);

  const abriModalEntrada = (peca: Peca) => {
    setPecaSelecionada(peca);
    setQtdEntrada(1);
    setModalEntradaAberta(true);
  };

  const handleSalvarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pecaSelecionada) return;

    const loadingToast = toast.loading("Registrando entrada...");
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/pecas/${pecaSelecionada.id}/entrada`, {
        method: "POST",
        body: JSON.stringify({ quantidade: qtdEntrada })
      });
      if (!res.ok) throw new Error();
      toast.success("Entrada registrada com sucesso!", { id: loadingToast });
      setModalEntradaAberta(false);
      fetchPecas();
    } catch (err) {
      toast.error("Erro ao registrar entrada", { id: loadingToast });
    }
  };

  const fetchPecas = () => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/pecas`)
      .then(res => res.json())
      .then(data => {
          // Filtragem baseada no campo 'categoria' retornado pela API
          const filtradas = data.filter((p: any) => {
              const cat = p.categoria || 'PECA'; // default para itens antigos
              if (tipoParam === 'APARELHO') {
                  return cat === 'IPHONE' || cat === 'ANDROID';
              }
              return cat === tipoParam;
          });
          setPecas(filtradas);
      })
      .catch(err => {
        console.error(err);
        toast.error("Erro ao carregar estoque");
      });
  };

  const calcularMargem = (custoStr: string, vendaStr: string) => {
      const custo = parseFloat(custoStr.replace(',', '.')) || 0;
      const venda = parseFloat(vendaStr.replace(',', '.')) || 0;
      if (venda === 0) return 0;
      return ((venda - custo) / venda) * 100;
  };

  const margemAtual = useMemo(() => {
      return calcularMargem(formData.custo.toString(), formData.precoVenda.toString());
  }, [formData.custo, formData.precoVenda]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/pecas/${formData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/pecas`;
        
    const method = isEditing ? "PUT" : "POST";
    const loadingToast = toast.loading("Salvando...");

    const payload = {
        ...formData,
        custo: parseFloat(formData.custo.toString().replace(',', '.')),
        precoVenda: parseFloat(formData.precoVenda.toString().replace(',', '.')),
        quantidadeEstoque: parseInt(formData.quantidadeEstoque.toString()),
        estoqueMinimo: parseInt(formData.estoqueMinimo.toString()),
        categoria: formData.categoria,
        marca: formData.marca ? formData.marca.trim() : "",
        sku: formData.sku
    };

    apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
      })
      .then(() => {
        toast.success("Salvo com sucesso!", { id: loadingToast });
        setShowModal(false);
        fetchPecas();
      })
      .catch(() => toast.error("Erro ao salvar", { id: loadingToast }));
  };

  const handleDelete = (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    
    const loadingToast = toast.loading("Excluindo...");
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/pecas/${id}`, { method: "DELETE" })
      .then(res => {
          if (!res.ok) throw new Error();
          toast.success("Excluído com sucesso", { id: loadingToast });
          fetchPecas();
      })
      .catch(() => toast.error("Erro ao excluir", { id: loadingToast }));
  };

  const handleGerarSku = () => {
    const prefixo = formData.marca ? formData.marca.substring(0, 3).toUpperCase() : 'PEC';
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const skuGerado = `${prefixo}-${Date.now().toString().slice(-4)}-${random}`;
    setFormData((prev) => ({ ...prev, sku: skuGerado }));
  };

  const openNewModal = () => {
      setFormData({ 
          id: null, 
          nome: "", 
          modelo: "", 
          marca: isAparelho ? "Apple" : "", 
          cor: "", 
          sku: "",
          custo: "", 
          precoVenda: "", 
          quantidadeEstoque: "", 
          estoqueMinimo: "3", 
          categoria: isAparelho ? "IPHONE" : tipoParam,
          ativo: true,
          isMarcaOutra: false,
          fotoBase64: "",
          exibirNaVitrine: true
      });
      setIsEditing(false);
      setShowModal(true);
  };

  const openEditModal = (p: any) => {
      setFormData({
          id: p.id,
          nome: p.nome,
          modelo: p.modelo || "",
          marca: p.marca || "",
          cor: p.cor || "",
          sku: p.sku || "",
          custo: p.custo.toString(),
          precoVenda: p.precoVenda.toString(),
          quantidadeEstoque: p.quantidadeEstoque.toString(),
          estoqueMinimo: (p.estoqueMinimo || 3).toString(),
          categoria: p.categoria || "PECA",
          ativo: p.ativo,
          isMarcaOutra: p.marca ? !["Apple", "Samsung", "Xiaomi", "Motorola", "Realme", "LG"].includes(p.marca) : false,
          fotoBase64: p.fotoBase64 || "",
          exibirNaVitrine: p.exibirNaVitrine !== undefined ? p.exibirNaVitrine : true
      });
      setIsEditing(true);
      setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">Estoque: {titulo}</h1>
          <p className="text-slate-400">Gerencie o inventário de {titulo.toLowerCase()}.</p>
        </div>
        <button onClick={openNewModal} className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors">
          <Plus size={20} /> Novo(a) {botaoTexto}
        </button>
      </div>

      <div className="bg-[#07090f] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-white/5">
                <th className="p-4 text-slate-300 font-medium">Nome / Modelo</th>
                <th className="p-4 text-slate-300 font-medium">Cor</th>
                <th className="p-4 text-slate-300 font-medium">Estoque</th>
                <th className="p-4 text-slate-300 font-medium">Custo</th>
                <th className="p-4 text-slate-300 font-medium">Venda</th>
                <th className="p-4 text-slate-300 font-medium">Margem</th>
                {isAparelho && <th className="p-4 text-slate-300 font-medium">Vitrine</th>}
                <th className="p-4 text-slate-300 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pecas.map(p => {
                const isEstoqueBaixo = p.quantidadeEstoque <= (p.estoqueMinimo || 3);
                
                return (
                <tr key={p.id} className={`border-b border-white/5 transition-colors ${isEstoqueBaixo ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'hover:bg-white/[0.02]'}`}>
                  <td className={`p-4 font-medium ${isEstoqueBaixo ? 'text-yellow-500' : 'text-white'}`}>
                      <div className="flex items-center gap-2">
                        {p.nome}
                        {p.sku && <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-white/10">{p.sku}</span>}
                      </div>
                      <div className={`text-xs ${isEstoqueBaixo ? 'text-yellow-500/70' : 'text-slate-500'}`}>{p.modelo}</div>
                  </td>
                  <td className={`p-4 ${isEstoqueBaixo ? 'text-yellow-500' : 'text-slate-300'}`}>{p.cor || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col">
                      <span className={`font-bold ${isEstoqueBaixo ? 'text-yellow-400' : 'text-emerald-500'}`}>
                        {p.quantidadeEstoque} un.
                      </span>
                      {p.quantidadePendente > 0 && (
                        <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                          ⚠️ Faltam {p.quantidadePendente} un.
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`p-4 ${isEstoqueBaixo ? 'text-yellow-500' : 'text-slate-400'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.custo)}
                  </td>
                  <td className={`p-4 font-medium ${isEstoqueBaixo ? 'text-yellow-400' : 'text-white'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.precoVenda)}
                  </td>
                  <td className="p-4">
                      {p.margemLucroPorcentagem ? (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${parseFloat(p.margemLucroPorcentagem) > 20 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                              {p.margemLucroPorcentagem}
                          </span>
                      ) : '-'}
                  </td>
                  {isAparelho && (
                      <td className="p-4">
                          {(() => {
                              if (!p.exibirNaVitrine) return <span className="px-2 py-1 rounded text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">Oculto</span>;
                              if (p.quantidadeEstoque <= 0) return <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">Sem Estoque</span>;
                              if (!p.precoVenda || p.precoVenda <= 0 || !p.fotoBase64) return <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" title={!p.fotoBase64 ? "Falta foto" : "Falta preço"}>Incompleto</span>;
                              return <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Na Vitrine</span>;
                          })()}
                      </td>
                  )}
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => abriModalEntrada(p)}
                      className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      📥 Entrada
                    </button>
                    <button onClick={() => openEditModal(p)} className="text-slate-400 hover:text-yellow-500 p-2 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )})}
              {pecas.length === 0 && (
                  <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">Nenhum item cadastrado.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-slate-800/50">
              <h2 className="text-xl font-bold text-white font-outfit">{isEditing ? 'Editar' : 'Novo(a)'} {botaoTexto}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Nome</label>
                        <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Modelo</label>
                        <input type="text" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none" />
                    </div>
                    {isAparelho && (
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Categoria (Sistema)</label>
                        <select 
                            value={formData.categoria} 
                            onChange={e => {
                                const newCat = e.target.value;
                                setFormData({
                                    ...formData, 
                                    categoria: newCat,
                                    marca: newCat === 'IPHONE' ? 'Apple' : (formData.marca === 'Apple' ? '' : formData.marca),
                                    isMarcaOutra: newCat === 'IPHONE' ? false : formData.isMarcaOutra
                                });
                            }} 
                            className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none"
                        >
                            <option value="IPHONE">iPhone</option>
                            <option value="ANDROID">Android</option>
                        </select>
                    </div>
                    )}
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Marca</label>
                        <select 
                            value={formData.isMarcaOutra ? "Outra" : formData.marca}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === "Outra") {
                                    setFormData({...formData, marca: "", isMarcaOutra: true});
                                } else {
                                    setFormData({...formData, marca: val, isMarcaOutra: false});
                                }
                            }}
                            disabled={formData.categoria === 'IPHONE'}
                            className={`w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white outline-none ${formData.categoria === 'IPHONE' ? 'opacity-50 cursor-not-allowed' : 'focus:border-yellow-500'}`}
                        >
                            <option value="">Selecione...</option>
                            {formData.categoria !== 'ANDROID' && <option value="Apple">Apple</option>}
                            <option value="Samsung">Samsung</option>
                            <option value="Xiaomi">Xiaomi</option>
                            <option value="Motorola">Motorola</option>
                            <option value="Realme">Realme</option>
                            <option value="LG">LG</option>
                            <option value="Outra">Outra</option>
                        </select>
                        {formData.isMarcaOutra && (
                            <input 
                                type="text" 
                                placeholder="Digite a marca..."
                                value={formData.marca} 
                                onChange={e => setFormData({...formData, marca: e.target.value})} 
                                className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none mt-2" 
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Cor</label>
                        <input type="text" placeholder="Ex: Preto, Branco" value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-400">SKU / Código de Barras</label>
                        <div className="flex gap-2">
                            <input
                            type="text"
                            value={formData.sku || ''}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                            placeholder="Deixe em branco p/ gerar auto"
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-yellow-500"
                            />
                            <button
                            type="button"
                            onClick={handleGerarSku}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 border border-slate-700 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
                            title="Gerar SKU automático"
                            >
                            ⚡ Auto
                            </button>
                        </div>
                        <span className="text-[10px] text-slate-500">
                            Digite o código de barras ou clique em Auto. Se deixar em branco, o sistema gerará no envio.
                        </span>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Preço de Custo (R$)</label>
                        <input type="number" step="0.01" required value={formData.custo} onChange={e => setFormData({...formData, custo: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Preço de Venda (R$)</label>
                        <input type="number" step="0.01" required value={formData.precoVenda} onChange={e => setFormData({...formData, precoVenda: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none" />
                        <div className="mt-1 text-xs font-bold flex justify-between">
                            <span className="text-slate-500">Margem estimada:</span>
                            <span className={margemAtual > 0 ? "text-emerald-400" : "text-slate-400"}>
                                {margemAtual.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Estoque Inicial</label>
                        <input type="number" required disabled={isEditing} value={formData.quantidadeEstoque} onChange={e => setFormData({...formData, quantidadeEstoque: e.target.value})} className={`w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white outline-none ${isEditing ? 'opacity-50 cursor-not-allowed' : 'focus:border-yellow-500'}`} title={isEditing ? "Para alterar o estoque, feche esta tela e use o botão '📥 Entrada' na tabela." : ""} />
                        {isEditing && <span className="text-[10px] text-yellow-500/80">Use o botão "📥 Entrada" na tabela para adicionar estoque.</span>}
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Alerta de Mínimo</label>
                        <input type="number" value={formData.estoqueMinimo} onChange={e => setFormData({...formData, estoqueMinimo: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none" />
                    </div>
                    {isAparelho && (
                        <>
                            <div className="col-span-1 md:col-span-2 mt-2 pt-4 border-t border-white/5">
                                <label className="flex items-center gap-2 text-sm text-white font-medium cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.exibirNaVitrine !== false} 
                                        onChange={e => setFormData({...formData, exibirNaVitrine: e.target.checked})}
                                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-slate-900 accent-yellow-500" 
                                    />
                                    Exibir na Vitrine Pública
                                </label>
                                <p className="text-xs text-slate-500 mt-1">Aparelhos sem foto ou sem preço de venda não serão exibidos na loja online, mesmo se marcados.</p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm text-slate-400 mb-1">Foto do Aparelho (Vitrine)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFotoUpload}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors overflow-hidden relative ${formData.fotoBase64 ? 'border-yellow-500' : 'border-white/10 hover:border-yellow-500 bg-slate-950'}`}
                                >
                                    {formData.fotoBase64 ? (
                                        <img src={formData.fotoBase64} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-slate-500">
                                            <Camera size={24} className="mx-auto mb-2 opacity-50" />
                                            <span className="text-sm">Clique para Tirar ou Anexar Foto</span>
                                        </div>
                                    )}
                                </div>
                                {formData.fotoBase64 && (
                                    <div className="flex justify-end mt-2">
                                        <button type="button" onClick={() => setFormData({...formData, fotoBase64: ""})} className="text-xs text-red-400 hover:text-red-300">
                                            Remover Foto
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded text-slate-300 hover:bg-slate-800 transition-colors">Cancelar</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-6 py-2 rounded transition-colors">Salvar</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Entrada de Estoque */}
      {modalEntradaAberta && pecaSelecionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">📥 Registrar Entrada de Peça</h3>
            <p className="text-sm text-slate-400 mb-4">
              Item: <strong className="text-indigo-400">
                {[
                  pecaSelecionada.nome,
                  pecaSelecionada.marca && pecaSelecionada.marca !== 'OUTRAS' && !pecaSelecionada.nome.toLowerCase().includes(pecaSelecionada.marca.toLowerCase()) ? pecaSelecionada.marca : '',
                  pecaSelecionada.modelo && !pecaSelecionada.nome.toLowerCase().includes(pecaSelecionada.modelo.toLowerCase()) ? pecaSelecionada.modelo : ''
                ].filter(Boolean).join(' ')}
              </strong>
            </p>

            {pecaSelecionada.quantidadePendente > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 text-xs text-amber-300">
                ⚠️ <strong>Atenção:</strong> Existem <strong>{pecaSelecionada.quantidadePendente} unidades pendentes</strong> de orçamentos. A entrada abaterá automaticamente a pendência antes de somar ao estoque físico.
              </div>
            )}

            <form onSubmit={handleSalvarEntrada}>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Quantidade Comprada / Recebida
              </label>
              <input
                type="number"
                min="1"
                required
                value={qtdEntrada}
                onChange={(e) => setQtdEntrada(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500 mb-6"
              />

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalEntradaAberta(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EstoqueDashboardPage() {
  return (
    <Suspense fallback={<div className="text-white">Carregando...</div>}>
      <EstoqueDashboardContent />
    </Suspense>
  );
}
