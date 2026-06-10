<template>
  <div class="card-panel params-sidebar">
    <h3>Treaty Rates</h3>
    <div class="param-group" v-for="rate in RATE_FIELDS" :key="rate.id">
      <label>{{ rate.label }}</label>
      <div class="input-wrapper">
        <input 
          type="number" 
          step="0.05" 
          :value="modelValue[rate.id]" 
          @input="onInput(rate.id, $event)" 
        />
        <span>%</span>
      </div>
    </div>
    <button class="btn btn-primary btn-block" @click="$emit('save')">
      🔄 Update Rates
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RatesSidebar',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const RATE_FIELDS = [
      { id: 'qs', label: 'Q/S Share %' },
      { id: 'cf', label: 'Ceding Fee % (CF)' },
      { id: 'comm', label: 'Commission Due %' },
      { id: 'bb', label: 'Boards & Bureau (BB) %' },
      { id: 'ulae', label: 'Adjusting (ULAE) Paid %' },
      { id: 'xol', label: 'XOL Fees Due %' },
      { id: 'lr', label: 'LR Cap %' },
    ];

    const onInput = (rateId: string, event: Event) => {
      const target = event.target as HTMLInputElement;
      const val = parseFloat(target.value);
      const updated = {
        ...props.modelValue,
        [rateId]: isNaN(val) ? 0 : val,
      };
      emit('update:modelValue', updated);
    };

    return {
      RATE_FIELDS,
      onInput,
    };
  },
});
</script>
