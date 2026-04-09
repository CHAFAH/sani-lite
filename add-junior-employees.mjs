import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { 
  console.error('DATABASE_URL not set'); 
  process.exit(1); 
}

const JUNIOR_ROLES = [
  'Junior Developer',
  'Junior Designer',
  'Junior Analyst',
  'Associate',
  'Coordinator',
  'Specialist',
];

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn',
  'Blake', 'Dakota', 'Skylar', 'River', 'Phoenix', 'Sage', 'Rowan', 'Ember',
  'Kai', 'Ash', 'Storm', 'Nova', 'Leo', 'Iris', 'Zoe', 'Liam', 'Ella', 'Noah',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
];

const CITIES = [
  'New York', 'London', 'Toronto', 'Sydney', 'Singapore', 'Tokyo', 'Berlin', 'Paris',
  'San Francisco', 'Chicago', 'Los Angeles', 'Austin', 'Denver', 'Portland',
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 
  'Japan', 'Germany', 'France',
];

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Get the company ID
    const [companies] = await conn.execute('SELECT id FROM companies LIMIT 1');
    if (companies.length === 0) { 
      console.error('No company found'); 
      process.exit(1); 
    }
    const companyId = companies[0].id;
    console.log(`Adding junior employees for company ${companyId}...`);

    // Get all team leads and managers
    const [teamLeads] = await conn.execute(
      `SELECT id, firstName, lastName, department FROM employee_profiles 
       WHERE position IN ('Engineering Manager - Backend', 'Engineering Manager - Frontend', 'Engineering Manager - Platform', 
                          'Senior Product Manager', 'Senior UX Designer', 'HR Business Partner', 'Financial Analyst',
                          'Growth Marketing Manager', 'Director of HR', 'Director of Finance', 'Director of Growth', 'Director of Brand')
       AND companyId = ?`,
      [companyId]
    );

    console.log(`Found ${teamLeads.length} team leads. Adding 2-3 junior employees per lead...`);

    let added = 0;
    for (const lead of teamLeads) {
      // Add 2-3 junior employees per lead
      const juniorCount = Math.floor(Math.random() * 2) + 2;
      
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

    console.log(`✅ Added ${added} junior employees`);
    console.log(`Total employees now: ${currentCount[0].cnt}`);
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
