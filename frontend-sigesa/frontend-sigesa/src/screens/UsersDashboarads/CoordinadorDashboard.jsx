import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Dashboard.css';

const CoordinadorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Coordinador</h1>
        <p>Bienvenido, {user?.name}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Mi Facultad</h3>
          <p>Gestionar información de la facultad</p>
          <div className="card-stats">
            <span>Carreras asignadas: --</span>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Carreras</h3>
          <p>Administrar carreras de la facultad</p>
          <div className="card-stats">
            <span>En proceso de acreditación: --</span>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Documentos</h3>
          <p>Revisar documentos de acreditación</p>
          <div className="card-stats">
            <span>Pendientes de revisión: --</span>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Reportes</h3>
          <p>Generar reportes de la facultad</p>
          <div className="card-stats">
            <span>Último reporte: --</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinadorDashboard;
