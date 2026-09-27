import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import RecipeSummaryModal from '../src/components/modals/RecipeSummaryModal';

describe('Dynamic Ratio Calculator in RecipeSummaryModal', () => {
  const mockRecipe = {
    id: 'rec-dynamic-1',
    name: 'V60 Specialty Test',
    method: 'V60',
    category: 'coffee',
    coffee_g: 15,
    water_temp_c: 92,
    grind_size: 'Media',
    steps: [
      { step_number: 1, title: 'Bloom', water_g: 45, duration_s: 30, instruction: 'Preinfusión en espiral' },
      { step_number: 2, title: 'Primer Vertido', water_g: 105, duration_s: 45, instruction: 'Vertido constante' },
      { step_number: 3, title: 'Remover', water_g: 0, duration_s: 15, instruction: 'Giro suave' },
      { step_number: 4, title: 'Segundo Vertido', water_g: 100, duration_s: 45, instruction: 'Centro a bordes' }
    ]
  };

  test('renders initial dose and controls matching recipe default', () => {
    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        onClose={vi.fn()}
        onStartTimer={vi.fn()}
      />
    );

    const input = screen.getByLabelText(/Dosis de café en gramos/i);
    expect(input).toHaveValue(15);
    expect(screen.queryByRole('button', { name: /Restablecer dosis original/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Sugerencia de molienda/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ajuste importante de molienda/i)).not.toBeInTheDocument();
  });

  test('increments dose by 1g on clicking + button and updates steps water', () => {
    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        onClose={vi.fn()}
        onStartTimer={vi.fn()}
      />
    );

    const incrementBtn = screen.getByRole('button', { name: /Aumentar dosis de café/i });
    fireEvent.click(incrementBtn);

    const input = screen.getByLabelText(/Dosis de café en gramos/i);
    expect(input).toHaveValue(16);

    // Reset button should now be visible
    expect(screen.getByRole('button', { name: /Restablecer dosis original/i })).toBeInTheDocument();

    // Scale = 16 / 15
    // Bloom: round(45 * 16 / 15) = 48g
    expect(screen.getByText(/\+48g/)).toBeInTheDocument();
  });

  test('decrements dose by 1g on clicking - button', () => {
    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        onClose={vi.fn()}
        onStartTimer={vi.fn()}
      />
    );

    const decrementBtn = screen.getByRole('button', { name: /Disminuir dosis de café/i });
    fireEvent.click(decrementBtn);

    const input = screen.getByLabelText(/Dosis de café en gramos/i);
    expect(input).toHaveValue(14);
    expect(screen.getByRole('button', { name: /Restablecer dosis original/i })).toBeInTheDocument();
  });

  test('resets dose to original when clicking reset button', () => {
    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        onClose={vi.fn()}
        onStartTimer={vi.fn()}
      />
    );

    const incrementBtn = screen.getByRole('button', { name: /Aumentar dosis de café/i });
    fireEvent.click(incrementBtn);
    fireEvent.click(incrementBtn);
    expect(screen.getByLabelText(/Dosis de café en gramos/i)).toHaveValue(17);

    const resetBtn = screen.getByRole('button', { name: /Restablecer dosis original/i });
    fireEvent.click(resetBtn);

    expect(screen.getByLabelText(/Dosis de café en gramos/i)).toHaveValue(15);
    expect(screen.queryByRole('button', { name: /Restablecer dosis original/i })).not.toBeInTheDocument();
  });

  test('shows grind adjustment banner when dose varies significantly', () => {
    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        onClose={vi.fn()}
        onStartTimer={vi.fn()}
      />
    );

    const input = screen.getByLabelText(/Dosis de café en gramos/i);

    // Moderate increase (+20%: 15 -> 18)
    fireEvent.change(input, { target: { value: '18' } });
    expect(screen.getByText(/Sugerencia de molienda/i)).toBeInTheDocument();
    expect(screen.getByText(/1–2 clics más grueso/i)).toBeInTheDocument();

    // Large increase (+100%: 15 -> 30)
    fireEvent.change(input, { target: { value: '30' } });
    expect(screen.getByText(/Ajuste importante de molienda/i)).toBeInTheDocument();
    expect(screen.getByText(/claramente más grueso/i)).toBeInTheDocument();

    // Decrease (-27%: 15 -> 11)
    fireEvent.change(input, { target: { value: '11' } });
    expect(screen.getByText(/Sugerencia de molienda/i)).toBeInTheDocument();
    expect(screen.getByText(/más fino/i)).toBeInTheDocument();
  });

  test('enforces boundaries (min 5g, max 100g) on blur', () => {
    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        onClose={vi.fn()}
        onStartTimer={vi.fn()}
      />
    );

    const input = screen.getByLabelText(/Dosis de café en gramos/i);

    // Below minimum
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.blur(input);
    expect(input).toHaveValue(5);

    // Above maximum
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.blur(input);
    expect(input).toHaveValue(100);

    // Empty value resets to min on blur
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(input).toHaveValue(5);
  });

  test('passes scaled recipe to onStartTimer when timer button is clicked', () => {
    const handleStartTimer = vi.fn();
    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        onClose={vi.fn()}
        onStartTimer={handleStartTimer}
      />
    );

    const input = screen.getByLabelText(/Dosis de café en gramos/i);
    // Double recipe dose: 15g -> 30g
    fireEvent.change(input, { target: { value: '30' } });

    const startTimerBtn = screen.getByRole('button', { name: /Iniciar Timer/i });
    fireEvent.click(startTimerBtn);

    expect(handleStartTimer).toHaveBeenCalledTimes(1);
    const calledRecipe = handleStartTimer.mock.calls[0][0];

    expect(calledRecipe.coffee_g).toBe(30);
    expect(calledRecipe.is_scaled).toBe(true);
    expect(calledRecipe.original_coffee_g).toBe(15);
    // Steps water scaled x2
    expect(calledRecipe.steps[0].water_g).toBe(90);
    expect(calledRecipe.steps[1].water_g).toBe(210);
    expect(calledRecipe.steps[2].water_g).toBe(0);
    expect(calledRecipe.steps[3].water_g).toBe(200);
  });
});
