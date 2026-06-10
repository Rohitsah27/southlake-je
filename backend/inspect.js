const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dir = 'c:/Users/ASUS/Desktop/Treaty - 1/MGA monthly exhibits and Southlake report summaries new';

function inspectFile(filename) {
  const filepath = path.join(dir, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`File not found: ${filename}`);
    return;
  }
  const workbook = XLSX.readFile(filepath);
  console.log(`\n=================== FILE: ${filename} ===================`);
  console.log(`Sheets: ${workbook.SheetNames.join(', ')}`);
  
  // Check if it has a Cash Settlement sheet
  const csSheet = workbook.Sheets['Cash Settlement'];
  if (csSheet) {
    console.log(`Has Cash Settlement. Rates:`);
    console.log(`  P1 (QS):`, csSheet['P1']?.v);
    console.log(`  P2 (CF):`, csSheet['P2']?.v);
    console.log(`  P3 (Comm):`, csSheet['P3']?.v);
    console.log(`  P5 (BB):`, csSheet['P5']?.v);
    console.log(`  P6 (ulae):`, csSheet['P6']?.v);
    console.log(`  P7 (xol):`, csSheet['P7']?.v);
    console.log(`  P8 (lr):`, csSheet['P8']?.v);
    console.log(`  C9 (Date):`, csSheet['C9']?.v);
  }
  
  // Find a state sheet
  const stateSheetName = workbook.SheetNames.find(n => n.trim().match(/^MTHLY-([A-Z]{2})$/i));
  if (stateSheetName) {
    const sheet = workbook.Sheets[stateSheetName];
    console.log(`State Sheet: ${stateSheetName}`);
    console.log(`  C4 (Date):`, sheet['C4']?.v);
    console.log(`  B14 (PW):`, sheet['B14']?.v, ` C14:`, sheet['C14']?.v, ` D14:`, sheet['D14']?.v);
  }
}

// Let's inspect a few key files
const files = [
  '06. FUT - APD (Local) - TREATY-2=01-2026 Final..xlsx',
  '08. FUT - MTC (Local) - TREATY-2=01-2026 Final..xlsx',
  '20. FUT - EXCESS (EX) - TREATY-I=01-2026 Final.xlsx',
  '25. FUT TREATY-2-(DPR-APD)-01-2026 Final.xlsx',
  '27. FUT TREATY-3-(DPR-AL)-01-2026 Final.xlsx',
  '29. FUT TREATY-3-(DRP-MTC)-01-2026 Final.xlsx',
  'Futuristic Starlight Excess NX 2026.xlsx'
];

files.forEach(inspectFile);
