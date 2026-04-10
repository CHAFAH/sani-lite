import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

const EMPLOYEES = [
  { firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@sani.io', department: 'Engineering', position: 'Engineering Manager', salary: '200000', country: 'United States', city: 'San Francisco', managerId: null },
  { firstName: 'Alex', lastName: 'Rivera', email: 'alex.rivera@sani.io', department: 'Engineering', position: 'Senior Software Engineer', salary: '180000', country: 'United States', city: 'San Francisco', managerId: null },
  { firstName: 'Jordan', lastName: 'Lee', email: 'jordan.lee@sani.io', department: 'Product', position: 'Product Manager', salary: '175000', country: 'United States', city: 'San Francisco', managerId: null },
  { firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@sani.io', department: 'Design', position: 'Lead Designer', salary: '170000', country: 'United States', city: 'San Francisco', managerId: null },
  { firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.johnson@sani.io', department: 'Marketing', position: 'Marketing Director', salary: '165000', country: 'United States', city: 'New York', managerId: null },
  { firstName: 'Emily', lastName: 'Tanaka', email: 'emily.tanaka@sani.io', department: 'Sales', position: 'Account Executive', salary: '155000', country: 'United States', city: 'New York', managerId: null },
  { firstName: 'David', lastName: 'Kim', email: 'david.kim@sani.io', department: 'HR', position: 'HR Specialist', salary: '120000', country: 'United States', city: 'San Francisco', managerId: null },
  { firstName: 'Lisa', lastName: 'Wang', email: 'lisa.wang@sani.io', department: 'Finance', position: 'Financial Analyst', salary: '130000', country: 'United States', city: 'New York', managerId: null },
  { firstName: 'Tom', lastName: 'Brown', email: 'tom.brown@sani.io', department: 'Engineering', position: 'Backend Developer', salary: '150000', country: 'United States', city: 'Austin', managerId: null },
  { firstName: 'Nina', lastName: 'Rodriguez', email: 'nina.rodriguez@sani.io', department: 'Engineering', position: 'Frontend Developer', salary: '145000', country: 'United States', city: 'Austin', managerId: null },
  { firstName: 'Chris', lastName: 'Taylor', email: 'chris.taylor@sani.io', department: 'Operations', position: 'Operations Manager', salary: '140000', country: 'United States', city: 'Denver', managerId: null },
  { firstName: 'Aisha', lastName: 'Mohammed', email: 'aisha.mohammed@sani.io', department: 'Engineering', position: 'DevOps Engineer', salary: '160000', country: 'United States', city: 'San Francisco', managerId: null },
];

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  try {
    const companyId = 180007; // Dev company
    
    console.log(`Adding employees to company ${companyId}...`);
    
    let insertedCount = 0;
    
    for (const emp of EMPLOYEES) {
      await conn.execute(
        `INSERT INTO employee_profiles (userId, companyId, firstName, lastName, email, department, position, salary, currency, country, city, managerId, employmentType, status, startDate) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'USD', ?, ?, ?, 'full_time', 'active', NOW())`,
        [0, companyId, emp.firstName, emp.lastName, emp.email, emp.department, emp.position, emp.salary, emp.country, emp.city, emp.managerId]
      );
      insertedCount++;
    }
    
    // Now add junior employees under managers
    const [managers] = await conn.execute(
      'SELECT id, firstName, lastName, department FROM employee_profiles WHERE companyId = ? AND position LIKE "%Manager%"',
      [companyId]
    );
    
    const JUNIOR_ROLES = ['Junior Developer', 'Junior Designer', 'Junior Analyst', 'Associate', 'Coordinator'];
    const FIRST_NAMES = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn'];
    const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    const CITIES = ['New York', 'London', 'Toronto', 'Sydney', 'Singapore', 'Tokyo', 'Berlin', 'Paris'];
    const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'Japan', 'Germany', 'France'];
    
    for (const manager of managers) {
      for (let i = 0; i < 2; i++) {
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const position = JUNIOR_ROLES[Math.floor(Math.random() * JUNIOR_ROLES.length)];
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const salary = Math.floor(Math.random() * 40000) + 70000;
        
        await conn.execute(
          `INSERT INTO employee_profiles (userId, companyId, firstName, lastName, email, phone, city, country, department, position, employmentType, status, salary, currency, managerId, startDate) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', ?, NOW())`,
          [0, companyId, firstName, lastName, `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@sani.io`, 
           `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`, city, country, manager.department, position, 'full_time', 'active', salary, manager.id]
        );
        insertedCount++;
      }
    }
    
    // Update subscription
    const [currentCount] = await conn.execute(
      'SELECT COUNT(*) as cnt FROM employee_profiles WHERE companyId = ?',
      [companyId]
    );
    
    await conn.execute(
      'UPDATE subscriptions SET usedSeats = ? WHERE companyId = ?',
      [currentCount[0].cnt, companyId]
    );
    
    console.log(`✅ Added ${insertedCount} employees to company ${companyId}`);
    console.log(`Total employees now: ${currentCount[0].cnt}`);
    
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
