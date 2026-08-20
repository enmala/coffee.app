import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StepFormModal from '../src/components/modals/StepFormModal';
import { STEP_INSTRUCTION_SUGGESTIONS } from '../src/constants/defaultData';

describe('StepFormModal Component Tests', () => {
  const defaultStepInput = {
    title: '',
    water_g: 0,
    duration_s: 30,
    instruction: ''
  };

  test('returns null when isOpen is false', () => {
    const { container } = render(
      <StepFormModal
        isOpen={false}
        editingStepIndex={null}
        stepInput={defaultStepInput}
        setStepInput={vi.fn()}
        stepTitleError={false}
        setStepTitleError={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders in create step mode with correct labels, placeholders and buttons', () => {
    render(
      <StepFormModal
        isOpen={true}
        editingStepIndex={null}
        stepInput={defaultStepInput}
        setStepInput={vi.fn()}
        stepTitleError={false}
        setStepTitleError={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText(/Agregar Paso de Preparación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Título del paso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Agua a verter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Duración/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instrucción \/ Descripción/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Agregar Paso a la lista/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar edición/i })).toBeInTheDocument();
  });

  test('renders in edit mode with step number and save button', () => {
    const editStepInput = {
      title: 'Bloom',
      water_g: 50,
      duration_s: 45,
      instruction: 'Verter en círculos concéntricos'
    };

    render(
      <StepFormModal
        isOpen={true}
        editingStepIndex={1}
        stepInput={editStepInput}
        setStepInput={vi.fn()}
        stepTitleError={false}
        setStepTitleError={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText(/Editando Paso 2/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bloom')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Verter en círculos concéntricos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /✓ Guardar Cambios en Paso/i })).toBeInTheDocument();
  });

  test('displays validation error message when stepTitleError is true', () => {
    render(
      <StepFormModal
        isOpen={true}
        editingStepIndex={null}
        stepInput={defaultStepInput}
        setStepInput={vi.fn()}
        stepTitleError={true}
        setStepTitleError={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText(/El título del paso es obligatorio/i)).toBeInTheDocument();
  });

  test('handles title input change and clears error if title is non-empty', () => {
    const mockSetStepInput = vi.fn();
    const mockSetStepTitleError = vi.fn();

    render(
      <StepFormModal
        isOpen={true}
        editingStepIndex={null}
        stepInput={defaultStepInput}
        setStepInput={mockSetStepInput}
        stepTitleError={true}
        setStepTitleError={mockSetStepTitleError}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const titleInput = screen.getByLabelText(/Título del paso/i);
    fireEvent.change(titleInput, { target: { value: 'Preinfusión' } });

    expect(mockSetStepInput).toHaveBeenCalledWith({
      ...defaultStepInput,
      title: 'Preinfusión'
    });
    expect(mockSetStepTitleError).toHaveBeenCalledWith(false);
  });

  test('handles water and duration inputs change', () => {
    const mockSetStepInput = vi.fn();

    render(
      <StepFormModal
        isOpen={true}
        editingStepIndex={null}
        stepInput={defaultStepInput}
        setStepInput={mockSetStepInput}
        stepTitleError={false}
        setStepTitleError={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const waterInput = screen.getByLabelText(/Agua a verter/i);
    fireEvent.change(waterInput, { target: { value: '60' } });
    expect(mockSetStepInput).toHaveBeenCalledWith({
      ...defaultStepInput,
      water_g: 60
    });

    const durationInput = screen.getByLabelText(/Duración/i);
    fireEvent.change(durationInput, { target: { value: '45' } });
    expect(mockSetStepInput).toHaveBeenCalledWith({
      ...defaultStepInput,
      duration_s: 45
    });
  });

  test('handles instruction textarea multiline input change', () => {
    const mockSetStepInput = vi.fn();

    render(
      <StepFormModal
        isOpen={true}
        editingStepIndex={null}
        stepInput={defaultStepInput}
        setStepInput={mockSetStepInput}
        stepTitleError={false}
        setStepTitleError={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const textarea = screen.getByLabelText(/Instrucción \/ Descripción/i);
    fireEvent.change(textarea, { target: { value: 'Línea 1\nLínea 2' } });

    expect(mockSetStepInput).toHaveBeenCalledWith({
      ...defaultStepInput,
      instruction: 'Línea 1\nLínea 2'
    });
  });

  test('inserts quick suggestion chip text when instruction is empty', () => {
    let currentInput = { ...defaultStepInput };
    const mockSetStepInput = vi.fn((updater) => {
      currentInput = typeof updater === 'function' ? updater(currentInput) : updater;
    });

    render(
      <StepFormModal
        isOpen={true}
        editingStepIndex={null}
        stepInput={currentInput}
        setStepInput={mockSetStepInput}
        stepTitleError={false}
        setStepTitleError={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const firstSuggestion = STEP_INSTRUCTION_SUGGESTIONS[0];
    const suggestionChip = screen.getByTitle(`Insertar: "${firstSuggestion.text}"`);
    fireEvent.click(suggestionChip);

    expect(mockSetStepInput).toHaveBeenCalled();
    expect(currentInput.instruction).toBe(firstSuggestion.text);
  });

  test('appends quick suggestion chip text when instruction already has content', () => {
    let currentInput = { ...defaultStepInput, instruction: 'Comenzar vertido.' };
    const mockSetStepInput = vi.fn((updater) => {
      currentInput = typeof updater === 'function' ? updater(currentInput) : updater;
    });

    render(
      <StepFormModal
        isOpen={true}
        editingStepIndex={null}
        stepInput={currentInput}
        setStepInput={mockSetStepInput}
        stepTitleError={false}
        setStepTitleError={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const suggestion = STEP_INSTRUCTION_SUGGESTIONS[1];
    const suggestionChip = screen.getByTitle(`Insertar: "${suggestion.text}"`);
    fireEvent.click(suggestionChip);

    expect(mockSetStepInput).toHaveBeenCalled();
    expect(currentInput.instruction).toBe(`Comenzar vertido. ${suggestion.text}`);
  });

  test('triggers onClose when clicking close button, cancel button or backdrop', () => {
    const mockOnClose = vi.fn();

    render(
      <StepFormModal
        isOpen={true}
        editingStepIndex={null}
        stepInput={defaultStepInput}
        setStepInput={vi.fn()}
        stepTitleError={false}
        setStepTitleError={vi.fn()}
        onClose={mockOnClose}
        onSave={vi.fn()}
      />
    );

    const closeBtn = screen.getByLabelText(/Cerrar modal de paso/i);
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByRole('button', { name: /Cancelar edición/i });
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(2);

    const backdrop = screen.getByTestId('step-form-backdrop');
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(3);
  });

  test('triggers onSave when clicking submit/add button', () => {
    const mockOnSave = vi.fn();

    render(
      <StepFormModal
        isOpen={true}
        editingStepIndex={null}
        stepInput={{ ...defaultStepInput, title: 'Paso 1' }}
        setStepInput={vi.fn()}
        stepTitleError={false}
        setStepTitleError={vi.fn()}
        onClose={vi.fn()}
        onSave={mockOnSave}
      />
    );

    const saveBtn = screen.getByRole('button', { name: /\+ Agregar Paso a la lista/i });
    fireEvent.click(saveBtn);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });
});
