import { ref } from 'vue';
import { api } from '../services/api';

export function useCashSettlement() {
  const csSums = ref<any>({
    pw: 0, pfw: 0, pw_tot: 0,
    pc: 0, pfc: 0, pc_tot: 0,
    reins_comm: 0, reins_pf: 0, reins_comm_tot: 0,
    lp: 0, laep: 0, ae_paid: 0, losses_tot: 0, reins_losses_tot: 0,
    sub_total: 0, ssic_cf: 0, ssic_bb: 0, ssic_xol: 0, ssic_taxes_tot: 0,
    reins_bal: 0, ssic_bal: 0, ending_bal: 0,
    uep: 0, lu: 0, laeu: 0, aeu: 0,
  });

  const ratesForm = ref<any>({
    qs: 100,
    cf: 5,
    comm: 32,
    bb: 0.4,
    ulae: 1,
    xol: 2,
    lr: 0,
  });

  const loadCashSettlement = async (wbId: number) => {
    try {
      csSums.value = await api.getCashSettlementCalculations(wbId);
    } catch (err) {
      console.error('Failed to load cash settlement:', err);
    }
  };

  const syncRatesForm = (rates: any) => {
    if (rates) {
      ratesForm.value = {
        qs: rates.qs ?? 100,
        cf: rates.cf ?? 5,
        comm: rates.comm ?? 32,
        bb: rates.bb ?? 0.4,
        ulae: rates.ulae ?? 1,
        xol: rates.xol ?? 2,
        lr: rates.lr ?? 0,
      };
    }
  };

  const saveRates = async (wbId: number, selectWorkbookCallback: (id: number) => Promise<void>) => {
    try {
      await api.updateRates(wbId, ratesForm.value);
      alert('Rates updated successfully!');
      await selectWorkbookCallback(wbId);
    } catch (err) {
      alert('Failed to save rates');
    }
  };

  const formatInputVal = (val: number): string => {
    if (val === 0 || isNaN(val)) return '-';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const onCSCellBlur = async (
    event: Event,
    wbId: number,
    key: 'begBal' | 'amtPaid',
    currentVal: number,
    selectWorkbookCallback: (id: number) => Promise<void>
  ) => {
    const input = event.target as HTMLInputElement;
    const valStr = input.value.trim();
    let val = 0;
    if (valStr !== '') {
      val = parseFloat(valStr.replace(/,/g, ''));
      if (isNaN(val)) val = 0;
    }

    if (val === Number(currentVal)) {
      input.value = formatInputVal(Number(currentVal));
      return;
    }

    try {
      await api.updateCashSettlement(wbId, { [key]: val });
      await selectWorkbookCallback(wbId);
    } catch (err) {
      alert('Failed to update ledger balance');
      input.value = formatInputVal(Number(currentVal));
    }
  };

  return {
    csSums,
    ratesForm,
    loadCashSettlement,
    syncRatesForm,
    saveRates,
    onCSCellBlur,
  };
}
