# Pruebas Automatizadas en el Proyecto

Este proyecto utiliza **Jest** y **React Testing Library** para pruebas unitarias y de componentes en el frontend.

## ¿Dónde están los tests?
- Los archivos de pruebas se ubican en `src/__tests__/` y pueden tener extensión `.test.jsx` o `.spec.jsx`.
- Puedes crear más tests en esa carpeta o junto a los componentes, siguiendo el mismo patrón.

## ¿Cómo ejecutar los tests?

Desde la raíz del proyecto, ejecuta:

```
npx jest
```

O para correr un test específico:

```
npx jest src/__tests__/PlayerLogin.test.jsx
```

## ¿Qué cubre el ejemplo?
- El archivo `PlayerLogin.test.jsx` prueba el componente de login de jugador, validando errores y el flujo de login exitoso.

## Buenas prácticas
- Crea un archivo de test por cada componente importante.
- Usa `describe` para agrupar tests relacionados.
- Usa `beforeEach` para preparar el entorno si es necesario.
- Simula interacciones reales del usuario con `@testing-library/user-event`.
- Usa `jest.fn()` para mockear funciones y verificar llamadas.

## Recursos útiles
- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

¿Dudas o sugerencias? ¡Comenta en este archivo o en el canal del equipo!
