import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import RecipeSummaryModal from '../src/components/modals/RecipeSummaryModal';

describe('RecipeSummaryModal Component Tests', () => {
  const mockRecipe = {
    id: 'rec-1',
    name: 'V60 Specialty Pour Over',
    method: 'V60',
    category: 'coffee',
    coffee_g: 15,
    water_temp_c: 93,
    grind_size: 'Medio-Fina',
    bean_id: 'bean-1',
    steps: [
      { step_number: 1, title: 'Preinfusión', water_g: 50, duration_s: 30, instruction: 'Verter 50g en forma de espiral' },
      { step_number: 2, title: 'Segundo vertido', water_g: 200, duration_s: 90, instruction: '' },
      { step_number: 3, title: 'Goteo final', water_g: 0, duration_s: 30, instruction: 'Esperar a que caiga la última gota' }
    ]
  };

  const mockBeans = [
    {
      id: 'bean-1',
      name: 'Geisha de Panamá',
      roaster: 'Specialty Roasters',
      origin: 'Panamá',
      region: 'Boquete',
      farm: 'Finca La Esmeralda',
      producer: 'Familia Peterson',
      process: 'Natural',
      roast_level: 'Claro',
      variety: 'Geisha',
      altitude: '1800m',
      harvest_year: '2025',
      sca_score: '91.5',
      tasting_notes: ['Jazmín', 'Bergamota', 'Durazno'],
      notes: 'Notas florales excepcionales y acidez sedosa.'
    }
  ];

  test('returns null when summaryRecipe is not provided', () => {
    const { container } = render(<RecipeSummaryModal summaryRecipe={null} beans={mockBeans} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders basic recipe information and total calculated time', () => {
    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        beans={mockBeans}
        onClose={vi.fn()}
        onStartTimer={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
      />
    );

    expect(screen.getByText('V60 Specialty Pour Over')).toBeInTheDocument();
    expect(screen.getByText(/15g/)).toBeInTheDocument();
    expect(screen.getByText(/93°C/)).toBeInTheDocument();
    expect(screen.getByText(/Medio-Fina/)).toBeInTheDocument();
    expect(screen.getByText('2:30')).toBeInTheDocument(); // 30s + 90s + 30s = 150s = 2:30
    expect(screen.getByText('250g')).toBeInTheDocument(); // 50g + 200g
  });

  test('renders linked bean info and toggles expanded technical details', () => {
    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        beans={mockBeans}
        onClose={vi.fn()}
      />
    );

    // Initial bean header should be visible
    expect(screen.getByText(/Geisha de Panamá/)).toBeInTheDocument();
    expect(screen.getByText(/(Specialty Roasters)/)).toBeInTheDocument();

    // Expanded bean details shouldn't be visible before clicking expand button
    expect(screen.queryByText(/Finca La Esmeralda/)).not.toBeInTheDocument();

    // Toggle expand button
    const beanExpandBtn = screen.getByRole('button', { name: /Grano de Café/i });
    fireEvent.click(beanExpandBtn);

    // Verify all technical attributes are rendered
    expect(screen.getByText('📍 Panamá')).toBeInTheDocument();
    expect(screen.getByText(/Boquete/)).toBeInTheDocument();
    expect(screen.getByText('🏡 Finca La Esmeralda')).toBeInTheDocument();
    expect(screen.getByText('🧑‍🌾 Familia Peterson')).toBeInTheDocument();
    expect(screen.getByText(/Natural/)).toBeInTheDocument();
    expect(screen.getByText('🔥 Tueste Claro')).toBeInTheDocument();
    expect(screen.getByText('🌱 Geisha')).toBeInTheDocument();
    expect(screen.getByText(/1800m/)).toBeInTheDocument();
    expect(screen.getByText('🌾 2025')).toBeInTheDocument();
    expect(screen.getByText('🏆 SCA 91.5')).toBeInTheDocument();
    expect(screen.getByText('Jazmín')).toBeInTheDocument();
    expect(screen.getByText('Bergamota')).toBeInTheDocument();
    expect(screen.getByText('Durazno')).toBeInTheDocument();
    expect(screen.getByText('"Notas florales excepcionales y acidez sedosa."')).toBeInTheDocument();

    // Toggle collapse
    fireEvent.click(beanExpandBtn);
    expect(screen.queryByText('🏡 Finca La Esmeralda')).not.toBeInTheDocument();
  });

  test('renders step list correctly including untimed / water-less steps', () => {
    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        beans={[]}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Paso 1: Preinfusión')).toBeInTheDocument();
    expect(screen.getByText(/\+50g/)).toBeInTheDocument();
    expect(screen.getByText(/"Verter 50g en forma de espiral"/)).toBeInTheDocument();

    expect(screen.getByText('Paso 2: Segundo vertido')).toBeInTheDocument();
    expect(screen.getByText(/\+200g/)).toBeInTheDocument();

    expect(screen.getByText('Paso 3: Goteo final')).toBeInTheDocument();
    expect(screen.getByText('Sin agua (30s)')).toBeInTheDocument();
  });

  test('triggers callback functions on button clicks', () => {
    const handleClose = vi.fn();
    const handleStartTimer = vi.fn();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();
    const handleDuplicate = vi.fn();

    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        beans={mockBeans}
        onClose={handleClose}
        onStartTimer={handleStartTimer}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    );

    // Test Delete button
    const deleteBtn = screen.getByTitle('Eliminar receta');
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith(mockRecipe, expect.anything());

    // Test Edit button
    const editBtn = screen.getByRole('button', { name: /Editar/i });
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(mockRecipe);

    // Test Duplicate button
    const duplicateBtn = screen.getByRole('button', { name: /Duplicar/i });
    fireEvent.click(duplicateBtn);
    expect(handleDuplicate).toHaveBeenCalledWith(mockRecipe);

    // Test Start Timer button
    const timerBtn = screen.getByRole('button', { name: /Iniciar Timer/i });
    fireEvent.click(timerBtn);
    expect(handleStartTimer).toHaveBeenCalledWith(mockRecipe);

    // Test Close button
    const closeBtn = screen.getByRole('button', { name: 'Cerrar' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('triggers favorite, share and long title expand callbacks correctly', () => {
    const handleToggleFavorite = vi.fn();
    const handleShare = vi.fn();
    const longRecipe = {
      ...mockRecipe,
      name: 'Super Long Recipe Title That Exceeds Eighteen Characters',
      is_favorite: true
    };

    render(
      <RecipeSummaryModal
        summaryRecipe={longRecipe}
        beans={mockBeans}
        onClose={vi.fn()}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShare}
      />
    );

    // Test favorite button (currently favorite)
    const favoriteBtn = screen.getByTitle('Quitar de favoritas');
    fireEvent.click(favoriteBtn);
    expect(handleToggleFavorite).toHaveBeenCalledWith(longRecipe.id);

    // Test share button
    const shareBtn = screen.getByRole('button', { name: /Compartir receta/i });
    fireEvent.click(shareBtn);
    expect(handleShare).toHaveBeenCalledWith(longRecipe.id);

    // Test long title toggle button
    const expandTitleBtn = screen.getByTitle('Expandir nombre');
    fireEvent.click(expandTitleBtn);
    expect(screen.getByTitle('Contraer nombre')).toBeInTheDocument();
  });

  test('handles recipes with empty or undefined steps gracefully', () => {
    const emptyStepsRecipe = {
      id: 'rec-empty',
      name: 'Empty Steps Recipe',
      method: 'Chemex',
      coffee_g: 20
    };

    render(
      <RecipeSummaryModal
        summaryRecipe={emptyStepsRecipe}
        beans={[]}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Empty Steps Recipe')).toBeInTheDocument();
    expect(screen.getByText('0:00')).toBeInTheDocument();
    expect(screen.getByText('0g')).toBeInTheDocument();
  });

  test('does not render favorite or share buttons when isLibraryPreview is true', () => {
    render(
      <RecipeSummaryModal
        summaryRecipe={mockRecipe}
        beans={[]}
        onClose={vi.fn()}
        isLibraryPreview={true}
      />
    );

    expect(screen.queryByTitle('Marcar como favorita')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Compartir receta')).not.toBeInTheDocument();
  });
});
