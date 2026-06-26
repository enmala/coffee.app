import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../src/App';
import { version } from '../package.json';

// Mock FileReader for import JSON tests
class FileReaderMock {
  constructor() {
    this.onload = null;
  }
  readAsText() {
    setTimeout(() => {
      if (this.onload) {
        this.onload({
          target: {
            result: JSON.stringify({
              name: 'Receta Importada',
              method: 'Chemex',
              coffee_g: 15,
              grind_size: 'Medium-Coarse',
              water_temp_c: 93,
              steps: [
                { step_number: 1, title: 'Vertido', water_g: 250, duration_s: 120, instruction: 'Vierte despacio.' }
              ]
            })
          }
        });
      }
    }, 50);
  }
}

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    window.FileReader = FileReaderMock;
    window.confirm = vi.fn().mockReturnValue(true);
    window.alert = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders header and initial default recipes', () => {
    render(<App />);
    expect(screen.getByText('☕ Barista Timer')).toBeInTheDocument();
    expect(screen.getByText('Método 4:6 (Tetsu Kasuya)')).toBeInTheDocument();
    expect(screen.getByText('Aeropress Tradicional')).toBeInTheDocument();
  });

  test('toggles theme between light and dark', () => {
    render(<App />);
    
    // Open settings modal first
    const settingsBtn = screen.getByTitle('Configuración');
    fireEvent.click(settingsBtn);
    
    const themeBtn = screen.queryByTitle('Cambiar a modo claro') || screen.getByTitle('Cambiar a modo oscuro');
    
    // Initially light or dark depending on system preference in setup.js, toggle it:
    const initialTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    fireEvent.click(themeBtn);
    
    const toggledTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    expect(initialTheme).not.toBe(toggledTheme);

    // Toggle it back to cover the other branch path
    fireEvent.click(themeBtn);
    const finalTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    expect(finalTheme).toBe(initialTheme);
  });

  test('opens and closes the About modal', () => {
    render(<App />);
    
    // Open settings modal first
    const settingsBtn = screen.getByTitle('Configuración');
    fireEvent.click(settingsBtn);
    
    // Click About button inside settings
    const aboutBtn = screen.getByText('Ver Acerca de');
    fireEvent.click(aboutBtn);
    
    expect(screen.getByText('EnMalA')).toBeInTheDocument();
    expect(screen.getByText(`v${version}`)).toBeInTheDocument();
    expect(screen.getByText('Repositorio en GitHub')).toBeInTheDocument();
    expect(screen.getByText('Apoya el proyecto en Ko-fi')).toBeInTheDocument();
    
    // Close modal via Close button
    const closeBtn = screen.getAllByText('Cerrar').find(btn => btn.tagName === 'BUTTON');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('EnMalA')).not.toBeInTheDocument();
  });

  test('switches tabs between Recipes and History', () => {
    render(<App />);
    const recipesTab = screen.getByText('📋 Recetas');
    const historyTab = screen.getByText('📜 Historial');
    
    // Switch to history
    fireEvent.click(historyTab);
    expect(screen.getByText(/No tienes preparaciones registradas aún/i)).toBeInTheDocument();
    
    // Switch back to recipes
    fireEvent.click(recipesTab);
    expect(screen.getByText('Método 4:6 (Tetsu Kasuya)')).toBeInTheDocument();
  });

  test('shows recipe summary modal and starts timer', () => {
    render(<App />);
    const summaryBtns = screen.getAllByTitle('Ver Resumen');
    
    // Click summary of the first recipe
    fireEvent.click(summaryBtns[0]);
    expect(screen.getByText('Tiempo Total Estimado')).toBeInTheDocument();
    
    // Start timer from summary
    const startTimerBtn = screen.getByText('Iniciar Timer');
    fireEvent.click(startTimerBtn);
    
    // Verify TimerComponent is rendered
    expect(screen.getByText(/Volver al listado/i)).toBeInTheDocument();
    expect(screen.getByText('INICIAR')).toBeInTheDocument();
  });

  test('creates a new recipe with steps', () => {
    render(<App />);
    const newRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(newRecipeBtn);
    
    // Fill basic details
    fireEvent.change(screen.getByPlaceholderText('Ej: Mi V60 Balanceado'), { target: { value: 'Mi Receta Especial' } });
    fireEvent.change(screen.getByPlaceholderText('Ej: Fina, Media, 15 clicks'), { target: { value: 'Medio' } });
    
    // Add a step
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Preinfusión' } });
    fireEvent.change(screen.getByPlaceholderText('Agua (g)'), { target: { value: '50' } });
    fireEvent.change(screen.getByPlaceholderText('Tiempo (s)'), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText('Instrucción corta'), { target: { value: 'Vierte suavemente.' } });
    
    const addStepBtn = screen.getByText('+ Agregar Paso a la lista');
    fireEvent.click(addStepBtn);
    
    // Save recipe
    const saveRecipeBtn = screen.getByText('Guardar Receta Completa');
    fireEvent.click(saveRecipeBtn);
    
    // Verify recipe is saved
    expect(screen.getByText('Mi Receta Especial')).toBeInTheDocument();
  });

  test('edits an existing recipe', () => {
    render(<App />);
    
    // Open menu option
    const menuBtns = screen.getAllByTitle('Más opciones');
    fireEvent.click(menuBtns[0]);
    
    const editBtn = screen.getByText('✏️ Editar');
    fireEvent.click(editBtn);
    
    // Modify name
    const nameInput = screen.getByPlaceholderText('Ej: Mi V60 Balanceado');
    fireEvent.change(nameInput, { target: { value: 'Método Modificado' } });
    
    // Save
    const saveRecipeBtn = screen.getByText('Guardar Receta Completa');
    fireEvent.click(saveRecipeBtn);
    
    expect(screen.getByText('Método Modificado')).toBeInTheDocument();
  });

  test('deletes a recipe', () => {
    render(<App />);
    
    // Open menu
    const menuBtns = screen.getAllByTitle('Más opciones');
    fireEvent.click(menuBtns[0]);
    
    const deleteBtn = screen.getByText('🗑️ Eliminar');
    fireEvent.click(deleteBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(screen.queryByText('Método 4:6 (Tetsu Kasuya)')).not.toBeInTheDocument();
  });

  test('imports a recipe from JSON file', async () => {
    render(<App />);
    const importInput = screen.getByText('Importar').querySelector('input');
    
    const file = new File(['{}'], 'recipe.json', { type: 'application/json' });
    fireEvent.change(importInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Receta importada correctamente'));
    });
    
    expect(screen.getByText('Receta Importada')).toBeInTheDocument();
  });

  test('exports a recipe', () => {
    render(<App />);
    const menuBtns = screen.getAllByTitle('Más opciones');
    fireEvent.click(menuBtns[0]);
    
    const exportBtn = screen.getByText('📥 Exportar');
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    
    fireEvent.click(exportBtn);
    
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  test('toggles collapsed methods sections', () => {
    render(<App />);
    const headerBtn = screen.getByText(/V60 \(\d+\)/i);
    
    // Toggle collapse
    fireEvent.click(headerBtn);
    // Section header should still be visible but the specific recipe item should be hidden
    expect(screen.queryByText('Método 4:6 (Tetsu Kasuya)')).not.toBeInTheDocument();
    
    // Toggle expand
    fireEvent.click(headerBtn);
    expect(screen.getByText('Método 4:6 (Tetsu Kasuya)')).toBeInTheDocument();
  });

  test('completing a recipe adds entry to history and notes can be edited', async () => {
    render(<App />);
    
    // Open summary and start timer
    const summaryBtns = screen.getAllByTitle('Ver Resumen');
    fireEvent.click(summaryBtns[0]);
    const startTimerBtn = screen.getByText('Iniciar Timer');
    fireEvent.click(startTimerBtn);
    
    // Render the TimerComponent, run it immediately to completion
    // The recipe has 5 steps of 45s, 45s, 30s, 30s, 30s. Total: 180s.
    vi.useFakeTimers();
    fireEvent.click(screen.getByText('INICIAR'));
    
    act(() => {
      vi.advanceTimersByTime(45000);
    });
    act(() => {
      vi.advanceTimersByTime(45000);
    });
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    
    // Done button inside completion modal
    const doneBtn = screen.getByText('Entendido');
    fireEvent.click(doneBtn);
    
    // Switch to history tab to verify entry exists
    vi.useRealTimers();
    const historyTab = screen.getByText('📜 Historial');
    fireEvent.click(historyTab);
    
    expect(screen.getByText('Método 4:6 (Tetsu Kasuya)')).toBeInTheDocument();
    
    // Edit notes via the placeholder button
    const addNotesBtn = screen.getByText('+ Añadir observaciones de la taza');
    fireEvent.click(addNotesBtn);
    
    const notesTextarea = screen.getByPlaceholderText(/Ej: Salió un poco dulce/i);
    fireEvent.change(notesTextarea, { target: { value: 'Delicioso sabor floral!' } });
    
    const saveNotesBtn = screen.getByText('Guardar');
    fireEvent.click(saveNotesBtn);
    
    expect(screen.getByText('"Delicioso sabor floral!"')).toBeInTheDocument();
    
    // Delete entry
    const deleteEntryBtn = screen.getByTitle('Eliminar registro');
    fireEvent.click(deleteEntryBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(screen.queryByText('"Delicioso sabor floral!"')).not.toBeInTheDocument();
  });

  test('cancels recipe creation form', () => {
    render(<App />);
    const newRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(newRecipeBtn);
    
    const cancelBtn = screen.getByText('Cancelar');
    fireEvent.click(cancelBtn);
    
    expect(screen.queryByText('Nueva Receta')).not.toBeInTheDocument();
  });

  test('adds, moves, and deletes steps in recipe form', () => {
    render(<App />);
    const newRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(newRecipeBtn);
    
    // Add step 1
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step 1' } });
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));
    
    // Add step 2
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step 2' } });
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));
    
    // Move step 2 up
    const moveUpBtns = screen.getAllByTitle('Mover arriba');
    fireEvent.click(moveUpBtns[1]); // Step 2 is index 1
    
    // Move step 1 down
    const moveDownBtns = screen.getAllByTitle('Mover abajo');
    fireEvent.click(moveDownBtns[0]);
    
    // Delete step
    const deleteStepBtns = screen.getAllByTitle('Eliminar paso');
    fireEvent.click(deleteStepBtns[0]);
    
    // Cancel form
    fireEvent.click(screen.getByText('Cancelar'));
  });

  test('closes recipe summary modal with close button', () => {
    render(<App />);
    const summaryBtns = screen.getAllByTitle('Ver Resumen');
    fireEvent.click(summaryBtns[0]);
    
    const closeBtn = screen.getAllByText('Cerrar').find(btn => btn.tagName === 'BUTTON');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Tiempo Total Estimado')).not.toBeInTheDocument();
  });

  test('toggles auto log and clears all history', () => {
    localStorage.setItem('coffee_history_v1', JSON.stringify([
      {
        id: 'hist-1',
        recipeId: 'aeropress-standard',
        recipeName: 'Aeropress Tradicional',
        method: 'Aeropress',
        date: new Date().toISOString(),
        coffee_g: 15,
        water_g: 220,
        grind_size: 'Fine',
        notes: 'Sabor amargo'
      }
    ]));
    render(<App />);
    
    // Go to history
    fireEvent.click(screen.getByText('📜 Historial'));
    
    // Toggle auto log checkbox
    const autoLogCheckbox = screen.getByLabelText(/Reg. Auto./i);
    fireEvent.click(autoLogCheckbox);
    expect(autoLogCheckbox).not.toBeChecked();
    
    // Click clear all history
    const clearAllBtn = screen.getByText('Limpiar todo');
    fireEvent.click(clearAllBtn);
    
    expect(screen.queryByText(/Sabor amargo/i)).not.toBeInTheDocument();
  });

  test('closes About modal with header close button', () => {
    render(<App />);
    fireEvent.click(screen.getByTitle('Configuración'));
    fireEvent.click(screen.getByText('Ver Acerca de'));
    
    // Click top &times; button
    const closeXBtn = screen.getByText('×');
    fireEvent.click(closeXBtn);
    expect(screen.queryByText('EnMalA')).not.toBeInTheDocument();
  });

  test('loads initial states from pre-seeded localStorage and media queries', () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('collapsed_methods_v1', JSON.stringify({ V60: true }));
    localStorage.setItem('coffee_history_v1', JSON.stringify([
      {
        id: 'hist-1',
        recipeId: 'aeropress-standard',
        recipeName: 'Aeropress Tradicional',
        method: 'Aeropress',
        date: new Date().toISOString(),
        coffee_g: 15,
        water_g: 220,
        grind_size: 'Fine',
        notes: 'Sabor amargo'
      }
    ]));
    localStorage.setItem('auto_log_enabled', JSON.stringify(false));

    render(<App />);

    // Dark theme should be active
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // V60 section should be collapsed
    expect(screen.queryByText('Método 4:6 (Tetsu Kasuya)')).not.toBeInTheDocument();

    // History tab should have 1 item
    fireEvent.click(screen.getByText('📜 Historial'));
    expect(screen.getByText(/Sabor amargo/i)).toBeInTheDocument();
  });

  test('loads dark theme if no theme saved but system matches dark', () => {
    localStorage.removeItem('theme');
    
    // Temporarily mock matchMedia to return true for dark mode
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: true,
      media: query,
    }));

    render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Restore
    window.matchMedia = originalMatchMedia;
  });

  test('JSON import edge cases: missing files, invalid structure, duplicate name', async () => {
    render(<App />);
    const importInput = screen.getByText('Importar').querySelector('input');

    // 1. Missing files
    fireEvent.change(importInput, { target: { files: [] } });
    expect(window.alert).not.toHaveBeenCalled();

    // 2. Invalid JSON structure (missing steps)
    class InvalidFileReaderMock {
      readAsText() {
        setTimeout(() => {
          this.onload({ target: { result: JSON.stringify({ name: 'Sin Pasos' }) } });
        }, 10);
      }
    }
    window.FileReader = InvalidFileReaderMock;
    
    const file = new File(['{}'], 'recipe.json', { type: 'application/json' });
    fireEvent.change(importInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('El archivo JSON no tiene una estructura válida de receta.');
    });

    // Restore reader
    window.FileReader = FileReaderMock;

    // 3. Duplicate name
    class DuplicateFileReaderMock {
      readAsText() {
        setTimeout(() => {
          this.onload({
            target: {
              result: JSON.stringify({
                name: 'Aeropress Tradicional', // Already exists in DEFAULT_RECIPES
                method: 'Aeropress',
                coffee_g: 15,
                grind_size: 'Fine',
                water_temp_c: 85,
                steps: [{ step_number: 1, title: 'Press', water_g: 220, duration_s: 30 }]
              })
            }
          });
        }, 10);
      }
    }
    window.FileReader = DuplicateFileReaderMock;
    fireEvent.change(importInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Receta importada correctamente como "Aeropress Tradicional (1)"'));
    });
  });

  test('recipe form validation edge cases: empty name, no steps', () => {
    render(<App />);
    const newRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(newRecipeBtn);

    // Submit space-filled name to bypass required check but trigger JS validation
    const nameInput = screen.getByPlaceholderText('Ej: Mi V60 Balanceado');
    fireEvent.change(nameInput, { target: { value: ' ' } });

    const saveRecipeBtn = screen.getByText('Guardar Receta Completa');
    fireEvent.click(saveRecipeBtn);
    expect(window.alert).toHaveBeenCalledWith('Por favor, ingresa el nombre de la receta.');

    // Enter name but no steps
    fireEvent.change(screen.getByPlaceholderText('Ej: Mi V60 Balanceado'), { target: { value: 'Nueva Receta Sin Pasos' } });
    fireEvent.click(saveRecipeBtn);
    expect(window.alert).toHaveBeenCalledWith('Debes agregar al menos un paso de preparación.');
  });

  test('step movement boundary cases: index 0 up, last index down', () => {
    render(<App />);
    const newRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(newRecipeBtn);

    // Add step 1
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step 1' } });
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));
    
    // Add step 2
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step 2' } });
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));

    // Attempt moving step 1 (index 0) up (should do nothing)
    const moveUpBtns = screen.getAllByTitle('Mover arriba');
    fireEvent.click(moveUpBtns[0]); // Step 1 is index 0

    // Attempt moving step 2 (index 1) down (should do nothing)
    const moveDownBtns = screen.getAllByTitle('Mover abajo');
    fireEvent.click(moveDownBtns[1]); // Step 2 is index 1
  });

  test('confirm = false does not delete recipe', () => {
    render(<App />);
    
    // Mock confirm to return false
    window.confirm = vi.fn().mockReturnValue(false);

    const menuBtns = screen.getAllByTitle('Más opciones');
    fireEvent.click(menuBtns[0]);
    
    const deleteBtn = screen.getByText('🗑️ Eliminar');
    fireEvent.click(deleteBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(screen.getByText('Método 4:6 (Tetsu Kasuya)')).toBeInTheDocument();
  });

  test('confirm = false does not delete history entry', () => {
    localStorage.setItem('coffee_history_v1', JSON.stringify([
      {
        id: 'hist-1',
        recipeId: 'aeropress-standard',
        recipeName: 'Aeropress Tradicional',
        method: 'Aeropress',
        date: new Date().toISOString(),
        coffee_g: 15,
        water_g: 220,
        grind_size: 'Fine',
        notes: 'Sabor amargo'
      }
    ]));
    render(<App />);
    
    fireEvent.click(screen.getByText('📜 Historial'));
    
    // Mock confirm to return false
    window.confirm = vi.fn().mockReturnValue(false);

    const deleteEntryBtn = screen.getByTitle('Eliminar registro');
    fireEvent.click(deleteEntryBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(screen.getByText(/Sabor amargo/i)).toBeInTheDocument();
  });

  test('clicks edit notes pencil and cancel notes form', () => {
    localStorage.setItem('coffee_history_v1', JSON.stringify([
      {
        id: 'hist-1',
        recipeId: 'aeropress-standard',
        recipeName: 'Aeropress Tradicional',
        method: 'Aeropress',
        date: new Date().toISOString(),
        coffee_g: 15,
        water_g: 220,
        grind_size: 'Fine',
        notes: 'Sabor amargo'
      }
    ]));
    render(<App />);
    
    fireEvent.click(screen.getByText('📜 Historial'));
    
    // Click edit pencil button
    const editNotesBtn = screen.getByTitle('Editar observaciones');
    fireEvent.click(editNotesBtn);
    
    // Click Cancel in notes form
    const cancelBtn = screen.getByText('Cancelar');
    fireEvent.click(cancelBtn);
    
    expect(screen.queryByText('Guardar')).not.toBeInTheDocument();
  });

  test('closes recipe summary modal with top header close button', () => {
    render(<App />);
    const summaryBtns = screen.getAllByTitle('Ver Resumen');
    fireEvent.click(summaryBtns[0]);
    
    // Click X at the top of the summary modal
    const closeXBtn = screen.getByText('×');
    fireEvent.click(closeXBtn);
    expect(screen.queryByText('Tiempo Total Estimado')).not.toBeInTheDocument();
  });

  test('JSON import duplicate resolution with multiple counters', async () => {
    // Seed duplicate names in localStorage
    localStorage.setItem('coffee_recipes_v1', JSON.stringify([
      {
        id: 'v60-tetsu-kasuya',
        name: 'Método 4:6 (Tetsu Kasuya)',
        method: 'V60',
        coffee_g: 20,
        grind_size: 'Gruesa (Coarse)',
        water_temp_c: 92,
        steps: []
      },
      {
        id: 'dup-1',
        name: 'Aeropress Tradicional',
        method: 'Aeropress',
        coffee_g: 15,
        grind_size: 'Fine',
        water_temp_c: 85,
        steps: []
      },
      {
        id: 'dup-2',
        name: 'Aeropress Tradicional (1)',
        method: 'Aeropress',
        coffee_g: 15,
        grind_size: 'Fine',
        water_temp_c: 85,
        steps: []
      }
    ]));
    
    render(<App />);
    const importInput = screen.getByText('Importar').querySelector('input');

    class MultiDuplicateFileReaderMock {
      readAsText() {
        setTimeout(() => {
          this.onload({
            target: {
              result: JSON.stringify({
                name: 'Aeropress Tradicional',
                method: 'Aeropress',
                coffee_g: 15,
                grind_size: 'Fine',
                water_temp_c: 85,
                steps: [{ step_number: 1, title: 'Press', water_g: 220, duration_s: 30 }]
              })
            }
          });
        }, 10);
      }
    }
    window.FileReader = MultiDuplicateFileReaderMock;
    
    const file = new File(['{}'], 'recipe.json', { type: 'application/json' });
    fireEvent.change(importInput, { target: { files: [file] } });
    
    await waitFor(() => {
      // It should increment to (2) because (1) is already in the list
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Receta importada correctamente como "Aeropress Tradicional (2)"'));
    });
  });

  test('clicks recipe card directly to start timer without summary', () => {
    render(<App />);
    const recipeCard = screen.getByText('Aeropress Tradicional');
    fireEvent.click(recipeCard);
    
    // Expect TimerComponent is rendered directly
    expect(screen.getByText(/Volver al listado/i)).toBeInTheDocument();
  });

  test('closes recipe menu by clicking backdrop overlay', () => {
    render(<App />);
    const menuBtns = screen.getAllByTitle('Más opciones');
    
    // Open menu
    fireEvent.click(menuBtns[0]);
    expect(screen.getByText('✏️ Editar')).toBeInTheDocument();
    
    // Click backdrop (the fixed overlay)
    const backdrop = document.querySelector('.fixed.inset-0.z-10');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop);
    
    // Menu options should be closed
    expect(screen.queryByText('✏️ Editar')).not.toBeInTheDocument();
  });

  test('cancels clearing history when confirm returns false', () => {
    localStorage.setItem('coffee_history_v1', JSON.stringify([
      {
        id: 'hist-1',
        recipeId: 'aeropress-standard',
        recipeName: 'Aeropress Tradicional',
        method: 'Aeropress',
        date: new Date().toISOString(),
        coffee_g: 15,
        water_g: 220,
        grind_size: 'Fine',
        notes: 'Sabor amargo'
      }
    ]));
    render(<App />);
    fireEvent.click(screen.getByText('📜 Historial'));
    
    // Mock confirm as false
    window.confirm = vi.fn().mockReturnValue(false);
    
    const clearAllBtn = screen.getByText('Limpiar todo');
    fireEvent.click(clearAllBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(screen.getByText(/Sabor amargo/i)).toBeInTheDocument();
  });

  test('starts active recipe timer and goes back to list using back button', () => {
    render(<App />);
    const summaryBtns = screen.getAllByTitle('Ver Resumen');
    fireEvent.click(summaryBtns[0]);
    fireEvent.click(screen.getByText('Iniciar Timer'));
    
    // Go back to list
    const backBtn = screen.getByText(/Volver al listado/i);
    fireEvent.click(backBtn);
    
    // Verify we are back to the list
    expect(screen.getByText('Método 4:6 (Tetsu Kasuya)')).toBeInTheDocument();
  });

  test('App additional branch coverage tests', async () => {
    // 1. JSON import invalid file contents error scenario (triggers catch in handleImportJson)
    render(<App />);
    const importInput = screen.getByText('Importar').querySelector('input');
    class InvalidJsonFileReaderMock {
      readAsText() {
        setTimeout(() => {
          this.onload({ target: { result: "invalid-json-string{" } });
        }, 10);
      }
    }
    window.FileReader = InvalidJsonFileReaderMock;
    const file = new File(['invalid'], 'recipe.json', { type: 'application/json' });
    fireEvent.change(importInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Ocurrió un error al leer el archivo JSON.");
    });

    // Restore reader
    window.FileReader = FileReaderMock;

    // 2. Select step to edit (handleSelectStepToEdit) + Cancel editing + Falsy instruction fallback
    const newRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(newRecipeBtn);

    // Fill recipe details
    fireEvent.change(screen.getByPlaceholderText('Ej: Mi V60 Balanceado'), { target: { value: 'Test Recipe' } });

    // Fill step without instruction, add it
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step 1' } });
    fireEvent.change(screen.getByPlaceholderText('Agua (g)'), { target: { value: '50' } });
    fireEvent.change(screen.getByPlaceholderText('Tiempo (s)'), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText('Instrucción corta'), { target: { value: '' } }); // Falsy instruction
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));

    // Click on step title to edit it
    const stepText = screen.getByText('1. Step 1');
    fireEvent.click(stepText);

    // Modify the step title and save it (covers save path)
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step 1 Modificado' } });
    fireEvent.click(screen.getByText('✓ Guardar Cambios en Paso'));

    // Select again and cancel (covers cancel path)
    fireEvent.click(screen.getByText('1. Step 1 Modificado'));
    fireEvent.click(screen.getByText('Cancelar edición'));
    expect(screen.queryByText('Cancelar edición')).not.toBeInTheDocument();

    // 3. Step movement boundary cases (up at index 0, down at last index) by overriding disabled status
    const moveUpBtns = screen.getAllByTitle('Mover arriba');
    moveUpBtns[0].removeAttribute('disabled');
    fireEvent.click(moveUpBtns[0]); // should return immediately

    const moveDownBtns = screen.getAllByTitle('Mover abajo');
    moveDownBtns[0].removeAttribute('disabled');
    fireEvent.click(moveDownBtns[0]); // should return immediately

    // 4. Update editingStepIndex when moving steps (up/down)
    // Add a second step so we can move them
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step 2' } });
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));

    // Scenario A: editing step 0 (Step 1 Modificado), move it down
    fireEvent.click(screen.getByText('1. Step 1 Modificado')); // edit step 0
    fireEvent.click(screen.getAllByTitle('Mover abajo')[0]); // move step 0 down

    // Scenario B: editing step 1, move step 0 (now at index 0) down
    fireEvent.click(screen.getAllByTitle('Mover abajo')[0]); // move step 0 down

    // Exit edit mode before adding new steps
    fireEvent.click(screen.getByText('Cancelar edición'));

    // 5. Deleting steps while editing adjusts editingStepIndex
    // Add third step
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step 3' } });
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));

    // Click to edit step 1 (idx 1)
    fireEvent.click(screen.getByText('2. Step 2')); 
    
    // Delete step 0 (idx 0). editingStepIndex (1) > idx (0) -> decrements editingStepIndex
    fireEvent.click(screen.getAllByTitle('Eliminar paso')[0]);

    // Now edit step 0, and delete it -> cancels editing
    fireEvent.click(screen.getByText('1. Step 2'));
    fireEvent.click(screen.getAllByTitle('Eliminar paso')[0]);

    // 6. Step form validations: empty step title validation alert
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: '' } });
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));
    expect(window.alert).toHaveBeenCalledWith("Por favor ingresa un título para el paso.");

    // 7. Value inputs default to 0 fallback when empty
    fireEvent.change(screen.getByPlaceholderText('Agua (g)'), { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText('Tiempo (s)'), { target: { value: '' } });
    
    const getNumberInputByLabel = (labelPattern) => {
      const label = screen.getByText(labelPattern);
      return label.nextElementSibling;
    };
    fireEvent.change(getNumberInputByLabel(/Temperatura/i), { target: { value: '' } });
    fireEvent.change(getNumberInputByLabel(/Café Inicial/i), { target: { value: '' } });

    // Cancel form
    fireEvent.click(screen.getByText('Cancelar'));
  });

  test('App recipe list and modal branch scenarios', () => {
    // Seed recipe with missing grind_size and a step with 0 water
    const mockRecipe = {
      id: 'custom-recipe',
      name: 'No Grind Size Recipe',
      method: 'Chemex',
      coffee_g: 15,
      // grind_size is undefined
      water_temp_c: 90,
      steps: [
        { step_number: 1, title: 'Blooper', water_g: 0, duration_s: 15, instruction: '' } // 0 water
      ]
    };
    localStorage.setItem('coffee_recipes_v1', JSON.stringify([mockRecipe]));

    render(<App />);

    // Check fallback for grind_size in list: "Molienda N/D"
    expect(screen.getByText(/Molienda N\/D/i)).toBeInTheDocument();

    // Toggle recipe menu twice (first open, then close)
    const menuBtn = screen.getByTitle('Más opciones');
    fireEvent.click(menuBtn);
    expect(screen.getByText('✏️ Editar')).toBeInTheDocument();
    fireEvent.click(menuBtn);
    expect(screen.queryByText('✏️ Editar')).not.toBeInTheDocument();

    // Trigger edit of recipe to hit method / grind_size default logic
    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByText('✏️ Editar'));
    expect(screen.getByPlaceholderText('Ej: Mi V60 Balanceado')).toHaveValue('No Grind Size Recipe');
    
    // Test selecting a different method
    const selectElem = screen.getByText('Chemex').closest('select');
    fireEvent.change(selectElem, { target: { value: 'Hario Switch' } });
    
    fireEvent.click(screen.getByText('Cancelar'));

    // Open summary of the custom recipe
    fireEvent.click(screen.getByTitle('Ver Resumen'));
    
    // Check fallback for grind_size in summary: "N/D"
    expect(screen.getByText('N/D')).toBeInTheDocument();

    // Check step water fallback: "Sin agua"
    expect(screen.getByText(/Sin agua/i)).toBeInTheDocument();

    // Close summary
    fireEvent.click(screen.getByText('Cerrar'));
  });

  test('App no saved recipes screen scenario', () => {
    // Seed empty recipe list
    localStorage.setItem('coffee_recipes_v1', JSON.stringify([]));

    render(<App />);

    // Screen should say "No tienes recetas guardadas."
    expect(screen.getByText('No tienes recetas guardadas.')).toBeInTheDocument();
  });

  test('App history item missing values and editing notes scenarios', () => {
    // Seed history entry with missing grind_size and notes
    localStorage.setItem('coffee_history_v1', JSON.stringify([
      {
        id: 'hist-empty-grind',
        recipeId: 'aeropress-standard',
        recipeName: 'Aeropress Tradicional',
        method: 'Aeropress',
        date: new Date().toISOString(),
        coffee_g: 15,
        water_g: 220,
        // grind_size is undefined
        // notes is undefined
      }
    ]));

    render(<App />);

    // Go to history tab
    fireEvent.click(screen.getByText('📜 Historial'));

    // Verify grind_size fallback: "Molienda N/D"
    expect(screen.getByText(/Molienda N\/D/i)).toBeInTheDocument();

    // Click edit observations (notes) which defaults to empty string
    fireEvent.click(screen.getByTitle('Editar observaciones'));
    expect(screen.getByPlaceholderText(/Ej: Salió un poco dulce/i)).toHaveValue('');
    fireEvent.click(screen.getByText('Cancelar'));
  });

  test('opens and closes the Settings modal', () => {
    render(<App />);
    
    // Settings modal should not be visible initially
    expect(screen.queryByText('Personaliza tu experiencia de preparación')).not.toBeInTheDocument();
    
    // Open settings modal
    fireEvent.click(screen.getByTitle('Configuración'));
    expect(screen.getByText('Personaliza tu experiencia de preparación')).toBeInTheDocument();
    
    // Close settings modal using "Cerrar" button
    const closeBtn = screen.getAllByText('Cerrar').find(btn => btn.tagName === 'BUTTON');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Personaliza tu experiencia de preparación')).not.toBeInTheDocument();

    // Open settings modal again
    fireEvent.click(screen.getByTitle('Configuración'));
    expect(screen.getByText('Personaliza tu experiencia de preparación')).toBeInTheDocument();

    // Close settings modal using header Close (times) button
    const closeXBtn = screen.getByText('×');
    fireEvent.click(closeXBtn);
    expect(screen.queryByText('Personaliza tu experiencia de preparación')).not.toBeInTheDocument();
  });
});
