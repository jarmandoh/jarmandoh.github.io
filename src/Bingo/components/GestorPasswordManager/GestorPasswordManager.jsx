import React, { useState, useReducer, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faTimes, 
  faEye,
  faEyeSlash,
  faCopy,
  faCheck,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import './GestorPasswordManager.css';

const formInitialState = {
  showForm: false,
  editingPassword: null,
  formData: { gestorName: '', password: '', description: '', isActive: true },
  passwordVisibility: {},
  copiedPasswords: {},
};
function formReducer(state, patch) {
  return { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
}

const GestorPasswordForm = ({ showForm, editingPassword, formData, setFormData, onSubmit, onCancel, generatePassword }) => {
  if (!showForm) return null;
  return (
    <div className="gpm-form-container">
      <h3 className="gpm-form-title">
        {editingPassword ? 'Editar Contraseña' : 'Nueva Contraseña'}
      </h3>
      <form onSubmit={onSubmit} className="gpm-form">
        <div className="gpm-form-grid">
          <div>
            <label htmlFor="gpm-gestor-name" className="gpm-label">Nombre del Gestor *</label>
            <input
              id="gpm-gestor-name"
              type="text"
              value={formData.gestorName}
              onChange={(e) => setFormData({ ...formData, gestorName: e.target.value })}
              className="gpm-input"
              required
              placeholder="Nombre del gestor"
            />
          </div>
          <div>
            <label htmlFor="gpm-password" className="gpm-label">Contraseña *</label>
            <div className="gpm-password-group">
              <input
                id="gpm-password"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="gpm-input"
                required
                placeholder="Contraseña"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, password: generatePassword() })}
                className="gpm-generate-button"
                title="Generar contraseña aleatoria"
              >
                <FontAwesomeIcon icon={faKey} />
              </button>
            </div>
          </div>
        </div>
        <div className="gpm-form-grid">
          <div>
            <p className="gpm-label">Estado</p>
            <label className="gpm-checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="gpm-checkbox-text">Contraseña activa</span>
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="gpm-description" className="gpm-label">Descripción/Notas</label>
          <textarea
            id="gpm-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="gpm-textarea"
            rows="3"
            placeholder="Descripción o notas adicionales"
          />
        </div>
        <div className="gpm-form-buttons">
          <button type="submit" className="gpm-submit-button">
            {editingPassword ? 'Actualizar' : 'Crear'} Contraseña
          </button>
          <button type="button" onClick={onCancel} className="gpm-cancel-button">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

const GestorPasswordTable = ({ passwords, showPassword, copiedPasswords, onToggleVisibility, onCopy, onToggleStatus, onEdit, onDelete, onNew }) => {
  if (passwords.length === 0) {
    return (
      <div className="gpm-empty-state">
        <div className="gpm-empty-icon">🔑</div>
        <h3 className="gpm-empty-title">No hay contraseñas registradas</h3>
        <p className="gpm-empty-text">Crea la primera contraseña para gestores</p>
        <button onClick={onNew} className="gpm-empty-button">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Crear Primera Contraseña
        </button>
      </div>
    );
  }
  return (
    <div className="gpm-table-wrapper">
      <table className="gpm-table">
        <thead className="gpm-thead">
          <tr>
            <th className="gpm-th">Gestor</th>
            <th className="gpm-th">Contraseña</th>
            <th className="gpm-th">Estado</th>
            <th className="gpm-th">Creado</th>
            <th className="gpm-th">Acciones</th>
          </tr>
        </thead>
        <tbody className="gpm-tbody">
          {passwords.map((password) => (
            <tr key={password.id} className="gpm-tr">
              <td className="gpm-td">
                <div className="gpm-td-main">{password.gestorName}</div>
                {password.description && <div className="gpm-td-desc">{password.description}</div>}
              </td>
              <td className="gpm-td">
                <div className="gpm-password-cell">
                  <span className="gpm-password-display">
                    {showPassword[password.id] ? password.password : '••••••••'}
                  </span>
                  <button onClick={() => onToggleVisibility(password.id)} className="gpm-icon-button" title={showPassword[password.id] ? 'Ocultar' : 'Mostrar'}>
                    <FontAwesomeIcon icon={showPassword[password.id] ? faEyeSlash : faEye} />
                  </button>
                  <button onClick={() => onCopy(password.password, password.id)} className={`gpm-icon-button ${copiedPasswords[password.id] ? 'gpm-icon-button-success' : ''}`} title="Copiar contraseña">
                    <FontAwesomeIcon icon={copiedPasswords[password.id] ? faCheck : faCopy} />
                  </button>
                </div>
              </td>
              <td className="gpm-td">
                <button onClick={() => onToggleStatus(password.id)} className={`gpm-status-badge ${password.isActive ? 'gpm-status-active' : 'gpm-status-inactive'}`}>
                  {password.isActive ? 'Activa' : 'Inactiva'}
                </button>
              </td>
              <td className="gpm-td gpm-td-date">{new Date(password.createdAt).toLocaleDateString()}</td>
              <td className="gpm-td">
                <div className="gpm-actions">
                  <button onClick={() => onEdit(password)} className="gpm-action-button gpm-action-edit" title="Editar">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button onClick={() => onDelete(password.id)} className="gpm-action-button gpm-action-delete" title="Eliminar">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const GestorPasswordManager = ({ onClose, embedded = false }) => {
  const [passwords, setPasswords] = useState([]);
  const [formState, dispatchForm] = useReducer(formReducer, formInitialState);
  const { showForm, editingPassword, formData, passwordVisibility: showPassword, copiedPasswords } = formState;
  const setShowForm = (val) => dispatchForm({ showForm: val });
  const setEditingPassword = (val) => dispatchForm({ editingPassword: val });
  const setFormData = (val) => dispatchForm({ formData: typeof val === 'function' ? val(formState.formData) : val });
  const setShowPassword = (val) => dispatchForm({ passwordVisibility: typeof val === 'function' ? val(formState.passwordVisibility) : val });
  const setCopiedPasswords = (val) => dispatchForm({ copiedPasswords: typeof val === 'function' ? val(formState.copiedPasswords) : val });

  const GESTOR_PASSWORDS_KEY = 'gestorPasswords';

  useEffect(() => {
    loadPasswords();
  }, []);

  const loadPasswords = () => {
    try {
      const stored = localStorage.getItem(GESTOR_PASSWORDS_KEY);
      if (stored) {
        setPasswords(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error al cargar contraseñas:', error);
    }
  };

  const savePasswords = (updatedPasswords) => {
    localStorage.setItem(GESTOR_PASSWORDS_KEY, JSON.stringify(updatedPasswords));
    setPasswords(updatedPasswords);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const passwordData = {
      id: editingPassword ? editingPassword.id : `pwd_${Date.now()}`,
      ...formData,
      createdAt: editingPassword ? editingPassword.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedPasswords;
    if (editingPassword) {
      updatedPasswords = passwords.map(pwd => 
        pwd.id === editingPassword.id ? passwordData : pwd
      );
    } else {
      updatedPasswords = [...passwords, passwordData];
    }

    savePasswords(updatedPasswords);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta contraseña?')) {
      const updatedPasswords = passwords.filter(pwd => pwd.id !== id);
      savePasswords(updatedPasswords);
    }
  };

  const handleEdit = (password) => {
    setEditingPassword(password);
    setFormData(password);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      gestorName: '',
      password: '',
      description: '',
      isActive: true
    });
    setEditingPassword(null);
    setShowForm(false);
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (password, id) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPasswords(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedPasswords(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  const togglePasswordStatus = (id) => {
    const updatedPasswords = passwords.map(pwd => 
      pwd.id === id ? { ...pwd, isActive: !pwd.isActive } : pwd
    );
    savePasswords(updatedPasswords);
  };

  return (
    <div className={embedded ? undefined : 'gpm-overlay'}>
      <div className={embedded ? 'gpm-container-embedded' : 'gpm-container'}>
        {/* Header */}
        <div className="gpm-header">
          <div className="gpm-header-content">
            <div>
              <h2 className="gpm-title">Gestión de Contraseñas de Gestores</h2>
              <p className="gpm-subtitle">Administra las credenciales de acceso para gestores</p>
            </div>
            {!embedded && (
              <button onClick={onClose} className="gpm-close-button">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>

        <div className="gpm-content">
          {/* Botón crear */}
          <div className="gpm-create-section">
            <button onClick={() => setShowForm(true)} className="gpm-create-button">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Nueva Contraseña
            </button>
          </div>

          <GestorPasswordForm
            showForm={showForm}
            editingPassword={editingPassword}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            generatePassword={generatePassword}
          />

          {/* Lista de contraseñas */}
          <div className="gpm-list-container">
            <div className="gpm-list-header">
              <h3 className="gpm-list-title">
                Contraseñas Registradas ({passwords.length})
              </h3>
            </div>
            <GestorPasswordTable
              passwords={passwords}
              showPassword={showPassword}
              copiedPasswords={copiedPasswords}
              onToggleVisibility={togglePasswordVisibility}
              onCopy={copyToClipboard}
              onToggleStatus={togglePasswordStatus}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onNew={() => setShowForm(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestorPasswordManager;
