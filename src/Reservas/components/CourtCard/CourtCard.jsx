import React from 'react';
import { COURT_TYPES } from '../../data/courtsConfig';
import defaultCourtImage from '../../../assets/cancha_01.jpg';

const CourtCard = ({ 
  court, 
  onSelect, 
  isSelected = false,
  showPrice = true,
  showDetails = true,
  compact = false
}) => {
  const courtType = COURT_TYPES[court.type?.toUpperCase()?.replace('-', '_')] || COURT_TYPES.FUTBOL_5;

  return (
    <div 
      onClick={() => onSelect?.(court)}
      className={`relative bg-gray-50 dark:bg-white/10 rounded-3xl overflow-hidden shadow-lg cursor-pointer ${isSelected ? 'ring-4 ring-sky-500 shadow-2xl shadow-sky-500/30 scale-[1.02]' : ''} ${compact ? 'p-4' : ''}`}
    >
      {/* Fondo decorativo (sin animación de hover) */}
      <div className="absolute inset-0 bg-linear-to-br from-sky-500/5 to-amber-500/5 opacity-0"></div>

      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute bottom-4 right-4 z-20 bg-linear-to-r from-sky-500 to-sky-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl animate-[bounce-in_0.5s_ease-out]">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Seleccionada
        </div>
      )}

      {/* Image Section */}
      {!compact && (
        <div className="relative h-48 md:h-56 bg-linear-to-br from-sky-700 to-sky-900 overflow-hidden">
          {/* Hover Overlay Effect */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 z-10"></div>
          
          <img 
            src={defaultCourtImage} 
            alt={court.name}
            className="w-full h-full object-cover"
          />
          
          {/* Decorative Corner Shape */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-amber-400/30 to-transparent transform rotate-45 translate-x-12 -translate-y-12"></div>

          {/* Court Type Badge */}
          <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20">
            <span className="text-base">{courtType.icon}</span>
            <span>{courtType.name}</span>
          </div>

        

          {/* Diagonal Accent Line */}
          <div className="absolute bottom-0 right-0 w-32 h-1 bg-linear-to-l from-amber-400 to-transparent transform origin-right group-hover:w-48 transition-all duration-500"></div>
        </div>
      )}

      {/* Content Section */}
      <div className={`relative z-10 ${compact ? '' : 'p-4 md:p-5'}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 
              className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1"
              style={{ fontFamily: "'Exo 2', sans-serif" }}
            >
              {court.name}
            </h3>
            {compact && (
              <span className="text-sm text-sky-700 dark:text-sky-400 font-semibold flex items-center gap-1">
                <span>{courtType.icon}</span>
                {courtType.name}
              </span>
            )}
          </div>
          
          {showPrice && court.pricing?.basePrice && (
            <div className="text-right bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 px-3 py-2 rounded-xl border-2 border-amber-200 dark:border-amber-700">
              <span className="text-xs text-gray-600 dark:text-gray-400 block font-medium">Desde</span>
              <p 
                className="text-base md:text-lg font-black text-sky-700 dark:text-sky-400"
                style={{ fontFamily: "'Exo 2', sans-serif" }}
              >
                ${(court.pricing.basePrice * 0.8).toLocaleString('es-CO')}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {showDetails && court.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">
            {court.description}
          </p>
        )}

        {/* Dimensions & Players */}
        {showDetails && (
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="text-lg">📐</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{courtType.dimensions}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="text-lg">👥</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{courtType.playersPerTeam}v{courtType.playersPerTeam}</span>
            </div>
          </div>
        )}

        {/* Amenities */}
        {showDetails && court.amenities && court.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {court.amenities.slice(0, compact ? 2 : 4).map((amenity, index) => (
              <span 
                key={index}
                className="px-2.5 py-1 bg-linear-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
              >
                {amenity}
              </span>
            ))}
            {court.amenities.length > (compact ? 2 : 4) && (
              <span className="px-2.5 py-1 bg-linear-to-r from-sky-100 to-sky-50 dark:from-sky-900/30 dark:to-sky-800/30 rounded-lg text-xs font-bold text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-600">
                +{court.amenities.length - (compact ? 2 : 4)} más
              </span>
            )}
          </div>
        )}

        {/* Hover Action Indicator */}
        {/* Sin animación de hover en la línea inferior */}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@700;800;900&display=swap');
        
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CourtCard;
