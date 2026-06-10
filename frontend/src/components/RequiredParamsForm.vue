<template>
  <div class="card-panel params-panel">
    <h3>📋 Required Parameters</h3>
    
    <div class="inputs-grid params-grid">
      <div class="input-group">
        <label>Premiums Written</label>
        <input 
          type="number" 
          step="0.01"
          :value="modelValue.premiumWritten" 
          @input="onInput('premiumWritten', $event)" 
        />
      </div>
      <div class="input-group">
        <label>Previous Unearned Premium Reserve</label>
        <input 
          type="number" 
          step="0.01"
          :value="modelValue.prevUEP" 
          @input="onInput('prevUEP', $event)" 
        />
      </div>
      <div class="input-group">
        <label>Current Unearned Premium Reserve</label>
        <input 
          type="number" 
          step="0.01"
          :value="modelValue.currUEP" 
          @input="onInput('currUEP', $event)" 
        />
      </div>
      <div class="input-group">
        <label>Previous Loss IBNR Reserves</label>
        <input 
          type="number" 
          step="0.01"
          :value="modelValue.prevLossIBNR" 
          @input="onInput('prevLossIBNR', $event)" 
        />
      </div>
      <div class="input-group">
        <label>{{ laeLabel }}</label>
        <input 
          type="number" 
          step="0.01"
          :value="modelValue.prevDCCIBNR" 
          @input="onInput('prevDCCIBNR', $event)" 
        />
      </div>
      <div class="input-group">
        <label>Previous ULAE IBNR Reserves</label>
        <input 
          type="number" 
          step="0.01"
          :value="modelValue.prevULAEIBNR" 
          @input="onInput('prevULAEIBNR', $event)" 
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RequiredParamsForm',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    laeLabel: {
      type: String,
      default: 'Previous LAE IBNR Reserves - DCC',
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const onInput = (fieldKey: string, event: Event) => {
      const target = event.target as HTMLInputElement;
      const updated = {
        ...props.modelValue,
        [fieldKey]: target.value === '' ? 0 : Number(target.value),
      };
      emit('update:modelValue', updated);
      emit('change');
    };

    return {
      onInput,
    };
  },
});
</script>
