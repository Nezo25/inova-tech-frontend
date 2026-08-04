"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from '@/utils/api';
import { PackageOpen, ToggleLeft, ToggleRight, Info } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function VitrineDashboardPage() {
  const [produtos, setProdutos] = useState<any[]>([]);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = () => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/pecas`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filtrar apenas aparelhos para a vitrine
          const aparelhos = data.filter((p: any) => p.categoria === 'APARELHO');
          setProdutos(aparelhos);
        } else {
          setProdutos([]);
          toast.error("Erro no formato dos dados da vitrine");
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Erro ao carregar vitrine");
      });
  };

  const toggleStatus = (produto: any) => {
    // Agora que a vitrine reflete as peças diretamente, alteramos o exibirNaVitrine da própria peça
    const payload = { ...produto, exibirNaVitrine: !produto.exibirNaVitrine };
    
    // Atualiza a peca via endpoint de Pecas para refletir na Vitrine publicamente
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/pecas/${produto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(() => {
      fetchProdutos();
      toast.success(payload.exibirNaVitrine ? "Visível na Vitrine!" : "Ocultado da Vitrine.");
    }).catch(() => {
      toast.error("Erro ao alterar visibilidade");
    });
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">Gestão da Vitrine</h1>
          <p className="text-slate-400">Escolha quais aparelhos e peças do seu Estoque aparecerão na loja online.</p>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-blue-400">
        <Info size={24} className="shrink-0" />
        <p className="text-sm">
          <strong>Modo Read-Only Ativado:</strong> Para criar novos produtos na vitrine, acesse a aba <strong>Estoque ou Aparelhos</strong>, cadastre o item (com Foto e Preço &gt; 0) e ative a opção "Exibir na Vitrine". 
        </p>
      </div>

      <div className="bg-[#07090f] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-white/5">
                <th className="p-4 text-slate-300 font-medium">Foto</th>
                <th className="p-4 text-slate-300 font-medium">Produto</th>
                <th className="p-4 text-slate-300 font-medium">Estoque</th>
                <th className="p-4 text-slate-300 font-medium">Preço</th>
                <th className="p-4 text-slate-300 font-medium">Visibilidade (Vitrine)</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                      {p.fotoBase64 ? (
                          <img src={p.fotoBase64} alt="Produto" className="w-12 h-12 rounded object-cover" />
                      ) : (
                          <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center"><PackageOpen size={20} className="text-slate-500"/></div>
                      )}
                  </td>
                  <td className="p-4 text-white font-medium">{p.nome}</td>
                  <td className="p-4 text-slate-400">{p.quantidadeEstoque} und</td>
                  <td className="p-4 text-slate-300">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.precoVenda || 0)}
                  </td>
                  <td className="p-4">
                      <button onClick={() => toggleStatus(p)} className="flex items-center gap-2 focus:outline-none">
                          {p.exibirNaVitrine ? (
                              <ToggleRight size={32} className="text-green-500" />
                          ) : (
                              <ToggleLeft size={32} className="text-slate-500" />
                          )}
                          <span className={`text-sm font-medium ${p.exibirNaVitrine ? 'text-green-500' : 'text-slate-500'}`}>
                              {p.exibirNaVitrine ? 'Público' : 'Oculto'}
                          </span>
                      </button>
                  </td>
                </tr>
              ))}
              {produtos.length === 0 && (
                  <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum produto encontrado no estoque.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
