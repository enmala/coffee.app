import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import SettingsModal from '../src/components/modals/SettingsModal';

describe('SettingsModal', () => {
  const createProps = (overrides = {}) => ({
    isOpen: true,
    onClose: vi.fn(),
    theme: 'light',
    setTheme: vi.fn(),
    voiceGuidanceEnabled: false,
    setVoiceGuidanceEnabled: vi.fn(),
    soundEnabled: true,
    setSoundEnabled: vi.fn(),
    vibrationEnabled: true,
    setVibrationEnabled: vi.fn(),
    vibrationType: 'normal',
    setVibrationType: vi.fn(),
    onUnifiedImportJson: vi.fn(),
    onImportFromClipboard: vi.fn(),
    ...overrides
  });

  beforeEach(() => {
    document.body.style.overflow = '';
  });

  test('renders an accessible dialog with fixed-priority import actions', () => {
    render(<SettingsModal {...createProps()} />);

    const dialog = screen.getByRole('dialog', { name: 'Configuración' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getAllByRole('button', { name: 'Cerrar configuración' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Archivo JSON' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Portapapeles' })).toBeInTheDocument();
    expect(screen.queryByText('Acerca de la aplicación')).not.toBeInTheDocument();

    const preferences = screen.getByRole('region', { name: 'Preferencias' });
    expect(preferences).toHaveClass('overflow-y-auto', 'touch-pan-y');
    expect(within(preferences).queryByRole('button', { name: 'Archivo JSON' })).not.toBeInTheDocument();
    expect(within(preferences).queryByRole('button', { name: 'Portapapeles' })).not.toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(<SettingsModal {...createProps({ isOpen: false })} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('uses switches for binary preferences and invokes their setters', () => {
    const props = createProps({
      voiceGuidanceEnabled: false,
      soundEnabled: true,
      vibrationEnabled: true
    });
    render(<SettingsModal {...props} />);

    const voiceSwitch = screen.getByRole('switch', { name: 'Modo Manos Libres' });
    const soundSwitch = screen.getByRole('switch', { name: 'Alertas de Sonido' });
    const vibrationSwitch = screen.getByRole('switch', { name: 'Vibración Háptica' });

    expect(voiceSwitch).toHaveAttribute('aria-checked', 'false');
    expect(soundSwitch).toHaveAttribute('aria-checked', 'true');
    expect(vibrationSwitch).toHaveAttribute('aria-checked', 'true');
    expect(soundSwitch.firstElementChild).toHaveClass('left-1', 'translate-x-5');
    expect(voiceSwitch.firstElementChild).toHaveClass('left-1', 'translate-x-0');

    fireEvent.click(voiceSwitch);
    fireEvent.click(soundSwitch);
    fireEvent.click(vibrationSwitch);

    expect(props.setVoiceGuidanceEnabled).toHaveBeenCalledWith(true);
    expect(props.setSoundEnabled).toHaveBeenCalledWith(false);
    expect(props.setVibrationEnabled).toHaveBeenCalledWith(false);
  });

  test('only shows vibration duration while vibration is enabled', () => {
    const props = createProps();
    const { rerender } = render(<SettingsModal {...props} />);

    const duration = screen.getByLabelText('Duración');
    expect(duration).toHaveValue('normal');
    fireEvent.change(duration, { target: { value: 'long' } });
    expect(props.setVibrationType).toHaveBeenCalledWith('long');

    rerender(<SettingsModal {...props} vibrationEnabled={false} />);
    expect(screen.queryByLabelText('Duración')).not.toBeInTheDocument();
  });

  test('preserves theme and import actions', () => {
    const props = createProps();
    render(<SettingsModal {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Oscuro' }));
    expect(props.setTheme).toHaveBeenCalledWith('dark');

    fireEvent.click(screen.getByRole('button', { name: 'Portapapeles' }));
    expect(props.onImportFromClipboard).toHaveBeenCalledTimes(1);

    const file = new File(['{}'], 'recipe.json', { type: 'application/json' });
    fireEvent.change(screen.getByLabelText('Seleccionar archivo JSON para importar'), {
      target: { files: [file] }
    });
    expect(props.onUnifiedImportJson).toHaveBeenCalledTimes(1);
  });

  test('locks page scrolling and closes with Escape', () => {
    const onClose = vi.fn();
    const { unmount } = render(<SettingsModal {...createProps({ onClose })} />);

    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  test('traps focus and restores it to the opener', () => {
    const props = createProps({ isOpen: false });
    const { rerender } = render(
      <>
        <button type="button">Abrir configuración</button>
        <SettingsModal {...props} />
      </>
    );

    const opener = screen.getByRole('button', { name: 'Abrir configuración' });
    opener.focus();
    rerender(
      <>
        <button type="button">Abrir configuración</button>
        <SettingsModal {...props} isOpen />
      </>
    );

    const closeButton = screen.getByRole('button', { name: 'Cerrar configuración' });
    const lastControl = screen.getByRole('button', { name: 'Oscuro' });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(lastControl).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    rerender(
      <>
        <button type="button">Abrir configuración</button>
        <SettingsModal {...props} isOpen={false} />
      </>
    );
    expect(opener).toHaveFocus();
  });
});
