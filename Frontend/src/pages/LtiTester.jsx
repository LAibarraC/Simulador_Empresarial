import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LtiTester = ({ onLogin }) => {
  const query = new URLSearchParams(useLocation().search);
  const name = query.get('name');
  const role = query.get('role');
  const navigate = useNavigate();

  // En tu LtiTester.jsx, busca la función handleIngresoLTI y déjala así:
  const handleIngresoLTI = () => {
    // Creamos el perfil del Estudiante/Docente basado en lo que mandó Moodle
    const perfilLTI = {
      id: query.get('id') || 'ID_DESCONOCIDO',
      nombre: name,
      rol: role
    };

    onLogin(perfilLTI); // Guardamos el usuario LTI en App.jsx
    navigate('/');
  };

  
  return (
    <div style={{ padding: '20px', border: '2px dashed #4A90E2', margin: '20px', textAlign: 'center' }}>
      <h1>🧪 Panel de Verificación LTI</h1>
      {name ? (
        <div style={{ background: '#e0f7fa', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
          <p style={{color: 'green', fontSize: '1.2rem', fontWeight: 'bold'}}>✅ Token validado por FastAPI</p>
          <hr style={{ margin: '10px 0' }}/>
          <p><strong>Usuario institucional:</strong> {name}</p>
          <p><strong>Rol en plataforma:</strong> {role}</p>
          <br />
          <button 
            onClick={handleIngresoLTI}
            style={{ padding: '10px 20px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
          >
            Ingresar al Software Estadístico
          </button>
        </div>
      ) : (
        <p>Esperando redirección segura desde el Backend...</p>
      )}
    </div>
  );
};

export default LtiTester;