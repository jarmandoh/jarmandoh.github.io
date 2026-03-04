import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Accesibilidad: roles y ARIA
  const handleSmoothScroll = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    closeMenu();
  };

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      setIsOpen(true);
    }
  };

  const navLinks = [
    { label: 'Acerca', id: 'acerca' },
    { label: 'Habilidades', id: 'habilidades' },
    { label: 'Proyectos', id: 'proyectos' },
    { label: 'Contacto', id: 'contacto' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? 'bg-gray-900/40 backdrop-blur-md border-white/10 shadow-lg shadow-black/20'
          : 'bg-transparent border-transparent'
      }`}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16">
        {/* Navegación Desktop */}
        <div className="md:flex justify-between items-center h-full col-hid">
          {/* Logotipo/Nombre */}
          <ScrollLink to="/" className="text-2xl font-bold text-indigo-400 shrink-0">
            Janier Hernandez
          </ScrollLink>
          
          {/* Enlaces de Navegación (Desktop) */}
          <div className="flex space-x-6" role="menubar" aria-label="Secciones principales">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleSmoothScroll(e, link.id)}
                className={`transition duration-300 font-medium hover:text-indigo-400 ${scrolled ? 'text-gray-200' : 'text-[#07303E]'}`}
                role="menuitem"
                aria-label={link.label}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Navegación Mobile */}
        <div className="md:hidden">
          <div className="flex justify-between items-center h-16">
            {/* Logotipo/Nombre */}
            <ScrollLink to="/" className="text-2xl font-bold text-indigo-400 shrink-0">
              Janier Hernandez
            </ScrollLink>
            
            {/* Botón Hamburguesa */}
            <button
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-md hover:text-indigo-400 hover:bg-white/10 focus:outline-none transition duration-300 ${scrolled ? 'text-gray-200' : 'text-[#07303E]'}`}
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <FontAwesomeIcon 
                icon={isOpen ? faTimes : faBars} 
                className="h-6 w-6" 
              />
            </button>
          </div>

          {/* Menú Mobile Desplegable */}
          {isOpen && (
            <div
              id="mobile-menu"
              className={`border-t border-white/10 shadow-lg shadow-black/30 rounded-es-xl rounded-ee-xl bg-gray-900/60 backdrop-blur-md overflow-hidden ${isClosing ? 'slide-up' : 'slide-down'}`}
              role="menu"
              aria-label="Menú móvil"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map((link, idx) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => handleSmoothScroll(e, link.id)}
                    className="block px-3 py-2 rounded-md text-gray-200 hover:text-indigo-400 hover:bg-white/10 transition duration-300 font-medium"
                    role="menuitem"
                    aria-label={link.label}
                    onKeyDown={(e) => {
                      // Navegación con flechas para accesibilidad
                      if (e.key === 'ArrowDown') {
                        const next = document.querySelectorAll('#mobile-menu [role="menuitem"]')[idx + 1];
                        if (next) next.focus();
                      }
                      if (e.key === 'ArrowUp') {
                        const prev = document.querySelectorAll('#mobile-menu [role="menuitem"]')[idx - 1];
                        if (prev) prev.focus();
                      }
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;