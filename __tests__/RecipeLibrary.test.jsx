import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

const sampleCatalog = [
  {
    id: 'pub-v60-kasuya',
    name: 'Método 4:6 Kasuya',
    method: 'V60',
    author: 'Tetsu Kasuya',
    description: 'Técnica de 5 vertidos equilibrando dulzura y acidez.',
    coffee_g: 20,
    grind_size: 'Gruesa',
    water_temp_c: 92,
    steps: [
      { step_number: 1, title: 'Preinfusión', water_g: 50, duration_s: 45, instruction: 'Verter 50g' },
      { step_number: 2, title: 'Segundo vertido', water_g: 70, duration_s: 45, instruction: 'Verter 70g' }
    ]
  },
  {
    id: 'pub-aeropress-champion',
    name: 'Aeropress WAC Champion',
    method: 'Aeropress',
    author: 'World Aeropress Champion',
    description: 'Receta concentrada e invertida.',
    coffee_g: 30,
    grind_size: 'Medio-Gruesa',
    water_temp_c: 85,
    steps: [
      { step_number: 1, title: 'Vertido rápido', water_g: 100, duration_s: 30, instruction: 'Verter 100g' }
    ]
  }
];

describe('Recipe Library Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleCatalog
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test('navigates to library and renders public catalog recipes', async () => {
    render(<App />);

    // Click on Biblioteca button in RecipesTab
    const libraryBtn = screen.getByText('📖 Biblioteca');
    fireEvent.click(libraryBtn);

    // Wait for catalog to load and display
    expect(await screen.findByText('📖 Biblioteca Pública')).toBeInTheDocument();
    expect(screen.getByText('Método 4:6 Kasuya')).toBeInTheDocument();
    expect(screen.getByText('Aeropress WAC Champion')).toBeInTheDocument();
    expect(screen.getByText('Por: Tetsu Kasuya')).toBeInTheDocument();
  });

  test('filters public catalog by search query and method filter', async () => {
    render(<App />);

    fireEvent.click(screen.getByText('📖 Biblioteca'));
    await screen.findByText('Método 4:6 Kasuya');

    // Search query filter
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre, método, autor/i);
    fireEvent.change(searchInput, { target: { value: 'Kasuya' } });

    expect(screen.getByText('Método 4:6 Kasuya')).toBeInTheDocument();
    expect(screen.queryByText('Aeropress WAC Champion')).not.toBeInTheDocument();

    // Clear search and test method pill filter
    fireEvent.change(searchInput, { target: { value: '' } });
    const aeropressFilter = screen.getByRole('button', { name: /Aeropress/i });
    fireEvent.click(aeropressFilter);

    expect(screen.queryByText('Método 4:6 Kasuya')).not.toBeInTheDocument();
    expect(screen.getByText('Aeropress WAC Champion')).toBeInTheDocument();
  });

  test('imports a public recipe into user catalog and updates status badge', async () => {
    render(<App />);

    fireEvent.click(screen.getByText('📖 Biblioteca'));
    await screen.findByText('Método 4:6 Kasuya');

    // Click + Importar on Aeropress recipe
    const importButtons = screen.getAllByRole('button', { name: /\+ Importar/i });
    fireEvent.click(importButtons[1]); // Aeropress WAC Champion

    // Check alert toast message
    expect(await screen.findByText(/agregada a tu catálogo personal/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    // Verify badge updates to "✓ En tu catálogo"
    expect(screen.getByText('✓ En tu catálogo')).toBeInTheDocument();

    // Go back to my recipes and verify imported recipe is listed
    fireEvent.click(screen.getByTitle('Volver a mis recetas'));
    expect(screen.getByText('Aeropress WAC Champion')).toBeInTheDocument();
  });

  test('handles network failure by using offline cached catalog', async () => {
    // Seed localStorage with cached catalog
    localStorage.setItem('coffee_recipes_library_cache_v1', JSON.stringify(sampleCatalog));

    // Mock fetch to fail (network error)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    render(<App />);

    fireEvent.click(screen.getByText('📖 Biblioteca'));

    // Should render cached catalog and display offline notice
    expect(await screen.findByText(/Modo offline:/i)).toBeInTheDocument();
    expect(screen.getByText('Método 4:6 Kasuya')).toBeInTheDocument();
  });

  test('previews library recipe in summary modal and imports directly from modal', async () => {
    render(<App />);

    fireEvent.click(screen.getByText('📖 Biblioteca'));
    await screen.findByText('Método 4:6 Kasuya');

    // Click on recipe card title to open preview modal
    fireEvent.click(screen.getByText('Método 4:6 Kasuya'));

    // Verify preview modal opens with "📥 Agregar a Mis Recetas" button
    const modalImportBtn = screen.getByRole('button', { name: /📥 Agregar a Mis Recetas/i });
    expect(modalImportBtn).toBeInTheDocument();

    // Click import from modal
    fireEvent.click(modalImportBtn);

    // Verify notification toast
    expect(await screen.findByText(/agregada a tu catálogo personal/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));
  });
});
