import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import toast from 'react-hot-toast';
import { X, Search, Plus, Trash2, PackageOpen } from 'lucide-react';

interface CompraLoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface LoteItem {
    idLocal: string;
    pecaId: number | null;
    nome: string;
    sku: string;
    marca: string;
    modelo: string;
    categoria: string;
    quantidade: number;
    precoCustoUnitario: number;
}

export function CompraLoteModal({ isOpen, onClose, onSuccess }: CompraLoteModalProps) {
    const [fornecedor, setFornecedor] = useState("");
    const [valorTotalNota, setValorTotalNota] = useState("");
    const [observacao, setObservacao] = useState("");
    const [dataCompra, setDataCompra] = useState(new Date().toISOString().split('T')[0]);
    const [itens, setItens] = useState<LoteItem[]>([]);
    
    // Search states
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (searchTerm.length >= 2) {
            setIsSearching(true);
            apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/pecas`)
                .then(res => res.json())
                .then(data => {
                    const filtered = data.filter((p: any) => 
                        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
                    );
                    setSearchResults(filtered);
                })
                .finally(() => setIsSearching(false));
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    const handleAddExisting = (peca: any) => {
        setItens([...itens, {
            idLocal: Math.random().toString(),
            pecaId: peca.id,
            nome: peca.nome,
            sku: peca.sku || "",
            marca: peca.marca || "",
            modelo: peca.modelo || "",
            categoria: peca.categoria || "PECA",
            quantidade: 1,
            precoCustoUnitario: peca.custo || 0
        }]);
        setSearchTerm("");
    };

    const handleAddNew = () => {
        setItens([...itens, {
            idLocal: Math.random().toString(),
            pecaId: null,
            nome: "Nova Peça " + (itens.length + 1),
            sku: "",
            marca: "",
            modelo: "",
            categoria: "PECA",
            quantidade: 1,
            precoCustoUnitario: 0
        }]);
    };

    const updateItem = (idLocal: string, field: keyof LoteItem, value: any) => {
        setItens(itens.map(it => it.idLocal === idLocal ? { ...it, [field]: value } : it));
    };

    const removeItem = (idLocal: string) => {
        setItens(itens.filter(it => it.idLocal !== idLocal));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (itens.length === 0) {
            toast.error("Adicione pelo menos um item à nota!");
            return;
        }

        const payload = {
            fornecedor,
            valorTotalNota: parseFloat(valorTotalNota),
            dataCompra,
            observacao,
            itens: itens.map(i => ({
                pecaId: i.pecaId,
                nome: i.nome,
                sku: i.sku,
                marca: i.marca,
                modelo: i.modelo,
                categoria: i.categoria,
                quantidade: parseInt(i.quantidade.toString()),
                precoCustoUnitario: parseFloat(i.precoCustoUnitario.toString())
            }))
        };

        const loadingId = toast.loading("Registrando compra em lote...");
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/estoque/compra-lote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error();
            toast.success("Estoque e financeiro atualizados!", { id: loadingId });
            onSuccess();
            onClose();
        } catch (err) {
            toast.error("Erro ao registrar compra em lote", { id: loadingId });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-slate-800/50 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <PackageOpen className="text-indigo-400"/>
                            Lançar Compra em Lote (Nota Fiscal)
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Lança múltiplos itens no estoque e gera uma única despesa no fluxo de caixa.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Invoice Details */}
                    <div className="space-y-4 lg:col-span-1">
                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4">
                            <h3 className="font-bold text-indigo-400 text-sm uppercase tracking-wider mb-2">Dados da Compra</h3>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Fornecedor / Loja</label>
                                <input type="text" required value={fornecedor} onChange={e => setFornecedor(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm" placeholder="Ex: Atacadão das Peças" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Valor Total (R$)</label>
                                <input type="number" step="0.01" required value={valorTotalNota} onChange={e => setValorTotalNota(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm font-bold text-emerald-400" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Data da Compra</label>
                                <input type="date" required value={dataCompra} onChange={e => setDataCompra(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Observações (Opcional)</label>
                                <textarea value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm resize-none" rows={3} placeholder="NF-e 1234..."></textarea>
                            </div>
                        </div>
                        
                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                            <h3 className="font-bold text-indigo-400 text-sm uppercase tracking-wider mb-2">Buscar Peça Existente</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar nome ou SKU..." className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:border-indigo-500 outline-none" />
                            </div>
                            {searchTerm.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-y-auto border border-white/10 rounded-md bg-slate-900">
                                    {searchResults.map(p => (
                                        <div key={p.id} onClick={() => handleAddExisting(p)} className="p-2 hover:bg-slate-800 cursor-pointer border-b border-white/5 last:border-0 flex justify-between items-center text-sm">
                                            <div>
                                                <div className="text-white font-medium">{p.nome}</div>
                                                <div className="text-xs text-slate-500">Estoque atual: {p.quantidadeEstoque}</div>
                                            </div>
                                            <Plus size={16} className="text-indigo-400" />
                                        </div>
                                    ))}
                                    {searchResults.length === 0 && !isSearching && (
                                        <div className="p-3 text-xs text-slate-500 text-center">Nenhum resultado.</div>
                                    )}
                                </div>
                            )}
                            <button onClick={handleAddNew} type="button" className="w-full mt-4 py-2 border border-dashed border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 rounded text-sm font-medium transition-colors flex justify-center items-center gap-2">
                                <Plus size={16} /> Adicionar Peça Inédita
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Items List */}
                    <div className="lg:col-span-2 flex flex-col h-full bg-slate-950 rounded-xl border border-white/5">
                        <div className="p-4 border-b border-white/5">
                            <h3 className="font-bold text-indigo-400 text-sm uppercase tracking-wider">Itens da Compra ({itens.length})</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {itens.map((item, idx) => (
                                <div key={item.idLocal} className="bg-slate-900 p-3 rounded-lg border border-slate-800 mb-2 flex flex-wrap items-end gap-3 relative group">
                                    <button type="button" onClick={() => removeItem(item.idLocal)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                    
                                    <div className="w-full mb-1 flex items-center gap-2">
                                        <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded font-bold">#{idx+1}</span>
                                        {item.pecaId ? (
                                            <span className="text-emerald-400 text-xs border border-emerald-500/30 px-2 py-0.5 rounded">Reposição</span>
                                        ) : (
                                            <span className="text-yellow-400 text-xs border border-yellow-500/30 px-2 py-0.5 rounded">Inédita</span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-[10px] text-slate-500 mb-1 uppercase">Nome da Peça</label>
                                        <input type="text" value={item.nome} disabled={!!item.pecaId} onChange={e => updateItem(item.idLocal, 'nome', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white text-sm outline-none disabled:opacity-70" />
                                    </div>

                                    <div className="w-24">
                                        <label className="block text-[10px] text-slate-500 mb-1 uppercase">Qtd</label>
                                        <input type="number" min="1" value={item.quantidade} onChange={e => updateItem(item.idLocal, 'quantidade', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white text-sm outline-none focus:border-indigo-500" />
                                    </div>

                                    <div className="w-32">
                                        <label className="block text-[10px] text-slate-500 mb-1 uppercase">Custo Unit (R$)</label>
                                        <input type="number" step="0.01" value={item.precoCustoUnitario} onChange={e => updateItem(item.idLocal, 'precoCustoUnitario', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-emerald-400 font-bold text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                    
                                    <div className="w-24 text-right pt-2 pb-1 text-sm font-bold text-white bg-slate-800 px-2 rounded self-stretch flex items-center justify-center">
                                        R$ {(item.quantidade * item.precoCustoUnitario).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            {itens.length === 0 && (
                                <div className="h-40 flex flex-col items-center justify-center text-slate-500 gap-2">
                                    <PackageOpen size={48} className="opacity-20" />
                                    <p className="text-sm">Nenhum item na nota fiscal ainda.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-white/5 bg-slate-900 flex justify-between items-center rounded-b-xl">
                            <div className="text-sm text-slate-400">
                                Total somado: <span className={`font-bold text-lg ${itens.reduce((sum, i) => sum + (i.quantidade * i.precoCustoUnitario), 0) > parseFloat(valorTotalNota||"0") ? 'text-red-400' : 'text-emerald-400'}`}>
                                    R$ {itens.reduce((sum, i) => sum + (i.quantidade * i.precoCustoUnitario), 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-slate-800/50 flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded text-slate-300 hover:bg-slate-700 font-medium transition-colors">Cancelar</button>
                    <button type="button" onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-2 rounded transition-colors shadow-lg shadow-indigo-600/20">
                        Processar Compra
                    </button>
                </div>
            </div>
        </div>
    );
}
