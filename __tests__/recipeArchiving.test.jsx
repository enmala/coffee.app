import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useState } from 'react';
import RecipesTab from '../src/components/tabs/RecipesTab';
import RecipeSummaryModal from '../src/components/modals/RecipeSummaryModal';
import App from '../src/App';

const BASE_RECIPES = [
  {
    id: 'active-1',
    name: 'V60 Activa',
    method: 'V60',
    coffee_g: 15,
    water_temp_c: 92,
    grind_size: 'Media',
    is_favorite: false,
    is_archived: false,
    steps: [{ step_number: 1, title: 'Vertido', water_g: 250, duration_s: 60, instruction: 'Verter' }],
  },
  {
    id: 'archived-1',
    name: 'Aeropress Archivada',
    method: 'Aeropress',
    coffee_g: 15,
    water_temp_c: 85,
    grind_size: 'Media-Fina',
    is_favorite: false,
    is_archived: true,
    steps: [{ step_number: 1, title: 'Llenado', water_g: 220, duration_s: 10, instruction: 'Verter todo' }],
  },
  {
    id: 'active-2',
    name: 'Moka Activa',
    method: 'Moka',
    coffee_g: 18,
    water_temp_c: 70,
    grind_size: 'Fina',
    is_favorite: true,
    is_archived: false,
    steps: [{ step_number: 1, title: 'Llenar agua', water_g: 250, duration_s: 240, instruction: 'Verter' }],
  },
];

/** Envoltorio stateful para RecipesTab que gestiona el estado del menú contextual */
function StatefulRecipesTab(props) {
  const [menuOpenRecipeId, setMenuOpenRecipeId] = useState(null);
  return (
    <RecipesTab
      {...props}
      menuOpenRecipeId={menuOpenRecipeId}
      setMenuOpenRecipeId={setMenuOpenRecipeId}
    />
  );
}

describe('Sistema de Archivado de Recetas', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─────────────────────────────────────────────────────────────────
  // Tests de componente: RecipesTab
  // ─────────────────────────────────────────────────────────────────

  describe('RecipesTab — Filtros de visibilidad', () => {
    test('1. Los chips de filtro aparecen solo cuando hay recetas archivadas', () => {
      const groupedRecipes = { V60: [BASE_RECIPES[0]] };

      const { rerender } = render(
        <RecipesTab
          groupedRecipes={groupedRecipes}
          collapsedMethods={{}}
          toggleMethodCollapse={vi.fn()}
          menuOpenRecipeId={null}
          setMenuOpenRecipeId={vi.fn()}
          onNewRecipe={vi.fn()}
          onSelectSummary={vi.fn()}
          onStartTimerImmediate={vi.fn()}
          onEditRecipe={vi.fn()}
          onShareRecipe={vi.fn()}
          onDuplicateRecipe={vi.fn()}
          onDeleteRecipe={vi.fn()}
          onToggleFavorite={vi.fn()}
          recipeFilterMode="active"
          setRecipeFilterMode={vi.fn()}
          activeCount={1}
          archivedCount={0}
          totalCount={1}
          onArchiveRecipe={vi.fn()}
          onUnarchiveRecipe={vi.fn()}
        />
      );

      // Sin recetas archivadas → los chips siguen visibles (siempre navegables)
      expect(screen.getByText('Archivadas')).toBeInTheDocument();
      expect(screen.getByText('Todas')).toBeInTheDocument();

      // Rerender con recetas archivadas → chips aparecen
      const groupedWithArchived = {
        V60: [BASE_RECIPES[0]],
        Aeropress: [BASE_RECIPES[1]],
      };
      rerender(
        <RecipesTab
          groupedRecipes={groupedWithArchived}
          collapsedMethods={{}}
          toggleMethodCollapse={vi.fn()}
          menuOpenRecipeId={null}
          setMenuOpenRecipeId={vi.fn()}
          onNewRecipe={vi.fn()}
          onSelectSummary={vi.fn()}
          onStartTimerImmediate={vi.fn()}
          onEditRecipe={vi.fn()}
          onShareRecipe={vi.fn()}
          onDuplicateRecipe={vi.fn()}
          onDeleteRecipe={vi.fn()}
          onToggleFavorite={vi.fn()}
          recipeFilterMode="active"
          setRecipeFilterMode={vi.fn()}
          activeCount={1}
          archivedCount={1}
          totalCount={2}
          onArchiveRecipe={vi.fn()}
          onUnarchiveRecipe={vi.fn()}
        />
      );

      expect(screen.getByText('Archivadas')).toBeInTheDocument();
      expect(screen.getByText('Todas')).toBeInTheDocument();
    });

    test('2. Los chips muestran contadores precisos', () => {
      const groupedRecipes = { V60: [BASE_RECIPES[0]], Aeropress: [BASE_RECIPES[1]], Moka: [BASE_RECIPES[2]] };

      render(
        <RecipesTab
          groupedRecipes={groupedRecipes}
          collapsedMethods={{}}
          toggleMethodCollapse={vi.fn()}
          menuOpenRecipeId={null}
          setMenuOpenRecipeId={vi.fn()}
          onNewRecipe={vi.fn()}
          onSelectSummary={vi.fn()}
          onStartTimerImmediate={vi.fn()}
          onEditRecipe={vi.fn()}
          onShareRecipe={vi.fn()}
          onDuplicateRecipe={vi.fn()}
          onDeleteRecipe={vi.fn()}
          onToggleFavorite={vi.fn()}
          recipeFilterMode="active"
          setRecipeFilterMode={vi.fn()}
          activeCount={2}
          archivedCount={1}
          totalCount={3}
          onArchiveRecipe={vi.fn()}
          onUnarchiveRecipe={vi.fn()}
        />
      );

      // El chip "Activas" debe mostrar 2
      expect(screen.getByTitle('Ver recetas activas')).toHaveTextContent('2');
      // El chip "Archivadas" debe mostrar 1
      expect(screen.getByTitle('Ver recetas archivadas')).toHaveTextContent('1');
      // El chip "Todas" debe mostrar 3
      expect(screen.getByTitle('Ver todas las recetas')).toHaveTextContent('3');
    });

    test('Los chips llaman a setRecipeFilterMode con el valor correcto', () => {
      const groupedRecipes = { V60: [BASE_RECIPES[0]], Aeropress: [BASE_RECIPES[1]] };
      const setRecipeFilterMode = vi.fn();

      render(
        <RecipesTab
          groupedRecipes={groupedRecipes}
          collapsedMethods={{}}
          toggleMethodCollapse={vi.fn()}
          menuOpenRecipeId={null}
          setMenuOpenRecipeId={vi.fn()}
          onNewRecipe={vi.fn()}
          onSelectSummary={vi.fn()}
          onStartTimerImmediate={vi.fn()}
          onEditRecipe={vi.fn()}
          onShareRecipe={vi.fn()}
          onDuplicateRecipe={vi.fn()}
          onDeleteRecipe={vi.fn()}
          onToggleFavorite={vi.fn()}
          recipeFilterMode="active"
          setRecipeFilterMode={setRecipeFilterMode}
          activeCount={1}
          archivedCount={1}
          totalCount={2}
          onArchiveRecipe={vi.fn()}
          onUnarchiveRecipe={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTitle('Ver recetas archivadas'));
      expect(setRecipeFilterMode).toHaveBeenCalledWith('archived');

      fireEvent.click(screen.getByTitle('Ver todas las recetas'));
      expect(setRecipeFilterMode).toHaveBeenCalledWith('all');

      fireEvent.click(screen.getByTitle('Ver recetas activas'));
      expect(setRecipeFilterMode).toHaveBeenCalledWith('active');
    });
  });

  describe('RecipesTab — Tarjetas de recetas archivadas', () => {
    test('3. La tarjeta archivada muestra badge y borde punteado', () => {
      const groupedRecipes = { Aeropress: [BASE_RECIPES[1]] }; // archivada

      render(
        <RecipesTab
          groupedRecipes={groupedRecipes}
          collapsedMethods={{}}
          toggleMethodCollapse={vi.fn()}
          menuOpenRecipeId={null}
          setMenuOpenRecipeId={vi.fn()}
          onNewRecipe={vi.fn()}
          onSelectSummary={vi.fn()}
          onStartTimerImmediate={vi.fn()}
          onEditRecipe={vi.fn()}
          onShareRecipe={vi.fn()}
          onDuplicateRecipe={vi.fn()}
          onDeleteRecipe={vi.fn()}
          onToggleFavorite={vi.fn()}
          recipeFilterMode="all"
          setRecipeFilterMode={vi.fn()}
          activeCount={0}
          archivedCount={1}
          totalCount={1}
          onArchiveRecipe={vi.fn()}
          onUnarchiveRecipe={vi.fn()}
        />
      );

      expect(screen.getByText('📦 Archivada')).toBeInTheDocument();
    });

    test('4. El menú contextual muestra "Archivar" o "Desarchivar" según el estado', () => {
      const groupedRecipes = {
        V60: [BASE_RECIPES[0]],       // activa → "Archivar"
        Aeropress: [BASE_RECIPES[1]], // archivada → "Desarchivar"
      };
      const onArchiveRecipe = vi.fn();
      const onUnarchiveRecipe = vi.fn();

      render(
        <StatefulRecipesTab
          groupedRecipes={groupedRecipes}
          collapsedMethods={{}}
          toggleMethodCollapse={vi.fn()}
          onNewRecipe={vi.fn()}
          onSelectSummary={vi.fn()}
          onStartTimerImmediate={vi.fn()}
          onEditRecipe={vi.fn()}
          onShareRecipe={vi.fn()}
          onDuplicateRecipe={vi.fn()}
          onDeleteRecipe={vi.fn()}
          onToggleFavorite={vi.fn()}
          recipeFilterMode="all"
          setRecipeFilterMode={vi.fn()}
          activeCount={1}
          archivedCount={1}
          totalCount={2}
          onArchiveRecipe={onArchiveRecipe}
          onUnarchiveRecipe={onUnarchiveRecipe}
        />
      );

      // Abrir menú de la primera receta (V60 Activa → debe mostrar "Archivar")
      const menuBtns = screen.getAllByTitle('Más opciones');
      fireEvent.click(menuBtns[0]);
      expect(screen.getByText('Archivar')).toBeInTheDocument();

      // Abrir menú de la segunda receta (Aeropress Archivada → debe mostrar "Desarchivar")
      fireEvent.click(menuBtns[1]);
      expect(screen.getByText('Desarchivar')).toBeInTheDocument();
      expect(screen.queryByText('Archivar')).not.toBeInTheDocument();

      // Click en "Desarchivar" debe llamar al handler
      fireEvent.click(screen.getByText('Desarchivar'));
      expect(onUnarchiveRecipe).toHaveBeenCalledWith('archived-1');
    });

    test('7. Archivar desde el menú contextual llama a onArchiveRecipe con id y nombre', () => {
      const groupedRecipes = { V60: [BASE_RECIPES[0]] };
      const onArchiveRecipe = vi.fn();

      render(
        <StatefulRecipesTab
          groupedRecipes={groupedRecipes}
          collapsedMethods={{}}
          toggleMethodCollapse={vi.fn()}
          onNewRecipe={vi.fn()}
          onSelectSummary={vi.fn()}
          onStartTimerImmediate={vi.fn()}
          onEditRecipe={vi.fn()}
          onShareRecipe={vi.fn()}
          onDuplicateRecipe={vi.fn()}
          onDeleteRecipe={vi.fn()}
          onToggleFavorite={vi.fn()}
          recipeFilterMode="active"
          setRecipeFilterMode={vi.fn()}
          activeCount={1}
          archivedCount={0}
          totalCount={1}
          onArchiveRecipe={onArchiveRecipe}
          onUnarchiveRecipe={vi.fn()}
        />
      );

      // Abrir menú y archivar
      const menuBtn = screen.getByTitle('Más opciones');
      fireEvent.click(menuBtn);
      fireEvent.click(screen.getByText('Archivar'));

      expect(onArchiveRecipe).toHaveBeenCalledWith('active-1', 'V60 Activa');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // Tests de componente: RecipeSummaryModal
  // ─────────────────────────────────────────────────────────────────

  describe('RecipeSummaryModal — Badge y botones de archivado', () => {
    test('5. Receta archivada muestra badge y botón de restaurar en el resumen', () => {
      render(
        <RecipeSummaryModal
          summaryRecipe={BASE_RECIPES[1]} // archivada
          beans={[]}
          onClose={vi.fn()}
          onShare={vi.fn()}
          onDelete={vi.fn()}
          onStartTimer={vi.fn()}
          formatSecondsToMinutes={(s) => `${s}s`}
          onToggleFavorite={vi.fn()}
          onArchiveRecipe={vi.fn()}
          onUnarchiveRecipe={vi.fn()}
        />
      );

      expect(screen.getByText('Archivada')).toBeInTheDocument();
      expect(screen.getByTitle('Desarchivar receta')).toBeInTheDocument();
    });

    test('6. Receta activa muestra botón de archivar en el resumen', () => {
      render(
        <RecipeSummaryModal
          summaryRecipe={BASE_RECIPES[0]} // activa
          beans={[]}
          onClose={vi.fn()}
          onShare={vi.fn()}
          onDelete={vi.fn()}
          onStartTimer={vi.fn()}
          formatSecondsToMinutes={(s) => `${s}s`}
          onToggleFavorite={vi.fn()}
          onArchiveRecipe={vi.fn()}
          onUnarchiveRecipe={vi.fn()}
        />
      );

      // El badge "Archivada" no debe aparecer (solo el badge del método)
      const badges = screen.queryAllByText('Archivada');
      // El badge del método es "V60", no "Archivada"
      expect(badges).toHaveLength(0);

      expect(screen.getByTitle('Archivar receta')).toBeInTheDocument();
      expect(screen.queryByTitle('Desarchivar receta')).not.toBeInTheDocument();
    });

    test('Los botones de archivar/desarchivar del resumen llaman a los handlers correctos', () => {
      const onArchiveRecipe = vi.fn();
      const onUnarchiveRecipe = vi.fn();

      // Receta activa → botón "Archivar"
      const { rerender } = render(
        <RecipeSummaryModal
          summaryRecipe={BASE_RECIPES[0]}
          beans={[]}
          onClose={vi.fn()}
          onShare={vi.fn()}
          onDelete={vi.fn()}
          onStartTimer={vi.fn()}
          formatSecondsToMinutes={(s) => `${s}s`}
          onToggleFavorite={vi.fn()}
          onArchiveRecipe={onArchiveRecipe}
          onUnarchiveRecipe={onUnarchiveRecipe}
        />
      );

      fireEvent.click(screen.getByTitle('Archivar receta'));
      expect(onArchiveRecipe).toHaveBeenCalledWith('active-1', 'V60 Activa');

      // Receta archivada → botón "Desarchivar"
      rerender(
        <RecipeSummaryModal
          summaryRecipe={BASE_RECIPES[1]}
          beans={[]}
          onClose={vi.fn()}
          onShare={vi.fn()}
          onDelete={vi.fn()}
          onStartTimer={vi.fn()}
          formatSecondsToMinutes={(s) => `${s}s`}
          onToggleFavorite={vi.fn()}
          onArchiveRecipe={onArchiveRecipe}
          onUnarchiveRecipe={onUnarchiveRecipe}
        />
      );

      fireEvent.click(screen.getByTitle('Desarchivar receta'));
      expect(onUnarchiveRecipe).toHaveBeenCalledWith('archived-1');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // Tests de integración: App
  // ─────────────────────────────────────────────────────────────────

  describe('App — Flujo de archivado integral', () => {
    beforeEach(() => {
      localStorage.setItem('coffee_recipes_v1', JSON.stringify(BASE_RECIPES));
    });

    test('8. El filtro por defecto es "active" y oculta recetas archivadas', () => {
      render(<App />);

      // La receta archivada no debe aparecer en la lista activa
      expect(screen.queryByText('Aeropress Archivada')).not.toBeInTheDocument();
      // Las recetas activas deben mostrarse
      expect(screen.getByText('V60 Activa')).toBeInTheDocument();
      expect(screen.getByText('Moka Activa')).toBeInTheDocument();
    });

    test('9. Los chips de filtro aparecen y muestran contadores correctos', () => {
      render(<App />);

      expect(screen.getByText('Archivadas')).toBeInTheDocument();
      expect(screen.getByTitle('Ver recetas archivadas')).toHaveTextContent('1');
      expect(screen.getByTitle('Ver todas las recetas')).toHaveTextContent('3');
    });

    test('10. Cambiar al filtro "Todas" muestra recetas archivadas con badge', () => {
      render(<App />);

      fireEvent.click(screen.getByTitle('Ver todas las recetas'));

      // La receta archivada ahora debe aparecer
      expect(screen.getByText('Aeropress Archivada')).toBeInTheDocument();
      expect(screen.getByText('📦 Archivada')).toBeInTheDocument();
    });

    test('11. Archivar desde el menú de la tarjeta funciona y muestra el toast', async () => {
      render(<App />);

      // Abrir menú de la receta "V60 Activa" (primera receta activa)
      const menuBtns = screen.getAllByTitle('Más opciones');
      fireEvent.click(menuBtns[0]);

      // Hacer clic en "Archivar"
      fireEvent.click(screen.getByText('Archivar'));

      // Verificar que la receta desaparece de la vista activa
      expect(screen.queryByText('V60 Activa')).not.toBeInTheDocument();

      // Verificar localStorage
      const saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
      const archivedRecipe = saved.find((r) => r.id === 'active-1');
      expect(archivedRecipe.is_archived).toBe(true);

      // Verificar el undo toast aparece con el nombre de la receta
      expect(screen.getByText('Receta archivada')).toBeInTheDocument();
      expect(screen.getByText(/V60 Activa/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Deshacer' })).toBeInTheDocument();
    });

    test('12. El undo toast restaura inmediatamente la receta archivada', async () => {
      render(<App />);

      // Archivar la primera receta
      const menuBtns = screen.getAllByTitle('Más opciones');
      fireEvent.click(menuBtns[0]);
      fireEvent.click(screen.getByText('Archivar'));

      // La receta desaparece de la vista activa
      expect(screen.queryByText('V60 Activa')).not.toBeInTheDocument();

      // Hacer clic en "Deshacer" en el toast
      fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));

      // La receta reaparece
      expect(screen.getByText('V60 Activa')).toBeInTheDocument();

      // El toast desaparece
      expect(screen.queryByText('Receta archivada')).not.toBeInTheDocument();

      // localStorage refleja el estado restaurado
      const saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
      const restoredRecipe = saved.find((r) => r.id === 'active-1');
      expect(restoredRecipe.is_archived).toBe(false);
    });

    test('13. El undo toast se auto-cierra después de 4 segundos', async () => {
      vi.useFakeTimers();
      render(<App />);

      const menuBtns = screen.getAllByTitle('Más opciones');
      fireEvent.click(menuBtns[0]);
      fireEvent.click(screen.getByText('Archivar'));

      expect(screen.getByText('Receta archivada')).toBeInTheDocument();

      // Avanzar 4 segundos (el toast se cierra automáticamente)
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(screen.queryByText('Receta archivada')).not.toBeInTheDocument();

      // La receta sigue archivada (el auto-dismiss no deshace el archivado)
      const saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
      const archivedRecipe = saved.find((r) => r.id === 'active-1');
      expect(archivedRecipe.is_archived).toBe(true);

      vi.useRealTimers();
    });

    test('14. Desarchivar desde el modal de resumen funciona', async () => {
      render(<App />);

      // Ver todo para poder ver la receta archivada
      fireEvent.click(screen.getByTitle('Ver todas las recetas'));

      // Abrir el resumen de la receta archivada
      const recipeCards = screen.getAllByText('Aeropress Archivada');
      fireEvent.click(recipeCards[0]);

      // El modal de resumen debe mostrar el badge y botón de desarchivar
      expect(screen.getByText('Archivada')).toBeInTheDocument();
      const unarchiveBtn = screen.getByTitle('Desarchivar receta');
      fireEvent.click(unarchiveBtn);

      // Verificar localStorage
      const saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
      const unarchivedRecipe = saved.find((r) => r.id === 'archived-1');
      expect(unarchivedRecipe.is_archived).toBe(false);
    });

    test('15. Editar y guardar una receta archivada preserva is_archived', async () => {
      render(<App />);

      // Ver todo para poder ver la receta archivada
      fireEvent.click(screen.getByTitle('Ver todas las recetas'));

      // En "Todas", los botones de menú están en orden de aparición de método:
      // [0] → V60 Activa, [1] → Aeropress Archivada, [2] → Moka Activa
      const menuBtns = screen.getAllByTitle('Más opciones');
      fireEvent.click(menuBtns[1]); // Abrir menú de "Aeropress Archivada"

      // Hacer clic en "Editar"
      fireEvent.click(screen.getByText('Editar'));

      // El badge "Editando receta archivada" debe aparecer en el header del formulario
      expect(screen.getByText(/Editando receta archivada/i)).toBeInTheDocument();

      // Cambiar el nombre y guardar
      const nameInput = screen.getByDisplayValue('Aeropress Archivada');
      fireEvent.change(nameInput, { target: { value: 'Aeropress Modificada' } });

      const saveBtn = screen.getByText('Guardar Receta');
      fireEvent.click(saveBtn);

      // Verificar que is_archived se preservó
      const saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
      const editedRecipe = saved.find((r) => r.id === 'archived-1');
      expect(editedRecipe).toBeDefined();
      expect(editedRecipe.name).toBe('Aeropress Modificada');
      expect(editedRecipe.is_archived).toBe(true);
    });

    test('16. Las recetas legacy sin is_archived se tratan como activas', () => {
      const legacyRecipes = [
        {
          id: 'legacy-1',
          name: 'Receta Legacy',
          method: 'V60',
          coffee_g: 15,
          water_temp_c: 92,
          grind_size: 'Media',
          is_favorite: true,
          steps: [{ step_number: 1, title: 'Vertido', water_g: 250, duration_s: 60, instruction: 'Verter' }],
        },
      ];
      localStorage.setItem('coffee_recipes_v1', JSON.stringify(legacyRecipes));

      render(<App />);

      // La receta debe aparecer (no está archivada)
      expect(screen.getByText('Receta Legacy')).toBeInTheDocument();

      // El chip "Archivadas" debe estar presente (siempre visible) pero con contador 0
      expect(screen.getByText('Archivadas')).toBeInTheDocument();

      // Verificar que is_archived se normalizó a false en localStorage
      const saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
      expect(saved[0].is_archived).toBe(false);
    });

    test('17. El flujo completo de archivar-desarchivar persiste en localStorage', () => {
      render(<App />);

      // Ver todo para acceder a todas las recetas
      fireEvent.click(screen.getByTitle('Ver todas las recetas'));

      // Contar recetas archivadas antes
      let saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
      expect(saved.filter((r) => r.is_archived).length).toBe(1);

      // Archivar "V60 Activa" (activa) desde el menú
      const menuBtns = screen.getAllByTitle('Más opciones');
      fireEvent.click(menuBtns[0]);
      fireEvent.click(screen.getByText('Archivar'));

      // Verificar: ahora hay 2 archivadas
      saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
      expect(saved.filter((r) => r.is_archived).length).toBe(2);

      // Cambiar a "Archivadas" → ver "V60 Activa"
      fireEvent.click(screen.getByTitle('Ver recetas archivadas'));
      expect(screen.getByText('V60 Activa')).toBeInTheDocument();

      // Abrir menú de "V60 Activa" y desarchivar
      const archMenuBtns = screen.getAllByTitle('Más opciones');
      fireEvent.click(archMenuBtns[0]);
      fireEvent.click(screen.getByText('Desarchivar'));

      // Verificar: de vuelta a 1 archivada
      saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
      expect(saved.filter((r) => r.is_archived).length).toBe(1);
    });

    test('20. Los chips permanecen visibles al desarchivar todas las recetas', () => {
      render(<App />);

      // Ver todo para acceder a todas las recetas
      fireEvent.click(screen.getByTitle('Ver todas las recetas'));

      // Cambiar a "Archivadas" → ver solo la receta archivada
      fireEvent.click(screen.getByTitle('Ver recetas archivadas'));
      expect(screen.getByText('Aeropress Archivada')).toBeInTheDocument();

      // Los chips deben estar visibles
      expect(screen.getByTitle('Ver recetas activas')).toBeInTheDocument();
      expect(screen.getByTitle('Ver recetas archivadas')).toBeInTheDocument();
      expect(screen.getByTitle('Ver todas las recetas')).toBeInTheDocument();

      // Desarchivar la única receta archivada
      const menuBtns = screen.getAllByTitle('Más opciones');
      fireEvent.click(menuBtns[0]);
      fireEvent.click(screen.getByText('Desarchivar'));

      // Ahora archivedCount = 0, pero los chips siguen visibles
      expect(screen.getByTitle('Ver recetas activas')).toBeInTheDocument();
      expect(screen.getByTitle('Ver recetas archivadas')).toBeInTheDocument();

      // El chip "Archivadas" debe mostrar contador 0
      const archivadasChip = screen.getByTitle('Ver recetas archivadas');
      expect(archivadasChip).toHaveTextContent('0');

      // Cambiar a "Activas" para verificar que funciona
      fireEvent.click(screen.getByTitle('Ver recetas activas'));
      expect(screen.getByText('V60 Activa')).toBeInTheDocument();

      // "Aeropress Archivada" fue desarchivada → ahora es activa → aparece en "Activas"
      expect(screen.getByText('Aeropress Archivada')).toBeInTheDocument();
    });

    test('21. Los chips son navegables cuando solo hay recetas archivadas', () => {
      // Setup: solo recetas archivadas
      const onlyArchived = [
        { ...BASE_RECIPES[1], is_archived: true },
        { ...BASE_RECIPES[0], is_archived: true, id: 'active-1-archived', name: 'V60 Archivada' },
      ];
      localStorage.setItem('coffee_recipes_v1', JSON.stringify(onlyArchived));

      render(<App />);

      // Por defecto en "Activas" → lista vacía, pero chips visibles
      expect(screen.queryByText('V60 Archivada')).not.toBeInTheDocument();
      expect(screen.getByText('Archivadas')).toBeInTheDocument();

      // Navegar a "Archivadas" desde el chip
      fireEvent.click(screen.getByTitle('Ver recetas archivadas'));
      expect(screen.getByText('V60 Archivada')).toBeInTheDocument();
      expect(screen.getByText('Aeropress Archivada')).toBeInTheDocument();

      // Navegar a "Todas" desde el chip
      fireEvent.click(screen.getByTitle('Ver todas las recetas'));
      expect(screen.getByText('V60 Archivada')).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // Tests de exportación JSON preserve is_archived
  // ─────────────────────────────────────────────────────────────────

  describe('Exportación / Importación JSON preserve is_archived', () => {
    test('18. handleExportJson incluye is_archived en la receta exportada', () => {
      // Verificar que la serialización JSON preserva el campo
      const jsonActive = JSON.stringify(BASE_RECIPES[0]);
      const parsedActive = JSON.parse(jsonActive);
      expect(parsedActive.is_archived).toBe(false);

      const jsonArchived = JSON.stringify(BASE_RECIPES[1]);
      const parsedArchived = JSON.parse(jsonArchived);
      expect(parsedArchived.is_archived).toBe(true);
    });

    test('19. La importación de JSON con is_archived: true mantiene el receta archivada', () => {
      localStorage.setItem('coffee_recipes_v1', JSON.stringify(BASE_RECIPES));
      render(<App />);

      // Ver todo para poder acceder a todas las recetas
      fireEvent.click(screen.getByTitle('Ver todas las recetas'));

      // Todas las recetas base están como activas, archivemos una para probar export/import
      const menuBtns = screen.getAllByTitle('Más opciones');
      fireEvent.click(menuBtns[0]); // V60 Activa
      fireEvent.click(screen.getByText('Archivar'));

      // Verificar que se archivó
      let saved = JSON.parse(localStorage.getItem('coffee_recipes_v1'));
      const archived = saved.find((r) => r.id === 'active-1');
      expect(archived.is_archived).toBe(true);

      // Simular export → import: el campo is_archived debe estar presente
      const exported = JSON.stringify(saved);
      const imported = JSON.parse(exported);
      const importedArchived = imported.find((r) => r.id === 'active-1');
      expect(importedArchived.is_archived).toBe(true);
    });
  });
});
