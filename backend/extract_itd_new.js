const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const sourceFile = 'C:/Users/ASUS/Desktop/Treaty - 1/segrate folder/DPR APD/Futuristic Starlight APD T2 2026 DRP - Updated.xlsx';
const targetDir = path.join(__dirname, 'src/database/seeds/states');

if (!fs.existsSync(sourceFile)) {
  console.error(`Source file not found: ${sourceFile}`);
  process.exit(1);
}

// Ensure target directory exists and is clean
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

const wb = XLSX.readFile(sourceFile);
console.log('Loaded workbook successfully for extraction.');

const summarySheetName = 'Starlight APD';
const stateSheetNames = wb.SheetNames.filter(name => name.trim().length === 2);

console.log(`Found ${stateSheetNames.length} state sheets.`);

// Row indices (0-indexed in JS)
const rowsMap = {
  pw: 5,               // Premiums Written (Excel Row 6)
  lp: 14,              // Losses Paid (Excel Row 15)
  laep: 19,            // DCC Paid (Excel Row 20)
  ae_paid: 22,         // AOE Paid (Excel Row 23)
  uep: 50,             // Unearned Premium Reserve (Excel Row 51)
  loss_reserves: 51,   // Loss Reserves / Case Reserves (Excel Row 52)
  loss_ibnr: 52,       // Loss IBNR Reserves (Excel Row 53)
  lae_reserves_dcc: 53,// LAE Reserves - DCC (Excel Row 54)
  lae_ibnr_dcc: 54,    // LAE IBNR Reserves - DCC (Excel Row 55)
  lae_reserves_aoe: 55,// LAE Reserves - AOE (Excel Row 56)
  lae_ibnr_aoe: 56,    // LAE IBNR Reserves - AOE (Excel Row 57)
  ulae_ibnr: 57        // ULAE IBNR Reserves (Excel Row 58)
};

const getNumericVal = (sheet, r, c) => {
  if (r < 0 || c === null || c === undefined) return 0.00;
  const cell = sheet[XLSX.utils.encode_cell({ r, c })];
  if (!cell) return 0.00;
  if (typeof cell.v === 'number') return cell.v;
  if (cell.v !== undefined && cell.v !== null) {
    const clean = parseFloat(String(cell.v).replace(/[^0-9.-]/g, ''));
    return isNaN(clean) ? 0.00 : clean;
  }
  return 0.00;
};

// Column indices:
// 2: Totals (Dec-25 ITD)
// 3: Jan-26
// 4: Feb-26
// 5: Mar-26
// 6: Apr-26
const monthlyCols = [3, 4, 5, 6];
const cumulativeFields = ['pw', 'lp', 'laep', 'ae_paid'];
const reserveFields = ['uep', 'loss_reserves', 'loss_ibnr', 'lae_reserves_dcc', 'lae_ibnr_dcc', 'lae_reserves_aoe', 'lae_ibnr_aoe', 'ulae_ibnr'];

const processSheet = (sheetName, sheet) => {
  const data = {
    stateCode: sheetName.trim().toUpperCase()
  };

  // 1. Process Cumulative fields
  cumulativeFields.forEach(f => {
    const rIdx = rowsMap[f];
    // Start with 2025 ITD (col 2)
    let total = getNumericVal(sheet, rIdx, 2);
    // Add monthly transactions
    monthlyCols.forEach(c => {
      total += getNumericVal(sheet, rIdx, c);
    });
    // Store in array structure [0, val, 0] for index 1 LOB column
    data[f] = [0, Number(total.toFixed(2)), 0];
  });

  // Other cumulative database columns defaults
  data.pfw = [0, 0, 0];
  data.pc = [...data.pw]; // Premiums collected maps to premiums written ITD
  data.pfc = [0, 0, 0];
  data.tax = [0, 0, 0];
  data.pe = [0, 0, 0];
  data.pfe = [0, 0, 0];

  // 2. Process Reserve fields
  reserveFields.forEach(f => {
    const rIdx = rowsMap[f];
    
    // Check if it is ULAE IBNR which is blank in the Excel sheet and needs calculation
    if (f === 'ulae_ibnr') {
      const changeLossRes = data.loss_reserves[1];
      const changeLossIbnr = data.loss_ibnr[1];
      const val = (changeLossRes * 0.5 + changeLossIbnr) * 0.005;
      data[f] = [0, Number(val.toFixed(2)), 0];
      return;
    }

    // Otherwise, ending reserve balance is the latest non-empty month column, falling back to Totals (col 2)
    let val = 0;
    let found = false;
    for (let c = 6; c >= 2; c--) {
      const cellRef = XLSX.utils.encode_cell({ r: rIdx, c });
      const cell = sheet[cellRef];
      if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
        val = getNumericVal(sheet, rIdx, c);
        found = true;
        break;
      }
    }
    data[f] = [0, Number(val.toFixed(2)), 0];
  });

  // Map database old reserve fields:
  // lu = Loss Case Reserves + Loss IBNR
  // laeu = DCC Case + DCC IBNR
  // aeu = AOE Case + AOE IBNR
  data.lu = [0, Number((data.loss_reserves[1] + data.loss_ibnr[1]).toFixed(2)), 0];
  data.laeu = [0, Number((data.lae_reserves_dcc[1] + data.lae_ibnr_dcc[1]).toFixed(2)), 0];
  data.aeu = [0, Number((data.lae_reserves_aoe[1] + data.lae_ibnr_aoe[1]).toFixed(2)), 0];

  return data;
};

// Process each state
for (const stateName of stateSheetNames) {
  const sheet = wb.Sheets[stateName];
  const stateData = processSheet(stateName, sheet);
  
  // Write to backend seed folder
  fs.writeFileSync(
    path.join(targetDir, `${stateData.stateCode}.json`),
    JSON.stringify(stateData, null, 2)
  );
}

// Process TOTAL
const totalSheet = wb.Sheets[summarySheetName];
const totalData = processSheet('TOTAL', totalSheet);
fs.writeFileSync(
  path.join(targetDir, 'TOTAL.json'),
  JSON.stringify(totalData, null, 2)
);

// Copy all JSON files to workspace root itd_states_seeder_data
const workspaceDir = 'C:/Users/ASUS/Desktop/Treaty - 1/itd_states_seeder_data';
if (!fs.existsSync(workspaceDir)) {
  fs.mkdirSync(workspaceDir, { recursive: true });
}
const files = fs.readdirSync(targetDir);
for (const file of files) {
  fs.copyFileSync(path.join(targetDir, file), path.join(workspaceDir, file));
}

console.log(`Successfully extracted and wrote ${files.length} seeder JSON files to backend and workspace root.`);
