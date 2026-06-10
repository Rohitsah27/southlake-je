<template>
  <div class="seeder-editor-container">
    <div class="card-panel header-card">
      <h2>🛠️ ITD Seeder Editor</h2>
      <p class="description-text">
        View and edit the raw Inception-to-Date seeder JSON files. Updates made here are saved directly to the seeder files.
        After making edits, click the global <strong>⚡ Seed ITD Data</strong> button in the top header to reload the database with your modified values.
      </p>
    </div>

    <div class="workspace-split" v-if="states.length > 0">
      <!-- Left Panel: States List -->
      <aside class="card-panel sidebar">
        <h3>States</h3>
        <div class="states-list">
          <button
            v-for="st in states"
            :key="st.stateCode"
            class="state-btn"
            :class="{ active: activeState === st.stateCode }"
            @click="selectState(st.stateCode)"
          >
            <span class="flag-icon">🗺️</span>
            <span class="state-code">{{ st.stateCode }}</span>
          </button>
        </div>
      </aside>

      <!-- Right Panel: Data Editor Form -->
      <main class="card-panel editor-area" v-if="currentStateData">
        <div class="editor-header">
          <h3>Exhibit Fields for state: <span class="highlight">{{ activeState }}</span></h3>
          <button class="btn btn-success" :disabled="saving" @click="saveChanges">
            {{ saving ? '💾 Saving...' : '💾 Save State Seeder Data' }}
          </button>
        </div>

        <div class="section-title">Main Exhibit Fields</div>
        <div class="grid-form">
          <div v-for="field in fieldsConfig" :key="field.id" class="form-group">
            <label :for="field.id">{{ field.label }}</label>
            <div class="input-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="number"
                :id="field.id"
                class="form-control text-right"
                v-model.number="currentStateData[field.id]"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div class="section-title">Reserve Fields</div>
        <div class="grid-form">
          <div v-for="field in reserveFieldsConfig" :key="field.id" class="form-group">
            <label :for="field.id">{{ field.label }}</label>
            <div class="input-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="number"
                :id="field.id"
                class="form-control text-right"
                v-model.number="currentStateData[field.id]"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <div v-else class="card-panel loading-card">
      <p>⏳ Loading seeder files...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { api } from '../services/api';

interface StateSeederItem {
  stateCode: string;
  data: any;
}

export default defineComponent({
  name: 'SeederEditor',
  setup() {
    const states = ref<StateSeederItem[]>([]);
    const activeState = ref<string>('');
    const currentStateData = ref<any>(null);
    const saving = ref<boolean>(false);

    const fieldsConfig = [
      { id: 'pw', label: 'Premiums Written' },
      { id: 'pfw', label: 'Policy Fees Written' },
      { id: 'pc', label: 'Premiums Collected / Paid' },
      { id: 'pfc', label: 'Policy Fees Collected' },
      { id: 'tax', label: 'Premium Taxes' },
      { id: 'lp', label: 'Losses Paid (Net of Salvage & Subro)' },
      { id: 'laep', label: 'Defense & Cost Containment Expenses Paid' },
      { id: 'ae_paid', label: 'Adjusting & Other Expenses Paid' },
      { id: 'pe', label: 'Premium Earned - YTD' },
      { id: 'pfe', label: 'Policy Fees Earned - YTD' },
      { id: 'uep', label: 'Unearned Premium Reserves' },
      { id: 'lu', label: 'Direct Losses Unpaid / IBNR' },
      { id: 'laeu', label: 'Defense & Cost Containment Unpaid' },
      { id: 'aeu', label: 'Adjusting & Other Unpaid / ULAE IBNR' },
    ];

    const reserveFieldsConfig = [
      { id: 'loss_reserves', label: 'Loss Reserves / Case Reserves' },
      { id: 'loss_ibnr', label: 'Loss IBNR Reserves' },
      { id: 'lae_reserves_dcc', label: 'LAE Reserves - DCC' },
      { id: 'lae_ibnr_dcc', label: 'LAE IBNR Reserves - DCC' },
      { id: 'lae_reserves_aoe', label: 'LAE Reserves - AOE' },
      { id: 'lae_ibnr_aoe', label: 'LAE IBNR Reserves - AOE' },
      { id: 'ulae_ibnr', label: 'ULAE IBNR Reserves' },
    ];

    const fetchSeederFiles = async () => {
      try {
        const res = await api.getSeederFiles();
        states.value = res;
        if (res.length > 0) {
          selectState(res[0].stateCode);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load seeder files');
      }
    };

    const selectState = (stateCode: string) => {
      activeState.value = stateCode;
      const item = states.value.find(s => s.stateCode === stateCode);
      if (item) {
        const editableData: any = {};
        const allFields = [...fieldsConfig, ...reserveFieldsConfig];
        allFields.forEach(f => {
          const arr = item.data[f.id] || [0, 0, 0];
          editableData[f.id] = arr[1] !== undefined ? Number(arr[1]) : 0;
        });
        currentStateData.value = editableData;
      }
    };

    const saveChanges = async () => {
      if (!activeState.value || !currentStateData.value) return;
      saving.value = true;
      try {
        const payload: any = {
          stateCode: activeState.value,
        };
        const allFields = [...fieldsConfig, ...reserveFieldsConfig];
        allFields.forEach(f => {
          const val = Number(currentStateData.value[f.id]) || 0;
          payload[f.id] = [0, val, 0];
        });

        const res = await api.updateSeederFile(activeState.value, payload);
        
        const item = states.value.find(s => s.stateCode === activeState.value);
        if (item) {
          item.data = payload;
        }

        alert(res.message || 'Seeder file successfully updated.');
      } catch (err) {
        console.error(err);
        alert('Failed to save seeder file updates');
      } finally {
        saving.value = false;
      }
    };

    onMounted(() => {
      fetchSeederFiles();
    });

    return {
      states,
      activeState,
      currentStateData,
      saving,
      fieldsConfig,
      reserveFieldsConfig,
      selectState,
      saveChanges,
    };
  },
});
</script>

<style scoped>
.seeder-editor-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
}

.header-card h2 {
  font-family: var(--font-display);
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.description-text {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.workspace-split {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.sidebar {
  max-height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar h3 {
  font-size: 1.1rem;
  font-weight: 700;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 0.5rem;
  margin-bottom: 0.25rem;
}

.states-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.state-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-muted);
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: var(--transition-smooth);
}

.state-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--color-text);
}

.state-btn.active {
  background: var(--color-primary-glow);
  color: var(--color-text);
  border-color: rgba(139, 92, 246, 0.25);
  font-weight: 600;
}

.flag-icon {
  font-size: 1rem;
  opacity: 0.7;
}

.editor-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 1rem;
}

.editor-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
}

.highlight {
  color: var(--color-primary);
  background: var(--color-primary-glow);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-weight: 800;
}

.grid-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.6rem 0.75rem 0.6rem 1.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.95rem;
  transition: var(--transition-smooth);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.text-right {
  text-align: right;
}

.loading-card {
  padding: 3rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  padding: 0.5rem 0;
  border-bottom: 2px solid var(--color-primary-glow);
  margin-bottom: 0.5rem;
  margin-top: 1rem;
}

/* Chrome, Safari, Edge, Opera number input controls hidden */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox number input controls hidden */
input[type=number] {
  -moz-appearance: textfield;
}
</style>
