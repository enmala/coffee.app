import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimerComponent from '../src/components/TimerComponent';
import { getRecipeCategory, getIngredientLabel, getGrindLabel } from '../src/utils/coffeeUtils';
import { DEFAULT_RECIPES } from '../src/constants/defaultData';

vi.mock('../src/utils/coffeeUtils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    playBeep: vi.fn(),
    speakText: vi.fn(),
  };
});

describe('Tea Recipe Support & Untimed Steps', () => {
  test('correctly identifies recipe category and ingredient labels', () => {
    const teaRecipeMatcha = { name: 'Matcha Bowl', method: 'Matcha', category: 'tea' };
    const teaRecipeSencha = { name: 'Sencha Tea', method: 'Sencha' };
    const coffeeRecipeV60 = { name: 'V60 Pour', method: 'V60' };

    expect(getRecipeCategory(teaRecipeMatcha)).toBe('tea');
    expect(getRecipeCategory(teaRecipeSencha)).toBe('tea');
    expect(getRecipeCategory(coffeeRecipeV60)).toBe('coffee');

    expect(getIngredientLabel(teaRecipeMatcha)).toBe('Té / Insumo');
    expect(getIngredientLabel(coffeeRecipeV60)).toBe('Café');

    expect(getGrindLabel(teaRecipeMatcha)).toBe('Presentación');
    expect(getGrindLabel(coffeeRecipeV60)).toBe('Molienda');
  });

  test('includes default tea recipes in DEFAULT_RECIPES', () => {
    const matchaRecipe = DEFAULT_RECIPES.find(r => r.id === 'matcha-tradicional-usucha');
    const senchaRecipe = DEFAULT_RECIPES.find(r => r.id === 'sencha-japones-tradicional');

    expect(matchaRecipe).toBeDefined();
    expect(matchaRecipe.method).toBe('Matcha');
    expect(matchaRecipe.steps[0].duration_s).toBe(0);

    expect(senchaRecipe).toBeDefined();
    expect(senchaRecipe.method).toBe('Sencha');
  });

  test('TimerComponent handles untimed manual steps (duration_s === 0) correctly', () => {
    const onCompleteMock = vi.fn();
    const untimedRecipe = {
      id: 'matcha-test',
      name: 'Matcha Test',
      method: 'Matcha',
      category: 'tea',
      coffee_g: 2,
      grind_size: 'Polvo Fino',
      water_temp_c: 80,
      steps: [
        { step_number: 1, title: 'Tamizar Matcha', water_g: 0, duration_s: 0, instruction: 'Tamizar 2g de matcha' },
        { step_number: 2, title: 'Batir con Chasen', water_g: 70, duration_s: 30, instruction: 'Batir en W' }
      ]
    };

    render(<TimerComponent recipe={untimedRecipe} onComplete={onCompleteMock} />);

    expect(screen.getByText('Matcha Test')).toBeInTheDocument();
    expect(screen.getByText('Té / Insumo')).toBeInTheDocument();
    expect(screen.getByText('Presentación')).toBeInTheDocument();
    expect(screen.getByText('Tamizar Matcha')).toBeInTheDocument();
    expect(screen.getByText('Manual')).toBeInTheDocument();

    const completeBtn = screen.getByRole('button', { name: 'Completar paso manual' });
    expect(completeBtn).toHaveTextContent('Siguiente Paso');

    // Advance to step 2 by clicking complete manual step
    fireEvent.click(completeBtn);

    expect(screen.getByText('Batir con Chasen')).toBeInTheDocument();
    expect(screen.getByText('Paso 2 de 2')).toBeInTheDocument();
    expect(screen.getByText('0:30')).toBeInTheDocument();
  });
});
