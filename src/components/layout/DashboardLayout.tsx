"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { parseCookies, destroyCookie } from "nookies";
import { LayoutDashboard, Users, ArrowRightLeft, LogOut, Store, Package, Smartphone, Headphones, Wrench, Settings } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    destroyCookie(null, 'inova.token', { path: '/' });
    router.push('/login');
  };

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Nota A5 (Agudo e suave)
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch(e) {
      console.log("Erro ao tocar beep", e);
    }
  };

  useEffect(() => {
    const { 'inova.token': token } = parseCookies();
    if (!token) return;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt";
    const eventSource = new EventSource(`${apiUrl}/api/notificacoes/stream?token=${token}`);
    
    eventSource.addEventListener("novo_orcamento", (event) => {
        const clienteNome = event.data;
        playBeep();
        toast.success(`Novo orçamento web recebido: ${clienteNome}`, {
            duration: 8000,
            icon: '🔔',
            style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #eab308' // Amarelo inova tech
            }
        });
    });
    
    return () => {
        eventSource.close();
    };
  }, []);

  const navItemClass = (path: string) => {
    const isActive = pathname === path;
    return `flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-colors ${
      isActive 
        ? 'text-yellow-500 md:bg-white/5' 
        : 'text-slate-400 hover:text-white md:hover:bg-white/5'
    }`;
  };

  const iconClass = (path: string) => {
    return pathname === path ? "text-yellow-500" : "";
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-200 flex flex-col md:flex-row pb-16 md:pb-0">
      
      <Toaster position="top-right" />

      {/* Sidebar / Bottom Nav */}
      <aside className="fixed bottom-0 left-0 w-full h-16 border-t border-white/10 bg-[#07090f] z-50 flex flex-row items-center px-4 md:relative md:h-auto md:w-64 md:border-t-0 md:border-r md:bg-slate-900/40 md:p-6 md:flex-col md:items-stretch">
        
        {/* Logo visível apenas no Desktop */}
        <Link href="/" className="hidden md:flex items-center justify-center mb-12 hover:opacity-90 transition-opacity">
          <img 
            src="/logo-inovatech.png" 
            alt="InovaTech Logo" 
            className="w-32 h-auto object-contain" 
          />
        </Link>
        
        <nav className="flex-1 flex flex-row justify-around items-center w-full md:flex-col md:space-y-2 md:justify-start md:items-stretch">
          <Link href="/dashboard" className={navItemClass('/dashboard')}>
            <LayoutDashboard size={20} className={iconClass('/dashboard')} />
            <span className="md:inline">Geral</span>
          </Link>
          
          <Link href="/dashboard/clientes" className={navItemClass('/dashboard/clientes')}>
            <Users size={20} className={iconClass('/dashboard/clientes')} />
            <span className="md:inline">Clientes</span>
          </Link>
          
          <Link href="/dashboard/financeiro" className={navItemClass('/dashboard/financeiro')}>
            <ArrowRightLeft size={20} className={iconClass('/dashboard/financeiro')} />
            <span className="md:inline">Finanças</span>
          </Link>
          
          <Link href="/dashboard/orcamentos" className={navItemClass('/dashboard/orcamentos')}>
            <Package size={20} className={iconClass('/dashboard/orcamentos')} />
            <span className="md:inline">Orçamentos</span>
          </Link>
          
          <Link href="/dashboard/estoque?tipo=APARELHO" className={navItemClass('/dashboard/estoque?tipo=APARELHO')}>
            <Smartphone size={20} className={iconClass('/dashboard/estoque?tipo=APARELHO')} />
            <span className="md:inline">Aparelhos</span>
          </Link>

          <Link href="/dashboard/estoque?tipo=ACESSORIO" className={navItemClass('/dashboard/estoque?tipo=ACESSORIO')}>
            <Headphones size={20} className={iconClass('/dashboard/estoque?tipo=ACESSORIO')} />
            <span className="md:inline">Acessórios</span>
          </Link>

          <Link href="/dashboard/estoque?tipo=PECA" className={navItemClass('/dashboard/estoque?tipo=PECA')}>
            <Wrench size={20} className={iconClass('/dashboard/estoque?tipo=PECA')} />
            <span className="md:inline">Peças</span>
          </Link>
          
          <Link href="/dashboard/vitrine" className={navItemClass('/dashboard/vitrine')}>
            <Store size={20} className={iconClass('/dashboard/vitrine')} />
            <span className="md:inline">Vitrine</span>
          </Link>
          
          <Link href="/dashboard/configuracoes" className={navItemClass('/dashboard/configuracoes')}>
            <Settings size={20} className={iconClass('/dashboard/configuracoes')} />
            <span className="md:inline">Configurações</span>
          </Link>
          
          {/* Botão Sair no Mobile (Apenas Ícone) */}
          <button onClick={handleLogout} className="flex md:hidden flex-col items-center p-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>

        {/* Botão Sair no Desktop */}
        <div className="hidden md:block mt-auto pt-6 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <LogOut size={18} />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative w-full">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-yellow-600/10 rounded-full blur-[100px] -z-10 hidden md:block" />
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
