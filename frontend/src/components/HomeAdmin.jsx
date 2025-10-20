import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Usar URLs directas en src para evitar que Vite intente tratarlas como módulos
const HOME_ICON = "https://img.icons8.com/3d-fluency/94/home.png";
const EDIT_ICON = "https://img.icons8.com/3d-fluency/94/create.png";
const VISUALIZE_ICON = "https://img.icons8.com/3d-fluency/94/view.png";
const MANAGEMENT_ICON = "https://img.icons8.com/3d-fluency/94/statistics.png";
export default function HomeAdmin() {
  const navigate = useNavigate();
  const [fechaHora, setFechaHora] = useState("");

  useEffect(() => {
    const actualizarFechaHora = () => {
      const ahora = new Date();
      const opcionesFecha = { weekday: "long", day: "2-digit", month: "long" };
      const fecha = ahora.toLocaleDateString("es-PE", opcionesFecha);
      const hora = ahora.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
      setFechaHora(`${fecha} - ${hora}`);
    };

    actualizarFechaHora();
    const intervalo = setInterval(actualizarFechaHora, 60000); // actualiza cada minuto

    return () => clearInterval(intervalo);
  }, []);

  const handleEditar = () => {
    console.log('HomeAdmin: clic en Editar — navegando a /admin/editar');
    navigate('/admin/editar');
  };

  return (
    <div className="flex h-screen">
      {/* Menú lateral */}
      <aside className="w-20 bg-gray-800 text-white flex flex-col items-center py-4 space-y-6">
        <img src={HOME_ICON} alt="Home" className="w-8" />
        <img
          src={EDIT_ICON}
          alt="Editar"
          className="w-8 cursor-pointer"
          onClick={handleEditar}
          role="button"
        />
        <img src={VISUALIZE_ICON} alt="Visualizar" className="w-8" />
        <img src={MANAGEMENT_ICON} alt="Gestión" className="w-8" />
      </aside>

      {/* Panel principal */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Bienvenido, Administrador
        </h1>
        <p className="text-gray-600 mb-2">Fecha y hora actual:</p>
        <p className="text-gray-800 font-semibold mb-6">{fechaHora}</p>

        <div className="space-x-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
            Registrar Ingreso
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
            Registrar Salida
          </button>
        </div>

        <div className="mt-6 space-y-2 text-gray-700">
          <p>Escanear QR</p>
          <p>Ingresar por DNI</p>
        </div>
      </main>
    </div>
  );
}
