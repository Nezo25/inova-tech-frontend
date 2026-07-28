"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { 
  Smartphone, 
  Wrench, 
  Headphones, 
  ShieldCheck, 
  Instagram, 
  Mail, 
  Phone 
} from "lucide-react";
import Link from "next/link";

function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 300, mass: 0.2 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'a' || 
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') || 
        target.closest('button')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-cyan-400 pointer-events-none z-[9999] hidden md:flex items-center justify-center bg-cyan-400/10 mix-blend-screen"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? 'rgba(0, 243, 255, 0.3)' : 'rgba(0, 243, 255, 0.1)'
      }}
    >
      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
    </motion.div>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CustomCursor />
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-cyan-400/20 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#07090f]/80 backdrop-blur-md border-b border-white/10 py-4' : 'py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-outfit">
            <Smartphone className="text-cyan-400" />
            <span>Inova<span className="text-gradient">Tech</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#inicio" className="hover:text-white transition-colors">Início</a>
            <a href="#servicos" className="hover:text-white transition-colors">Serviços</a>
            <a href="#sobre" className="hover:text-white transition-colors">Sobre Nós</a>
            <Link href="/dashboard" className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-all">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="inicio" className="min-h-screen flex items-center justify-center pt-20">
          <div className="container mx-auto px-6 text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <span className="inline-block py-1 px-3 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 text-xs font-semibold uppercase tracking-wider mb-6">
                Sua parceira tecnológica
              </span>
              <h1 className="text-5xl md:text-7xl font-bold font-outfit mb-6 leading-tight">
                Elevando a sua experiência <br className="hidden md:block"/>
                <span className="text-gradient">mobile.</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
                Especialistas em manutenção avançada, acessórios premium e soluções tecnológicas exclusivas para o seu dispositivo estar sempre em alta performance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#servicos" className="bg-gradient-accent text-white px-8 py-3 rounded-lg font-semibold shadow-[0_0_20px_rgba(188,19,254,0.3)] hover:shadow-[0_0_30px_rgba(188,19,254,0.5)] transition-all transform hover:-translate-y-1">
                  Nossos Serviços
                </a>
                <a href="https://www.instagram.com/inova_techcelularess" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold border border-white/10 hover:bg-white/5 hover:border-cyan-400/50 transition-all">
                  <Instagram size={20} />
                  Nosso Instagram
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicos" className="py-32">
          <div className="container mx-auto px-6">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold font-outfit mb-4">O que fazemos de <span className="text-cyan-400">melhor</span></h2>
              <p className="text-slate-400">Soluções completas e transparentes para a vida útil do seu aparelho.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Wrench, title: "Manutenção Especializada", desc: "Reparos complexos de placa, troca de telas, baterias e conectores com peças de altíssima qualidade." },
                { icon: Headphones, title: "Acessórios Premium", desc: "Proteção e estilo: capas, películas blindadas, fones de ouvido e carregadores originais." },
                { icon: ShieldCheck, title: "Consultoria e Venda", desc: "Orientação técnica especializada para você encontrar o smartphone perfeito para o seu uso." }
              ].map((srv, idx) => (
                <motion.div 
                  key={idx}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: idx * 0.2 }}}}
                  className="glass p-8 rounded-2xl hover:border-purple-500/50 transition-colors group"
                >
                  <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:bg-gradient-accent group-hover:text-white transition-all shadow-lg">
                    <srv.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-outfit">{srv.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{srv.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#07090f]/80 py-12 mt-20">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-outfit mb-4">
              <Smartphone className="text-cyan-400" />
              <span>Inova<span className="text-gradient">Tech</span></span>
            </Link>
            <p className="text-slate-500 text-sm max-w-xs">O seu porto seguro em tecnologia móvel. Assistência e qualidade no mesmo lugar.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-outfit">Contato</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-center gap-2"><Mail size={16}/> contato@inovatech.com.br</li>
              <li className="flex items-center gap-2"><Phone size={16}/> (00) 00000-0000</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-outfit">Siga-nos</h4>
            <a href="https://www.instagram.com/inova_techcelularess" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full glass hover:bg-gradient-accent hover:border-transparent transition-all">
              <Instagram size={20} />
            </a>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-8 border-t border-white/5 text-center text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} Inova Tech Celulares. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
