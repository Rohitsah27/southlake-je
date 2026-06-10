<template>
  <div class="card-panel mappings-panel">
    <h3>⚙️ GL Account Mappings Settings</h3>
    <p class="subtitle">Customize the segment codes for this workbook's program. Changes will instantly update the generated GL journal entries.</p>
    
    <div class="inputs-grid mappings-grid">
      <div class="input-group">
        <label>Company (Comp)</label>
        <input 
          type="text" 
          :value="modelValue.comp" 
          @input="onInput('comp', $event)" 
        />
      </div>
      <div class="input-group">
        <label>Cost Center (CC)</label>
        <input 
          type="text" 
          :value="modelValue.cc" 
          @input="onInput('cc', $event)" 
        />
      </div>
      <div class="input-group">
        <label>MGA</label>
        <input 
          type="text" 
          :value="modelValue.mga" 
          @input="onInput('mga', $event)" 
        />
      </div>
      <div class="input-group">
        <label>LOB</label>
        <input 
          type="text" 
          :value="modelValue.lob" 
          @input="onInput('lob', $event)" 
        />
      </div>
      <div class="input-group">
        <label>Extension (EXT)</label>
        <input 
          type="text" 
          :value="modelValue.ext" 
          @input="onInput('ext', $event)" 
        />
      </div>
      <div class="input-group">
        <label>Sub-account (Sub)</label>
        <input 
          type="text" 
          :value="modelValue.sub" 
          @input="onInput('sub', $event)" 
        />
      </div>
      <div class="input-group suffix-group">
        <label>Line Desc Suffix</label>
        <input 
          type="text" 
          :value="modelValue.lineDescSuffix" 
          @input="onInput('lineDescSuffix', $event)" 
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MappingSettingsForm',
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
        [fieldKey]: target.value,
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
