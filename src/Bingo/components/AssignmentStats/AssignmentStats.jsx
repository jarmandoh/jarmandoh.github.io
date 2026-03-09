import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTicketAlt, 
  faCheckCircle, 
  faExclamationCircle, 
  faTrophy,
  faBoxOpen
} from '@fortawesome/free-solid-svg-icons';
import './AssignmentStats.css';

const EMPTY_ASSIGNMENTS = [];

const AssignmentStats = ({ assignments = EMPTY_ASSIGNMENTS, currentRaffle, maxCards = 1200 }) => {
  // Calcular estadísticas a partir de las asignaciones
  const stats = {
    total: assignments.length,
    paid: assignments.filter(a => a.paid).length,
    pending: assignments.filter(a => !a.paid).length,
    winners: assignments.filter(a => a.winner).length,
    available: maxCards - assignments.reduce((sum, a) => sum + (a.quantity || 1), 0)
  };

  const percentage = stats.total > 0 ? ((stats.total / maxCards) * 100).toFixed(1) : 0;
  const paidPercentage = stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="assignment-stats">
      {/* Total Asignados */}
      <div className="assignment-stats__card assignment-stats__card--blue">
        <div className="assignment-stats__content">
          <div className="assignment-stats__info">
            <p className="assignment-stats__label">Total Asignados</p>
            <p className="assignment-stats__value">{stats.total}</p>
            <p className="assignment-stats__subtitle">{percentage}% de {maxCards}</p>
          </div>
          <div className="assignment-stats__icon-wrapper assignment-stats__icon-wrapper--blue">
            <FontAwesomeIcon icon={faTicketAlt} className="assignment-stats__icon" />
          </div>
        </div>
        <div className="assignment-stats__progress">
          <div
            className="assignment-stats__progress-bar assignment-stats__progress-bar--blue"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Pagados */}
      <div className="assignment-stats__card assignment-stats__card--green">
        <div className="assignment-stats__content">
          <div className="assignment-stats__info">
            <p className="assignment-stats__label">Pagados</p>
            <p className="assignment-stats__value assignment-stats__value--green">{stats.paid}</p>
            <p className="assignment-stats__subtitle">{paidPercentage}% del total</p>
          </div>
          <div className="assignment-stats__icon-wrapper assignment-stats__icon-wrapper--green">
            <FontAwesomeIcon icon={faCheckCircle} className="assignment-stats__icon" />
          </div>
        </div>
        <div className="assignment-stats__progress">
          <div
            className="assignment-stats__progress-bar assignment-stats__progress-bar--green"
            style={{ width: `${paidPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Pendientes */}
      <div className="assignment-stats__card assignment-stats__card--yellow">
        <div className="assignment-stats__content">
          <div className="assignment-stats__info">
            <p className="assignment-stats__label">Pendientes</p>
            <p className="assignment-stats__value assignment-stats__value--yellow">{stats.pending}</p>
            <p className="assignment-stats__subtitle">Sin pagar</p>
          </div>
          <div className="assignment-stats__icon-wrapper assignment-stats__icon-wrapper--yellow">
            <FontAwesomeIcon icon={faExclamationCircle} className="assignment-stats__icon" />
          </div>
        </div>
      </div>

      {/* Ganadores */}
      <div className="assignment-stats__card assignment-stats__card--orange">
        <div className="assignment-stats__content">
          <div className="assignment-stats__info">
            <p className="assignment-stats__label">Ganadores</p>
            <p className="assignment-stats__value assignment-stats__value--orange">{stats.winners}</p>
            <p className="assignment-stats__subtitle">Sorteo {currentRaffle}</p>
          </div>
          <div className="assignment-stats__icon-wrapper assignment-stats__icon-wrapper--orange">
            <FontAwesomeIcon icon={faTrophy} className="assignment-stats__icon" />
          </div>
        </div>
      </div>

      {/* Disponibles */}
      <div className="assignment-stats__card assignment-stats__card--gray">
        <div className="assignment-stats__content">
          <div className="assignment-stats__info">
            <p className="assignment-stats__label">Disponibles</p>
            <p className="assignment-stats__value assignment-stats__value--gray">{stats.available}</p>
            <p className="assignment-stats__subtitle">Sin asignar</p>
          </div>
          <div className="assignment-stats__icon-wrapper assignment-stats__icon-wrapper--gray">
            <FontAwesomeIcon icon={faBoxOpen} className="assignment-stats__icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentStats;
