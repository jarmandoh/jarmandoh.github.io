import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faTrophy,
  faUsers,
  faDice
} from '@fortawesome/free-solid-svg-icons';
import RoleCard from '../components/RoleCard';
import { rolesConfig } from '../data/rolesConfig';
import { GoogleGenAI } from "@google/genai";

// Obtener la API key desde variable de entorno
const GOOGLE_GENAI_API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;


const BingoLanding = () => {
  useEffect(() => {
    document.title = 'Bingo | Selecciona tu Rol';
  }, []);

  // IA
  const ai = new GoogleGenAI({ apiKey: GOOGLE_GENAI_API_KEY });

  async function consultarAI(prompt) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    console.log(response.text);
  }

  // Ejemplo de uso
  useEffect(() => {
    consultarAI("puedes darme la hora?");
  }, []);
  

  // FIN IA
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-200 via-pink-100 to-blue-200">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center font-medium"
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              ← Volver al Portfolio
            </Link>
          </div>

          {/* Hero Section */}
          <div className="text-center">
            <div className="mb-8">
              <div className="text-8xl mb-4">🎱</div>
              <h1 className="text-6xl font-bold text-gray-800 mb-4 drop-shadow-lg">
                ¡¡¡ BINGO !!!
              </h1>
              <p className="text-2xl text-gray-700 font-medium max-w-2xl mx-auto">
                Plataforma completa de Bingo en línea con gestión profesional y experiencia de juego inmersiva
              </p>
            </div>

            {/* Estadísticas */}
            <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <FontAwesomeIcon icon={faDice} className="text-4xl text-yellow-600 mb-3" />
                <div className="text-3xl font-bold text-gray-800">1,200</div>
                <div className="text-gray-600">Cartones Únicos</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <FontAwesomeIcon icon={faUsers} className="text-4xl text-green-600 mb-3" />
                <div className="text-3xl font-bold text-gray-800">∞</div>
                <div className="text-gray-600">Jugadores Simultáneos</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <FontAwesomeIcon icon={faTrophy} className="text-4xl text-orange-600 mb-3" />
                <div className="text-3xl font-bold text-gray-800">Real Time</div>
                <div className="text-gray-600">Detección de Ganadores</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Options */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Elige tu Rol
          </h2>
          <p className="text-xl text-gray-700">
            Accede según tu función: administrador, gestor de sorteo o jugador
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {rolesConfig.map((roleData) => (
            <RoleCard
              key={roleData.id}
              {...roleData}
            />
          ))}
        </div>

      </div>

      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-white/5 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default BingoLanding;