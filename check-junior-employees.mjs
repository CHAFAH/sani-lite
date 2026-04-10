import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Get employees with managerId set
    const [withManager] = await conn.execute(`
      SELECT COUNT(*) as count FROM employee_profiles 
      WHERE companyId = 1 AND managerId IS NOT NULL
    `);
    console.log(`Employees with manager assigned: ${withManager[0].count}`);
    
    // Get employees without manager
    const [withoutManager] = await conn.execute(`
      SELECT COUNT(*) as count FROM employee_profiles 
      WHERE companyId = 1 AND (managerId IS NULL OR managerId = 0)
    `);
    console.log(`Employees without manager (root level): ${withoutManager[0].count}`);
    
    // Get sample of junior employees
    const [juniors] = await conn.execute(`
      SELECT id, firstName, lastName, position, managerId 
      FROM employee_profiles 
      WHERE companyId = 1 AND position LIKE '%Junior%' 
      LIMIT 10
    `);
    console.log('\nSample junior employees:');
    juniors.forEach(emp => console.log(`  ${emp.id}: ${emp.firstName} ${emp.lastName} (${emp.position}) - Manager ID: ${emp.managerId}`));
    
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
