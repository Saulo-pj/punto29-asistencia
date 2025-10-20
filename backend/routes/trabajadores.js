import express from 'express';
import sql from 'mssql';
import { connectDB } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = await connectDB();
    console.log('🧠 Consultando tabla Trabajadores...');
    const result = await pool.request().query('SELECT TOP 5 * FROM dbo.Trabajadores');
    console.log('✅ Resultado:', result.recordset);
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Error consultando trabajadores:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;


