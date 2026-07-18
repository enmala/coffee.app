import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImportBeanConfirmationModal from '../src/components/ImportBeanConfirmationModal';

describe('ImportBeanConfirmationModal Component Tests', () => {
  const mockBean = {
    name: 'Geisha de Panamá',
    roaster: 'Specialty Roasters',
    origin: 'Panamá',
    process: 'Honey',
    variety: 'Geisha',
    roast_level: 'Claro',
    roast_date: '2026-07-10',
    sca_score: 90.5,
    altitude: '1800m',
    tasting_notes: ['Jazmín', 'Melocotón'],
    notes: 'Increíble acidez floral.'
  };

  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  test('renders all bean information correctly', () => {
    render(
      <ImportBeanConfirmationModal
        bean={mockBean}
        existingBeans={[]}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Importar Grano de Café')).toBeInTheDocument();
    expect(screen.getByText('Geisha de Panamá')).toBeInTheDocument();
    expect(screen.getByText('Tostador: Specialty Roasters')).toBeInTheDocument();
    expect(screen.getByText('📍 Panamá')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Honey')).toBeInTheDocument();
    expect(screen.getByText('🔥 Claro')).toBeInTheDocument();
    expect(screen.getByText('🌱 Geisha')).toBeInTheDocument();
    expect(screen.getByText('🏔️ 1800m')).toBeInTheDocument();
    expect(screen.getByText('🏆 90.5')).toBeInTheDocument();
    expect(screen.getByText('Jazmín')).toBeInTheDocument();
    expect(screen.getByText('Melocotón')).toBeInTheDocument();
    expect(screen.getByText('"Increíble acidez floral."')).toBeInTheDocument();
    expect(screen.getByText('Fecha de tueste: 2026-07-10')).toBeInTheDocument();
  });

  test('shows duplicate warning when bean name already exists', () => {
    const existingBeans = [
      { name: 'Geisha de Panamá' }
    ];

    render(
      <ImportBeanConfirmationModal
        bean={mockBean}
        existingBeans={existingBeans}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Ya tienes un grano registrado con este nombre/)).toBeInTheDocument();
  });

  test('calls onCancel on clicking Cancel button', () => {
    render(
      <ImportBeanConfirmationModal
        bean={mockBean}
        existingBeans={[]}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('calls onConfirm on clicking Save button', () => {
    render(
      <ImportBeanConfirmationModal
        bean={mockBean}
        existingBeans={[]}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const saveBtn = screen.getByRole('button', { name: 'Guardar Grano' });
    fireEvent.click(saveBtn);
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
