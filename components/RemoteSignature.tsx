import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../services/dbService';

interface RemoteSignatureProps {
  signatureId: string;
}

export const RemoteSignature: React.FC<RemoteSignatureProps> = ({ signatureId }) => {
  const [status, setStatus] = useState<'loading' | 'pending' | 'signed' | 'error' | 'not_found'>('loading');
  const [patientName, setPatientName] = useState('');
  
  // Signature Form Data
  const [signatureName, setSignatureName] = useState('');
  const [signatureCpf, setSignatureCpf] = useState('');
  const [hasAgreement, setHasAgreement] = useState(false);
  
  // Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const data = await dbService.checkPendingSignatureStatus(signatureId);
        if (!data) {
          setStatus('not_found');
          return;
        }

        setStatus(data.status as any); // 'pending' or 'signed'
        // In a real app we might want to also fetch the patient name from the record itself 
        // if we exposed it on `checkPendingSignatureStatus`, but for simplicity here we assume 
        // the user fills their name again or we adjust the DB fetching function later.
      } catch (error) {
         console.error(error);
         setStatus('error');
      }
    };
    
    if (signatureId) {
       fetchSignature();
    }
  }, [signatureId]);

  // --- Signature Canvas Logic ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const confirmSignature = async () => {
    if (!hasAgreement) {
      alert("Você precisa marcar a caixa de seleção concordando com os termos.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const pixelBuffer = new Uint32Array(ctx!.getImageData(0,0, canvas.width, canvas.height).data.buffer);
    const hasDrawn = pixelBuffer.some(color => color !== 0);
    
    if (!hasDrawn) {
      alert("Por favor, assine no campo indicado.");
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    
    try {
        setStatus('loading');
        await dbService.completePendingSignature(signatureId, {
            name: signatureName,
            cpf: signatureCpf,
            signatureImage: dataUrl
        });
        setStatus('signed');
    } catch (error) {
        console.error("Erro ao salvar assinatura:", error);
        alert("Ocorreu um erro ao salvar a assinatura. Tente novamente.");
        setStatus('pending');
    }
  };

  if (status === 'loading') {
      return (
          <div className="flex items-center justify-center min-h-screen bg-slate-50">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  if (status === 'not_found' || status === 'error') {
      return (
          <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm">
                 <h2 className="text-xl font-bold text-slate-800 mb-2">Link Inválido</h2>
                 <p className="text-slate-600">Este link de assinatura é inválido, expirou ou ocorreu um erro de conexão. Por favor, solicite um novo link ao seu terapeuta.</p>
              </div>
          </div>
      );
  }

  if (status === 'signed') {
      return (
          <div className="flex items-center justify-center min-h-screen bg-teal-50 p-6 text-center">
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm border border-teal-100">
                 <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <h2 className="text-xl font-bold text-teal-800 mb-2">Documento Assinado</h2>
                 <p className="text-teal-600">Ter ciência confirmada! Seu terapeuta já foi notificado no aplicativo dele. Você já pode fechar esta tela.</p>
              </div>
          </div>
      );
  }

  // Pending State...
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-start pt-8 pb-16 px-4">
       <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 sm:p-8 animate-fade-in flex flex-col">
          <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-teal-800 tracking-tight">Autorização de Atendimento</h1>
              <p className="text-slate-500 text-sm mt-1">Rastreios no Biomagnetismo</p>
          </div>
          
          <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">Termo de Ciência do Paciente</h3>
          
          <div className="space-y-5 text-sm text-slate-700">
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 leading-relaxed">
                  <p className="mb-3">O Biomagnetismo é uma terapia complementar e não substitui tratamento médico, terapêutico ou qualquer outro tratamento legalmente reconhecido.</p>
                  <p className="mb-3">Não são feitas promessas de cura, e os resultados podem variar de pessoa para pessoa.</p>
                  <p>O paciente deve manter seus exames, consultas e tratamentos em dia com os profissionais de saúde responsáveis.</p>
              </div>

              <label className="flex items-start gap-4 bg-teal-50 p-4 rounded-lg border border-teal-200 cursor-pointer shadow-sm hover:shadow transition-shadow">
                  <input type="checkbox" className="mt-1 w-5 h-5 text-teal-600 rounded border-teal-300 focus:ring-teal-500" checked={hasAgreement} onChange={(e) => setHasAgreement(e.target.checked)} />
                  <span className="font-medium text-teal-900 leading-snug text-base">
                      Li e declaro estar ciente de que o Biomagnetismo é uma terapia complementar e não substitui tratamento médico. Não me foram feitas promessas de cura, e continuarei meu acompanhamento médico tradicional.
                  </span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Seu Nome Completo</label>
                      <input type="text" value={signatureName} onChange={(e) => setSignatureName(e.target.value)} placeholder="Digite seu nome completo" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white" />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">CPF (Opcional)</label>
                      <input type="tel" value={signatureCpf} onChange={(e) => setSignatureCpf(e.target.value)} placeholder="000.000.000-00" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white" />
                  </div>
              </div>

              <div className="mt-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between items-end">
                      <span>Assinatura (Desenhe no espaço abaixo)</span>
                      <button type="button" onClick={clearSignature} className="text-teal-600 hover:text-teal-800 text-xs font-semibold underline">Limpar Assinatura</button>
                  </label>
                  <div className="border-2 border-slate-300 rounded-xl bg-slate-50 overflow-hidden shadow-inner relative">
                    {!isDrawing && !hasAgreement && (
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                          <span className="text-slate-400 font-medium">Assine Aqui</span>
                       </div>
                    )}
                    <canvas 
                        ref={canvasRef}
                        width={600}
                        height={200}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-48 cursor-crosshair touch-none"
                    />
                  </div>
              </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
             <button type="button" onClick={confirmSignature} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                 ENVIAR DOCUMENTO ASSINADO
             </button>
             <p className="text-center text-xs text-slate-400 mt-4">Ao clicar no botão acima, você concorda com os termos e sua assinatura será digitalizada.</p>
          </div>
       </div>
    </div>
  );
};

export default RemoteSignature;
