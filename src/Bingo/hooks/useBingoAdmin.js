import { useState, useCallback, useEffect, useMemo } from 'react';

// Hook para gestionar las asignaciones de cartones
export const useBingoAdmin = () => {
  const [assignments, setAssignments] = useState([]);
  const [currentRaffle, setCurrentRaffle] = useState(1);

  // Cargar asignaciones desde localStorage
  useEffect(() => {
    const savedAssignments = localStorage.getItem('bingoAssignments');
    if (savedAssignments) {
      try {
        setAssignments(JSON.parse(savedAssignments));
      } catch (error) {
        console.error('Error al cargar asignaciones:', error);
      }
    }
  }, []);

  // Guardar asignaciones en localStorage
  const saveAssignments = useCallback((newAssignments) => {
    setAssignments(newAssignments);
    localStorage.setItem('bingoAssignments', JSON.stringify(newAssignments));
  }, []);

  // Asignar cartón a una persona
  const assignCard = useCallback((assignment) => {
    const newAssignment = {
      id: Date.now() + Math.random(), // ID único
      cardNumber: assignment.cardNumber,
      firstName: assignment.firstName,
      lastName: assignment.lastName,
      phone: assignment.phone,
      email: assignment.email,
      paid: assignment.paid || false,
      raffleId: assignment.raffleId || currentRaffle,
      winner: false,
      assignedAt: new Date().toISOString()
    };

    setAssignments(prev => {
      const updated = [...prev, newAssignment];
      saveAssignments(updated);
      return updated;
    });

    return newAssignment;
  }, [currentRaffle, saveAssignments]);

  // Actualizar asignación
  const updateAssignment = useCallback((id, updates) => {
    setAssignments(prev => {
      const updated = prev.map(assignment => 
        assignment.id === id ? { ...assignment, ...updates } : assignment
      );
      saveAssignments(updated);
      return updated;
    });
  }, [saveAssignments]);

  // Eliminar asignación
  const removeAssignment = useCallback((id) => {
    setAssignments(prev => {
      const updated = prev.filter(assignment => assignment.id !== id);
      saveAssignments(updated);
      return updated;
    });
  }, [saveAssignments]);

  // Marcar como ganador
  const markAsWinner = useCallback((id) => {
    updateAssignment(id, { winner: true });
  }, [updateAssignment]);

  // Buscar asignaciones
  const searchAssignments = useCallback((searchTerm, searchType = 'all') => {
    if (!searchTerm) return assignments;

    const term = searchTerm.toLowerCase();
    
    return assignments.filter(assignment => {
      switch (searchType) {
        case 'cardNumber':
          return assignment.cardNumber.toString().includes(term);
        case 'phone':
          return assignment.phone.toLowerCase().includes(term);
        case 'email':
          return assignment.email.toLowerCase().includes(term);
        case 'name':
          return (
            assignment.firstName.toLowerCase().includes(term) ||
            assignment.lastName.toLowerCase().includes(term) ||
            `${assignment.firstName} ${assignment.lastName}`.toLowerCase().includes(term)
          );
        default:
          return (
            assignment.cardNumber.toString().includes(term) ||
            assignment.phone.toLowerCase().includes(term) ||
            assignment.email.toLowerCase().includes(term) ||
            assignment.firstName.toLowerCase().includes(term) ||
            assignment.lastName.toLowerCase().includes(term) ||
            `${assignment.firstName} ${assignment.lastName}`.toLowerCase().includes(term)
          );
      }
    });
  }, [assignments]);

  // Verificar si un cartón está asignado
  const isCardAssigned = useCallback((cardNumber) => {
    return assignments.some(assignment => 
      assignment.cardNumber === cardNumber && assignment.raffleId === currentRaffle
    );
  }, [assignments, currentRaffle]);

  // Obtener asignaciones por sorteo
  const getAssignmentsByRaffle = useCallback((raffleId) => {
    return assignments.filter(assignment => assignment.raffleId === raffleId);
  }, [assignments]);

  // Estadísticas
  const getStats = useCallback(() => {
    const currentRaffleAssignments = getAssignmentsByRaffle(currentRaffle);
    return {
      total: currentRaffleAssignments.length,
      paid: currentRaffleAssignments.filter(a => a.paid).length,
      unpaid: currentRaffleAssignments.filter(a => !a.paid).length,
      winners: currentRaffleAssignments.filter(a => a.winner).length,
      available: 1200 - currentRaffleAssignments.length
    };
  }, [currentRaffle, getAssignmentsByRaffle]);

  // Memoizar assignments y selectores derivados
  const memoizedAssignments = useMemo(() => assignments, [assignments]);
  const memoizedGetAssignmentsByRaffle = useCallback((raffleId) => {
    return memoizedAssignments.filter(assignment => assignment.raffleId === raffleId);
  }, [memoizedAssignments]);
  const memoizedGetStats = useCallback(() => {
    const currentRaffleAssignments = memoizedGetAssignmentsByRaffle(currentRaffle);
    return {
      total: currentRaffleAssignments.length,
      paid: currentRaffleAssignments.filter(a => a.paid).length,
      unpaid: currentRaffleAssignments.filter(a => !a.paid).length,
      winners: currentRaffleAssignments.filter(a => a.winner).length,
      available: 1200 - currentRaffleAssignments.length
    };
  }, [currentRaffle, memoizedGetAssignmentsByRaffle]);

  return {
    assignments: memoizedAssignments,
    currentRaffle,
    setCurrentRaffle,
    assignCard,
    updateAssignment,
    removeAssignment,
    markAsWinner,
    searchAssignments,
    isCardAssigned,
    getAssignmentsByRaffle: memoizedGetAssignmentsByRaffle,
    getStats: memoizedGetStats
  };
};