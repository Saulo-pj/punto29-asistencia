// backend/db.js
import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const dbSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // 🔒 fuerza el cifrado para Azure SQL
    trustServerCertificate: false // 🔐 debe ser false en Azure
  }
};

export async function connectDB() {
  try {
    const pool = await sql.connect(dbSettings);
    console.log('✅ Conectado a Azure SQL Database');
    return pool;
  } catch (error) {
    console.error('❌ Error al conectar con Azure SQL:', error);
  }
}

