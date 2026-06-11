<template>
  <div class="calculator-view">
    <!-- Top Actions Card -->
    <WorkbookSelector
      v-model="activeWorkbookId"
      :workbooks="workbooks"
      @file-upload="onFileUpload"
      @delete-workbook="deleteActiveWorkbook"
      @change="selectWorkbook"
    />

    <!-- Empty State -->
    <div v-if="!activeWorkbook" class="card-panel empty-state">
      <div class="empty-icon">📊</div>
      <h2>No Active Workbooks for this Program</h2>
      <p>Please upload an Excel workbook (FUT monthly exhibit or Starlight report summary) or generate the ITD file for the selected program to begin.</p>
    </div>

    <div v-else class="workspace-layout">
      <!-- View/State Filter Panel -->
      <div class="card-panel filter-panel">
        <div class="filter-row">
          <div class="filter-select-group">
            <label>Select State / View</label>
            <select v-model="activeTab" class="filter-select">
              <option value="TOTAL">📊 MTHLY-TOTAL</option>
              <option
                v-for="exhibit in (activeWorkbook.stateExhibits || []).filter(e => e.stateCode !== 'TOTAL')"
                :key="exhibit.id"
                :value="exhibit.stateCode"
              >
                🗺️ State {{ exhibit.stateCode }}
              </option>
              <option value="CashSettlement">📄 Cash Settlement</option>
            </select>
          </div>
          <button class="btn btn-secondary btn-sm" @click="exportCSV">
            📥 Export CSV
          </button>
        </div>
      </div>

      <!-- Main Workspace Content -->
      <main class="main-content">
        <!-- State Exhibit Grid -->
        <StateExhibitGrid
          v-if="activeTab !== 'CashSettlement'"
          :active-tab="activeTab"
          :active-workbook="activeWorkbook"
          @cell-updated="selectWorkbook"
        />

        <!-- Cash Settlement View -->
        <div v-else class="cash-settlement-layout">
          <!-- Sidebar Rates Panel -->
          <RatesSidebar
            v-model="ratesForm"
            @save="handleSaveRates"
          />

          <!-- Cash Settlement Statement -->
          <CashSettlementSheet
            :cs-sums="csSums"
            :active-workbook="activeWorkbook"
            @ledger-blur="handleLedgerBlur"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted } from 'vue';
import { useWorkbooks } from '../composables/useWorkbooks';
import { useCashSettlement } from '../composables/useCashSettlement';
import WorkbookSelector from '../components/WorkbookSelector.vue';
import RatesSidebar from '../components/RatesSidebar.vue';
import StateExhibitGrid from '../components/StateExhibitGrid.vue';
import CashSettlementSheet from '../components/CashSettlementSheet.vue';
import type { StateExhibit } from '../services/api';

export default defineComponent({
  name: 'Calculator',
  components: {
    WorkbookSelector,
    RatesSidebar,
    StateExhibitGrid,
    CashSettlementSheet,
  },
  setup() {
    const {
      workbooks,
      activeWorkbookId,
      activeWorkbook,
      activeTab,
      loadWorkbooks,
      selectWorkbook,
      deleteActiveWorkbook,
      onFileUpload,
    } = useWorkbooks();

    const {
      csSums,
      ratesForm,
      loadCashSettlement,
      syncRatesForm,
      saveRates,
      onCSCellBlur,
    } = useCashSettlement();

    // Coordinate the active workbook updates to fetch cash settlement calculations & sync rates
    watch(activeWorkbook, async (newWb) => {
      if (newWb) {
        syncRatesForm(newWb.rates);
        await loadCashSettlement(newWb.id);
      }
    }, { immediate: true });

    const FIELDS = [
      { id: 'pw', label: 'Premiums Written' },
      { id: 'pfw', label: 'Policy Fees Written' },
      { id: 'pc', label: 'Premiums Collected' },
      { id: 'pfc', label: 'Policy Fees Collected' },
      { id: 'tax', label: 'Premium Taxes' },
      { id: 'lp', label: 'Losses Paid (Net of Salvage & Subrogation)' },
      { id: 'laep', label: 'Defense & Cost Containment Expenses Paid' },
      { id: 'ae_paid', label: 'Adjusting & Other Expenses Paid' },
      { id: 'pe', label: 'Premium Earned - YTD' },
      { id: 'pfe', label: 'Policy Fees Earned - YTD' },
      { id: 'uep', label: 'Unearned Premium Reserves' },
      { id: 'lu', label: 'Direct Losses Unpaid' },
      { id: 'laeu', label: 'Defense & Cost Containment Unpaid' },
      { id: 'aeu', label: 'Adjusting & Other Unpaid' },
    ];

    const getExhibit = (stateCode: string): StateExhibit | undefined => {
      return activeWorkbook.value?.stateExhibits?.find(e => e.stateCode === stateCode);
    };

    const getCellValue = (stateCode: string, fieldId: string, colIdx: number): number => {
      const ex = getExhibit(stateCode);
      if (!ex) return 0;
      const arr = (ex as any)[fieldId];
      return arr && arr[colIdx] ? Number(arr[colIdx]) : 0;
    };

    const getRowTotal = (stateCode: string, fieldId: string): number => {
      const ex = getExhibit(stateCode);
      if (!ex) return 0;
      const arr = (ex as any)[fieldId] as number[] || [0, 0, 0];
      return arr.reduce((sum, val) => sum + Number(val || 0), 0);
    };

    const getColGrandTotal = (stateCode: string, colIdx: number): number => {
      const ex = getExhibit(stateCode);
      if (!ex) return 0;
      return FIELDS.reduce((sum, f) => {
        const arr = (ex as any)[f.id] || [0, 0, 0];
        return sum + Number(arr[colIdx] || 0);
      }, 0);
    };

    const getWorkbookGrandTotal = (stateCode: string): number => {
      const ex = getExhibit(stateCode);
      if (!ex) return 0;
      return FIELDS.reduce((sum, f) => {
        const arr = (ex as any)[f.id] || [0, 0, 0];
        return sum + arr.reduce((s: number, v: number) => s + Number(v || 0), 0);
      }, 0);
    };

    const handleSaveRates = async () => {
      if (activeWorkbook.value) {
        await saveRates(activeWorkbook.value.id, selectWorkbook);
      }
    };

    const handleLedgerBlur = async (event: Event, key: 'begBal' | 'amtPaid') => {
      if (activeWorkbook.value) {
        const currentVal = activeWorkbook.value.cashSettlement?.[key] || 0;
        await onCSCellBlur(event, activeWorkbook.value.id, key, currentVal, selectWorkbook);
      }
    };

    const exportCSV = () => {
      if (!activeWorkbook.value) return;
      const tabName = activeTab.value;
      let csv = '';

      if (tabName === 'CashSettlement') {
        csv = `Starlight Reinsurance - Cash Settlement - ${activeWorkbook.value.program} - ${activeWorkbook.value.monthLabel}\r\n`;
        csv += `Description,TOTAL 100%,Reinsurer Amount,SSIC Amount\r\n`;
        const trs = document.querySelectorAll('.statement-sheet tbody tr');
        trs.forEach(tr => {
          const tds = tr.querySelectorAll('td');
          const rowStr = Array.from(tds).map(td => {
            const input = td.querySelector('input');
            const val = input ? input.value : td.textContent?.trim() || '';
            return `"${val.replace(/"/g, '""')}"`;
          });
          csv += rowStr.join(',') + '\r\n';
        });
      } else {
        csv = `Starlight Reinsurance - State Exhibit - ${tabName} - ${activeWorkbook.value.program} - ${activeWorkbook.value.monthLabel}\r\n`;
        csv += `Description,19.3 Commercial Auto,19.4 Other Commercial Auto,21.2 Phys Damage,Total\r\n`;
        FIELDS.forEach(f => {
          const rowLabel = f.label;
          const col0 = getCellValue(tabName, f.id, 0);
          const col1 = getCellValue(tabName, f.id, 1);
          const col2 = getCellValue(tabName, f.id, 2);
          const total = getRowTotal(tabName, f.id);
          csv += `"${rowLabel}",${col0},${col1},${col2},${total}\r\n`;
        });
        csv += `"GRAND TOTAL",${getColGrandTotal(tabName, 0)},${getColGrandTotal(tabName, 1)},${getColGrandTotal(tabName, 2)},${getWorkbookGrandTotal(tabName)}\r\n`;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `Starlight_${activeWorkbook.value.program}_${activeWorkbook.value.monthLabel}_${tabName}.csv`);
      link.click();
    };

    onMounted(loadWorkbooks);

    return {
      workbooks,
      activeWorkbookId,
      activeWorkbook,
      activeTab,
      ratesForm,
      csSums,
      onFileUpload,
      deleteActiveWorkbook,
      selectWorkbook,
      handleSaveRates,
      handleLedgerBlur,
      exportCSV,
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

.filter-panel {
  padding: 1rem 1.25rem;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-select-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.filter-select-group label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0;
  white-space: nowrap;
}

.filter-select {
  padding: 0.45rem 0.75rem;
  font-size: 0.88rem;
  border-radius: 6px;
  border: 1px solid var(--glass-border);
  background: var(--bg-surface);
  color: var(--color-text);
  cursor: pointer;
  min-width: 240px;
  flex: 1;
  outline: none;
  transition: var(--transition-smooth);
}

.filter-select:focus {
  border-color: var(--color-primary);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
