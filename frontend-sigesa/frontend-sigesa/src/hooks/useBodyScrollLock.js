import { useEffect } from 'react';

/**
 * Hook personalizado para controlar el scroll del body cuando un modal está abierto
 * @param {boolean} isOpen - Estado que indica si el modal está abierto
 */
const useBodyScrollLock = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY;
      document.body.classList.add('modal-open');
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Restaurar la posición del scroll
      const scrollY = document.body.style.top;
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function
    return () => {
      const scrollY = document.body.style.top;
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen]);
};

export default useBodyScrollLock;