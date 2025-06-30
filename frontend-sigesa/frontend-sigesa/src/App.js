import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './screens/Home';
import FacultadScreen from './screens/FacultadScreen'

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
    <div style={styles.app}>
      <Header />
      <main style={styles.main}>
        <Home />
      </main>
      <Footer />
    </div>
  );
}

export default App;
