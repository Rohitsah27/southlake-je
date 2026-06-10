<template>
  <div class="card-panel rates-panel">
    <h3>📈 Actuarial Rates & Commissions (%)</h3>
    
    <div class="inputs-grid rates-grid">
      <div class="input-group">
        <label>Ceding Commission (%)</label>
        <input 
          type="number" 
          step="0.1"
          :value="modelValue.comm" 
          @input="onInput('comm', $event)" 
        />
      </div>
      <div class="input-group">
        <label>ULAE Ceding (%)</label>
        <input 
          type="number" 
          step="0.1"
          :value="modelValue.ulae" 
          @input="onInput('ulae', $event)" 
        />
      </div>
      <div class="input-group">
        <label>Loss Pick (%)</label>
        <input 
          type="number" 
          step="0.1"
          :value="modelValue.lossPick" 
          @input="onInput('lossPick', $event)" 
        />
      </div>
      <div class="input-group">
        <label>LAE - DCC (%)</label>
        <input 
          type="number" 
          step="0.1"
          :value="modelValue.laeDcc" 
          @input="onInput('laeDcc', $event)" 
        />
      </div>
      <div class="input-group">
        <label>LAE - AOE (%)</label>
        <input 
          type="number" 
          step="0.1"
          :value="modelValue.laeAoe" 
          @input="onInput('laeAoe', $event)" 
        />
      </div>
      <div class="input-group">
        <label>Boards Charge (%)</label>
        <input 
          type="number" 
          step="0.01"
          :value="modelValue.boardsCharge" 
          @input="onInput('boardsCharge', $event)" 
        />
      </div>
      <div class="input-group">
        <label>Loss Ratio Cap (%)</label>
        <input 
          type="number" 
          step="0.1"
          :value="modelValue.lossRatioCap" 
          @input="onInput('lossRatioCap', $event)" 
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActuarialRatesForm',
  props: {
    modelValue: {
      type: Object,
      required: true,
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
