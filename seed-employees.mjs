import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  // Get the company ID from the first company
  const [companies] = await conn.execute('SELECT id FROM companies LIMIT 1');
  if (companies.length === 0) { console.error('No company found'); process.exit(1); }
  const companyId = companies[0].id;
  console.log(`Seeding employees for company ${companyId}...`);

  // Check if employees already exist
  const [existing] = await conn.execute('SELECT COUNT(*) as cnt FROM employee_profiles WHERE companyId = ?', [companyId]);
  if (existing[0].cnt > 0) {
    console.log(`Already ${existing[0].cnt} employees. Skipping seed.`);
    await conn.end();
    return;
  }

  // Org structure: CEO -> C-Suite -> VPs/Directors -> Managers -> Team Members
  const employees = [
    // CEO (no manager)
    { firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah.mitchell@sani.io', department: 'Executive', position: 'Chief Executive Officer', salary: '350000', country: 'United States', city: 'San Francisco', managerId: null },
    
    // C-Suite (report to CEO, id=1)
    { firstName: 'James', lastName: 'Chen', email: 'james.chen@sani.io', department: 'Technology', position: 'Chief Technology Officer', salary: '280000', country: 'United States', city: 'San Francisco', managerId: 1 },
    { firstName: 'Amara', lastName: 'Okafor', email: 'amara.okafor@sani.io', department: 'Finance', position: 'Chief Financial Officer', salary: '275000', country: 'United States', city: 'New York', managerId: 1 },
    { firstName: 'David', lastName: 'Rodriguez', email: 'david.rodriguez@sani.io', department: 'Marketing', position: 'Chief Marketing Officer', salary: '260000', country: 'United States', city: 'Los Angeles', managerId: 1 },
    { firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@sani.io', department: 'People', position: 'Chief People Officer', salary: '250000', country: 'United States', city: 'San Francisco', managerId: 1 },
    { firstName: 'Michael', lastName: 'Thompson', email: 'michael.thompson@sani.io', department: 'Sales', position: 'Chief Revenue Officer', salary: '265000', country: 'United States', city: 'Chicago', managerId: 1 },

    // VPs / Directors (report to C-Suite)
    // Engineering (report to CTO, id=2)
    { firstName: 'Elena', lastName: 'Volkov', email: 'elena.volkov@sani.io', department: 'Engineering', position: 'VP of Engineering', salary: '220000', country: 'United States', city: 'San Francisco', managerId: 2 },
    { firstName: 'Raj', lastName: 'Patel', email: 'raj.patel@sani.io', department: 'Product', position: 'VP of Product', salary: '210000', country: 'United States', city: 'San Francisco', managerId: 2 },
    { firstName: 'Lisa', lastName: 'Kim', email: 'lisa.kim@sani.io', department: 'Design', position: 'VP of Design', salary: '195000', country: 'United States', city: 'San Francisco', managerId: 2 },
    
    // Finance (report to CFO, id=3)
    { firstName: 'Robert', lastName: 'Williams', email: 'robert.williams@sani.io', department: 'Finance', position: 'Director of Finance', salary: '180000', country: 'United States', city: 'New York', managerId: 3 },
    { firstName: 'Anna', lastName: 'Kowalski', email: 'anna.kowalski@sani.io', department: 'Finance', position: 'Director of Accounting', salary: '170000', country: 'United States', city: 'New York', managerId: 3 },
    
    // Marketing (report to CMO, id=4)
    { firstName: 'Carlos', lastName: 'Mendez', email: 'carlos.mendez@sani.io', department: 'Marketing', position: 'Director of Growth', salary: '175000', country: 'United States', city: 'Los Angeles', managerId: 4 },
    { firstName: 'Sophie', lastName: 'Laurent', email: 'sophie.laurent@sani.io', department: 'Marketing', position: 'Director of Brand', salary: '165000', country: 'France', city: 'Paris', managerId: 4 },
    
    // People (report to CPO, id=5)
    { firstName: 'Jessica', lastName: 'Park', email: 'jessica.park@sani.io', department: 'People', position: 'Director of HR', salary: '160000', country: 'United States', city: 'San Francisco', managerId: 5 },
    { firstName: 'Tom', lastName: 'Baker', email: 'tom.baker@sani.io', department: 'People', position: 'Director of Talent', salary: '155000', country: 'United Kingdom', city: 'London', managerId: 5 },
    
    // Sales (report to CRO, id=6)
    { firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.hassan@sani.io', department: 'Sales', position: 'Director of Enterprise Sales', salary: '185000', country: 'United Arab Emirates', city: 'Dubai', managerId: 6 },
    { firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@sani.io', department: 'Sales', position: 'Director of SMB Sales', salary: '165000', country: 'Brazil', city: 'São Paulo', managerId: 6 },

    // Engineering Managers (report to VP Eng, id=7)
    { firstName: 'Kevin', lastName: 'Zhang', email: 'kevin.zhang@sani.io', department: 'Engineering', position: 'Engineering Manager - Backend', salary: '185000', country: 'United States', city: 'San Francisco', managerId: 7 },
    { firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.tanaka@sani.io', department: 'Engineering', position: 'Engineering Manager - Frontend', salary: '180000', country: 'Japan', city: 'Tokyo', managerId: 7 },
    { firstName: 'Nina', lastName: 'Petrov', email: 'nina.petrov@sani.io', department: 'Engineering', position: 'Engineering Manager - Platform', salary: '180000', country: 'Germany', city: 'Berlin', managerId: 7 },

    // Backend Engineers (report to Backend EM, id=18)
    { firstName: 'Alex', lastName: 'Johnson', email: 'alex.johnson@sani.io', department: 'Engineering', position: 'Senior Backend Engineer', salary: '165000', country: 'United States', city: 'San Francisco', managerId: 18 },
    { firstName: 'Fatima', lastName: 'Al-Rashid', email: 'fatima.alrashid@sani.io', department: 'Engineering', position: 'Backend Engineer', salary: '140000', country: 'Canada', city: 'Toronto', managerId: 18 },
    { firstName: 'Lucas', lastName: 'Weber', email: 'lucas.weber@sani.io', department: 'Engineering', position: 'Backend Engineer', salary: '135000', country: 'Germany', city: 'Munich', managerId: 18 },
    { firstName: 'Ava', lastName: 'Brown', email: 'ava.brown@sani.io', department: 'Engineering', position: 'Junior Backend Engineer', salary: '110000', country: 'United States', city: 'Austin', managerId: 18 },

    // Frontend Engineers (report to Frontend EM, id=19)
    { firstName: 'Hiroshi', lastName: 'Nakamura', email: 'hiroshi.nakamura@sani.io', department: 'Engineering', position: 'Senior Frontend Engineer', salary: '160000', country: 'Japan', city: 'Tokyo', managerId: 19 },
    { firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@sani.io', department: 'Engineering', position: 'Frontend Engineer', salary: '140000', country: 'United Kingdom', city: 'London', managerId: 19 },
    { firstName: 'Diego', lastName: 'Morales', email: 'diego.morales@sani.io', department: 'Engineering', position: 'Frontend Engineer', salary: '130000', country: 'Mexico', city: 'Mexico City', managerId: 19 },

    // Platform Engineers (report to Platform EM, id=20)
    { firstName: 'Olga', lastName: 'Ivanova', email: 'olga.ivanova@sani.io', department: 'Engineering', position: 'Senior Platform Engineer', salary: '170000', country: 'Germany', city: 'Berlin', managerId: 20 },
    { firstName: 'Chris', lastName: 'Taylor', email: 'chris.taylor@sani.io', department: 'Engineering', position: 'DevOps Engineer', salary: '155000', country: 'Australia', city: 'Sydney', managerId: 20 },
    { firstName: 'Mei', lastName: 'Liu', email: 'mei.liu@sani.io', department: 'Engineering', position: 'SRE Engineer', salary: '150000', country: 'Singapore', city: 'Singapore', managerId: 20 },

    // Product team (report to VP Product, id=8)
    { firstName: 'Daniel', lastName: 'O\'Brien', email: 'daniel.obrien@sani.io', department: 'Product', position: 'Senior Product Manager', salary: '170000', country: 'United States', city: 'San Francisco', managerId: 8 },
    { firstName: 'Aisha', lastName: 'Mohammed', email: 'aisha.mohammed@sani.io', department: 'Product', position: 'Product Manager', salary: '145000', country: 'United Kingdom', city: 'London', managerId: 8 },
    { firstName: 'Jake', lastName: 'Miller', email: 'jake.miller@sani.io', department: 'Product', position: 'Product Analyst', salary: '120000', country: 'United States', city: 'New York', managerId: 8 },

    // Design team (report to VP Design, id=9)
    { firstName: 'Lena', lastName: 'Johansson', email: 'lena.johansson@sani.io', department: 'Design', position: 'Senior UX Designer', salary: '155000', country: 'Sweden', city: 'Stockholm', managerId: 9 },
    { firstName: 'Marcus', lastName: 'Green', email: 'marcus.green@sani.io', department: 'Design', position: 'UI Designer', salary: '130000', country: 'United States', city: 'Portland', managerId: 9 },
    { firstName: 'Zara', lastName: 'Khan', email: 'zara.khan@sani.io', department: 'Design', position: 'UX Researcher', salary: '125000', country: 'India', city: 'Bangalore', managerId: 9 },

    // Sales reps (report to Directors)
    { firstName: 'Ryan', lastName: 'Cooper', email: 'ryan.cooper@sani.io', department: 'Sales', position: 'Enterprise Account Executive', salary: '150000', country: 'United States', city: 'Chicago', managerId: 16 },
    { firstName: 'Nadia', lastName: 'Petrova', email: 'nadia.petrova@sani.io', department: 'Sales', position: 'Enterprise Account Executive', salary: '145000', country: 'Germany', city: 'Frankfurt', managerId: 16 },
    { firstName: 'Paulo', lastName: 'Costa', email: 'paulo.costa@sani.io', department: 'Sales', position: 'SMB Account Executive', salary: '120000', country: 'Brazil', city: 'São Paulo', managerId: 17 },
    { firstName: 'Jenny', lastName: 'Nguyen', email: 'jenny.nguyen@sani.io', department: 'Sales', position: 'SMB Account Executive', salary: '115000', country: 'Vietnam', city: 'Ho Chi Minh City', managerId: 17 },

    // HR team (report to Director of HR, id=14)
    { firstName: 'Grace', lastName: 'Lee', email: 'grace.lee@sani.io', department: 'People', position: 'HR Business Partner', salary: '120000', country: 'United States', city: 'San Francisco', managerId: 14 },
    { firstName: 'Sam', lastName: 'Wright', email: 'sam.wright@sani.io', department: 'People', position: 'HR Coordinator', salary: '85000', country: 'United States', city: 'Denver', managerId: 14 },

    // Finance team (report to Director of Finance, id=10)
    { firstName: 'Patricia', lastName: 'Moore', email: 'patricia.moore@sani.io', department: 'Finance', position: 'Financial Analyst', salary: '110000', country: 'United States', city: 'New York', managerId: 10 },
    { firstName: 'Ian', lastName: 'Scott', email: 'ian.scott@sani.io', department: 'Finance', position: 'Senior Accountant', salary: '105000', country: 'United Kingdom', city: 'London', managerId: 11 },

    // Marketing team (report to Directors)
    { firstName: 'Olivia', lastName: 'Adams', email: 'olivia.adams@sani.io', department: 'Marketing', position: 'Growth Marketing Manager', salary: '130000', country: 'United States', city: 'Los Angeles', managerId: 12 },
    { firstName: 'Pierre', lastName: 'Dubois', email: 'pierre.dubois@sani.io', department: 'Marketing', position: 'Brand Designer', salary: '110000', country: 'France', city: 'Paris', managerId: 13 },
  ];

  let insertedCount = 0;
  for (const emp of employees) {
    await conn.execute(
      `INSERT INTO employee_profiles (userId, companyId, firstName, lastName, email, department, position, salary, currency, country, city, managerId, employmentType, status, startDate) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'USD', ?, ?, ?, 'full_time', 'active', NOW())`,
      [0, companyId, emp.firstName, emp.lastName, emp.email, emp.department, emp.position, emp.salary, emp.country, emp.city, emp.managerId]
    );
    insertedCount++;
  }

  // Update subscription used seats
  await conn.execute('UPDATE subscriptions SET usedSeats = ? WHERE companyId = ?', [insertedCount, companyId]);

  console.log(`✅ Seeded ${insertedCount} employees with org hierarchy`);
  console.log('Org structure:');
  console.log('  CEO (Sarah Mitchell)');
  console.log('  ├── CTO (James Chen)');
  console.log('  │   ├── VP Engineering (Elena Volkov) → 3 EMs → 10 Engineers');
  console.log('  │   ├── VP Product (Raj Patel) → 3 PMs');
  console.log('  │   └── VP Design (Lisa Kim) → 3 Designers');
  console.log('  ├── CFO (Amara Okafor) → 2 Directors → 2 Finance');
  console.log('  ├── CMO (David Rodriguez) → 2 Directors → 2 Marketing');
  console.log('  ├── CPO (Priya Sharma) → 2 Directors → 2 HR');
  console.log('  └── CRO (Michael Thompson) → 2 Directors → 4 Sales');

  await conn.end();
}

main().catch(console.error);
