const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/ASUS/Desktop/Treaty - 1/MGA monthly exhibits and Southlake report summaries new';

const files = [
  '06. FUT - APD (Local) - TREATY-2=01-2026 Final..xlsx',
  '08. FUT - MTC (Local) - TREATY-2=01-2026 Final..xlsx',
  '20. FUT - EXCESS (EX) - TREATY-I=01-2026 Final.xlsx',
  '21. FUT - EXCESS (SAM) - TREATY-I=01-2026 Final.xlsx',
  '25. FUT TREATY-2-(DPR-APD)-01-2026 Final.xlsx',
  '27. FUT TREATY-3-(DPR-AL)-01-2026 Final.xlsx',
  '29. FUT TREATY-3-(DRP-MTC)-01-2026 Final.xlsx'
];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  const wb = XLSX.read(fs.readFileSync(filePath));
  console.log(`\n=== File: ${file} ===`);
  const found4 = new Set();
  const found6 = new Set();
  wb.SheetNames.forEach(sheetName => {
    const ws = wb.Sheets[sheetName];
    if (!ws || !ws['!ref']) return;
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        if (cell && cell.v !== undefined && cell.v !== null) {
          const s = String(cell.v).trim();
          if (/^\d{4}$/.test(s)) found4.add(s);
          if (/^\d{6}$/.test(s)) found6.add(s);
        }
      }
    }
  });
  console.log('4-digit numbers:', Array.from(found4));
  console.log('6-digit numbers:', Array.from(found6));
});
