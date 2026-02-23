# Cobertura de tests faltante (feb 2026)

**Hero.jsx**
- Líneas 21-30: Bloque de párrafo y botones, ya cubierto en lógica principal. No hay props alternativos.

**Navbar.jsx**
- Línea 14: Inicialización (sin props alternativos).
- Líneas 58-65: Lógica de cierre de menú y animación (`setIsClosing`, `setTimeout`).
- Línea 111: Menú móvil, ramas de navegación por teclado (casos límite).
- Ramas: Estados de menú abierto/cerrado, animación de cierre, navegación por teclado en todos los items.

**ContactSection.jsx**
- Línea 21: Validaciones y errores (solo cubierto el flujo de éxito).

**Otros**
- BannerComponent.jsx, ImageComponent.jsx, Footer.jsx, PlayerLogin.jsx: 100% cubiertos.

**Resumen:**
- Faltan ramas de animación y cierre en Navbar.
- Casos límite de navegación por teclado en Navbar.
- Validaciones y errores en ContactSection.
- No hay props alternativos en los componentes actuales.
