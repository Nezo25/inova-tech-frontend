"use client";

import React, { useState } from "react";
import { Smartphone, CheckCircle, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SolicitarServicoPage() {
  const [formData, setFormData] = useState({
    nomeCliente: "",
    numeroCelular: "",
    marcaAparelho: "",
    modeloProduto: "",
    defeitoRelatado: "",
    website: "", // HONEYPOT
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const formatPhoneMask = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    if (value.length <= 10) {
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value.substring(0, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // HONEYPOT CHECK - Bots fill this invisible field
    if (formData.website) {
       console.log("Bot detectado!");
       return; // Silently fail or pretend success
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes/solicitacao`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify({
          nomeCliente: formData.nomeCliente,
          numeroCelular: formData.numeroCelular.replace(/\D/g, ""),
          marcaAparelho: formData.marcaAparelho,
          modeloProduto: formData.modeloProduto,
          defeitoRelatado: formData.defeitoRelatado
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const errData = await res.json();
        setError(errData.message || "Erro ao enviar solicitação. Verifique os dados.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#07090f] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/50 p-8 rounded-2xl border border-white/10 text-center shadow-[0_0_50px_rgba(34,197,94,0.1)]">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold font-outfit text-white mb-4">Solicitação Recebida!</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Seu pedido de orçamento foi registrado com sucesso na Inova Tech. 
            Nossa equipe técnica vai analisar o seu caso e entrará em contato via WhatsApp em breve.
          </p>
          <Link href="/" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            Voltar para a Página Inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-200">
      <header className="py-6 border-b border-white/5 bg-slate-900/30">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <img src="/logo-inovatech.png" alt="InovaTech Logo" className="h-16 md:h-20 w-auto object-contain" />
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
            <ArrowLeft size={16} /> Voltar para o Site
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 flex justify-center">
        <div className="w-full max-w-2xl bg-slate-900/40 p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
           {/* Background glow */}
           <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />

           <div className="mb-10">
             <span className="inline-block py-1 px-3 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
                Atendimento Rápido
             </span>
             <h1 className="text-3xl md:text-4xl font-bold font-outfit text-white mb-3">Solicitar Orçamento Web</h1>
             <p className="text-slate-400 text-lg">Preencha os dados abaixo e entraremos em contato rapidamente pelo WhatsApp para dar andamento no seu serviço.</p>
           </div>

           {error && (
             <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
               <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
               <p className="text-sm">{error}</p>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-6">
              {/* HONEYPOT - Escondido de humanos, visível para bots */}
              <div style={{ display: 'none' }} aria-hidden="true">
                 <label htmlFor="website">Website</label>
                 <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off"
                        value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Seu Nome Completo</label>
                    <input type="text" required minLength={3} maxLength={100}
                           value={formData.nomeCliente} onChange={e => setFormData({...formData, nomeCliente: e.target.value})}
                           className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all" 
                           placeholder="Ex: João da Silva" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">WhatsApp</label>
                    <input type="tel" required minLength={14}
                           value={formatPhoneMask(formData.numeroCelular)} onChange={e => setFormData({...formData, numeroCelular: e.target.value})}
                           className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all" 
                           placeholder="(11) 90000-0000" />
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Marca do Aparelho</label>
                    <input type="text" required maxLength={50}
                           value={formData.marcaAparelho} onChange={e => setFormData({...formData, marcaAparelho: e.target.value})}
                           className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all" 
                           placeholder="Ex: Apple, Samsung, Motorola" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Modelo Exato</label>
                    <input type="text" required maxLength={50}
                           value={formData.modeloProduto} onChange={e => setFormData({...formData, modeloProduto: e.target.value})}
                           className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all" 
                           placeholder="Ex: iPhone 13 Pro Max" />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Qual o problema do aparelho?</label>
                 <textarea required rows={5} maxLength={1000}
                           value={formData.defeitoRelatado} onChange={e => setFormData({...formData, defeitoRelatado: e.target.value})}
                           className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all resize-none" 
                           placeholder="Descreva o que aconteceu... (Ex: Caiu no chão e a tela trincou, a bateria está viciada, parou de carregar, etc.)" />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex justify-center items-center gap-2"
              >
                {loading ? <><Loader2 className="animate-spin" size={24} /> Enviando Solicitação...</> : "Solicitar Orçamento Gratuito"}
              </button>
           </form>
        </div>
      </main>
    </div>
  );
}
