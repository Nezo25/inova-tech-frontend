'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureBase64: string) => void;
}

export function SignatureModal({ isOpen, onClose, onSave }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Clear canvas on open
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Check if canvas is empty (simplified check)
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        alert("Por favor, faça uma assinatura antes de salvar.");
        return;
      }
      
      const signatureBase64 = canvas.toDataURL('image/png');
      onSave(signatureBase64);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1C1C24] border border-[#2D2D3A] rounded-xl w-full max-w-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2D2D3A] flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Assinatura Digital</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 flex flex-col items-center">
          <p className="text-gray-400 mb-4 text-sm text-center">
            Utilize o mouse ou o dedo para assinar no quadro abaixo.
          </p>
          <div className="bg-white rounded-lg p-1 w-full max-w-[400px]">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className="w-full bg-white border border-gray-200 rounded cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2D2D3A] flex justify-between items-center gap-4 bg-[#14141A] rounded-b-xl">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-[#2D2D3A] text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Limpar
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#2D2D3A] text-gray-300 rounded-lg hover:bg-[#2D2D3A] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#F6C344] text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
            >
              Salvar Assinatura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
