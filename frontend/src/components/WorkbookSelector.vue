<template>
  <div class="workbook-controls">

    <!-- Upload Section - Always Visible at Top -->
    <div class="upload-bar">
      <div class="upload-left">
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
          <button class="upload-btn" @click="triggerFileInput">
            <span class="upload-icon">📂</span>
            <span>{{ itdSeeded ? 'Upload Excel Workbook' : 'Upload ITD Seeder Workbook' }}</span>
          </button>
          <button class="upload-btn generate-itd-btn" :disabled="generatingItd" @click="triggerITDFileInput">
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
      <span>ITD seeder data must be uploaded first. Please use the <strong>⚡ Generate ITD from Southlake File</strong> button, then upload the generated file.</span>
    </div>

    <!-- Active Workbook Selector -->
    <div v-if="workbooks.length > 0" class="workbook-selector-container">
      <span class="selector-label">📅 Active Workbook:</span>
      <select :value="modelValue" @change="onChange" class="workbook-select">
        <option v-for="wb in workbooks" :key="wb.id" :value="wb.id">
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
import { defineComponent, ref, onMounted } from 'vue';
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
    const itdSeeded = ref(false);
    const fileInput = ref<HTMLInputElement | null>(null);
    const itdFileInput = ref<HTMLInputElement | null>(null);
    const generatingItd = ref(false);
 
    const triggerFileInput = () => {
      fileInput.value?.click();
    };
 
    const triggerITDFileInput = () => {
      itdFileInput.value?.click();
    };
 
    const onUpload = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;
      emit('file-upload', event);
    };
 
    const onGenerateITD = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;
      
      const file = input.files[0];
      generatingItd.value = true;
      try {
        const blob = await api.generateITDExcel(file);
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
    });
 
    return {
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
</style>
