import { useState, useEffect, useCallback, useMemo } from 'react';
import { safeGetItem, safeSetItem } from '../utils/storageUtils';
import { DEFAULT_RECIPES } from '../constants/defaultData';

const EMPTY_RECIPE = {
  name: '',
  method: 'V60',
  coffee_g: 15,
  grind_size: '',
  water_temp_c: 90,
  bean_id: '',
  is_favorite: false,
  is_archived: false,
  steps: []
};

const EMPTY_STEP_INPUT = {
  title: '',
  water_g: 0,
  duration_s: 30,
  instruction: ''
};

export function useRecipes() {
  const [recipes, setRecipes] = useState(() => {
    return safeGetItem('coffee_recipes_v1', DEFAULT_RECIPES, Array.isArray).map((r) => ({
      ...r,
      is_favorite: Boolean(r.is_favorite),
      is_archived: Boolean(r.is_archived)
    }));
  });

  const [collapsedMethods, setCollapsedMethods] = useState(() => {
    return safeGetItem('collapsed_methods_v1', {}, (v) => typeof v === 'object' && v !== null && !Array.isArray(v));
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [menuOpenRecipeId, setMenuOpenRecipeId] = useState(null);
  const [summaryRecipe, setSummaryRecipe] = useState(null);
  const [duplicatingFromRecipe, setDuplicatingFromRecipe] = useState(null);
  const [recipeToShare, setRecipeToShare] = useState(null);
  const [recipeToImport, setRecipeToImport] = useState(null);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);

  const [newRecipe, setNewRecipe] = useState(EMPTY_RECIPE);
  const [stepInput, setStepInput] = useState(EMPTY_STEP_INPUT);
  const [stepTitleError, setStepTitleError] = useState(false);
  const [isStepFormOpen, setIsStepFormOpen] = useState(false);

  const [recipeFilterMode, setRecipeFilterMode] = useState(() => {
    return safeGetItem('coffee_recipe_filter_mode_v1', 'active', (v) =>
      ['active', 'archived', 'all'].includes(v)
    );
  });

  const [undoArchiveToast, setUndoArchiveToast] = useState(null);

  useEffect(() => {
    safeSetItem('coffee_recipes_v1', recipes);
  }, [recipes]);

  useEffect(() => {
    safeSetItem('collapsed_methods_v1', collapsedMethods);
  }, [collapsedMethods]);

  useEffect(() => {
    safeSetItem('coffee_recipe_filter_mode_v1', recipeFilterMode);
  }, [recipeFilterMode]);

  // Auto-dismiss del undo toast después de 3 segundos
  useEffect(() => {
    if (!undoArchiveToast) return;

    const timer = setTimeout(() => {
      setUndoArchiveToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [undoArchiveToast]);

  useEffect(() => {
    if (menuOpenRecipeId === null) return;

    const handleOutsideClick = (event) => {
      const trigger = document.querySelector(`[data-menu-trigger="${menuOpenRecipeId}"]`);
      const menu = document.querySelector(`[data-menu-content="${menuOpenRecipeId}"]`);
      if (
        (trigger && trigger.contains(event.target)) ||
        (menu && menu.contains(event.target))
      ) {
        return;
      }
      setMenuOpenRecipeId(null);
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [menuOpenRecipeId]);

  const toggleMethodCollapse = useCallback((method) => {
    setCollapsedMethods((prev) => ({
      ...prev,
      [method]: !prev[method]
    }));
  }, []);

  const syncWithHistory = useCallback((state) => {
    if (state.view === 'edit-recipe') {
      setIsCreating(true);
      setEditingRecipeId(state.recipeId || null);
    } else if (state.view !== 'step-editor') {
      setIsCreating(false);
      setEditingRecipeId(null);
      setNewRecipe(EMPTY_RECIPE);
      setStepInput(EMPTY_STEP_INPUT);
      setEditingStepIndex(null);
    }

    if (state.view === 'summary' && state.recipeId) {
      setSummaryRecipe((prev) => (prev && prev.id === state.recipeId ? prev : recipes.find((r) => r.id === state.recipeId) || prev || null));
    } else {
      setSummaryRecipe(null);
    }

    if (state.view === 'share' && state.recipeId) {
      setRecipeToShare((prev) => (prev && prev.id === state.recipeId ? prev : recipes.find((r) => r.id === state.recipeId) || prev || null));
    } else {
      setRecipeToShare(null);
    }

    if (state.view === 'delete-recipe' && state.recipeId) {
      setRecipeToDelete((prev) => (prev && prev.id === state.recipeId ? prev : recipes.find((r) => r.id === state.recipeId) || prev || null));
    } else {
      setRecipeToDelete(null);
    }

    if (state.view !== 'import') {
      setRecipeToImport(null);
    }
  }, [recipes]);

  const closeSummary = useCallback((safeBack) => {
    setSummaryRecipe(null);
    safeBack('summary');
  }, []);

  const closeShare = useCallback((safeBack) => {
    setRecipeToShare(null);
    safeBack('share');
  }, []);

  const closeImport = useCallback((safeBack) => {
    setRecipeToImport(null);
    safeBack('import');
  }, []);

  const closeDeleteRecipe = useCallback((safeBack) => {
    setRecipeToDelete(null);
    safeBack('delete-recipe');
  }, []);

  const handleCloseStepEditor = useCallback((safeBack) => {
    setIsStepFormOpen(false);
    setStepInput(EMPTY_STEP_INPUT);
    setEditingStepIndex(null);
    setStepTitleError(false);
    safeBack('step-editor');
  }, []);

  const handleCancelForm = useCallback((isSaving = false, { safeBack, syncStateWithHistory } = {}) => {
    const originalRecipeToRestore = isSaving === true ? null : duplicatingFromRecipe;
    setIsCreating(false);
    setEditingRecipeId(null);
    setEditingStepIndex(null);
    setDuplicatingFromRecipe(null);
    setNewRecipe(EMPTY_RECIPE);
    setStepInput(EMPTY_STEP_INPUT);
    setStepTitleError(false);

    if (originalRecipeToRestore) {
      setSummaryRecipe(originalRecipeToRestore);
      window.history.replaceState({ view: 'summary', recipeId: originalRecipeToRestore.id }, '');
      if (syncStateWithHistory) syncStateWithHistory({ view: 'summary', recipeId: originalRecipeToRestore.id });
    } else {
      setSummaryRecipe(null);
      if (safeBack) safeBack('edit-recipe');
    }
  }, [duplicatingFromRecipe]);

  const handleSaveRecipe = useCallback((e, { showAlert, syncStateWithHistory, safeBack }) => {
    e.preventDefault();
    if (!newRecipe.name.trim()) {
      showAlert("Por favor, ingresa el nombre de la receta.", "error");
      return;
    }

    let finalSteps = [...newRecipe.steps];
    if (stepInput.title.trim()) {
      const stepToSave = {
        title: stepInput.title.trim(),
        water_g: Number(stepInput.water_g),
        duration_s: Number(stepInput.duration_s),
        instruction: stepInput.instruction.trim()
      };

      if (editingStepIndex !== null) {
        finalSteps[editingStepIndex] = {
          ...finalSteps[editingStepIndex],
          ...stepToSave
        };
      } else {
        finalSteps.push({
          step_number: finalSteps.length + 1,
          ...stepToSave
        });
      }
    }

    if (finalSteps.length === 0) {
      showAlert("Debes agregar al menos un paso de preparación.", "error");
      return;
    }

    const recipeData = {
      ...newRecipe,
      steps: finalSteps
    };

    if (editingRecipeId) {
      setRecipes((prev) => prev.map(r => r.id === editingRecipeId ? { ...r, ...recipeData, id: editingRecipeId } : r));
      if (summaryRecipe && summaryRecipe.id === editingRecipeId) {
        setSummaryRecipe((prev) => (prev ? { ...prev, ...recipeData, id: editingRecipeId } : null));
      }
      setSaveSuccessMessage({
        title: "¡Receta Actualizada!",
        body: "Los cambios en tu receta se han guardado correctamente."
      });
    } else {
      const created = {
        is_favorite: false,
        is_archived: false,
        ...recipeData,
        id: `custom-${crypto.randomUUID()}`
      };
      setRecipes((prev) => [...prev, created]);
      setSaveSuccessMessage({
        title: "¡Receta Guardada!",
        body: "Tu nueva receta ha sido creada y guardada correctamente."
      });
      setSummaryRecipe(null);
      setDuplicatingFromRecipe(null);
      window.history.replaceState({ view: 'main' }, '');
      if (syncStateWithHistory) syncStateWithHistory({ view: 'main' });
    }
    handleCancelForm(true, { safeBack, syncStateWithHistory });
  }, [newRecipe, stepInput, editingStepIndex, editingRecipeId, summaryRecipe, handleCancelForm]);

  const handleToggleFavorite = useCallback((recipeId) => {
    setRecipes((prevRecipes) => {
      const updated = prevRecipes.map((r) =>
        r.id === recipeId ? { ...r, is_favorite: !r.is_favorite } : r
      );
      safeSetItem('coffee_recipes_v1', updated);
      return updated;
    });

    if (summaryRecipe && summaryRecipe.id === recipeId) {
      setSummaryRecipe((prev) => (prev ? { ...prev, is_favorite: !prev.is_favorite } : null));
    }
  }, [summaryRecipe]);

  const handleArchiveRecipe = useCallback((recipeId, recipeName) => {
    setRecipes((prevRecipes) => {
      const updated = prevRecipes.map((r) =>
        r.id === recipeId ? { ...r, is_archived: true } : r
      );
      safeSetItem('coffee_recipes_v1', updated);
      return updated;
    });

    if (summaryRecipe && summaryRecipe.id === recipeId) {
      setSummaryRecipe((prev) => (prev ? { ...prev, is_archived: true } : null));
    }

    // Mostrar undo toast con nombre de la receta
    setUndoArchiveToast({ recipeId, recipeName });
  }, [summaryRecipe]);

  const handleUnarchiveRecipe = useCallback((recipeId) => {
    setRecipes((prevRecipes) => {
      const updated = prevRecipes.map((r) =>
        r.id === recipeId ? { ...r, is_archived: false } : r
      );
      safeSetItem('coffee_recipes_v1', updated);
      return updated;
    });

    if (summaryRecipe && summaryRecipe.id === recipeId) {
      setSummaryRecipe((prev) => (prev ? { ...prev, is_archived: false } : null));
    }

    // Si el undo toast apunta a esta receta, limpiarlo
    setUndoArchiveToast((prev) => (prev && prev.recipeId === recipeId ? null : prev));
  }, [summaryRecipe]);

  const handleUndoArchive = useCallback(() => {
    if (undoArchiveToast) {
      handleUnarchiveRecipe(undoArchiveToast.recipeId);
      setUndoArchiveToast(null);
    }
  }, [undoArchiveToast, handleUnarchiveRecipe]);

  const handleEditRecipe = useCallback((recipe, navigateTo) => {
    setNewRecipe({
      name: recipe.name,
      method: recipe.method || 'V60',
      coffee_g: recipe.coffee_g,
      grind_size: recipe.grind_size || '',
      water_temp_c: recipe.water_temp_c,
      bean_id: recipe.bean_id || '',
      steps: [...recipe.steps],
      is_favorite: Boolean(recipe.is_favorite),
      is_archived: Boolean(recipe.is_archived)
    });
    setEditingRecipeId(recipe.id);
    setDuplicatingFromRecipe(null);
    setIsCreating(true);
    navigateTo('edit-recipe', { recipeId: recipe.id });
  }, []);

  const handleDuplicateRecipe = useCallback((recipe, navigateTo) => {
    let copyName = `${recipe.name} (Copia)`;
    if (recipes.some((r) => r.name.toLowerCase() === copyName.toLowerCase())) {
      let counter = 2;
      while (recipes.some((r) => r.name.toLowerCase() === `${recipe.name} (Copia ${counter})`.toLowerCase())) {
        counter++;
      }
      copyName = `${recipe.name} (Copia ${counter})`;
    }

    setDuplicatingFromRecipe(recipe);
    setNewRecipe({
      name: copyName,
      method: recipe.method || 'V60',
      coffee_g: recipe.coffee_g,
      grind_size: recipe.grind_size || '',
      water_temp_c: recipe.water_temp_c,
      bean_id: recipe.bean_id || '',
      steps: recipe.steps ? recipe.steps.map((s) => ({ ...s })) : [],
      is_favorite: false,
      is_archived: false
    });
    setEditingRecipeId(null);
    setSummaryRecipe(null);
    setIsCreating(true);
    navigateTo('edit-recipe');
  }, [recipes]);

  const handleNewRecipeClick = useCallback((navigateTo) => {
    setDuplicatingFromRecipe(null);
    setNewRecipe(EMPTY_RECIPE);
    setEditingRecipeId(null);
    setIsCreating(true);
    navigateTo('edit-recipe');
  }, []);

  const handleDeleteRecipe = useCallback((recipe, e, navigateTo) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    setRecipeToDelete(recipe);
    navigateTo('delete-recipe', { recipeId: recipe.id });
  }, []);

  const handleConfirmDeleteRecipe = useCallback((showAlert, safeBack) => {
    if (!recipeToDelete) return;
    setRecipes((prev) => prev.filter(r => r.id !== recipeToDelete.id));
    closeDeleteRecipe(safeBack);
    showAlert("Receta eliminada correctamente.", "success");
  }, [recipeToDelete, closeDeleteRecipe]);

  const handleExportJson = useCallback((recipe) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recipe, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${recipe.name.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, []);

  const confirmImportRecipe = useCallback(({ showAlert, syncStateWithHistory, setActiveTab }) => {
    if (!recipeToImport) return;

    const uniqueId = `imported-${crypto.randomUUID()}`;
    let recipeName = recipeToImport.name.trim();

    const nameExists = recipes.some((r) => r.name.toLowerCase() === recipeName.toLowerCase());
    if (nameExists) {
      let counter = 1;
      while (recipes.some((r) => r.name.toLowerCase() === `${recipeName} (${counter})`.toLowerCase())) {
        counter++;
      }
      recipeName = `${recipeName} (${counter})`;
    }

    const updated = {
      ...recipeToImport,
      id: uniqueId,
      name: recipeName
    };

    setRecipes((prev) => [...prev, updated]);
    showAlert(`Receta importada correctamente como "${recipeName}".`, "success");
    
    setRecipeToImport(null);
    window.history.replaceState({ view: 'main' }, '');
    if (syncStateWithHistory) syncStateWithHistory({ view: 'main' });
    if (setActiveTab) setActiveTab('recipes');
  }, [recipeToImport, recipes]);

  const handleAddStepToForm = useCallback(({ showAlert, safeBack }) => {
    if (!stepInput.title.trim()) {
      setStepTitleError(true);
      showAlert("Por favor ingresa un título para el paso.", "error");
      return;
    }

    setStepTitleError(false);

    if (editingStepIndex !== null) {
      setNewRecipe((prev) => {
        const updatedSteps = [...prev.steps];
        updatedSteps[editingStepIndex] = {
          ...updatedSteps[editingStepIndex],
          title: stepInput.title.trim(),
          water_g: Number(stepInput.water_g),
          duration_s: Number(stepInput.duration_s),
          instruction: stepInput.instruction.trim()
        };
        return { ...prev, steps: updatedSteps };
      });
    } else {
      setNewRecipe((prev) => ({
        ...prev,
        steps: [
          ...prev.steps,
          {
            step_number: prev.steps.length + 1,
            title: stepInput.title.trim(),
            water_g: Number(stepInput.water_g),
            duration_s: Number(stepInput.duration_s),
            instruction: stepInput.instruction.trim()
          }
        ]
      }));
    }
    handleCloseStepEditor(safeBack);
  }, [stepInput, editingStepIndex, handleCloseStepEditor]);

  const handleOpenStepEditor = useCallback((idx = null, navigateTo) => {
    if (idx !== null) {
      const step = newRecipe.steps[idx];
      setStepInput({
        title: step.title,
        water_g: step.water_g,
        duration_s: step.duration_s,
        instruction: step.instruction || ''
      });
      setEditingStepIndex(idx);
    } else {
      setStepInput(EMPTY_STEP_INPUT);
      setEditingStepIndex(null);
    }
    setStepTitleError(false);
    setIsStepFormOpen(true);
    navigateTo('step-editor', { stepIndex: idx });
  }, [newRecipe.steps]);

  const handleMoveStep = useCallback((idx, direction) => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === newRecipe.steps.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    setNewRecipe((prev) => {
      const steps = [...prev.steps];
      const temp = steps[idx];
      steps[idx] = steps[targetIdx];
      steps[targetIdx] = temp;

      const updatedSteps = steps.map((s, i) => ({
        ...s,
        step_number: i + 1
      }));

      return { ...prev, steps: updatedSteps };
    });

    if (editingStepIndex === idx) {
      setEditingStepIndex(targetIdx);
    } else if (editingStepIndex === targetIdx) {
      setEditingStepIndex(idx);
    }
  }, [newRecipe.steps.length, editingStepIndex]);

  const handleSelectSummary = useCallback((recipe, navigateTo) => {
    setSummaryRecipe(recipe);
    navigateTo('summary', { recipeId: recipe.id });
  }, []);

  const handleShareRecipe = useCallback((recipe, navigateTo) => {
    navigateTo('share', { recipeId: recipe.id });
  }, []);

  const handleShareFromSummary = useCallback((recipeId, navigateTo) => {
    navigateTo('share', { recipeId });
  }, []);

  const handleDeleteFromSummary = useCallback((recipe, e, safeBack, navigateTo) => {
    handleDeleteRecipe(recipe, e, navigateTo);
    closeSummary(safeBack);
  }, [handleDeleteRecipe, closeSummary]);

  const handleEditFromSummary = useCallback((recipe, safeBack, navigateTo) => {
    handleEditRecipe(recipe, navigateTo);
    closeSummary(safeBack);
  }, [handleEditRecipe, closeSummary]);

  const groupedRecipes = useMemo(() => {
    // Aplicar filtro de visibilidad de archivado
    const visibleRecipes = recipeFilterMode === 'archived'
      ? recipes.filter((r) => r.is_archived)
      : recipeFilterMode === 'all'
      ? recipes
      : recipes.filter((r) => !r.is_archived);

    const groups = visibleRecipes.reduce((acc, recipe) => {
      const method = recipe.method || 'Otros';
      if (!acc[method]) {
        acc[method] = [];
      }
      acc[method].push(recipe);
      return acc;
    }, {});

    Object.keys(groups).forEach((method) => {
      groups[method].sort((a, b) => {
        if (!!a.is_favorite === !!b.is_favorite) return 0;
        return a.is_favorite ? -1 : 1;
      });
    });

    return groups;
  }, [recipes, recipeFilterMode]);

  const activeCount = useMemo(() => recipes.filter((r) => !r.is_archived).length, [recipes]);
  const archivedCount = useMemo(() => recipes.filter((r) => r.is_archived).length, [recipes]);
  const totalCount = useMemo(() => recipes.length, [recipes]);

  const totalStepsTime = useMemo(
    () => newRecipe.steps.reduce((sum, s) => sum + (Number(s.duration_s) || 0), 0),
    [newRecipe.steps]
  );
  const totalStepsWater = useMemo(
    () => newRecipe.steps.reduce((sum, s) => sum + (Number(s.water_g) || 0), 0),
    [newRecipe.steps]
  );

  return {
    recipes,
    setRecipes,
    collapsedMethods,
    setCollapsedMethods,
    isCreating,
    setIsCreating,
    editingRecipeId,
    setEditingRecipeId,
    editingStepIndex,
    setEditingStepIndex,
    menuOpenRecipeId,
    setMenuOpenRecipeId,
    summaryRecipe,
    setSummaryRecipe,
    duplicatingFromRecipe,
    setDuplicatingFromRecipe,
    recipeToShare,
    setRecipeToShare,
    recipeToImport,
    setRecipeToImport,
    recipeToDelete,
    setRecipeToDelete,
    saveSuccessMessage,
    setSaveSuccessMessage,
    newRecipe,
    setNewRecipe,
    stepInput,
    setStepInput,
    stepTitleError,
    setStepTitleError,
    isStepFormOpen,
    setIsStepFormOpen,
    groupedRecipes,
    totalStepsTime,
    totalStepsWater,
    toggleMethodCollapse,
    syncWithHistory,
    closeSummary,
    closeShare,
    closeImport,
    closeDeleteRecipe,
    handleCloseStepEditor,
    handleCancelForm,
    handleSaveRecipe,
    handleToggleFavorite,
    handleArchiveRecipe,
    handleUnarchiveRecipe,
    handleUndoArchive,
    recipeFilterMode,
    setRecipeFilterMode,
    undoArchiveToast,
    setUndoArchiveToast,
    activeCount,
    archivedCount,
    totalCount,
    handleEditRecipe,
    handleDuplicateRecipe,
    handleNewRecipeClick,
    handleDeleteRecipe,
    handleConfirmDeleteRecipe,
    handleExportJson,
    confirmImportRecipe,
    handleAddStepToForm,
    handleOpenStepEditor,
    handleMoveStep,
    handleSelectSummary,
    handleShareRecipe,
    handleShareFromSummary,
    handleDeleteFromSummary,
    handleEditFromSummary
  };
}
