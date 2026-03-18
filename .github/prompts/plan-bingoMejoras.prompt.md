# Lista de tareas — Mejoras al proyecto Bingo

Hallazgos tras revisión de src/Bingo/

## Seguridad (crítico)
1. ✅ Contraseña de admin hardcodeada en `useAdminAuth.js` → movida a `.env.local` como hash SHA-256 (`VITE_BINGO_ADMIN_PASSWORD_HASH`); comparación vía `hashPassword()` (Web Crypto API).
2. ✅ Contraseñas de gestor en texto plano → `setGestorPassword` en `useGameManager` ahora guarda el hash; `GestorLogin` y `useGestorAuth` hashean el input antes de comparar.
3. ✅ Comparación de contraseñas sin hashing → resuelto junto con #2.
4. ✅ Sesión de jugador sin expiración → añadido `expiresAt` (8 h) en `loginPlayer` y verificación en `checkStoredPlayer`.

## Bugs / código problemático
5. ✅ `window.location.reload()` en `GestorLogin.jsx` → eliminado; `ProtectedBingoGestor` ahora pasa `loginGestor` como prop `onLogin`; al hacer login la instancia correcta de `useGestorAuth` actualiza `isAuthenticated` y React re-renderiza sin necesidad de recarga.
6. ✅ `console.log` de debug en `CalledNumbersStrip` (`BingoPlayer.jsx`) → `useEffect` de debug eliminado.
7. ✅ 7+ `console.log` en `SocketContext.jsx` → eliminados todos (se conservan `console.error` para errores reales).
8. ✅ `console.log` extra en `useGestorAuth.js` y `GestorLogin.jsx` → eliminados del flujo de login/sesión.
9. ✅ Cartón Aleatorio en `BingoMain.jsx` recalculaba `Math.random()` en cada render → estabilizado con `useState(() => Math.floor(Math.random() * 1200) + 1)`.
10. ✅ `BingoControls.jsx` instanciaba `useBingo` propio → eliminado; ahora acepta `onDrawNumber` y `calledNumbers` como props; `useGestorGame` expone `handleDrawNumber`; `BingoGestor` y `BingoMain` pasan los props correctos.

## Duplicación de código
11. ✅ `generateBingoCard()` duplicada en `useBingo.js` y `cardsGenerator.js` → exportada de `cardsGenerator.js` (`export function generateBingoCard`); `useBingo.js` la importa y elimina la copia local (la versión de `cardsGenerator` es la correcta: rastrea duplicados por columna, no por fila).
12. ✅ Lógica de verificación de patrones duplicada entre `checkBingo` (useBingo.js) y `checkWinPattern` (useGameManager.js, con bug de mapeo `num-1`) → creada `src/Bingo/utils/checkWinPattern.js` con `checkCardPattern(card, calledNumbers, pattern)` (mapeo correcto por posición 5×5) y `checkBingo(card, calledNumbers)`; `useGameManager` elimina su callback roto y re-exporta `checkCardPattern`; `useGestorGame` usa `checkCardPattern` directamente (eliminando la recolección intermedia de `markedNumbers`); `useBingo` usa el `checkBingo` de la utilidad.
13. ✅ `getColumnLetter()` duplicada en `BingoPlayer.jsx` (×2) y `NumberDisplay.jsx` → creada `src/Bingo/utils/bingoUtils.js` con `getColumnLetter(num)` y `getColumnColor(num)`; ambos componentes importan desde la utilidad y eliminan sus copias locales.

## Arquitectura / diseño
14. ✅ `useGestorGame.js` monolítico (~400 líneas) → creado `src/Bingo/hooks/useGestorGameState.js` que encapsula los 3 `useReducer` (game, winner, gestorUi) con sus estados iniciales, setters y `mergeReducer`; `useGestorGame.js` lo importa con `useGestorGameState()` y queda reducido en ~40 líneas eliminando toda la maquinaria de estado.
15. ✅ localStorage sin recuperación ante corrupción → `useGameManager.js`: `JSON.parse` en `useEffect` inicial envuelto en `try/catch` que llama `localStorage.removeItem` si falla; `useGestorGame.js`: creada función de módulo `safeGetAssignments()` con `try/catch` usada en los 4 handlers que acceden a `bingoAssignments` (`handleMarkWinner`, `handleTogglePaid`, `handleSaveRaffleConfig`, `handleResetRaffle`).
16. ✅ No existía ruta 404 → creada `src/pages/NotFound.jsx` (página con Tailwind + Link a home); `App.jsx` añade lazy import y `<Route path="*" element={<NotFound />}>` al final de las rutas internas (con Navbar/Footer), cubriendo tanto rutas de portfolio inexistentes como sub-rutas desconocidas de Bingo/Fichas.
17. ✅ `BingoPlayer.jsx` importaba `bingoCards.json` (1200 cartones) estáticamente → eliminado el import estático; `generatePlayerCardFromNumber` usa `import('../data/bingoCards.json')` dinámico para que Vite lo excluya del bundle inicial y lo cargue sólo cuando el jugador necesita su cartón.

## Tests faltantes
18. ✅ No hay ningún test para componentes de Bingo → creado `src/Bingo/__tests__/AdminLogin.test.jsx` (7 casos: render, botón deshabilitado, habilita al escribir, llama a onLogin, muestra error en fallo, no muestra error en éxito, toggle de visibilidad de contraseña).
19. ✅ No hay tests para hooks/utilidades críticos → creados `src/Bingo/__tests__/checkWinPattern.test.js` (15 casos para `checkBingo` y `checkCardPattern`, funciones puras) y `src/Bingo/__tests__/useGameManager.test.js` (7 casos: estado inicial, carga desde localStorage, JSON corrupto, createGame, persistencia, deleteGame, getGameById).
20. ✅ `PlayerLogin.test.jsx` con nombre confuso → renombrado a `src/__tests__/FichasPlayerLogin.test.jsx` con `describe('PlayerLogin (Fichas)')` para dejar claro que prueba el componente de Fichas, no de Bingo.

## UX / funcionalidad
21. ✅ Al detectar múltiples ganadores automáticamente, no había forma de descartarlos individualmente → `GestorWinnersAlert` en `BingoGestor.jsx` añade botón "Descartar" por cada ganador (junto al de "Confirmar"); `useGestorGame.js` expone `handleDismissWinner(key)` que elimina el ganador de `autoDetectedWinners` sin marcarlo en localStorage; al confirmar con `handleMarkWinner` también se elimina de la lista automáticamente.
22. ✅ Indicador offline usaba `socket.connected` (propiedad mutable no reactiva) → corregido a `isConnected` (React state) tanto en `SocketContext.jsx` como en `BingoGestor.jsx`; `channel.onerror` ahora también pone `isConnected(false)`; añadidos listeners `window offline/online` para detectar corte de red del navegador; indicador convertido de inline-styles a clases Tailwind; `useGestorGame` expone `isConnected` del hook `useSocket`.
23. ✅ Heartbeat reconectaba cada 5s incluso con la pestaña en segundo plano → añadido `if (document.visibilityState === 'hidden') return;` al inicio del callback del `setInterval`; el intervalo se sale sin ejecutar lógica de reconexión mientras la pestaña está oculta, evitando trabajo innecesario.
