import express from "express";
import sql from "mssql";
import { connectDB } from "../db.js";

const router = express.Router();

// GET informativo para evitar 404 al abrir /api/login en un navegador
router.get("/", (req, res) => {
  return res.json({ success: false, message: "Endpoint de login: use POST con JSON { username, password }" });
});

router.post("/", async (req, res) => {
  // DEBUG: registrar cabeceras y body para depuración de Postman / clientes
  console.log("[login] headers:", req.headers);
  console.log("[login] raw body:", req.body);

  const body = req.body || {};
  const { username, password } = body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Faltan credenciales" });
  }

  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(
        "SELECT U.*, R.nombre_rol, T.nombre, T.apellido FROM Usuarios U " +
        "INNER JOIN Roles R ON U.id_rol = R.id_rol " +
        "INNER JOIN Trabajadores T ON U.id_trabajador = T.id_trabajador " +
        "WHERE U.username = @username"
      );

    // DEBUG: mostrar resultados de la consulta
    console.log('[login] recordset:', result && result.recordset ? result.recordset : result);

    if (result.recordset.length === 0) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }

    const user = result.recordset[0];

    if (user.password_hash === password) {
      return res.json({
        success: true,
        message: "Inicio de sesión exitoso",
        rol: user.nombre_rol,
        trabajador: {
          id: user.id_trabajador,
          nombre: user.nombre,
          apellido: user.apellido,
        },
      });
    } else {
      return res.json({ success: false, message: "Contraseña incorrecta" });
    }
  } catch (error) {
    console.error("❌ Error al validar login:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

export default router;
