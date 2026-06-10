const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:Rohitpk27@localhost:5432/insurance'
});
async function main() {
  await client.connect();
  const res = await client.query('SELECT id, "program", "monthKey", "monthLabel" FROM workbooks ORDER BY "program" ASC, "monthKey" ASC');
  console.log(`Found ${res.rows.length} workbooks in database:`);
  for (const row of res.rows) {
    console.log(`- ID: ${row.id} | Program: ${row.program} | Month: ${row.monthKey} (${row.monthLabel})`);
  }
  await client.end();
}
main().catch(console.error);
