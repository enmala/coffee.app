import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../src/App';

describe('Coffee Beans Management Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    window.confirm = vi.fn().mockReturnValue(true);
    window.alert = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('should render the Granos tab and show example bean', () => {
    render(<App />);

    // Click on Granos tab
    const beansTabBtn = screen.getByRole('button', { name: /Granos/ });
    fireEvent.click(beansTabBtn);

    // Verify the example bean Sidamo is displayed
    expect(screen.getByText('Etiopía Sidamo')).toBeInTheDocument();
    expect(screen.getByText('Tostaduría Artesanal')).toBeInTheDocument();
    expect(screen.getByText('📍 Etiopía (Sidama)')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Lavado')).toBeInTheDocument();
    expect(screen.getByText('🔥 Tueste Claro')).toBeInTheDocument();
    expect(screen.getByText('🌱 Heirloom')).toBeInTheDocument();
    expect(screen.getByText('🏔️ 1900 msnm')).toBeInTheDocument();
    expect(screen.getByText('🏆 SCA: 86.5')).toBeInTheDocument();
  });

  test('should register a new coffee bean with technical attributes and tasting notes', () => {
    render(<App />);

    // Click on Granos tab
    const beansTabBtn = screen.getByRole('button', { name: /Granos/ });
    fireEvent.click(beansTabBtn);

    // Click on Add Bean
    const addBeanBtn = screen.getByText('+ Agregar Grano');
    fireEvent.click(addBeanBtn);

    // Fill the form
    fireEvent.change(screen.getByLabelText('Nombre del Grano*'), { target: { value: 'Colombia Supremo' } });
    fireEvent.change(screen.getByLabelText('Tostaduría'), { target: { value: 'Supracafé' } });
    fireEvent.change(screen.getByLabelText('País/Origen'), { target: { value: 'Cauca' } });
    fireEvent.change(screen.getByLabelText('Variedad'), { target: { value: 'Castillo' } });
    fireEvent.change(screen.getByLabelText('Proceso de Beneficio'), { target: { value: 'Natural' } });
    fireEvent.change(screen.getByLabelText('Nivel de Tueste'), { target: { value: 'Medio' } });
    fireEvent.change(screen.getByLabelText('Fecha de Tueste'), { target: { value: '2026-07-01' } });
    fireEvent.change(screen.getByLabelText('Puntuación SCA'), { target: { value: '84.75' } });
    fireEvent.change(screen.getByLabelText('Altitud'), { target: { value: '1750 msnm' } });

    // Add predefined tasting note
    const predefinedBtn = screen.getByText('Cacao');
    fireEvent.click(predefinedBtn);

    // Add custom tasting note
    const customInput = screen.getByPlaceholderText('Agregar nota personalizada...');
    fireEvent.change(customInput, { target: { value: 'Fruta de la pasión' } });
    const addCustomBtn = screen.getByRole('button', { name: '+' });
    fireEvent.click(addCustomBtn);

    // General Notes
    fireEvent.change(screen.getByLabelText('Notas Generales'), { target: { value: 'Perfil dulce y balanceado.' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Guardar Grano' });
    fireEvent.click(submitBtn);

    // Verify alert showed up
    expect(window.alert).toHaveBeenCalledWith('Grano de café guardado correctamente.');

    // Verify new bean is rendered
    expect(screen.getByText('Colombia Supremo')).toBeInTheDocument();
    expect(screen.getByText('Supracafé')).toBeInTheDocument();
    expect(screen.getByText('📍 Cauca')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Natural')).toBeInTheDocument();
    expect(screen.getByText('🔥 Tueste Medio')).toBeInTheDocument();
    expect(screen.getByText('🌱 Castillo')).toBeInTheDocument();
    expect(screen.getByText('🏔️ 1750 msnm')).toBeInTheDocument();
    expect(screen.getByText('🏆 SCA: 84.75')).toBeInTheDocument();
    expect(screen.getByText('Cacao')).toBeInTheDocument();
    expect(screen.getByText('Fruta de la pasión')).toBeInTheDocument();
    expect(screen.getByText('"Perfil dulce y balanceado."')).toBeInTheDocument();
  });

  test('should edit an existing coffee bean', () => {
    render(<App />);

    // Click on Granos tab
    const beansTabBtn = screen.getByRole('button', { name: /Granos/ });
    fireEvent.click(beansTabBtn);

    // Click edit on the example bean
    const editBtn = screen.getByTitle('Editar grano');
    fireEvent.click(editBtn);

    // Modify name
    const nameInput = screen.getByLabelText('Nombre del Grano*');
    fireEvent.change(nameInput, { target: { value: 'Etiopía Sidamo Modificado' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Guardar Grano' });
    fireEvent.click(submitBtn);

    // Verify change
    expect(screen.getByText('Etiopía Sidamo Modificado')).toBeInTheDocument();
    expect(window.alert).toHaveBeenCalledWith('Grano de café actualizado correctamente.');
  });

  test('should delete a coffee bean not in use', () => {
    render(<App />);

    // Click on Granos tab
    const beansTabBtn = screen.getByRole('button', { name: /Granos/ });
    fireEvent.click(beansTabBtn);

    // Click delete
    const deleteBtn = screen.getByTitle('Eliminar grano');
    fireEvent.click(deleteBtn);

    // Verify it is removed
    expect(screen.queryByText('Etiopía Sidamo')).not.toBeInTheDocument();
  });

  test('should associate a bean with a recipe and warn when deleting the bean in use', () => {
    render(<App />);

    // 1. Create a recipe and associate it with example bean
    const addRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(addRecipeBtn);

    fireEvent.change(screen.getByLabelText('Nombre de la receta'), { target: { value: 'V60 con Sidamo' } });
    fireEvent.change(screen.getByLabelText('Grano de Café (Opcional)'), { target: { value: 'bean-example-ethiopia' } });
    
    // Add step to form
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Preinfundir' } });
    fireEvent.change(screen.getByPlaceholderText('Agua (g)'), { target: { value: '50' } });
    fireEvent.change(screen.getByPlaceholderText('Tiempo (s)'), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText('Instrucción corta'), { target: { value: 'Verter agua' } });
    const addStepBtn = screen.getByText('+ Agregar Paso a la lista');
    fireEvent.click(addStepBtn);

    const saveRecipeBtn = screen.getByText('Guardar Receta');
    fireEvent.click(saveRecipeBtn);
    fireEvent.click(screen.getByText('Entendido'));

    // 2. Open recipe summary and verify bean is shown
    const recipeCard = screen.getByText('V60 con Sidamo').closest('.group');
    const summaryBtn = recipeCard.querySelector('[title="Ver Resumen"]');
    fireEvent.click(summaryBtn);
    expect(screen.getByText('Grano de Café')).toBeInTheDocument();
    expect(screen.getByText(/Etiopía Sidamo/)).toBeInTheDocument();
    expect(screen.getByText(/Tostaduría Artesanal/)).toBeInTheDocument();

    // Close summary
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    // 3. Go to Beans tab and try to delete
    const beansTabBtn = screen.getByRole('button', { name: /Granos/ });
    fireEvent.click(beansTabBtn);

    const deleteBtn = screen.getByTitle('Eliminar grano');
    fireEvent.click(deleteBtn);

    // Warning modal should show up
    expect(screen.getByText('Eliminar Grano en Uso')).toBeInTheDocument();
    expect(screen.getByText('V60 con Sidamo')).toBeInTheDocument();

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole('button', { name: 'Sí, Eliminar' });
    fireEvent.click(confirmDeleteBtn);

    // Bean should be gone
    expect(screen.queryByText('Etiopía Sidamo')).not.toBeInTheDocument();

    // 4. Back to recipes tab, open summary and verify bean info is gone
    const recipesTabBtn = screen.getByRole('button', { name: /Recetas/ });
    fireEvent.click(recipesTabBtn);
    const updatedRecipeCard = screen.getByText('V60 con Sidamo').closest('.group');
    const updatedSummaryBtn = updatedRecipeCard.querySelector('[title="Ver Resumen"]');
    fireEvent.click(updatedSummaryBtn);
    expect(screen.queryByText('Grano de Café')).not.toBeInTheDocument();
  });

  test('should create history entry snapshot with bean name and persist even after bean is deleted', () => {
    render(<App />);

    // 1. Create a recipe and associate it with example bean
    const addRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(addRecipeBtn);

    fireEvent.change(screen.getByLabelText('Nombre de la receta'), { target: { value: 'V60 para Historial' } });
    fireEvent.change(screen.getByLabelText('Grano de Café (Opcional)'), { target: { value: 'bean-example-ethiopia' } });
    
    // Add step to form
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Preinfundir' } });
    fireEvent.change(screen.getByPlaceholderText('Agua (g)'), { target: { value: '50' } });
    fireEvent.change(screen.getByPlaceholderText('Tiempo (s)'), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText('Instrucción corta'), { target: { value: 'Verter agua' } });
    const addStepBtn = screen.getByText('+ Agregar Paso a la lista');
    fireEvent.click(addStepBtn);

    const saveRecipeBtn = screen.getByText('Guardar Receta');
    fireEvent.click(saveRecipeBtn);
    fireEvent.click(screen.getByText('Entendido'));

    // 2. Open recipe summary and click "Iniciar Timer"
    const recipeCardHist = screen.getByText('V60 para Historial').closest('.group');
    const summaryBtnHist = recipeCardHist.querySelector('[title="Ver Resumen"]');
    fireEvent.click(summaryBtnHist);
    const startTimerBtn = screen.getByRole('button', { name: 'Iniciar Timer' });
    fireEvent.click(startTimerBtn);

    // 3. Start timer and advance timers
    vi.useFakeTimers();
    fireEvent.click(screen.getByText('Iniciar'));
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // 4. Click Done button inside completion modal
    const doneBtn = screen.getByText('Entendido');
    fireEvent.click(doneBtn);
    vi.useRealTimers();

    // 5. Go to History tab and verify entry exists with bean name
    const historyTabBtn = screen.getByRole('button', { name: /Historial/ });
    fireEvent.click(historyTabBtn);

    expect(screen.getByText('V60 para Historial')).toBeInTheDocument();
    expect(screen.getByText('🫘 Etiopía Sidamo')).toBeInTheDocument();

    // 6. Go to Beans tab and delete the bean
    const beansTabBtn = screen.getByRole('button', { name: /Granos/ });
    fireEvent.click(beansTabBtn);

    const deleteBtn = screen.getByTitle('Eliminar grano');
    fireEvent.click(deleteBtn);

    // Warning modal should show up since it's associated with 'V60 para Historial' recipe
    expect(screen.getByText('Eliminar Grano en Uso')).toBeInTheDocument();
    
    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole('button', { name: 'Sí, Eliminar' });
    fireEvent.click(confirmDeleteBtn);

    // 7. Verify bean is deleted but History entry STILL has the bean name snapshot
    fireEvent.click(historyTabBtn);
    expect(screen.getByText('V60 para Historial')).toBeInTheDocument();
    expect(screen.getByText('🫘 Etiopía Sidamo')).toBeInTheDocument();
  });
});
