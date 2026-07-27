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
    sessionStorage.clear();
    window.FileReader = FileReaderMock;
    window.confirm = vi.fn().mockReturnValue(true);
    window.alert = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('renders header and initial default recipes', () => {
    render(<App />);
    expect(screen.getByText('Barista Timer')).toBeInTheDocument();
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

  test('opens and closes the About modal from the header', () => {
    render(<App />);

    const aboutBtn = screen.getByTitle('Acerca de');
    fireEvent.click(aboutBtn);

    expect(screen.getByText(/Enrique Maldonado/)).toBeInTheDocument();
    expect(screen.getByText(`v${version}`)).toBeInTheDocument();
    expect(screen.getByText('baristatimer@bitslab.cl')).toBeInTheDocument();
    
    const copyBtn = screen.getByTitle('Copiar correo al portapapeles');
    expect(copyBtn).toBeInTheDocument();
    fireEvent.click(copyBtn);
    expect(screen.getByText('¡Copiado!')).toBeInTheDocument();

    expect(screen.getByText('Repositorio en GitHub')).toBeInTheDocument();
    expect(screen.getByText('Apoya el proyecto en Ko-fi')).toBeInTheDocument();

    const closeBtn = screen.getAllByText('Cerrar').find(btn => btn.tagName === 'BUTTON');
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Enrique Maldonado/)).not.toBeInTheDocument();
  });

  test('hides the Ko-fi donation button when running inside Android TWA context', () => {
    const originalReferrer = document.referrer;
    Object.defineProperty(document, 'referrer', {
      value: 'android-app://com.enmala.baristatimer',
      configurable: true
    });

    render(<App />);

    const aboutBtn = screen.getByTitle('Acerca de');
    fireEvent.click(aboutBtn);

    expect(screen.getByText(/Enrique Maldonado/)).toBeInTheDocument();
    expect(screen.getByText('Repositorio en GitHub')).toBeInTheDocument();
    expect(screen.queryByText('Apoya el proyecto en Ko-fi')).not.toBeInTheDocument();

    Object.defineProperty(document, 'referrer', {
      value: originalReferrer,
      configurable: true
    });
  });

  test('hides the Ko-fi donation button when utm_source=twa query parameter is present', () => {
    vi.stubGlobal('location', new URL('https://localhost/?utm_source=twa'));

    render(<App />);

    const aboutBtn = screen.getByTitle('Acerca de');
    fireEvent.click(aboutBtn);

    expect(screen.queryByText('Apoya el proyecto en Ko-fi')).not.toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  test('switches tabs between Recipes and History', () => {
    render(<App />);
    const recipesTab = screen.getByText('Recetas');
    const historyTab = screen.getByText('Historial');
    
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
    
    // Verify TimerComponent is rendered with manual preparation step
    expect(screen.getByText(/Volver al listado/i)).toBeInTheDocument();
    expect(screen.getByText('Siguiente Paso')).toBeInTheDocument();
  });

  test('creates a new recipe with steps', () => {
    render(<App />);
    const newRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(newRecipeBtn);
    
    // Fill basic details
    fireEvent.change(screen.getByPlaceholderText('Ej: Mi V60 Balanceado'), { target: { value: 'Mi Receta Especial' } });
    fireEvent.change(screen.getByPlaceholderText('Ej: Fina, Media, 15 clicks'), { target: { value: 'Medio' } });
    
    // Add a step
    fireEvent.click(screen.getByText('+ Agregar Paso'));
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Preinfusión' } });
    fireEvent.change(screen.getByPlaceholderText('Agua (g)'), { target: { value: '50' } });
    fireEvent.change(screen.getByPlaceholderText('Tiempo (s)'), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText('Instrucción corta'), { target: { value: 'Vierte suavemente.' } });
    
    const addStepBtn = screen.getByText('+ Agregar Paso a la lista');
    fireEvent.click(addStepBtn);
    
    // Save recipe
    const saveRecipeBtn = screen.getByText('Guardar Receta');
    fireEvent.click(saveRecipeBtn);
    fireEvent.click(screen.getByText('Entendido'));
    
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
    const saveRecipeBtn = screen.getByText('Guardar Receta');
    fireEvent.click(saveRecipeBtn);
    fireEvent.click(screen.getByText('Entendido'));
    
    expect(screen.getByText('Método Modificado')).toBeInTheDocument();
  });

  test('deletes a recipe', () => {
    render(<App />);
    
    // Open menu
    const menuBtns = screen.getAllByTitle('Más opciones');
    fireEvent.click(menuBtns[0]);
    
    const deleteBtn = screen.getByText('🗑️ Eliminar');
    fireEvent.click(deleteBtn);
    
    // Custom confirm modal should show up
    expect(screen.getByText('Eliminar Receta')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /sí, eliminar/i }));
    
    expect(screen.queryByText('Método 4:6 (Tetsu Kasuya)')).not.toBeInTheDocument();
  });

  test('imports a recipe from JSON file', async () => {
    render(<App />);
    fireEvent.click(screen.getByTitle('Configuración'));
    const importInput = screen.getByText('Importar').querySelector('input');
    
    const file = new File(['{}'], 'recipe.json', { type: 'application/json' });
    fireEvent.change(importInput, { target: { files: [file] } });
    
    const confirmBtn = await screen.findByText('Guardar Receta');
    fireEvent.click(confirmBtn);
    
    await waitFor(() => {
      expect(screen.getByText(/Receta importada correctamente/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));
    
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
    vi.useFakeTimers();
    fireEvent.click(startTimerBtn);
    
    // Complete initial manual step 1
    const manualStepBtn = screen.getByRole('button', { name: 'Completar paso manual' });
    fireEvent.click(manualStepBtn);
    
    // Render the TimerComponent, run it immediately to completion
    // The recipe has 5 timed steps of 45s, 45s, 30s, 30s, 30s. Total: 180s.
    
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
    const historyTab = screen.getByText('Historial');
    fireEvent.click(historyTab);
    
    expect(screen.getByText('Método 4:6 (Tetsu Kasuya)')).toBeInTheDocument();
    
    // Edit notes via the placeholder button
    const addNotesBtn = screen.getByText('+ Registrar catación (puntuación y descriptores)');
    fireEvent.click(addNotesBtn);
    
    const notesTextarea = screen.getByPlaceholderText(/Ej: Salió un poco dulce/i);
    fireEvent.change(notesTextarea, { target: { value: 'Delicioso sabor floral!' } });
    
    const saveNotesBtn = screen.getByText('Guardar');
    fireEvent.click(saveNotesBtn);
    
    expect(screen.getByText('"Delicioso sabor floral!"')).toBeInTheDocument();
    
    // Delete entry
    const deleteEntryBtn = screen.getByTitle('Eliminar registro');
    fireEvent.click(deleteEntryBtn);
    
    const confirmBtn = screen.getByRole('button', { name: 'Sí, Eliminar' });
    fireEvent.click(confirmBtn);
    
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
    fireEvent.click(screen.getByText('+ Agregar Paso'));
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step 1' } });
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));
    
    // Add step 2
    fireEvent.click(screen.getByText('+ Agregar Paso'));
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
    fireEvent.click(screen.getByText('Historial'));
    
    // Toggle auto log checkbox
    const autoLogCheckbox = screen.getByLabelText(/Reg. Auto./i);
    fireEvent.click(autoLogCheckbox);
    expect(autoLogCheckbox).not.toBeChecked();
    
    // Click clear all history
    const clearAllBtn = screen.getByText('Limpiar todo');
    fireEvent.click(clearAllBtn);
    
    const confirmBtn = screen.getByRole('button', { name: 'Sí, Limpiar Todo' });
    fireEvent.click(confirmBtn);
    
    expect(screen.queryByText(/Sabor amargo/i)).not.toBeInTheDocument();
  });

  test('closes About modal with header close button', () => {
    render(<App />);
    fireEvent.click(screen.getByTitle('Acerca de'));
    
    // Click top &times; button
    const closeXBtn = screen.getByText('×');
    fireEvent.click(closeXBtn);
    expect(screen.queryByText(/Enrique Maldonado/)).not.toBeInTheDocument();
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
    fireEvent.click(screen.getByText('Historial'));
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
    fireEvent.click(screen.getByTitle('Configuración'));
    const importInput = screen.getByText('Importar').querySelector('input');

    // 1. Missing files
    fireEvent.change(importInput, { target: { files: [] } });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // 2. Invalid JSON structure (missing name)
    class InvalidFileReaderMock {
      readAsText() {
        setTimeout(() => {
          this.onload({ target: { result: JSON.stringify({ wrongField: 'Sin Nombre' }) } });
        }, 10);
      }
    }
    window.FileReader = InvalidFileReaderMock;
    
    const file = new File(['{}'], 'recipe.json', { type: 'application/json' });
    fireEvent.change(importInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText("El archivo JSON debe tener un nombre válido ('name').")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

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
    
    const confirmBtn = await screen.findByText('Guardar Receta');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Receta importada correctamente como "Aeropress Tradicional \(1\)"/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));
  });

  test('recipe form validation edge cases: empty name, no steps', () => {
    render(<App />);
    const newRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(newRecipeBtn);

    // Submit space-filled name to bypass required check but trigger JS validation
    const nameInput = screen.getByPlaceholderText('Ej: Mi V60 Balanceado');
    fireEvent.change(nameInput, { target: { value: ' ' } });

    const saveRecipeBtn = screen.getByText('Guardar Receta');
    fireEvent.click(saveRecipeBtn);
    expect(screen.getByText('Por favor, ingresa el nombre de la receta.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    // Enter name but no steps
    fireEvent.change(screen.getByPlaceholderText('Ej: Mi V60 Balanceado'), { target: { value: 'Nueva Receta Sin Pasos' } });
    fireEvent.click(saveRecipeBtn);
    expect(screen.getByText('Debes agregar al menos un paso de preparación.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));
  });

  test('step movement boundary cases: index 0 up, last index down', () => {
    render(<App />);
    const newRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(newRecipeBtn);

    // Add step 1
    fireEvent.click(screen.getByText('+ Agregar Paso'));
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step 1' } });
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));
    
    // Add step 2
    fireEvent.click(screen.getByText('+ Agregar Paso'));
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
    
    const menuBtns = screen.getAllByTitle('Más opciones');
    fireEvent.click(menuBtns[0]);
    
    const deleteBtn = screen.getByText('🗑️ Eliminar');
    fireEvent.click(deleteBtn);
    
    // Custom confirm modal should show up
    expect(screen.getByText('Eliminar Receta')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    
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
    
    fireEvent.click(screen.getByText('Historial'));
    
    const deleteEntryBtn = screen.getByTitle('Eliminar registro');
    fireEvent.click(deleteEntryBtn);
    
    // Verify custom modal is shown
    expect(screen.getByText('Eliminar Registro')).toBeInTheDocument();
    
    // Click cancel button in custom modal
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);
    
    expect(screen.queryByText('Eliminar Registro')).not.toBeInTheDocument();
    expect(screen.getByText(/Sabor amargo/i)).toBeInTheDocument();
  });

  test('confirm = true deletes history entry successfully', () => {
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
    
    fireEvent.click(screen.getByText('Historial'));
    
    const deleteEntryBtn = screen.getByTitle('Eliminar registro');
    fireEvent.click(deleteEntryBtn);
    
    // Verify custom modal is shown
    expect(screen.getByText('Eliminar Registro')).toBeInTheDocument();
    
    // Click confirm button in custom modal
    const confirmBtn = screen.getByRole('button', { name: 'Sí, Eliminar' });
    fireEvent.click(confirmBtn);
    
    expect(screen.queryByText('Eliminar Registro')).not.toBeInTheDocument();
    expect(screen.queryByText(/Sabor amargo/i)).not.toBeInTheDocument();
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
    
    fireEvent.click(screen.getByText('Historial'));
    
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
    fireEvent.click(screen.getByTitle('Configuración'));
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
    
    const confirmBtn = await screen.findByText('Guardar Receta');
    fireEvent.click(confirmBtn);
    
    await waitFor(() => {
      // It should increment to (2) because (1) is already in the list
      expect(screen.getByText(/Receta importada correctamente como "Aeropress Tradicional \(2\)"/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));
  });

  test('clicks recipe card directly to start timer without summary', () => {
    render(<App />);
    const recipeCard = screen.getByText('Aeropress Tradicional').closest('.group');
    const startDirectlyBtn = recipeCard.querySelector('[title*="Iniciar preparación"]');
    fireEvent.click(startDirectlyBtn);
    
    // Expect TimerComponent is rendered directly
    expect(screen.getByText(/Volver al listado/i)).toBeInTheDocument();
  });

  test('closes recipe menu by clicking outside (click-away listener)', () => {
    render(<App />);
    const menuBtns = screen.getAllByTitle('Más opciones');
    
    // Open menu
    fireEvent.click(menuBtns[0]);
    expect(screen.getByText('✏️ Editar')).toBeInTheDocument();
    
    // Click outside
    fireEvent.click(document.body);
    
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
    fireEvent.click(screen.getByText('Historial'));
    
    const clearAllBtn = screen.getByText('Limpiar todo');
    fireEvent.click(clearAllBtn);
    
    // Verify custom modal is shown
    expect(screen.getByText('Limpiar Historial')).toBeInTheDocument();
    
    // Click Cancelar in custom modal
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);
    
    expect(screen.queryByText('Limpiar Historial')).not.toBeInTheDocument();
    expect(screen.getByText(/Sabor amargo/i)).toBeInTheDocument();
  });

  test('clears history successfully when confirmed', () => {
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
    fireEvent.click(screen.getByText('Historial'));
    
    const clearAllBtn = screen.getByText('Limpiar todo');
    fireEvent.click(clearAllBtn);
    
    // Verify custom modal is shown
    expect(screen.getByText('Limpiar Historial')).toBeInTheDocument();
    
    // Click Sí, Limpiar Todo in custom modal
    const confirmBtn = screen.getByRole('button', { name: 'Sí, Limpiar Todo' });
    fireEvent.click(confirmBtn);
    
    expect(screen.queryByText('Limpiar Historial')).not.toBeInTheDocument();
    expect(screen.queryByText(/Sabor amargo/i)).not.toBeInTheDocument();
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
    fireEvent.click(screen.getByTitle('Configuración'));
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
      expect(screen.getByText("Ocurrió un error al leer el archivo JSON.")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    // Restore reader
    window.FileReader = FileReaderMock;

    // 2. Select step to edit (handleSelectStepToEdit) + Cancel editing + Falsy instruction fallback
    const newRecipeBtn = screen.getByText('+ Nueva Receta');
    fireEvent.click(newRecipeBtn);

    // Fill recipe details
    fireEvent.change(screen.getByPlaceholderText('Ej: Mi V60 Balanceado'), { target: { value: 'Test Recipe' } });

    // Fill step without instruction, add it
    fireEvent.click(screen.getByText('+ Agregar Paso'));
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
    fireEvent.click(screen.getByText('+ Agregar Paso'));
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
    fireEvent.click(screen.getByText('+ Agregar Paso'));
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
    fireEvent.click(screen.getByText('+ Agregar Paso'));
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: '' } });
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));
    expect(screen.getByText("Por favor ingresa un título para el paso.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

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
    fireEvent.click(screen.getByText('Historial'));

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

  test('modifies sound and vibration settings in settings modal and saves to localStorage', () => {
    render(<App />);

    // Open settings modal
    fireEvent.click(screen.getByTitle('Configuración'));
    expect(screen.getByText('Personaliza tu experiencia de preparación')).toBeInTheDocument();

    // Locators for toggles
    const soundToggle = screen.getByText('Alertas de Sonido').parentElement.parentElement.querySelector('button');
    const vibrationToggle = screen.getByText('Vibración Háptica').parentElement.parentElement.querySelector('button');

    // Default values check
    expect(soundToggle).toHaveTextContent('Activado');
    expect(vibrationToggle).toHaveTextContent('Activado');
    expect(screen.getByText('Duración:')).toBeInTheDocument();
    
    const vibrationSelect = screen.getByText('Duración:').parentElement.querySelector('select');
    expect(vibrationSelect).toHaveValue('normal');

    // Click sound toggle -> disable
    fireEvent.click(soundToggle);
    expect(soundToggle).toHaveTextContent('Desactivado');
    expect(localStorage.getItem('coffee_sound_enabled')).toBe('false');

    // Change vibration duration type to 'long'
    fireEvent.change(vibrationSelect, { target: { value: 'long' } });
    expect(localStorage.getItem('coffee_vibration_type')).toBe('long');

    // Click vibration toggle -> disable
    fireEvent.click(vibrationToggle);
    expect(vibrationToggle).toHaveTextContent('Desactivado');
    expect(localStorage.getItem('coffee_vibration_enabled')).toBe('false');
    
    // Select should not be visible anymore
    expect(screen.queryByText('Duración:')).not.toBeInTheDocument();

    // Click sound toggle -> enable
    fireEvent.click(soundToggle);
    expect(soundToggle).toHaveTextContent('Activado');
    expect(localStorage.getItem('coffee_sound_enabled')).toBe('true');

    // Click vibration toggle -> enable
    fireEvent.click(vibrationToggle);
    expect(vibrationToggle).toHaveTextContent('Activado');
    expect(localStorage.getItem('coffee_vibration_enabled')).toBe('true');
    expect(screen.getByText('Duración:')).toBeInTheDocument();

    const vibrationSelectAfter = screen.getByText('Duración:').parentElement.querySelector('select');
    expect(vibrationSelectAfter).toHaveValue('long'); // should keep the saved value
  });

  test('allows editing coffee cup rating and tasting descriptors in the history log', () => {
    localStorage.setItem('coffee_history_v1', JSON.stringify([
      {
        id: 'hist-edit-rating',
        recipeId: 'aeropress-standard',
        recipeName: 'Aeropress Tradicional',
        method: 'Aeropress',
        date: new Date().toISOString(),
        coffee_g: 15,
        water_g: 220,
        grind_size: 'Fine',
        notes: 'Sabor amargo',
        rating: 2,
        descriptors: ['Amargo']
      }
    ]));

    render(<App />);
    
    // Switch to history
    fireEvent.click(screen.getByText('Historial'));
    expect(screen.getByText('Aeropress Tradicional')).toBeInTheDocument();
    
    // Edit notes via the edit pencil button
    const editBtn = screen.getByTitle('Editar observaciones');
    fireEvent.click(editBtn);
    
    // Choose rating star 5
    const starBtn = screen.getByTitle('Puntuar 5 estrellas');
    fireEvent.click(starBtn);
    
    // Toggle descriptors: remove 'Amargo', add 'Dulce' and 'Cuerpo'
    const amargoBtn = screen.getByRole('button', { name: 'Amargo' });
    const dulceBtn = screen.getByRole('button', { name: 'Dulce' });
    const cuerpoBtn = screen.getByRole('button', { name: 'Cuerpo' });
    fireEvent.click(amargoBtn); // Deselect
    fireEvent.click(dulceBtn);  // Select
    fireEvent.click(cuerpoBtn); // Select
    
    // Change notes
    const textarea = screen.getByPlaceholderText(/Ej: Salió un poco dulce/i);
    fireEvent.change(textarea, { target: { value: 'Increíble taza dulce y equilibrada!' } });
    
    // Click Save
    const saveBtn = screen.getByText('Guardar');
    fireEvent.click(saveBtn);
    
    // Verify updated details
    expect(screen.getByText('"Increíble taza dulce y equilibrada!"')).toBeInTheDocument();
    expect(screen.getByText('Dulce')).toBeInTheDocument();
    expect(screen.getByText('Cuerpo')).toBeInTheDocument();
    expect(screen.queryByText('Amargo')).not.toBeInTheDocument();
    
    // Verify changes are written to localStorage
    const savedHistory = JSON.parse(localStorage.getItem('coffee_history_v1'));
    expect(savedHistory[0].rating).toBe(5);
    expect(savedHistory[0].descriptors).toEqual(['Dulce', 'Cuerpo']);
    expect(savedHistory[0].notes).toBe('Increíble taza dulce y equilibrada!');
  });

  test('imports a recipe from URL query parameter on mount', async () => {
    const originalLocation = window.location;
    delete window.location;
    // URL with valid r1_ prefix containing: {"n":"Receta URL","m":"V60","s":[{"i":"Paso 1","w":50,"d":30}]}
    window.location = new URL('http://localhost/?recipe=r1_eyJuIjoiUmVjZXRhIFVSTCIsIm0iOiJWNjAiLCJzIjpbeyJpIjoiUGFzbyAxIiwidyI6NTAsImQiOjMwfV19');
    
    render(<App />);
    
    expect(await screen.findByText('Importar Receta')).toBeInTheDocument();
    expect(screen.getByText('Receta URL')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Importar Receta')).not.toBeInTheDocument();
    
    window.location = originalLocation;
  });

  test('handles popstate browser back navigation correctly', () => {
    render(<App />);

    // 1. Open Settings modal
    const settingsBtn = screen.getByTitle('Configuración');
    fireEvent.click(settingsBtn);
    expect(screen.getByText('Personaliza tu experiencia de preparación')).toBeInTheDocument();

    // 2. Simulate browser Back button via dispatching a popstate event with view: 'main'
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { view: 'main' } }));
    });

    // 3. Settings modal should close
    expect(screen.queryByText('Personaliza tu experiencia de preparación')).not.toBeInTheDocument();

  });

  test('App recipe editor UI/UX improvements (auto-save new step, live totals)', async () => {
    render(<App />);

    // 1. Click "Nueva Receta"
    fireEvent.click(screen.getByText('+ Nueva Receta'));

    // 2. Type recipe name
    fireEvent.change(screen.getByPlaceholderText('Ej: Mi V60 Balanceado'), { target: { value: 'UX Test Recipe' } });

    // 3. Fill the step form
    fireEvent.click(screen.getByText('+ Agregar Paso'));
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Preinfusion' } });
    fireEvent.change(screen.getByPlaceholderText('Agua (g)'), { target: { value: '50' } });
    fireEvent.change(screen.getByPlaceholderText('Tiempo (s)'), { target: { value: '30' } });

    // 4. Click "+ Agregar Paso a la lista"
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));

    // 5. Verify that step is added and totals are displayed
    expect(screen.getByText('1. Preinfusion')).toBeInTheDocument();
    expect(screen.getAllByText(/⏱️ 30s • 💧 50g/)[0]).toBeInTheDocument();

    // 6. Start typing another step (Auto-Save new step test)
    fireEvent.click(screen.getByText('+ Agregar Paso'));
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'First Pour' } });
    fireEvent.change(screen.getByPlaceholderText('Agua (g)'), { target: { value: '150' } });
    fireEvent.change(screen.getByPlaceholderText('Tiempo (s)'), { target: { value: '45' } });

    // 7. Click "Guardar Receta" directly without clicking "+ Agregar Paso a la lista"!
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Receta' }));

    // 8. Verify recipe was saved successfully and editor is closed
    expect(screen.queryByText('Nueva Receta')).not.toBeInTheDocument();
    expect(screen.getByText('UX Test Recipe')).toBeInTheDocument();

    // 9. Click on the recipe card's summary button to open summary
    const recipeCard = screen.getByText('UX Test Recipe').closest('.group');
    const summaryBtn = recipeCard.querySelector('button[title="Ver Resumen"]');
    fireEvent.click(summaryBtn);
    expect(screen.getByText('Tiempo Total Estimado')).toBeInTheDocument();
    
    // Check that BOTH steps are present
    expect(screen.getByText('Paso 1: Preinfusion')).toBeInTheDocument();
    expect(screen.getByText('Paso 2: First Pour')).toBeInTheDocument();

    // Close summary
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  });

  test('App recipe editor auto-saves step edits on recipe save', async () => {
    render(<App />);

    // 1. Click "Nueva Receta"
    fireEvent.click(screen.getByText('+ Nueva Receta'));

    // 2. Type recipe name and add one step
    fireEvent.change(screen.getByPlaceholderText('Ej: Mi V60 Balanceado'), { target: { value: 'UX Edit Test Recipe' } });
    fireEvent.click(screen.getByText('+ Agregar Paso'));
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step A' } });
    fireEvent.change(screen.getByPlaceholderText('Agua (g)'), { target: { value: '50' } });
    fireEvent.change(screen.getByPlaceholderText('Tiempo (s)'), { target: { value: '30' } });
    fireEvent.click(screen.getByText('+ Agregar Paso a la lista'));

    // 3. Click the step to edit it
    fireEvent.click(screen.getByText('1. Step A'));
    expect(screen.getByText('Cancelar edición')).toBeInTheDocument();

    // 4. Modify the step details
    fireEvent.change(screen.getByPlaceholderText('Título del paso'), { target: { value: 'Step A Modificado' } });
    fireEvent.change(screen.getByPlaceholderText('Agua (g)'), { target: { value: '60' } });
    fireEvent.change(screen.getByPlaceholderText('Tiempo (s)'), { target: { value: '40' } });

    // 5. Click "Guardar Receta" directly without clicking "✓ Guardar Cambios en Paso"!
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Receta' }));

    // 6. Verify recipe details show the modified step
    expect(screen.queryByText('Nueva Receta')).not.toBeInTheDocument();
    const recipeCard = screen.getByText('UX Edit Test Recipe').closest('.group');
    const summaryBtn = recipeCard.querySelector('button[title="Ver Resumen"]');
    fireEvent.click(summaryBtn);
    expect(screen.getByText('Tiempo Total Estimado')).toBeInTheDocument();
    expect(screen.getByText('Paso 1: Step A Modificado')).toBeInTheDocument();

    // Close summary
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  });

  test('App recipe duplication from summary modal pre-fills form, saves and returns to recipes list view', async () => {
    render(<App />);

    // 1. Open summary for Aeropress Tradicional
    const recipeCard = screen.getByText('Aeropress Tradicional').closest('.group');
    const summaryBtn = recipeCard.querySelector('button[title="Ver Resumen"]');
    fireEvent.click(summaryBtn);

    // 2. Click '📋 Duplicar' in summary modal
    const duplicateBtn = screen.getByText('📋 Duplicar');
    fireEvent.click(duplicateBtn);

    // 3. Verify form modal opens pre-filled with (Copia) name
    expect(screen.getByDisplayValue('Aeropress Tradicional (Copia)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Medio-Fina')).toBeInTheDocument();

    // 4. Change name to custom variation and save
    fireEvent.change(screen.getByPlaceholderText('Ej: Mi V60 Balanceado'), { target: { value: 'Aeropress Variación Fina' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Receta' }));

    // 5. Verify returned to recipes list view and both recipes exist
    expect(screen.queryByText('Tiempo Total Estimado')).not.toBeInTheDocument();
    expect(screen.getByText('Aeropress Tradicional')).toBeInTheDocument();
    expect(screen.getByText('Aeropress Variación Fina')).toBeInTheDocument();
  });

  test('App recipe duplication cancel restores original recipe summary modal', async () => {
    render(<App />);

    // 1. Open summary for Aeropress Tradicional
    const recipeCard = screen.getByText('Aeropress Tradicional').closest('.group');
    const summaryBtn = recipeCard.querySelector('button[title="Ver Resumen"]');
    fireEvent.click(summaryBtn);

    // 2. Click '📋 Duplicar' in summary modal
    const duplicateBtn = screen.getByText('📋 Duplicar');
    fireEvent.click(duplicateBtn);

    // 3. Click 'Cancelar' in recipe form
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // 4. Verify app returns to Aeropress Tradicional summary modal
    expect(screen.getByText('Tiempo Total Estimado')).toBeInTheDocument();
    const summaryHeading = screen.getByRole('heading', { level: 3, name: 'Aeropress Tradicional' });
    expect(summaryHeading).toBeInTheDocument();
  });

  test('App recipe duplication generates sequential copy names when duplicating from summary modal', async () => {
    render(<App />);

    // 1. Open summary for Aeropress Tradicional
    const recipeCard = screen.getByText('Aeropress Tradicional').closest('.group');
    const summaryBtn = recipeCard.querySelector('button[title="Ver Resumen"]');
    fireEvent.click(summaryBtn);

    // 2. Click "📋 Duplicar" in summary modal
    const duplicateSummaryBtn = screen.getByText('📋 Duplicar');
    fireEvent.click(duplicateSummaryBtn);

    // 3. Save first copy as default "Aeropress Tradicional (Copia)"
    expect(screen.getByDisplayValue('Aeropress Tradicional (Copia)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Receta' }));
    expect(screen.getByText('Aeropress Tradicional (Copia)')).toBeInTheDocument();

    // 4. Duplicate again from the summary of Aeropress Tradicional
    const originalCard = screen.getAllByText('Aeropress Tradicional')[0].closest('.group');
    const summaryBtn2 = originalCard.querySelector('button[title="Ver Resumen"]');
    fireEvent.click(summaryBtn2);
    const duplicateSummaryBtn2 = screen.getByText('📋 Duplicar');
    fireEvent.click(duplicateSummaryBtn2);

    // 5. Verify pre-filled name is "Aeropress Tradicional (Copia 2)"
    expect(screen.getByDisplayValue('Aeropress Tradicional (Copia 2)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Receta' }));
    expect(screen.getByText('Aeropress Tradicional (Copia 2)')).toBeInTheDocument();
  });

  test('expands and collapses long recipe title with chevron button in RecipeSummaryModal', () => {
    render(<App />);

    // Open summary for "Método 4:6 (Tetsu Kasuya)" (26 chars long)
    const card = screen.getByText('Método 4:6 (Tetsu Kasuya)').closest('.group');
    const summaryBtn = card.querySelector('button[title="Ver Resumen"]');
    fireEvent.click(summaryBtn);

    // Chevron toggle should be present
    const expandBtn = screen.getByTitle('Expandir nombre');
    expect(expandBtn).toBeInTheDocument();

    const titleHeader = screen.getByRole('heading', { level: 3, name: 'Método 4:6 (Tetsu Kasuya)' });
    expect(titleHeader).toHaveClass('truncate');

    // Click expand
    fireEvent.click(expandBtn);
    expect(screen.getByTitle('Contraer nombre')).toBeInTheDocument();
    expect(titleHeader).toHaveClass('whitespace-normal');

    // Click collapse
    fireEvent.click(screen.getByTitle('Contraer nombre'));
    expect(screen.getByTitle('Expandir nombre')).toBeInTheDocument();
    expect(titleHeader).toHaveClass('truncate');
  });
});
