import { ref, computed, type Ref } from 'vue';
import { api } from '../services/api';
import type { Workbook } from '../services/api';

const DEFAULT_PROGRAM_RATES: Record<string, any> = {
  'Excess NX':  { comm: 32.0, ulae: 1.0, lossPick: 51.8, laeDcc: 6.2, laeAoe: 0.0, boardsCharge: 0.40, lossRatioCap: 2.0 },
  'Excess SAM': { comm: 32.0, ulae: 1.0, lossPick: 51.8, laeDcc: 6.2, laeAoe: 0.0, boardsCharge: 0.40, lossRatioCap: 2.0 },
  'Excess HS':  { comm: 32.0, ulae: 1.0, lossPick: 51.8, laeDcc: 6.2, laeAoe: 0.0, boardsCharge: 0.40, lossRatioCap: 2.0 },
  'APD Local':  { comm: 29.0, ulae: 7.0, lossPick: 56.6, laeDcc: 0.0, laeAoe: 13.4, boardsCharge: 0.40, lossRatioCap: 2.0 },
  'APD Fleet':  { comm: 29.0, ulae: 7.0, lossPick: 56.6, laeDcc: 0.0, laeAoe: 13.4, boardsCharge: 0.40, lossRatioCap: 2.0 },
  'DPR APD':    { comm: 29.0, ulae: 7.0, lossPick: 56.6, laeDcc: 0.0, laeAoe: 13.4, boardsCharge: 0.40, lossRatioCap: 2.0 }
};

export function useJournalEntries(workbooksList: Ref<Workbook[]>) {
  const selectedProgram = ref<string>('');
  const selectedMonth = ref<string>('');
  const selectedState = ref<string>('TOTAL');
  const viewTab = ref<'statement' | 'glje'>('statement');

  const mappingsForm = ref({
    comp: '',
    cc: '',
    mga: '',
    lob: '',
    ext: '',
    sub: '',
    lineDescSuffix: '',
  });

  const paramsForm = ref({
    premiumWritten: 0,
    prevUEP: 0,
    currUEP: 0,
    prevLossIBNR: 0,
    prevDCCIBNR: 0,
    prevULAEIBNR: 0,
  });

  const ratesForm = ref({
    comm: 32.0,
    ulae: 1.0,
    lossPick: 51.8,
    laeDcc: 6.2,
    laeAoe: 0.0,
    boardsCharge: 0.40,
    lossRatioCap: 2.0,
  });

  const activeWb = ref<Workbook | null>(null);
  const prevWb = ref<Workbook | null>(null);
  const statusMessage = ref<string>('');
  const statusClass = ref<string>('');
  const statusTitle = ref<string>('');

  const statementRows = ref<any[]>([]);
  const gljeRows = ref<any[]>([]);

  // Filtered months for selected program
  const months = computed(() => {
    const list: { key: string; label: string }[] = [];
    workbooksList.value
      .filter(w => w.program === selectedProgram.value)
      .forEach(w => {
        if (!list.some(m => m.key === w.monthKey)) {
          list.push({ key: w.monthKey, label: w.monthLabel });
        }
      });
    return list.sort((a, b) => b.key.localeCompare(a.key));
  });

  // States list for selected workbook
  const states = computed(() => {
    const list = new Set<string>(['TOTAL']);
    if (activeWb.value?.stateExhibits) {
      activeWb.value.stateExhibits.forEach(e => {
        if (e.stateCode !== 'TOTAL') list.add(e.stateCode);
      });
    }
    return Array.from(list);
  });

  const onProgramChange = () => {
    if (months.value.length > 0) {
      selectedMonth.value = months.value[0].key;
      onMonthChange();
    }
  };

  const getPreviousMonthKey = (monthKey: string): string => {
    const parts = monthKey.split('-');
    let year = parseInt(parts[0]);
    let month = parseInt(parts[1]);
    month--;
    if (month === 0) {
      month = 12;
      year--;
    }
    return `${year}-${String(month).padStart(2, '0')}`;
  };

  const onMonthChange = async () => {
    const matchedWb = workbooksList.value.find(
      w => w.program === selectedProgram.value && w.monthKey === selectedMonth.value
    );
    if (matchedWb) {
      activeWb.value = await api.getWorkbook(matchedWb.id);
      
      mappingsForm.value = {
        comp: activeWb.value.comp || '',
        cc: activeWb.value.cc || '',
        mga: activeWb.value.mga || '',
        lob: activeWb.value.lob || '',
        ext: activeWb.value.ext || '',
        sub: activeWb.value.sub || '',
        lineDescSuffix: activeWb.value.lineDescSuffix || '',
      };

      let matchedPrev: Workbook | undefined;

      if (selectedMonth.value.endsWith('-01')) {
        // January: previous is ITD workbook for same program
        matchedPrev = workbooksList.value.find(
          w => w.program === selectedProgram.value && w.source === 'ITD'
        );
      }

      if (!matchedPrev) {
        // Otherwise, find same program, previous monthKey, and same source
        const prevMonthKey = getPreviousMonthKey(selectedMonth.value);
        const currentWb = workbooksList.value.find(
          w => w.program === selectedProgram.value && w.monthKey === selectedMonth.value
        );
        const source = currentWb ? currentWb.source : 'FUT';
        
        matchedPrev = workbooksList.value.find(
          w => w.program === selectedProgram.value && w.monthKey === prevMonthKey && w.source === source
        );

        if (!matchedPrev) {
          // Fallback to any source for the previous month key
          matchedPrev = workbooksList.value.find(
            w => w.program === selectedProgram.value && w.monthKey === prevMonthKey
          );
        }
      }

      if (matchedPrev) {
        prevWb.value = await api.getWorkbook(matchedPrev.id);
      } else {
        // Fallback 2: if workbook is not ITD itself, fall back to the ITD workbook as baseline
        const currentWb = workbooksList.value.find(
          w => w.program === selectedProgram.value && w.monthKey === selectedMonth.value
        );
        if (currentWb && currentWb.source !== 'ITD') {
          const itdWb = workbooksList.value.find(
            w => w.program === selectedProgram.value && w.source === 'ITD'
          );
          if (itdWb) {
            prevWb.value = await api.getWorkbook(itdWb.id);
          } else {
            prevWb.value = null;
          }
        } else {
          prevWb.value = null;
        }
      }

      selectedState.value = 'TOTAL';
      await onStateChange();
    } else {
      activeWb.value = null;
      prevWb.value = null;
      statusMessage.value = '';
      statementRows.value = [];
      gljeRows.value = [];
    }
  };

  const onStateChange = async () => {
    if (!activeWb.value) return;

    const stateLabel = selectedState.value === 'TOTAL' ? 'All States (Total)' : `State ${selectedState.value}`;
    
    if (activeWb.value.source === 'Starlight') {
      statusTitle.value = '✨ Southlake Report Summary (Starlight)';
      statusMessage.value = `Auto-detects active values and historical reserves natively for ${stateLabel}.`;
      statusClass.value = 'status-success';
    } else {
      statusTitle.value = '📂 MGA Monthly Exhibit (FUT)';
      const hasPrev = prevWb.value?.stateExhibits?.some(e => e.stateCode === selectedState.value);
      if (hasPrev) {
        statusMessage.value = `Linked ending reserves from previous month: ${prevWb.value!.monthLabel} for ${stateLabel}.`;
        statusClass.value = 'status-success';
      } else {
        statusMessage.value = `PW and UEP loaded for ${stateLabel}. Previous reserves will default to 0 because previous month's FUT workbook is missing or does not contain data for ${selectedState.value}.`;
        statusClass.value = 'status-warn';
      }
    }

    await fetchCalculations();
    loadParamsAndRates();
  };

  const sumArray = (arr: any[] | undefined): number => {
    if (!arr) return 0;
    return arr.reduce((s, v) => s + Number(v || 0), 0);
  };

  const loadParamsAndRates = () => {
    if (!activeWb.value) return;

    const activeEx = activeWb.value.stateExhibits?.find(e => e.stateCode === selectedState.value);
    const prevEx = prevWb.value?.stateExhibits?.find(e => e.stateCode === selectedState.value);

    let pw = 0;
    let currUEP = 0;
    let prevUEP = 0;
    let prevLossIBNR = 0;
    let prevDCCIBNR = 0;
    let prevULAEIBNR = 0;

    if (activeEx) {
      pw = sumArray(activeEx.pw);
      currUEP = sumArray(activeEx.uep);
    }

    if (prevEx) {
      prevUEP = sumArray(prevEx.uep);
      const hasPrevDetailed = prevEx && (
        (prevEx.loss_ibnr && sumArray(prevEx.loss_ibnr) !== 0) ||
        (prevEx.lae_ibnr_dcc && sumArray(prevEx.lae_ibnr_dcc) !== 0) ||
        (prevEx.lae_ibnr_aoe && sumArray(prevEx.lae_ibnr_aoe) !== 0) ||
        (prevEx.ulae_ibnr && sumArray(prevEx.ulae_ibnr) !== 0)
      );

      if (prevWb.value?.source === 'FUT' && !hasPrevDetailed) {
        prevLossIBNR = sumArray(prevEx.lu);
        prevDCCIBNR = sumArray(prevEx.laeu);
        prevULAEIBNR = sumArray(prevEx.aeu);
      } else {
        prevLossIBNR = prevEx.loss_ibnr ? sumArray(prevEx.loss_ibnr) : 0;
        const dccVal = prevEx.lae_ibnr_dcc ? sumArray(prevEx.lae_ibnr_dcc) : 0;
        if (dccVal === 0 && prevEx.lae_ibnr_aoe) {
          prevDCCIBNR = sumArray(prevEx.lae_ibnr_aoe);
        } else {
          prevDCCIBNR = dccVal;
        }
        prevULAEIBNR = prevEx.ulae_ibnr ? sumArray(prevEx.ulae_ibnr) : 0;
      }
    } else if (activeWb.value.source === 'Starlight' && activeEx) {
      // Fallback for Starlight: read from activeStateEx columns index 1
      prevUEP = Number(activeEx.tax?.[1] || 0);
      prevLossIBNR = Number(activeEx.pe?.[1] || 0);
      prevDCCIBNR = Number(activeEx.lp?.[1] || 0);
      prevULAEIBNR = Number(activeEx.laep?.[1] || 0);
    }

    paramsForm.value = {
      premiumWritten: pw,
      prevUEP,
      currUEP,
      prevLossIBNR,
      prevDCCIBNR,
      prevULAEIBNR,
    };

    // Load rates
    const defaults = DEFAULT_PROGRAM_RATES[selectedProgram.value] || DEFAULT_PROGRAM_RATES['Excess NX'];
    const rates = activeWb.value.rates || {};
    ratesForm.value = {
      comm: rates.comm !== undefined ? Number(rates.comm) : defaults.comm,
      ulae: rates.ulae !== undefined ? Number(rates.ulae) : defaults.ulae,
      lossPick: rates.lossPick !== undefined ? Number(rates.lossPick) : defaults.lossPick,
      laeDcc: rates.laeDcc !== undefined ? Number(rates.laeDcc) : defaults.laeDcc,
      laeAoe: rates.laeAoe !== undefined ? Number(rates.laeAoe) : defaults.laeAoe,
      boardsCharge: rates.boardsCharge !== undefined ? Number(rates.boardsCharge) : defaults.boardsCharge,
      lossRatioCap: rates.lossRatioCap !== undefined ? Number(rates.lossRatioCap) : defaults.lossRatioCap,
    };
  };

  const distributeTotal = (arr: number[] | undefined, newTotal: number): number[] => {
    const numericArr = (arr || []).map(v => Number(v || 0));
    while (numericArr.length < 3) numericArr.push(0);

    const sum = numericArr.reduce((s, v) => s + v, 0);
    if (Math.abs(sum) > 0.001) {
      const factor = newTotal / sum;
      return numericArr.map(v => Math.round(v * factor * 100) / 100);
    } else {
      return [newTotal, 0, 0];
    }
  };

  const saveParams = async () => {
    if (!activeWb.value) return;
    try {
      const activeEx = activeWb.value.stateExhibits?.find(e => e.stateCode === selectedState.value);
      const prevEx = prevWb.value?.stateExhibits?.find(e => e.stateCode === selectedState.value);

      if (activeEx) {
        const newPw = distributeTotal(activeEx.pw, paramsForm.value.premiumWritten);
        const newUep = distributeTotal(activeEx.uep, paramsForm.value.currUEP);
        
        await api.updateExhibit(activeWb.value.id, selectedState.value, {
          pw: newPw,
          uep: newUep,
        });
      }

      if (prevEx && prevWb.value) {
        const newPrevUep = distributeTotal(prevEx.uep, paramsForm.value.prevUEP);
        const updateObj: any = {
          uep: newPrevUep,
        };

        const hasPrevDetailed = prevEx && (
          (prevEx.loss_ibnr && sumArray(prevEx.loss_ibnr) !== 0) ||
          (prevEx.lae_ibnr_dcc && sumArray(prevEx.lae_ibnr_dcc) !== 0) ||
          (prevEx.lae_ibnr_aoe && sumArray(prevEx.lae_ibnr_aoe) !== 0) ||
          (prevEx.ulae_ibnr && sumArray(prevEx.ulae_ibnr) !== 0)
        );

        if (prevWb.value?.source === 'FUT' && !hasPrevDetailed) {
          updateObj.lu = distributeTotal(prevEx.lu, paramsForm.value.prevLossIBNR);
          updateObj.laeu = distributeTotal(prevEx.laeu, paramsForm.value.prevDCCIBNR);
          updateObj.aeu = distributeTotal(prevEx.aeu, paramsForm.value.prevULAEIBNR);
        } else {
          updateObj.loss_ibnr = distributeTotal(prevEx.loss_ibnr, paramsForm.value.prevLossIBNR);
          const dccVal = prevEx.lae_ibnr_dcc ? sumArray(prevEx.lae_ibnr_dcc) : 0;
          if (dccVal === 0 && prevEx.lae_ibnr_aoe && (sumArray(prevEx.lae_ibnr_aoe) !== 0 || ratesForm.value.laeDcc === 0)) {
            updateObj.lae_ibnr_aoe = distributeTotal(prevEx.lae_ibnr_aoe, paramsForm.value.prevDCCIBNR);
          } else {
            updateObj.lae_ibnr_dcc = distributeTotal(prevEx.lae_ibnr_dcc, paramsForm.value.prevDCCIBNR);
          }
          updateObj.ulae_ibnr = distributeTotal(prevEx.ulae_ibnr, paramsForm.value.prevULAEIBNR);
        }

        await api.updateExhibit(prevWb.value.id, selectedState.value, updateObj);
      } else if (activeWb.value.source === 'Starlight' && activeEx) {
        // Fallback for Starlight: update index 1 of activeStateEx arrays
        const updateFallbackColumn = (arr: number[] | undefined, value: number): number[] => {
          const numericArr = (arr || []).map(v => Number(v || 0));
          while (numericArr.length < 3) numericArr.push(0);
          numericArr[1] = value;
          return numericArr;
        };

        const newTax = updateFallbackColumn(activeEx.tax, paramsForm.value.prevUEP);
        const newPe = updateFallbackColumn(activeEx.pe, paramsForm.value.prevLossIBNR);
        const newLp = updateFallbackColumn(activeEx.lp, paramsForm.value.prevDCCIBNR);
        const newLaep = updateFallbackColumn(activeEx.laep, paramsForm.value.prevULAEIBNR);

        await api.updateExhibit(activeWb.value.id, selectedState.value, {
          tax: newTax,
          pe: newPe,
          lp: newLp,
          laep: newLaep,
        });
      }

      await fetchCalculations();
    } catch (err) {
      console.error('Failed to save parameters:', err);
      alert('Failed to save parameters to database');
    }
  };

  const saveRates = async () => {
    if (!activeWb.value) return;
    try {
      await api.updateRates(activeWb.value.id, ratesForm.value);
      await fetchCalculations();
    } catch (err) {
      console.error('Failed to save rates:', err);
      alert('Failed to save rates to database');
    }
  };

  const fetchCalculations = async () => {
    if (!activeWb.value) return;
    try {
      const wbId = activeWb.value.id;
      const stateCode = selectedState.value;
      const [statementRes, gljeRes] = await Promise.all([
        api.getReinsuranceStatement(wbId, stateCode),
        api.getGLJournalEntries(wbId, stateCode),
      ]);
      statementRows.value = statementRes;
      gljeRows.value = gljeRes;
    } catch (err) {
      console.error('Failed to load calculations from backend:', err);
    }
  };

  const saveMappings = async () => {
    if (!activeWb.value) return;
    try {
      await api.updateMappings(activeWb.value.id, mappingsForm.value);
      await fetchCalculations();
    } catch (err) {
      alert('Failed to update mapping configuration');
    }
  };

  const prevLaeIbnrLabel = computed(() => {
    if (ratesForm.value.laeDcc > 0) {
      return 'Previous LAE IBNR Reserves - DCC';
    } else if (ratesForm.value.laeAoe > 0) {
      return 'Previous LAE IBNR Reserves - AOE';
    } else {
      return 'Previous LAE IBNR Reserves';
    }
  });

  return {
    selectedProgram,
    selectedMonth,
    selectedState,
    viewTab,
    mappingsForm,
    paramsForm,
    ratesForm,
    activeWb,
    months,
    states,
    statusMessage,
    statusClass,
    statusTitle,
    statementRows,
    gljeRows,
    onProgramChange,
    onMonthChange,
    onStateChange,
    saveMappings,
    saveParams,
    saveRates,
    applyAutoDetectedValues: loadParamsAndRates,
    fetchCalculations,
    prevLaeIbnrLabel,
  };
}
