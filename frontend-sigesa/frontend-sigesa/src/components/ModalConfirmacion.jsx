import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import '../styles/ModalConfirmacion.css';

export default function ModalConfirmacion({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo = "¿Confirmar edición?",
  mensaje = "¿Estás seguro de que deseas guardar los cambios?",
  loading = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-confirmacion-edicion-overlay">
      <div className="modal-confirmacion-edicion-container">
        <div className="modal-confirmacion-edicion-header">
          <div className="modal-confirmacion-edicion-icon">
            <AlertTriangle size={24} />
          </div>
          <button 
            className="modal-confirmacion-edicion-close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-confirmacion-edicion-content">
          <h3 className="modal-confirmacion-edicion-title">{titulo}</h3>
          <p className="modal-confirmacion-edicion-message">{mensaje}</p>
        </div>

        <div className="modal-confirmacion-edicion-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                <span>Guardando...</span>
              </>
            ) : (
              'Confirmar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}