import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ToastProvider from './components/ToastProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './screens/Home';
import Login from './screens/Login';
import UsuariosScreen from './screens/UsuariosScreen';
import ActividadScreen from './screens/ActividadScreen';
import TecnicoDUEA from './screens/TecnicoDUEA';
import FacultadScreen from './screens/FacultadScreen';
import CrearFacultad from './screens/CrearFacultad';
import AsignarCarreras from './screens/AsignarCarreras';
import VisualizarCarreras from './screens/VisualizarCarreras';
import CrearCarrera from './screens/CrearCarrera';
import InformacionCarrera from './screens/InformacionCarrera';
import FasesScreen from './screens/FasesScreen';
import EditarFacultadScreen from './screens/EditarFacultadScreen';
import EditarCarreraScreen from './screens/EditarCarreraScreen';
import ModalidadesScreen from './screens/ModalidadesScreen';
import BackupScreen from './screens/BackupScreen';
import SubFaseScreen from './screens/SubFaseScreen';
import DocumentosScreen from './screens/DocumentosScreen';
import MiCarreraScreen from './screens/MiCarreraScreen';
import CarrerasModalidadesAdmin from './components/CarrerasModalidadesAdmin';
import ReporteFacultades from './screens/ReporteFacultades';
import ReporteCarreras from './screens/ReporteCarreras';
import ReporteModalidades from './screens/ReporteModalidades';

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
        <ToastProvider>
          <div style={styles.app}>
            <Header />

            <main style={styles.main}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/facultad" element={<FacultadScreen />} />
                <Route path="/visualizar-carreras/:facultadId" element={<VisualizarCarreras />} />
                <Route path="/informacion-carrera/:carreraId" element={<InformacionCarrera />} />
                
                {/* Rutas para Admin */}
                <Route path="/usuarios" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <UsuariosScreen />
                  </ProtectedRoute>
                } />
                
                <Route path="/actividad" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ActividadScreen />
                  </ProtectedRoute>
                } />
                
                {/* Rutas para Coordinador */}
                <Route path="/mi-facultad" element={
                  <ProtectedRoute allowedRoles={['Coordinador']}>
                    <MiCarreraScreen />
                  </ProtectedRoute>
                } />
                
                {/* Rutas para Técnico */}
                <Route path="/tecnico" element={
                  <ProtectedRoute allowedRoles={['Tecnico', 'Admin']}>
                    <TecnicoDUEA />
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

                <Route path="/carreras-modalidades" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Tecnico']}>
                    <CarrerasModalidadesAdmin />
                  </ProtectedRoute>
                } />

                <Route path="/carrera/editar/:id" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Tecnico', 'Coordinador']}>
                    <EditarCarreraScreen />
                  </ProtectedRoute>
                } />
                
                <Route path="/carrera/crear/:facultadId" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Tecnico', 'Coordinador']}>
                    <CrearCarrera />
                  </ProtectedRoute>
                } />

                <Route path="/facultad/editar/:id" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <EditarFacultadScreen />
                  </ProtectedRoute>
                } />
                
                <Route path="/modalidades/arco-sur" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Tecnico']}>
                    <ModalidadesScreen modalidad="arco-sur" />
                  </ProtectedRoute>
                } />
                
                <Route path="/modalidades/ceub" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Tecnico']}>
                    <ModalidadesScreen modalidad="ceub" />
                  </ProtectedRoute>
                } />

                <Route path="/modalidades" element={<Navigate to="/modalidades/arco-sur" replace />} />
                
                <Route path="/backups" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <BackupScreen />
                  </ProtectedRoute>
                } />
                
                <Route path="/documentos" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Tecnico', 'Coordinador']}>
                    <DocumentosScreen />
                  </ProtectedRoute>
                } />
                
                <Route path="/subfase" element={<SubFaseScreen />} />

                <Route path="/fases/:carreraId/:modalidadId" element={
                  <ProtectedRoute>
                    <FasesScreen />
                  </ProtectedRoute>
                } />
                
                <Route path="/fases" element={
                  <ProtectedRoute>
                    <FasesScreen />
                  </ProtectedRoute>
                } />

                {/* Rutas de Reportes */}
                <Route path="/reportes/facultades" element={<ReporteFacultades />} />
                <Route path="/reportes/carreras" element={<ReporteCarreras />} />
                <Route path="/reportes/modalidades" element={<ReporteModalidades />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;