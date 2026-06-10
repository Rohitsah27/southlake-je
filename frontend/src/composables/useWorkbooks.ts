import { ref } from 'vue';
import { api } from '../services/api';
import type { Workbook } from '../services/api';

export function useWorkbooks() {
  const workbooks = ref<Workbook[]>([]);
  const activeWorkbookId = ref<number | null>(null);
  const activeWorkbook = ref<Workbook | null>(null);
  const activeTab = ref<string>('TOTAL');

  const loadWorkbooks = async () => {
    try {
      workbooks.value = await api.getWorkbooks();
      console.log('[useWorkbooks] Loaded workbooks:', workbooks.value);
      if (workbooks.value.length > 0 && !activeWorkbookId.value) {
        const savedKey = localStorage.getItem('starlight_active_workbook_key_db');
        const savedId = savedKey ? parseInt(savedKey) : null;
        const match = workbooks.value.find(w => w.id === savedId);
        activeWorkbookId.value = match ? match.id : workbooks.value[0].id;
        await selectWorkbook(activeWorkbookId.value!);
      }
    } catch (err) {
      console.error('Error loading workbooks:', err);
    }
  };

  const selectWorkbook = async (id: number) => {
    try {
      const wb = await api.getWorkbook(id);
      console.log('[useWorkbooks] Selected workbook:', wb);
      console.log('[useWorkbooks] State exhibits count:', wb.stateExhibits?.length);
      if (wb.stateExhibits && wb.stateExhibits.length > 0) {
        console.log('[useWorkbooks] First exhibit:', wb.stateExhibits[0]);
      }
      activeWorkbook.value = wb;
      activeWorkbookId.value = id;
      localStorage.setItem('starlight_active_workbook_key_db', String(id));
      
      const tabExists = wb.stateExhibits?.some(e => e.stateCode === activeTab.value);
      if (!tabExists && activeTab.value !== 'CashSettlement') {
        activeTab.value = 'TOTAL';
      }
    } catch (err) {
      console.error('Error selecting workbook:', err);
    }
  };

  const deleteActiveWorkbook = async () => {
    if (!activeWorkbookId.value) return;
    if (confirm('Are you sure you want to delete this workbook?')) {
      try {
        await api.deleteWorkbook(activeWorkbookId.value);
        activeWorkbookId.value = null;
        activeWorkbook.value = null;
        await loadWorkbooks();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const onFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    try {
      const res = await api.uploadWorkbook(file);
      alert(res.message);
      await loadWorkbooks();
      const allWbs = await api.getWorkbooks();
      if (allWbs.length > 0) {
        await selectWorkbook(allWbs[0].id);
      }
    } catch (err: any) {
      if (err?.status === 409) {
        if (confirm(`${err.message}\n\nDo you want to overwrite it and store the same file data?`)) {
          try {
            const res2 = await api.uploadWorkbook(file, true);
            alert(res2.message);
            await loadWorkbooks();
            const allWbs = await api.getWorkbooks();
            if (allWbs.length > 0) {
              await selectWorkbook(allWbs[0].id);
            }
          } catch (err2: any) {
            alert(`Upload Error: ${err2?.message || 'Overwrite failed'}`);
          }
        }
      } else {
        const msg = err?.message || 'File upload/parsing failed. Ensure it is a valid exhibit.';
        alert(`Upload Error: ${msg}`);
      }
    } finally {
      input.value = '';
    }
  };

  return {
    workbooks,
    activeWorkbookId,
    activeWorkbook,
    activeTab,
    loadWorkbooks,
    selectWorkbook,
    deleteActiveWorkbook,
    onFileUpload,
  };
}
