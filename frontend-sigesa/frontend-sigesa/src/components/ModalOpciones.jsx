import React from 'react';
import { Eye, UserPlus, BarChart3, Trash2, MoreVertical, Settings, Edit2 } from 'lucide-react';
import './ModalOpciones.css';

const ModalOpciones = ({
  isVisible,
  onToggle,
  // Props para Facultades
  onVerCarreras,
  onAgregarCarrera,
  onEditarFacultad,
  onEliminarFacultad,
  numeroCarreras,
  facultadId,
  facultadNombre,
  // Props para Carreras
  onVerInformacion,
  onGestionarModalidades,
  onEditarCarrera,
  onEliminarCarrera,
  carreraId,
  carreraNombre,
  // Tipo de modal
  tipo = 'facultad'
}) => {
  const handleOptionClick = (action) => {
    action();
    onToggle();
  };

  const renderFacultadOptions = () => (
    <>
      <button 
        className="dropdown-item view"
        type="button"
        onClick={() => handleOptionClick(() => onVerCarreras(facultadId))}
      >
        <Eye size={16} />
        <span>Ver Carreras ({numeroCarreras})</span>
      </button>
      
      <button 
        className="dropdown-item add"
        type="button"
        onClick={() => handleOptionClick(() => onAgregarCarrera(facultadId))}
      >
        <UserPlus size={16} />
        <span>Añadir Carrera</span>
      </button>
      
      <button 
        className="dropdown-item edit"
        type="button"
        onClick={() => handleOptionClick(() => onEditarFacultad(facultadId))}
      >
        <Edit2 size={16} />
        <span>Editar Información</span>
      </button>
      
      <button 
        className="dropdown-item report"
        type="button"
        onClick={() => handleOptionClick(() => console.log('Generar reportes'))}
      >
        <BarChart3 size={16} />
        <span>Generar Reportes</span>
      </button>
      
      <button 
        className="dropdown-item delete"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOptionClick(() => onEliminarFacultad(facultadId, facultadNombre));
        }}
      >
        <Trash2 size={16} />
        <span>Eliminar Facultad</span>
      </button>
    </>
  );

  const renderCarreraOptions = () => (
    <>
      <button 
        className="dropdown-item view"
        type="button"
        onClick={() => handleOptionClick(() => onVerInformacion(carreraId))}
      >
        <Eye size={16} />
        <span>Ver Información</span>
      </button>
      
      <button 
        className="dropdown-item add"
        type="button"
        onClick={() => handleOptionClick(() => onGestionarModalidades(carreraId))}
      >
        <Settings size={16} />
        <span>Gestionar Modalidades</span>
      </button>
      
      <button 
        className="dropdown-item edit"
        type="button"
        onClick={() => handleOptionClick(() => onEditarCarrera(carreraId))}
      >
        <Edit2 size={16} />
        <span>Editar Carrera</span>
      </button>
      
      <button 
        className="dropdown-item delete"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOptionClick(() => onEliminarCarrera(carreraId, carreraNombre));
        }}
      >
        <Trash2 size={16} />
        <span>Eliminar Carrera</span>
      </button>
    </>
  );

  return (
    <div className="menu-toggle-container">
      <button 
        className="menu-toggle"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <MoreVertical size={20} />
      </button>
      
      {isVisible && (
        <div 
          className="dropdown-menu"
          onClick={(e) => e.stopPropagation()}
        >
          {tipo === 'facultad' ? renderFacultadOptions() : renderCarreraOptions()}
        </div>
      )}
    </div>
  );
};

export default ModalOpciones;