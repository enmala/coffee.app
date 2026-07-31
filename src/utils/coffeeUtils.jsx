// Instancia única y reutilizable de AudioContext para evitar crear/cerrar
// contextos en cada pitido, lo que previene consumo innecesario de memoria
// y bloqueos de audio en móviles/TWA.
let sharedAudioContext = null;

const getSharedAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (sharedAudioContext && sharedAudioContext.state !== 'closed') {
    return sharedAudioContext;
  }
  sharedAudioContext = new AudioContextClass();
  return sharedAudioContext;
};

// Reinicia la instancia compartida de AudioContext. Pensado para tests y
// para liberar el recurso cuando la app se desmonta.
export const resetSharedAudioContext = () => {
  if (sharedAudioContext) {
    try { sharedAudioContext.close(); } catch { /* noop */ }
    sharedAudioContext = null;
  }
};

// Sonido sintetizado nativo para avisar el cambio de paso
export const playBeep = () => {
  try {
    const audioCtx = getSharedAudioContext();
    if (!audioCtx) return;

    // Autoplay policy: reanudar el contexto si está suspendido
    if (audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function') {
      audioCtx.resume();
    }

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
    }, 400); 
  } catch (e) {
    console.warn("La reproducción de audio falló o fue bloqueada por el navegador:", e);
  }
};

export const speakText = (message) => {
  try {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return;

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'es-ES';
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    synth.speak(utterance);
  } catch (err) {
    console.warn('La narración por voz falló:', err);
  }
};

// Auxiliar para determinar la categoría de la receta ('tea' o 'coffee')
export const getRecipeCategory = (recipe) => {
  if (!recipe) return 'coffee';
  if (recipe.category === 'tea' || recipe.category === 'té') return 'tea';
  const m = (recipe.method || '').toLowerCase();
  const teaKeywords = ['matcha', 'sencha', 'gongfu', 'té', 'tea', 'infusión', 'infusion', 'oolong', 'chasen', 'chai'];
  if (teaKeywords.some(keyword => m.includes(keyword))) {
    return 'tea';
  }
  return 'coffee';
};

export const getIngredientLabel = (recipe) => {
  return getRecipeCategory(recipe) === 'tea' ? 'Té / Insumo' : 'Café';
};

export const getGrindLabel = (recipe) => {
  return getRecipeCategory(recipe) === 'tea' ? 'Presentación' : 'Molienda';
};

export const calculateRatio = (coffeeG, totalWaterG) => {
  const coffee = Number(coffeeG) || 0;
  const water = Number(totalWaterG) || 0;

  if (coffee <= 0 || water <= 0) {
    return '1:--';
  }

  const ratio = water / coffee;
  const formatted = ratio % 1 === 0 ? ratio.toFixed(0) : ratio.toFixed(1);
  return `1:${formatted}`;
};

// Iconos SVG en formato de glifos minimalistas
export const getMethodIcon = (method) => {
  const m = (method || '').toLowerCase();
  if (m.includes('matcha') || m.includes('sencha') || m.includes('gongfu') || m.includes('té') || m.includes('tea') || m.includes('oolong') || m.includes('infusión') || m.includes('infusion')) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-emerald-700/80 dark:text-emerald-400" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1H4v1z" />
        <path d="M3 10v6a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-6H3zm16 1h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2v-5z" />
        <path d="M7 4.5c.3.5.3 1.1 0 1.5s-.6 1-.3 1.5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M11 4c.3.5.3 1.1 0 1.5s-.6 1-.3 1.5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M15 4.5c.3.5.3 1.1 0 1.5s-.6 1-.3 1.5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }
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

// Codifica una receta a una cadena Base64 URL-safe comprimida nativamente con Deflate
export const compressRecipe = async (recipe) => {
  const minified = {
    n: recipe.name,
    m: recipe.method,
    cat: recipe.category || undefined,
    c: recipe.coffee_g,
    g: recipe.grind_size,
    t: recipe.water_temp_c,
    s: recipe.steps.map(step => ({
      i: step.title,
      w: step.water_g,
      d: step.duration_s,
      x: step.instruction || ''
    }))
  };

  const jsonStr = JSON.stringify(minified);

  try {
    if (typeof CompressionStream !== 'undefined') {
      const stream = new Blob([jsonStr]).stream();
      const compressedStream = stream.pipeThrough(new CompressionStream('deflate'));
      const response = new Response(compressedStream);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("");
      const base64 = btoa(binString);
      return 'c1_' + base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
  } catch (err) {
    console.warn("Fallo al comprimir nativamente, usando fallback sin compresión:", err);
  }

  // Fallback: URL-safe base64 de JSON minificado
  const bytes = new TextEncoder().encode(jsonStr);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  const base64 = btoa(binString);
  return 'r1_' + base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// Decodifica una receta a partir de una cadena Base64 URL-safe comprimida o cruda
export const decompressRecipe = async (encodedStr) => {
  if (!encodedStr) throw new Error("Cadena vacía");

  const type = encodedStr.substring(0, 3);
  const actualPayload = encodedStr.substring(3);

  let base64 = (type === 'c1_' || type === 'r1_') ? actualPayload : encodedStr;
  base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  let jsonStr;
  try {
    if (type === 'c1_' && typeof DecompressionStream !== 'undefined') {
      const binString = atob(base64);
      const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
      const stream = new Blob([bytes]).stream();
      const decompressedStream = stream.pipeThrough(new DecompressionStream('deflate'));
      const response = new Response(decompressedStream);
      jsonStr = await response.text();
    } else {
      // r1_ o formato directo sin prefijo
      const binString = atob(base64);
      const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
      jsonStr = new TextDecoder().decode(bytes);
    }
  } catch (err) {
    console.error("Error al decodificar receta:", err);
    throw new Error("No se pudo descifrar la receta compartida. Asegúrate de que el enlace esté completo.", { cause: err });
  }

  const minified = JSON.parse(jsonStr);

  if (!minified.n || !minified.s || !Array.isArray(minified.s)) {
    throw new Error("Estructura de receta inválida");
  }

  return {
    name: minified.n,
    method: minified.m || 'V60',
    category: minified.cat || undefined,
    coffee_g: Number(minified.c) || 0,
    grind_size: minified.g || '',
    water_temp_c: Number(minified.t) || 0,
    steps: minified.s.map((step, idx) => ({
      step_number: idx + 1,
      title: step.i || `Paso ${idx + 1}`,
      water_g: Number(step.w) || 0,
      duration_s: Number(step.d) || 0,
      instruction: step.x || ''
    }))
  };
};

// Codifica un grano de café a una cadena Base64 URL-safe comprimida nativamente con Deflate
export const compressBean = async (bean) => {
  const minified = {
    n: bean.name,
    r: bean.roaster || '',
    o: bean.origin || '',
    re: bean.region || '',
    fa: bean.farm || '',
    pr: bean.producer || '',
    hy: bean.harvest_year || '',
    p: bean.process || 'Lavado',
    v: bean.variety || '',
    l: bean.roast_level || 'Medio',
    d: bean.roast_date || '',
    s: bean.sca_score ? parseFloat(bean.sca_score) : null,
    a: bean.altitude || '',
    t: bean.tasting_notes || [],
    x: bean.notes || ''
  };

  const jsonStr = JSON.stringify(minified);

  try {
    if (typeof CompressionStream !== 'undefined') {
      const stream = new Blob([jsonStr]).stream();
      const compressedStream = stream.pipeThrough(new CompressionStream('deflate'));
      const response = new Response(compressedStream);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("");
      const base64 = btoa(binString);
      return 'bc1_' + base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
  } catch (err) {
    console.warn("Fallo al comprimir grano nativamente, usando fallback sin compresión:", err);
  }

  // Fallback: URL-safe base64 de JSON minificado
  const bytes = new TextEncoder().encode(jsonStr);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  const base64 = btoa(binString);
  return 'br1_' + base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// Decodifica un grano de café a partir de una cadena Base64 URL-safe comprimida o cruda
export const decompressBean = async (encodedStr) => {
  if (!encodedStr) throw new Error("Cadena de grano vacía");

  const type = encodedStr.substring(0, 4);
  const actualPayload = encodedStr.substring(4);

  let base64 = (type === 'bc1_' || type === 'br1_') ? actualPayload : encodedStr;
  base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  let jsonStr;
  try {
    if (type === 'bc1_' && typeof DecompressionStream !== 'undefined') {
      const binString = atob(base64);
      const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
      const stream = new Blob([bytes]).stream();
      const decompressedStream = stream.pipeThrough(new DecompressionStream('deflate'));
      const response = new Response(decompressedStream);
      jsonStr = await response.text();
    } else {
      // br1_ o formato directo sin prefijo
      const binString = atob(base64);
      const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
      jsonStr = new TextDecoder().decode(bytes);
    }
  } catch (err) {
    console.error("Error al decodificar grano:", err);
    throw new Error("No se pudo descifrar el grano compartido. Asegúrate de que el enlace esté completo.", { cause: err });
  }

  const minified = JSON.parse(jsonStr);

  if (!minified.n) {
    throw new Error("Estructura de grano de café inválida");
  }

  return {
    name: minified.n,
    roaster: minified.r || '',
    origin: minified.o || '',
    region: minified.re || minified.region || '',
    farm: minified.fa || minified.farm || '',
    producer: minified.pr || minified.producer || '',
    harvest_year: minified.hy || minified.harvest_year || '',
    process: minified.p || 'Lavado',
    variety: minified.v || '',
    roast_level: minified.l || 'Medio',
    roast_date: minified.d || '',
    sca_score: minified.s || '',
    altitude: minified.a || '',
    tasting_notes: minified.t || [],
    notes: minified.x || ''
  };
};

export const formatSecondsToMinutes = (seconds) => {
  const mins = Math.floor((seconds || 0) / 60);
  const secs = (seconds || 0) % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Obtiene el patrón o duración de vibración según el tipo y si es fin de preparación
export const getVibrationPattern = (type = 'normal', isCompletion = false) => {
  if (isCompletion) {
    return type === 'short' ? 200 : type === 'long' ? 800 : 400;
  }
  return type === 'short'
    ? [75, 50, 75]
    : type === 'long'
    ? [300, 150, 300]
    : [150, 100, 150];
};

// Dispara la vibración si está habilitada y es soportada por el navegador
export const triggerVibration = (vibrationEnabled, vibrationType = 'normal', isCompletion = false) => {
  if (vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const pattern = getVibrationPattern(vibrationType, isCompletion);
    navigator.vibrate(pattern);
  }
};


