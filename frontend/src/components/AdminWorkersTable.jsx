import React, { useEffect, useState } from "react";
import axios from "axios";
import AddWorkerForm from "./AddWorkerForm";

function AdminWorkersTable() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    const fetchTrabajadores = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/trabajadores");
        setTrabajadores(res.data);
      } catch (err) {
        console.error("Error al obtener trabajadores", err);
      }
    };

    fetchTrabajadores();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-700">Lista de Trabajadores</h2>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {mostrarFormulario ? "Cerrar Formulario" : "Agregar Trabajador"}
        </button>
      </div>

      {mostrarFormulario && <AddWorkerForm onSuccess={() => window.location.reload()} />}

      <table className="w-full border border-gray-300 mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Nombre</th>
            <th className="p-2">Apellido</th>
            <th className="p-2">DNI</th>
            <th className="p-2">Área</th>
            <th className="p-2">Puesto</th>
            <th className="p-2">Turno</th>
          </tr>
        </thead>
        <tbody>
          {trabajadores.map((t) => (
            <tr key={t.dni} className="text-center border-t">
              <td className="p-2">{t.nombre}</td>
              <td className="p-2">{t.apellido}</td>
              <td className="p-2">{t.dni}</td>
              <td className="p-2">{t.area}</td>
              <td className="p-2">{t.puesto}</td>
              <td className="p-2">{t.turno}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminWorkersTable;
export { AdminWorkersTable };