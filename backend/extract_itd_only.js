const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const sourceFile = 'C:/Users/ASUS/Desktop/Treaty - 1/segrate folder/DPR APD/Futuristic Starlight APD T2 2026 DRP - Updated.xlsx';
const targetDir = path.join(__dirname, 'src/database/seeds/states');

if (!fs.existsSync(sourceFile)) {
  console.error(`Source file not found: ${sourceFile}`);
  process.exit(1);
}

// Ensure clean directory
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

const wb = XLSX.readFile(sourceFile);
console.log('Loaded workbook successfully.');

const summarySheetName = 'Starlight APD';
const stateSheetNames = wb.SheetNames.filter(name => name.trim().length === 2);

console.log(`Found ${stateSheetNames.length} state sheets.`);

// Row indices (0-indexed in JS)
const rowsMap = {
  pw: 5,       // Premiums Written (Excel row 6)
  pe: 7,       // Premiums Earned (Excel row 8)
  lp: 14,      // Losses Paid (Excel row 15)
  laep: 19,    // DCC Paid (Excel row 20)
  ae_paid: 22, // AOE Paid (Excel row 23)
  uep: 50,     // Unearned Premium Reserve (Excel row 51)
  lu: 52,      // Loss IBNR Reserves (Excel row 53)
  laeu: 56,    // LAE IBNR Reserves - AOE (Excel row 57)
  aeu: 57      // ULAE IBNR Reserves (Excel row 58)
};

const getNumericValue = (sheet, r, c) => {
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
const allCols = [2, 3, 4, 5, 6];
const latestCol = 6; // Apr-26

const statesData = {};

for (const stateCode of stateSheetNames) {
  const stateSheet = wb.Sheets[stateCode];
  if (!stateSheet) continue;

  // Cumulative fields: sum over all columns C to G
  const sumField = (rowIdx) => {
    return allCols.reduce((acc, col) => acc + getNumericValue(stateSheet, rowIdx, col), 0);
  };

  // Balance sheet reserve fields: take latest (Apr-26), fallback to Column C if latest is 0
  const getReserveField = (rowIdx) => {
    const latestVal = getNumericValue(stateSheet, rowIdx, latestCol);
    if (latestVal !== 0) return latestVal;
    return getNumericValue(stateSheet, rowIdx, 2); // Fallback to Totals (Col C)
  };

  const pwVal = sumField(rowsMap.pw);
  const lpVal = sumField(rowsMap.lp);
  const laepVal = sumField(rowsMap.laep);
  const aePaidVal = sumField(rowsMap.ae_paid);
  const peVal = sumField(rowsMap.pe);

  const uepVal = getReserveField(rowsMap.uep);
  const luVal = getReserveField(rowsMap.lu);
  const laeuVal = getReserveField(rowsMap.laeu);
  const aeuVal = getReserveField(rowsMap.aeu);

  const stateJson = {
    stateCode,
    pw: [0, pwVal, 0],
    pfw: [0, 0, 0],
    pc: [0, pwVal, 0],
    pfc: [0, 0, 0],
    tax: [0, 0, 0],
    lp: [0, lpVal, 0],
    laep: [0, laepVal, 0],
    ae_paid: [0, aePaidVal, 0],
    pe: [0, peVal, 0],
    pfe: [0, 0, 0],
    uep: [0, uepVal, 0],
    lu: [0, luVal, 0],
    laeu: [0, laeuVal, 0],
    aeu: [0, aeuVal, 0]
  };

  statesData[stateCode] = stateJson;

  // Save to separate state file
  const stateFilePath = path.join(targetDir, `${stateCode}.json`);
  fs.writeFileSync(stateFilePath, JSON.stringify(stateJson, null, 2));
}

// Calculate TOTAL exhibit by summing all states
const totalExhibit = {
  stateCode: 'TOTAL',
  pw: [0, 0, 0],
  pfw: [0, 0, 0],
  pc: [0, 0, 0],
  pfc: [0, 0, 0],
  tax: [0, 0, 0],
  lp: [0, 0, 0],
  laep: [0, 0, 0],
  ae_paid: [0, 0, 0],
  pe: [0, 0, 0],
  pfe: [0, 0, 0],
  uep: [0, 0, 0],
  lu: [0, 0, 0],
  laeu: [0, 0, 0],
  aeu: [0, 0, 0]
};

const fields = ['pw', 'pfw', 'pc', 'pfc', 'tax', 'lp', 'laep', 'ae_paid', 'pe', 'pfe', 'uep', 'lu', 'laeu', 'aeu'];

for (const stateCode in statesData) {
  const st = statesData[stateCode];
  fields.forEach(field => {
    totalExhibit[field][1] += st[field][1];
  });
}

// Save TOTAL.json
const totalFilePath = path.join(targetDir, 'TOTAL.json');
fs.writeFileSync(totalFilePath, JSON.stringify(totalExhibit, null, 2));

console.log(`Successfully generated ${stateSheetNames.length} state seeder files and TOTAL.json in: ${targetDir}`);
