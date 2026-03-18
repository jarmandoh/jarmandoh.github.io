import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
    <span className="text-8xl font-black text-gray-200 select-none">404</span>
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Página no encontrada</h1>
      <p className="text-gray-500">La dirección que buscas no existe o fue movida.</p>
    </div>
    <Link
      to="/"
      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
    >
      Volver al inicio
    </Link>
  </div>
);

export default NotFound;
