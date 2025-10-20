import express from 'express';
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import { connectDB } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = await connectDB();
    console.log('🧠 Consultando tabla Trabajadores...');
    // Devolver información completa con área, puesto y turno (LEFT JOIN para evitar filas perdidas)
    const result = await pool.request().query(
      `SELECT TOP 100
         T.id_trabajador,
         T.nombre,
         T.apellido,
         T.dni,
         P.nombre_puesto AS puesto,
         A.nombre_area AS area,
         TR.nombre_turno AS turno,
         T.fecha_ingreso,
         T.estado
       FROM Trabajadores T
       LEFT JOIN Puestos P ON T.id_puesto = P.id_puesto
       LEFT JOIN Areas A ON P.id_area = A.id_area
       LEFT JOIN Turnos TR ON T.turno_asignado = TR.id_turno
       ORDER BY T.nombre`);
    console.log('✅ Resultado:', result.recordset.length, 'registros');
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Error consultando trabajadores:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener trabajador por DNI
router.get('/trabajador/:dni', async (req, res) => {
  const { dni } = req.params;
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input('dni', sql.VarChar, dni)
      .query('SELECT nombre, apellido, dni, fecha_ingreso, estado FROM Trabajadores WHERE dni = @dni');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Trabajador no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('❌ Error al consultar trabajador por DNI:', err);
    res.status(500).json({ message: 'Error al consultar la base de datos' });
  }
});

// Crear nuevo trabajador (crea Area/Puesto/Turno si no existen)
router.post('/', async (req, res) => {
  const { nombre, apellido, dni, area, puesto, turno } = req.body || {};
  if (!nombre || !apellido || !dni) {
    return res.status(400).json({ message: 'Faltan datos requeridos: nombre, apellido o dni' });
  }

  const pool = await connectDB();
  const tx = pool.transaction();
  try {
    await tx.begin();
    const request = tx.request();

    // Validar si DNI ya existe en Trabajadores
    const exists = await request.input('dniCheck', sql.VarChar, dni).query('SELECT id_trabajador FROM Trabajadores WHERE dni = @dniCheck');
    if (exists.recordset.length > 0) {
      await tx.rollback();
      return res.status(409).json({ message: 'DNI ya registrado' });
    }

    // 1) Area
    let areaId = null;
    if (area) {
      const r = await request.input('area', sql.VarChar, area).query('SELECT id_area FROM Areas WHERE nombre_area = @area');
      if (r.recordset.length > 0) areaId = r.recordset[0].id_area;
      else {
        const ins = await request.input('area', sql.VarChar, area).query('INSERT INTO Areas (nombre_area) OUTPUT INSERTED.id_area VALUES (@area)');
        areaId = ins.recordset[0].id_area;
      }
    }

    // 2) Puesto
    let puestoId = null;
    if (puesto) {
      const r2 = await request.input('puesto', sql.VarChar, puesto).query('SELECT id_puesto FROM Puestos WHERE nombre_puesto = @puesto');
      if (r2.recordset.length > 0) puestoId = r2.recordset[0].id_puesto;
      else {
        // Si tenemos areaId la asociaremos, si no queda null
        const ins2 = await request.input('puesto', sql.VarChar, puesto).input('areaId', sql.Int, areaId).query('INSERT INTO Puestos (id_area, nombre_puesto) OUTPUT INSERTED.id_puesto VALUES (@areaId, @puesto)');
        puestoId = ins2.recordset[0].id_puesto;
      }
    }

    // 3) Turno
    let turnoId = null;
    if (turno) {
      const r3 = await request.input('turno', sql.VarChar, turno).query('SELECT id_turno FROM Turnos WHERE nombre_turno = @turno');
      if (r3.recordset.length > 0) turnoId = r3.recordset[0].id_turno;
      else {
        // Insertar turno con hora inicio/fin por defecto NULL
        const ins3 = await request.input('turno', sql.VarChar, turno).query('INSERT INTO Turnos (nombre_turno) OUTPUT INSERTED.id_turno VALUES (@turno)');
        turnoId = ins3.recordset[0].id_turno;
      }
    }

    // 4) Insertar trabajador
    const insertTrabajador = await request
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .input('dni', sql.VarChar, dni)
      .input('puestoId', sql.Int, puestoId)
      .input('turnoId', sql.Int, turnoId)
      .query(
        `INSERT INTO Trabajadores (nombre, apellido, dni, id_puesto, turno_asignado, fecha_ingreso, estado)
         OUTPUT INSERTED.id_trabajador
         VALUES (@nombre, @apellido, @dni, @puestoId, @turnoId, GETDATE(), 'activo')`
      );

    const newId = insertTrabajador.recordset[0].id_trabajador;

    // Crear usuario asociado si no existe en Usuarios
    const year = new Date().getFullYear();
    const tempPassword = dni + String(year);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(tempPassword, salt);

    // Obtener/crear rol 'Trabajador'
    let rolId = null;
    const existRol = await request.input('rolName', sql.VarChar, 'Trabajador').query('SELECT id_rol FROM Roles WHERE nombre_rol = @rolName');
    if (existRol.recordset.length > 0) rolId = existRol.recordset[0].id_rol;
    else {
      const insRol = await request.input('rolName', sql.VarChar, 'Trabajador').query('INSERT INTO Roles (nombre_rol) OUTPUT INSERTED.id_rol VALUES (@rolName)');
      rolId = insRol.recordset[0].id_rol;
    }

    // Crear usuario. Aseguramos no duplicar username
    const existUser = await request.input('username', sql.VarChar, dni).query('SELECT id_usuario FROM Usuarios WHERE username = @username');
    if (existUser.recordset.length === 0) {
      await request
        .input('id_trab', sql.Int, newId)
        .input('username', sql.VarChar, dni)
        .input('password_hash', sql.VarChar, passwordHash)
        .input('id_rol', sql.Int, rolId)
        .query('INSERT INTO Usuarios (id_trabajador, username, password_hash, id_rol) VALUES (@id_trab, @username, @password_hash, @id_rol)');
    }

    await tx.commit();

    res.json({ success: true, id_trabajador: newId, tempCredentials: { username: dni, password: tempPassword } });
  } catch (err) {
    console.error('❌ Error al crear trabajador:', err);
    try { await tx.rollback(); } catch (e) {}
    res.status(500).json({ message: 'Error al crear trabajador' });
  }
});

// Listar áreas
router.get('/areas', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT id_area, nombre_area FROM Areas ORDER BY nombre_area');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error al listar areas:', err);
    res.status(500).json({ message: 'Error al listar areas' });
  }
});

// Listar puestos
router.get('/puestos', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT id_puesto, nombre_puesto, id_area FROM Puestos ORDER BY nombre_puesto');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error al listar puestos:', err);
    res.status(500).json({ message: 'Error al listar puestos' });
  }
});

// Listar turnos
router.get('/turnos', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT id_turno, nombre_turno, hora_inicio, hora_fin FROM Turnos ORDER BY nombre_turno');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error al listar turnos:', err);
    res.status(500).json({ message: 'Error al listar turnos' });
  }
});

export default router;



