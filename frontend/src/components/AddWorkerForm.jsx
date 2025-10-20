import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AddWorkerForm({ onSuccess }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    area: "",
    puesto: "",
    turno: "",
  });
  const [newArea, setNewArea] = useState('');
  const [newPuesto, setNewPuesto] = useState('');
  const [newTurno, setNewTurno] = useState('');

  const [areas, setAreas] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [dniError, setDniError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si cambió el área, limpiar puesto seleccionado
    if (name === 'area') {
      setForm({ ...form, area: value, puesto: '' });
    } else {
      setForm({ ...form, [name]: value });
      // Validar DNI en tiempo real
      if (name === 'dni') {
        const re = /^\d{8}$/;
        if (value && !re.test(value)) setDniError('El DNI debe tener 8 dígitos numéricos');
        else setDniError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validar campos requeridos
    const missing = [];
    if (!form.nombre) missing.push('nombre');
    if (!form.apellido) missing.push('apellido');
    if (!form.dni) missing.push('dni');
    // Validar formato exacto de DNI (8 dígitos)
    const dniRe = /^\d{8}$/;
    if (form.dni && !dniRe.test(form.dni)) {
      setDniError('El DNI debe tener 8 dígitos numéricos');
      // Mostrar alerta resumida y no enviar
      alert('Formato de DNI inválido: debe contener 8 dígitos numéricos');
      return;
    }
    // area/puesto/turno pueden venir de creación nueva
    if (!form.area && !newArea) missing.push('area');
    if (!form.puesto && !newPuesto) missing.push('puesto');
    if (!form.turno && !newTurno) missing.push('turno');
    if (missing.length > 0) {
      alert('Faltan campos requeridos: ' + missing.join(', '));
      return;
    }

    try {
      // Preparar payload: si el usuario creó nuevo nombre, usar ese, si no usar el seleccionado
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        dni: form.dni,
        area: form.area === '__crear__' ? newArea : form.area,
        puesto: form.puesto === '__crear__' ? newPuesto : form.puesto,
        turno: form.turno === '__crear__' ? newTurno : form.turno,
      };
      const res = await axios.post("http://localhost:3000/api/trabajadores", payload);
      console.log('AddWorkerForm: response', res && res.data ? res.data : res);
      if (res && res.data && res.data.tempCredentials) {
        alert(`Trabajador agregado correctamente. Credenciales temporales - Usuario: ${res.data.tempCredentials.username}, Contraseña: ${res.data.tempCredentials.password}`);
      } else {
        alert("Trabajador agregado correctamente");
      }
      onSuccess();
    } catch (err) {
      console.error('Error al agregar trabajador', err);
      alert((err && err.response && err.response.data && err.response.data.message) || 'Error al agregar trabajador');
    }
  };

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [aRes, pRes, tRes] = await Promise.all([
          axios.get('http://localhost:3000/api/trabajadores/areas'),
          axios.get('http://localhost:3000/api/trabajadores/puestos'),
          axios.get('http://localhost:3000/api/trabajadores/turnos'),
        ]);
        setAreas(aRes.data || []);
        setPuestos(pRes.data || []);
        setTurnos(tRes.data || []);
      } catch (err) {
        console.error('Error cargando catálogos', err);
      }
    };
    fetchCatalogs();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 border rounded shadow-md mb-4">
      <div className="grid grid-cols-2 gap-4">
        {['nombre', 'apellido', 'dni'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-semibold text-gray-700 capitalize">{field}</label>
            <input
              type="text"
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-semibold text-gray-700">Área</label>
          <select name="area" value={form.area} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded">
            <option value="">-- Seleccionar área --</option>
            {areas.map(a => (
              <option key={a.id_area} value={a.nombre_area}>{a.nombre_area}</option>
            ))}
            <option value="__crear__">Crear nuevo...</option>
          </select>
          {form.area === '__crear__' && (
            <input type="text" value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Nombre nueva área" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded" />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Puesto</label>
          {/* Si no hay área seleccionada, deshabilitar el select y mostrar mensaje */}
          {(() => {
            const selectedArea = areas.find(a => a.nombre_area === form.area);
            const selectedAreaId = selectedArea ? selectedArea.id_area : null;
            const puestosFiltrados = selectedAreaId ? puestos.filter(p => p.id_area === selectedAreaId) : [];
            return (
              <>
                <select
                  name="puesto"
                  value={form.puesto}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled={!selectedAreaId}
                >
                  {!selectedAreaId ? (
                    <option value="">-- Selecciona un área primero --</option>
                  ) : (
                    <>
                      <option value="">-- Seleccionar puesto --</option>
                      {puestosFiltrados.map(p => (
                        <option key={p.id_puesto} value={p.nombre_puesto}>{p.nombre_puesto}</option>
                      ))}
                      <option value="__crear__">Crear nuevo...</option>
                    </>
                  )}
                </select>
                {form.puesto === '__crear__' && (
                  <input type="text" value={newPuesto} onChange={(e) => setNewPuesto(e.target.value)} placeholder="Nombre nuevo puesto" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded" />
                )}
              </>
            );
          })()}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Turno</label>
          <select name="turno" value={form.turno} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded">
            <option value="">-- Seleccionar turno --</option>
            {turnos.map(t => (
              <option key={t.id_turno} value={t.nombre_turno}>{t.nombre_turno}</option>
            ))}
            <option value="__crear__">Crear nuevo...</option>
          </select>
          {form.turno === '__crear__' && (
            <input type="text" value={newTurno} onChange={(e) => setNewTurno(e.target.value)} placeholder="Nombre nuevo turno" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded" />
          )}
        </div>
      </div>
      <button type="submit" className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Guardar
      </button>
    </form>
  );
}