import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Clipboard Import Feature', () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    localStorage.clear();
    // Default valid clipboard mock
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: {
        readText: vi.fn(),
        writeText: vi.fn().mockResolvedValue(),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: originalClipboard,
    });
    vi.restoreAllMocks();
  });

  test('imports a valid recipe JSON from clipboard', async () => {
    const validRecipe = {
      name: 'V60 Portapapeles Especial',
      method: 'V60',
      coffee_g: 15,
      grind_size: 'Medium-Fine',
      water_temp_c: 92,
      steps: [
        { step_number: 1, title: 'Bloom', water_g: 50, duration_s: 30, instruction: 'Verter en espiral' },
        { step_number: 2, title: 'Segundo vertido', water_g: 200, duration_s: 60, instruction: 'Verter constante' }
      ]
    };

    navigator.clipboard.readText.mockResolvedValue(JSON.stringify(validRecipe));

    render(<App />);
    fireEvent.click(screen.getByTitle('Configuración'));

    const clipboardBtn = screen.getByTitle('Importar desde el portapapeles');
    fireEvent.click(clipboardBtn);

    // Should open ImportConfirmationModal
    const confirmBtn = await screen.findByText('Guardar Receta');
    expect(confirmBtn).toBeInTheDocument();
    expect(screen.getByText('V60 Portapapeles Especial')).toBeInTheDocument();

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Receta importada correctamente/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    expect(screen.getByText('V60 Portapapeles Especial')).toBeInTheDocument();
  });

  test('imports a valid coffee bean JSON from clipboard', async () => {
    const validBean = {
      name: 'Geisha Portapapeles Finca',
      roaster: 'Tostaduría de Prueba',
      origin: 'Panamá',
      process: 'Lavado',
      variety: 'Geisha',
      roast_level: 'Medio',
      sca_score: 89,
      altitude: 1800,
      tasting_notes: ['Jazmín', 'Cítricos']
    };

    navigator.clipboard.readText.mockResolvedValue(JSON.stringify(validBean));

    render(<App />);
    fireEvent.click(screen.getByTitle('Configuración'));

    const clipboardBtn = screen.getByTitle('Importar desde el portapapeles');
    fireEvent.click(clipboardBtn);

    // Should open ImportBeanConfirmationModal
    const confirmBtn = await screen.findByText('Guardar Grano');
    expect(confirmBtn).toBeInTheDocument();
    expect(screen.getByText('Geisha Portapapeles Finca')).toBeInTheDocument();

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Grano de café importado correctamente/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    expect(screen.getByText('Geisha Portapapeles Finca')).toBeInTheDocument();
  });

  test('shows warning when clipboard is empty or only whitespace', async () => {
    navigator.clipboard.readText.mockResolvedValue('   ');

    render(<App />);
    fireEvent.click(screen.getByTitle('Configuración'));

    const clipboardBtn = screen.getByTitle('Importar desde el portapapeles');
    fireEvent.click(clipboardBtn);

    await waitFor(() => {
      expect(screen.getByText('El portapapeles está vacío o no contiene texto.')).toBeInTheDocument();
    });
  });

  test('shows error when clipboard text is invalid JSON syntax', async () => {
    navigator.clipboard.readText.mockResolvedValue('{ nombre: texto malformado sin cerrar');

    render(<App />);
    fireEvent.click(screen.getByTitle('Configuración'));

    const clipboardBtn = screen.getByTitle('Importar desde el portapapeles');
    fireEvent.click(clipboardBtn);

    await waitFor(() => {
      expect(screen.getByText('El contenido del portapapeles no es un JSON válido.')).toBeInTheDocument();
    });
  });

  test('shows error when clipboard JSON is an array or not an object', async () => {
    navigator.clipboard.readText.mockResolvedValue(JSON.stringify(['elemento1', 'elemento2']));

    render(<App />);
    fireEvent.click(screen.getByTitle('Configuración'));

    const clipboardBtn = screen.getByTitle('Importar desde el portapapeles');
    fireEvent.click(clipboardBtn);

    await waitFor(() => {
      expect(screen.getByText('El contenido del portapapeles no tiene un formato estructurado válido.')).toBeInTheDocument();
    });
  });

  test('shows error when clipboard JSON is missing a valid name', async () => {
    navigator.clipboard.readText.mockResolvedValue(JSON.stringify({ method: 'Chemex', steps: [] }));

    render(<App />);
    fireEvent.click(screen.getByTitle('Configuración'));

    const clipboardBtn = screen.getByTitle('Importar desde el portapapeles');
    fireEvent.click(clipboardBtn);

    await waitFor(() => {
      expect(screen.getByText("El JSON del portapapeles debe tener un nombre válido ('name').")).toBeInTheDocument();
    });
  });

  test('shows error when recipe has 0 steps', async () => {
    navigator.clipboard.readText.mockResolvedValue(JSON.stringify({ name: 'Receta vacía', steps: [] }));

    render(<App />);
    fireEvent.click(screen.getByTitle('Configuración'));

    const clipboardBtn = screen.getByTitle('Importar desde el portapapeles');
    fireEvent.click(clipboardBtn);

    await waitFor(() => {
      expect(screen.getByText('La receta debe contener al menos un paso para ser válida.')).toBeInTheDocument();
    });
  });

  test('shows error when clipboard access is denied or throws', async () => {
    navigator.clipboard.readText.mockRejectedValue(new Error('NotAllowedError: Permission denied'));

    render(<App />);
    fireEvent.click(screen.getByTitle('Configuración'));

    const clipboardBtn = screen.getByTitle('Importar desde el portapapeles');
    fireEvent.click(clipboardBtn);

    await waitFor(() => {
      expect(screen.getByText('No se pudo acceder al portapapeles. Asegúrate de haber otorgado los permisos necesarios.')).toBeInTheDocument();
    });
  });

  test('shows error when browser does not support clipboard.readText', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    render(<App />);
    fireEvent.click(screen.getByTitle('Configuración'));

    const clipboardBtn = screen.getByTitle('Importar desde el portapapeles');
    fireEvent.click(clipboardBtn);

    await waitFor(() => {
      expect(screen.getByText('Tu navegador no soporta la lectura automática del portapapeles.')).toBeInTheDocument();
    });
  });
});
