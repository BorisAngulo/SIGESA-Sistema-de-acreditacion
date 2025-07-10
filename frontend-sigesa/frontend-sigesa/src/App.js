import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './screens/home';
import TecnicoDUEA from './screens/TecnicoDUEA';
import FacultadScreen from './screens/FacultadScreen';
import VisualizarFacultades from './screens/VisualizarFacultades';
import CrearFacultad from './screens/CrearFacultad';
import AsignarCarreras from './screens/AsignarCarreras';

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
             <Route path="/facultades/visualizar" element={<VisualizarFacultades />} />
            <Route path="/facultades/crear" element={<CrearFacultad />} />
            <Route path="/facultades/asignar-carreras" element={<AsignarCarreras />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
