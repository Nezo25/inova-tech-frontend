"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function OSPage() {
  const params = useParams();
  const id = params.id;
  const [cliente, setCliente] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://shaggy-chicken-read.loca.lt"}/api/clientes/${id}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          setCliente(data);
          setTimeout(() => {
            window.print();
          }, 500);
        })
        .catch(() => setError(true));
    }
  }, [id]);

  if (error) return <div className="p-8 text-black bg-white min-h-screen">Erro ao carregar a Ordem de Serviço.</div>;
  if (!cliente) return <div className="p-8 text-black bg-white min-h-screen">Gerando Ordem de Serviço...</div>;

  return (
    <div className="bg-white text-black min-h-screen p-8 max-w-2xl mx-auto font-sans print:p-0 print:max-w-full">
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black">INOVA TECH</h1>
          <p className="text-sm">Assistência Técnica Especializada</p>
          <p className="text-xs mt-1">Av. Luiz Scorbaioli, 1151, Vargem/SP | (11) 97793-6208</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold">OS #{cliente.id}</h2>
          <p className="text-sm">Data: {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="mb-6 border border-black p-4 rounded">
        <h3 className="font-bold text-lg mb-2 uppercase border-b border-black pb-1">Dados do Cliente</h3>
        <p><strong>Nome:</strong> {cliente.nomeCliente}</p>
        <p><strong>Telefone:</strong> {cliente.numeroCelular}</p>
        {cliente.endereco && <p><strong>Endereço:</strong> {cliente.endereco}</p>}
      </div>

      <div className="mb-6 border border-black p-4 rounded">
        <h3 className="font-bold text-lg mb-2 uppercase border-b border-black pb-1">Dados do Aparelho</h3>
        <p><strong>Marca:</strong> {cliente.marcaAparelho}</p>
        <p><strong>Modelo:</strong> {cliente.modeloProduto}</p>
        <p className="mt-2"><strong>Defeito Relatado:</strong></p>
        <p className="p-2 bg-gray-100 italic print:bg-transparent border print:border-none min-h-[60px]">
          {cliente.defeitoRelatado || "Nenhum defeito detalhado relatado."}
        </p>
      </div>

      <div className="mb-12 border border-black p-4 rounded text-sm text-justify">
        <h3 className="font-bold text-lg mb-2 uppercase border-b border-black pb-1">Termo de Responsabilidade</h3>
        <p className="mb-2">1. A Inova Tech compromete-se a avaliar o aparelho e realizar o orçamento do conserto.</p>
        <p className="mb-2">2. Aparelhos deixados na assistência e não retirados após 90 dias da comunicação do conserto serão considerados abandonados, podendo ser vendidos para custear as peças.</p>
        <p className="mb-2">3. A garantia legal para consertos é de 90 dias para defeitos na mesma peça trocada, não cobrindo mau uso, quedas ou contato com líquidos.</p>
        <p>4. O cliente declara estar ciente do estado físico do aparelho no momento da entrega, devidamente registrado em fotos por nossa equipe.</p>
      </div>

      <div className="flex justify-between mt-16 pt-8 border-t border-black">
        <div className="text-center w-1/2 px-4">
          <div className="border-t border-black pt-2">
            Assinatura do Cliente
          </div>
        </div>
        <div className="text-center w-1/2 px-4">
          <div className="border-t border-black pt-2">
            Inova Tech
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center print:hidden">
        <button onClick={() => window.print()} className="bg-black text-white px-6 py-2 rounded font-bold">Imprimir Novamente</button>
      </div>
    </div>
  );
}
