import { useEffect, useRef, useState } from 'react';

const DIRECTIONS = ['scroll-animate', 'scroll-animate-left', 'scroll-animate-right'];

/** Devuelve una clase de dirección aleatoria. */
export const randomDirection = () => DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

/**
 * Hook que detecta cuando un elemento entra al viewport y devuelve
 * un ref para adjuntar al elemento y un booleano `isVisible`.
 * Al entrar, desconecta el observer (la animación ocurre una sola vez).
 */
export const useScrollAnimation = (threshold = 0.12) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};
