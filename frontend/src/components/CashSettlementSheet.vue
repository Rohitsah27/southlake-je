<template>
  <div class="card-panel statement-sheet">
    <table class="excel-table">
      <thead>
        <tr>
          <th rowspan="2">Description</th>
          <th>(1) TOTAL</th>
          <th>(2) REINSURERS AMOUNT</th>
          <th>(3) SSIC AMOUNT</th>
        </tr>
        <tr>
          <th>100 %</th>
          <th>Starlight Re {{ activeWorkbook.rates.qs }}%</th>
          <th>{{ 100 - activeWorkbook.rates.qs }}%</th>
        </tr>
      </thead>
      <tbody>
        <!-- QS Premiums -->
        <tr class="bold-row">
          <td>1. QUOTA SHARE PREMIUMS WRITTEN</td>
          <td class="num-col">{{ formatDisplayVal(csSums.pw) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_pw) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_pw) }}</td>
        </tr>
        <tr>
          <td>2. POLICY FEES</td>
          <td class="num-col">{{ formatDisplayVal(csSums.pfw) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_pfw) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_pfw) }}</td>
        </tr>
        <tr class="bold-row divider-row">
          <td>3. NET PREMIUMS INCLUDING POLICY FEES</td>
          <td class="num-col">{{ formatDisplayVal(csSums.pw_tot) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_pw_tot) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_pw_tot) }}</td>
        </tr>

        <!-- QS Collected -->
        <tr class="bold-row header-divider">
          <td>4. COLLECTED PREMIUMS</td>
          <td class="num-col">{{ formatDisplayVal(csSums.pc) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_pc) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_pc) }}</td>
        </tr>
        <tr>
          <td>5. POLICY FEES</td>
          <td class="num-col">{{ formatDisplayVal(csSums.pfc) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_pf) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_pfc) }}</td>
        </tr>
        <tr class="bold-row divider-row">
          <td>6. NET COLLECTED PREMIUMS</td>
          <td class="num-col">{{ formatDisplayVal(csSums.pc_tot) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_pc_tot) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_pc_tot) }}</td>
        </tr>

        <!-- Commission -->
        <tr class="header-divider">
          <td>7. LESS: COMMISSION DUE</td>
          <td class="num-col">{{ formatDisplayVal(csSums.total_comm) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_comm) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_comm) }}</td>
        </tr>
        <tr>
          <td>LESS: POLICY FEES</td>
          <td class="num-col">{{ formatDisplayVal(csSums.pfc) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_pf) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_pf) }}</td>
        </tr>
        <tr class="bold-row divider-row">
          <td>TOTAL COMMISSION DUE</td>
          <td class="num-col">{{ formatDisplayVal(csSums.total_comm_tot) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_comm_tot) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_comm_tot) }}</td>
        </tr>

        <!-- Losses -->
        <tr class="header-divider">
          <td>8. LESS: LOSS FUNDING</td>
          <td class="num-col">-</td>
          <td class="num-col">-</td>
          <td class="num-col">-</td>
        </tr>
        <tr>
          <td>LESS: LOSSES PAID (net of salvage)</td>
          <td class="num-col">{{ formatDisplayVal(csSums.lp) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_lp) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_lp) }}</td>
        </tr>
        <tr>
          <td>LESS: UNEARNED LOSS ADJUSTMENT EXPENSE</td>
          <td class="num-col">-</td>
          <td class="num-col">-</td>
          <td class="num-col">-</td>
        </tr>
        <tr>
          <td>LESS: DEFENSE AND COST CONTAINMENT (ALAE)</td>
          <td class="num-col">{{ formatDisplayVal(csSums.laep) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_laep) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_laep) }}</td>
        </tr>
        <tr>
          <td>LESS: ADJUSTING & OTHER EXPENSES PAID</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ae_paid) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_ae_paid) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_ae_paid) }}</td>
        </tr>
        <tr class="bold-row divider-row">
          <td>TOTAL LOSSES PAID</td>
          <td class="num-col">{{ formatDisplayVal(csSums.losses_tot) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_losses_tot) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_losses_tot) }}</td>
        </tr>

        <!-- Subtotal -->
        <tr class="subtotal-row">
          <td>SUBTOTAL DUE</td>
          <td class="num-col">{{ formatDisplayVal(csSums.total_sub_total) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.sub_total) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_sub_total) }}</td>
        </tr>

        <!-- SSIC charges -->
        <tr>
          <td>9. ceding fee due</td>
          <td class="num-col">-</td>
          <td class="num-col">-</td>
          <td class="num-col text-teal">{{ formatDisplayVal(csSums.ssic_cf) }}</td>
        </tr>
        <tr>
          <td>10. BOARDS & BUREAUS DUE</td>
          <td class="num-col">-</td>
          <td class="num-col text-error">{{ formatDisplayVal(-csSums.ssic_bb) }}</td>
          <td class="num-col text-teal">{{ formatDisplayVal(csSums.ssic_bb) }}</td>
        </tr>
        <tr>
          <td>XOL FEES DUE</td>
          <td class="num-col">-</td>
          <td class="num-col text-error">{{ formatDisplayVal(-csSums.ssic_xol) }}</td>
          <td class="num-col text-teal">{{ formatDisplayVal(csSums.ssic_xol) }}</td>
        </tr>
        <tr>
          <td>LR Cap</td>
          <td class="num-col">-</td>
          <td class="num-col">-</td>
          <td class="num-col">{{ formatDisplayVal(activeWorkbook.rates.lr) }}</td>
        </tr>
        <tr class="bold-row divider-row">
          <td>TOTAL TAXES & FEES DUE</td>
          <td class="num-col">-</td>
          <td class="num-col">-</td>
          <td class="num-col text-teal" style="text-decoration: underline;">{{ formatDisplayVal(csSums.ssic_taxes_tot) }}</td>
        </tr>

        <!-- Balance due reinsurers -->
        <tr class="subtotal-row reinsurer-bal-row">
          <td>TOTAL BALANCE DUE REINSURERS</td>
          <td class="num-col">-</td>
          <td class="num-col text-purple" style="font-size: 0.95rem;">{{ formatDisplayVal(csSums.reins_bal) }}</td>
          <td class="num-col">-</td>
        </tr>
        <tr class="bold-row">
          <td>TOTAL BALANCE DUE SSIC</td>
          <td class="num-col">-</td>
          <td class="num-col">-</td>
          <td class="num-col text-teal">{{ formatDisplayVal(csSums.ssic_bal) }}</td>
        </tr>

        <!-- Ledger balance -->
        <tr class="header-divider">
          <td>Beginning Balance Due TO/(FROM) SSIC</td>
          <td class="num-col">-</td>
          <td class="num-col">-</td>
          <td class="num-col yellow-cell">
            <input
              type="text"
              class="cell-input"
              :value="formatInputVal(activeWorkbook.cashSettlement?.begBal || 0)"
              @focus="onCellFocus($event, activeWorkbook.cashSettlement?.begBal || 0)"
              @blur="onCSBlur($event, 'begBal')"
            />
          </td>
        </tr>
        <tr>
          <td>Less: Amounts Paid TO/(FROM) SSIC</td>
          <td class="num-col">-</td>
          <td class="num-col">-</td>
          <td class="num-col yellow-cell">
            <input
              type="text"
              class="cell-input"
              :value="formatInputVal(activeWorkbook.cashSettlement?.amtPaid || 0)"
              @focus="onCellFocus($event, activeWorkbook.cashSettlement?.amtPaid || 0)"
              @blur="onCSBlur($event, 'amtPaid')"
            />
          </td>
        </tr>
        <tr class="subtotal-row">
          <td>Ending Balance Due TO/(FROM) SSIC</td>
          <td class="num-col">-</td>
          <td class="num-col">-</td>
          <td class="num-col text-teal" style="font-size: 0.95rem; text-decoration: underline double;">
            {{ formatDisplayVal(csSums.ending_bal) }}
          </td>
        </tr>

        <!-- Reserves -->
        <tr class="header-divider">
          <td>UNEARNED PREMIUM</td>
          <td class="num-col">{{ formatDisplayVal(csSums.uep) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_uep) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_uep) }}</td>
        </tr>
        <tr>
          <td>OUTSTANDING LOSS RESERVES</td>
          <td class="num-col">{{ formatDisplayVal(csSums.lu) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_lu) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_lu) }}</td>
        </tr>
        <tr>
          <td>OUTSTANDING LAE RESERVES</td>
          <td class="num-col">{{ formatDisplayVal(csSums.laeu) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_laeu) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_laeu) }}</td>
        </tr>
        <tr>
          <td>OUTSTANDING ULAE RESERVES</td>
          <td class="num-col">{{ formatDisplayVal(csSums.aeu) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.reins_aeu) }}</td>
          <td class="num-col">{{ formatDisplayVal(csSums.ssic_aeu) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Workbook } from '../services/api';

export default defineComponent({
  name: 'CashSettlementSheet',
  props: {
    csSums: {
      type: Object,
      required: true,
    },
    activeWorkbook: {
      type: Object as () => Workbook,
      required: true,
    },
  },
  emits: ['ledger-blur'],
  setup(_, { emit }) {
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

    const onCSBlur = (event: Event, key: 'begBal' | 'amtPaid') => {
      emit('ledger-blur', event, key);
    };

    return {
      formatDisplayVal,
      formatInputVal,
      onCellFocus,
      onCSBlur,
    };
  },
});
</script>
