<template>
  <div class="card-panel">
    <div class="table-container">
      <table class="excel-table">
        <thead>
          <tr>
            <th class="text-left w-2/3">Description</th>
            <th class="text-right w-1/3">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in statementRows"
            :key="row.label"
            :class="{ 'bold-row': row.isBold, 'header-row': row.isHeader }"
          >
            <td class="text-left" :class="row.borderClass">{{ row.label }}</td>
            <td v-if="!row.isHeader" class="text-right font-mono" :class="[row.borderClass, row.isBold ? 'text-white' : '']">
              {{ formatVal(row.value, row.isRatio) }}
            </td>
            <td v-else>-</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ReinsuranceStatementTable',
  props: {
    statementRows: {
      type: Array as () => any[],
      required: true,
    },
  },
  setup() {
    const formatVal = (val: number | undefined, isPercentage = false): string => {
      if (val === undefined || isNaN(val)) return '-';
      if (isPercentage) return val.toFixed(1) + '%';
      if (val === 0) return '-';
      const absVal = Math.abs(val);
      const formatted = absVal.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return val < 0 ? `(${formatted})` : formatted;
    };

    return {
      formatVal,
    };
  },
});
</script>
