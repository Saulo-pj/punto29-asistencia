import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";

function Asistencia() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-green-600">
        Bienvenido al Módulo de Asistencia
      </h1>
      <p className="text-gray-500 mt-2">Próximamente...</p>
    </div>
  );
}

function AdminPanel() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-green-600">
        Panel del Administrador
      </h1>
      <p className="text-gray-500 mt-2">Gestión de asistencia, usuarios y reportes</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/asistencia" element={<Asistencia />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}
