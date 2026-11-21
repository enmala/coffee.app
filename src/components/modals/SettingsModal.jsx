import { useEffect, useId, useRef } from 'react';
import { GearIcon, SunIcon, MoonIcon, ClipboardIcon, DocumentTextIcon } from '../icons/SvgIcons';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function SettingsSwitch({ label, enabled, onToggle, description }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 py-2">
      <div className="min-w-0 text-left">
        <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs leading-snug text-slate-500 dark:text-slate-400">
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
          enabled
            ? 'bg-amber-800 dark:bg-amber-600'
            : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  voiceGuidanceEnabled,
  setVoiceGuidanceEnabled,
  soundEnabled,
  setSoundEnabled,
  vibrationEnabled,
  setVibrationEnabled,
  vibrationType,
  setVibrationType,
  onUnifiedImportJson,
  onImportFromClipboard
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableElements = () =>
      Array.from(panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
    focusableElements()[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const elements = focusableElements();
      const first = elements[0];
      const last = elements[elements.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm animate-fade-in dark:bg-slate-950/80 md:p-4"
    >
      <div
        ref={panelRef}
        className="flex h-[92dvh] max-h-[620px] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 md:px-5">
          <div className="min-w-0 text-left">
            <h3
              id={titleId}
              className="flex items-center gap-1.5 text-lg font-bold text-slate-900 dark:text-white"
            >
              <GearIcon className="h-5 w-5 text-amber-800 dark:text-amber-500" aria-hidden="true" />
              Configuración
            </h3>
            <p
              id={descriptionId}
              className="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
            >
              Personaliza tu experiencia de preparación
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar configuración"
            title="Cerrar configuración"
            className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-2xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>

        <section
          aria-labelledby={`${titleId}-import`}
          className="shrink-0 border-b border-slate-200 px-4 py-3 dark:border-slate-800 md:px-5"
        >
          <h4
            id={`${titleId}-import`}
            className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Importar recetas o granos
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-amber-800 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 dark:bg-amber-700 dark:hover:bg-amber-800 dark:focus-visible:ring-offset-slate-900"
              title="Importar desde archivo JSON"
            >
              <DocumentTextIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              Archivo JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={onUnifiedImportJson}
              tabIndex={-1}
              className="hidden"
              aria-label="Seleccionar archivo JSON para importar"
            />
            <button
              type="button"
              onClick={onImportFromClipboard}
              className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:bg-amber-950/40 dark:focus-visible:ring-offset-slate-900"
              title="Importar desde el portapapeles"
            >
              <ClipboardIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              Portapapeles
            </button>
          </div>
        </section>

        <div
          role="region"
          aria-label="Preferencias"
          tabIndex={0}
          className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-600 md:px-5"
        >
          <section aria-labelledby={`${titleId}-preparation`}>
            <h4
              id={`${titleId}-preparation`}
              className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Preparación
            </h4>
            <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
              <SettingsSwitch
                label="Modo Manos Libres"
                description="Narra los pasos mientras corre el temporizador."
                enabled={voiceGuidanceEnabled}
                onToggle={() => setVoiceGuidanceEnabled(!voiceGuidanceEnabled)}
              />
              <SettingsSwitch
                label="Alertas de Sonido"
                enabled={soundEnabled}
                onToggle={() => setSoundEnabled(!soundEnabled)}
              />
              <div>
                <SettingsSwitch
                  label="Vibración Háptica"
                  enabled={vibrationEnabled}
                  onToggle={() => setVibrationEnabled(!vibrationEnabled)}
                />
                {vibrationEnabled && (
                  <div className="flex min-h-11 items-center justify-between gap-3 pb-2 pl-3">
                    <label
                      htmlFor={`${titleId}-vibration-duration`}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400"
                    >
                      Duración
                    </label>
                    <select
                      id={`${titleId}-vibration-duration`}
                      value={vibrationType}
                      onChange={(event) => setVibrationType(event.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="short">Corta</option>
                      <option value="normal">Normal</option>
                      <option value="long">Larga</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section
            aria-labelledby={`${titleId}-application`}
            className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800"
          >
            <h4
              id={`${titleId}-application`}
              className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Aplicación
            </h4>
            <div className="flex min-h-14 items-center justify-between gap-4 py-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tema visual
              </span>
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark'
                  ? <SunIcon className="h-4 w-4" aria-hidden="true" />
                  : <MoonIcon className="h-4 w-4" aria-hidden="true" />}
                {theme === 'dark' ? 'Claro' : 'Oscuro'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
