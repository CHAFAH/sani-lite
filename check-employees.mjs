import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { 
  console.error('DATABASE_URL not set'); 
  process.exit(1); 
}

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Get total count
    const [countResult] = await conn.execute('SELECT COUNT(*) as total FROM employee_profiles');
    console.log(`Total employees in database: ${countResult[0].total}`);
    
    // Get count by company
    const [byCompany] = await conn.execute('SELECT companyId, COUNT(*) as count FROM employee_profiles GROUP BY companyId');
    console.log('\nEmployees by company:');
    byCompany.forEach(row => console.log(`  Company ${row.companyId}: ${row.count}`));
    
    // Get sample of recent employees
    const [recent] = await conn.execute('SELECT id, firstName, lastName, position, managerId FROM employee_profiles ORDER BY id DESC LIMIT 5');
    console.log('\nRecent employees:');
    recent.forEach(emp => console.log(`  ${emp.id}: ${emp.firstName} ${emp.lastName} (${emp.position}) - Manager: ${emp.managerId}`));
    
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
