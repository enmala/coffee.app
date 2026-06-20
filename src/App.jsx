import { useState, useEffect } from 'react';

// Sonido sintetizado nativo para avisar el cambio de paso
const playBeep = () => {
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

const DEFAULT_RECIPES = [
  {
    id: 'v60-tetsu-kasuya',
    name: 'Método 4:6 (Tetsu Kasuya)',
    method: 'V60',
    coffee_g: 20,
    grind_size: 'Gruesa (Coarse)',
    water_temp_c: 92,
    steps: [
      { step_number: 1, title: 'Preinfusión', water_g: 50, duration_s: 45, instruction: 'Vierte 50g de agua lentamente.' },
      { step_number: 2, title: 'Segundo Vertido', water_g: 70, duration_s: 45, instruction: 'Vierte hasta los 120g de agua acumulados.' },
      { step_number: 3, title: 'Tercer Vertido', water_g: 60, duration_s: 30, instruction: 'Vierte rápidamente hasta llegar a los 180g.' },
      { step_number: 4, title: 'Cuarto Vertido', water_g: 60, duration_s: 30, instruction: 'Vierte hasta alcanzar los 240g.' },
      { step_number: 5, title: 'Quinto Vertido', water_g: 60, duration_s: 30, instruction: 'Último vertido hasta finalizar en 300g.' }
    ]
  },
  {
    id: 'aeropress-standard',
    name: 'Aeropress Tradicional',
    method: 'Aeropress',
    coffee_g: 15,
    grind_size: 'Medio-Fina',
    water_temp_c: 85,
    steps: [
      { step_number: 1, title: 'Llenado y agitación', water_g: 220, duration_s: 10, instruction: 'Vierte todo el agua rápidamente y agita durante 10 segundos.' },
      { step_number: 2, title: 'Reposo', water_g: 0, duration_s: 50, instruction: 'Coloca el émbolo ligeramente para hacer vacío y espera.' },
      { step_number: 3, title: 'Prensado', water_g: 0, duration_s: 30, instruction: 'Presiona el émbolo suavemente hacia abajo durante 30 segundos.' }
    ]
  }
];

export default function App() {
  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem('coffee_recipes_v1');
    return saved ? JSON.parse(saved) : DEFAULT_RECIPES;
  });
  
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [summaryRecipe, setSummaryRecipe] = useState(null);

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    method: 'V60',
    coffee_g: 15,
    grind_size: '',
    water_temp_c: 90,
    steps: []
  });

  const [stepInput, setStepInput] = useState({
    title: '',
    water_g: 0,
    duration_s: 30,
    instruction: ''
  });

  useEffect(() => {
    localStorage.setItem('coffee_recipes_v1', JSON.stringify(recipes));
  }, [recipes]);

  const handleImportJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported.name || !imported.steps || !Array.isArray(imported.steps)) {
          alert("El archivo JSON no tiene una estructura válida de receta.");
          return;
        }
        const updated = {
          ...imported,
          id: imported.id || `imported-${Date.now()}`
        };
        setRecipes((prev) => [...prev, updated]);
        alert("Receta importada correctamente.");
      } catch (err) {
        console.error("Error al leer el archivo JSON:", err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const handleExportJson = (recipe) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recipe, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${recipe.name.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteRecipe = (id, e) => {
    e.stopPropagation(); 
    if (confirm("¿Estás seguro de que deseas eliminar esta receta?")) {
      setRecipes((prev) => prev.filter(r => r.id !== id));
    }
  };

  const handleAddStepToForm = () => {
    if (!stepInput.title.trim()) {
      alert("Por favor ingresa un título para el paso.");
      return;
    }
    setNewRecipe((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          step_number: prev.steps.length + 1,
          title: stepInput.title,
          water_g: Number(stepInput.water_g),
          duration_s: Number(stepInput.duration_s),
          instruction: stepInput.instruction
        }
      ]
    }));
    setStepInput({ title: '', water_g: 0, duration_s: 30, instruction: '' });
  };

  const handleSaveRecipe = (e) => {
    e.preventDefault();
    if (!newRecipe.name.trim()) {
      alert("Por favor, ingresa el nombre de la receta.");
      return;
    }
    if (newRecipe.steps.length === 0) {
      alert("Debes agregar al menos un paso de preparación.");
      return;
    }

    const created = {
      ...newRecipe,
      id: `custom-${Date.now()}`
    };

    setRecipes((prev) => [...prev, created]);
    setIsCreating(false);
    setNewRecipe({
      name: '',
      method: 'V60',
      coffee_g: 15,
      grind_size: '',
      water_temp_c: 90,
      steps: []
    });
  };

  const groupedRecipes = recipes.reduce((groups, recipe) => {
    const method = recipe.method || 'Otros';
    if (!groups[method]) {
      groups[method] = [];
    }
    groups[method].push(recipe);
    return groups;
  }, {});

  const formatSecondsToMinutes = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 font-sans flex flex-col items-center">
      <header className="w-full max-w-md mb-6 text-center mt-4">
        <h1 className="text-3xl font-extrabold text-amber-900 tracking-tight">☕ Barista Timer</h1>
        <p className="text-xs text-slate-500 mt-1">Administra tus recetas y tiempos de extracción</p>
      </header>

      <main className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden p-6 relative">
        {activeRecipe ? (
          <div>
            <button 
              onClick={() => setActiveRecipe(null)} 
              className="mb-4 text-amber-800 hover:text-amber-950 font-semibold text-sm flex items-center gap-1"
            >
              ← Volver al listado
            </button>
            <TimerComponent recipe={activeRecipe} />
          </div>
        ) : isCreating ? (
          <div>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-slate-900">Nueva Receta</h2>
              <button 
                onClick={() => setIsCreating(false)} 
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre de la receta</label>
                <input 
                  type="text" 
                  value={newRecipe.name} 
                  onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" 
                  placeholder="Ej: Mi V60 Balanceado"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Método</label>
                  <select 
                    value={newRecipe.method} 
                    onChange={(e) => setNewRecipe({...newRecipe, method: e.target.value})}
                    className="w-full p-2 border rounded-lg bg-white text-sm focus:outline-none"
                  >
                    <option value="V60">V60</option>
                    <option value="Aeropress">Aeropress</option>
                    <option value="Chemex">Chemex</option>
                    <option value="Moka">Moka</option>
                    <option value="Origami">Origami</option>
                    <option value="Prensa Francesa">Prensa Francesa</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Molienda</label>
                  <input 
                    type="text" 
                    value={newRecipe.grind_size} 
                    onChange={(e) => setNewRecipe({...newRecipe, grind_size: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none" 
                    placeholder="Ej: Fina, Media, 15 clicks"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Café Inicial (g)</label>
                  <input 
                    type="number" 
                    value={newRecipe.coffee_g} 
                    onChange={(e) => setNewRecipe({...newRecipe, coffee_g: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none" 
                    min="1"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Temperatura (°C)</label>
                  <input 
                    type="number" 
                    value={newRecipe.water_temp_c} 
                    onChange={(e) => setNewRecipe({...newRecipe, water_temp_c: parseInt(e.target.value) || 0})}
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none" 
                    min="1"
                  />
                </div>
              </div>

              <div className="border-t pt-3 mt-2">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Pasos Añadidos ({newRecipe.steps.length})</h3>
                {newRecipe.steps.length > 0 && (
                  <ul className="mb-4 bg-slate-50 rounded-lg p-2 divide-y text-xs text-slate-600">
                    {newRecipe.steps.map((s, idx) => (
                      <li key={idx} className="py-1 flex justify-between">
                        <span>{s.step_number}. {s.title} ({s.duration_s}s | {s.water_g}g)</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="bg-amber-50 p-3 rounded-lg space-y-2 border border-amber-100">
                  <span className="text-xs font-bold text-amber-900 block">Formulario de Paso</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Título del paso" 
                      value={stepInput.title}
                      onChange={(e) => setStepInput({...stepInput, title: e.target.value})}
                      className="p-1.5 border rounded bg-white text-xs"
                    />
                    <div className="flex gap-1">
                      <input 
                        type="number" 
                        placeholder="Agua (g)" 
                        value={stepInput.water_g || ''}
                        onChange={(e) => setStepInput({...stepInput, water_g: parseFloat(e.target.value) || 0})}
                        className="w-1/2 p-1.5 border rounded bg-white text-xs"
                      />
                      <input 
                        type="number" 
                        placeholder="Tiempo (s)" 
                        value={stepInput.duration_s || ''}
                        onChange={(e) => setStepInput({...stepInput, duration_s: parseInt(e.target.value) || 0})}
                        className="w-1/2 p-1.5 border rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Instrucción corta" 
                    value={stepInput.instruction}
                    onChange={(e) => setStepInput({...stepInput, instruction: e.target.value})}
                    className="w-full p-1.5 border rounded bg-white text-xs"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddStepToForm}
                    className="w-full py-1.5 bg-amber-800 text-white rounded text-xs font-semibold hover:bg-amber-900"
                  >
                    + Agregar Paso a la lista
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-sm hover:bg-emerald-800 transition shadow-sm"
              >
                Guardar Receta Completa
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-slate-900">Tus Recetas</h2>
              
              <div className="flex gap-2">
                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition flex items-center justify-center border border-slate-200">
                  Importar
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportJson} 
                    className="hidden" 
                  />
                </label>
                <button 
                  onClick={() => setIsCreating(true)}
                  className="px-3 py-1.5 bg-amber-800 hover:bg-amber-950 text-white text-xs font-bold rounded-lg transition"
                >
                  + Nueva Receta
                </button>
              </div>
            </div>

            <div className="space-y-5 max-h-[480px] overflow-y-auto pr-1">
              {Object.keys(groupedRecipes).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No tienes recetas guardadas.</p>
              ) : (
                Object.keys(groupedRecipes).map((method) => (
                  <div key={method} className="space-y-2">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pl-1 pt-1">
                      {method}
                    </h3>
                    
                    <div className="space-y-2">
                      {groupedRecipes[method].map((recipe) => (
                        <div 
                          key={recipe.id}
                          onClick={() => setActiveRecipe(recipe)}
                          className="p-3 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-200 rounded-xl cursor-pointer transition flex justify-between items-center group"
                        >
                          <div className="space-y-1">
                            <span className="font-semibold text-slate-950 text-sm block">{recipe.name}</span>
                            <p className="text-[11px] text-slate-500">
                              {recipe.coffee_g}g • {recipe.grind_size || 'Molienda N/D'} • {recipe.water_temp_c}°C
                            </p>
                            <p className="text-[10px] text-amber-800 font-medium">
                              {recipe.steps.length} pasos • {recipe.steps.reduce((acc, s) => acc + s.water_g, 0)}g agua
                            </p>
                          </div>
                          
                          <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSummaryRecipe(recipe); }}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 font-bold"
                              title="Ver Resumen"
                            >
                              📋
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleExportJson(recipe); }}
                              className="p-1 hover:bg-slate-200 rounded text-slate-500"
                              title="Exportar Receta"
                            >
                              📥
                            </button>
                            <button 
                              onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                              className="p-1 hover:bg-red-50 rounded text-red-500"
                              title="Eliminar Receta"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {summaryRecipe && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto space-y-4">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 pr-4">{summaryRecipe.name}</h3>
                  <span className="inline-block text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-1">{summaryRecipe.method}</span>
                </div>
                <button 
                  onClick={() => setSummaryRecipe(null)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Café Inicial</span>
                  <span className="text-sm font-bold text-slate-800">{summaryRecipe.coffee_g}g</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Molienda</span>
                  <span className="text-sm font-bold text-slate-800 truncate block">{summaryRecipe.grind_size || 'N/D'}</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Temperatura</span>
                  <span className="text-sm font-bold text-slate-800">{summaryRecipe.water_temp_c}°C</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Agua Total</span>
                  <span className="text-sm font-bold text-slate-800">
                    {summaryRecipe.steps.reduce((acc, s) => acc + s.water_g, 0)}g
                  </span>
                </div>
                <div className="col-span-2 mt-2 pt-2 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Tiempo Total Estimado</span>
                  <span className="text-xs font-bold text-slate-800">
                    {formatSecondsToMinutes(summaryRecipe.steps.reduce((acc, s) => acc + s.duration_s, 0))}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pl-1">Pasos</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {summaryRecipe.steps.map((step, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>Paso {step.step_number}: {step.title}</span>
                        <span className="text-amber-800 font-semibold">
                          {step.water_g > 0 ? `+${step.water_g}g` : 'Sin agua'} ({step.duration_s}s)
                        </span>
                      </div>
                      {step.instruction && (
                        <p className="text-slate-500 italic text-[11px]">"{step.instruction}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setSummaryRecipe(null)}
                  className="w-1/2 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs transition"
                >
                  Cerrar
                </button>
                <button 
                  onClick={() => {
                    setActiveRecipe(summaryRecipe);
                    setSummaryRecipe(null);
                  }}
                  className="w-1/2 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-xs transition shadow-sm"
                >
                  Iniciar Timer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TimerComponent({ recipe }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(recipe.steps[0].duration_s);
  const [isRunning, setIsRunning] = useState(false);
  const currentStep = recipe.steps[currentStepIndex];

  useEffect(() => {
    let lock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && !lock) {
          lock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error(`Error requesting wake lock: ${err.name}, ${err.message}`);
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isRunning) {
        await requestWakeLock();
      }
    };

    if (isRunning) {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (lock) {
        lock.release().catch(() => {});
      }
    };
  }, [isRunning]);

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 1) {
            return prevTime - 1;
          }

          playBeep();

          if (currentStepIndex < recipe.steps.length - 1) {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            
            if ('vibrate' in navigator) {
              navigator.vibrate([150, 100, 150]);
            }
            return recipe.steps[nextIndex].duration_s;
          } else {
            setIsRunning(false);
            if ('vibrate' in navigator) {
              navigator.vibrate(400);
            }
            setTimeout(() => {
              alert("¡Extracción finalizada con éxito!");
            }, 100);
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentStepIndex, recipe.steps]);

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStepIndex(0);
    setTimeLeft(recipe.steps[0].duration_s);
  };

  const handleSkipNext = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setTimeLeft(recipe.steps[nextIndex].duration_s);
    }
  };

  const handleSkipPrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setTimeLeft(recipe.steps[prevIndex].duration_s);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cumulativeWater = recipe.steps
    .slice(0, currentStepIndex + 1)
    .reduce((sum, s) => sum + s.water_g, 0);

  return (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-xl font-bold text-slate-900">{recipe.name}</h3>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{recipe.method}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-xs text-slate-600 border border-slate-100">
        <div>
          <span className="block text-slate-400 text-[10px] uppercase font-bold">Café</span>
          <span className="font-semibold text-sm">{recipe.coffee_g}g</span>
        </div>
        <div>
          <span className="block text-slate-400 text-[10px] uppercase font-bold">Molienda</span>
          <span className="font-semibold text-sm truncate block">{recipe.grind_size || 'N/D'}</span>
        </div>
        <div>
          <span className="block text-slate-400 text-[10px] uppercase font-bold">Temp.</span>
          <span className="font-semibold text-sm">{recipe.water_temp_c}°C</span>
        </div>
      </div>

      <div className="border-t border-b border-slate-100 py-4 bg-amber-50/20 rounded-xl px-2">
        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded-full uppercase">
          Paso {currentStepIndex + 1} de {recipe.steps.length}
        </span>
        <h4 className="text-lg font-bold text-slate-800 mt-2">{currentStep.title}</h4>
        <p className="text-base text-slate-600 mt-1 min-h-[48px] px-4 flex items-center justify-center italic">
          "{currentStep.instruction || 'Sin instrucciones adicionales'}"
        </p>
        
        <div className="mt-2 text-xs">
          <span className="text-slate-400">Verter en este paso: </span>
          <span className="font-bold text-amber-900">+{currentStep.water_g}g</span>
        </div>
        <div className="text-sm text-slate-600 mt-1">
          Agua acumulada: <span className="font-bold text-amber-900 text-lg">{cumulativeWater}g</span>
        </div>
      </div>

      <div className="py-2">
        <div className="text-5xl font-mono font-bold text-slate-900 select-none tracking-tight">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-center items-center gap-4">
          <button 
            onClick={handleSkipPrev} 
            disabled={currentStepIndex === 0}
            className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 text-xl"
            title="Paso anterior"
          >
            ⏮️
          </button>
          
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`w-32 py-3 rounded-full text-white font-bold shadow-md transition transform active:scale-95 ${
              isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-800 hover:bg-amber-900'
            }`}
          >
            {isRunning ? 'PAUSAR' : 'INICIAR'}
          </button>

          <button 
            onClick={handleSkipNext} 
            disabled={currentStepIndex === recipe.steps.length - 1}
            className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 text-xl"
            title="Siguiente paso"
          >
            ⏭️
          </button>
        </div>

        <div>
          <button 
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Reiniciar cronómetro
          </button>
        </div>
      </div>
    </div>
  );
}
