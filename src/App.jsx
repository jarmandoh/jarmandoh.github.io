import React, { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Navbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const Skills = lazy(() => import('./pages/Skills'));
const Contact = lazy(() => import('./pages/Contact'));
const PoliticaDatos = lazy(() => import('./pages/PoliticaDatos'));
const BingoLanding = lazy(() => import('./Bingo/pages/BingoLanding'));
const BingoCardViewer = lazy(() => import('./Bingo/pages/BingoCardViewer'));
const BingoCardsList = lazy(() => import('./Bingo/pages/BingoCardsList'));
const ProtectedBingoAdmin = lazy(() => import('./Bingo/pages/ProtectedBingoAdmin'));
const ProtectedBingoPlayer = lazy(() => import('./Bingo/pages/ProtectedBingoPlayer'));
const ProtectedBingoGestor = lazy(() => import('./Bingo/pages/ProtectedBingoGestor'));
const FichasLanding = lazy(() => import('./Fichas/pages/FichasLanding'));
const ProtectedFichasAdmin = lazy(() => import('./Fichas/pages/ProtectedFichasAdmin'));
const ProtectedFichasGestor = lazy(() => import('./Fichas/pages/ProtectedFichasGestor'));
const ProtectedFichasPlayer = lazy(() => import('./Fichas/pages/ProtectedFichasPlayer'));
const FichasSocketProvider = lazy(() => import('./Fichas/context/SocketContext').then(m => ({ default: m.FichasSocketProvider })));
import { ReservasProvider } from './Reservas/context/ReservasContext';
const ReservasLanding = lazy(() => import('./Reservas/pages/ReservasLanding'));
const ReservasCanchas = lazy(() => import('./Reservas/pages/ReservasCanchas'));
const ReservasCrear = lazy(() => import('./Reservas/pages/ReservasCrear'));
const ProtectedReservasAdmin = lazy(() => import('./Reservas/pages/ProtectedReservasAdmin'));


function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-xl">Cargando...</div>}>
            <Routes>
              {/* Ruta principal con Navbar y Footer */}
              <Route path="/*" element={
                <>
                  <Navbar />
                  <main className="grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/proyectos" element={<Projects />} />
                      <Route path="/habilidades" element={<Skills />} />
                      <Route path="/contacto" element={<Contact />} />
                      <Route path="/politica" element={<PoliticaDatos />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
              {/* Rutas independientes de Bingo sin Navbar/Footer */}
              <Route path="/bingo" element={<BingoLanding />} />
              <Route path="/bingo/admin" element={<ProtectedBingoAdmin />} />
              <Route path="/bingo/gestor" element={<ProtectedBingoGestor />} />
              <Route path="/bingo/player" element={<ProtectedBingoPlayer />} />
              <Route path="/bingo/cartones" element={<BingoCardsList />} />
              <Route path="/bingo/carton/:cardId" element={<BingoCardViewer />} />
              {/* Rutas independientes del Juego de Fichas */}
              <Route path="/fichas" element={<FichasLanding />} />
              <Route path="/fichas/player" element={<FichasSocketProvider><ProtectedFichasPlayer /></FichasSocketProvider>} />
              <Route path="/fichas/admin" element={<FichasSocketProvider><ProtectedFichasAdmin /></FichasSocketProvider>} />
              <Route path="/fichas/gestor" element={<FichasSocketProvider><ProtectedFichasGestor /></FichasSocketProvider>} />
              {/* Rutas independientes del Sistema de Reservas de Canchas */}
              <Route path="/reservas" element={<ReservasProvider><ReservasLanding /></ReservasProvider>} />
              <Route path="/reservas/canchas" element={<ReservasProvider><ReservasCanchas /></ReservasProvider>} />
              <Route path="/reservas/reserva/crear" element={<ReservasProvider><ReservasCrear /></ReservasProvider>} />
              <Route path="/reservas/admin" element={<ReservasProvider><ProtectedReservasAdmin /></ReservasProvider>} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App
