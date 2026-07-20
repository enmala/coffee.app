import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationModal from '../src/components/NotificationModal';

describe('NotificationModal Component Tests', () => {
  test('renders message, title and triggers onClose', () => {
    const mockOnClose = vi.fn();
    render(
      <NotificationModal
        message="Mensaje de prueba"
        type="info"
        title="Título de prueba"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Título de prueba')).toBeInTheDocument();
    expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
    // Verify SVG icon is rendered
    expect(screen.getByRole('dialog').querySelector('svg')).toBeInTheDocument();

    const acceptBtn = screen.getByRole('button', { name: /aceptar/i });
    fireEvent.click(acceptBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('renders default title based on type', () => {
    const { rerender } = render(
      <NotificationModal
        message="Mensaje"
        type="success"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Éxito')).toBeInTheDocument();
    // Verify SVG icon is rendered
    expect(screen.getByRole('dialog').querySelector('svg')).toBeInTheDocument();

    rerender(
      <NotificationModal
        message="Mensaje"
        type="error"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Error')).toBeInTheDocument();
    // Verify SVG icon is rendered
    expect(screen.getByRole('dialog').querySelector('svg')).toBeInTheDocument();
  });

  test('returns null if message is empty', () => {
    const { container } = render(
      <NotificationModal
        message=""
        type="info"
        onClose={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
