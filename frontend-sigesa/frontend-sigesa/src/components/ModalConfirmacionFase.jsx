import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ModalConfirmacionFase = ({ isOpen, onClose, onConfirm, faseNombre, loading = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setIsValid(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsValid(inputValue.toLowerCase().trim() === faseNombre.toLowerCase().trim());
  }, [inputValue, faseNombre]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && !loading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  useEffect(() => {
    if (!document.getElementById('modal-animations')) {
      const style = document.createElement('style');
      style.id = 'modal-animations';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: scale(0.95) translateY(-10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    },
    container: {
      background: 'white',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
      animation: 'slideIn 0.3s ease-out',
      position: 'relative'
    },
    header: {
      padding: '24px 24px 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    iconContainer: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#FEF2F2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      cursor: loading ? 'not-allowed' : 'pointer',
      color: '#6B7280',
      padding: '4px',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: loading ? 0.5 : 1
    },
    content: {
      padding: '16px 24px 24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 12px 0'
    },
    description: {
      color: '#6B7280',
      lineHeight: '1.6',
      margin: '0 0 24px 0'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '12px 16px',
      border: `2px solid ${isValid ? '#10B981' : '#D1D5DB'}`,
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      backgroundColor: isValid ? '#F0FDF4' : '#fff',
      opacity: loading ? 0.6 : 1,
      cursor: loading ? 'not-allowed' : 'text'
    },
    inputError: {
      color: '#DC2626',
      fontSize: '14px',
      marginTop: '4px'
    },
    actions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      flexWrap: 'wrap'
    },
    btnCancel: {
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '14px',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid #D1D5DB',
      backgroundColor: '#F9FAFB',
      color: '#374151',
      opacity: loading ? 0.6 : 1
    },
    btnDelete: {
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '14px',
      cursor: (!isValid || loading) ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      backgroundColor: (!isValid || loading) ? '#D1D5DB' : '#DC2626',
      color: (!isValid || loading) ? '#9CA3AF' : 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <AlertTriangle color="#DC2626" size={24} />
          </div>
          <button 
            style={styles.closeBtn}
            onClick={handleClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          <h3 style={styles.title}>Confirmar Eliminación de Fase</h3>
          <p style={styles.description}>
            Esta acción no se puede deshacer. Se eliminará permanentemente la fase{' '}
            <strong>"{faseNombre}"</strong> y todas sus sub-fases asociadas.
          </p>
          
          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="confirmInput" style={styles.label}>
                Para confirmar, escribe el nombre exacto de la fase:
              </label>
              <input
                id="confirmInput"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={faseNombre}
                style={styles.input}
                disabled={loading}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              {inputValue && !isValid && (
                <span style={styles.inputError}>
                  El nombre no coincide
                </span>
              )}
            </div>

            <div style={styles.actions}>
              <button
                type="button"
                style={styles.btnCancel}
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                style={styles.btnDelete}
                disabled={!isValid || loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <>
                    <div style={styles.spinner}></div>
                    Eliminando fase...
                  </>
                ) : (
                  'Eliminar Fase'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacionFase;