import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('70123456');
  const [password, setPassword] = useState('701234562025');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/login', {
        username,
        password,
      });

      console.log('Login: response', res && res.data ? res.data : res);

      if (res && res.data && res.data.success) {
        // Guardar DNI en localStorage
        localStorage.setItem('dni', username);
        const { rol } = res.data;
        if (rol === 'Administrador') {
          navigate('/home-admin');
        } else {
          navigate('/home-trabajador');
        }
      } else {
        setError((res && res.data && res.data.message) || 'Credenciales incorrectas');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Mostrar mensaje del servidor si existe
      if (err && err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err && err.message) {
        setError(err.message);
      } else {
        setError('Error al conectar con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">Punto29 - Asistencia</h1>
          <p className="text-gray-500 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">DNI</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ingresa tu DNI"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Contraseña"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-2 cursor-pointer hover:text-green-600">
            ¿Olvidaste tu contraseña?
          </p>
        </form>
      </div>
    </div>
  );
}