import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import PasosAcreditacion from '../components/PasoAcreditacion';
import mascota from '../assets/mascota.png';

const Home = () => {
  return (
    <div className="home-container">
      {/* Título principal */}
      <header className="home-header">
        <h1 className="home-title">
          <div>Sistema de Gestión y Seguimiento al Proceso de Acreditación</div>
          <div>de las Carreras de la Universidad Mayor de San Simón</div>
          <br />
          <span>SIGESA - UMSS</span>
        </h1>

      </header>

      {/* Contenido principal */}
      <main className="home-main">
        {/* Sección de información */}
        <div className="home-content">
          <section className="home-section">
            <h2>¿Qué es SIGESA?</h2>
            <p>
              El <strong>SIGESA</strong> (Sistema de Gestión y Seguimiento al Proceso de Acreditación) es una plataforma digital desarrollada por la <strong>Dirección Universitaria de Evaluación y Acreditación (DUEA)</strong> de la <strong>Universidad Mayor de San Simón (UMSS)</strong>, con el propósito de facilitar, organizar y dar seguimiento al proceso de acreditación de carreras universitarias bajo los estándares establecidos por el <strong>Sistema ARCU-SUR</strong> del MERCOSUR y en coordinación con el <strong>Comité Ejecutivo de la Universidad Boliviana (CEUB)</strong>.
            </p>
            <p>
              Este sistema responde a la necesidad institucional de contar con una herramienta que permita gestionar de forma sistemática y transparente cada una de las etapas de la acreditación. A través del SIGESA, la DUEA asegura una administración eficiente, un seguimiento riguroso y la adecuada documentación del cumplimiento de los criterios de calidad definidos a nivel nacional y regional.
            </p>
            <p>
              En este marco, el SIGESA brinda a la DUEA las herramientas necesarias para organizar información relevante, almacenar evidencias, elaborar informes de autoevaluación, gestionar observaciones emitidas por pares evaluadores y generar reportes útiles para la toma de decisiones. Además, permite planificar y dar seguimiento a las actividades de acuerdo con los cronogramas establecidos por ARCU-SUR y el CEUB.
            </p>
            <p>
              Aunque está diseñado principalmente para administradores, técnicos y responsables de la DUEA, el SIGESA también ofrece acceso público a información relacionada con los procesos de acreditación, fortaleciendo la transparencia y visibilizando el trabajo institucional en materia de aseguramiento de la calidad.
            </p>
            <p>
              En síntesis, el SIGESA constituye una herramienta clave que refuerza el compromiso de la <strong>UMSS</strong>, a través de la <strong>DUEA</strong>, con la mejora continua, la calidad académica y la integración regional. No solo gestiona información, sino que impulsa una cultura universitaria de evaluación permanente, responsabilidad institucional y apertura hacia la comunidad y la sociedad en general.
            </p>
          </section>

          <section className="home-section">
            <h2>¿Qué es el Proceso de Acreditación?</h2>
            <p>
              El proceso de acreditación es un mecanismo de evaluación externa que verifica y garantiza que una carrera universitaria cumpla con criterios de calidad previamente definidos. En el ámbito regional, este proceso se desarrolla a través del <strong>Sistema de Acreditación Regional de Carreras Universitarias del MERCOSUR (ARCU-SUR)</strong>, que impulsa la integración y cooperación académica entre los países miembros y asociados.
            </p>
            <p>
              ARCU-SUR surge como continuidad del <em>Mecanismo Experimental de Acreditación (MEXA)</em>, iniciativa que evaluó de manera piloto carreras como Agronomía, Ingeniería y Medicina, y que sentó las bases para un sistema permanente, sólido y reconocido internacionalmente.
            </p>
            <p>
              El propósito central de la acreditación es asegurar que las carreras universitarias brinden una formación académica de excelencia, socialmente pertinente, con infraestructura adecuada, docentes calificados y procesos de mejora continua. Asimismo, la acreditación regional facilita la movilidad de estudiantes y profesionales, y favorece el reconocimiento mutuo de títulos en el MERCOSUR.
            </p>
            <p>
              En la <strong>Universidad Mayor de San Simón (UMSS)</strong>, la conducción de este proceso está a cargo de la <strong>Dirección Universitaria de Evaluación y Acreditación (DUEA)</strong>, que acompaña a las carreras en todas las etapas: autoevaluación, evaluación externa y seguimiento. Todo ello en articulación con los lineamientos del ARCU-SUR y en coordinación con el <strong>Comité Ejecutivo de la Universidad Boliviana (CEUB)</strong>.
            </p>
          </section>
        </div>

        {/* Componente de pasos */}
        <div className="home-steps">
          <PasosAcreditacion mascota={mascota} />
        </div>
      </main>
    </div>
  );
};

export default Home;