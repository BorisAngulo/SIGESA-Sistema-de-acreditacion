import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';

import Home from './screens/Home';
import Login from './screens/Login';
import AdminDashboard from './screens/UsersDashboarads/AdminDashboard';
import CoordinadorDashboard from './screens/UsersDashboarads/CoordinadorDashboard';
import TecnicoDUEA from './screens/TecnicoDUEA';
import FacultadScreen from './screens/FacultadScreen';
import CrearFacultad from './screens/CrearFacultad';
import AsignarCarreras from './screens/AsignarCarreras';
import VisualizarCarreras from './screens/VisualizarCarreras';
import CrearCarrera from './screens/CrearCarrera';
import InformacionCarrera from './screens/InformacionCarrera';
import FasesScreen from './screens/FasesScreen';
function App() {
  const styles = {
    app: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    },
    main: {
      flex: 1,
    },
  };

  return (
    <Router>
      <AuthProvider>
        <div style={styles.app}>
          <Header />

          <main style={styles.main}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              
              {/* Rutas para Admin */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Rutas para Coordinador */}
              <Route path="/coordinador" element={
                <ProtectedRoute allowedRoles={['Coordinador']}>
                  <CoordinadorDashboard />
                </ProtectedRoute>
              } />
              
              {/* Rutas para Técnico */}
              <Route path="/tecnico" element={
                <ProtectedRoute allowedRoles={['Tecnico', 'Admin']}>
                  <TecnicoDUEA />
                </ProtectedRoute>
              } />
              
              {/* Rutas protegidas que requieren autenticación */}
              <Route path="/facultad" element={
                <ProtectedRoute>
                  <FacultadScreen />
                </ProtectedRoute>
              } />
              
              <Route path="/facultad/crear" element={
                <ProtectedRoute allowedRoles={['Admin', 'Tecnico']}>
                  <CrearFacultad />
                </ProtectedRoute>
              } />
              
              <Route path="/facultades/asignar-carreras" element={
                <ProtectedRoute allowedRoles={['Admin', 'Tecnico']}>
                  <AsignarCarreras />
                </ProtectedRoute>
              } />
              
              <Route path="/visualizar-carreras/:facultadId" element={
                <ProtectedRoute>
                  <VisualizarCarreras />
                </ProtectedRoute>
              } />
              
              <Route path="/carrera/crear/:facultadId" element={
                <ProtectedRoute allowedRoles={['Admin', 'Tecnico', 'Coordinador']}>
                  <CrearCarrera />
                </ProtectedRoute>
              } />
              
              <Route path="/informacion-carrera/:carreraId" element={
                <ProtectedRoute>
                  <InformacionCarrera />
                </ProtectedRoute>
              } />
              
              <Route path="/fases" element={
                <ProtectedRoute>
                  <FasesScreen />
                </ProtectedRoute>
              } />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
