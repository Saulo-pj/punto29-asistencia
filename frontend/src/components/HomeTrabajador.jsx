import React, { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";

const HOME_ICON = "https://img.icons8.com/3d-fluency/94/home.png";
const ASISTENCIA_ICON = "https://img.icons8.com/3d-fluency/94/guest-male--v3.png";
const VISUALIZE_ICON = "https://img.icons8.com/3d-fluency/94/tear-off-calendar.png";
const FALTAS_ICON = "https://img.icons8.com/3d-fluency/94/box-important.png";

export default function HomeTrabajador() {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const dni = localStorage.getItem("dni"); // Asegúrate de guardar el DNI al hacer login
  const res = await axios.get(`http://localhost:3000/api/trabajadores/trabajador/${dni}`);
        setDatos(res.data);
      } catch (err) {
        console.error("Error al obtener datos del trabajador", err);
      }
    };

    fetchDatos();
  }, []);

  if (!datos) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Cargando datos del trabajador...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Menú lateral */}
      <aside className="w-20 bg-gray-800 text-white flex flex-col items-center py-4 space-y-6">
        <img src={HOME_ICON} alt="Home" className="w-8" />
        <img src={ASISTENCIA_ICON} alt="Asistencia" className="w-8" />
        <img src={VISUALIZE_ICON} alt="Visualizar" className="w-8" />
        <img src={FALTAS_ICON} alt="Faltas" className="w-8" />
      </aside>

      {/* Panel principal */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold text-green-600 mb-4">Mi QR</h1>
        <QRCode value={datos.dni} size={160} />
        <p className="text-gray-700 mt-4">DNI: {datos.dni}</p>
        <p className="text-gray-700">Nombre: {datos.nombre} {datos.apellido}</p>
        <p className="text-gray-500 text-sm mt-2">Ingreso: {datos.fecha_ingreso}</p>
        <p className="text-gray-500 text-sm">Estado: {datos.estado}</p>
      </main>
    </div>
  );
}