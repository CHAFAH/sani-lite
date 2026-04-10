import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Get the dev user info
    const [devUsers] = await conn.execute(`
      SELECT openId, name, companyId, role FROM users 
      WHERE name LIKE '%dev%' OR openId LIKE '%demo%'
      LIMIT 20
    `);
    
    console.log('Dev/Demo Users:');
    devUsers.forEach(u => {
      console.log(`  ${u.openId}: ${u.name} -> Company ${u.companyId}, Role: ${u.role}`);
    });
    
    // Check employee counts for each company
    console.log('\nEmployee counts by company:');
    for (const user of devUsers) {
      if (user.companyId) {
        const [count] = await conn.execute(
          'SELECT COUNT(*) as cnt FROM employee_profiles WHERE companyId = ?',
          [user.companyId]
        );
        console.log(`  Company ${user.companyId}: ${count[0].cnt} employees`);
      }
    }
    
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
