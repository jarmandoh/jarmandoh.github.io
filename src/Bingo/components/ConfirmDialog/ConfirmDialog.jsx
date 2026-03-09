import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog">
      {/* Backdrop */}
      <div 
        className="confirm-dialog__backdrop"
        onClick={onCancel}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        role="presentation"
      ></div>

      {/* Dialog */}
      <div className="confirm-dialog__container">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="confirm-dialog__close"
        >
          <FontAwesomeIcon icon={faTimes} className="confirm-dialog__close-icon" />
        </button>

        {/* Icon */}
        <div className="confirm-dialog__icon-wrapper">
          <div className="confirm-dialog__icon-circle">
            <FontAwesomeIcon 
              icon={faExclamationTriangle} 
              className="confirm-dialog__icon"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="confirm-dialog__title">
          {title}
        </h3>

        {/* Message */}
        <p className="confirm-dialog__message">
          {message}
        </p>

        {/* Buttons */}
        <div className="confirm-dialog__buttons">
          <button
            onClick={onCancel}
            className="confirm-dialog__button confirm-dialog__button--cancel"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="confirm-dialog__button confirm-dialog__button--confirm"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
