import React, { useEffect, useState } from "react";
import { getFacultades } from "../services/api";
import { Search, Plus, Eye, UserPlus, BarChart3, Trash2, MoreVertical } from "lucide-react";
import mascota from "../assets/mascota.png";
import "./FacultadScreen.css";

export default function FacultadScreen() {
  const [facultades, setFacultades] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [opcionesVisibles, setOpcionesVisibles] = useState(null);

  useEffect(() => {
    getFacultades().then(setFacultades);
  }, []);

  const handleToggleOpciones = (id) => {
    setOpcionesVisibles(opcionesVisibles === id ? null : id);
  };

  // Cerrar menú al hacer clic fuera
  const handleOutsideClick = () => {
    setOpcionesVisibles(null);
  };

  // Función para eliminar facultad
  const handleEliminarFacultad = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la facultad "${nombre}"?`)) {
      setFacultades(facultades.filter(f => f.id !== id));
      setOpcionesVisibles(null);
      // Aquí puedes agregar la llamada a la API para eliminar
      // deleteFacultad(id);
    }
  };

  // Función para agregar nueva facultad
  const handleAgregarFacultad = () => {
    // Aquí puedes agregar la lógica para mostrar modal o navegar a formulario
    alert("Funcionalidad para agregar facultad - Implementar modal o navegación");
  };

  const filteredFacultades = facultades.filter((f) =>
    f.nombre_facultad.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Colores para las tarjetas
  const cardColors = [
    '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec', 
    '#e0f2f1', '#f1f8e9', '#fff8e1', '#e8eaf6', '#fafafa'
  ];

  return (
    <div className="facultades-view" onClick={handleOutsideClick}>
      {/* Buscador */}
      <section className="busqueda-section">
        <h2 className="search-title">Búsqueda por Facultades</h2>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por facultad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Search className="search-icon" size={20} />
        </div>
      </section>

      {/* Header con mascota y botón */}
      <div className="header-actions">
        <div className="mascota-container">
          <img src={mascota} alt="mascota" className="mascota-img" />
          <span className="mascota-message">¡Gestiona tus facultades!</span>
        </div>
        <button className="btn-agregar-facultad" onClick={handleAgregarFacultad}>
          <Plus size={20} />
          <span>Añadir Facultad</span>
        </button>
      </div>

      {/* Lista de facultades */}
      <section className="facultades-list">
        {filteredFacultades.map((f, index) => (
          <div 
            key={f.id} 
            className="faculty-card-horizontal"
            style={{ backgroundColor: cardColors[index % cardColors.length] }}
          >
            <img
              src={`/logos/${f.codigo_facultad}.png`}
              alt={f.nombre_facultad}
              className="faculty-logo"
            />
            <div className="faculty-info">
              <h3>{f.nombre_facultad}</h3>
              <ul>
                <li><strong>Carreras:</strong> {f.carreras || 0}</li>
                <li><strong>Acreditadas:</strong> {f.acreditadas || 0}</li>
                <li><strong>En proceso:</strong> {f.en_proceso || 0}</li>
                <li><strong>Renovación:</strong> {f.renovacion || 0}</li>
              </ul>
            </div>

            {/* Menú de acciones mejorado */}
            <div className="menu-toggle-container">
              <button 
                className="menu-toggle" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleOpciones(f.id);
                }}
              >
                <MoreVertical size={20} />
              </button>
              {opcionesVisibles === f.id && (
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item view">
                    <Eye size={16} />
                    <span>Ver Carreras</span>
                  </a>
                  <a href="#" className="dropdown-item add">
                    <UserPlus size={16} />
                    <span>Añadir Carrera</span>
                  </a>
                  <a href="#" className="dropdown-item report">
                    <BarChart3 size={16} />
                    <span>Generar Reportes</span>
                  </a>
                  <button 
                    className="dropdown-item delete"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEliminarFacultad(f.id, f.nombre_facultad);
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Eliminar Facultad</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredFacultades.length === 0 && (
          <div className="no-results">
            <Search size={48} className="no-results-icon" />
            <p>No se encontraron facultades que coincidan con tu búsqueda.</p>
          </div>
        )}
      </section>
    </div>
  );
}