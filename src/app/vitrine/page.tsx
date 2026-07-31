"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from '@/utils/api';
import { ShoppingCart, MessageCircle, Phone, PackageOpen } from "lucide-react";
import Image from "next/image";

export default function VitrinePublicaPage() {
  const [aparelhos, setAparelhos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/vitrine/produtos`)
      .then(res => res.json())
      .then(data => {
          setAparelhos(data);
          setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleWhatsApp = (aparelho: any) => {
    // Pegar o telefone da loja nas configs ou usar um fixo por enquanto
    const phone = "5511999999999"; 
    const text = encodeURIComponent(`Olá! Tenho interesse no aparelho ${aparelho.nome} que está na vitrine por ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aparelho.precoVenda)}.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-200">
      <header className="bg-slate-900/50 border-b border-white/5 py-6">
        <div className="container mx-auto px-4 max-w-6xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-outfit text-center">
                Vitrine <span className="text-yellow-500">Inova Tech</span>
            </h1>
            <p className="text-center text-slate-400 mt-2 text-sm md:text-base">
                Confira nossos aparelhos disponíveis a pronta entrega.
            </p>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-6xl py-12">
        {loading ? (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        ) : aparelhos.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-white/5">
                <PackageOpen size={48} className="mx-auto text-slate-600 mb-4" />
                <h2 className="text-xl text-slate-300 font-bold mb-2">Nenhum aparelho disponível</h2>
                <p className="text-slate-500 text-sm">No momento não temos aparelhos na vitrine. Volte mais tarde!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {aparelhos.map(aparelho => (
                    <div key={aparelho.id} className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] group flex flex-col">
                        <div className="relative aspect-[4/5] w-full bg-black/40 overflow-hidden">
                            {aparelho.fotoBase64 ? (
                                <img 
                                    src={aparelho.fotoBase64} 
                                    alt={aparelho.nome}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                                    <Phone size={48} className="mb-2 opacity-50" />
                                    <span className="text-sm font-medium">Sem foto</span>
                                </div>
                            )}
                            
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">{aparelho.marca}</span>
                            </div>
                        </div>
                        
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-white mb-1 leading-tight group-hover:text-yellow-400 transition-colors">{aparelho.nome}</h3>
                            <p className="text-sm text-slate-400 mb-4">{aparelho.modelo}</p>
                            
                            <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-3">
                                <div>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">Preço à vista</span>
                                    <span className="text-2xl font-black text-white font-outfit">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aparelho.precoVenda)}
                                    </span>
                                </div>
                                
                                <button 
                                    onClick={() => handleWhatsApp(aparelho)}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
                                >
                                    <MessageCircle size={18} />
                                    Tenho Interesse
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
      
      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Inova Tech. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
