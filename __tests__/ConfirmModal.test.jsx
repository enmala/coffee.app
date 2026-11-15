import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../src/components/modals/ConfirmModal';

describe('ConfirmModal Component Tests', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirmar Acción',
    message: '¿Estás seguro de continuar?',
    onConfirm: vi.fn(),
    onCancel: vi.fn()
  };

  test('returns null when isOpen is false', () => {
    const { container } = render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders title, message, and default button labels', () => {
    render(<ConfirmModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy)).toHaveTextContent('Confirmar Acción');

    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy)).toHaveTextContent('¿Estás seguro de continuar?');

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sí, Eliminar' })).toBeInTheDocument();
  });

  test('renders custom button labels', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmText="Sí, Limpiar Todo"
        cancelText="Volver"
      />
    );

    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sí, Limpiar Todo' })).toBeInTheDocument();
  });

  test('moves focus to the cancel button when opened', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  test('traps Tab focus within the modal', () => {
    render(<ConfirmModal {...defaultProps} />);
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    const confirmBtn = screen.getByRole('button', { name: 'Sí, Eliminar' });

    // Tab on the last element wraps to the first
    confirmBtn.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(cancelBtn).toHaveFocus();

    // Shift+Tab on the first element wraps to the last
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(confirmBtn).toHaveFocus();

    // Tab on a non-last element keeps default behavior (no wrap)
    cancelBtn.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(cancelBtn).toHaveFocus();

    // Shift+Tab on a non-first element keeps default behavior (no wrap)
    confirmBtn.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(confirmBtn).toHaveFocus();

    // Other keys do not move focus
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(confirmBtn).toHaveFocus();
  });

  test('calls onCancel when clicking cancel button and when pressing Escape', () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  test('does not throw on Escape when onCancel is not provided', () => {
    render(<ConfirmModal {...defaultProps} onCancel={undefined} />);

    expect(() => fireEvent.keyDown(window, { key: 'Escape' })).not.toThrow();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('calls onConfirm when clicking confirm button', () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sí, Eliminar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('renders warning variant and icon correctly', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        icon="warning"
        confirmVariant="warning"
        confirmText="Aceptar Advertencia"
      />
    );

    const confirmBtn = screen.getByRole('button', { name: 'Aceptar Advertencia' });
    expect(confirmBtn).toHaveClass('bg-amber-600');
  });

  test('renders custom ReactNode icon', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        icon={<span data-testid="custom-icon">🔔</span>}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  test('renders no icon when icon is null', () => {
    const { container } = render(<ConfirmModal {...defaultProps} icon={null} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(container.querySelector('.text-red-500, .text-amber-500')).toBeNull();
  });

  test('renders children content correctly', () => {
    render(
      <ConfirmModal {...defaultProps}>
        <ul data-testid="associated-recipes">
          <li>Receta 1</li>
          <li>Receta 2</li>
        </ul>
      </ConfirmModal>
    );

    expect(screen.getByTestId('associated-recipes')).toBeInTheDocument();
    expect(screen.getByText('Receta 1')).toBeInTheDocument();
    expect(screen.getByText('Receta 2')).toBeInTheDocument();
  });

  test('omits aria-describedby and message when no message is provided', () => {
    render(<ConfirmModal {...defaultProps} message={undefined} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toHaveAttribute('aria-describedby');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy)).toHaveTextContent('Confirmar Acción');
  });

  test('omits aria-labelledby and title when no title is provided', () => {
    render(<ConfirmModal {...defaultProps} title={undefined} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toHaveAttribute('aria-labelledby');
    expect(screen.queryByText('Confirmar Acción')).not.toBeInTheDocument();
  });
});