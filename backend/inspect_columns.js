const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = 'C:/Users/ASUS/Desktop/Treaty - 1/segrate folder/DPR APD/Futuristic Starlight APD T2 2026 DRP.xlsx';
const wb = XLSX.readFile(filePath, { cellFormula: true });
const sheet = wb.Sheets['CA'];

const cellC27 = sheet['C27'];
const cellC58 = sheet['C58'];

console.log('--- Formulas in backup CA sheet ---');
if (cellC27) console.log(`C27 | Value: ${cellC27.v} | Formula: ${cellC27.f}`);
if (cellC58) console.log(`C58 | Value: ${cellC58.v} | Formula: ${cellC58.f}`);
