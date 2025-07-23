import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './screens/home';
import TecnicoDUEA from './screens/TecnicoDUEA';
import FacultadScreen from './screens/FacultadScreen';
import CrearFacultad from './screens/CrearFacultad';
import AsignarCarreras from './screens/AsignarCarreras';
import VisualizarCarreras from './screens/VisualizarCarreras';
import CrearCarrera from './screens/CrearCarrera';
import InformacionCarrera from './screens/InformacionCarrera';
import FasesScreen from './screens/FasesScreen';
import Login
 from './screens/Login';
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
      <div style={styles.app}>
        <Header />

        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tecnico" element={<TecnicoDUEA />} />
            <Route path="/facultad" element={<FacultadScreen />} />
            <Route path="/facultad/crear" element={<CrearFacultad />} />
            <Route path="/facultades/asignar-carreras" element={<AsignarCarreras />} />
            <Route path="/visualizar-carreras/:facultadId" element={<VisualizarCarreras />} />
             <Route path="/carrera/crear/:facultadId" element={<CrearCarrera />} />
             <Route path="/informacion-carrera/:carreraId" element={<InformacionCarrera />} />
              <Route path="/fases" element={<FasesScreen />} />
              <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
