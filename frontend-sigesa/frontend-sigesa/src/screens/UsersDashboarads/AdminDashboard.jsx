import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Administración</h1>
        <p>Bienvenido, {user?.name}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Gestión de Usuarios</h3>
          <p>Administrar usuarios del sistema</p>
          <div className="card-stats">
            <span>Total usuarios: --</span>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Facultades</h3>
          <p>Gestionar facultades y carreras</p>
          <div className="card-stats">
            <span>Total facultades: --</span>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Reportes del Sistema</h3>
          <p>Generar reportes y estadísticas</p>
          <div className="card-stats">
            <span>Último reporte: --</span>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Configuración</h3>
          <p>Configurar parámetros del sistema</p>
          <div className="card-stats">
            <span>Configuraciones: --</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
