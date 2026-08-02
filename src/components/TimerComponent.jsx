import { useState, useEffect } from 'react';
import { playBeep, speakText, getIngredientLabel, getGrindLabel, getRecipeCategory, triggerVibration } from '../utils/coffeeUtils';

export default function TimerComponent({ recipe, onComplete, soundEnabled = true, vibrationEnabled = true, vibrationType = 'normal', voiceGuidanceEnabled = false, beanName, autoStart = false }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(recipe.steps[0].duration_s);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [showFinishedModal, setShowFinishedModal] = useState(false);

  const currentStep = recipe.steps[currentStepIndex];

  const getStepMessage = (step, index) => {
    const instructionText = step.instruction ? `${step.instruction}.` : '';
    if (step.duration_s === 0) {
      return `Paso ${index + 1}: ${step.title}. ${instructionText} Paso manual. Presiona siguiente al completar.`;
    }
    const minutes = Math.floor(step.duration_s / 60);
    const seconds = step.duration_s % 60;
    const durationText = minutes > 0
      ? `${minutes} minutos y ${seconds} segundos`
      : `${seconds} segundos`;
    return `Paso ${index + 1}: ${step.title}. ${instructionText} Tiempo ${durationText}.`;
  };

  useEffect(() => {
    if (!voiceGuidanceEnabled || !isRunning) return;
    speakText(getStepMessage(currentStep, currentStepIndex));
  }, [voiceGuidanceEnabled, isRunning, currentStepIndex, currentStep]);

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

    if (isRunning && currentStep.duration_s > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 1) {
            return prevTime - 1;
          }

          if (soundEnabled) {
            playBeep();
          }

          if (currentStepIndex < recipe.steps.length - 1) {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            triggerVibration(vibrationEnabled, vibrationType, false);
            return recipe.steps[nextIndex].duration_s;
          } else {
            setIsRunning(false);
            triggerVibration(vibrationEnabled, vibrationType, true);
            if (voiceGuidanceEnabled) {
              speakText(getRecipeCategory(recipe) === 'tea' ? '¡Preparación completada! Tu té está listo.' : '¡Preparación completada! Tu café está listo.');
            }
            setShowFinishedModal(true);
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentStepIndex, recipe.steps, soundEnabled, vibrationEnabled, vibrationType, voiceGuidanceEnabled, currentStep.duration_s, recipe]);

  const handleCompleteManualStep = () => {
    if (soundEnabled) {
      playBeep();
    }

    if (currentStepIndex < recipe.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setTimeLeft(recipe.steps[nextIndex].duration_s);
      triggerVibration(vibrationEnabled, vibrationType, false);
    } else {
      setIsRunning(false);
      triggerVibration(vibrationEnabled, vibrationType, true);
      if (voiceGuidanceEnabled) {
        speakText(getRecipeCategory(recipe) === 'tea' ? '¡Preparación completada! Tu té está listo.' : '¡Preparación completada! Tu café está listo.');
      }
      setShowFinishedModal(true);
    }
  };

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
    <div className="space-y-4 text-center">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{recipe.name}</h3>
        <span className="text-xs bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-xs">{recipe.method}</span>
        {beanName && (
          <div className="text-xs text-amber-800 dark:text-amber-300 font-bold mt-1 select-none flex items-center justify-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <ellipse cx="12" cy="6" rx="6" ry="3" />
              <path d="M6 6v6c0 1.7 2.7 3 6 3s6-1.3 6-3V6" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 12v6c0 1.7 2.7 3 6 3s6-1.3 6-3v-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>{beanName}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
        <div>
          <span className="block text-slate-500 dark:text-slate-300 text-[10px] uppercase font-bold">{getIngredientLabel(recipe)}</span>
          <span className="font-semibold text-sm">{recipe.coffee_g}g</span>
        </div>
        <div>
          <span className="block text-slate-500 dark:text-slate-300 text-[10px] uppercase font-bold">{getGrindLabel(recipe)}</span>
          <span className="font-semibold text-sm truncate block">{recipe.grind_size || 'N/D'}</span>
        </div>
        <div>
          <span className="block text-slate-500 dark:text-slate-300 text-[10px] uppercase font-bold">Temp.</span>
          <span className="font-semibold text-sm">{recipe.water_temp_c}°C</span>
        </div>
      </div>

      {/* Progress circular SVG */}
      <div className="relative flex justify-center items-center my-3 md:my-4">
        <svg className="w-44 h-44 transform -rotate-90">
          {/* Circle background */}
          <circle
            cx="88"
            cy="88"
            r="76"
            className="stroke-slate-100 dark:stroke-slate-800/80"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="88"
            cy="88"
            r="76"
            className="stroke-amber-800 dark:stroke-amber-500 transition-all duration-1000 ease-linear"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 76}
            strokeDashoffset={currentStep.duration_s > 0 ? 2 * Math.PI * 76 * (1 - (timeLeft / currentStep.duration_s)) : 0}
            strokeLinecap="round"
          />
        </svg>
        {/* Inner details */}
        <div className="absolute flex flex-col items-center justify-center space-y-1">
          <span className="text-[10px] text-slate-500 dark:text-slate-300 uppercase font-bold tracking-widest max-w-[110px] truncate">
            {currentStep.title}
          </span>
          <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white select-none tracking-tight">
            {currentStep.duration_s > 0 ? formatTime(timeLeft) : 'Manual'}
          </span>
          <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full uppercase">
            Paso {currentStepIndex + 1} de {recipe.steps.length}
          </span>
        </div>
      </div>

      {/* Step instructions and pour guide */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-3.5 text-center">
        <p
          className="text-sm text-slate-600 dark:text-slate-300 min-h-[40px] flex items-center justify-center italic font-medium px-2 leading-relaxed"
          aria-live="polite"
        >
          {currentStep.instruction || 'No hay instrucciones para este paso.'}
        </p>
        
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/10 dark:border-amber-900/20 shadow-sm">
            <span className="text-slate-500 dark:text-slate-300 block text-[10px] uppercase font-bold tracking-wider mb-1">Verter ahora</span>
            <span className="font-extrabold text-amber-800 dark:text-amber-300 text-2xl">+{currentStep.water_g}g</span>
          </div>
          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/10 dark:border-amber-900/20 shadow-sm">
            <span className="text-slate-500 dark:text-slate-300 block text-[10px] uppercase font-bold tracking-wider mb-1">Agua acumulada</span>
            <span className="font-extrabold text-amber-800 dark:text-amber-300 text-2xl">{cumulativeWater}g</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-center items-center gap-4">
          <button 
            type="button"
            onClick={handleSkipPrev} 
            disabled={currentStepIndex === 0}
            className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 disabled:invisible disabled:opacity-0 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:ring-offset-2 rounded-full transition-all"
            title="Paso anterior"
            aria-label="Paso anterior"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M17 5v14L6 12 17 5z" />
              <rect x="4" y="5" width="2" height="14" rx="0.5" />
            </svg>
          </button>
          
          {currentStep.duration_s === 0 ? (
            <button 
              type="button"
              onClick={handleCompleteManualStep}
              className="w-36 py-2.5 rounded-full text-white font-bold shadow-md transition transform active:scale-95 cursor-pointer text-sm bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              aria-label="Completar paso manual"
            >
              {currentStepIndex < recipe.steps.length - 1 ? 'Siguiente Paso' : 'Finalizar'}
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`w-32 py-2.5 rounded-full text-white font-bold shadow-md transition transform active:scale-95 cursor-pointer text-sm ${
                isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800'
              } focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:ring-offset-2`}
              aria-pressed={isRunning}
              aria-label={isRunning ? 'Pausar cronómetro' : 'Iniciar cronómetro'}
            >
              {isRunning ? 'Pausar' : 'Iniciar'}
            </button>
          )}

          <button 
            type="button"
            onClick={handleSkipNext} 
            disabled={currentStepIndex === recipe.steps.length - 1}
            className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 disabled:invisible disabled:opacity-0 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:ring-offset-2 rounded-full transition-all"
            title="Siguiente paso"
            aria-label="Siguiente paso"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7 5v14L18 12 7 5z" />
              <rect x="18" y="5" width="2" height="14" rx="0.5" />
            </svg>
          </button>
        </div>

        <div>
          <button 
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:ring-offset-2 rounded"
            aria-label="Reiniciar cronómetro"
          >
            Reiniciar cronómetro
          </button>
        </div>
      </div>

      {showFinishedModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 md:p-6 shadow-xl border border-slate-100 dark:border-slate-800 text-center space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center text-amber-800 dark:text-amber-500 animate-pulse my-2">
              <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.5 2.5c.3.5.3 1.1 0 1.5s-.6 1-.3 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 2c.3.5.3 1.1 0 1.5s-.6 1-.3 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M15.5 2.5c.3.5.3 1.1 0 1.5s-.6 1-.3 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M5 8h12a1 1 0 0 1 1 1v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9a1 1 0 0 1 1-1z" />
                <path d="M18 10.5h1.5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">¡Preparación Completada!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ¡Buen provecho! {getRecipeCategory(recipe) === 'tea' ? 'Tu té está listo para servir.' : 'Tu café está listo para servir.'}
              </p>
            </div>

            <button 
              type="button"
              onClick={() => {
                setShowFinishedModal(false);
                onComplete();
              }}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shadow-sm cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
