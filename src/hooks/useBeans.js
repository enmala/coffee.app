import { useState, useEffect, useCallback } from 'react';
import { safeGetItem, safeSetItem } from '../utils/storageUtils';
import { DEFAULT_BEANS } from '../constants/defaultData';

const EMPTY_BEAN = {
  name: '',
  roaster: '',
  origin: '',
  region: '',
  farm: '',
  producer: '',
  harvest_year: '',
  process: 'Lavado',
  variety: '',
  roast_level: 'Medio',
  roast_date: '',
  sca_score: '',
  altitude: '',
  tasting_notes: [],
  notes: ''
};

export function useBeans() {
  const [beans, setBeans] = useState(() => {
    return safeGetItem('coffee_beans_v1', DEFAULT_BEANS, Array.isArray);
  });

  const [isEditingBean, setIsEditingBean] = useState(false);
  const [editingBeanId, setEditingBeanId] = useState(null);
  const [newBean, setNewBean] = useState(EMPTY_BEAN);
  const [customTastingNote, setCustomTastingNote] = useState('');
  const [beanSearchQuery, setBeanSearchQuery] = useState('');
  const [beanToDelete, setBeanToDelete] = useState(null);
  const [beanToShare, setBeanToShare] = useState(null);
  const [beanToImport, setBeanToImport] = useState(null);

  useEffect(() => {
    safeSetItem('coffee_beans_v1', beans);
  }, [beans]);

  const syncWithHistory = useCallback((state) => {
    if (state.view === 'edit-bean') {
      setIsEditingBean(true);
      setEditingBeanId(state.beanId || null);
    } else {
      setIsEditingBean(false);
      setEditingBeanId(null);
      setNewBean(EMPTY_BEAN);
    }

    if (state.view === 'share-bean' && state.beanId) {
      setBeanToShare((prev) => (prev && prev.id === state.beanId ? prev : beans.find((b) => b.id === state.beanId) || prev || null));
    } else {
      setBeanToShare(null);
    }

    if (state.view === 'delete-bean' && state.beanId) {
      setBeanToDelete((prev) => (prev && prev.id === state.beanId ? prev : beans.find((b) => b.id === state.beanId) || prev || null));
    } else {
      setBeanToDelete(null);
    }

    if (state.view !== 'import-bean') {
      setBeanToImport(null);
    }
  }, [beans]);

  const closeShareBean = useCallback((safeBack) => {
    setBeanToShare(null);
    safeBack('share-bean');
  }, []);

  const closeImportBean = useCallback((safeBack) => {
    setBeanToImport(null);
    safeBack('import-bean');
  }, []);

  const closeDeleteBean = useCallback((safeBack) => {
    setBeanToDelete(null);
    safeBack('delete-bean');
  }, []);

  const handleCancelBean = useCallback((safeBack) => {
    setIsEditingBean(false);
    setEditingBeanId(null);
    setNewBean(EMPTY_BEAN);
    if (safeBack) safeBack('edit-bean');
  }, []);

  const handleAddTastingNote = useCallback((note) => {
    const trimmed = note.trim();
    if (!trimmed) return;
    if (!newBean.tasting_notes.includes(trimmed)) {
      setNewBean(prev => ({
        ...prev,
        tasting_notes: [...prev.tasting_notes, trimmed]
      }));
    }
    setCustomTastingNote('');
  }, [newBean.tasting_notes]);

  const handleRemoveTastingNote = useCallback((note) => {
    setNewBean(prev => ({
      ...prev,
      tasting_notes: prev.tasting_notes.filter(t => t !== note)
    }));
  }, []);

  const handleSaveBean = useCallback((e, { showAlert, safeBack }) => {
    e.preventDefault();
    if (!newBean.name.trim()) {
      showAlert("El nombre del grano es obligatorio.", "error");
      return;
    }

    const beanData = {
      ...newBean,
      name: newBean.name.trim(),
      roaster: newBean.roaster.trim(),
      origin: newBean.origin.trim(),
      region: newBean.region.trim(),
      farm: newBean.farm.trim(),
      producer: newBean.producer.trim(),
      harvest_year: newBean.harvest_year.trim(),
      variety: newBean.variety.trim(),
      sca_score: newBean.sca_score ? parseFloat(newBean.sca_score) : null,
      altitude: newBean.altitude.trim(),
      notes: newBean.notes.trim()
    };

    if (editingBeanId) {
      setBeans(prev => prev.map(b => b.id === editingBeanId ? { ...beanData, id: editingBeanId } : b));
      showAlert("Grano de café actualizado correctamente.", "success");
    } else {
      const addedBean = {
        ...beanData,
        id: `bean-${crypto.randomUUID()}`
      };
      setBeans(prev => [addedBean, ...prev]);
      showAlert("Grano de café guardado correctamente.", "success");
    }

    handleCancelBean(safeBack);
  }, [newBean, editingBeanId, handleCancelBean]);

  const handleStartEditBean = useCallback((bean, navigateTo) => {
    setNewBean({
      name: bean.name,
      roaster: bean.roaster || '',
      origin: bean.origin || '',
      region: bean.region || '',
      farm: bean.farm || '',
      producer: bean.producer || '',
      harvest_year: bean.harvest_year || '',
      process: bean.process || 'Lavado',
      variety: bean.variety || '',
      roast_level: bean.roast_level || 'Medio',
      roast_date: bean.roast_date || '',
      sca_score: bean.sca_score || '',
      altitude: bean.altitude || '',
      tasting_notes: bean.tasting_notes || [],
      notes: bean.notes || ''
    });
    setEditingBeanId(bean.id);
    setIsEditingBean(true);
    navigateTo('edit-bean', { beanId: bean.id });
  }, []);

  const handleStartNewBean = useCallback((navigateTo) => {
    setNewBean(EMPTY_BEAN);
    setEditingBeanId(null);
    setIsEditingBean(true);
    navigateTo('edit-bean');
  }, []);

  const handleDeleteBeanClick = useCallback((bean, navigateTo) => {
    setBeanToDelete(bean);
    navigateTo('delete-bean', { beanId: bean.id });
  }, []);

  const handleConfirmDeleteBean = useCallback(({ setRecipes, showAlert, safeBack }) => {
    if (!beanToDelete) return;
    setRecipes(prev => prev.map(r => r.bean_id === beanToDelete.id ? { ...r, bean_id: null } : r));
    setBeans(prev => prev.filter(b => b.id !== beanToDelete.id));
    closeDeleteBean(safeBack);
    showAlert("Grano de café eliminado correctamente.", "success");
  }, [beanToDelete, closeDeleteBean]);

  const confirmImportBean = useCallback(({ showAlert, syncStateWithHistory, setActiveTab }) => {
    if (!beanToImport) return;

    const uniqueId = `imported-${crypto.randomUUID()}`;
    let beanName = beanToImport.name.trim();

    const nameExists = beans.some((b) => b.name.toLowerCase() === beanName.toLowerCase());
    if (nameExists) {
      let counter = 1;
      while (beans.some((b) => b.name.toLowerCase() === `${beanName} (${counter})`.toLowerCase())) {
        counter++;
      }
      beanName = `${beanName} (${counter})`;
    }

    const updated = {
      ...beanToImport,
      id: uniqueId,
      name: beanName
    };

    setBeans((prev) => [updated, ...prev]);
    showAlert(`Grano de café importado correctamente como "${beanName}".`, "success");
    
    setBeanToImport(null);
    window.history.replaceState({ view: 'main' }, '');
    if (syncStateWithHistory) syncStateWithHistory({ view: 'main' });
    if (setActiveTab) setActiveTab('beans');
  }, [beanToImport, beans]);

  const handleShareBean = useCallback((beanId, navigateTo) => {
    navigateTo('share-bean', { beanId });
  }, []);

  return {
    beans,
    setBeans,
    isEditingBean,
    setIsEditingBean,
    editingBeanId,
    setEditingBeanId,
    newBean,
    setNewBean,
    customTastingNote,
    setCustomTastingNote,
    beanSearchQuery,
    setBeanSearchQuery,
    beanToDelete,
    setBeanToDelete,
    beanToShare,
    setBeanToShare,
    beanToImport,
    setBeanToImport,
    syncWithHistory,
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
  };
}
