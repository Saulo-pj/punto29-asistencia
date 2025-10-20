import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import HomeAdmin from "./components/HomeAdmin";
import HomeTrabajador from "./components/HomeTrabajador";
import AdminEditView from "./components/AdminEditView";
console.log('App.jsx: render start')

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
      <p className="text-gray-500 mt-2">
        Gestión de asistencia, usuarios y reportes
      </p>
    </div>
  );
}

export default function App() {
  function LocationLogger() {
    const loc = useLocation();
    console.log('LocationLogger: current pathname =', loc.pathname);
    return null;
  }
  return (
    <Router>
      <LocationLogger />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/asistencia" element={<Asistencia />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/home-admin" element={<HomeAdmin />} />
        <Route path="/admin/editar" element={<AdminEditView />} />
        <Route path="/home-trabajador" element={<HomeTrabajador />} />
        {/* Ruta catch-all para debug: mostrará si no hay otras rutas */}
        <Route path="*" element={<div style={{padding:20}}>App funcionando — ruta no encontrada</div>} />
      </Routes>
    </Router>
  );
}