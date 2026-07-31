"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Wrench, 
  Headphones, 
  ShieldCheck, 
  Mail, 
  Phone,
  MapPin,
  MessageCircle,
  PackageOpen,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [destaques, setDestaques] = useState<any[]>([]);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt";
    fetch(`${apiUrl}/api/vitrine`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("API Error");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setDestaques(data.slice(0, 4));
        }
      })
      .catch(err => console.error("Error fetching destaques:", err));
  }, []);

  const handleWhatsAppClick = (produto: any) => {
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco);
    const message = `Olá, vi o produto ${produto.nome} por ${formattedPrice} no site e gostaria de mais informações!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-600/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-yellow-400/10 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#07090f]/90 backdrop-blur-md border-b border-white/10 py-4' : 'py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <img src="/logo-inovatech.png" alt="InovaTech Logo" className="h-12 md:h-20 w-auto object-contain" />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#inicio" className="hover:text-white transition-colors">Início</a>
            <a href="#servicos" className="hover:text-white transition-colors">Serviços</a>
            <a href="#sobre" className="hover:text-white transition-colors">Sobre Nós</a>
            <Link href="/solicitar" className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-6 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center gap-2">
              <Smartphone size={18} />
              Solicitar Serviço
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#07090f] border-b border-white/10 shadow-2xl">
            <nav className="flex flex-col p-6 gap-4 text-base font-medium text-slate-300">
              <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-white transition-colors">Início</a>
              <a href="#servicos" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-white transition-colors">Serviços</a>
              <a href="#sobre" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-white transition-colors">Sobre Nós</a>
              <Link href="/solicitar" onClick={() => setMobileMenuOpen(false)} className="mt-4 bg-yellow-500 text-slate-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                <Smartphone size={20} />
                Solicitar Serviço
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section id="inicio" className="min-h-screen flex items-center justify-center pt-20">
          <div className="container mx-auto px-6 text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <span className="inline-block py-1 px-3 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-semibold uppercase tracking-wider mb-6">
                Sua parceira tecnológica
              </span>
              <h1 className="text-5xl md:text-7xl font-bold font-outfit mb-6 leading-tight">
                Elevando a sua experiência <br className="hidden md:block"/>
                <span className="text-gradient">mobile.</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
                Especialistas em iPhones e Multimarcas. Manutenção avançada, acessórios premium e soluções tecnológicas exclusivas para o seu dispositivo estar sempre em alta performance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="https://wa.me/5511977936208?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20Inova%20Tech%21" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-gradient-accent text-white px-8 py-3 rounded-lg font-semibold shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all transform hover:-translate-y-1">
                  <Phone size={20} />
                  Falar no WhatsApp
                </a>
                <a href="https://www.instagram.com/inova_techcelularess" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold border border-white/10 hover:bg-white/5 hover:border-yellow-500/50 transition-all">
                  <svg xmlns="http://www.w3.org/2001/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  Nosso Instagram
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Products Section */}
        {destaques.length > 0 && (
          <section className="py-20 bg-slate-900/20 relative z-10 border-t border-b border-white/5">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <span className="inline-block py-1 px-3 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
                  Vitrine
                </span>
                <h2 className="text-4xl font-bold font-outfit mb-4 text-white">Produtos em <span className="text-yellow-500">Destaque</span></h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Confira os itens mais buscados da nossa loja no momento.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {destaques.map(produto => (
                  <div key={produto.id} className="bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden flex flex-col group hover:border-yellow-500/50 transition-all hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                    <div className="h-48 w-full bg-slate-800 flex items-center justify-center overflow-hidden">
                      {produto.imagemBase64 ? (
                        <img src={produto.imagemBase64} alt={produto.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <PackageOpen size={40} className="text-slate-600" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 font-outfit line-clamp-1">{produto.nome}</h3>
                      <p className="text-slate-400 text-xs mb-4 flex-1 line-clamp-2">
                        {produto.descricao}
                      </p>
                      <div className="flex items-center justify-between mt-auto mb-4">
                        <span className="text-xl font-bold text-yellow-500">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleWhatsAppClick(produto)}
                        className="w-full mt-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 text-sm"
                      >
                        <MessageCircle size={16} />
                        Tenho Interesse
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/produtos" className="inline-flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-500/50 text-white font-medium py-3 px-8 rounded-xl transition-all">
                  Ver catálogo completo
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Services Section */}
        <section id="servicos" className="py-32">
          <div className="container mx-auto px-6">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold font-outfit mb-4">O que fazemos de <span className="text-yellow-500">melhor</span></h2>
              <p className="text-slate-400">Soluções completas e transparentes para a vida útil do seu aparelho.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Wrench, title: "Manutenção Especializada", desc: "Reparos complexos de placa, troca de telas, baterias e conectores com peças de altíssima qualidade." },
                { icon: Headphones, title: "Acessórios Premium", desc: "Proteção e estilo: capas, películas blindadas, fones de ouvido e carregadores originais." },
                { icon: ShieldCheck, title: "Consultoria e Venda", desc: "Orientação técnica especializada para você encontrar o smartphone perfeito para o seu uso." }
              ].map((srv, idx) => {
                const message = `Olá! Gostaria de saber mais sobre: ${srv.title}`;
                const encodedMessage = encodeURIComponent(message);
                
                return (
                  <motion.a 
                    key={idx}
                    href={`https://wa.me/${whatsappNumber}?text=${encodedMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: idx * 0.2 }}}}
                    className="glass p-8 rounded-2xl hover:border-yellow-500/50 transition-colors group cursor-pointer block"
                  >
                    <div className="w-14 h-14 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 mb-6 group-hover:bg-gradient-accent group-hover:text-white transition-all shadow-lg">
                      <srv.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 font-outfit">{srv.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{srv.desc}</p>
                  </motion.a>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#07090f]/80 py-12 mt-20">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center mb-6 hover:opacity-90 transition-opacity">
              <img src="/logo-inovatech.png" alt="InovaTech Logo" className="h-20 md:h-24 w-auto object-contain" />
            </Link>
            <p className="text-slate-500 text-sm max-w-xs">O seu porto seguro em tecnologia móvel. Assistência e qualidade no mesmo lugar.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-outfit">Contato & Localização</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-yellow-500"/> 
                <span>Av. Luiz Scorbaioli, 1151<br/>Vargem/SP</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-yellow-500 flex-shrink-0"/> 
                <a href="https://wa.me/5511977936208" target="_blank" rel="noreferrer" className="hover:text-yellow-500 transition-colors">
                  (11) 97793-6208
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-outfit">Siga-nos</h4>
            <a href="https://www.instagram.com/inova_techcelularess" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full glass hover:bg-gradient-accent hover:border-transparent transition-all">
              <svg xmlns="http://www.w3.org/2001/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-600 text-sm">
          <span>&copy; {new Date().getFullYear()} Inova Tech Celulares. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
