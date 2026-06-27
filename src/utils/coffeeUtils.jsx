// Sonido sintetizado nativo para avisar el cambio de paso
export const playBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, 400); 
  } catch (e) {
    console.warn("La reproducción de audio falló o fue bloqueada por el navegador:", e);
  }
};

// Iconos SVG en formato de glifos minimalistas
export const getMethodIcon = (method) => {
  const m = method.toLowerCase();
  if (m.includes('v60')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-amber-900/70 dark:text-amber-500/80" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 3h16l-3 9H7l-3-9z" />
        <path d="M17.5 5.5A2.5 2.5 0 0 1 20 8a2.5 2.5 0 0 1-2.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="5" y="12" width="14" height="1.5" rx="0.75" />
        <path d="M8 14.5h8v4.5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-4.5z" opacity="0.5" />
      </svg>
    );
  }
  if (m.includes('aeropress')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-amber-900/70 dark:text-amber-500/80" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="2" width="4" height="4.5" rx="1" />
        <rect x="7" y="6" width="10" height="1.5" rx="0.5" />
        <rect x="8" y="8" width="8" height="11" rx="0.5" />
        <rect x="7" y="19" width="10" height="2.5" rx="0.5" />
      </svg>
    );
  }
  if (m.includes('chemex')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-amber-900/70 dark:text-amber-500/80" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3h12l-4.5 7.5c-.3.5-.3 1.1 0 1.6L18 20c.5.8-.1 1.8-1 1.8H7c-.9 0-1.5-1-1-1.8l4.5-7.9c.3-.5.3-1.1 0-1.6L6 3z" />
        <rect x="8.5" y="10.5" width="7" height="2.5" rx="0.5" fill="currentColor" className="text-amber-700 dark:text-amber-600" />
        <circle cx="12" cy="11.75" r="0.75" fill="white" />
      </svg>
    );
  }
  if (m.includes('switch')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-amber-900/70 dark:text-amber-500/80" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 3h16l-3 9H7l-3-9z" />
        <rect x="5" y="12" width="14" height="2" rx="0.5" />
        <rect x="8" y="14" width="8" height="5" rx="1" opacity="0.6" />
        <rect x="10" y="15.5" width="4" height="1.5" rx="0.5" fill="currentColor" className="text-amber-600 dark:text-amber-400" />
      </svg>
    );
  }
  if (m.includes('moka')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-amber-900/70 dark:text-amber-500/80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="2.5" r="1.25" />
        <path d="M7 4.5l10 0-1.5 7h-7z" />
        <path d="M15.5 5.5l2.5 1.5-1.5 2z" />
        <path d="M7.5 6A2.5 2.5 0 0 0 5 8.5v4A2.5 2.5 0 0 0 7.5 15" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8" y="11.5" width="8" height="1.5" />
        <path d="M8.5 13l-1.5 7.5h10l-1.5-7.5z" />
      </svg>
    );
  }
  if (m.includes('origami')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-amber-900/70 dark:text-amber-500/80" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 3h17l-3 9H6.5z" />
        <line x1="6.5" y1="3" x2="8" y2="12" stroke="white" strokeWidth="1" opacity="0.5" />
        <line x1="9" y1="3" x2="10" y2="12" stroke="white" strokeWidth="1" opacity="0.5" />
        <line x1="12" y1="3" x2="12" y2="12" stroke="white" strokeWidth="1" opacity="0.5" />
        <line x1="15" y1="3" x2="14" y2="12" stroke="white" strokeWidth="1" opacity="0.5" />
        <line x1="17.5" y1="3" x2="16" y2="12" stroke="white" strokeWidth="1" opacity="0.5" />
        <rect x="4.5" y="12" width="15" height="1.5" rx="0.75" />
      </svg>
    );
  }
  if (m.includes('prensa') || m.includes('french')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-amber-900/70 dark:text-amber-500/80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="2" r="1" />
        <rect x="7" y="4" width="10" height="1.5" rx="0.5" />
        <rect x="11.25" y="3" width="1.5" height="13" />
        <rect x="6.5" y="15" width="11" height="1.5" fill="currentColor" className="text-amber-700 dark:text-amber-600" />
        <path d="M6 5.5v14a2.5 2.5 0 0 0 2.5 2.5h7a2.5 2.5 0 0 0 2.5-2.5v-14" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 7.5h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-amber-900/70 dark:text-amber-500/80" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 2.5c.3.5.3 1.1 0 1.5s-.6 1-.3 1.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M12 2c.3.5.3 1.1 0 1.5s-.6 1-.3 1.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M15.5 2.5c.3.5.3 1.1 0 1.5s-.6 1-.3 1.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M5 8h12a1 1 0 0 1 1 1v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9a1 1 0 0 1 1-1z" />
      <path d="M18 10.5h1.5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H18" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
};

export const COFFEE_DESCRIPTORS = [
  'Dulce',
  'Ácido',
  'Amargo',
  'Cuerpo',
  'Balanceado',
  'Floral',
  'Frutal',
  'Cítrico',
  'Chocolatoso',
  'Nuez'
];
