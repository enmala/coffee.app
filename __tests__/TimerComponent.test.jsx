import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TimerComponent from '../src/components/TimerComponent';
import { playBeep } from '../src/utils/coffeeUtils';

vi.mock('../src/utils/coffeeUtils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    playBeep: vi.fn(),
  };
});

const mockRecipe = {
  id: 'v60-test',
  name: 'V60 Test Recipe',
  method: 'V60',
  coffee_g: 20,
  grind_size: 'Medium',
  water_temp_c: 92,
  steps: [
    { step_number: 1, title: 'Preinfusión', water_g: 50, duration_s: 3, instruction: 'Vierte 50g de agua lentamente.' },
    { step_number: 2, title: 'Segundo Vertido', water_g: 70, duration_s: 5, instruction: 'Vierte hasta 120g.' }
  ]
};

describe('TimerComponent', () => {
  let onCompleteMock;

  beforeEach(() => {
    onCompleteMock = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('renders recipe details and first step initially', () => {
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    
    expect(screen.getByText('V60 Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('V60')).toBeInTheDocument();
    expect(screen.getByText('20g')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('92°C')).toBeInTheDocument();
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('Preinfusión')).toBeInTheDocument();
    expect(screen.getByText('"Vierte 50g de agua lentamente."')).toBeInTheDocument();
    expect(screen.getByText('0:03')).toBeInTheDocument();
  });

  test('navigates steps with skip next and skip prev buttons', () => {
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    
    const nextBtn = screen.getByTitle('Siguiente paso');
    const prevBtn = screen.getByTitle('Paso anterior');
    
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();
    
    // Skip to next
    fireEvent.click(nextBtn);
    expect(screen.getByText('Paso 2 de 2')).toBeInTheDocument();
    expect(screen.getByText('Segundo Vertido')).toBeInTheDocument();
    expect(screen.getByText('0:05')).toBeInTheDocument();
    expect(prevBtn).toBeEnabled();
    expect(nextBtn).toBeDisabled();
    
    // Skip back
    fireEvent.click(prevBtn);
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument();
    expect(prevBtn).toBeDisabled();
  });

  test('toggles timer execution (start/pause) and counts down', () => {
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    
    const actionBtn = screen.getByText('INICIAR');
    
    // Start timer
    fireEvent.click(actionBtn);
    expect(screen.getByText('PAUSAR')).toBeInTheDocument();
    
    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('0:02')).toBeInTheDocument();
    
    // Pause timer
    fireEvent.click(screen.getByText('PAUSAR'));
    expect(screen.getByText('INICIAR')).toBeInTheDocument();
    
    // Advance 1 second while paused (should not change)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('0:02')).toBeInTheDocument();
  });

  test('advances to next step automatically when timer reaches zero', () => {
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    
    fireEvent.click(screen.getByText('INICIAR'));
    
    // Advance 3 seconds to complete step 1
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(screen.getByText('Paso 2 de 2')).toBeInTheDocument();
    expect(screen.getByText('Segundo Vertido')).toBeInTheDocument();
    expect(screen.getByText('0:05')).toBeInTheDocument();
  });

  test('shows completion modal and calls onComplete when all steps finish', () => {
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    
    fireEvent.click(screen.getByText('INICIAR'));
    
    // Advance step 1 duration (3s)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    // Advance step 2 duration (5s)
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(screen.getByText('¡Preparación Completada!')).toBeInTheDocument();
    
    const doneBtn = screen.getByText('Guardar Registro');
    fireEvent.click(doneBtn);
    
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });

  test('resets timer when reset button is clicked', () => {
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    
    fireEvent.click(screen.getByText('INICIAR'));
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('0:01')).toBeInTheDocument();
    
    const resetBtn = screen.getByText('Reiniciar cronómetro');
    fireEvent.click(resetBtn);
    
    expect(screen.getByText('INICIAR')).toBeInTheDocument();
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('0:03')).toBeInTheDocument();
  });

  test('handles case when vibrate and wakeLock are not supported', () => {
    vi.stubGlobal('navigator', {});
    
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    
    fireEvent.click(screen.getByText('INICIAR'));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(screen.getByText('¡Preparación Completada!')).toBeInTheDocument();
    
    vi.unstubAllGlobals();
  });

  test('renders fallback texts for missing grind size and step instruction', () => {
    const poorRecipe = {
      ...mockRecipe,
      grind_size: undefined,
      steps: [
        { step_number: 1, title: 'Preinfusión', water_g: 50, duration_s: 3 }
      ]
    };
    render(<TimerComponent recipe={poorRecipe} onComplete={onCompleteMock} />);
    expect(screen.getByText('N/D')).toBeInTheDocument();
    expect(screen.getByText('"Sin instrucciones adicionales"')).toBeInTheDocument();
  });

  test('handles visibilitychange events', () => {
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    
    fireEvent.click(screen.getByText('INICIAR'));
    
    // Test visible branch
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true
    });
    fireEvent(document, new Event('visibilitychange'));
    expect(navigator.wakeLock.request).toHaveBeenCalled();

    // Test hidden branch
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true
    });
    fireEvent(document, new Event('visibilitychange'));
  });

  test('handles wake lock request failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const originalRequest = navigator.wakeLock.request;
    
    navigator.wakeLock.request = vi.fn().mockRejectedValue(new Error('Wake lock failed'));
    
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    fireEvent.click(screen.getByText('INICIAR'));
    
    await act(async () => {
      await Promise.resolve();
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
    navigator.wakeLock.request = originalRequest;
  });

  test('handleSkipNext does nothing if on last step', () => {
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    const nextBtn = screen.getByTitle('Siguiente paso');
    
    fireEvent.click(nextBtn);
    
    // Remove disabled to test early return branch when on last step
    nextBtn.removeAttribute('disabled');
    fireEvent.click(nextBtn);
    
    expect(screen.getByText('Paso 2 de 2')).toBeInTheDocument();
  });

  test('handleSkipPrev does nothing if on first step', () => {
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    const prevBtn = screen.getByTitle('Paso anterior');
    
    // Remove disabled to test early return branch when on first step
    prevBtn.removeAttribute('disabled');
    fireEvent.click(prevBtn);
    
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument();
  });

  test('handles wake lock release failure', async () => {
    const originalRequest = navigator.wakeLock.request;
    navigator.wakeLock.request = vi.fn().mockResolvedValue({
      release: vi.fn().mockRejectedValue(new Error('Release failed'))
    });

    const { unmount } = render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    
    // Start timer to request wake lock
    fireEvent.click(screen.getByText('INICIAR'));
    
    // Wait for promise resolution and state update
    await act(async () => {
      await Promise.resolve();
    });
    
    // Unmount to release wake lock (which triggers lock.release().catch(() => {}))
    unmount();

    navigator.wakeLock.request = originalRequest;
  });

  test('respects soundEnabled={false} configuration', () => {
    render(
      <TimerComponent 
        recipe={mockRecipe} 
        onComplete={onCompleteMock} 
        soundEnabled={false} 
      />
    );
    
    fireEvent.click(screen.getByText('INICIAR'));
    
    // Advance 3 seconds to complete step 1
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(playBeep).not.toHaveBeenCalled();
  });

  test('respects vibrationEnabled={false} configuration', () => {
    render(
      <TimerComponent 
        recipe={mockRecipe} 
        onComplete={onCompleteMock} 
        vibrationEnabled={false} 
      />
    );
    
    fireEvent.click(screen.getByText('INICIAR'));
    
    // Advance 3 seconds to complete step 1
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });

  test('uses short vibration pattern when vibrationType="short"', () => {
    render(
      <TimerComponent 
        recipe={mockRecipe} 
        onComplete={onCompleteMock} 
        vibrationType="short" 
      />
    );
    
    fireEvent.click(screen.getByText('INICIAR'));
    
    // Advance 3s (completes step 1) -> triggers transition vibration
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(navigator.vibrate).toHaveBeenLastCalledWith([75, 50, 75]);
    
    // Advance 5s (completes recipe) -> triggers completion vibration
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(navigator.vibrate).toHaveBeenLastCalledWith(200);
  });

  test('uses long vibration pattern when vibrationType="long"', () => {
    render(
      <TimerComponent 
        recipe={mockRecipe} 
        onComplete={onCompleteMock} 
        vibrationType="long" 
      />
    );
    
    fireEvent.click(screen.getByText('INICIAR'));
    
    // Advance 3s (completes step 1) -> triggers transition vibration
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(navigator.vibrate).toHaveBeenLastCalledWith([300, 150, 300]);
    
    // Advance 5s (completes recipe) -> triggers completion vibration
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(navigator.vibrate).toHaveBeenLastCalledWith(800);
  });

  test('renders circular progress SVG ring', () => {
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    const svgEl = screen.getByText('Preinfusión').closest('div').parentElement.querySelector('svg');
    expect(svgEl).toBeInTheDocument();
    expect(svgEl).toHaveClass('w-52');
    const circles = svgEl.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
  });

  test('submits rating, notes, and descriptors upon recipe completion', () => {
    render(<TimerComponent recipe={mockRecipe} onComplete={onCompleteMock} />);
    
    fireEvent.click(screen.getByText('INICIAR'));
    
    // Complete steps
    act(() => {
      vi.advanceTimersByTime(3000); // Step 1
    });
    act(() => {
      vi.advanceTimersByTime(5000); // Step 2 -> Completes
    });
    
    expect(screen.getByText('¡Preparación Completada!')).toBeInTheDocument();
    
    // Choose rating star 4
    const starBtn = screen.getByTitle('Puntuar 4 estrellas');
    fireEvent.click(starBtn);
    
    // Toggle descriptors
    const dulceBtn = screen.getByText('Dulce');
    const frutalBtn = screen.getByText('Frutal');
    fireEvent.click(dulceBtn);
    fireEvent.click(frutalBtn);
    
    // Input notes
    const notesTextarea = screen.getByPlaceholderText(/Ej: Quedó con buen dulzor/i);
    fireEvent.change(notesTextarea, { target: { value: 'Deliciosa extracción' } });
    
    // Click submit button
    const doneBtn = screen.getByText('Guardar Registro');
    fireEvent.click(doneBtn);
    
    expect(onCompleteMock).toHaveBeenCalledWith(4, 'Deliciosa extracción', ['Dulce', 'Frutal']);
  });
});
