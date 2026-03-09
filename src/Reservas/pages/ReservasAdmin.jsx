import React, { useReducer } from 'react';
import { useReservas } from '../context/ReservasContext';
import { COURT_TYPES, DAYS_OF_WEEK, TIME_SLOT_CATEGORIES } from '../data/courtsConfig';
import ScrollToTopButton from '../components/ScrollToTopButton';

const uiInitialState = { activeTab: 'dashboard', selectedCourt: null, showCourtModal: false, showSettingsModal: false, editingCourt: null };
const bulkInitialState = { bulkItems: [], bulkCustomer: { fullName: '', email: '', phone: '' }, bulkNotes: '', bulkResult: null, newBulkItem: { courtId: '', date: '', startTime: '' } };
function mergeReducer(state, patch) {
  return { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
}

const ReservasDashboardTab = ({ todayReservations, pendingReservations, courts, onConfirm, onCancel }) => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Resumen del Día</h2>
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">📅 Reservas de Hoy ({todayReservations.length})</h3>
      {todayReservations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="pb-3 pr-4">Cancha</th><th className="pb-3 pr-4">Horario</th><th className="pb-3 pr-4">Cliente</th><th className="pb-3 pr-4">Estado</th><th className="pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {todayReservations.map(reservation => {
                const court = courts.find(c => c.id === reservation.courtId);
                return (
                  <tr key={reservation.id} className="border-b dark:border-gray-700">
                    <td className="py-3 pr-4"><span className="font-medium text-gray-900 dark:text-white">{court?.name || 'Cancha desconocida'}</span></td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{reservation.startTime} - {reservation.endTime}</td>
                    <td className="py-3 pr-4"><div><p className="text-gray-900 dark:text-white">{reservation.customer?.fullName}</p><p className="text-sm text-gray-500">{reservation.customer?.phone}</p></div></td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${reservation.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {reservation.status === 'confirmed' ? 'Confirmada' : reservation.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                      </span>
                    </td>
                    <td className="py-3">
                      {reservation.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => onConfirm(reservation.id)} className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs">✓ Confirmar</button>
                          <button onClick={() => onCancel(reservation.id)} className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs">✕ Cancelar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No hay reservas para hoy</div>
      )}
    </div>
    {pendingReservations.length > 0 && (
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 mb-2">⏳ {pendingReservations.length} reservas pendientes de confirmar</h3>
        <p className="text-sm text-orange-600 dark:text-orange-300">Ve a la pestaña de Reservas para gestionarlas</p>
      </div>
    )}
  </div>
);

const ReservasCourtsTab = ({ courts, onOpenModal, onDeleteCourt, onSelectCourt, onSetActiveTab }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Canchas</h2>
      <button onClick={() => onOpenModal()} className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg flex items-center gap-2"><span>+</span>Nueva Cancha</button>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {courts.map(court => {
        const courtType = COURT_TYPES[court.type?.toUpperCase()?.replace('-', '_')] || COURT_TYPES.FUTBOL_5;
        return (
          <div key={court.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center"><span className="text-2xl">{courtType.icon}</span></div>
                <div><h3 className="font-bold text-gray-900 dark:text-white">{court.name}</h3><p className="text-sm text-blue-700 dark:text-yellow-400">{courtType.name}</p></div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${court.isActive !== false ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {court.isActive !== false ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{court.description || 'Sin descripción'}</p>
            {court.amenities && court.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {court.amenities.slice(0, 4).map((amenity) => (
                  <span key={amenity} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300">{amenity}</span>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-4 border-t dark:border-gray-600">
              <button onClick={() => onOpenModal(court)} className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium">✏️ Editar</button>
              <button onClick={() => { onSelectCourt(court); onSetActiveTab('pricing'); }} className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg text-sm font-medium">💰 Precios</button>
              <button onClick={() => onDeleteCourt(court.id)} className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium">🗑️</button>
            </div>
          </div>
        );
      })}
    </div>
    {courts.length === 0 && (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">🏟️</span>
        <p className="text-gray-500 dark:text-gray-400 mb-4">No hay canchas registradas</p>
        <button onClick={() => onOpenModal()} className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg">Crear primera cancha</button>
      </div>
    )}
  </div>
);

const ReservasReservationsTab = ({ reservations, courts, formatPrice, onConfirm, onCancel, onComplete }) => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Todas las Reservas</h2>
    {reservations.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
              <th className="pb-3 pr-4">Código</th><th className="pb-3 pr-4">Fecha</th><th className="pb-3 pr-4">Cancha</th><th className="pb-3 pr-4">Horario</th><th className="pb-3 pr-4">Cliente</th><th className="pb-3 pr-4">Precio</th><th className="pb-3 pr-4">Estado</th><th className="pb-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.sort((a, b) => new Date(b.date) - new Date(a.date)).map(reservation => {
              const court = courts.find(c => c.id === reservation.courtId);
              return (
                <tr key={reservation.id} className="border-b dark:border-gray-700">
                  <td className="py-3 pr-4"><code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{reservation.code}</code></td>
                  <td className="py-3 pr-4 text-gray-900 dark:text-white">{new Date(reservation.date + 'T00:00:00').toLocaleDateString('es-CO')}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{court?.name || 'N/A'}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{reservation.startTime} - {reservation.endTime}</td>
                  <td className="py-3 pr-4"><div><p className="text-gray-900 dark:text-white text-sm">{reservation.customer?.fullName}</p><p className="text-xs text-gray-500">{reservation.customer?.phone}</p></div></td>
                  <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white">{formatPrice(reservation.price)}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${reservation.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : reservation.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {reservation.status === 'confirmed' ? 'Confirmada' : reservation.status === 'pending' ? 'Pendiente' : reservation.status === 'completed' ? 'Completada' : 'Cancelada'}
                    </span>
                  </td>
                  <td className="py-3">
                    {reservation.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => onConfirm(reservation.id)} className="p-1 text-blue-700 hover:bg-blue-50 rounded" title="Confirmar">✓</button>
                        <button onClick={() => onCancel(reservation.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Cancelar">✕</button>
                      </div>
                    )}
                    {reservation.status === 'confirmed' && (
                      <button onClick={() => onComplete(reservation.id)} className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs">Completar</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-12"><span className="text-6xl mb-4 block">📅</span><p className="text-gray-500 dark:text-gray-400">No hay reservas registradas</p></div>
    )}
  </div>
);

const ReservasCourtModal = ({ editingCourt, setEditingCourt, onSave, onClose }) => {
  if (!editingCourt) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700"><h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingCourt.id ? 'Editar Cancha' : 'Nueva Cancha'}</h2></div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="court-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la cancha *</label>
            <input id="court-name" type="text" value={editingCourt.name} onChange={(e) => setEditingCourt({ ...editingCourt, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Ej: Cancha Principal" />
          </div>
          <div>
            <label htmlFor="court-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de cancha *</label>
            <select id="court-type" value={editingCourt.type} onChange={(e) => setEditingCourt({ ...editingCourt, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              {Object.values(COURT_TYPES).map(type => (<option key={type.id} value={type.id}>{type.icon} {type.name} ({type.dimensions})</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="court-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea id="court-description" value={editingCourt.description} onChange={(e) => setEditingCourt({ ...editingCourt, description: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Describe las características de la cancha..." />
          </div>
          <div>
            <label htmlFor="court-amenities" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amenidades (separadas por coma)</label>
            <input id="court-amenities" type="text" value={editingCourt.amenities?.join(', ') || ''} onChange={(e) => setEditingCourt({ ...editingCourt, amenities: e.target.value.split(',').map(a => a.trim()).filter(a => a) })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Ej: Iluminación LED, Vestuarios, Parqueadero" />
          </div>
          <div>
            <label htmlFor="court-base-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio base por hora ($)</label>
            <input id="court-base-price" type="number" value={editingCourt.pricing?.basePrice || 80000} onChange={(e) => setEditingCourt({ ...editingCourt, pricing: { ...editingCourt.pricing, basePrice: Number(e.target.value) } })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={editingCourt.isActive !== false} onChange={(e) => setEditingCourt({ ...editingCourt, isActive: e.target.checked })} className="w-4 h-4 text-blue-700 rounded" />
            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Cancha activa (disponible para reservas)</label>
          </div>
        </div>
        <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Cancelar</button>
          <button onClick={onSave} className="px-6 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg">Guardar</button>
        </div>
      </div>
    </div>
  );
};

const ReservasSettingsModal = ({ settings, onUpdate, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b dark:border-gray-700"><h2 className="text-xl font-bold text-gray-900 dark:text-white">⚙️ Configuración del Negocio</h2></div>
      <div className="p-6 space-y-4">
        {[
          { id: 'settings-business-name', label: 'Nombre del negocio', field: 'businessName', type: 'text' },
          { id: 'settings-address', label: 'Dirección', field: 'businessAddress', type: 'text' },
          { id: 'settings-phone', label: 'Teléfono', field: 'businessPhone', type: 'text' },
          { id: 'settings-email', label: 'Email', field: 'businessEmail', type: 'email' },
          { id: 'settings-whatsapp', label: 'WhatsApp', field: 'whatsappNumber', type: 'text', placeholder: '+57 300 123 4567' },
        ].map(({ id, label, field, type, placeholder }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input id={id} type={type} value={settings?.[field] || ''} onChange={(e) => onUpdate({ [field]: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder={placeholder} />
          </div>
        ))}
        <div>
          <label htmlFor="settings-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción del negocio</label>
          <textarea id="settings-description" value={settings?.businessDescription || ''} onChange={(e) => onUpdate({ businessDescription: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
            <input id="settings-instagram" type="text" value={settings?.socialInstagram || ''} onChange={(e) => onUpdate({ socialInstagram: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="@usuario" />
          </div>
          <div>
            <label htmlFor="settings-facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook</label>
            <input id="settings-facebook" type="text" value={settings?.socialFacebook || ''} onChange={(e) => onUpdate({ socialFacebook: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Página" />
          </div>
        </div>
      </div>
      <div className="p-6 border-t dark:border-gray-700 flex justify-end">
        <button onClick={onClose} className="px-6 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg">Guardar y Cerrar</button>
      </div>
    </div>
  </div>
);

const ReservasStatsCards = ({ stats, formatPrice }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[
      { label: 'Canchas Activas', value: stats.activeCourts, icon: '🏟️', color: 'yellow' },
      { label: 'Reservas Hoy', value: stats.todayReservations, icon: '📅', color: 'blue' },
      { label: 'Pendientes', value: stats.pendingReservations, icon: '⏳', color: 'orange', valueClass: 'text-orange-500' },
      { label: 'Ingresos del Mes', value: formatPrice(stats.monthRevenue), icon: '💰', color: 'yellow', valueClass: 'text-yellow-600 text-2xl' },
    ].map(({ label, value, icon, color, valueClass }) => (
      <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`text-3xl font-bold text-gray-900 dark:text-white ${valueClass || ''}`}>{value}</p>
          </div>
          <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-full flex items-center justify-center`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ReservasBulkTab = ({
  courts, bulkItems, bulkCustomer, bulkNotes, bulkResult, newBulkItem,
  setBulkItems, setBulkCustomer, setBulkNotes, setBulkResult, setNewBulkItem,
  getAvailableSlots, createBulkReservation, formatPrice
}) => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">📦 Reserva Múltiple de Canchas</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Reserva varias canchas en diferentes días y horarios de una sola vez. Ideal para torneos y eventos.</p>
    {bulkResult && (
      <div className={`mb-6 p-5 rounded-xl border-2 ${bulkResult.failed === 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{bulkResult.failed === 0 ? '✅' : '⚠️'}</span>
          <h3 className="font-bold text-gray-900 dark:text-white">Reservas creadas: {bulkResult.successful}/{bulkResult.total}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Código de grupo: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded font-mono text-sm">{bulkResult.bulkCode}</code></p>
        <p className="text-lg font-black text-gray-900 dark:text-white mt-2">Total: {formatPrice(bulkResult.totalPrice)}</p>
        {bulkResult.failed > 0 && <p className="text-sm text-red-600 mt-2">{bulkResult.failed} reservas fallaron por horarios no disponibles</p>}
        <button onClick={() => setBulkResult(null)} className="mt-3 text-sm text-sky-600 hover:underline">Cerrar</button>
      </div>
    )}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><span>➕</span> Agregar Cancha a la Reserva</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="bulk-court" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cancha</label>
              <select id="bulk-court" value={newBulkItem.courtId} onChange={(e) => setNewBulkItem(prev => ({ ...prev, courtId: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm">
                <option value="">Seleccionar cancha</option>
                {courts.filter(c => c.isActive !== false).map(court => (<option key={court.id} value={court.id}>{court.name}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="bulk-date" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
              <input id="bulk-date" type="date" value={newBulkItem.date} onChange={(e) => setNewBulkItem(prev => ({ ...prev, date: e.target.value, startTime: '' }))} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
            </div>
            <div>
              <label htmlFor="bulk-time" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Horario</label>
              <select id="bulk-time" value={newBulkItem.startTime} onChange={(e) => setNewBulkItem(prev => ({ ...prev, startTime: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" disabled={!newBulkItem.courtId || !newBulkItem.date}>
                <option value="">Seleccionar horario</option>
                {newBulkItem.courtId && newBulkItem.date && getAvailableSlots(newBulkItem.courtId, newBulkItem.date).filter(s => s.isAvailable).map(slot => (<option key={slot.startTime} value={slot.startTime}>{slot.label} — {slot.formattedPrice}</option>))}
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              if (!newBulkItem.courtId || !newBulkItem.date || !newBulkItem.startTime) return;
              const court = courts.find(c => c.id === newBulkItem.courtId);
              const slots = getAvailableSlots(newBulkItem.courtId, newBulkItem.date);
              const slot = slots.find(s => s.startTime === newBulkItem.startTime);
              if (!slot) return;
              setBulkItems(prev => [...prev, { id: Date.now(), courtId: newBulkItem.courtId, courtName: court?.name || '', date: newBulkItem.date, startTime: slot.startTime, endTime: slot.endTime, label: slot.label, price: slot.price, formattedPrice: slot.formattedPrice }]);
              setNewBulkItem({ courtId: newBulkItem.courtId, date: newBulkItem.date, startTime: '' });
            }}
            disabled={!newBulkItem.courtId || !newBulkItem.date || !newBulkItem.startTime}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm transition-colors"
          >
            + Agregar a la lista
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">📋 Canchas seleccionadas ({bulkItems.length})</h3>
            {bulkItems.length > 0 && <button onClick={() => setBulkItems([])} className="text-xs text-red-500 hover:text-red-700">Limpiar todo</button>}
          </div>
          {bulkItems.length > 0 ? (
            <div className="divide-y dark:divide-gray-700">
              {bulkItems.map((item, index) => (
                <div key={item.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-400 w-6">{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{item.courtName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.date + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })} — {item.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{item.formattedPrice}</span>
                    <button onClick={() => setBulkItems(prev => prev.filter(i => i.id !== item.id))} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">✕</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400"><span className="text-4xl block mb-2">📦</span><p className="text-sm">Agrega canchas, fechas y horarios a la reserva</p></div>
          )}
        </div>
      </div>
      <div className="space-y-5">
        <div className="bg-linear-to-br from-sky-50 to-sky-100 dark:from-sky-900/30 dark:to-sky-800/30 rounded-xl p-5 border-2 border-sky-200 dark:border-sky-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total del alquiler</p>
          <p className="text-3xl font-black text-sky-700 dark:text-sky-400" style={{ fontFamily: "'Exo 2', sans-serif" }}>{formatPrice(bulkItems.reduce((sum, item) => sum + item.price, 0))}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bulkItems.length} cancha(s) × {[...new Set(bulkItems.map(i => i.date))].length} día(s)</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm"><span>👤</span> Datos del Cliente</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Nombre completo" value={bulkCustomer.fullName} onChange={(e) => setBulkCustomer(prev => ({ ...prev, fullName: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
            <input type="email" placeholder="Email" value={bulkCustomer.email} onChange={(e) => setBulkCustomer(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
            <input type="tel" placeholder="Teléfono" value={bulkCustomer.phone} onChange={(e) => setBulkCustomer(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
            <textarea placeholder="Notas (torneo, evento, etc.)" value={bulkNotes} onChange={(e) => setBulkNotes(e.target.value)} rows={2} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm resize-none" />
          </div>
        </div>
        <button
          onClick={() => {
            if (bulkItems.length === 0) return alert('Agrega al menos una cancha');
            if (!bulkCustomer.fullName.trim()) return alert('Nombre del cliente requerido');
            if (!bulkCustomer.phone.trim()) return alert('Teléfono del cliente requerido');
            const result = createBulkReservation({ items: bulkItems, customer: bulkCustomer, notes: bulkNotes });
            setBulkResult(result);
            setBulkItems([]);
            setBulkNotes('');
          }}
          disabled={bulkItems.length === 0}
          className="w-full py-3.5 bg-linear-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
        >
          <span>📦</span> Confirmar {bulkItems.length} Reserva(s)
        </button>
      </div>
    </div>
  </div>
);

const ReservasPricingTab = ({ courts, selectedCourt, setSelectedCourt, updateCourtOperatingHours, updateCourtPricing, formatPrice }) => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Configuración de Precios</h2>
    <div className="mb-6">
      <label htmlFor="pricing-court-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seleccionar Cancha</label>
      <select id="pricing-court-select" value={selectedCourt?.id || ''} onChange={(e) => setSelectedCourt(courts.find(c => c.id === Number(e.target.value)))} className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
        <option value="">Selecciona una cancha</option>
        {courts.map(court => (<option key={court.id} value={court.id}>{court.name}</option>))}
      </select>
    </div>
    {selectedCourt ? (
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🕐 Horarios de Funcionamiento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DAYS_OF_WEEK.map(day => {
              const hours = selectedCourt.operatingHours?.find(h => h.dayOfWeek === day.id) || { openTime: '06:00', closeTime: '23:00', isOpen: true };
              return (
                <div key={day.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900 dark:text-white">{day.name}</span>
                    <label aria-label={`Disponible: ${day.name}`} className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={hours.isOpen} onChange={(e) => {
                        const newHours = [...(selectedCourt.operatingHours || [])];
                        const idx = newHours.findIndex(h => h.dayOfWeek === day.id);
                        if (idx >= 0) { newHours[idx] = { ...newHours[idx], isOpen: e.target.checked }; } else { newHours.push({ dayOfWeek: day.id, isOpen: e.target.checked, openTime: '06:00', closeTime: '23:00' }); }
                        updateCourtOperatingHours(selectedCourt.id, newHours);
                        setSelectedCourt({ ...selectedCourt, operatingHours: newHours });
                      }} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-700"></div>
                    </label>
                  </div>
                  {hours.isOpen && (
                    <div className="flex gap-2 text-sm">
                      <input type="time" value={hours.openTime} onChange={(e) => {
                        const newHours = [...(selectedCourt.operatingHours || [])];
                        const idx = newHours.findIndex(h => h.dayOfWeek === day.id);
                        if (idx >= 0) { newHours[idx] = { ...newHours[idx], openTime: e.target.value }; }
                        updateCourtOperatingHours(selectedCourt.id, newHours);
                        setSelectedCourt({ ...selectedCourt, operatingHours: newHours });
                      }} className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                      <span className="text-gray-400">a</span>
                      <input type="time" value={hours.closeTime} onChange={(e) => {
                        const newHours = [...(selectedCourt.operatingHours || [])];
                        const idx = newHours.findIndex(h => h.dayOfWeek === day.id);
                        if (idx >= 0) { newHours[idx] = { ...newHours[idx], closeTime: e.target.value }; }
                        updateCourtOperatingHours(selectedCourt.id, newHours);
                        setSelectedCourt({ ...selectedCourt, operatingHours: newHours });
                      }} className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💰 Precios por Franja Horaria</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(TIME_SLOT_CATEGORIES).map(category => {
              const courtType = COURT_TYPES[selectedCourt.type?.toUpperCase()?.replace('-', '_')] || COURT_TYPES.FUTBOL_5;
              const basePrice = selectedCourt.pricing?.basePrice || courtType.defaultPrice;
              const customPrice = selectedCourt.customPricing?.find(cp => cp.category === category.id);
              const calculatedPrice = customPrice?.price || Math.round(basePrice * category.priceMultiplier);
              return (
                <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{category.id === 'morning' ? '🌅' : category.id === 'afternoon' ? '☀️' : '🌙'}</span>
                    <div><p className="font-medium text-gray-900 dark:text-white">{category.name}</p><p className="text-xs text-gray-500">{category.startTime} - {category.endTime}</p></div>
                  </div>
                  <div className="mb-2">
                    <label htmlFor={`category-price-${category.id}`} className="text-xs text-gray-500">Precio por hora</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">$</span>
                      <input id={`category-price-${category.id}`} type="number" value={calculatedPrice} onChange={(e) => {
                        const newPricing = [...(selectedCourt.customPricing || [])];
                        const idx = newPricing.findIndex(cp => cp.category === category.id);
                        const newPrice = { category: category.id, price: Number(e.target.value) };
                        if (idx >= 0) { newPricing[idx] = newPrice; } else { newPricing.push(newPrice); }
                        updateCourtPricing(selectedCourt.id, newPricing);
                        setSelectedCourt({ ...selectedCourt, customPricing: newPricing });
                      }} className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Base: {formatPrice(basePrice)} × {category.priceMultiplier}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <span className="text-5xl mb-4 block">💰</span>
        <p className="text-gray-500 dark:text-gray-400">Selecciona una cancha para configurar sus precios</p>
      </div>
    )}
  </div>
);

const ReservasAdmin = () => {
  const {
    courts,
    reservations,
    settings,
    getStats,
    getAvailableSlots,
    saveCourt,
    deleteCourt,
    updateCourtOperatingHours,
    updateCourtPricing,
    updateSettings,
    updateReservationStatus,
    cancelReservation,
    createBulkReservation,
    formatPrice,
    logoutAdmin
  } = useReservas();

  const [uiState, dispatchUI] = useReducer(mergeReducer, uiInitialState);
  const { activeTab, selectedCourt, showCourtModal, showSettingsModal, editingCourt } = uiState;
  const setActiveTab = (val) => dispatchUI({ activeTab: val });
  const setSelectedCourt = (val) => dispatchUI({ selectedCourt: val });
  const setShowCourtModal = (val) => dispatchUI({ showCourtModal: val });
  const setShowSettingsModal = (val) => dispatchUI({ showSettingsModal: val });
  const setEditingCourt = (val) => dispatchUI({ editingCourt: typeof val === 'function' ? val(uiState.editingCourt) : val });

  const [bulkState, dispatchBulk] = useReducer(mergeReducer, bulkInitialState);
  const { bulkItems, bulkCustomer, bulkNotes, bulkResult, newBulkItem } = bulkState;
  const setBulkItems = (val) => dispatchBulk({ bulkItems: typeof val === 'function' ? val(bulkState.bulkItems) : val });
  const setBulkCustomer = (val) => dispatchBulk({ bulkCustomer: typeof val === 'function' ? val(bulkState.bulkCustomer) : val });
  const setBulkNotes = (val) => dispatchBulk({ bulkNotes: val });
  const setBulkResult = (val) => dispatchBulk({ bulkResult: val });
  const setNewBulkItem = (val) => dispatchBulk({ newBulkItem: typeof val === 'function' ? val(bulkState.newBulkItem) : val });

  const stats = getStats();

  // Filtrar reservaciones por estado
  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const todayReservations = reservations.filter(r => 
    r.date === new Date().toISOString().split('T')[0]
  );

  const handleLogout = () => {
    if (window.confirm('¿Seguro que deseas cerrar sesión?')) {
      logoutAdmin();
    }
  };

  const openCourtModal = (court = null) => {
    setEditingCourt(court ? { ...court } : {
      name: '',
      type: 'futbol_5',
      description: '',
      amenities: [],
      isActive: true,
      operatingHours: DAYS_OF_WEEK.map(day => ({
        dayOfWeek: day.id,
        openTime: '06:00',
        closeTime: '23:00',
        isOpen: true
      })),
      pricing: { basePrice: 80000 },
      customPricing: []
    });
    setShowCourtModal(true);
  };

  const handleSaveCourt = () => {
    if (!editingCourt.name.trim()) {
      alert('El nombre de la cancha es requerido');
      return;
    }
    saveCourt(editingCourt);
    setShowCourtModal(false);
    setEditingCourt(null);
  };

  const handleDeleteCourt = (courtId) => {
    if (window.confirm('¿Seguro que deseas eliminar esta cancha?')) {
      deleteCourt(courtId);
    }
  };

  const handleConfirmReservation = (reservationId) => {
    updateReservationStatus(reservationId, 'confirmed');
  };

  const handleCancelReservation = (reservationId) => {
    const reason = prompt('Motivo de cancelación (opcional):');
    cancelReservation(reservationId, reason || '');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏟️</span>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Reservas</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Configuración"
              >
                ⚙️
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <ReservasStatsCards stats={stats} formatPrice={formatPrice} />

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-8 overflow-hidden">
          <div className="border-b dark:border-gray-700 overflow-x-auto scrollbar-thin">
            <nav className="flex -mb-px min-w-max">
              {[
                { id: 'dashboard', label: 'Dashboard', shortLabel: 'Inicio', icon: '📊' },
                { id: 'courts', label: 'Canchas', shortLabel: 'Canchas', icon: '🏟️' },
                { id: 'reservations', label: 'Reservas', shortLabel: 'Reservas', icon: '📅' },
                { id: 'bulk', label: 'Reserva Múltiple', shortLabel: 'Múltiple', icon: '📦' },
                { id: 'pricing', label: 'Precios', shortLabel: 'Precios', icon: '💰' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-700 text-blue-700 dark:text-yellow-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-3 sm:p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <ReservasDashboardTab
                todayReservations={todayReservations}
                pendingReservations={pendingReservations}
                courts={courts}
                onConfirm={handleConfirmReservation}
                onCancel={handleCancelReservation}
              />
            )}

            {/* Courts Tab */}
            {activeTab === 'courts' && (
              <ReservasCourtsTab
                courts={courts}
                onOpenModal={openCourtModal}
                onDeleteCourt={handleDeleteCourt}
                onSelectCourt={setSelectedCourt}
                onSetActiveTab={setActiveTab}
              />
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <ReservasReservationsTab
                reservations={reservations}
                courts={courts}
                formatPrice={formatPrice}
                onConfirm={handleConfirmReservation}
                onCancel={handleCancelReservation}
                onComplete={(id) => updateReservationStatus(id, 'completed')}
              />
            )}

            {/* Bulk Reservation Tab */}
            {activeTab === 'bulk' && (
              <ReservasBulkTab
                courts={courts}
                bulkItems={bulkItems}
                bulkCustomer={bulkCustomer}
                bulkNotes={bulkNotes}
                bulkResult={bulkResult}
                newBulkItem={newBulkItem}
                setBulkItems={setBulkItems}
                setBulkCustomer={setBulkCustomer}
                setBulkNotes={setBulkNotes}
                setBulkResult={setBulkResult}
                setNewBulkItem={setNewBulkItem}
                getAvailableSlots={getAvailableSlots}
                createBulkReservation={createBulkReservation}
                formatPrice={formatPrice}
              />
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <ReservasPricingTab
                courts={courts}
                selectedCourt={selectedCourt}
                setSelectedCourt={setSelectedCourt}
                updateCourtOperatingHours={updateCourtOperatingHours}
                updateCourtPricing={updateCourtPricing}
                formatPrice={formatPrice}
              />
            )}
          </div>
        </div>
      </div>

      {/* Court Modal */}
      {showCourtModal && (
        <ReservasCourtModal
          editingCourt={editingCourt}
          setEditingCourt={setEditingCourt}
          onSave={handleSaveCourt}
          onClose={() => { setShowCourtModal(false); setEditingCourt(null); }}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <ReservasSettingsModal
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
      <ScrollToTopButton />
    </div>
  );
};

export default ReservasAdmin;
