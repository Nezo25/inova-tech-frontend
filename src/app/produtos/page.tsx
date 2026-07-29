"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, PackageOpen, Loader2 } from "lucide-react";

export default function VitrinePublicaPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt";
    fetch(`${apiUrl}/api/vitrine`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    })
      .then(res => res.json())
      .then(data => {
        setProdutos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleWhatsAppClick = (produto: any) => {
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco);
    const message = `Olá, vi o produto ${produto.nome} por ${formattedPrice} no site e gostaria de mais informações!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

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

      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
          <h1 className="text-4xl md:text-5xl font-bold font-outfit text-white mb-4 relative z-10">Vitrine Digital</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto relative z-10">
            Confira nossos aparelhos seminovos e acessórios exclusivos com os melhores preços. 
            Todos testados e aprovados pela nossa equipe técnica!
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-yellow-500" size={48} />
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-white/5">
            <PackageOpen size={64} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Vitrine Vazia</h2>
            <p className="text-slate-400">Nenhum produto disponível no momento. Volte mais tarde!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {produtos.map(produto => (
              <div key={produto.id} className="bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden flex flex-col group hover:border-yellow-500/50 transition-all hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                <div className="h-64 w-full bg-slate-800 flex items-center justify-center overflow-hidden">
                  {produto.imagemBase64 ? (
                    <img src={produto.imagemBase64} alt={produto.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <PackageOpen size={48} className="text-slate-600" />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 font-outfit">{produto.nome}</h3>
                  <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                    {produto.descricao}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-yellow-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleWhatsAppClick(produto)}
                    className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={20} />
                    Comprar no WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
