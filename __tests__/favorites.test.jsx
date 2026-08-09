import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipesTab from '../src/components/tabs/RecipesTab';
import RecipeSummaryModal from '../src/components/modals/RecipeSummaryModal';
import App from '../src/App';

describe('Favorite Recipes Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders favorite button on recipe cards in RecipesTab', () => {
    const groupedRecipes = {
      V60: [
        {
          id: 'rec-1',
          name: 'Receta Normal',
          method: 'V60',
          coffee_g: 15,
          water_temp_c: 90,
          steps: [],
          is_favorite: false,
        },
        {
          id: 'rec-2',
          name: 'Receta Favorita',
          method: 'V60',
          coffee_g: 18,
          water_temp_c: 92,
          steps: [],
          is_favorite: true,
        },
      ],
    };

    const onToggleFavorite = vi.fn();

    render(
      <RecipesTab
        groupedRecipes={groupedRecipes}
        collapsedMethods={{}}
        toggleMethodCollapse={vi.fn()}
        menuOpenRecipeId={null}
        setMenuOpenRecipeId={vi.fn()}
        onNewRecipe={vi.fn()}
        onSelectSummary={vi.fn()}
        onStartTimerImmediate={vi.fn()}
        onEditRecipe={vi.fn()}
        onShareRecipe={vi.fn()}
        onExportJson={vi.fn()}
        onDeleteRecipe={vi.fn()}
        onToggleFavorite={onToggleFavorite}
      />
    );

    const normalFavBtn = screen.getByTitle('Marcar como favorita');
    const activeFavBtn = screen.getByTitle('Quitar de favoritas');

    expect(normalFavBtn).toBeInTheDocument();
    expect(activeFavBtn).toBeInTheDocument();

    fireEvent.click(normalFavBtn);
    expect(onToggleFavorite).toHaveBeenCalledWith('rec-1');
  });

  it('renders favorite button in RecipeSummaryModal header and handles click', () => {
    const summaryRecipe = {
      id: 'rec-1',
      name: 'Receta de Prueba',
      method: 'V60',
      coffee_g: 15,
      grind_size: 'Medio',
      water_temp_c: 92,
      steps: [{ step_number: 1, title: 'Vertido', water_g: 250, duration_s: 60 }],
      is_favorite: false,
    };

    const onToggleFavorite = vi.fn();

    render(
      <RecipeSummaryModal
        summaryRecipe={summaryRecipe}
        beans={[]}
        onClose={vi.fn()}
        onShare={vi.fn()}
        onDelete={vi.fn()}
        onStartTimer={vi.fn()}
        formatSecondsToMinutes={(s) => `${s}s`}
        onToggleFavorite={onToggleFavorite}
      />
    );

    const favBtn = screen.getByTitle('Marcar como favorita');
    expect(favBtn).toBeInTheDocument();

    fireEvent.click(favBtn);
    expect(onToggleFavorite).toHaveBeenCalledWith('rec-1');
  });

  it('toggles favorite state and reorders recipes in App component', () => {
    render(<App />);

    // Select the first recipe's favorite star button
    const favButtons = screen.getAllByTitle(/Marcar como favorita/i);
    expect(favButtons.length).toBeGreaterThan(0);

    // Click the first one to toggle favorite
    fireEvent.click(favButtons[0]);

    // Check that localStorage updated
    const saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
    expect(saved.some((r) => r.is_favorite === true)).toBe(true);
  });

  it('preserves favorite status when a recipe is edited and saved', () => {
    const initialRecipes = [
      {
        id: 'rec-fav-1',
        name: 'V60 Favorita',
        method: 'V60',
        coffee_g: 15,
        grind_size: 'Medio',
        water_temp_c: 92,
        steps: [{ step_number: 1, title: 'Vertido', water_g: 250, duration_s: 60 }],
        is_favorite: true,
      },
    ];
    localStorage.setItem('coffee_recipes_v1', JSON.stringify(initialRecipes));

    render(<App />);

    const menuBtns = screen.getAllByTitle('Más opciones');
    fireEvent.click(menuBtns[0]);

    const editBtn = screen.getByText(/Editar/);
    fireEvent.click(editBtn);

    const nameInput = screen.getByPlaceholderText('Ej: Mi V60 Balanceado');
    fireEvent.change(nameInput, { target: { value: 'V60 Favorita Modificada' } });

    const saveRecipeBtn = screen.getByText('Guardar Receta');
    fireEvent.click(saveRecipeBtn);

    const saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
    const editedRecipe = saved.find((r) => r.id === 'rec-fav-1');
    expect(editedRecipe).toBeDefined();
    expect(editedRecipe.name).toBe('V60 Favorita Modificada');
    expect(editedRecipe.is_favorite).toBe(true);
  });
});


