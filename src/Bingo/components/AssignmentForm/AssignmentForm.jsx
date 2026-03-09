import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faPhone, faEnvelope, faHashtag, faGamepad } from '@fortawesome/free-solid-svg-icons';
import './AssignmentForm.css';

const AssignmentCardField = ({ formData, errors, maxCards, generateRandomCard, onChange }) => (
  <div>
    <label htmlFor="assignment-card-number" className="assignment-label">
      <FontAwesomeIcon icon={faHashtag} className="assignment-label-icon" />
      Número de Cartón
    </label>
    <div className="assignment-card-input-group">
      <div className="assignment-input-flex">
        <input
          id="assignment-card-number"
          type="number"
          min="1"
          max={maxCards}
          value={formData.cardNumber}
          onChange={(e) => onChange('cardNumber', e.target.value)}
          className={`assignment-input ${errors.cardNumber ? 'assignment-input-error' : ''}`}
          placeholder="Ej: 123"
        />
        {errors.cardNumber && (
          <p className="assignment-error">{errors.cardNumber}</p>
        )}
      </div>
      <button
        type="button"
        onClick={generateRandomCard}
        className="assignment-random-button"
        title="Generar cartón aleatorio disponible"
      >
        <FontAwesomeIcon icon={faGamepad} />
      </button>
    </div>
  </div>
);

const AssignmentParticipantFields = ({ formData, errors, onChange }) => (
  <div className="assignment-section">
    <div>
      <label htmlFor="assignment-participant-name" className="assignment-label">
        <FontAwesomeIcon icon={faUser} className="assignment-label-icon" />
        Nombre del Participante
      </label>
      <input
        id="assignment-participant-name"
        type="text"
        value={formData.participantName}
        onChange={(e) => onChange('participantName', e.target.value)}
        className={`assignment-input ${errors.participantName ? 'assignment-input-error' : ''}`}
        placeholder="Ej: Juan Pérez"
      />
      {errors.participantName && (
        <p className="assignment-error">{errors.participantName}</p>
      )}
    </div>
    <div className="assignment-grid">
      <div>
        <label htmlFor="assignment-first-name" className="assignment-label-optional">
          Nombre (opcional)
        </label>
        <input
          id="assignment-first-name"
          type="text"
          onChange={(e) => onChange('firstName', e.target.value)}
          className="assignment-input"
          placeholder="Ej: Juan"
        />
      </div>
      <div>
        <label htmlFor="assignment-last-name" className="assignment-label-optional">
          Apellido (opcional)
        </label>
        <input
          id="assignment-last-name"
          type="text"
          onChange={(e) => onChange('lastName', e.target.value)}
          className="assignment-input"
          placeholder="Ej: Pérez"
        />
      </div>
    </div>
  </div>
);

const AssignmentContactFields = ({ formData, errors, onChange }) => (
  <div className="assignment-grid">
    <div>
      <label htmlFor="assignment-phone" className="assignment-label">
        <FontAwesomeIcon icon={faPhone} className="assignment-label-icon" />
        Teléfono (opcional)
      </label>
      <input
        id="assignment-phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => onChange('phone', e.target.value)}
        className={`assignment-input ${errors.phone ? 'assignment-input-error' : ''}`}
        placeholder="Ej: +1234567890"
      />
      {errors.phone && (
        <p className="assignment-error">{errors.phone}</p>
      )}
    </div>
    <div>
      <label htmlFor="assignment-email" className="assignment-label">
        <FontAwesomeIcon icon={faEnvelope} className="assignment-label-icon" />
        Email (opcional)
      </label>
      <input
        id="assignment-email"
        type="email"
        value={formData.email}
        onChange={(e) => onChange('email', e.target.value)}
        className={`assignment-input ${errors.email ? 'assignment-input-error' : ''}`}
        placeholder="Ej: juan@email.com"
      />
      {errors.email && (
        <p className="assignment-error">{errors.email}</p>
      )}
    </div>
  </div>
);

const AssignmentConfigFields = ({ formData, errors, currentRaffle, onChange }) => (
  <div className="assignment-grid">
    <div>
      <label htmlFor="assignment-raffle-id" className="assignment-label-optional">
        ID del Sorteo
      </label>
      {currentRaffle ? (
        <>
          <div className="assignment-input-readonly">
            <span className="assignment-readonly-text">Sorteo {currentRaffle}</span>
          </div>
          <input type="hidden" value={currentRaffle} />
        </>
      ) : (
        <select
          id="assignment-raffle-id"
          value={formData.raffleId}
          onChange={(e) => onChange('raffleId', parseInt(e.target.value))}
          className={`assignment-select ${errors.raffleId ? 'assignment-input-error' : ''}`}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Sorteo {i + 1}
            </option>
          ))}
        </select>
      )}
      {errors.raffleId && (
        <p className="assignment-error">{errors.raffleId}</p>
      )}
    </div>
    <div className="assignment-checkbox-wrapper">
      <label className="assignment-checkbox-label">
        <input
          type="checkbox"
          checked={formData.paid}
          onChange={(e) => onChange('paid', e.target.checked)}
          className="assignment-checkbox"
        />
        <span className="assignment-checkbox-text">
          Marcado como pagado
        </span>
      </label>
    </div>
  </div>
);

const AssignmentForm = ({ assignment, isCardAssigned, onSubmit, onClose, currentRaffle, maxCards = 1200 }) => {
  const [formData, setFormData] = useState(() => {
    if (assignment) {
      return {
        cardNumber: assignment.cardNumber || assignment.startCard || '',
        participantName: assignment.participantName || `${assignment.firstName || ''} ${assignment.lastName || ''}`.trim(),
        firstName: assignment.firstName || '',
        lastName: assignment.lastName || '',
        phone: assignment.phone || '',
        email: assignment.email || '',
        paid: assignment.paid || false,
        raffleId: assignment.raffleId || assignment.raffleNumber || currentRaffle || 1
      };
    }
    return {
      cardNumber: '',
      participantName: '',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      paid: false,
      raffleId: currentRaffle || 1
    };
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardNumber) {
      newErrors.cardNumber = 'El número de cartón es requerido';
    } else {
      const cardNum = parseInt(formData.cardNumber);
      if (isNaN(cardNum) || cardNum < 1 || cardNum > maxCards) {
        newErrors.cardNumber = `El número de cartón debe estar entre 1 y ${maxCards}`;
      } else if (!assignment && isCardAssigned(cardNum)) {
        newErrors.cardNumber = 'Este cartón ya está asignado';
      }
    }

    if (!formData.participantName.trim() && !formData.firstName.trim() && !formData.lastName.trim()) {
      newErrors.participantName = 'El nombre del participante es requerido';
    }

    if (formData.phone && formData.phone.trim() && !/^\+?[\d\s\-()]{8,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Formato de email inválido';
    }

    const raffleToValidate = currentRaffle || formData.raffleId;
    if (!raffleToValidate || raffleToValidate < 1) {
      newErrors.raffleId = 'El ID del sorteo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const processedData = {
        ...formData,
        cardNumber: parseInt(formData.cardNumber),
        participantName: formData.participantName.trim() || `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        raffleId: currentRaffle || parseInt(formData.raffleId),
        raffleNumber: currentRaffle || parseInt(formData.raffleId),
        startCard: parseInt(formData.cardNumber),
        endCard: parseInt(formData.cardNumber),
        quantity: 1,
        createdAt: assignment?.createdAt || new Date().toISOString(),
        id: assignment?.id || crypto.randomUUID()
      };

      await onSubmit(processedData);
    } catch (error) {
      console.error('Error al guardar asignación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateRandomCard = () => {
    const availableCards = [];
    for (let i = 1; i <= maxCards; i++) {
      if (!isCardAssigned(i)) {
        availableCards.push(i);
      }
    }
    
    if (availableCards.length > 0) {
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      handleChange('cardNumber', randomCard.toString());
    }
  };

  return (
    <div className="assignment-form-overlay">
      <div className="assignment-form-container">
        {/* Header */}
        <div className="assignment-form-header">
          <div className="assignment-header-content">
            <h2 className="assignment-form-title">
              {assignment ? 'Editar Asignación' : 'Nueva Asignación'}
            </h2>
            <button onClick={onClose} className="assignment-close-button">
              <FontAwesomeIcon icon={faTimes} className="assignment-close-icon" />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="assignment-form">
          <AssignmentCardField
            formData={formData}
            errors={errors}
            maxCards={maxCards}
            generateRandomCard={generateRandomCard}
            onChange={handleChange}
          />
          <AssignmentParticipantFields
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />
          <AssignmentContactFields
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />
          <AssignmentConfigFields
            formData={formData}
            errors={errors}
            currentRaffle={currentRaffle}
            onChange={handleChange}
          />

          {/* Botones */}
          <div className="assignment-buttons">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="assignment-cancel-button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="assignment-submit-button"
            >
              {isLoading ? (
                <>
                  <div className="assignment-spinner"></div>
                  Guardando...
                </>
              ) : (
                assignment ? 'Actualizar' : 'Crear Asignación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;
