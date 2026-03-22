import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';

/**
 * Intercepta todos los clics en enlaces internos y envuelve la navegación
 * con document.startViewTransition() para animaciones modernas entre rutas.
 */
export default function ViewTransitionInterceptor() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignorar enlaces externos, mailto, tel, hash y target blank
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        anchor.target === '_blank'
      ) return;

      // Sin soporte nativo → navegación normal de React Router
      if (!document.startViewTransition) return;

      e.preventDefault();

      document.startViewTransition(() => {
        flushSync(() => navigate(href));
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [navigate]);

  return null;
}
