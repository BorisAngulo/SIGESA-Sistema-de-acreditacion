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
              El SIGESA (Sistema de Gestión y Seguimiento al Proceso de Acreditación) es una plataforma digital desarrollada por la Dirección Universitaria de Evaluación y Acreditación (DUEA) de la Universidad Mayor de San Simón (UMSS), con el objetivo de facilitar, organizar y dar seguimiento al proceso de acreditación de carreras universitarias bajo los estándares establecidos por el Sistema ARCU-SUR del MERCOSUR y el Comité Universitario Boliviano (CUB).
            </p>
            <p>
              Este sistema es de uso exclusivo de la unidad DUEA, y responde a la necesidad de contar con una herramienta que permita gestionar de manera sistemática y transparente cada una de las etapas que componen los procesos de acreditación. A través del SIGESA, la DUEA garantiza una administración eficiente y un seguimiento riguroso del cumplimiento de los criterios de calidad definidos a nivel nacional y regional.
            </p>
            <p>
              El ARCU-SUR, promovido por los países del MERCOSUR y asociados, es el sistema de acreditación regional que da continuidad al anterior Mecanismo Experimental de Acreditación (MEXA), aplicado inicialmente en carreras como Agronomía, Ingeniería y Medicina. Hoy en día, ARCU-SUR representa un mecanismo consolidado que busca asegurar la calidad académica, promover la movilidad estudiantil y profesional, y facilitar el reconocimiento mutuo de títulos universitarios en la región.
            </p>
            <p>
              El SIGESA, en ese marco, permite a la DUEA cumplir con sus funciones de evaluación institucional mediante herramientas que organizan la información relevante, almacenan evidencias, permiten la elaboración de informes de autoevaluación, gestionan las observaciones emitidas por pares evaluadores, y generan reportes útiles para la toma de decisiones. También apoya la planificación y seguimiento de actividades en función de cronogramas establecidos por los sistemas ARCU-SUR y CUB.
            </p>
            <p>
              Este sistema está diseñado para ser utilizado por administradores, técnicos y tramitadores de la DUEA, pero también permite el acceso al público en general, con el fin de promover la transparencia y dar visibilidad al trabajo que se realiza en materia de aseguramiento de la calidad. La interfaz del SIGESA permite la consulta pública de información relacionada con los procesos de acreditación y resultados alcanzados por las distintas carreras sometidas a evaluación.
            </p>
            <p>
              En síntesis, el SIGESA es una herramienta clave que refuerza el compromiso de la UMSS, a través de su unidad DUEA, con la mejora continua, la calidad académica y la integración regional. Es un sistema que no solo gestiona información, sino que promueve una cultura institucional de evaluación permanente, responsabilidad y apertura hacia la comunidad universitaria y la sociedad en general.
            </p>
          </section>

          <section className="home-section">
            <h2>¿Qué es el Proceso de Acreditación?</h2>
            <p>
              El proceso de acreditación es un mecanismo de evaluación externa que permite verificar y garantizar que una carrera universitaria cumpla con criterios de calidad previamente establecidos. En el ámbito regional, este proceso se lleva a cabo a través del <strong>Sistema de Acreditación Regional de Carreras Universitarias del MERCOSUR (ARCU-SUR)</strong>, el cual promueve la integración educativa entre los países miembros y asociados del bloque.
            </p>
            <p>
              ARCU-SUR es la continuación del <em>Mecanismo Experimental de Acreditación (MEXA)</em>, una iniciativa previa que evaluó de forma piloto carreras como Agronomía, Ingeniería y Medicina, sentando las bases para un sistema permanente, sólido y reconocido internacionalmente.
            </p>
            <p>
              A través de este proceso, se busca asegurar que las carreras universitarias ofrezcan una formación académica de alta calidad, con pertinencia social, infraestructura adecuada, cuerpo docente calificado y mecanismos de mejora continua. Además, la acreditación regional favorece la movilidad de estudiantes y profesionales, así como el reconocimiento mutuo de títulos en el MERCOSUR.
            </p>
            <p>
              En la <strong>Universidad Mayor de San Simón (UMSS)</strong>, este proceso es liderado y gestionado por la <strong>Dirección Universitaria de Evaluación y Acreditación (DUEA)</strong>, unidad encargada de acompañar a las carreras durante todas las etapas de autoevaluación, evaluación externa y seguimiento, en cumplimiento de los requisitos del ARCU-SUR y del <strong>Comité Universitario Boliviano (CUB)</strong>.
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