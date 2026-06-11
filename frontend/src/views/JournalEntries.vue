<template>
  <div class="journal-entries-view">
    <!-- Auto-Detect Settings Panel -->
    <div class="card-panel settings-panel">
      <h2>📂 Auto-Detected Reinsurance Scope</h2>
      <p class="subtitle">Select an uploaded workbook and month to link prior reserves and load ceding calculations.</p>

      <div class="selection-grid">
        <div class="select-group">
          <label>Select Program/Treaty</label>
          <select v-model="selectedProgram" @change="onProgramChange">
            <option v-for="p in programs" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>

        <div class="select-group">
          <label>Select Reporting Month</label>
          <select v-model="selectedMonth" @change="onMonthChange">
            <option v-for="m in months" :key="m.key" :value="m.key">{{ m.label }}</option>
          </select>
        </div>

        <div class="select-group">
          <label>Select State</label>
          <select v-model="selectedState" @change="onStateChange">
            <option v-for="st in states" :key="st" :value="st">{{ st }}</option>
          </select>
        </div>
      </div>

    </div>

    <!-- Active Workbook Workspace Layout -->
    <div v-if="activeWb" class="workspace-layout">
      <!-- Main content, forms & tables -->
      <main class="main-content">
        <!-- Required Parameters Card -->
        <RequiredParamsForm
          v-model="paramsForm"
          :lae-label="prevLaeIbnrLabel"
          @change="saveParams"
        />

        <!-- Actuarial Rates & Commissions (%) Card -->
        <ActuarialRatesForm
          v-model="ratesForm"
          @change="saveRates"
        />

        <!-- GL Account Mappings Settings Card -->
        <MappingSettingsForm
          v-model="mappingsForm"
          @change="saveMappings"
        />

        <!-- Output Views Container -->
        <div class="workspace-tabs">
          <div class="tab-controls">
            <button class="tab-btn" :class="{ active: viewTab === 'statement' }" @click="viewTab = 'statement'">
              📊 Reinsurance Statement
            </button>
            <button class="tab-btn" :class="{ active: viewTab === 'glje' }" @click="viewTab = 'glje'">
              💼 GL Journal Entry Mapping
            </button>
            <button v-if="viewTab === 'glje'" class="btn btn-success btn-sm export-btn" @click="exportGLJECSV">
              📥 Export GL Mappings
            </button>
          </div>

          <!-- Reinsurance Statement View -->
          <ReinsuranceStatementTable
            v-if="viewTab === 'statement'"
            :statement-rows="statementRows"
          />

          <!-- GL Journal Entry View -->
          <GLJournalEntriesTable
            v-else
            :glje-rows="gljeRows"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { api } from '../services/api';
import type { Workbook } from '../services/api';
import { useJournalEntries } from '../composables/useJournalEntries';
import RequiredParamsForm from '../components/RequiredParamsForm.vue';
import ActuarialRatesForm from '../components/ActuarialRatesForm.vue';
import MappingSettingsForm from '../components/MappingSettingsForm.vue';
import ReinsuranceStatementTable from '../components/ReinsuranceStatementTable.vue';
import GLJournalEntriesTable from '../components/GLJournalEntriesTable.vue';

export default defineComponent({
  name: 'JournalEntries',
  components: {
    RequiredParamsForm,
    ActuarialRatesForm,
    MappingSettingsForm,
    ReinsuranceStatementTable,
    GLJournalEntriesTable,
  },
  setup() {
    const workbooksList = ref<Workbook[]>([]);

    const {
      selectedProgram,
      selectedMonth,
      selectedState,
      viewTab,
      mappingsForm,
      paramsForm,
      ratesForm,
      activeWb,
      months,
      states,
      statementRows,
      gljeRows,
      onProgramChange,
      onMonthChange,
      onStateChange,
      saveMappings,
      saveParams,
      saveRates,
      prevLaeIbnrLabel,
    } = useJournalEntries(workbooksList);

    // Predefined default programs or auto-detected ones
    const programs = computed(() => {
      const progs = new Set<string>();
      workbooksList.value.forEach(w => progs.add(w.program));
      if (progs.size === 0) {
        return ['Excess NX', 'Excess SAM', 'Excess HS', 'APD Local', 'APD Fleet', 'DPR APD'];
      }
      return Array.from(progs);
    });

    const loadData = async () => {
      try {
        workbooksList.value = await api.getWorkbooks();
        if (programs.value.length > 0) {
          selectedProgram.value = programs.value[0];
          onProgramChange();
        }
      } catch (err) {
        console.error('Failed to load workbooks list:', err);
      }
    };

    const glTotals = computed(() => {
      let debit = 0;
      let credit = 0;
      gljeRows.value.forEach(r => {
        debit += Number(r.debit || 0);
        credit += Number(r.credit || 0);
      });
      return { debit, credit };
    });

    const exportGLJECSV = () => {
      let csv = 'Account Description,Comp,ACCOUNT,CC,MGA,LOB,ST,EXT,Sub,Description,Debit,Credit\n';
      gljeRows.value.forEach(r => {
        const debitStr = r.debit > 0 ? r.debit.toFixed(2) : '';
        const creditStr = r.credit > 0 ? `-${r.credit.toFixed(2)}` : '';
        csv += `"${r.desc}",${r.comp},${r.account},${r.cc},${r.mga},${r.lob},${r.st},${r.ext},${r.sub},"${r.lineDesc}",${debitStr},${creditStr}\n`;
      });
      csv += `JE Control Totals,,,,,,,,,,${glTotals.value.debit.toFixed(2)},-${glTotals.value.credit.toFixed(2)}\n`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute(
        'download',
        `GL_JE_Mapping_${selectedProgram.value}_${selectedMonth.value}_${selectedState.value}.csv`
      );
      link.click();
    };

    onMounted(loadData);

    return {
      workbooksList,
      selectedProgram,
      selectedMonth,
      selectedState,
      viewTab,
      mappingsForm,
      paramsForm,
      ratesForm,
      activeWb,
      programs,
      months,
      states,
      statementRows,
      gljeRows,
      onProgramChange,
      onMonthChange,
      onStateChange,
      saveMappings,
      saveParams,
      saveRates,
      exportGLJECSV,
      prevLaeIbnrLabel,
    };
  },
});
</script>

<style scoped>
.workspace-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>



