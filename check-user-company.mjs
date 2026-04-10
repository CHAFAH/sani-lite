import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Get all companies
    const [companies] = await conn.execute('SELECT id, name FROM companies LIMIT 10');
    console.log('Companies:');
    companies.forEach(c => console.log(`  ${c.id}: ${c.name}`));
    
    // Get employees for each company
    console.log('\nEmployee counts by company:');
    for (const company of companies) {
      const [count] = await conn.execute('SELECT COUNT(*) as cnt FROM employee_profiles WHERE companyId = ?', [company.id]);
      console.log(`  Company ${company.id} (${company.name}): ${count[0].cnt} employees`);
    }
    
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
