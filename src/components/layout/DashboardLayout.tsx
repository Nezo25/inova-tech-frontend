"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { destroyCookie } from "nookies";
import { LayoutDashboard, Users, ArrowRightLeft, LogOut, Box, DollarSign, Settings, Smartphone, Store } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    destroyCookie(null, 'inova.token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-900/40 p-6 flex flex-col">
        <Link href="/" className="flex items-center justify-center mb-12 hover:opacity-90 transition-opacity">
          <img 
            src="/logo-inovatech.png" 
            alt="InovaTech Logo" 
            className="w-32 h-auto object-contain" 
          />
        </Link>
        
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'bg-white/5' : 'hover:bg-white/5'}`}>
            <LayoutDashboard size={18} className="text-yellow-500" />
            Visão Geral
          </Link>
          <Link href="/dashboard/clientes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
            <Users size={18} className="text-yellow-500" />
            Clientes
          </Link>
          <Link href="/dashboard/financeiro" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
            <ArrowRightLeft size={18} className="text-yellow-500" />
            Financeiro
          </Link>
          <Link href="/dashboard/vitrine" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
            <Store size={18} className="text-yellow-500" />
            Vitrine
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <LogOut size={18} />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-yellow-600/10 rounded-full blur-[100px] -z-10" />
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
