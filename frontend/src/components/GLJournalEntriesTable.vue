<template>
  <div class="card-panel">
    <div class="table-container">
      <table class="excel-table gl-table">
        <thead>
          <tr>
            <th>Account Description</th>
            <th>Comp</th>
            <th>ACCOUNT</th>
            <th>CC</th>
            <th>MGA</th>
            <th>LOB</th>
            <th>ST</th>
            <th>EXT</th>
            <th>Sub</th>
            <th>Description</th>
            <th class="text-right">Debit</th>
            <th class="text-right">Credit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in gljeRows" :key="row.desc + row.account + row.debit">
            <td>{{ row.desc }}</td>
            <td class="text-center">{{ row.comp }}</td>
            <td class="text-center">{{ row.account }}</td>
            <td class="text-center">{{ row.cc }}</td>
            <td class="text-center">{{ row.mga }}</td>
            <td class="text-center">{{ row.lob }}</td>
            <td class="text-center">{{ row.st }}</td>
            <td class="text-center">{{ row.ext }}</td>
            <td class="text-center">{{ row.sub }}</td>
            <td>{{ row.lineDesc }}</td>
            <td class="text-right font-mono text-success">{{ formatDebitCredit(row.debit) }}</td>
            <td class="text-right font-mono text-error">{{ formatDebitCredit(row.credit) }}</td>
          </tr>
  
          <!-- GL Control Totals -->
          <tr class="grand-total-row">
            <td colspan="10">JE Control Totals</td>
            <td class="text-right font-mono">{{ formatDebitCredit(glTotals.debit) }}</td>
            <td class="text-right font-mono">({{ formatDebitCredit(glTotals.credit) }})</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'GLJournalEntriesTable',
  props: {
    gljeRows: {
      type: Array as () => any[],
      required: true,
    },
  },
  setup(props) {
    const glTotals = computed(() => {
      let debit = 0;
      let credit = 0;
      props.gljeRows.forEach(r => {
        debit += Number(r.debit || 0);
        credit += Number(r.credit || 0);
      });
      return { debit, credit };
    });

    const formatDebitCredit = (val: number): string => {
      if (val === 0 || isNaN(val)) return '';
      return val.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    return {
      glTotals,
      formatDebitCredit,
    };
  },
});
</script>
