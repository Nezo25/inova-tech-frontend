"use client";

import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from '@/utils/api';
import { Plus, Edit, Trash2, Camera, PackageOpen, X, ToggleLeft, ToggleRight } from "lucide-react";
import { compressImage } from "@/utils/imageUtils";
import toast, { Toaster } from "react-hot-toast";

export default function VitrineDashboardPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null as number | null,
    nome: "",
    preco: "",
    descricao: "",
    imagemBase64: "",
    cor: "",
    categoria: "IPHONE",
    marca: "Apple",
    ativo: true,
    isMarcaOutra: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = () => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/vitrine/admin`)
      .then(res => res.json())
      .then(data => setProdutos(data))
      .catch(err => {
        console.error(err);
        toast.error("Erro ao carregar vitrine");
      });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImage(e.target.files[0]);
        setFormData({ ...formData, imagemBase64: compressed });
        toast.success("Foto carregada!");
      } catch (err) {
        toast.error("Erro ao processar imagem.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/vitrine/${formData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/vitrine`;
        
    const method = isEditing ? "PUT" : "POST";
    const loadingToast = toast.loading("Salvando...");

    // Convert string to number for price
    const payload = {
        ...formData,
        marca: formData.marca ? formData.marca.trim() : "",
        preco: parseFloat(formData.preco.toString().replace(',', '.'))
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
        fetchProdutos();
      })
      .catch(() => toast.error("Erro ao salvar", { id: loadingToast }));
  };

  const handleDelete = (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    
    const loadingToast = toast.loading("Excluindo...");
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/vitrine/${id}`, { method: "DELETE" })
      .then(res => {
          if (!res.ok) throw new Error();
          toast.success("Excluído com sucesso", { id: loadingToast });
          fetchProdutos();
      })
      .catch(() => toast.error("Erro ao excluir", { id: loadingToast }));
  };

  const toggleStatus = (produto: any) => {
    const payload = { ...produto, ativo: !produto.ativo };
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/vitrine/${produto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(() => fetchProdutos());
  };

  const openNewModal = () => {
      setFormData({ id: null, nome: "", preco: "", descricao: "", imagemBase64: "", cor: "", categoria: "IPHONE", marca: "Apple", ativo: true, isMarcaOutra: false });
      setIsEditing(false);
      setShowModal(true);
  };

  const openEditModal = (produto: any) => {
      setFormData({
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco.toString(),
          descricao: produto.descricao,
          imagemBase64: produto.imagemBase64,
          cor: produto.cor || "",
          categoria: produto.categoria || "IPHONE",
          marca: produto.marca || "Apple",
          ativo: produto.ativo,
          isMarcaOutra: produto.marca ? !["Apple", "Samsung", "Xiaomi", "Motorola", "Realme", "LG"].includes(produto.marca) : false
      });
      setIsEditing(true);
      setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">Gestão da Vitrine</h1>
          <p className="text-slate-400">Gerencie os produtos exibidos na loja online.</p>
        </div>
        <button onClick={openNewModal} className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors">
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      <div className="bg-[#07090f] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-white/5">
                <th className="p-4 text-slate-300 font-medium">Foto</th>
                <th className="p-4 text-slate-300 font-medium">Produto</th>
                <th className="p-4 text-slate-300 font-medium">Cor</th>
                <th className="p-4 text-slate-300 font-medium">Preço</th>
                <th className="p-4 text-slate-300 font-medium">Status</th>
                <th className="p-4 text-slate-300 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                      {p.imagemBase64 ? (
                          <img src={p.imagemBase64} alt="Produto" className="w-12 h-12 rounded object-cover" />
                      ) : (
                          <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center"><PackageOpen size={20} className="text-slate-500"/></div>
                      )}
                  </td>
                  <td className="p-4 text-white font-medium">{p.nome}</td>
                  <td className="p-4 text-slate-400">{p.cor || '-'}</td>
                  <td className="p-4 text-slate-300">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.preco)}
                  </td>
                  <td className="p-4">
                      <button onClick={() => toggleStatus(p)} className="flex items-center gap-2 focus:outline-none">
                          {p.ativo ? (
                              <ToggleRight size={32} className="text-green-500" />
                          ) : (
                              <ToggleLeft size={32} className="text-slate-500" />
                          )}
                          <span className={`text-sm font-medium ${p.ativo ? 'text-green-500' : 'text-slate-500'}`}>
                              {p.ativo ? 'Ativo' : 'Oculto'}
                          </span>
                      </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEditModal(p)} className="text-slate-400 hover:text-yellow-500 p-2 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors ml-2">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {produtos.length === 0 && (
                  <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum produto cadastrado.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-slate-800/50">
              <h2 className="text-xl font-bold text-white font-outfit">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex justify-center mb-6">
                    <div 
                        className="w-32 h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/50 transition-colors bg-slate-950 overflow-hidden relative"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {formData.imagemBase64 ? (
                            <img src={formData.imagemBase64} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <Camera className="text-slate-500 mb-2" size={32} />
                                <span className="text-xs text-slate-500">Adicionar Foto</span>
                            </>
                        )}
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-1">Nome do Produto</label>
                    <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none" />
                </div>
                
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Preço (R$)</label>
                    <input type="number" step="0.01" required value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none" />
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-1">Cor</label>
                    <input type="text" placeholder="Ex: Preto, Branco" value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Categoria</label>
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
                            <option value="ACESSORIO">Acessório</option>
                            <option value="OUTROS">Outros</option>
                        </select>
                    </div>
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
                            <option value="Apple">Apple</option>
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
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                    <textarea required rows={3} value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white focus:border-yellow-500 outline-none resize-none"></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded text-slate-300 hover:bg-slate-800 transition-colors">Cancelar</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-6 py-2 rounded transition-colors">Salvar Produto</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
