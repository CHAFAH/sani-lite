import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Get all users
    const [users] = await conn.execute('SELECT openId, name, companyId FROM users LIMIT 10');
    console.log('Users and their company IDs:');
    users.forEach(u => console.log(`  ${u.openId}: ${u.name} -> Company ${u.companyId}`));
    
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
