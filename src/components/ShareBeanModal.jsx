import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { compressBean } from '../utils/coffeeUtils';

export default function ShareBeanModal({ bean, onClose, onAlert }) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function generateLink() {
      try {
        setGenerating(true);
        const compressed = await compressBean(bean);
        const url = `${window.location.origin}${window.location.pathname}?bean=${compressed}`;
        if (active) {
          setShareUrl(url);
          setGenerating(false);
        }
      } catch (err) {
        console.error("Error al generar enlace de compartir grano:", err);
        if (active) {
          setError("No se pudo generar el enlace de compartir.");
          setGenerating(false);
        }
      }
    }

    generateLink();

    return () => {
      active = false;
    };
  }, [bean]);

  useEffect(() => {
    if (!shareUrl || generating || !canvasRef.current) return;

    // Renderizar QR Code en el canvas
    QRCode.toCanvas(
      canvasRef.current,
      shareUrl,
      {
        width: 220,
        margin: 2,
        color: {
          dark: '#3f2b1c', // Marrón oscuro coherente con café
          light: '#ffffff',
        },
      },
      (err) => {
        if (err) {
          console.error("Error rendering QR for bean:", err);
          setError("Error al renderizar el código QR.");
        }
      }
    );
  }, [shareUrl, generating]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar enlace de grano:", err);
      if (onAlert) {
        onAlert("No se pudo copiar el enlace automáticamente.", "error");
      } else {
        alert("No se pudo copiar el enlace automáticamente.");
      }
    }
  };

  const handleWebShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: `Grano de Café: ${bean.name}`,
        text: `Descubre este grano de café: ${bean.name}${bean.roaster ? ` de ${bean.roaster}` : ''}`,
        url: shareUrl,
      });
    } catch (err) {
      // Ignorar abortos del usuario
      if (err.name !== 'AbortError') {
        console.error("Error en Web Share para grano:", err);
      }
    }
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bean, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${bean.name.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col items-center text-center transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="w-full flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-amber-950 dark:text-amber-500">
            Compartir Grano
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-semibold leading-none p-1"
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>

        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {bean.name} {bean.roaster ? `(${bean.roaster})` : ''}
        </p>

        {/* Zona de QR Code */}
        <div className="my-4 p-3 bg-white border-2 border-amber-900/10 rounded-2xl shadow-inner flex items-center justify-center min-h-[240px] min-w-[240px]">
          {generating ? (
            <div className="flex flex-col items-center space-y-2 text-slate-500">
              <div className="w-10 h-10 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Generando código QR...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm px-4">{error}</div>
          ) : (
            <canvas ref={canvasRef} className="w-[220px] h-[220px] rounded-lg" />
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-[280px]">
          Escanea este código QR con otro dispositivo para importar este grano al instante.
        </p>

        {/* Botones de acción */}
        <div className="w-full flex flex-col gap-2.5">
          {navigator.share && (
            <button
              onClick={handleWebShare}
              disabled={generating || !!error}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
              </svg>
              Compartir en Móvil
            </button>
          )}

          <button
            onClick={handleCopyLink}
            disabled={generating || !!error}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 border font-semibold rounded-xl transition-all active:scale-[0.98] ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {copied ? (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                ¡Enlace Copiado!
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copiar Enlace
              </>
            )}
          </button>

          <button
            onClick={handleDownloadJson}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold rounded-xl active:scale-[0.98] transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar archivo
          </button>
        </div>
      </div>
    </div>
  );
}
