const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
  try {
    // 1. Connect without database to create it
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      multipleStatements: true
    });

    console.log('Connected to MySQL server.');

    // 2. Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS fap_denso CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('Database fap_denso created or already exists.');

    // 3. Select the database
    await connection.query('USE fap_denso');

    // 4. Read the SQL file
    const sqlPath = path.join(__dirname, 'fap.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // 5. Execute the SQL file to create tables and insert initial data
    await connection.query(sql);
    console.log('Imported tables and data from fap.sql successfully.');

    await connection.end();
  } catch (err) {
    console.error('Error setting up database:', err);
  }
}

setup();
