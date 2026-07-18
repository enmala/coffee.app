import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ShareModal from '../src/components/ShareModal';

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn((canvas, text, options, cb) => {
      if (cb) cb(null);
    })
  }
}));

describe('ShareModal Component Tests', () => {
  const mockRecipe = {
    id: 'recipe-1',
    name: 'V60 Dulce',
    method: 'V60',
    coffee_g: 15,
    grind_size: 'Medium',
    water_temp_c: 92,
    steps: [
      { step_number: 1, title: 'Preinfusion', water_g: 50, duration_s: 30, instruction: 'Pour 50g' }
    ]
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue()
      },
      writable: true,
      configurable: true
    });
    // Mock navigator share as undefined by default
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true
    });
  });

  test('renders recipe name and method, and closes on clicking close button', async () => {
    await act(async () => {
      render(<ShareModal recipe={mockRecipe} onClose={mockOnClose} />);
    });

    expect(screen.getByText('Compartir Receta')).toBeInTheDocument();
    expect(screen.getByText('V60 Dulce (V60)')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Cerrar modal');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('allows copying link to clipboard', async () => {
    await act(async () => {
      render(<ShareModal recipe={mockRecipe} onClose={mockOnClose} />);
    });

    const copyBtn = screen.getByText('Copiar Enlace');
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(screen.getByText('¡Enlace Copiado!')).toBeInTheDocument();
  });

  test('allows downloading JSON recipe file', async () => {
    await act(async () => {
      render(<ShareModal recipe={mockRecipe} onClose={mockOnClose} />);
    });

    const mockClick = vi.fn();
    const mockAnchor = {
      setAttribute: vi.fn(),
      click: mockClick,
      remove: vi.fn()
    };
    
    const spy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchor;
      }
    });

    const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    
    try {
      const downloadBtn = screen.getByText('Descargar archivo');
      fireEvent.click(downloadBtn);

      expect(mockClick).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    }
  });

  test('supports web share api if available', async () => {
    const mockShare = vi.fn().mockResolvedValue(true);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true
    });

    await act(async () => {
      render(<ShareModal recipe={mockRecipe} onClose={mockOnClose} />);
    });

    const shareBtn = screen.getByText('Compartir en Móvil');
    expect(shareBtn).toBeInTheDocument();

    fireEvent.click(shareBtn);
    expect(mockShare).toHaveBeenCalled();
  });
});
