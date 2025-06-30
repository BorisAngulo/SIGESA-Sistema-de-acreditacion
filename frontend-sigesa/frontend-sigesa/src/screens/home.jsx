import React from 'react';
import './Home.css';
import PasosAcreditacion from '../components/PasoAcreditacion';
import mascota from '../assets/mascota.png';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-left">
        <h1 className="home-title">
          Sistema de Gestión y Seguimiento al Proceso de Acreditación de las Carreras de la Universidad Mayor de San Simón
          <br />
          <span>SIGESA - UMSS</span>
        </h1>

        <section className="home-section">
          <h2>¿Qué es SIGESA?</h2>
          <p>
            El Sistema de Acreditación Regional de Carreras Universitarias para el MERCOSUR, ARCU-SUR es la
            continuación de un proceso de similares características, denominado Mecanismo Experimental de Acreditación (MEXA),
            que se aplicó en un número limitado de carreras de Agronomía, Ingeniería y Medicina...
          </p>
        </section>

        <section className="home-section">
          <h2>¿Qué es el Proceso de Acreditación?</h2>
          <p>
            El Sistema de Acreditación Regional de Carreras Universitarias para el MERCOSUR, ARCU-SUR es la
            continuación de un proceso de similares características, denominado Mecanismo Experimental de Acreditación (MEXA)...
          </p>
        </section>
      </div>

      <PasosAcreditacion mascota={mascota} />
    </div>
  );
};

export default Home;
