<template>
  <div class="seeder-editor-container">
    <div class="card-panel header-card">
      <h2>🛠️ ITD Editor</h2>
      <p class="description-text">
        View and edit the Inception-to-Date seeder JSON files. Updates made here are saved directly to the seeder files on disk and synced to the database.
      </p>
    </div>

    <div class="workspace-split" v-if="states.length > 0">
      <!-- View/State Filter Panel -->
      <div class="card-panel filter-panel">
        <div class="filter-row">
          <div class="filter-select-group">
            <label>Select State</label>
            <select :value="activeState" @change="selectState(($event.target as HTMLSelectElement).value)" class="filter-select">
              <option v-for="st in states" :key="st.stateCode" :value="st.stateCode">
                🗺️ State {{ st.stateCode }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statement Editor -->
      <main class="card-panel editor-area" v-if="currentStateData">
        <div class="editor-header">
          <h3>Reinsurance Statement for State: <span class="highlight">{{ activeState }}</span></h3>
          <button class="btn btn-success" :disabled="saving" @click="saveChanges">
            {{ saving ? '💾 Saving...' : '💾 Save State Seeder Data' }}
          </button>
        </div>

        <div class="sheet-container">
          <table class="statement-table">
            <thead>
              <tr class="header-row">
                <th class="text-left">Description</th>
                <th class="text-right width-value">Dec 2025 ITD Totals</th>
              </tr>
            </thead>
            <tbody>
              <!-- Premiums Written -->
              <tr class="input-row bold-row">
                <td>Premiums Written</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.pw" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Change in UEP -->
              <tr class="calc-row">
                <td>Change in UEP</td>
                <td class="text-right">{{ formatVal(-currentStateData.uep) }}</td>
              </tr>
              <!-- Premiums Earned -->
              <tr class="calc-row bold-row border-double-bottom">
                <td>Premiums Earned</td>
                <td class="text-right bold-text">{{ formatVal(currentStateData.pw - currentStateData.uep) }}</td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>
              
              <tr class="section-header">
                <td colspan="2">Less:</td>
              </tr>
              <!-- Ceding Commissions at 29% -->
              <tr class="calc-row">
                <td>Ceding Commissions at 29%</td>
                <td class="text-right">{{ formatVal(currentStateData.pw * 0.29) }}</td>
              </tr>
              <!-- Ceding Commissions on UEP -->
              <tr class="calc-row">
                <td>Ceding Commissions on UEP</td>
                <td class="text-right">-</td>
              </tr>
              <!-- Ceding Commissions Earned -->
              <tr class="calc-row bold-row border-single-bottom">
                <td>Ceding Commissions Earned</td>
                <td class="text-right">{{ formatVal(currentStateData.pw * 0.29) }}</td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>

              <!-- Losses Paid (net of salvage & subro) -->
              <tr class="input-row bold-row">
                <td>Losses Paid (net of salvage & subro)</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.lp" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Change in Loss Reserves -->
              <tr class="input-row">
                <td>Change in Loss Reserves</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.loss_reserves" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Change in Loss IBNR Reserves -->
              <tr class="input-row">
                <td>Change in Loss IBNR Reserves</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.loss_ibnr" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Losses Incurred -->
              <tr class="calc-row bold-row border-single-bottom">
                <td>Losses Incurred</td>
                <td class="text-right">{{ formatVal(currentStateData.lp + currentStateData.loss_reserves + currentStateData.loss_ibnr) }}</td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>

              <!-- Defense and Cost Containment Expense Paid (DCC) -->
              <tr class="input-row">
                <td>Defense and Cost Containment Expense Paid (DCC)</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.laep" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Change in DCC Reserves -->
              <tr class="input-row">
                <td>Change in DCC Reserves</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.lae_reserves_dcc" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Change in DCC IBNR Reserves -->
              <tr class="input-row">
                <td>Change in DCC IBNR Reserves</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.lae_ibnr_dcc" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Adjusting & Other Expense Paid (AOE) -->
              <tr class="input-row bold-row">
                <td>Adjusting & Other Expense Paid (AOE)</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.ae_paid" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Change in AOE Reserves -->
              <tr class="input-row">
                <td>Change in AOE Reserves</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.lae_reserves_aoe" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Change in AOE IBNR Reserves -->
              <tr class="input-row">
                <td>Change in AOE IBNR Reserves</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.lae_ibnr_aoe" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Unallocated Loss Adjustment Expense at 7% -->
              <tr class="calc-row bold-row">
                <td>Unallocated Loss Adjustment Expense at 7%</td>
                <td class="text-right">{{ formatVal(currentStateData.pw * 0.07) }}</td>
              </tr>
              <!-- Change in ULAE IBNR Reserves -->
              <tr class="input-row">
                <td>Change in ULAE IBNR Reserves</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.ulae_ibnr" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Loss Adjustment Expenses Incurred -->
              <tr class="calc-row bold-row border-single-bottom">
                <td>Loss Adjustment Expenses Incurred</td>
                <td class="text-right">{{ formatVal(currentStateData.laep + currentStateData.lae_reserves_dcc + currentStateData.lae_ibnr_dcc + currentStateData.ae_paid + currentStateData.lae_reserves_aoe + currentStateData.lae_ibnr_aoe + currentStateData.pw * 0.07 + currentStateData.ulae_ibnr) }}</td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>

              <!-- Boards & Bureaus / ISO Charge at .4% -->
              <tr class="calc-row">
                <td>Boards & Bureaus / ISO Charge at .4%</td>
                <td class="text-right">{{ formatVal(currentStateData.pw * 0.004) }}</td>
              </tr>
              <!-- Boards & Bureaus / ISO Charge at .4% on UEP -->
              <tr class="calc-row">
                <td>Boards & Bureaus / ISO Charge at .4% on UEP</td>
                <td class="text-right">{{ formatVal(-currentStateData.uep * 0.004) }}</td>
              </tr>
              <!-- Loss Ratio Cap Charge at 2% -->
              <tr class="calc-row">
                <td>Loss Ratio Cap Charge at 2%</td>
                <td class="text-right">{{ formatVal(currentStateData.pw * 0.02) }}</td>
              </tr>
              <!-- Loss Ratio Cap on UEP 2% -->
              <tr class="calc-row">
                <td>Loss Ratio Cap on UEP 2%</td>
                <td class="text-right">{{ formatVal(-currentStateData.uep * 0.02) }}</td>
              </tr>
              <!-- Other Expenses Incurred -->
              <tr class="calc-row bold-row border-single-bottom">
                <td>Other Expenses Incurred</td>
                <td class="text-right">{{ formatVal(currentStateData.pw * 0.004 - currentStateData.uep * 0.004 + currentStateData.pw * 0.02 - currentStateData.uep * 0.02) }}</td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>

              <!-- Total Profit (Loss) -->
              <tr class="calc-row bold-row border-double-bottom">
                <td>Total Profit (Loss)</td>
                <td class="text-right">{{ formatVal((currentStateData.pw - currentStateData.uep) - (currentStateData.pw * 0.29) - (currentStateData.lp + currentStateData.loss_reserves + currentStateData.loss_ibnr) - (currentStateData.laep + currentStateData.lae_reserves_dcc + currentStateData.lae_ibnr_dcc + currentStateData.ae_paid + currentStateData.lae_reserves_aoe + currentStateData.lae_ibnr_aoe + currentStateData.pw * 0.07 + currentStateData.ulae_ibnr) - (currentStateData.pw * 0.004 - currentStateData.uep * 0.004 + currentStateData.pw * 0.02 - currentStateData.uep * 0.02)) }}</td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>

              <!-- Reinsurance Brokerage Fee -->
              <tr class="calc-row">
                <td>Reinsurance Brokerage Fee</td>
                <td class="text-right">-</td>
              </tr>
              <!-- Net Settlement due to/(from) Reinsurer -->
              <tr class="calc-row bold-row border-double-bottom">
                <td>Net Settlement due to/(from) Reinsurer</td>
                <td class="text-right">{{ formatVal(currentStateData.pw - (currentStateData.pw * 0.29) - currentStateData.lp - currentStateData.laep - currentStateData.ae_paid - (currentStateData.pw * 0.07) - (currentStateData.pw * 0.004) - (currentStateData.pw * 0.02)) }}</td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>

              <!-- Loss Funding -->
              <tr class="calc-row">
                <td>Loss Funding</td>
                <td class="text-right">-</td>
              </tr>
              <!-- Net Settlement due from NTA -->
              <tr class="calc-row bold-row border-double-bottom">
                <td class="text-red">Net Settlement due from NTA</td>
                <td class="text-right text-red">{{ formatVal(currentStateData.pw - (currentStateData.pw * 0.29) - currentStateData.lp - currentStateData.laep - currentStateData.ae_paid - (currentStateData.pw * 0.07)) }}</td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>

              <!-- Fronting Fee @ 5% -->
              <tr class="calc-row">
                <td>Fronting Fee @ 5% (paid by separate wire from NTA)</td>
                <td class="text-right">{{ formatVal(currentStateData.pw * 0.05) }}</td>
              </tr>
              <!-- Fronting Fee on UEP -->
              <tr class="calc-row">
                <td>Fronting Fee on UEP</td>
                <td class="text-right">{{ formatVal(-currentStateData.uep * 0.05) }}</td>
              </tr>
              <!-- Total Fees Earned - SSIC -->
              <tr class="calc-row bold-row border-double-bottom">
                <td>Total Fees Earned - SSIC</td>
                <td class="text-right">{{ formatVal(currentStateData.pw * 0.004 - currentStateData.uep * 0.004 + currentStateData.pw * 0.02 - currentStateData.uep * 0.02 + currentStateData.pw * 0.05 - currentStateData.uep * 0.05) }}</td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>

              <!-- Unearned Premium Reserve -->
              <tr class="input-row bold-row">
                <td>Unearned Premium Reserve</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.uep" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Loss Reserves -->
              <tr class="input-row bold-row">
                <td>Loss Reserves</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.loss_reserves" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- Loss IBNR Reserves -->
              <tr class="input-row">
                <td>Loss IBNR Reserves</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.loss_ibnr" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- LAE Reserves - DCC -->
              <tr class="input-row">
                <td>LAE Reserves - DCC</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.lae_reserves_dcc" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- LAE IBNR Reserves - DCC -->
              <tr class="input-row">
                <td>LAE IBNR Reserves - DCC</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.lae_ibnr_dcc" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- LAE Reserves - AOE -->
              <tr class="input-row bold-row">
                <td>LAE Reserves - AOE</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.lae_reserves_aoe" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- LAE IBNR Reserves - AOE -->
              <tr class="input-row">
                <td>LAE IBNR Reserves - AOE</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.lae_ibnr_aoe" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>
              <!-- ULAE IBNR Reserves -->
              <tr class="input-row">
                <td>ULAE IBNR Reserves</td>
                <td>
                  <div class="input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" v-model.number="currentStateData.ulae_ibnr" class="table-input" step="0.01" />
                  </div>
                </td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>

              <!-- Loss Pick rates -->
              <tr class="calc-row bold-row-blue">
                <td class="text-blue">Loss Pick</td>
                <td class="text-right bold-text-blue">61.1%</td>
              </tr>
              <tr class="calc-row bold-row-blue">
                <td class="text-blue">LAE - DCC</td>
                <td class="text-right bold-text-blue">0.0%</td>
              </tr>
              <tr class="calc-row bold-row-blue">
                <td class="text-blue">LAE - AOE</td>
                <td class="text-right bold-text-blue">3.4%</td>
              </tr>
              <tr class="calc-row bold-row border-single-bottom">
                <td>Total Loss Pick</td>
                <td class="text-right">64.5%</td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>

              <!-- Ultimate Loss -->
              <tr class="calc-row">
                <td>Ultimate Loss</td>
                <td class="text-right">{{ formatVal(currentStateData.lp + currentStateData.loss_reserves + currentStateData.loss_ibnr) }}</td>
              </tr>
              <!-- Ultimate LAE - DCC -->
              <tr class="calc-row">
                <td>Ultimate LAE - DCC</td>
                <td class="text-right">-</td>
              </tr>
              <!-- Ultimate LAE - AOE -->
              <tr class="calc-row">
                <td>Ultimate LAE - AOE</td>
                <td class="text-right">{{ formatVal(currentStateData.ae_paid + currentStateData.lae_reserves_aoe + currentStateData.lae_ibnr_aoe) }}</td>
              </tr>
              <!-- Ultimate ULAE -->
              <tr class="calc-row">
                <td>Ultimate ULAE</td>
                <td class="text-right">{{ formatVal(currentStateData.pw * 0.07 + currentStateData.ulae_ibnr) }}</td>
              </tr>
              <!-- Total Ultimate Loss & LAE -->
              <tr class="calc-row bold-row border-single-bottom">
                <td></td>
                <td class="text-right">{{ formatVal((currentStateData.lp + currentStateData.loss_reserves + currentStateData.loss_ibnr) + (currentStateData.ae_paid + currentStateData.lae_reserves_aoe + currentStateData.lae_ibnr_aoe) + (currentStateData.pw * 0.07 + currentStateData.ulae_ibnr)) }}</td>
              </tr>

              <tr class="spacer-row"><td colspan="2"></td></tr>

              <!-- Loss & LAE Reserves (including IBNR) -->
              <tr class="calc-row bold-row border-single-bottom">
                <td>Loss & LAE Reserves (including IBNR)</td>
                <td class="text-right">{{ formatVal(currentStateData.loss_reserves + currentStateData.loss_ibnr + currentStateData.lae_reserves_dcc + currentStateData.lae_ibnr_dcc + currentStateData.lae_reserves_aoe + currentStateData.lae_ibnr_aoe + currentStateData.ulae_ibnr) }}</td>
              </tr>
              <!-- Required Collateral at 115% -->
              <tr class="calc-row bold-row border-double-bottom">
                <td>Required Collateral at 115%</td>
                <td class="text-right">{{ formatVal((currentStateData.loss_reserves + currentStateData.loss_ibnr + currentStateData.lae_reserves_dcc + currentStateData.lae_ibnr_dcc + currentStateData.lae_reserves_aoe + currentStateData.lae_ibnr_aoe + currentStateData.ulae_ibnr) * 1.15) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="card-panel loading-card">
      <p>⏳ Loading ITD Editor data...</p>
    </div>

    <!-- Empty State -->
    <div v-else class="card-panel empty-state">
      <div class="empty-icon">📊</div>
      <h2>No Database ITD Workbook Found</h2>
      <p>Please upload an ITD Excel workbook first to seed the database.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { api } from '../services/api';

interface StateSeederItem {
  stateCode: string;
  data: any;
}

export default defineComponent({
  name: 'SeederEditor',
  setup() {
    const states = ref<StateSeederItem[]>([]);
    const activeState = ref<string>('');
    const currentStateData = ref<any>(null);
    const saving = ref<boolean>(false);
    const loading = ref<boolean>(true);

    const fieldsConfig = [
      { id: 'pw', label: 'Premiums Written' },
      { id: 'pfw', label: 'Policy Fees Written' },
      { id: 'pc', label: 'Premiums Collected / Paid' },
      { id: 'pfc', label: 'Policy Fees Collected' },
      { id: 'tax', label: 'Premium Taxes' },
      { id: 'lp', label: 'Losses Paid (Net of Salvage & Subro)' },
      { id: 'laep', label: 'Defense & Cost Containment Expenses Paid' },
      { id: 'ae_paid', label: 'Adjusting & Other Expenses Paid' },
      { id: 'pe', label: 'Premium Earned - YTD' },
      { id: 'pfe', label: 'Policy Fees Earned - YTD' },
      { id: 'uep', label: 'Unearned Premium Reserves' },
      { id: 'lu', label: 'Direct Losses Unpaid / IBNR' },
      { id: 'laeu', label: 'Defense & Cost Containment Unpaid' },
      { id: 'aeu', label: 'Adjusting & Other Unpaid / ULAE IBNR' },
    ];

    const reserveFieldsConfig = [
      { id: 'loss_reserves', label: 'Loss Reserves / Case Reserves' },
      { id: 'loss_ibnr', label: 'Loss IBNR Reserves' },
      { id: 'lae_reserves_dcc', label: 'LAE Reserves - DCC' },
      { id: 'lae_ibnr_dcc', label: 'LAE IBNR Reserves - DCC' },
      { id: 'lae_reserves_aoe', label: 'LAE Reserves - AOE' },
      { id: 'lae_ibnr_aoe', label: 'LAE IBNR Reserves - AOE' },
      { id: 'ulae_ibnr', label: 'ULAE IBNR Reserves' },
    ];

    const fetchSeederFiles = async () => {
      loading.value = true;
      try {
        const res = await api.getSeederFiles();
        states.value = res;
        if (res.length > 0) {
          selectState(res[0].stateCode);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load seeder files');
      } finally {
        loading.value = false;
      }
    };

    const selectState = (stateCode: string) => {
      activeState.value = stateCode;
      const item = states.value.find(s => s.stateCode === stateCode);
      if (item) {
        const editableData: any = {};
        const allFields = [...fieldsConfig, ...reserveFieldsConfig];
        allFields.forEach(f => {
          const arr = item.data[f.id] || [0, 0, 0];
          editableData[f.id] = arr[1] !== undefined ? Number(arr[1]) : 0;
        });
        currentStateData.value = editableData;
      }
    };

    const saveChanges = async () => {
      if (!activeState.value || !currentStateData.value) return;
      saving.value = true;
      try {
        // Sync calculated DB properties
        currentStateData.value.pc = currentStateData.value.pw;
        currentStateData.value.pfw = 0;
        currentStateData.value.pfc = 0;
        currentStateData.value.tax = 0;
        currentStateData.value.pe = 0;
        currentStateData.value.pfe = 0;
        currentStateData.value.lu = currentStateData.value.loss_reserves + currentStateData.value.loss_ibnr;
        currentStateData.value.laeu = currentStateData.value.lae_reserves_dcc + currentStateData.value.lae_ibnr_dcc;
        currentStateData.value.aeu = currentStateData.value.lae_reserves_aoe + currentStateData.value.lae_ibnr_aoe;

        const payload: any = {
          stateCode: activeState.value,
        };
        const allFields = [...fieldsConfig, ...reserveFieldsConfig];
        allFields.forEach(f => {
          const val = Number(currentStateData.value[f.id]) || 0;
          payload[f.id] = [0, val, 0];
        });

        const res = await api.updateSeederFile(activeState.value, payload);
        
        const item = states.value.find(s => s.stateCode === activeState.value);
        if (item) {
          item.data = payload;
        }

        alert(res.message || 'Seeder file successfully updated.');
      } catch (err) {
        console.error(err);
        alert('Failed to save seeder file updates');
      } finally {
        saving.value = false;
      }
    };

    const formatVal = (val: number): string => {
      if (val === 0 || isNaN(val)) return '-';
      const absVal = Math.abs(val).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return val < 0 ? `(${absVal})` : absVal;
    };

    onMounted(() => {
      fetchSeederFiles();
    });

    return {
      states,
      activeState,
      currentStateData,
      saving,
      loading,
      selectState,
      saveChanges,
      formatVal,
    };
  },
});
</script>

<style scoped>
.seeder-editor-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
}

.header-card h2 {
  font-family: var(--font-display);
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
}

.description-text {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.workspace-split {
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

.editor-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 1rem;
}

.editor-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
}

.highlight {
  color: var(--color-primary);
  background: var(--color-primary-glow);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-weight: 800;
}

.loading-card {
  padding: 3rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

.sheet-container {
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-card);
}

.statement-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-sans), sans-serif;
  font-size: 0.92rem;
  border: 1px solid var(--glass-border);
}

.statement-table th, .statement-table td {
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--glass-border);
  vertical-align: middle;
}

.header-row {
  border-bottom: 2px solid var(--color-primary);
}

.header-row th {
  font-weight: 700;
  color: var(--color-text);
  font-size: 0.95rem;
  padding-bottom: 0.75rem;
}

.width-value {
  width: 240px;
}

.input-row td {
  background: rgba(139, 92, 246, 0.01);
}

.bold-row td {
  font-weight: 700;
  color: var(--color-text);
}

.calc-row td {
  color: var(--color-text-muted);
}

.section-header td {
  font-weight: 700;
  color: var(--color-text);
  padding-top: 1rem;
  padding-bottom: 0.5rem;
  font-size: 0.95rem;
  border-bottom: none;
}

.spacer-row td {
  height: 0.65rem;
  border: none;
  padding: 0;
}

.border-single-bottom td {
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.4);
}

.border-double-bottom td {
  border-bottom: 3px double rgba(255, 255, 255, 0.4);
}

.text-red {
  color: #f87171 !important;
  font-weight: 800;
}

.text-blue {
  color: #60a5fa !important;
}

.bold-row-blue td {
  font-weight: 700;
  color: #60a5fa !important;
}

.bold-text-blue {
  font-weight: 800;
  color: #60a5fa !important;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.table-input {
  width: 150px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 700;
  text-align: right;
  padding: 0.3rem 0.5rem 0.3rem 1.3rem;
  transition: var(--transition-smooth);
}

.table-input:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.table-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25);
}

.currency-symbol {
  position: absolute;
  left: calc(100% - 142px);
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 500;
  pointer-events: none;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>
