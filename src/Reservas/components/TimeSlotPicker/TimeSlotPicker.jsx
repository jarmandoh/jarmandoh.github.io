import React from 'react';

const TimeSlotPicker = React.memo(({
  slots = [],
  selectedSlots = [],
  onToggleSlot,
  showPrices = true,
  disabled = false,
  loading = false
}) => {
  const isSlotSelected = (slot) => selectedSlots.some(s => s.startTime === slot.startTime);

  // Agrupar slots por categoría (mañana, tarde, noche)
  const groupedSlots = {
    morning: slots.filter(s => {
      const hour = parseInt(s.startTime.split(':')[0]);
      return hour >= 6 && hour < 12;
    }),
    afternoon: slots.filter(s => {
      const hour = parseInt(s.startTime.split(':')[0]);
      return hour >= 12 && hour < 18;
    }),
    night: slots.filter(s => {
      const hour = parseInt(s.startTime.split(':')[0]);
      return hour >= 18;
    })
  };

  const renderSlotGroup = (title, icon, groupSlots, bgColor) => {
    if (groupSlots.length === 0) return null;

    return (
      <div className="mb-6">
        <div className={`flex items-center gap-2 mb-3 px-3 py-2 ${bgColor} rounded-lg`}>
          <span className="text-xl">{icon}</span>
          <h4 className="font-semibold text-gray-700 dark:text-gray-200">{title}</h4>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({groupSlots.filter(s => s.isAvailable).length} disponibles)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {groupSlots.map((slot, index) => {
            const isSelected = isSlotSelected(slot);
            const isAvailable = slot.isAvailable;
            // ✅ Función inline en lugar de useCallback dentro de map
            const handleClick = () => {
              if (isAvailable && !disabled) onToggleSlot?.(slot);
            };
            return (
              <button
                key={index}
                onClick={handleClick}
                disabled={!isAvailable || disabled}
                className={`
                  relative p-3 rounded-xl border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 ring-2 ring-yellow-500/30' 
                    : isAvailable
                      ? 'border-gray-200 dark:border-gray-600 hover:border-yellow-300 dark:hover:border-yellow-700 bg-white dark:bg-gray-800'
                      : 'border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed'
                  }
                `}
              >
                {/* Time */}
                <div className={`text-sm font-bold ${
                  isSelected 
                    ? 'text-blue-700 dark:text-yellow-400' 
                    : isAvailable 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {slot.startTime}
                </div>
                <div className={`text-xs ${
                  isAvailable ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  a {slot.endTime}
                </div>

                {/* Price */}
                {showPrices && slot.formattedPrice && (
                  <div className={`mt-2 text-sm font-semibold ${
                    isSelected 
                      ? 'text-blue-700 dark:text-yellow-400' 
                      : isAvailable 
                        ? 'text-gray-700 dark:text-gray-300' 
                        : 'text-gray-400 dark:text-gray-500 line-through'
                  }`}>
                    {slot.formattedPrice}
                  </div>
                )}

                {/* Status indicator */}
                {!isAvailable && (
                  <div className="absolute top-1 right-1">
                    <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                      Ocupado
                    </span>
                  </div>
                )}

                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <span className="text-5xl mb-4 block">📅</span>
        <p className="text-gray-500 dark:text-gray-400">
          No hay horarios disponibles para esta fecha
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-gray-200 bg-white"></div>
          <span className="text-gray-600 dark:text-gray-400">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-yellow-500 bg-yellow-50"></div>
          <span className="text-gray-600 dark:text-gray-400">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-gray-100 bg-gray-100"></div>
          <span className="text-gray-600 dark:text-gray-400">Ocupado</span>
        </div>
      </div>

      {/* Multi-select hint */}
      {selectedSlots.length > 0 && (
        <div className="mb-4 px-4 py-2.5 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl text-sm text-sky-700 dark:text-sky-300 flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span>
            {selectedSlots.length === 1 
              ? 'Puedes seleccionar más horarios para reservar varias horas' 
              : `${selectedSlots.length} horas seleccionadas — Toca cualquiera para deseleccionar`
            }
          </span>
        </div>
      )}

      {/* Slot Groups */}
      {renderSlotGroup('Mañana', '🌅', groupedSlots.morning, 'bg-orange-50 dark:bg-orange-900/20')}
      {renderSlotGroup('Tarde', '☀️', groupedSlots.afternoon, 'bg-yellow-50 dark:bg-yellow-900/20')}
      {renderSlotGroup('Noche', '🌙', groupedSlots.night, 'bg-indigo-50 dark:bg-indigo-900/20')}
    </div>
  );
});

export default TimeSlotPicker;
