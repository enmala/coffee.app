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

  test('supports web share api with customized title and text for coffee recipe', async () => {
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
    expect(mockShare).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Receta de Café: V60 Dulce',
      text: 'Prepara café con esta receta de V60: V60 Dulce'
    }));
  });

  test('supports web share api with customized title and text for tea recipe', async () => {
    const mockShare = vi.fn().mockResolvedValue(true);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true
    });

    const teaRecipe = {
      id: 'recipe-tea',
      name: 'Matcha Uji',
      method: 'Matcha',
      category: 'tea',
      coffee_g: 2,
      grind_size: 'Fino',
      water_temp_c: 80,
      steps: []
    };

    await act(async () => {
      render(<ShareModal recipe={teaRecipe} onClose={mockOnClose} />);
    });

    const shareBtn = screen.getByText('Compartir en Móvil');
    fireEvent.click(shareBtn);
    expect(mockShare).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Receta de Té: Matcha Uji',
      text: 'Prepara té con esta receta de Matcha: Matcha Uji'
    }));
  });

  test('handles clipboard write error and calls onAlert', async () => {
    const mockOnAlert = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard error'))
      },
      writable: true,
      configurable: true
    });

    await act(async () => {
      render(<ShareModal recipe={mockRecipe} onClose={mockOnClose} onAlert={mockOnAlert} />);
    });

    const copyBtn = screen.getByText('Copiar Enlace');
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(mockOnAlert).toHaveBeenCalledWith("No se pudo copiar el enlace automáticamente.", "error");
  });

  test('handles clipboard write error without onAlert', async () => {
    const spyAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard error'))
      },
      writable: true,
      configurable: true
    });

    await act(async () => {
      render(<ShareModal recipe={mockRecipe} onClose={mockOnClose} />);
    });

    const copyBtn = screen.getByText('Copiar Enlace');
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(spyAlert).toHaveBeenCalledWith("No se pudo copiar el enlace automáticamente.");
    spyAlert.mockRestore();
  });

  test('handles QR code rendering error', async () => {
    const QRCode = (await import('qrcode')).default;
    const spyToCanvas = vi.spyOn(QRCode, 'toCanvas').mockImplementation((canvas, text, options, cb) => {
      if (cb) cb(new Error('QR rendering failed'));
    });

    await act(async () => {
      render(<ShareModal recipe={mockRecipe} onClose={mockOnClose} />);
    });

    expect(await screen.findByText('Error al renderizar el código QR.')).toBeInTheDocument();
    spyToCanvas.mockRestore();
  });

  test('handles web share error that is not AbortError', async () => {
    const mockShare = vi.fn().mockRejectedValue(new Error('Share failed'));
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true
    });
    const spyConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<ShareModal recipe={mockRecipe} onClose={mockOnClose} />);
    });

    const shareBtn = screen.getByText('Compartir en Móvil');
    await act(async () => {
      fireEvent.click(shareBtn);
    });

    expect(spyConsoleError).toHaveBeenCalled();
    spyConsoleError.mockRestore();
  });

  test('handles recipe compression error in useEffect', async () => {
    const coffeeUtils = await import('../src/utils/coffeeUtils');
    const spyCompress = vi.spyOn(coffeeUtils, 'compressRecipe').mockRejectedValue(new Error('Compression failed'));

    await act(async () => {
      render(<ShareModal recipe={mockRecipe} onClose={mockOnClose} />);
    });

    expect(await screen.findByText('No se pudo generar el enlace de compartir.')).toBeInTheDocument();
    spyCompress.mockRestore();
  });
});
