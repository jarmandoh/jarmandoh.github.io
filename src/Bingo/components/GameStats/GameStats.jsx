import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faListOl,
  faUsers,
  faTrophy
} from '@fortawesome/free-solid-svg-icons';
import './GameStats.css';

const EMPTY_ASSIGNMENTS = [];
const EMPTY_GAME_STATS = {};
const EMPTY_CALLED_NUMBERS = [];

const GameStats = ({ 
  assignments = EMPTY_ASSIGNMENTS, 
  gameStats = EMPTY_GAME_STATS, 
  currentRaffle = 1, 
  calledNumbers = EMPTY_CALLED_NUMBERS,
  maxNumbers = 75 
}) => {
  // Calcular cartones totales desde las asignaciones
  const totalCards = assignments.reduce((total, assignment) => {
    // Validar que las propiedades existan y sean números válidos
    const startCard = parseInt(assignment.startCard) || 0;
    const endCard = parseInt(assignment.endCard) || 0;
    const quantity = assignment.quantity || 0;
    
    // Si tiene quantity definido, usarlo; sino calcular del rango
    if (quantity > 0) {
      return total + quantity;
    } else if (startCard > 0 && endCard > 0 && endCard >= startCard) {
      return total + (endCard - startCard + 1);
    } else {
      return total + 1; // Al menos contar 1 cartón por asignación
    }
  }, 0) || 0;

  const statsData = [
    {
      label: `Cartones Total (Sorteo ${currentRaffle})`,
      value: totalCards,
      icon: faListOl,
      iconColor: 'text-blue-600'
    },
    {
      label: `Cartones Activos (Sorteo ${currentRaffle})`,
      value: gameStats.activeCards || 0,
      icon: faUsers,
      iconColor: 'text-green-300'
    },
    {
      label: `Ganadores (Sorteo ${currentRaffle})`,
      value: gameStats.winners || 0,
      icon: faTrophy,
      iconColor: 'text-yellow-300'
    },
    {
      label: 'Números Cantados',
      value: `${calledNumbers.length}/${maxNumbers}`,
      icon: faListOl,
      iconColor: 'text-indigo-300'
    }
  ];

  return (
    <div className="cont-stats">
      {statsData.map((stat) => (
        <div key={stat.label} className="stat-card">
          <div className="stat-content">
            <div className="stat-text">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
            <FontAwesomeIcon icon={stat.icon} className={`stat-icon ${stat.iconColor}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameStats;
