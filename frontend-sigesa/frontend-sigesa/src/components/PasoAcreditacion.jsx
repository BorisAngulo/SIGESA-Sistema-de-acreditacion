import React, { useState } from 'react';
import './PasoAcreditacion.css';

const PasosAcreditacion = ({ mascota = "https://via.placeholder.com/200x150?text=Mascota+SIGESA" }) => {
  const [certificadoActivo, setCertificadoActivo] = useState('acreditacion');

  const certificados = {
    acreditacion: {
      titulo: 'Pasos para Obtener tu Certificado de Acreditación de Carrera',
      pasos: [
        {
          numero: 1,
          titulo: 'Descarga el Formulario',
          descripcion: 'Desde la sección de documentos oficiales, descarga el formulario específico para acreditación de carrera.'
        },
        {
          numero: 2,
          titulo: 'Llena y Firma',
          descripcion: 'Asegúrate de completar todos tus datos correctamente y firma el documento.'
        },
        {
          numero: 3,
          titulo: 'Reúne la Documentación',
          descripcion: 'Junta todos los documentos requeridos: título original, cédula de identidad, y certificado de notas.'
        },
        {
          numero: 4,
          titulo: 'Presenta la Documentación',
          descripcion: 'Acércate a las oficinas de SIGESA con toda la documentación completa.'
        },
        {
          numero: 5,
          titulo: 'Pago de Aranceles',
          descripcion: 'Realiza el pago correspondiente según la tarifa vigente establecida.'
        },
        {
          numero: 6,
          titulo: 'Seguimiento del Proceso',
          descripcion: 'Mantente al tanto del estado de tu solicitud a través del sistema en línea.'
        }
      ]
    },
    homologacion: {
      titulo: 'Pasos para Obtener tu Certificado de Homologación de Carrera',
      pasos: [
        {
          numero: 1,
          titulo: 'Solicitud de Homologación',
          descripcion: 'Completa el formulario de solicitud de homologación disponible en línea.'
        },
        {
          numero: 2,
          titulo: 'Documentos Académicos',
          descripcion: 'Presenta pensum de estudios, certificado de notas y título original apostillado.'
        },
        {
          numero: 3,
          titulo: 'Evaluación Curricular',
          descripcion: 'Espera la evaluación del contenido curricular por parte del comité técnico.'
        },
        {
          numero: 4,
          titulo: 'Examen de Suficiencia',
          descripcion: 'Si es requerido, presenta el examen de suficiencia académica.'
        },
        {
          numero: 5,
          titulo: 'Resolución Final',
          descripcion: 'Recibe la resolución de homologación y el certificado correspondiente.'
        }
      ]
    },
    participacion: {
      titulo: 'Pasos para Obtener tu Certificado de Participación en Acreditación',
      pasos: [
        {
          numero: 1,
          titulo: 'Registro de Participación',
          descripcion: 'Regístrate en el proceso de acreditación como participante activo.'
        },
        {
          numero: 2,
          titulo: 'Asistencia a Talleres',
          descripcion: 'Participa en todos los talleres y sesiones programadas del proceso.'
        },
        {
          numero: 3,
          titulo: 'Cumplimiento de Actividades',
          descripcion: 'Completa todas las actividades asignadas durante el proceso de acreditación.'
        },
        {
          numero: 4,
          titulo: 'Evaluación de Participación',
          descripcion: 'Somete tu participación a evaluación por parte de los coordinadores.'
        },
        {
          numero: 5,
          titulo: 'Emisión del Certificado',
          descripcion: 'Recibe tu certificado de participación una vez aprobada tu participación.'
        }
      ]
    }
  };

  const botonesConfig = [
    {
      key: 'acreditacion',
      texto: 'Certificado de Acreditación de Carrera',
      clase: 'pa-btn-rojo'
    },
    {
      key: 'homologacion',
      texto: 'Certificado de Homologación de Carrera',
      clase: 'pa-btn-azul'
    },
    {
      key: 'participacion',
      texto: 'Certificado de Participación en Acreditación',
      clase: 'pa-btn-gris'
    }
  ];

  const certificadoSeleccionado = certificados[certificadoActivo];

  return (
    <div className="pa-container">
      {/* Mascota */}
      <div className="pa-mascota">
        <img src={mascota} alt="Mascota SIGESA" className="pa-img" />
      </div>

      {/* Botones de Certificados */}
      <div className="pa-botones">
        {botonesConfig.map((boton) => (
          <button
            key={boton.key}
            onClick={() => setCertificadoActivo(boton.key)}
            className={`pa-btn ${boton.clase} ${certificadoActivo === boton.key ? 'pa-btn-activo' : ''}`}
          >
            <span className="pa-btn-texto">{boton.texto}</span>
          </button>
        ))}
      </div>

      {/* Título del Certificado Seleccionado */}
      <h3 className="pa-titulo">
        {certificadoSeleccionado.titulo}
      </h3>

      {/* Pasos */}
      <div className="pa-pasos-container">
        {certificadoSeleccionado.pasos.map((paso, index) => (
          <div key={index} className="pa-paso">
            <div className="pa-paso-contenido">
              <div className="pa-paso-numero">
                <div className="pa-numero-circulo">
                  {paso.numero}
                </div>
              </div>
              <div className="pa-paso-info">
                <h4 className="pa-paso-titulo">
                  Paso {paso.numero}: {paso.titulo}
                </h4>
                <p className="pa-paso-descripcion">
                  {paso.descripcion}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicador de pasos */}
      <div className="pa-indicador">
        <div className="pa-indicador-contenido">
          <span className="pa-indicador-texto">
            Total de pasos: {certificadoSeleccionado.pasos.length}
          </span>
          <div className="pa-indicador-puntos">
            {certificadoSeleccionado.pasos.map((_, index) => (
              <div key={index} className="pa-punto" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasosAcreditacion;