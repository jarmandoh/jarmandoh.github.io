import React, { useState, useEffect, useRef } from 'react';
import { useReservas } from '../../context/ReservasContext';
import CourtCard from '../CourtCard';
import TimeSlotPicker from '../TimeSlotPicker';

const ReservationForm = ({ onSuccess, onCancel, fullPage = false }) => {
  const { courts, getAvailableSlots, createReservation, settings, formatPrice } = useReservas();
  const formRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const [customerData, setCustomerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Obtener fecha mínima (hoy o mañana según la hora)
  const getMinDate = () => {
    const now = new Date();
    const minAdvanceHours = settings?.minAdvanceHours || 2;
    now.setHours(now.getHours() + minAdvanceHours);
    return now.toISOString().split('T')[0];
  };

  // Obtener fecha máxima
  const getMaxDate = () => {
    const max = new Date();
    const maxAdvanceDays = settings?.maxAdvanceDays || 30;
    max.setDate(max.getDate() + maxAdvanceDays);
    return max.toISOString().split('T')[0];
  };

  // Cargar horarios cuando cambia la cancha o fecha
  useEffect(() => {
    if (selectedCourt && selectedDate) {
      setLoadingSlots(true);
      // Simular delay de red
      setTimeout(() => {
        const slots = getAvailableSlots(selectedCourt.id, selectedDate);
        setAvailableSlots(slots);
        setLoadingSlots(false);
        setSelectedSlots([]);
      }, 300);
    }
  }, [selectedCourt, selectedDate, getAvailableSlots]);

  // Filtrar canchas activas
  const activeCourts = courts.filter(c => c.isActive !== false);
  
  // Filtrar por tipo
  const filteredCourts = filterType === 'all' 
    ? activeCourts 
    : activeCourts.filter(c => c.type === filterType);

  // Validar datos del cliente
  const validateCustomerData = () => {
    const newErrors = {};
    
    if (!customerData.fullName.trim()) {
      newErrors.fullName = 'El nombre es requerido';
    }
    
    if (!customerData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(customerData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!customerData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\+?[\d\s-]{7,15}$/.test(customerData.phone)) {
      newErrors.phone = 'Teléfono inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mostrar toast con auto-dismiss
  const showToast = (message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 6000);
  };

  // Manejar toggle de slot (multi-selección libre)
  const handleToggleSlot = (slot) => {
    setSelectedSlots(prev => {
      const isAlreadySelected = prev.some(s => s.startTime === slot.startTime);
      let newSlots;
      if (isAlreadySelected) {
        newSlots = prev.filter(s => s.startTime !== slot.startTime);
      } else {
        newSlots = [...prev, slot].sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
      // Mostrar toast si más de 1 hora seleccionada
      if (newSlots.length > 1) {
        const total = newSlots.reduce((sum, s) => sum + (s.price || 0), 0);
        const deposit = Math.ceil(total / 2);
        const formattedTotal = formatPrice ? formatPrice(total) : `$${total.toLocaleString('es-CO')}`;
        const formattedDeposit = formatPrice ? formatPrice(deposit) : `$${deposit.toLocaleString('es-CO')}`;
        showToast(
          `${newSlots.length} horas seleccionadas — Total: ${formattedTotal}. Para confirmar la reserva debes pagar al menos el 50% (${formattedDeposit}).`
        );
      } else {
        setToast(null);
      }
      return newSlots;
    });
  };

  // Manejar selección de cancha
  const handleSelectCourt = (court) => {
    setSelectedCourt(court);
    setSelectedSlots([]);
    setAvailableSlots([]);
    // Auto-avanzar al paso 2 tras seleccionar cancha
    setTimeout(() => goToStep(2), 450);
  };

  // Manejar cambio de fecha
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedSlots([]);
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateCustomerData()) return;
    
    setSubmitting(true);
    
    try {
      const sortedSlots = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const totalPrice = sortedSlots.reduce((sum, s) => sum + (s.price || 0), 0);
      const result = createReservation({
        courtId: selectedCourt.id,
        date: selectedDate,
        slots: sortedSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })),
        startTime: sortedSlots[0].startTime,
        endTime: sortedSlots[sortedSlots.length - 1].endTime,
        customer: customerData,
        totalPrice,
        hoursCount: sortedSlots.length
      });

      if (result.success) {
        onSuccess?.(result.reservation);
      } else {
        setErrors({ submit: result.error });
      }
    } catch (_error) {
      setErrors({ submit: `Error al crear la reserva. Por favor intenta de nuevo. ${_error.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  // Navegar entre pasos
  const goToStep = (newStep) => {
    setStep(newStep);
    // Scroll suave al formulario al cambiar de paso
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Generar los próximos días disponibles para el selector visual
  const getNextDays = () => {
    const days = [];
    const minDate = new Date(getMinDate() + 'T00:00:00');
    const maxDate = new Date(getMaxDate() + 'T00:00:00');
    const current = new Date(minDate);
    
    while (current <= maxDate && days.length < 14) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const formatDayName = (date) => {
    return date.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '');
  };

  const formatDayNumber = (date) => {
    return date.getDate();
  };

  const formatMonthName = (date) => {
    return date.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  const canProceedToStep2 = selectedCourt !== null;
  const canProceedToStep3 = selectedSlots.length > 0;

  // Calcular precio total y depósito
  const sortedSelectedSlots = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const totalPrice = sortedSelectedSlots.reduce((sum, s) => sum + (s.price || 0), 0);
  const depositAmount = Math.ceil(totalPrice / 2);
  const formattedTotalPrice = formatPrice ? formatPrice(totalPrice) : `$${totalPrice.toLocaleString('es-CO')}`;
  const formattedDeposit = formatPrice ? formatPrice(depositAmount) : `$${depositAmount.toLocaleString('es-CO')}`;

  return (
    <div ref={formRef} className={`bg-white dark:bg-gray-900 overflow-hidden ${
      fullPage 
        ? 'rounded-2xl shadow-xl flex flex-col min-h-[calc(100vh-5rem)]' 
        : 'rounded-3xl shadow-2xl'
    }`}>
      {/* Progress Steps */}
      <div className="bg-linear-to-r from-sky-50 to-amber-50 dark:from-sky-900/20 dark:to-amber-900/20 px-6 py-5 border-b dark:border-gray-700">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Cancha', icon: '🏟️' },
            { num: 2, label: 'Horario', icon: '🕐' },
            { num: 3, label: 'Datos', icon: '👤' }
          ].map((s, index) => (
            <React.Fragment key={s.num}>
              <div 
                className={`flex items-center gap-3 cursor-pointer group ${
                  step >= s.num ? 'text-sky-600 dark:text-sky-400' : 'text-gray-400'
                }`}
                onClick={() => s.num < step && goToStep(s.num)}
              >
                <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-500 ${
                  step >= s.num 
                    ? 'bg-linear-to-br from-sky-500 to-sky-600 text-white shadow-lg scale-110' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  {step > s.num ? '✓' : s.icon}
                  {step === s.num && (
                    <div className="absolute inset-0 bg-sky-400 rounded-2xl animate-ping opacity-30"></div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <span className="font-bold text-sm block">{s.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Paso {s.num}</span>
                </div>
              </div>
              {index < 2 && (
                <div className="flex-1 h-1.5 mx-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <div 
                    className={`h-full bg-linear-to-r from-sky-500 to-sky-600 transition-all duration-500 ${
                      step > s.num ? 'w-full' : 'w-0'
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className={`p-4 sm:p-6 ${fullPage ? 'flex-1 overflow-y-auto' : ''}`}>
        {/* Step 1: Seleccionar Cancha */}
        {step === 1 && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3" style={{ fontFamily: "'Exo 2', sans-serif" }}>
              Selecciona tu cancha
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-base">
              Elige la cancha que mejor se adapte a tus necesidades
            </p>

            {/* Filter */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setFilterType('all')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  filterType === 'all'
                    ? 'bg-linear-to-r from-sky-500 to-sky-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                🎯 Todas
              </button>
              <button
                onClick={() => setFilterType('futbol_5')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  filterType === 'futbol_5'
                    ? 'bg-linear-to-r from-sky-500 to-sky-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                ⚽ Fútbol 5
              </button>
              <button
                onClick={() => setFilterType('futbol_8')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  filterType === 'futbol_8'
                    ? 'bg-linear-to-r from-sky-500 to-sky-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                ⚽ Fútbol 8
              </button>
              <button
                onClick={() => setFilterType('futbol_11')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  filterType === 'futbol_11'
                    ? 'bg-linear-to-r from-sky-500 to-sky-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                🏟️ Fútbol 11
              </button>
            </div>

            {/* Courts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filteredCourts.map(court => (
                <CourtCard
                  key={court.id}
                  court={court}
                  isSelected={selectedCourt?.id === court.id}
                  onSelect={handleSelectCourt}
                  compact={true}
                />
              ))}
            </div>

            {filteredCourts.length === 0 && (
              <div className="text-center py-16 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span className="text-6xl mb-4 block animate-bounce">🔍</span>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  No hay canchas disponibles con este filtro
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Seleccionar Fecha y Hora */}
        {step === 2 && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3" style={{ fontFamily: "'Exo 2', sans-serif" }}>
              Elige fecha y horario
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-base">
              Selecciona cuándo quieres jugar en <span className="font-bold text-sky-600 dark:text-sky-400">{selectedCourt?.name}</span>
            </p>

            {/* Date Picker - Visual Calendar */}
            <div className="mb-8">
              <label className="text-base font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                <span className="text-2xl">📅</span> Selecciona una fecha
              </label>
              
              {/* Visual Day Cards */}
              <div className="flex gap-2 overflow-x-auto py-4 scrollbar-thin">
                {getNextDays().map((day) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const isSelected = selectedDate === dateStr;
                  const dayIsToday = isToday(day);
                  const dayIsTomorrow = isTomorrow(day);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  
                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDateChange({ target: { value: dateStr } })}
                      className={`relative shrink-0 w-[72px] py-3 rounded-2xl flex flex-col items-center gap-1 transition-all duration-300 transform hover:scale-105 border-2 ${
                        isSelected
                          ? 'bg-linear-to-b from-sky-500 to-sky-600 text-white border-sky-400 shadow-lg shadow-sky-500/30 scale-105'
                          : isWeekend
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:border-amber-400 text-gray-700 dark:text-gray-300'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-sky-400 dark:hover:border-sky-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {/* Today/Tomorrow label */}
                      {(dayIsToday || dayIsTomorrow) && (
                        <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          isSelected ? 'bg-amber-400 text-gray-900' : 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400'
                        }`}>
                          {dayIsToday ? 'Hoy' : 'Mañana'}
                        </span>
                      )}
                      
                      <span className={`text-[11px] font-bold uppercase tracking-wide ${
                        isSelected ? 'text-sky-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatDayName(day)}
                      </span>
                      <span className={`text-2xl font-black leading-none ${
                        isSelected ? 'text-white' : ''
                      }`} style={{ fontFamily: "'Exo 2', sans-serif" }}>
                        {formatDayNumber(day)}
                      </span>
                      <span className={`text-[11px] font-semibold capitalize ${
                        isSelected ? 'text-sky-200' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {formatMonthName(day)}
                      </span>

                      {/* Selection indicator dot */}
                      {isSelected && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full mt-0.5"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected date display */}
              {selectedDate && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-sky-600 dark:text-sky-400 font-bold">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-CO', { 
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <label className="text-base font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                  <span className="text-2xl">🕐</span> Horario disponible
                </label>
                <TimeSlotPicker
                  slots={availableSlots}
                  selectedSlots={selectedSlots}
                  onToggleSlot={handleToggleSlot}
                  loading={loadingSlots}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Datos del Cliente */}
        {step === 3 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Completa tu reserva
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ingresa tus datos para confirmar la reserva
            </p>

            {/* Reservation Summary */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">📋 Resumen de tu reserva</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Cancha:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCourt?.name}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-CO', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Horario:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {sortedSelectedSlots.length > 1 
                      ? `${sortedSelectedSlots.length} horas seleccionadas`
                      : sortedSelectedSlots[0]?.label || ''
                    }
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Precio total:</span>
                  <p className="font-bold text-red-600 dark:text-yellow-400 text-lg">{formattedTotalPrice}</p>
                </div>
              </div>

              {/* Desglose cuando hay varias horas */}
              {sortedSelectedSlots.length > 1 && (
                <div className="mt-3 pt-3 border-t border-yellow-300 dark:border-yellow-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">Desglose por hora:</p>
                  <div className="space-y-1">
                    {sortedSelectedSlots.map((slot, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>{slot.startTime} - {slot.endTime}</span>
                        <span className="font-medium">{slot.formattedPrice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aviso de depósito */}
              {sortedSelectedSlots.length > 1 && (
                <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    Para confirmar la reserva debes pagar al menos el 50% del total: <span className="text-amber-900 dark:text-amber-200 font-black">{formattedDeposit}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Customer Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={customerData.fullName}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, fullName: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Juan Pérez"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="juan@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white ${
                    errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="+57 300 123 4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={customerData.notes}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Algún comentario especial..."
                />
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                  {errors.submit}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-5 border-t dark:border-gray-700 flex justify-between">
        <button
          onClick={() => step > 1 ? goToStep(step - 1) : onCancel?.()}
          className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-bold rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          {step > 1 ? '← Anterior' : 'Cancelar'}
        </button>

        {step < 3 ? (
          <button
            onClick={() => goToStep(step + 1)}
            disabled={step === 1 ? !canProceedToStep2 : !canProceedToStep3}
            className="px-8 py-3 bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:shadow-none"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-gray-900 font-black rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:shadow-none flex items-center gap-2"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-3 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                ✓ Confirmar Reserva
              </>
            )}
          </button>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@700;800;900&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(100%) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes toastSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(100%) scale(0.95); }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg"
          style={{ animation: 'toastSlideIn 0.35s ease-out forwards' }}
        >
          <div className="bg-linear-to-r from-sky-600 to-sky-700 dark:from-sky-700 dark:to-sky-800 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-sky-500/30 flex items-start gap-3 border border-sky-400/30">
            <span className="text-2xl shrink-0 mt-0.5">💡</span>
            <div className="flex-1">
              <p className="text-sm font-medium leading-relaxed">{toast}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="shrink-0 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationForm;
