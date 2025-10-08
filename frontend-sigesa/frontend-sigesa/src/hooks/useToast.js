import { toast } from 'react-toastify';

const useToast = () => {
  const showToast = (type, message, options = {}) => {
    const defaultOptions = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    };

    switch (type) {
      case 'success':
        toast.success(`✅ ${message}`, defaultOptions);
        break;
      case 'error':
        toast.error(`❌ ${message}`, {
          ...defaultOptions,
          autoClose: 5000 // Los errores duran más tiempo
        });
        break;
      case 'warning':
        toast.warning(`⚠️ ${message}`, defaultOptions);
        break;
      case 'info':
        toast.info(`ℹ️ ${message}`, defaultOptions);
        break;
      case 'celebration':
        toast.success(`🎉 ${message}`, {
          ...defaultOptions,
          autoClose: 4000
        });
        break;
      case 'deleted':
        toast.success(`🗑️ ${message}`, defaultOptions);
        break;
      case 'updated':
        toast.success(`✅ ${message}`, defaultOptions);
        break;
      case 'created':
        toast.success(`🎉 ${message}`, defaultOptions);
        break;
      default:
        toast(message, defaultOptions);
    }
  };

  // Métodos específicos para mayor comodidad
  const success = (message, options) => showToast('success', message, options);
  const error = (message, options) => showToast('error', message, options);
  const warning = (message, options) => showToast('warning', message, options);
  const info = (message, options) => showToast('info', message, options);
  const celebration = (message, options) => showToast('celebration', message, options);
  const deleted = (message, options) => showToast('deleted', message, options);
  const updated = (message, options) => showToast('updated', message, options);
  const created = (message, options) => showToast('created', message, options);

  return {
    showToast,
    success,
    error,
    warning,
    info,
    celebration,
    deleted,
    updated,
    created
  };
};

export default useToast;