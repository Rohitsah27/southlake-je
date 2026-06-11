<template>
  <div class="card-panel">
    <div class="table-container">
      <table class="excel-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>19.3 Comm'l Auto<br><span class="col-sub">No-Fault</span></th>
            <th>19.4 Other Comm'l Auto Liab<br><span class="col-sub">Auto Liab</span></th>
            <th>21.2 Comm'l Auto Phys Damage<br><span class="col-sub">Phys Damage</span></th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in FIELDS" :key="field.id">
            <td class="row-label">{{ field.label }}</td>
            
            <!-- Column Inputs -->
            <td v-for="colIdx in [0, 1, 2]" :key="colIdx" class="num-col" :class="{ 'yellow-cell': activeTab !== 'TOTAL' }">
              <input
                v-if="activeTab !== 'TOTAL'"
                type="text"
                class="cell-input"
                :value="formatInputVal(getCellValue(activeTab, field.id, colIdx))"
                @focus="onCellFocus($event, getCellValue(activeTab, field.id, colIdx))"
                @blur="onCellBlur($event, activeTab, field.id, colIdx)"
              />
              <span v-else class="cell-span">{{ formatDisplayVal(getCellValue('TOTAL', field.id, colIdx)) }}</span>
            </td>
  
            <!-- Row Total -->
            <td class="total-col">
              {{ formatDisplayVal(getRowTotal(activeTab, field.id)) }}
            </td>
          </tr>
  
          <!-- Grand Total Row -->
          <tr class="grand-total-row">
            <td>GRAND TOTAL</td>
            <td v-for="colIdx in [0, 1, 2]" :key="colIdx" class="num-col">
              {{ formatDisplayVal(getColGrandTotal(activeTab, colIdx)) }}
            </td>
            <td class="total-col">
              {{ formatDisplayVal(getWorkbookGrandTotal(activeTab)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { api } from '../services/api';
import type { Workbook, StateExhibit } from '../services/api';

export default defineComponent({
  name: 'StateExhibitGrid',
  props: {
    activeTab: {
      type: String,
      required: true,
    },
    activeWorkbook: {
      type: Object as () => Workbook,
      required: true,
    },
  },
  emits: ['cell-updated'],
  setup(props, { emit }) {
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

    const RESERVE_FIELDS = [
      { id: 'loss_reserves', label: 'Loss Reserves / Case Reserves' },
      { id: 'loss_ibnr', label: 'Loss IBNR Reserves' },
      { id: 'lae_reserves_dcc', label: 'LAE Reserves - DCC' },
      { id: 'lae_ibnr_dcc', label: 'LAE IBNR Reserves - DCC' },
      { id: 'lae_reserves_aoe', label: 'LAE Reserves - AOE' },
      { id: 'lae_ibnr_aoe', label: 'LAE IBNR Reserves - AOE' },
      { id: 'ulae_ibnr', label: 'ULAE IBNR Reserves' },
    ];

    const getExhibit = (stateCode: string): StateExhibit | undefined => {
      return props.activeWorkbook.stateExhibits?.find(e => e.stateCode === stateCode);
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

    const getColReserveGrandTotal = (stateCode: string, colIdx: number): number => {
      const ex = getExhibit(stateCode);
      if (!ex) return 0;
      return RESERVE_FIELDS.reduce((sum, f) => {
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

    const getWorkbookReserveGrandTotal = (stateCode: string): number => {
      const ex = getExhibit(stateCode);
      if (!ex) return 0;
      return RESERVE_FIELDS.reduce((sum, f) => {
        const arr = (ex as any)[f.id] || [0, 0, 0];
        return sum + arr.reduce((s: number, v: number) => s + Number(v || 0), 0);
      }, 0);
    };

    const formatDisplayVal = (val: number): string => {
      if (val === 0 || isNaN(val)) return '-';
      const absVal = Math.abs(val);
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(absVal);
      return val < 0 ? `(${formatted})` : formatted;
    };

    const formatInputVal = (val: number): string => {
      if (val === 0 || isNaN(val)) return '-';
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(val);
    };

    const onCellFocus = (event: Event, rawVal: number) => {
      const input = event.target as HTMLInputElement;
      if (rawVal === 0) {
        input.value = '';
      } else {
        input.value = String(rawVal);
      }
      input.select();
    };

    const onCellBlur = async (event: Event, stateCode: string, fieldId: string, colIdx: number) => {
      const input = event.target as HTMLInputElement;
      const valStr = input.value.trim();
      let val = 0;
      if (valStr !== '') {
        val = parseFloat(valStr.replace(/,/g, ''));
        if (isNaN(val)) val = 0;
      }

      const currentVal = getCellValue(stateCode, fieldId, colIdx);
      if (val === currentVal) {
        input.value = formatInputVal(currentVal);
        return;
      }

      const ex = getExhibit(stateCode);
      if (!ex) return;
      const updatedArr = [...((ex as any)[fieldId] || [0, 0, 0])];
      updatedArr[colIdx] = val;

      const payload = {
        [fieldId]: updatedArr,
      };

      try {
        await api.updateExhibit(props.activeWorkbook.id, stateCode, payload);
        emit('cell-updated', props.activeWorkbook.id);
      } catch (err) {
        alert('Failed to update cell values');
        input.value = formatInputVal(currentVal);
      }
    };

    return {
      FIELDS,
      RESERVE_FIELDS,
      getCellValue,
      getRowTotal,
      getColGrandTotal,
      getColReserveGrandTotal,
      getWorkbookGrandTotal,
      getWorkbookReserveGrandTotal,
      formatDisplayVal,
      formatInputVal,
      onCellFocus,
      onCellBlur,
    };
  },
});
</script>
