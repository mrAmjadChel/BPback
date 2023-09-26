// connectToOracleDB.js
const oracledb = require('oracledb');
require("dotenv").config();

async function connectToOracleDB() {
  try {
    
    const connection = await oracledb.getConnection({
        user: process.env.ORACLE_DB_USER,
        password: process.env.ORACLE_DB_PASSWORD,
        connectString: process.env.ORACLE_DB_CONNECT_STRING
    });

    console.log('Connected to Oracle Database');
    return connection;
  } catch (error) {
    console.error('Error connecting to Oracle Database:', error.message);
    throw error;
  }
}

module.exports = connectToOracleDB;
