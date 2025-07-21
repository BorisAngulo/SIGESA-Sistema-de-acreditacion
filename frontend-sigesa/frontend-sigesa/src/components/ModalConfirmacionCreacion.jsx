import React from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

const ModalConfirmacionCreacion = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo = "Confirmar acción",
  mensaje = "¿Estás seguro de realizar esta acción?",
  datosAMostrar = null,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  isLoading = false
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header-content">
            <AlertTriangle className="modal-icon" />
            <h3 className="modal-title">{titulo}</h3>
          </div>
          <button 
            className="modal-close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="close-icon" />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-message">{mensaje}</p>
          
          {datosAMostrar && (
            <div className="modal-data-container">
              <div className="modal-data-header">
                <CheckCircle className="data-icon" />
                <span>Datos a registrar:</span>
              </div>
              <div className="modal-data-content">
                {datosAMostrar.nombre && (
                  <div className="data-item">
                    <span className="data-label">Nombre:</span>
                    <span className="data-value">{datosAMostrar.nombre}</span>
                  </div>
                )}
                {datosAMostrar.codigo && (
                  <div className="data-item">
                    <span className="data-label">Código:</span>
                    <span className="data-value">{datosAMostrar.codigo}</span>
                  </div>
                )}
                {datosAMostrar.pagina_web && (
                  <div className="data-item">
                    <span className="data-label">Página Web:</span>
                    <span className="data-value">{datosAMostrar.pagina_web}</span>
                  </div>
                )}
                {datosAMostrar.logo && (
                  <div className="data-item">
                    <span className="data-label">Logo:</span>
                    <span className="data-value">Archivo seleccionado</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="modal-button modal-button-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {textoCancelar}
          </button>
          <button 
            className="modal-button modal-button-confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner-small"></div>
                Procesando...
              </>
            ) : (
              textoConfirmar
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          background-color: #fef2f2;
        }

        .modal-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-icon {
          width: 24px;
          height: 24px;
          color: #dc2626;
        }

        .modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #dc2626;
        }

        .modal-close-button {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-button:hover:not(:disabled) {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .modal-close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .close-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-message {
          margin: 0 0 20px 0;
          color: #374151;
          font-size: 16px;
          line-height: 1.5;
        }

        .modal-data-container {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }

        .modal-data-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-weight: 600;
          color: #059669;
        }

        .data-icon {
          width: 18px;
          height: 18px;
          color: #059669;
        }

        .modal-data-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .data-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .data-item:last-child {
          border-bottom: none;
        }

        .data-label {
          font-weight: 500;
          color: #4b5563;
        }

        .data-value {
          color: #111827;
          font-weight: 600;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        .modal-footer {
          padding: 16px 24px 24px;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          border-top: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }

        .modal-button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .modal-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .modal-button-cancel {
          background-color: white;
          color: #4b5563;
          border: 1px solid #d1d5db;
        }

        .modal-button-cancel:hover:not(:disabled) {
          background-color: #f9fafb;
          border-color: #9ca3af;
        }

        .modal-button-confirm {
          background-color: #dc2626;
          color: white;
        }

        .modal-button-confirm:hover:not(:disabled) {
          background-color: #b91c1c;
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .modal-container {
            width: 95%;
            margin: 20px;
          }
          
          .modal-header {
            padding: 16px 20px;
          }
          
          .modal-body {
            padding: 20px;
          }
          
          .modal-footer {
            padding: 12px 20px 20px;
            flex-direction: column-reverse;
          }
          
          .modal-button {
            width: 100%;
            justify-content: center;
          }
          
          .data-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .data-value {
            max-width: 100%;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default ModalConfirmacionCreacion;