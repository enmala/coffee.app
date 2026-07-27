import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../src/App';
import { compressBean } from '../src/utils/coffeeUtils';

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn((canvas, text, options, cb) => {
      if (cb) cb(null);
    })
  }
}));

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
    expect(screen.getByText('📍 Etiopía')).toBeInTheDocument();
    expect(screen.getByText('🗺️ Región: Sidama')).toBeInTheDocument();
    expect(screen.getByText('🏡 Finca: Finca Shantawene')).toBeInTheDocument();
    expect(screen.getByText('🧑‍🌾 Productor: Daye Bensa')).toBeInTheDocument();
    expect(screen.getByText('🌾 Cosecha: 2025')).toBeInTheDocument();
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
    fireEvent.change(screen.getByLabelText('País/Origen'), { target: { value: 'Colombia' } });
    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'Cauca' } });
    fireEvent.change(screen.getByLabelText('Finca'), { target: { value: 'La Esperanza' } });
    fireEvent.change(screen.getByLabelText('Productor'), { target: { value: 'Juan Valdez' } });
    fireEvent.change(screen.getByLabelText('Año de Cosecha'), { target: { value: '2026' } });
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
    expect(screen.getByText('Grano de café guardado correctamente.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    // Verify new bean is rendered
    expect(screen.getByText('Colombia Supremo')).toBeInTheDocument();
    expect(screen.getByText('Supracafé')).toBeInTheDocument();
    expect(screen.getByText('📍 Colombia')).toBeInTheDocument();
    expect(screen.getByText('🗺️ Región: Cauca')).toBeInTheDocument();
    expect(screen.getByText('🏡 Finca: La Esperanza')).toBeInTheDocument();
    expect(screen.getByText('🧑‍🌾 Productor: Juan Valdez')).toBeInTheDocument();
    expect(screen.getByText('🌾 Cosecha: 2026')).toBeInTheDocument();
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
    expect(screen.getByText('Grano de café actualizado correctamente.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));
  });

  test('should delete a coffee bean not in use', () => {
    render(<App />);

    // Click on Granos tab
    const beansTabBtn = screen.getByRole('button', { name: /Granos/ });
    fireEvent.click(beansTabBtn);

    // Click delete
    const deleteBtn = screen.getByTitle('Eliminar grano');
    fireEvent.click(deleteBtn);

    // Verify custom modal is opened and click confirm
    expect(screen.getByText('Eliminar Grano')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sí, Eliminar' }));

    // Dismiss custom success alert modal
    expect(screen.getByText('Grano de café eliminado correctamente.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

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
    fireEvent.click(screen.getByText('+ Agregar Paso'));
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

    // Dismiss custom success alert modal
    expect(screen.getByText('Grano de café eliminado correctamente.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

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
    fireEvent.click(screen.getByText('+ Agregar Paso'));
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
    vi.useFakeTimers();
    fireEvent.click(startTimerBtn);

    // 3. Start timer and advance timers
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

    // Dismiss custom success alert modal
    expect(screen.getByText('Grano de café eliminado correctamente.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    // 7. Verify bean is deleted but History entry STILL has the bean name snapshot
    fireEvent.click(historyTabBtn);
    expect(screen.getByText('V60 para Historial')).toBeInTheDocument();
    expect(screen.getByText('🫘 Etiopía Sidamo')).toBeInTheDocument();
  });

  test('should open Share modal on clicking share button', async () => {
    render(<App />);

    const beansTabBtn = screen.getByRole('button', { name: /Granos/ });
    fireEvent.click(beansTabBtn);

    const shareBtn = screen.getByTitle('Compartir grano');
    fireEvent.click(shareBtn);

    expect(screen.getByText('Compartir Grano')).toBeInTheDocument();
    expect(screen.getByText('Etiopía Sidamo (Tostaduría Artesanal)')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Cerrar modal');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Compartir Grano')).not.toBeInTheDocument();
  });

  test('should parse bean URL parameter and import bean successfully', async () => {
    const newBeanToImport = {
      name: 'Imported Geisha',
      roaster: 'Panama Farms',
      origin: 'Boquete',
      process: 'Natural',
      variety: 'Geisha',
      roast_level: 'Claro',
      roast_date: '2026-07-05',
      sca_score: 89.5,
      altitude: '1700m',
      tasting_notes: ['Jazmín', 'Bergamota'],
      notes: 'Super dulce'
    };

    const compressed = await compressBean(newBeanToImport);

    const originalLocation = window.location;
    delete window.location;
    window.location = new URL(`http://localhost/?bean=${compressed}`);

    render(<App />);

    expect(await screen.findByText('Importar Grano de Café')).toBeInTheDocument();
    expect(screen.getByText('Imported Geisha')).toBeInTheDocument();
    expect(screen.getByText('Tostador: Panama Farms')).toBeInTheDocument();
    expect(screen.getByText('📍 Boquete')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Natural')).toBeInTheDocument();
    expect(screen.getByText('🏆 89.5')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Guardar Grano' });
    fireEvent.click(confirmBtn);

    expect(screen.getByText('Grano de café importado correctamente como "Imported Geisha".')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    expect(screen.getByText('Imported Geisha')).toBeInTheDocument();
    expect(screen.getByText('Panama Farms')).toBeInTheDocument();

    window.location = originalLocation;
  });

  test('should import a bean from local JSON file using the Import button', async () => {
    class ValidBeanFileReaderMock {
      constructor() {
        this.onload = null;
      }
      readAsText() {
        setTimeout(() => {
          if (this.onload) {
            this.onload({
              target: {
                result: JSON.stringify({
                  name: 'Grano JSON Importado',
                  roaster: 'Tostaduría Local',
                  origin: 'Ecuador',
                  process: 'Lavado',
                  variety: 'Typica',
                  roast_level: 'Medio',
                  roast_date: '2026-07-15',
                  sca_score: 85.5,
                  altitude: '1500m',
                  tasting_notes: ['Caramelo', 'Manzana'],
                  notes: 'Sabor residual largo.'
                })
              }
            });
          }
        }, 20);
      }
    }

    const originalFileReader = window.FileReader;
    window.FileReader = ValidBeanFileReaderMock;

    render(<App />);

    // Open settings modal to access unified import button
    fireEvent.click(screen.getByTitle('Configuración'));

    const importLabel = screen.getByText('Importar');
    expect(importLabel).toBeInTheDocument();

    const fileInput = importLabel.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    const dummyFile = new File(['{}'], 'grano.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [dummyFile] } });

    expect(await screen.findByText('Importar Grano de Café')).toBeInTheDocument();
    expect(screen.getByText('Grano JSON Importado')).toBeInTheDocument();
    expect(screen.getByText('Tostador: Tostaduría Local')).toBeInTheDocument();
    expect(screen.getByText('📍 Ecuador')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Guardar Grano' });
    fireEvent.click(confirmBtn);

    expect(await screen.findByText('Grano de café importado correctamente como "Grano JSON Importado".')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    expect(screen.getByText('Grano JSON Importado')).toBeInTheDocument();

    window.FileReader = originalFileReader;
  });

  test('should show error when importing an invalid bean JSON file', async () => {
    class InvalidBeanFileReaderMock {
      constructor() {
        this.onload = null;
      }
      readAsText() {
        setTimeout(() => {
          if (this.onload) {
            this.onload({
              target: {
                result: JSON.stringify({
                  roaster: 'Tostaduría Local'
                })
              }
            });
          }
        }, 20);
      }
    }

    const originalFileReader = window.FileReader;
    window.FileReader = InvalidBeanFileReaderMock;

    render(<App />);

    // Open settings modal to access unified import button
    fireEvent.click(screen.getByTitle('Configuración'));

    const importLabel = screen.getByText('Importar');
    const fileInput = importLabel.querySelector('input[type="file"]');

    const dummyFile = new File(['{}'], 'invalid.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [dummyFile] } });

    expect(await screen.findByText("El archivo JSON debe tener un nombre válido ('name').")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    window.FileReader = originalFileReader;
  });
});
