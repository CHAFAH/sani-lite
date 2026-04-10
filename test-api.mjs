import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Get ALL employees for company 1
    const [all] = await conn.execute(`
      SELECT id, firstName, lastName, position, managerId, companyId
      FROM employee_profiles 
      WHERE companyId = 1
      ORDER BY id
    `);
    
    console.log(`Total employees: ${all.length}`);
    console.log('\nAll employees:');
    all.forEach((emp, idx) => {
      console.log(`${idx + 1}. ${emp.id}: ${emp.firstName} ${emp.lastName} (${emp.position}) - Manager: ${emp.managerId}`);
    });
    
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
