import { useCallback } from 'react';
import { TrashIcon, WarningTriangleIcon, CloseIcon } from './components/icons/SvgIcons';
import TimerComponent from './components/TimerComponent';
import ShareModal from './components/ShareModal';
import ShareBeanModal from './components/ShareBeanModal';
import ImportConfirmationModal from './components/ImportConfirmationModal';
import ImportBeanConfirmationModal from './components/ImportBeanConfirmationModal';
import NotificationModal from './components/NotificationModal';
import AboutModal from './components/modals/AboutModal';
import SettingsModal from './components/modals/SettingsModal';
import RecipeSummaryModal from './components/modals/RecipeSummaryModal';
import RecipeFormModal from './components/modals/RecipeFormModal';
import BeanFormModal from './components/modals/BeanFormModal';
import RecipesTab from './components/tabs/RecipesTab';
import BeansTab from './components/tabs/BeansTab';
import HistoryTab from './components/tabs/HistoryTab';
import RecipeLibraryTab from './components/tabs/RecipeLibraryTab';
import { DEFAULT_TASTING_NOTES } from './constants/defaultData';
import { useRecipes } from './hooks/useRecipes';
import { useBeans } from './hooks/useBeans';
import { useHistory } from './hooks/useHistory';
import { useNavigation } from './hooks/useNavigation';
import { useRecipeLibrary } from './hooks/useRecipeLibrary';

export default function App() {
  const recipesState = useRecipes();
  const beansState = useBeans();
  const historyState = useHistory();

  const navigationState = useNavigation({
    recipesSync: recipesState.syncWithHistory,
    beansSync: beansState.syncWithHistory,
    historySync: historyState.syncWithHistory,
    recipes: recipesState.recipes,
    setRecipeToImport: recipesState.setRecipeToImport,
    setBeanToImport: beansState.setBeanToImport
  });

  const recipeLibraryState = useRecipeLibrary({ userRecipes: recipesState.recipes });

  const {
    recipes,
    setRecipes,
    collapsedMethods,
    isCreating,
    editingRecipeId,
    editingStepIndex,
    setEditingStepIndex,
    menuOpenRecipeId,
    setMenuOpenRecipeId,
    summaryRecipe,
    recipeToShare,
    recipeToImport,
    recipeToDelete,
    saveSuccessMessage,
    setSaveSuccessMessage,
    newRecipe,
    setNewRecipe,
    stepInput,
    setStepInput,
    stepTitleError,
    setStepTitleError,
    isStepFormOpen,
    groupedRecipes,
    totalStepsTime,
    totalStepsWater,
    toggleMethodCollapse,
    closeSummary,
    closeShare,
    closeImport,
    closeDeleteRecipe,
    handleCloseStepEditor,
    handleCancelForm,
    handleSaveRecipe,
    handleToggleFavorite,
    handleEditRecipe,
    handleDuplicateRecipe,
    handleNewRecipeClick,
    handleDeleteRecipe,
    handleConfirmDeleteRecipe,
    confirmImportRecipe,
    handleAddStepToForm,
    handleOpenStepEditor,
    handleMoveStep,
    handleSelectSummary,
    handleShareRecipe,
    handleShareFromSummary,
    handleDeleteFromSummary
  } = recipesState;

  const {
    beans,
    isEditingBean,
    editingBeanId,
    newBean,
    setNewBean,
    customTastingNote,
    setCustomTastingNote,
    beanSearchQuery,
    setBeanSearchQuery,
    beanToDelete,
    beanToShare,
    beanToImport,
    closeShareBean,
    closeImportBean,
    closeDeleteBean,
    handleCancelBean,
    handleAddTastingNote,
    handleRemoveTastingNote,
    handleSaveBean,
    handleStartEditBean,
    handleStartNewBean,
    handleDeleteBeanClick,
    handleConfirmDeleteBean,
    confirmImportBean,
    handleShareBean
  } = beansState;

  const {
    history,
    editingHistoryId,
    setEditingHistoryId,
    editingHistoryNotes,
    setEditingHistoryNotes,
    editingHistoryRating,
    setEditingHistoryRating,
    editingHistoryDescriptors,
    setEditingHistoryDescriptors,
    historyEntryToDelete,
    showClearHistoryConfirm,
    autoLogEnabled,
    setAutoLogEnabled,
    closeDeleteHistoryEntry,
    closeClearHistory,
    handleStartEditHistory,
    handleDeleteHistoryEntry,
    handleConfirmDeleteHistoryEntry,
    handleConfirmClearHistory,
    handleUpdateHistoryEntry,
    handleOpenClearHistory,
    handleTimerComplete
  } = historyState;

  const {
    activeTab,
    setActiveTab,
    activeRecipe,
    autoStartTimer,
    isAboutOpen,
    isSettingsOpen,
    isLibraryOpen,
    soundEnabled,
    setSoundEnabled,
    vibrationEnabled,
    setVibrationEnabled,
    vibrationType,
    setVibrationType,
    voiceGuidanceEnabled,
    setVoiceGuidanceEnabled,
    theme,
    setTheme,
    customAlert,
    setCustomAlert,
    isTwa,
    showAlert,
    syncStateWithHistory,
    navigateTo,
    safeBack,
    closeTimer,
    closeSettings,
    closeAbout,
    closeLibrary,
    handleUnifiedImportJson,
    handleStartTimerImmediate,
    handleStartTimerFromSummary,
    handleOpenAboutFromSettings,
    handleOpenAboutFromHeader,
    handleOpenSettingsFromHeader,
    handleOpenLibrary
  } = navigationState;

  const handleLibraryImportRecipe = useCallback((libraryRecipe) => {
    if (!libraryRecipe) return;

    const uniqueId = `imported-${crypto.randomUUID()}`;
    let recipeName = libraryRecipe.name.trim();

    const nameExists = recipes.some((r) => r.name.toLowerCase() === recipeName.toLowerCase());
    if (nameExists) {
      let counter = 1;
      while (recipes.some((r) => r.name.toLowerCase() === `${recipeName} (${counter})`.toLowerCase())) {
        counter++;
      }
      recipeName = `${recipeName} (${counter})`;
    }

    const importedRecipe = {
      ...libraryRecipe,
      id: uniqueId,
      name: recipeName
    };

    setRecipes((prev) => [...prev, importedRecipe]);
    showAlert(`Receta "${recipeName}" agregada a tu catálogo personal.`, "success");
  }, [recipes, setRecipes, showAlert]);

  const handleLibrarySelectSummary = useCallback((libraryRecipe) => {
    recipesState.setSummaryRecipe(libraryRecipe);
    navigateTo('summary', { recipeId: libraryRecipe.id, fromLibrary: true });
  }, [recipesState, navigateTo]);

  const formatSecondsToMinutes = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }, []);

  const onSaveRecipe = useCallback((e) => {
    handleSaveRecipe(e, { showAlert, syncStateWithHistory, safeBack });
  }, [handleSaveRecipe, showAlert, syncStateWithHistory, safeBack]);

  const onCancelForm = useCallback((isSaving) => {
    handleCancelForm(isSaving, { safeBack, syncStateWithHistory });
  }, [handleCancelForm, safeBack, syncStateWithHistory]);

  const onConfirmDeleteRecipe = useCallback(() => {
    handleConfirmDeleteRecipe(showAlert, safeBack);
  }, [handleConfirmDeleteRecipe, showAlert, safeBack]);

  const onConfirmImportRecipe = useCallback(() => {
    confirmImportRecipe({ showAlert, syncStateWithHistory, setActiveTab });
  }, [confirmImportRecipe, showAlert, syncStateWithHistory, setActiveTab]);

  const onAddStepToForm = useCallback(() => {
    handleAddStepToForm({ showAlert, safeBack });
  }, [handleAddStepToForm, showAlert, safeBack]);

  const onOpenStepEditor = useCallback((idx) => {
    handleOpenStepEditor(idx, navigateTo);
  }, [handleOpenStepEditor, navigateTo]);

  const onCloseStepEditor = useCallback(() => {
    handleCloseStepEditor(safeBack);
  }, [handleCloseStepEditor, safeBack]);

  const onEditRecipe = useCallback((recipe) => {
    handleEditRecipe(recipe, navigateTo);
  }, [handleEditRecipe, navigateTo]);

  const onDuplicateRecipe = useCallback((recipe) => {
    handleDuplicateRecipe(recipe, navigateTo);
  }, [handleDuplicateRecipe, navigateTo]);

  const onNewRecipeClick = useCallback(() => {
    handleNewRecipeClick(navigateTo);
  }, [handleNewRecipeClick, navigateTo]);

  const onDeleteRecipe = useCallback((recipe, e) => {
    handleDeleteRecipe(recipe, e, navigateTo);
  }, [handleDeleteRecipe, navigateTo]);

  const onSelectSummary = useCallback((recipe) => {
    handleSelectSummary(recipe, navigateTo);
  }, [handleSelectSummary, navigateTo]);

  const onShareRecipe = useCallback((recipe) => {
    handleShareRecipe(recipe, navigateTo);
  }, [handleShareRecipe, navigateTo]);

  const onShareFromSummary = useCallback((recipeId) => {
    handleShareFromSummary(recipeId, navigateTo);
  }, [handleShareFromSummary, navigateTo]);

  const onDeleteFromSummary = useCallback((recipe, e) => {
    handleDeleteFromSummary(recipe, e, safeBack, navigateTo);
  }, [handleDeleteFromSummary, safeBack, navigateTo]);

  const onCloseSummary = useCallback(() => {
    closeSummary(safeBack);
  }, [closeSummary, safeBack]);

  const onCloseShare = useCallback(() => {
    closeShare(safeBack);
  }, [closeShare, safeBack]);

  const onCloseImport = useCallback(() => {
    closeImport(safeBack);
  }, [closeImport, safeBack]);

  const onCloseDeleteRecipe = useCallback(() => {
    closeDeleteRecipe(safeBack);
  }, [closeDeleteRecipe, safeBack]);

  const onSaveBean = useCallback((e) => {
    handleSaveBean(e, { showAlert, safeBack });
  }, [handleSaveBean, showAlert, safeBack]);

  const onStartEditBean = useCallback((bean) => {
    handleStartEditBean(bean, navigateTo);
  }, [handleStartEditBean, navigateTo]);

  const onStartNewBean = useCallback(() => {
    handleStartNewBean(navigateTo);
  }, [handleStartNewBean, navigateTo]);

  const onDeleteBeanClick = useCallback((bean) => {
    handleDeleteBeanClick(bean, navigateTo);
  }, [handleDeleteBeanClick, navigateTo]);

  const onConfirmDeleteBean = useCallback(() => {
    handleConfirmDeleteBean({ setRecipes, showAlert, safeBack });
  }, [handleConfirmDeleteBean, setRecipes, showAlert, safeBack]);

  const onCancelBean = useCallback(() => {
    handleCancelBean(safeBack);
  }, [handleCancelBean, safeBack]);

  const onConfirmImportBean = useCallback(() => {
    confirmImportBean({ showAlert, syncStateWithHistory, setActiveTab });
  }, [confirmImportBean, showAlert, syncStateWithHistory, setActiveTab]);

  const onShareBean = useCallback((beanId) => {
    handleShareBean(beanId, navigateTo);
  }, [handleShareBean, navigateTo]);

  const onCloseShareBean = useCallback(() => {
    closeShareBean(safeBack);
  }, [closeShareBean, safeBack]);

  const onCloseImportBean = useCallback(() => {
    closeImportBean(safeBack);
  }, [closeImportBean, safeBack]);

  const onCloseDeleteBean = useCallback(() => {
    closeDeleteBean(safeBack);
  }, [closeDeleteBean, safeBack]);

  const onStartEditHistory = useCallback((entry) => {
    handleStartEditHistory(entry, navigateTo);
  }, [handleStartEditHistory, navigateTo]);

  const onDeleteHistoryEntry = useCallback((entry) => {
    handleDeleteHistoryEntry(entry, navigateTo);
  }, [handleDeleteHistoryEntry, navigateTo]);

  const onConfirmDeleteHistoryEntry = useCallback(() => {
    handleConfirmDeleteHistoryEntry(safeBack);
  }, [handleConfirmDeleteHistoryEntry, safeBack]);

  const onConfirmClearHistory = useCallback(() => {
    handleConfirmClearHistory(safeBack);
  }, [handleConfirmClearHistory, safeBack]);

  const onCloseDeleteHistoryEntry = useCallback(() => {
    closeDeleteHistoryEntry(safeBack);
  }, [closeDeleteHistoryEntry, safeBack]);

  const onCloseClearHistory = useCallback(() => {
    closeClearHistory(safeBack);
  }, [closeClearHistory, safeBack]);

  const onTimerComplete = useCallback((rating, notes, descriptors) => {
    handleTimerComplete({ activeRecipe, beans, closeTimer }, rating, notes, descriptors);
  }, [handleTimerComplete, activeRecipe, beans, closeTimer]);

  return (
    <div className="min-h-dvh bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 px-3 pb-3 md:px-4 md:pb-4 font-sans flex flex-col items-center transition-colors duration-300">
      <header className="sticky top-0 z-30 w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl py-2.5 md:py-3 mb-3 md:mb-4 flex justify-between items-center px-1 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors duration-300">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-9 md:h-9 text-amber-900 dark:text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Steam lines */}
              <path d="M8.5 3c.5.8.5 1.5 0 2.3s-.8 1.5-.4 2.3" />
              <path d="M12 2.5c.5.8.5 1.5 0 2.3s-.8 1.5-.4 2.3" />
              <path d="M15.5 3c.5.8.5 1.5 0 2.3s-.8 1.5-.4 2.3" />
              {/* Cup body */}
              <path d="M6 11h12a1 1 0 0 1 1 1v1.5a5.5 5.5 0 0 1-5.5 5.5h-3A5.5 5.5 0 0 1 5 13.5V12a1 1 0 0 1 1-1z" fill="currentColor" fillOpacity="0.15" />
              {/* Cup handle */}
              <path d="M19 12.5h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1" />
              {/* Saucer */}
              <path d="M4.5 20.5c0 .5 3.36 1 7.5 1s7.5-.5 7.5-1" />
            </svg>
            <h1 className="text-2xl md:text-3xl font-extrabold text-amber-900 dark:text-amber-500 tracking-tight">Barista Timer</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">Administra tus recetas y tiempos de extracción</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleOpenAboutFromHeader}
            className="px-2.5 py-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 text-xs font-semibold"
            title="Acerca de"
          >
            <span className="text-sm">ⓘ</span>
            <span className="hidden sm:inline">Acerca de</span>
          </button>
          <button
            onClick={handleOpenSettingsFromHeader}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-600 dark:text-slate-200 flex items-center justify-center"
            title="Configuración"
          >
            <svg className="w-5 h-5 transition-transform duration-300 hover:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 p-4 md:p-6 relative transition-colors duration-300">
        {isLibraryOpen ? (
          <RecipeLibraryTab
            recipes={recipeLibraryState.recipes}
            filteredRecipes={recipeLibraryState.filteredRecipes}
            methodsList={recipeLibraryState.methodsList}
            isLoading={recipeLibraryState.isLoading}
            error={recipeLibraryState.error}
            isOffline={recipeLibraryState.isOffline}
            searchQuery={recipeLibraryState.searchQuery}
            setSearchQuery={recipeLibraryState.setSearchQuery}
            selectedMethod={recipeLibraryState.selectedMethod}
            setSelectedMethod={recipeLibraryState.setSelectedMethod}
            isRecipeImported={recipeLibraryState.isRecipeImported}
            onSelectRecipe={handleLibrarySelectSummary}
            onImportRecipe={handleLibraryImportRecipe}
            onClose={closeLibrary}
            onReload={recipeLibraryState.reloadCatalog}
          />
        ) : activeRecipe ? (
          <div>
            <button
              onClick={closeTimer}
              className="mb-4 text-amber-800 dark:text-amber-500 hover:text-amber-950 dark:hover:text-amber-400 font-semibold text-sm flex items-center gap-1 cursor-pointer"
            >
              ← Volver al listado
            </button>
            <TimerComponent
              recipe={activeRecipe}
              soundEnabled={soundEnabled}
              vibrationEnabled={vibrationEnabled}
              vibrationType={vibrationType}
              voiceGuidanceEnabled={voiceGuidanceEnabled}
              beanName={activeRecipe.bean_id ? beans.find(b => b.id === activeRecipe.bean_id)?.name : ''}
              autoStart={autoStartTimer}
              onComplete={onTimerComplete}
            />
          </div>
        ) : isCreating ? (
          <RecipeFormModal
            editingRecipeId={editingRecipeId}
            newRecipe={newRecipe}
            setNewRecipe={setNewRecipe}
            beans={beans}
            editingStepIndex={editingStepIndex}
            setEditingStepIndex={setEditingStepIndex}
            totalStepsTime={totalStepsTime}
            totalStepsWater={totalStepsWater}
            handleSaveRecipe={onSaveRecipe}
            handleOpenStepEditor={onOpenStepEditor}
            handleCloseStepEditor={onCloseStepEditor}
            handleMoveStep={handleMoveStep}
            handleCancelForm={onCancelForm}
          />
        ) : (
          <div className="space-y-4">
            {/* Tab Selector */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('recipes')}
                className={`flex-1 pb-2.5 text-center font-bold text-sm border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'recipes' ? 'border-amber-800 dark:border-amber-500 text-amber-900 dark:text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  {/* Grabado de taza */}
                  <path d="M9 10h4a1 1 0 0 1 1 1v1.5a2.5 2.5 0 0 1-5 0V11z" />
                  <path d="M14 11h1a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1h-1" />
                </svg>
                <span>Recetas</span>
              </button>
              <button
                onClick={() => setActiveTab('beans')}
                className={`flex-1 pb-2.5 text-center font-bold text-sm border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'beans' ? 'border-amber-800 dark:border-amber-500 text-amber-900 dark:text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  {/* Left bean */}
                  <path d="M9.5 7.5a4.24 4.24 0 0 0-6 0c-2.12 2.12-1.68 5.4 0.7 7.78s5.66 2.82 7.78.7a4.24 4.24 0 0 0 0-6z" fill="currentColor" fillOpacity="0.15" />
                  <path d="M3.5 13.5c1.5-1 3-1.5 4.5-3" />
                  
                  {/* Right bean */}
                  <path d="M14.5 9.5a4.24 4.24 0 0 1 6 0c2.12 2.12 1.68 5.4-0.7 7.78s-5.66 2.82-7.78.7a4.24 4.24 0 0 1 0-6z" fill="currentColor" fillOpacity="0.15" />
                  <path d="M20.5 13.5c-1.5-1-3-1.5-4.5-3" />
                </svg>
                <span>Granos</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 pb-2.5 text-center font-bold text-sm border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'history' ? 'border-amber-800 dark:border-amber-500 text-amber-900 dark:text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M12 7v5l4 2" />
                </svg>
                <span>Historial</span>
              </button>
            </div>

            {activeTab === 'recipes' && (
              <RecipesTab
                groupedRecipes={groupedRecipes}
                collapsedMethods={collapsedMethods}
                toggleMethodCollapse={toggleMethodCollapse}
                menuOpenRecipeId={menuOpenRecipeId}
                setMenuOpenRecipeId={setMenuOpenRecipeId}
                onNewRecipe={onNewRecipeClick}
                onOpenLibrary={handleOpenLibrary}
                onSelectSummary={onSelectSummary}
                onStartTimerImmediate={handleStartTimerImmediate}
                onEditRecipe={onEditRecipe}
                onShareRecipe={onShareRecipe}
                onDuplicateRecipe={onDuplicateRecipe}
                onDeleteRecipe={onDeleteRecipe}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === 'beans' && (
              <BeansTab
                beans={beans}
                beanSearchQuery={beanSearchQuery}
                setBeanSearchQuery={setBeanSearchQuery}
                onAddBean={onStartNewBean}
                onEditBean={onStartEditBean}
                onDeleteBean={onDeleteBeanClick}
                onShareBean={onShareBean}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab
                history={history}
                autoLogEnabled={autoLogEnabled}
                setAutoLogEnabled={setAutoLogEnabled}
                onClearHistory={handleOpenClearHistory}
                editingHistoryId={editingHistoryId}
                setEditingHistoryId={setEditingHistoryId}
                editingHistoryNotes={editingHistoryNotes}
                setEditingHistoryNotes={setEditingHistoryNotes}
                editingHistoryRating={editingHistoryRating}
                setEditingHistoryRating={setEditingHistoryRating}
                editingHistoryDescriptors={editingHistoryDescriptors}
                setEditingHistoryDescriptors={setEditingHistoryDescriptors}
                onStartEditHistory={onStartEditHistory}
                onDeleteHistoryEntry={onDeleteHistoryEntry}
                onUpdateHistoryEntry={handleUpdateHistoryEntry}
                safeBack={safeBack}
              />
            )}
          </div>
        )}

        <RecipeSummaryModal
          summaryRecipe={summaryRecipe}
          beans={beans}
          onClose={onCloseSummary}
          onShare={onShareFromSummary}
          onDelete={onDeleteFromSummary}
          onStartTimer={handleStartTimerFromSummary}
          formatSecondsToMinutes={formatSecondsToMinutes}
          onToggleFavorite={handleToggleFavorite}
          isLibraryPreview={isLibraryOpen}
          isImported={summaryRecipe ? recipeLibraryState.isRecipeImported(summaryRecipe) : false}
          onImport={(r) => handleLibraryImportRecipe(r)}
        />

        {isStepFormOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center p-0 md:p-4">
            {/* Backdrop Blur Overlay */}
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
              onClick={onCloseStepEditor}
            />

            {/* Bottom Sheet Modal Container */}
            <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl p-5 border-t md:border border-slate-200 dark:border-slate-800 z-10 max-w-md transform transition-transform animate-slide-up space-y-4 text-left">
              {/* Drag handle bar / Indicator (mobile only) */}
              <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full md:hidden mb-2" />

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-400 flex items-center gap-1">
                  <span>⚡</span> {editingStepIndex !== null ? `Editando Paso ${editingStepIndex + 1}` : 'Agregar Paso de Preparación'}
                </span>
                <button
                  type="button"
                  onClick={onCloseStepEditor}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    placeholder="Título del paso"
                    value={stepInput.title}
                    onChange={(e) => {
                      setStepInput({ ...stepInput, title: e.target.value });
                      if (e.target.value.trim()) setStepTitleError(false);
                    }}
                    className={`w-full p-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${stepTitleError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  />
                  {stepTitleError && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">
                      El título del paso es obligatorio.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5 pl-1">Agua a verter (g)</label>
                    <input
                      type="number"
                      placeholder="Agua (g)"
                      value={stepInput.water_g || ''}
                      onChange={(e) => setStepInput({ ...stepInput, water_g: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5 pl-1">Duración (segundos)</label>
                    <input
                      type="number"
                      placeholder="Tiempo (s)"
                      value={stepInput.duration_s || ''}
                      onChange={(e) => setStepInput({ ...stepInput, duration_s: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Instrucción corta"
                    value={stepInput.instruction}
                    onChange={(e) => setStepInput({ ...stepInput, instruction: e.target.value })}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onCloseStepEditor}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer text-center"
                >
                  Cancelar edición
                </button>
                <button
                  type="button"
                  onClick={onAddStepToForm}
                  className={`flex-[1.5] py-2 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm ${editingStepIndex !== null ? 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700' : 'bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800'}`}
                >
                  {editingStepIndex !== null ? '✓ Guardar Cambios en Paso' : '+ Agregar Paso a la lista'}
                </button>
              </div>
            </div>
          </div>
        )}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          theme={theme}
          setTheme={setTheme}
          voiceGuidanceEnabled={voiceGuidanceEnabled}
          setVoiceGuidanceEnabled={setVoiceGuidanceEnabled}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          vibrationEnabled={vibrationEnabled}
          setVibrationEnabled={setVibrationEnabled}
          vibrationType={vibrationType}
          setVibrationType={setVibrationType}
          onUnifiedImportJson={handleUnifiedImportJson}
          onOpenAbout={handleOpenAboutFromSettings}
        />

        <AboutModal
          isOpen={isAboutOpen}
          onClose={closeAbout}
          isTwa={isTwa}
        />

        {recipeToShare && (
          <ShareModal
            recipe={recipeToShare}
            onClose={onCloseShare}
            onAlert={showAlert}
          />
        )}

        {recipeToImport && (
          <ImportConfirmationModal
            recipe={recipeToImport}
            existingRecipes={recipes}
            onConfirm={onConfirmImportRecipe}
            onCancel={onCloseImport}
          />
        )}

        {beanToShare && (
          <ShareBeanModal
            bean={beanToShare}
            onClose={onCloseShareBean}
            onAlert={showAlert}
          />
        )}

        {beanToImport && (
          <ImportBeanConfirmationModal
            bean={beanToImport}
            existingBeans={beans}
            onConfirm={onConfirmImportBean}
            onCancel={onCloseImportBean}
          />
        )}

        {saveSuccessMessage && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 md:p-6 shadow-xl border border-slate-100 dark:border-slate-800 text-center space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-center text-emerald-600 dark:text-emerald-500 animate-bounce my-2">
                <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {saveSuccessMessage.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {saveSuccessMessage.body}
                </p>
              </div>

              <button 
                type="button"
                onClick={() => setSaveSuccessMessage(null)}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shadow-sm cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        <BeanFormModal
          isOpen={isEditingBean}
          editingBeanId={editingBeanId}
          newBean={newBean}
          setNewBean={setNewBean}
          customTastingNote={customTastingNote}
          setCustomTastingNote={setCustomTastingNote}
          DEFAULT_TASTING_NOTES={DEFAULT_TASTING_NOTES}
          handleSaveBean={onSaveBean}
          handleCancelBean={onCancelBean}
          handleAddTastingNote={handleAddTastingNote}
          handleRemoveTastingNote={handleRemoveTastingNote}
        />

        {beanToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4 text-center">
              <div className="flex justify-center text-red-500 dark:text-red-400 my-1"><TrashIcon className="w-10 h-10" /></div>
              {recipes.some((r) => r.bean_id === beanToDelete.id) ? (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Eliminar Grano en Uso</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    El grano <strong className="text-slate-700 dark:text-slate-300">"{beanToDelete.name}"</strong> está vinculado a las siguientes recetas:
                  </p>
                  <ul className="text-xs text-amber-900 dark:text-amber-400 font-bold mt-2 max-h-24 overflow-y-auto space-y-1 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-xl border border-amber-200/20 list-disc list-inside text-left">
                    {recipes
                      .filter((r) => r.bean_id === beanToDelete.id)
                      .map((r) => (
                        <li key={r.id} className="truncate">{r.name}</li>
                      ))}
                  </ul>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                    Si procedes, el grano se eliminará permanentemente y las recetas quedarán sin grano vinculado.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Eliminar Grano</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    ¿Estás seguro de que deseas eliminar el grano <strong className="text-slate-700 dark:text-slate-300">"{beanToDelete.name}"</strong>? Esta acción no se puede deshacer.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onCloseDeleteBean}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirmDeleteBean}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {recipeToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4 text-center">
              <div className="flex justify-center text-red-500 dark:text-red-400 my-1"><TrashIcon className="w-10 h-10" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Eliminar Receta</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  ¿Estás seguro de que deseas eliminar la receta <strong className="text-slate-700 dark:text-slate-300">"{recipeToDelete.name}"</strong>? Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onCloseDeleteRecipe}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirmDeleteRecipe}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {historyEntryToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4 text-center">
              <div className="flex justify-center text-red-500 dark:text-red-400 my-1"><TrashIcon className="w-10 h-10" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Eliminar Registro</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  ¿Estás seguro de que deseas eliminar la preparación de <strong className="text-slate-700 dark:text-slate-300">"{historyEntryToDelete.recipeName}"</strong> del historial? Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onCloseDeleteHistoryEntry}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirmDeleteHistoryEntry}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {showClearHistoryConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4 text-center">
              <div className="flex justify-center text-amber-500 dark:text-amber-400 my-1"><WarningTriangleIcon className="w-10 h-10" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Limpiar Historial</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  ¿Estás seguro de que deseas limpiar todo tu historial de preparaciones? Esta acción eliminará permanentemente todos los registros y no se puede deshacer.
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onCloseClearHistory}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirmClearHistory}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  Sí, Limpiar Todo
                </button>
              </div>
            </div>
          </div>
        )}

        {customAlert && (
          <NotificationModal
            message={customAlert.message}
            type={customAlert.type}
            title={customAlert.title}
            onClose={() => setCustomAlert(null)}
          />
        )}
      </main>
    </div>
  );
}
