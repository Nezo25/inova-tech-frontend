"use client";
import { apiFetch } from '@/utils/api';

import React, { useEffect, useState, useRef } from "react";
import { UserPlus, Search, Phone, Smartphone as SmartphoneIcon, Camera, Printer, Calendar, MapPin, DollarSign, X, PackageOpen } from "lucide-react";
import { compressImage } from "@/utils/imageUtils";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSaidaModal, setShowSaidaModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  
  // Detalhes
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [clientDetails, setClientDetails] = useState<any>(null);

  const [formData, setFormData] = useState({
    nomeCliente: "",
    numeroCelular: "",
    endereco: "",
    marcaAparelho: "",
    modeloProduto: "",
    defeitoRelatado: "",
    fotoEntradaBase64: ""
  });
  
  const [saidaFormData, setSaidaFormData] = useState({
    fotoSaidaBase64: "",
    diasGarantia: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const saidaFileInputRef = useRef<HTMLInputElement>(null);
  const updateEntradaFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = () => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes`)
      .then((res) => res.json())
      .then((data) => setClientes(data))
      .catch((err) => {
         console.error(err);
         toast.error("Erro ao carregar clientes");
      });
  };

  const updateStatus = (id: number, status: string) => {
    const loadingToast = toast.loading("Atualizando status...");
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
      .then(() => {
         fetchClientes();
         if (clientDetails && clientDetails.id === id) {
            setClientDetails({...clientDetails, status});
         }
         toast.success(`Status atualizado para: ${status}`, { id: loadingToast });
      })
      .catch((err) => {
         console.error(err);
         toast.error("Erro ao atualizar status", { id: loadingToast });
      });
  };

  const openDetailsModal = (id: number) => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setClientDetails(data);
        setShowDetailsModal(true);
      })
      .catch((err) => {
         console.error(err);
         toast.error("Erro ao carregar detalhes do cliente");
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fotoEntradaBase64) {
        toast.error("A foto de entrada do aparelho é OBRIGATí“RIA.");
        return;
    }
    const loadingToast = toast.loading("Salvando cliente...");
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
      .then((res) => res.json())
      .then(() => {
        setShowModal(false);
        setFormData({ nomeCliente: "", numeroCelular: "", endereco: "", marcaAparelho: "", modeloProduto: "", defeitoRelatado: "", fotoEntradaBase64: "" });
        fetchClientes();
        toast.success("Cliente cadastrado com sucesso!", { id: loadingToast });
      })
      .catch((err) => {
         console.error(err);
         toast.error("Erro ao salvar cliente", { id: loadingToast });
      });
  };

  const handleSaidaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    
    const loadingToast = toast.loading("Registrando saída...");
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes/${selectedClientId}/foto-saida`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saidaFormData)
    })
      .then((res) => {
        if (res.ok) {
           setShowSaidaModal(false);
           setSaidaFormData({ fotoSaidaBase64: "", diasGarantia: 0 });
           setSelectedClientId(null);
           fetchClientes();
           toast.success("Saída registrada com sucesso!", { id: loadingToast });
        } else {
           throw new Error();
        }
      })
      .catch((err) => {
         console.error(err);
         toast.error("Erro ao registrar saída", { id: loadingToast });
      });
  };

  const handlePagamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientDetails) return;
    
    const pagData = {
        valorTotal: clientDetails.valorTotal,
        formaPagamento: clientDetails.formaPagamento,
        parcelas: clientDetails.parcelas,
        statusPagamento: clientDetails.statusPagamento
    };

    const loadingToast = toast.loading("Salvando financeiro...");
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes/${clientDetails.id}/pagamento`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pagData)
    })
      .then((res) => {
        if (res.ok) {
           fetchClientes();
           toast.success("Pagamento atualizado com sucesso!", { id: loadingToast });
        } else {
           throw new Error();
        }
      })
      .catch((err) => {
         console.error(err);
         toast.error("Erro ao salvar dados financeiros", { id: loadingToast });
      });
  };

  const handleDadosSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientDetails) return;
    
    const loadingToast = toast.loading("Salvando dados...");
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes/${clientDetails.id}/dados`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientDetails)
    })
      .then((res) => {
        if (res.ok) {
           fetchClientes();
           toast.success("Dados atualizados com sucesso!", { id: loadingToast });
        } else {
           throw new Error();
        }
      })
      .catch((err) => {
         console.error(err);
         toast.error("Erro ao salvar dados", { id: loadingToast });
      });
  };

  const handleFotoEntrada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImage(e.target.files[0]);
        setFormData({ ...formData, fotoEntradaBase64: compressed });
        toast.success("Foto anexada!");
      } catch (err) {
        console.error("Erro ao comprimir imagem:", err);
        toast.error("Erro ao processar imagem.");
      }
    }
  };

  const handleUpdateFotoEntrada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && clientDetails) {
      try {
        const compressed = await compressImage(e.target.files[0]);
        const loadingToast = toast.loading("Enviando foto...");
        apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes/${clientDetails.id}/foto-entrada`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fotoEntradaBase64: compressed })
        }).then(res => {
            if (res.ok) {
                setClientDetails({...clientDetails, fotoEntradaBase64: compressed});
                fetchClientes();
                toast.success("Foto de entrada atualizada!", { id: loadingToast });
            } else {
                throw new Error();
            }
        }).catch(err => {
             toast.error("Erro ao salvar foto", { id: loadingToast });
        });
      } catch (err) {
        console.error("Erro ao atualizar imagem:", err);
        toast.error("Erro ao processar imagem.");
      }
    }
  };

  const handleFotoSaida = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImage(e.target.files[0]);
        setSaidaFormData({ ...saidaFormData, fotoSaidaBase64: compressed });
        toast.success("Foto de saída anexada!");
      } catch (err) {
        console.error("Erro ao comprimir imagem:", err);
        toast.error("Erro ao processar imagem.");
      }
    }
  };

  const openSaidaModal = (id: number) => {
    setSelectedClientId(id);
    setShowSaidaModal(true);
  };

  const formatPhoneMask = (v: string) => {
    let val = v.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    let formatted = val;
    if (val.length > 2) formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 7) formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, numeroCelular: formatPhoneMask(e.target.value)});
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val) {
       setClientDetails({...clientDetails, valorTotal: ""});
       return;
    }
    const floatVal = parseInt(val) / 100;
    setClientDetails({...clientDetails, valorTotal: floatVal});
  };

  const statusColors: Record<string, string> = {
    "Na Fila": "bg-slate-500/20 text-slate-300",
    "Orçamento Web": "bg-purple-500/20 text-purple-400",
    "Orçamento": "bg-blue-500/20 text-blue-400",
    "Aguardando Peça": "bg-orange-500/20 text-orange-400",
    "Pronto para Retirada": "bg-green-500/20 text-green-400",
    "Entregue": "bg-yellow-500/20 text-yellow-500"
  };
  
  const pgtoColors: Record<string, string> = {
    "Pendente": "text-orange-400 bg-orange-400/10",
    "Pago": "text-green-400 bg-green-400/10",
    "Atrasado": "text-red-400 bg-red-400/10"
  };

  return (
    <div className="space-y-8 pb-10">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">Clientes</h1>
          <p className="text-slate-400 mt-1">Gerencie os cadastros e aparelhos da loja.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <UserPlus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className="glass p-4 rounded-2xl flex items-center gap-3">
        <Search size={20} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar por nome ou aparelho..." 
          className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {clientes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
             <div className="bg-slate-900/50 p-6 rounded-full mb-4 border border-white/5 shadow-inner">
                <PackageOpen size={48} className="text-slate-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-400 mb-2">Nenhum cliente cadastrado</h3>
             <p className="text-sm">Comece adicionando seu primeiro cliente e aparelho para gerenciar os serviços.</p>
             <button onClick={() => setShowModal(true)} className="mt-6 text-yellow-500 hover:text-yellow-400 font-medium text-sm flex items-center gap-2">
                 <UserPlus size={16}/> Cadastrar Agora
             </button>
          </div>
        ) : (
          clientes.map((c: any) => (
            <div 
              key={c.id} 
              onClick={() => openDetailsModal(c.id)}
              className="glass p-6 rounded-2xl hover:border-yellow-500/30 transition-all cursor-pointer flex flex-col justify-between h-full relative"
            >
              <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-400 font-bold text-xl uppercase">
                        {c.nomeCliente.charAt(0)}
                        </div>
                        <div>
                        <h3 className="text-lg font-bold text-white">{c.nomeCliente}</h3>
                        <p className="text-xs text-slate-400">Desde {new Date(c.dataCadastro).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <select 
                            value={c.status || "Na Fila"}
                            onChange={(e) => updateStatus(c.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border border-white/10 outline-none font-bold cursor-pointer ${statusColors[c.status || "Na Fila"] || statusColors["Na Fila"]}`}
                        >
                            <option value="Na Fila" className="bg-slate-900 text-white">Na Fila</option>
                            <option value="Orçamento Web" className="bg-slate-900 text-white">Orçamento Web</option>
                            <option value="Orçamento" className="bg-slate-900 text-white">Orçamento</option>
                            <option value="Aguardando Peça" className="bg-slate-900 text-white">Aguardando Peça</option>
                            <option value="Pronto para Retirada" className="bg-slate-900 text-white">Pronto para Retirada</option>
                            <option value="Entregue" className="bg-slate-900 text-white">Entregue</option>
                        </select>
                        <Link href={`/os/${c.id}`} target="_blank" className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded">
                            <Printer size={12} />
                            Imprimir OS
                        </Link>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-500"/>
                        {formatPhoneMask(c.numeroCelular)}
                    </div>
                    {c.endereco && (
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-500"/>
                            {c.endereco}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <SmartphoneIcon size={14} className="text-slate-500"/>
                        {c.marcaAparelho} - {c.modeloProduto}
                    </div>
                    {c.statusPagamento && c.statusPagamento !== "Pendente" && (
                         <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-slate-500"/>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${pgtoColors[c.statusPagamento]}`}>{c.statusPagamento}</span>
                        </div>
                    )}
                    {c.dataGarantia && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                            <Calendar size={14} className="text-slate-500"/>
                            {new Date(c.dataGarantia) > new Date() ? (
                                <span className="text-green-400 font-medium">Garantia até {new Date(c.dataGarantia).toLocaleDateString('pt-BR')}</span>
                            ) : (
                                <span className="text-red-400 font-medium line-through">Garantia Vencida ({new Date(c.dataGarantia).toLocaleDateString('pt-BR')})</span>
                            )}
                        </div>
                    )}
                  </div>
              </div>
              
              {!c.hasFotoSaida && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); openSaidaModal(c.id); }}
                    className="mt-6 w-full flex items-center justify-center gap-2 border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Camera size={16} />
                    Registrar Saída/Foto
                  </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Aba de Detalhes Completa */}
      {showDetailsModal && clientDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass p-8 rounded-2xl w-full max-w-4xl border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.1)] relative my-auto mt-20 md:mt-auto max-h-[90vh] overflow-y-auto scrollbar-hide">
             <button onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors z-10">
                <X size={20} />
             </button>
             
             <div className="flex flex-col md:flex-row gap-8">
                {/* Coluna 1: Dados e Pagamento */}
                <div className="flex-1">
                   <div className="flex items-start justify-between mb-6">
                       <h2 className="text-2xl font-bold font-outfit text-white">Detalhes do Cliente</h2>
                       <div className="text-right text-xs text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg border border-white/5">
                           <p><strong className="text-slate-300">Entrada:</strong> {new Date(clientDetails.dataCadastro).toLocaleDateString('pt-BR')} í s {new Date(clientDetails.dataCadastro).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                           <p><strong className="text-slate-300">Saída:</strong> {(clientDetails.dataSaida && clientDetails.status === 'Entregue') ? `${new Date(clientDetails.dataSaida).toLocaleDateString('pt-BR')} í s ${new Date(clientDetails.dataSaida).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}` : 'Pendente'}</p>
                       </div>
                   </div>
                   <form onSubmit={handleDadosSubmit} className="space-y-4 mb-8 bg-slate-900/30 p-5 rounded-xl border border-white/5">
                       <div>
                           <label className="block text-sm font-medium text-slate-400 mb-1">Nome</label>
                           <input type="text" value={clientDetails.nomeCliente || ""} onChange={e => setClientDetails({...clientDetails, nomeCliente: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-medium text-slate-400 mb-1">Celular</label>
                               <input type="text" value={clientDetails.numeroCelular ? formatPhoneMask(clientDetails.numeroCelular) : ""} onChange={e => setClientDetails({...clientDetails, numeroCelular: formatPhoneMask(e.target.value)})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none" />
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-slate-400 mb-1">Marca</label>
                               <input type="text" value={clientDetails.marcaAparelho || ""} onChange={e => setClientDetails({...clientDetails, marcaAparelho: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none" />
                           </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-medium text-slate-400 mb-1">Modelo</label>
                               <input type="text" value={clientDetails.modeloProduto || ""} onChange={e => setClientDetails({...clientDetails, modeloProduto: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none" />
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-slate-400 mb-1">Endereço</label>
                               <input type="text" value={clientDetails.endereco || ""} onChange={e => setClientDetails({...clientDetails, endereco: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none" />
                           </div>
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-400 mb-1">Defeito Relatado</label>
                           <textarea value={clientDetails.defeitoRelatado || ""} onChange={e => setClientDetails({...clientDetails, defeitoRelatado: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none min-h-[60px]" />
                       </div>
                       <div className="flex justify-end">
                           <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors text-sm">Salvar Dados</button>
                       </div>
                   </form>

                   <h3 className="text-xl font-bold font-outfit text-yellow-500 mb-4 flex items-center gap-2">
                       <DollarSign size={20}/> Financeiro
                   </h3>
                   {!clientDetails.status || clientDetails.status === "Na Fila" || clientDetails.status === "Orçamento Web" ? (
                       <div className="bg-slate-900/30 p-5 rounded-xl border border-white/5 text-center text-slate-500 text-sm flex items-center justify-center h-[200px]">
                           <span>Mude o status do aparelho para <strong>Orçamento</strong><br/> para liberar o painel financeiro.</span>
                       </div>
                   ) : (
                       <form onSubmit={handlePagamentoSubmit} className="bg-slate-900/30 p-5 rounded-xl border border-white/5 space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-sm font-medium text-slate-400 mb-1">Valor Total</label>
                                   <input 
                                     type="text" 
                                     value={clientDetails.valorTotal ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(clientDetails.valorTotal) : ""} 
                                     onChange={handleCurrencyChange} 
                                     className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none" 
                                     placeholder="R$ 0,00"
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-slate-400 mb-1">Status de Pagamento</label>
                                   <select value={clientDetails.statusPagamento || "Pendente"} onChange={e => setClientDetails({...clientDetails, statusPagamento: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none">
                                       <option value="Pendente">Pendente</option>
                                       <option value="Pago">Pago</option>
                                       <option value="Atrasado">Atrasado</option>
                                   </select>
                               </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-sm font-medium text-slate-400 mb-1">Forma</label>
                                   <select value={clientDetails.formaPagamento || ""} onChange={e => setClientDetails({...clientDetails, formaPagamento: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none">
                                       <option value="">Selecione...</option>
                                       <option value="Pix">Pix</option>
                                       <option value="Dinheiro">Dinheiro</option>
                                       <option value="Cartão de Crédito">Cartão de Crédito</option>
                                       <option value="Cartão de Débito">Cartão de Débito</option>
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-slate-400 mb-1">Parcelas</label>
                                   <select value={clientDetails.parcelas || 1} onChange={e => setClientDetails({...clientDetails, parcelas: parseInt(e.target.value)})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none">
                                       {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                                           <option key={n} value={n}>{n}x</option>
                                       ))}
                                   </select>
                               </div>
                           </div>
                           <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-4 py-2 rounded-lg transition-colors mt-2 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                               Salvar Financeiro
                           </button>
                       </form>
                   )}
                </div>
                
                {/* Coluna 2: Fotos */}
                <div className="flex-1 flex flex-col gap-6">
                    <h3 className="text-xl font-bold font-outfit text-white">Fotos do Aparelho</h3>
                    
                    <div className="flex flex-col gap-4 h-full">
                        <input type="file" accept="image/*" className="hidden" ref={updateEntradaFileInputRef} onChange={handleUpdateFotoEntrada} />
                        <div onClick={() => updateEntradaFileInputRef.current?.click()} className="cursor-pointer flex-1 min-h-[200px] relative rounded-xl border border-white/10 overflow-hidden bg-black flex flex-col group">
                             <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-yellow-400 font-bold border border-yellow-500/30">ENTRADA (Mudar)</div>
                             {clientDetails.fotoEntradaBase64 ? (
                                <img src={clientDetails.fotoEntradaBase64.length > 200 ? clientDetails.fotoEntradaBase64 : `${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes/${clientDetails.id}/foto-entrada`} alt="Foto Entrada" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             ) : (
                                <div className="flex-1 w-full h-full border-dashed bg-white/5 flex flex-col items-center justify-center text-slate-500 group-hover:text-yellow-500 transition-colors">
                                   <Camera size={32} className="mb-2 opacity-50" />
                                   <span className="text-sm">Nenhuma foto (Clique para Anexar)</span>
                                </div>
                             )}
                        </div>

                        {clientDetails.fotoSaidaBase64 ? (
                           <div className="flex-1 min-h-[200px] relative rounded-xl border border-white/10 overflow-hidden bg-black flex flex-col group">
                                <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-green-400 font-bold border border-green-500/30">SAíDA</div>
                                <img src={`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes/${clientDetails.id}/foto-saida`} alt="Foto Saída" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           </div>
                        ) : (
                           <div className="flex-1 min-h-[200px] relative rounded-xl border border-white/5 border-dashed bg-white/5 flex flex-col items-center justify-center text-slate-500">
                               <Camera size={32} className="mb-2 opacity-50" />
                               <span className="text-sm">Nenhuma foto de saída</span>
                           </div>
                        )}
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass p-8 rounded-2xl w-full max-w-lg border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.1)] relative my-auto mt-10 md:mt-auto">
            <h2 className="text-2xl font-bold font-outfit text-white mb-6">Novo Cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                <input required type="text" value={formData.nomeCliente} onChange={e => setFormData({...formData, nomeCliente: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Celular / WhatsApp</label>
                    <input required type="text" value={formData.numeroCelular} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none transition-colors" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Endereço</label>
                    <input type="text" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Marca (ex: Apple)</label>
                  <input required type="text" value={formData.marcaAparelho} onChange={e => setFormData({...formData, marcaAparelho: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Modelo</label>
                  <input required type="text" value={formData.modeloProduto} onChange={e => setFormData({...formData, modeloProduto: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none transition-colors" />
                </div>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Defeito Relatado</label>
                  <textarea 
                      required 
                      value={formData.defeitoRelatado} 
                      onChange={e => setFormData({...formData, defeitoRelatado: e.target.value})} 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none transition-colors min-h-[80px]" 
                      placeholder="O que está acontecendo com o aparelho?"
                  />
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-400 mb-1">Foto do Aparelho (Entrada) *Obrigatório</label>
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors overflow-hidden relative ${formData.fotoEntradaBase64 ? 'border-yellow-500' : 'border-red-500/50 hover:border-red-500 bg-red-500/5'}`}
                 >
                    {formData.fotoEntradaBase64 ? (
                        <img src={formData.fotoEntradaBase64} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-slate-500">
                            <Camera size={24} className="mb-1" />
                            <span className="text-xs">Tirar ou Anexar Foto</span>
                        </div>
                    )}
                 </div>
                 <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFotoEntrada}
                 />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" disabled={!formData.fotoEntradaBase64} className="bg-yellow-500 disabled:opacity-50 hover:bg-yellow-400 text-slate-900 font-bold px-6 py-2 rounded-lg transition-colors">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Saída */}
      {showSaidaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-sm border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.1)] relative">
            <h2 className="text-xl font-bold font-outfit text-white mb-2">Registrar Saída</h2>
            <p className="text-sm text-slate-400 mb-6">Tire uma foto do aparelho finalizado e defina a garantia.</p>
            <form onSubmit={handleSaidaSubmit} className="space-y-4">
              <div>
                 <div 
                    onClick={() => saidaFileInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors bg-slate-900/30 overflow-hidden relative"
                 >
                    {saidaFormData.fotoSaidaBase64 ? (
                        <img src={saidaFormData.fotoSaidaBase64} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-slate-500">
                            <Camera size={32} className="mb-2" />
                            <span className="text-sm">Tirar Foto do Aparelho</span>
                        </div>
                    )}
                 </div>
                 <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    ref={saidaFileInputRef}
                    onChange={handleFotoSaida}
                 />
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tempo de Garantia</label>
                  <select 
                      value={saidaFormData.diasGarantia} 
                      onChange={e => setSaidaFormData({...saidaFormData, diasGarantia: parseInt(e.target.value)})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none transition-colors"
                  >
                      <option value={0}>Sem Garantia</option>
                      <option value={30}>30 Dias</option>
                      <option value={90}>90 Dias</option>
                      <option value={180}>180 Dias</option>
                  </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowSaidaModal(false); setSaidaFormData({fotoSaidaBase64:"", diasGarantia:0}); }} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" disabled={!saidaFormData.fotoSaidaBase64} className="bg-yellow-500 disabled:opacity-50 hover:bg-yellow-400 text-slate-900 font-bold px-6 py-2 rounded-lg transition-colors">Confirmar Saída</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
