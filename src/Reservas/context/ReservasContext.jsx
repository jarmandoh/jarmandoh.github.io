import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SAMPLE_COURTS, COURT_TYPES, generateTimeSlots, DEFAULT_OPERATING_HOURS, formatPrice, getTimeSlotCategory } from '../data/courtsConfig';

const CourtsContext = createContext([]);
const ReservationsContext = createContext([]);
const SettingsContext = createContext({});
const AdminContext = createContext(null);
const LoadingContext = createContext(true);

const STORAGE_KEYS = {
  COURTS: 'reservas_courts',
  RESERVATIONS: 'reservas_reservations',
  ADMIN: 'reservas_admin',
  SETTINGS: 'reservas_settings'
};

const initialSettings = {
  businessName: 'Canchas El Golazo',
  businessAddress: 'Calle 123 #45-67, Bogotá',
  businessPhone: '+57 300 123 4567',
  businessEmail: 'reservas@elgolazo.com',
  businessDescription: 'Las mejores canchas sintéticas de la ciudad para disfrutar del fútbol con amigos y familia.',
  whatsappNumber: '+57 300 123 4567',
  socialInstagram: '@canchaselgolazo',
  socialFacebook: 'CanchasElGolazo',
  slotDurationMinutes: 60,
  minAdvanceHours: 2,
  maxAdvanceDays: 30,
  depositPercentage: 30
};

export const useCourts = () => useContext(CourtsContext);
export const useReservations = () => useContext(ReservationsContext);
export const useSettings = () => useContext(SettingsContext);
export const useAdmin = () => useContext(AdminContext);
export const useLoading = () => useContext(LoadingContext);

export const ReservasProvider = ({ children }) => {
  const [courts, setCourts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = () => {
      try {
        const storedCourts = localStorage.getItem(STORAGE_KEYS.COURTS);
        const storedReservations = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        const storedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN);

        if (storedCourts) {
          setCourts(JSON.parse(storedCourts));
        return (
          <CourtsContext.Provider value={courts}>
            <ReservationsContext.Provider value={reservations}>
              <SettingsContext.Provider value={settings}>
                <AdminContext.Provider value={admin}>
                  <LoadingContext.Provider value={loading}>
                    {children}
                  </LoadingContext.Provider>
                </AdminContext.Provider>
              </SettingsContext.Provider>
            </ReservationsContext.Provider>
          </CourtsContext.Provider>
        );
      };

        if (storedReservations) {
          setReservations(JSON.parse(storedReservations));
        }

        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }

        if (storedAdmin) {
          setAdmin(JSON.parse(storedAdmin));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Guardar canchas en localStorage cuando cambian
  useEffect(() => {
    if (!loading && courts.length > 0) {
      localStorage.setItem(STORAGE_KEYS.COURTS, JSON.stringify(courts));
    }
  }, [courts, loading]);

  // Guardar reservaciones cuando cambian
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
    }
  }, [reservations, loading]);

  // Guardar configuración cuando cambia
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }, [settings, loading]);

  // Obtener tipo de cancha
  const getCourtType = useCallback((typeId) => {
    const typeKey = typeId.toUpperCase().replace('-', '_').replace(' ', '_');
    return COURT_TYPES[typeKey] || COURT_TYPES.FUTBOL_5;
  }, []);

  // Obtener precio de una cancha para un horario específico
  const getCourtPrice = useCallback((courtId, date, time) => {
    const court = courts.find(c => c.id === courtId);
    if (!court) return 0;

    const dayOfWeek = new Date(date).getDay();
    const category = getTimeSlotCategory(time);
    
    // Buscar precio personalizado
    const customPrice = court.customPricing?.find(
      cp => cp.dayOfWeek === dayOfWeek && cp.category === category.id
    );

    if (customPrice) {
      return customPrice.price;
    }

    // Usar precio base con multiplicador
    const courtType = getCourtType(court.type);
    return Math.round(courtType.defaultPrice * category.priceMultiplier);
  }, [courts, getCourtType]);

  // Obtener horarios disponibles para una cancha en una fecha
  const getAvailableSlots = useCallback((courtId, date) => {
    const court = courts.find(c => c.id === courtId);
    if (!court) return [];

    const dayOfWeek = new Date(date).getDay();
    const operatingHour = court.operatingHours?.find(oh => oh.dayOfWeek === dayOfWeek);

    if (!operatingHour || !operatingHour.isOpen) return [];

    const slots = generateTimeSlots(
      operatingHour.openTime,
      operatingHour.closeTime,
      settings.slotDurationMinutes
    );

    // Filtrar slots ya reservados
    const dateStr = new Date(date).toISOString().split('T')[0];
    const courtReservations = reservations.filter(
      r => r.courtId === courtId && 
           r.date === dateStr && 
           (r.status === 'pending' || r.status === 'confirmed')
    );

    // Verificar si la fecha es hoy para bloquear horarios pasados
    const now = new Date();
    const isToday = dateStr === now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return slots.map(slot => {
      const isReserved = courtReservations.some(
        r => r.startTime === slot.startTime
      );

      // Bloquear si es hoy y el horario ya pasó
      let isPast = false;
      if (isToday) {
        const [slotH, slotM] = slot.startTime.split(':').map(Number);
        isPast = slotH < currentHour || (slotH === currentHour && slotM <= currentMinute);
      }

      const price = getCourtPrice(courtId, date, slot.startTime);
      
      return {
        ...slot,
        isAvailable: !isReserved && !isPast,
        isPast,
        price,
        formattedPrice: formatPrice(price)
      };
    });
  }, [courts, reservations, settings.slotDurationMinutes, getCourtPrice]);

  // Crear reservas múltiples (admin)
  const createBulkReservation = useCallback((bulkData) => {
    const { items, customer, notes } = bulkData;
    const results = [];
    const bulkCode = `BULK-${Date.now().toString(36).toUpperCase()}`;

    for (const item of items) {
      const { courtId, date, startTime, endTime } = item;
      
      // Verificar disponibilidad
      const slots = getAvailableSlots(courtId, date);
      const slot = slots.find(s => s.startTime === startTime);
      
      if (!slot || !slot.isAvailable) {
        results.push({ ...item, success: false, error: 'Horario no disponible' });
        continue;
      }

      const newReservation = {
        id: Date.now() + Math.random(),
        code: `${bulkCode}-${results.length + 1}`,
        bulkCode,
        courtId,
        date: new Date(date).toISOString().split('T')[0],
        startTime,
        endTime,
        customer,
        price: item.price || slot.price,
        status: 'confirmed',
        paymentStatus: 'pending',
        isBulkReservation: true,
        notes: notes || '',
        createdAt: new Date().toISOString()
      };

      setReservations(prev => [...prev, newReservation]);
      results.push({ ...item, success: true, reservation: newReservation });
    }

    return {
      bulkCode,
      total: items.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalPrice: results.filter(r => r.success).reduce((sum, r) => sum + (r.reservation?.price || 0), 0),
      results
    };
  }, [getAvailableSlots]);

  // Crear una nueva reserva
  const createReservation = useCallback((reservationData) => {
    const { courtId, date, startTime, endTime, customer } = reservationData;
    
    // Verificar disponibilidad
    const slots = getAvailableSlots(courtId, date);
    const slot = slots.find(s => s.startTime === startTime);
    
    if (!slot || !slot.isAvailable) {
      return { success: false, error: 'El horario seleccionado no está disponible' };
    }

    const newReservation = {
      id: Date.now(),
      code: `RES-${Date.now().toString(36).toUpperCase()}`,
      courtId,
      date: new Date(date).toISOString().split('T')[0],
      startTime,
      endTime,
      customer,
      price: slot.price,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    setReservations(prev => [...prev, newReservation]);
    
    return { success: true, reservation: newReservation };
  }, [getAvailableSlots]);

  // Actualizar estado de una reserva
  const updateReservationStatus = useCallback((reservationId, status) => {
    setReservations(prev => 
      prev.map(r => 
        r.id === reservationId 
          ? { ...r, status, updatedAt: new Date().toISOString() }
          : r
      )
    );
  }, []);

  // Cancelar una reserva
  const cancelReservation = useCallback((reservationId, reason = '') => {
    setReservations(prev => 
      prev.map(r => 
        r.id === reservationId 
          ? { 
              ...r, 
              status: 'cancelled', 
              cancellationReason: reason,
              cancelledAt: new Date().toISOString() 
            }
          : r
      )
    );
  }, []);

  // Agregar o actualizar cancha
  const saveCourt = useCallback((courtData) => {
    setCourts(prev => {
      const existingIndex = prev.findIndex(c => c.id === courtData.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...prev[existingIndex], ...courtData };
        return updated;
      }
      return [...prev, { ...courtData, id: Date.now() }];
    });
  }, []);

  // Eliminar cancha
  const deleteCourt = useCallback((courtId) => {
    setCourts(prev => prev.filter(c => c.id !== courtId));
  }, []);

  // Actualizar horarios de operación de una cancha
  const updateCourtOperatingHours = useCallback((courtId, operatingHours) => {
    setCourts(prev => 
      prev.map(c => 
        c.id === courtId ? { ...c, operatingHours } : c
      )
    );
  }, []);

  // Actualizar precios personalizados de una cancha
  const updateCourtPricing = useCallback((courtId, customPricing) => {
    setCourts(prev => 
      prev.map(c => 
        c.id === courtId ? { ...c, customPricing } : c
      )
    );
  }, []);

  // Actualizar configuración del negocio
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Login de administrador
  const loginAdmin = useCallback((username, password) => {
    // Simulación simple - en producción usar autenticación real
    if (username === 'admin' && password === 'admin123') {
      const adminData = { username, loggedInAt: new Date().toISOString() };
      setAdmin(adminData);
      localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(adminData));
      return { success: true };
    }
    return { success: false, error: 'Credenciales incorrectas' };
  }, []);

  // Logout de administrador
  const logoutAdmin = useCallback(() => {
    setAdmin(null);
    localStorage.removeItem(STORAGE_KEYS.ADMIN);
  }, []);

  // Obtener estadísticas
  const getStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todayReservations = reservations.filter(r => r.date === today);
    const monthReservations = reservations.filter(r => r.date.startsWith(thisMonth));

    return {
      totalCourts: courts.length,
      activeCourts: courts.filter(c => c.isActive).length,
      todayReservations: todayReservations.length,
      todayConfirmed: todayReservations.filter(r => r.status === 'confirmed').length,
      monthTotal: monthReservations.length,
      monthRevenue: monthReservations
        .filter(r => r.status === 'confirmed' || r.status === 'completed')
        .reduce((sum, r) => sum + (r.price || 0), 0),
      pendingReservations: reservations.filter(r => r.status === 'pending').length
    };
  }, [courts, reservations]);

  const value = {
    // Estado
    courts,
    reservations,
    settings,
    loading,
    admin,
    isAdminLoggedIn: !!admin,

    // Utilidades
    getCourtType,
    getCourtPrice,
    getAvailableSlots,
    formatPrice,
    getStats,

    // Acciones de reservas
    createReservation,
    createBulkReservation,
    updateReservationStatus,
    cancelReservation,

    // Acciones de canchas
    saveCourt,
    deleteCourt,
    updateCourtOperatingHours,
    updateCourtPricing,

    // Configuración
    updateSettings,

    // Autenticación
    loginAdmin,
    logoutAdmin
  };

  return (
    <ReservasContext.Provider value={value}>
      {children}
    </ReservasContext.Provider>
  );
};

export const useReservas = () => {
  const context = useContext(ReservasContext);
  if (!context) {
    throw new Error('useReservas must be used within a ReservasProvider');
  }
  return context;
};

export default ReservasContext;
