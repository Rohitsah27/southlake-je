<template>
  <div class="workbook-controls">

    <!-- Step 1: Select Treaty Program -->
    <div class="program-bar">
      <div v-if="!showCreateInput" class="program-select-group">
        <label class="program-label">📋 STEP 1: Select Treaty Program</label>
        <select v-model="selectedProgram" class="program-select" @change="onProgramChange">
          <option value="" disabled selected>-- Select a Treaty Program --</option>
          <option v-for="prog in allPrograms" :key="prog" :value="prog">{{ prog }}</option>
          <option value="CREATE_NEW">➕ Create New Program...</option>
        </select>
      </div>

      <!-- Inline Create Program Input and Rates Grid -->
      <div v-else class="program-create-container">
        <div class="create-title-row">
          <label class="program-label">➕ Create New Treaty Program</label>
        </div>
        <div class="create-input-row">
          <input 
            v-model="newProgramName" 
            type="text" 
            class="program-input" 
            placeholder="Program Name (e.g. APD Local)" 
            @input="onNewProgramNameInput"
          />
        </div>
        
        <div class="program-rates-panel">
          <h4 class="rates-subtitle">Actuarial Rates & Commissions (%)</h4>
          <div class="rates-fields-grid">
            <div class="rate-field-group">
              <label>Ceding Commission (%)</label>
              <input v-model.number="newProgramRates.comm" type="number" step="0.1" class="rate-num-input" />
            </div>
            <div class="rate-field-group">
              <label>ULAE Ceding (%)</label>
              <input v-model.number="newProgramRates.ulae" type="number" step="0.1" class="rate-num-input" />
            </div>
            <div class="rate-field-group">
              <label>Loss Pick (%)</label>
              <input v-model.number="newProgramRates.lossPick" type="number" step="0.1" class="rate-num-input" />
            </div>
            <div class="rate-field-group">
              <label>LAE - DCC (%)</label>
              <input v-model.number="newProgramRates.laeDcc" type="number" step="0.1" class="rate-num-input" />
            </div>
            <div class="rate-field-group">
              <label>LAE - AOE (%)</label>
              <input v-model.number="newProgramRates.laeAoe" type="number" step="0.1" class="rate-num-input" />
            </div>
            <div class="rate-field-group">
              <label>Boards Charge (%)</label>
              <input v-model.number="newProgramRates.boardsCharge" type="number" step="0.1" class="rate-num-input" />
            </div>
            <div class="rate-field-group">
              <label>Loss Ratio Cap (%)</label>
              <input v-model.number="newProgramRates.lossRatioCap" type="number" step="0.1" class="rate-num-input" />
            </div>
          </div>
        </div>

        <div class="create-actions-row">
          <button class="btn btn-success btn-sm" @click="createNewProgram">Create Program</button>
          <button class="btn btn-secondary btn-sm" @click="cancelCreateProgram">Cancel</button>
        </div>
      </div>

      <span v-if="!selectedProgram && !showCreateInput" class="program-help-text">
        👈 Please select or create a treaty program first.
      </span>
      <span v-else-if="selectedProgram" class="program-help-text success">
        🎯 Active Program: <strong>{{ selectedProgram }}</strong>. Proceed to upload/generate.
      </span>
    </div>

    <!-- Upload Section - Always Visible at Top -->
    <div class="upload-bar">
      <div class="upload-left">
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
          <button class="upload-btn" :disabled="!selectedProgram" @click="triggerFileInput">
            <span class="upload-icon">📂</span>
            <span>{{ itdSeeded ? 'Upload Excel Workbook' : 'Upload ITD Seeder Workbook' }}</span>
          </button>
          <button class="upload-btn generate-itd-btn" :disabled="!selectedProgram || generatingItd" @click="triggerITDFileInput">
            <span class="upload-icon">⚡</span>
            <span>{{ generatingItd ? 'Generating...' : 'Generate ITD from Southlake File' }}</span>
          </button>
        </div>
        <input ref="fileInput" type="file" accept=".xlsx, .xls" @change="onUpload" style="display: none" />
        <input ref="itdFileInput" type="file" accept=".xlsx, .xls" @change="onGenerateITD" style="display: none" />
        <span class="upload-help-text">
          <template v-if="itdSeeded">✅ ITD data loaded. Upload January, February, or March Excel workbook.</template>
          <template v-else>⚠️ Baseline missing: Generate ITD file first, then upload it here to seed the database.</template>
        </span>
      </div>
    </div>

    <!-- Warning when ITD not seeded -->
    <div v-if="!itdSeeded" class="itd-warning">
      <span class="warning-icon">🔒</span>
      <span>ITD seeder data must be uploaded first. Please select a program, use the <strong>⚡ Generate ITD from Southlake File</strong> button, then upload the generated file.</span>
    </div>

    <!-- Active Workbook Selector -->
    <div v-if="filteredWorkbooks.length > 0" class="workbook-selector-container">
      <span class="selector-label">📅 Active Workbook:</span>
      <select :value="modelValue" @change="onChange" class="workbook-select">
        <option v-for="wb in filteredWorkbooks" :key="wb.id" :value="wb.id">
          {{ wb.source === 'ITD' ? '🛠️' : '📊' }} {{ wb.program }} - {{ wb.monthLabel }} ({{ wb.source }})
        </option>
      </select>
      <button class="btn btn-danger btn-sm" @click="$emit('delete-workbook')" title="Delete Workbook">
        🗑️ Delete
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { api } from '../services/api';

export default defineComponent({
  name: 'WorkbookSelector',
  props: {
    workbooks: {
      type: Array as () => any[],
      required: true,
    },
    modelValue: {
      type: [Number, null] as any,
      required: true,
    },
  },
  emits: ['update:modelValue', 'file-upload', 'delete-workbook', 'change'],
  setup(props, { emit }) {
    const selectedProgram = ref('');
    const customPrograms = ref<string[]>([]);
    const dbProgramsList = ref<any[]>([]);
    const showCreateInput = ref(false);
    const newProgramName = ref('');
    const itdSeeded = ref(false);
    const fileInput = ref<HTMLInputElement | null>(null);
    const itdFileInput = ref<HTMLInputElement | null>(null);
    const generatingItd = ref(false);

    const newProgramRates = ref({
      comm: 29.0,
      ulae: 7.0,
      lossPick: 56.6,
      laeDcc: 0.0,
      laeAoe: 13.4,
      boardsCharge: 0.40,
      lossRatioCap: 2.0
    });

    const onNewProgramNameInput = () => {
      const name = newProgramName.value.toLowerCase();
      const isExcess = name.includes('excess') || 
                       name.includes('nx') || 
                       name.includes('sam') || 
                       name.includes('hs');
      if (isExcess) {
        newProgramRates.value = {
          comm: 32.0,
          ulae: 1.0,
          lossPick: 51.8,
          laeDcc: 6.2,
          laeAoe: 0.0,
          boardsCharge: 0.40,
          lossRatioCap: 2.0
        };
      } else {
        newProgramRates.value = {
          comm: 29.0,
          ulae: 7.0,
          lossPick: 56.6,
          laeDcc: 0.0,
          laeAoe: 13.4,
          boardsCharge: 0.40,
          lossRatioCap: 2.0
        };
      }
    };

    const loadPrograms = async () => {
      try {
        const list = await api.getPrograms();
        dbProgramsList.value = list;
      } catch (err) {
        console.error('[WorkbookSelector] Failed to load programs:', err);
      }
    };

    // Compute all programs from DB workbooks and programs table
    const allPrograms = computed(() => {
      const dbPrograms = props.workbooks.map(w => w.program);
      const customDbPrograms = dbProgramsList.value.map(p => p.name);
      const combined = [...dbPrograms, ...customDbPrograms, ...customPrograms.value];
      return [...new Set(combined)].sort();
    });

    const filteredWorkbooks = computed(() => {
      if (!selectedProgram.value) return [];
      return props.workbooks.filter(w => w.program === selectedProgram.value);
    });

    // Watch selected program to auto-select matching workbook
    watch(selectedProgram, (newProg) => {
      if (!newProg) return;
      const filtered = props.workbooks.filter(w => w.program === newProg);
      if (filtered.length > 0) {
        const currentIsMatched = filtered.some(w => w.id === props.modelValue);
        if (!currentIsMatched) {
          // Auto-select the first (most recent) workbook of this program
          emit('update:modelValue', filtered[0].id);
          emit('change', filtered[0].id);
        }
      } else {
        // No workbooks for this program, reset active workbook to null
        emit('update:modelValue', null);
        emit('change', null);
      }
    });

    // Watch active workbook from parent to auto-sync selected program dropdown
    watch([() => props.modelValue, () => props.workbooks], ([newVal, newWbs]) => {
      if (newVal && newWbs && newWbs.length > 0) {
        const activeWb = newWbs.find(w => w.id === newVal);
        if (activeWb && selectedProgram.value !== activeWb.program) {
          selectedProgram.value = activeWb.program;
        }
      }
    }, { immediate: true });

    const onProgramChange = () => {
      if (selectedProgram.value === 'CREATE_NEW') {
        showCreateInput.value = true;
        selectedProgram.value = '';
        newProgramName.value = '';
        newProgramRates.value = {
          comm: 29.0,
          ulae: 7.0,
          lossPick: 56.6,
          laeDcc: 0.0,
          laeAoe: 13.4,
          boardsCharge: 0.40,
          lossRatioCap: 2.0
        };
      }
    };

    const createNewProgram = async () => {
      const name = newProgramName.value.trim();
      if (!name) {
        alert('Please enter a valid program name.');
        return;
      }
      try {
        await api.createProgram(name, newProgramRates.value);
        await loadPrograms();
        selectedProgram.value = name;
        showCreateInput.value = false;
        newProgramName.value = '';
      } catch (err) {
        console.error(err);
        alert('Failed to register program in PostgreSQL');
      }
    };

    const cancelCreateProgram = () => {
      showCreateInput.value = false;
      newProgramName.value = '';
    };
 
    const triggerFileInput = () => {
      fileInput.value?.click();
    };
 
    const triggerITDFileInput = () => {
      itdFileInput.value?.click();
    };
 
    const onUpload = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;
      emit('file-upload', event, selectedProgram.value);
    };
 
    const onGenerateITD = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;
      
      const file = input.files[0];
      generatingItd.value = true;
      try {
        const blob = await api.generateITDExcel(file, selectedProgram.value);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ITD_from_${file.name}`);
        link.click();
        URL.revokeObjectURL(url);
        alert('ITD Excel seeder successfully generated and downloaded!');
      } catch (err) {
        console.error(err);
        alert('Failed to generate ITD Excel from Starlight file.');
      } finally {
        generatingItd.value = false;
        if (itdFileInput.value) itdFileInput.value.value = '';
      }
    };
 
    const onChange = (event: Event) => {
      const select = event.target as HTMLSelectElement;
      const val = select.value ? parseInt(select.value) : null;
      emit('update:modelValue', val);
      emit('change', val);
    };
 
    const checkItdStatus = () => {
      api.checkItdSeeded()
        .then((res) => {
          itdSeeded.value = res.seeded;
          console.log('[WorkbookSelector] ITD seeded:', res.seeded);
        })
        .catch((err) => {
          console.error('[WorkbookSelector] Check ITD failed:', err);
          itdSeeded.value = false;
        });
    };
 
    onMounted(() => {
      console.log('[WorkbookSelector] Mounted, workbooks count:', props.workbooks.length);
      checkItdStatus();
      loadPrograms();
    });
 
    return {
      selectedProgram,
      customPrograms,
      showCreateInput,
      newProgramName,
      newProgramRates,
      allPrograms,
      filteredWorkbooks,
      onProgramChange,
      onNewProgramNameInput,
      createNewProgram,
      cancelCreateProgram,
      fileInput,
      itdFileInput,
      itdSeeded,
      generatingItd,
      triggerFileInput,
      triggerITDFileInput,
      onUpload,
      onGenerateITD,
      onChange,
    };
  },
});
</script>

<style scoped>
.workbook-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upload-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.2);
}

.upload-left {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1.4rem;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.05);
  transition: all 0.2s ease;
  width: fit-content;
}

.upload-btn:hover {
  background: #d1fae5;
  border-color: #6ee7b7;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
}

.upload-btn:active {
  transform: translateY(0);
}

.upload-icon {
  font-size: 1.1rem;
}

.upload-help-text {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.itd-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 8px;
  font-size: 0.88rem;
  color: var(--color-error);
  font-weight: 600;
}

.warning-icon {
  font-size: 1.2rem;
}

.workbook-selector-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.selector-label {
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
}

.workbook-select {
  font-size: 0.88rem;
  padding: 0.35rem 0.6rem;
  flex: 1;
  min-width: 200px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--color-text);
  cursor: pointer;
}

.generate-itd-btn {
  background: #eff6ff !important;
  color: #2563eb !important;
  border: 1px solid #bfdbfe !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.05) !important;
}

.generate-itd-btn:hover {
  background: #dbeafe !important;
  border-color: #93c5fd !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08) !important;
}

.generate-itd-btn:active {
  transform: translateY(0);
}

.program-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.15);
  flex-wrap: wrap;
  gap: 1rem;
}

.program-select-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 280px;
}

.program-label {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-primary);
  white-space: nowrap;
}

.program-select {
  padding: 0.45rem 0.75rem;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: var(--bg-surface);
  color: var(--color-text);
  cursor: pointer;
  outline: none;
  transition: var(--transition-smooth);
  flex: 1;
}

.program-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

.program-help-text {
  font-size: 0.8rem;
  color: #ea580c;
  font-weight: 600;
}

.program-help-text.success {
  color: #059669;
}

.program-create-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 280px;
}

.program-input {
  padding: 0.45rem 0.75rem;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: var(--bg-surface);
  color: var(--color-text);
  outline: none;
  transition: var(--transition-smooth);
  flex: 1;
}

.program-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

.program-create-container {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
  padding: 0.25rem 0;
}

.create-title-row {
  display: flex;
  align-items: center;
}

.create-input-row {
  display: flex;
  width: 100%;
}

.program-rates-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--glass-border);
  border-radius: 8px;
  padding: 0.85rem;
}

.rates-subtitle {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.65rem 0;
  color: var(--color-text-muted);
}

.rates-fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.65rem;
}

.rate-field-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.rate-field-group label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.rate-num-input {
  padding: 0.35rem 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid var(--glass-border);
  background: var(--bg-surface);
  color: var(--color-text);
  outline: none;
  transition: var(--transition-smooth);
}

.rate-num-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

.create-actions-row {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
