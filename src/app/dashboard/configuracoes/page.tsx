"use client";

import React, { useState, useEffect } from 'react';
import { parseCookies } from 'nookies';
import toast, { Toaster } from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [formData, setFormData] = useState({
    nomeFantasia: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    termoGarantia: '',
    asaasApiKey: '',
    asaasWebhookToken: ''
  });

  useEffect(() => {
    buscarConfiguracoes();
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

  const buscarConfiguracoes = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/configuracoes-loja`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          nomeFantasia: data.nomeFantasia || '',
          cnpj: data.cnpj || '',
          endereco: data.endereco || '',
          telefone: data.telefone || '',
          termoGarantia: data.termoGarantia || '',
          asaasApiKey: data.asaasApiKey || '',
          asaasWebhookToken: data.asaasWebhookToken || ''
        });
      }
    } catch (error) {
      console.error("Erro ao buscar configuracoes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading("Salvando configurações...");
    try {
      const res = await fetch(`${getApiUrl()}/api/configuracoes-loja`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Configurações salvas com sucesso!", { id: t });
      } else {
        toast.error("Erro ao salvar.", { id: t });
      }
    } catch (error) {
      toast.error("Erro de conexão.", { id: t });
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-fade-in text-white font-outfit max-w-4xl">
      <Toaster position="top-right" />
      
      <div>
        <h1 className="text-3xl font-black tracking-tighter">
          Configurações da Loja
        </h1>
        <p className="text-slate-400 mt-2">
          Preencha os dados abaixo. Eles serão utilizados nos comprovantes e faturamentos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/5 p-6 rounded-2xl shadow-xl space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-400">Nome Fantasia da Loja</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors"
              value={formData.nomeFantasia}
              onChange={(e) => setFormData({...formData, nomeFantasia: e.target.value})}
              placeholder="Minha Assistência Celulares"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-400">CNPJ (Opcional)</label>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors"
              value={formData.cnpj}
              onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
              placeholder="00.000.000/0000-00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-400">Endereço Completo</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors"
              value={formData.endereco}
              onChange={(e) => setFormData({...formData, endereco: e.target.value})}
              placeholder="Av Principal, 100 - Centro"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-400">Telefone / WhatsApp</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors"
              value={formData.telefone}
              onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              placeholder="(00) 90000-0000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-400">Termos de Garantia (Aparece no rodapé dos orçamentos)</label>
          <textarea 
            required
            rows={5}
            className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors"
            value={formData.termoGarantia}
            onChange={(e) => setFormData({...formData, termoGarantia: e.target.value})}
            placeholder="Descreva os termos de garantia para serviços e peças..."
          />
        </div>

        {/* Integração Asaas */}
        <div className="pt-6 border-t border-white/10">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            🔗 Integração Asaas (Pagamentos)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-400">API Key (Access Token)</label>
              <input 
                type="password" 
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors"
                value={formData.asaasApiKey}
                onChange={(e) => setFormData({...formData, asaasApiKey: e.target.value})}
                placeholder="Ex: $aact_YTU5YTE0M..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-400">Webhook Token (Segurança)</label>
              <input 
                type="password" 
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors"
                value={formData.asaasWebhookToken}
                onChange={(e) => setFormData({...formData, asaasWebhookToken: e.target.value})}
                placeholder="Token gerado no Asaas para Webhooks"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <Save size={20} /> Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
