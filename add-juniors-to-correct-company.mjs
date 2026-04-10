import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

const JUNIOR_ROLES = [
  'Junior Developer', 'Junior Designer', 'Junior Analyst', 'Associate', 'Coordinator', 'Specialist',
];
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn',
  'Blake', 'Dakota', 'Skylar', 'River', 'Phoenix', 'Sage', 'Rowan', 'Ember',
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
];
const CITIES = [
  'New York', 'London', 'Toronto', 'Sydney', 'Singapore', 'Tokyo', 'Berlin', 'Paris',
];
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'Japan', 'Germany', 'France',
];

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  try {
    const companyId = 120012; // The correct company
    
    // Get all team leads (managers) in this company
    const [leads] = await conn.execute(`
      SELECT id, firstName, lastName, department 
      FROM employee_profiles 
      WHERE companyId = ? AND position LIKE '%Manager%'
      LIMIT 12
    `, [companyId]);
    
    console.log(`Found ${leads.length} managers in company ${companyId}`);
    
    let added = 0;
    
    // Add 2-3 junior employees to each manager
    for (const lead of leads) {
      const juniorCount = Math.floor(Math.random() * 2) + 2; // 2-3 juniors per manager
      
      for (let i = 0; i < juniorCount; i++) {
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const position = JUNIOR_ROLES[Math.floor(Math.random() * JUNIOR_ROLES.length)];
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const salary = Math.floor(Math.random() * 40000) + 70000;
        
        await conn.execute(
          `INSERT INTO employee_profiles 
           (userId, companyId, firstName, lastName, email, phone, city, country, department, position, 
            employmentType, status, salary, currency, managerId, startDate) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', ?, NOW())`,
          [
            0,
            companyId,
            firstName,
            lastName,
            `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@sani.io`,
            `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            city,
            country,
            lead.department,
            position,
            'full_time',
            'active',
            salary,
            lead.id,
          ]
        );
        added++;
      }
    }
    
    // Update subscription used seats
    const [currentCount] = await conn.execute(
      'SELECT COUNT(*) as cnt FROM employee_profiles WHERE companyId = ?',
      [companyId]
    );
    
    await conn.execute(
      'UPDATE subscriptions SET usedSeats = ? WHERE companyId = ?',
      [currentCount[0].cnt, companyId]
    );
    
    console.log(`✅ Added ${added} junior employees to company ${companyId}`);
    console.log(`Total employees now: ${currentCount[0].cnt}`);
    
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
