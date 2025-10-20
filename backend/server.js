import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import trabajadoresRoutes from "./routes/trabajadores.js";
import loginRoutes from "./routes/login.js";

const app = express();
const PORT = 3000;

// 🔹 Estas dos líneas son las que permiten leer JSON desde el frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Permitir CORS para desarrollo (Vite / otros clientes)
const corsOptions = {
	origin: [
		'http://localhost:5173',
		'http://127.0.0.1:5173',
	],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
}
app.use(cors(corsOptions))

app.get("/", (req, res) => res.send("Servidor funcionando 🟢"));
app.use("/api/trabajadores", trabajadoresRoutes);
app.use("/api/login", loginRoutes);

connectDB();
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

