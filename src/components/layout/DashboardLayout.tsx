import React from "react";
import Link from "next/link";
import { LayoutDashboard, Users, ArrowRightLeft, LogOut, Smartphone } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07090f] text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-900/40 p-6 flex flex-col">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-outfit mb-12">
          <Smartphone className="text-cyan-400" size={24} />
          <span>Inova<span className="text-gradient">Tech</span></span>
        </Link>
        
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
            <LayoutDashboard size={18} className="text-cyan-400" />
            Visão Geral
          </Link>
          <Link href="/dashboard/clientes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
            <Users size={18} className="text-purple-400" />
            Clientes
          </Link>
          <Link href="/dashboard/financeiro" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
            <ArrowRightLeft size={18} className="text-emerald-400" />
            Financeiro
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <LogOut size={18} />
            Sair do Painel
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
