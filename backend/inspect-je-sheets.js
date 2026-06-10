const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dir = 'c:/Users/ASUS/Desktop/Treaty - 1/MGA monthly exhibits and Southlake report summaries new';
const filepath = path.join(dir, '001_Macro template - USE for JE creation.xlsm');

if (fs.existsSync(filepath)) {
  const workbook = XLSX.readFile(filepath);
  
  ['Template', 'Data'].forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    if (sheet) {
      console.log(`\n=================== SHEET: ${sheetName} ===================`);
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      data.slice(0, 25).forEach((row, i) => {
        console.log(`  Row ${i + 1}:`, row.slice(0, 15));
      });
    }
  });
}
