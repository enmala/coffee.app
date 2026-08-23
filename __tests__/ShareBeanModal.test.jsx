import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import ShareBeanModal from '../src/components/ShareBeanModal';

// Helper: waits for a ShareBeanModal action button to become enabled
// (generating === false && no error) before returning the element.
const waitForShareButton = async (text) => {
  const btn = screen.getByText(text);
  await waitFor(() => expect(btn).not.toBeDisabled());
  return btn;
};

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn((canvas, text, options, cb) => {
      if (cb) cb(null);
    })
  }
}));

describe('ShareBeanModal Component Tests', () => {
  const mockBean = {
    id: 'bean-1',
    name: 'Geisha Suprema',
    roaster: 'Tostaduría Gourmet',
    origin: 'Colombia',
    process: 'Lavado',
    variety: 'Geisha',
    roast_level: 'Medio',
    roast_date: '2026-07-01',
    sca_score: 88.5,
    altitude: '1600m',
    tasting_notes: ['Fresa', 'Chocolate'],
    notes: 'Grano muy aromático.'
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

  test('renders bean name and roaster, and closes on clicking close button', async () => {
    await act(async () => {
      render(<ShareBeanModal bean={mockBean} onClose={mockOnClose} />);
    });

    expect(screen.getByText('Compartir Grano')).toBeInTheDocument();
    expect(screen.getByText('Geisha Suprema (Tostaduría Gourmet)')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Cerrar modal');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('allows copying link to clipboard', async () => {
    await act(async () => {
      render(<ShareBeanModal bean={mockBean} onClose={mockOnClose} />);
    });

    const copyBtn = await waitForShareButton('Copiar Enlace');
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(screen.getByText('¡Enlace Copiado!')).toBeInTheDocument();
  });

  test('allows downloading JSON bean file', async () => {
    await act(async () => {
      render(<ShareBeanModal bean={mockBean} onClose={mockOnClose} />);
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
    
    try {
      const downloadBtn = screen.getByText('Descargar archivo');
      fireEvent.click(downloadBtn);

      expect(mockClick).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
      mockAppendChild.mockRestore();
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
      render(<ShareBeanModal bean={mockBean} onClose={mockOnClose} />);
    });

    const shareBtn = await waitForShareButton('Compartir en Móvil');
    expect(shareBtn).toBeInTheDocument();

    fireEvent.click(shareBtn);
    expect(mockShare).toHaveBeenCalled();
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
      render(<ShareBeanModal bean={mockBean} onClose={mockOnClose} onAlert={mockOnAlert} />);
    });

    const copyBtn = await waitForShareButton('Copiar Enlace');
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
      render(<ShareBeanModal bean={mockBean} onClose={mockOnClose} />);
    });

    const copyBtn = await waitForShareButton('Copiar Enlace');
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
      render(<ShareBeanModal bean={mockBean} onClose={mockOnClose} />);
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
      render(<ShareBeanModal bean={mockBean} onClose={mockOnClose} />);
    });

    const shareBtn = await waitForShareButton('Compartir en Móvil');
    await act(async () => {
      fireEvent.click(shareBtn);
    });

    expect(spyConsoleError).toHaveBeenCalled();
    spyConsoleError.mockRestore();
  });

  test('handles bean compression error in useEffect', async () => {
    const coffeeUtils = await import('../src/utils/coffeeUtils');
    const spyCompress = vi.spyOn(coffeeUtils, 'compressBean').mockRejectedValue(new Error('Compression failed'));

    await act(async () => {
      render(<ShareBeanModal bean={mockBean} onClose={mockOnClose} />);
    });

    expect(await screen.findByText('No se pudo generar el enlace de compartir.')).toBeInTheDocument();
    spyCompress.mockRestore();
  });
});
