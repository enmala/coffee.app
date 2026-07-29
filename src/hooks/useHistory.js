import { useState, useEffect, useCallback } from 'react';
import { safeGetItem, safeSetItem } from '../utils/storageUtils';

export function useHistory() {
  const [history, setHistory] = useState(() => {
    return safeGetItem('coffee_history_v1', [], Array.isArray);
  });

  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [editingHistoryNotes, setEditingHistoryNotes] = useState(null);
  const [editingHistoryRating, setEditingHistoryRating] = useState(0);
  const [editingHistoryDescriptors, setEditingHistoryDescriptors] = useState([]);
  const [historyEntryToDelete, setHistoryEntryToDelete] = useState(null);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  const [autoLogEnabled, setAutoLogEnabled] = useState(() => {
    return safeGetItem('auto_log_enabled', true, (v) => typeof v === 'boolean');
  });

  useEffect(() => {
    safeSetItem('coffee_history_v1', history);
  }, [history]);

  useEffect(() => {
    safeSetItem('auto_log_enabled', autoLogEnabled);
  }, [autoLogEnabled]);

  const syncWithHistory = useCallback((state) => {
    if (state.view === 'edit-history' && state.historyId) {
      setEditingHistoryId(state.historyId);
    } else {
      setEditingHistoryId(null);
    }

    if (state.view === 'delete-history-entry' && state.entryId) {
      setHistoryEntryToDelete((prev) => (prev && prev.id === state.entryId ? prev : history.find((h) => h.id === state.entryId) || prev || null));
    } else {
      setHistoryEntryToDelete(null);
    }

    setShowClearHistoryConfirm(state.view === 'clear-history');
  }, [history]);

  const closeDeleteHistoryEntry = useCallback((safeBack) => {
    setHistoryEntryToDelete(null);
    safeBack('delete-history-entry');
  }, []);

  const closeClearHistory = useCallback((safeBack) => {
    setShowClearHistoryConfirm(false);
    safeBack('clear-history');
  }, []);

  const handleStartEditHistory = useCallback((entry, navigateTo) => {
    setEditingHistoryId(entry.id);
    setEditingHistoryNotes(entry.notes || '');
    setEditingHistoryRating(entry.rating || 0);
    setEditingHistoryDescriptors(entry.descriptors || []);
    navigateTo('edit-history', { historyId: entry.id });
  }, []);

  const handleDeleteHistoryEntry = useCallback((entry, navigateTo) => {
    setHistoryEntryToDelete(entry);
    navigateTo('delete-history-entry', { entryId: entry.id });
  }, []);

  const handleConfirmDeleteHistoryEntry = useCallback((safeBack) => {
    if (!historyEntryToDelete) return;
    setHistory((prev) => prev.filter((item) => item.id !== historyEntryToDelete.id));
    closeDeleteHistoryEntry(safeBack);
  }, [historyEntryToDelete, closeDeleteHistoryEntry]);

  const handleConfirmClearHistory = useCallback((safeBack) => {
    setHistory([]);
    closeClearHistory(safeBack);
  }, [closeClearHistory]);

  const handleUpdateHistoryEntry = useCallback((id, newNotes, newRating, newDescriptors) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes: newNotes, rating: newRating, descriptors: newDescriptors } : item))
    );
  }, []);

  const handleOpenClearHistory = useCallback(() => {
    setShowClearHistoryConfirm(true);
  }, []);

  const handleTimerComplete = useCallback(({ activeRecipe, beans, closeTimer }, rating = 0, notes = '', descriptors = []) => {
    if (autoLogEnabled && activeRecipe) {
      const totalWater = activeRecipe.steps.reduce((acc, s) => acc + s.water_g, 0);
      const associatedBean = activeRecipe.bean_id ? beans.find(b => b.id === activeRecipe.bean_id) : null;
      const newEntry = {
        id: `history-${crypto.randomUUID()}`,
        recipeId: activeRecipe.id,
        recipeName: activeRecipe.name,
        method: activeRecipe.method,
        date: new Date().toISOString(),
        coffee_g: activeRecipe.coffee_g,
        water_g: totalWater,
        grind_size: activeRecipe.grind_size,
        bean_name: associatedBean ? associatedBean.name : undefined,
        notes,
        rating,
        descriptors
      };
      setHistory((prev) => [newEntry, ...prev]);
    }
    if (closeTimer) closeTimer();
  }, [autoLogEnabled]);

  return {
    history,
    setHistory,
    editingHistoryId,
    setEditingHistoryId,
    editingHistoryNotes,
    setEditingHistoryNotes,
    editingHistoryRating,
    setEditingHistoryRating,
    editingHistoryDescriptors,
    setEditingHistoryDescriptors,
    historyEntryToDelete,
    setHistoryEntryToDelete,
    showClearHistoryConfirm,
    setShowClearHistoryConfirm,
    autoLogEnabled,
    setAutoLogEnabled,
    syncWithHistory,
    closeDeleteHistoryEntry,
    closeClearHistory,
    handleStartEditHistory,
    handleDeleteHistoryEntry,
    handleConfirmDeleteHistoryEntry,
    handleConfirmClearHistory,
    handleUpdateHistoryEntry,
    handleOpenClearHistory,
    handleTimerComplete
  };
}
