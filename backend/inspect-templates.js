const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dir = 'c:/Users/ASUS/Desktop/Treaty - 1/MGA monthly exhibits and Southlake report summaries new';

function inspectTemplate(filename) {
  const filepath = path.join(dir, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`File not found: ${filename}`);
    return;
  }
  const workbook = XLSX.readFile(filepath);
  console.log(`\n=================== FILE: ${filename} ===================`);
  console.log(`Sheets: ${workbook.SheetNames.join(', ')}`);
  
  // Print first 5 rows of the first sheet to see what it is
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`First sheet "${firstSheetName}" top 10 rows:`);
  data.slice(0, 15).forEach((row, i) => {
    console.log(`  Row ${i + 1}:`, row);
  });
}

inspectTemplate('002_NE - GL JE Interface.xlsx');
inspectTemplate('001_Macro template - USE for JE creation.xlsm');
