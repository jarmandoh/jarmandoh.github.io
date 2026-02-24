import React from 'react';

export default function FooterPresentational({ year }) {
  return (
    <footer className="bg-gray-800 text-gray-400 py-6" role="contentinfo" aria-label="Pie de página">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
        <p>&copy; {year} Janier Hernandez | Desarrollador Fullstack. Diseñado con Tailwind CSS.</p>
      </div>
    </footer>
  );
}
