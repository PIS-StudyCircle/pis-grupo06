import React from 'react';

const formatScheduleRules = (rules) => {
  if (!rules || rules.length === 0) return (
    <div className="text-sm text-gray-500 italic">
      Sin reglas de disponibilidad definidas
    </div>
  );

  const dayNames = {
    'sunday': 'Domingo',
    'monday': 'Lunes', 
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado'
  };

  return rules.map((rule, index) => {
    const dayName = rule.wday ? dayNames[rule.wday.toLowerCase()] || rule.wday : 'Día no especificado';
    
    return (
      <div key={index} className="text-sm bg-gray-50 border p-3 rounded-lg mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-blue-600 text-base">
            {dayName}
          </span>
          {rule.intervals && rule.intervals.length === 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
              No disponible
            </span>
          )}
        </div>
        
        {rule.intervals && rule.intervals.length > 0 ? (
          <div className="space-y-1">
            {rule.intervals.map((interval, intervalIndex) => (
              <div key={intervalIndex} className="flex items-center gap-2 text-sm">
                <span className="text-green-600 font-mono font-semibold">
                  {interval.from}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-red-600 font-mono font-semibold">
                  {interval.to}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            Sin horarios disponibles este día
          </div>
        )}
      </div>
    );
  });
};

const formatEvents = (events) => {
  if (!events || events.length === 0) return (
    <div className="text-sm text-gray-500 italic">
      No hay eventos programados esta semana
    </div>
  );

  const dayNames = {
    0: 'Domingo',
    1: 'Lunes', 
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
  };

  const monthNames = {
    0: 'Enero', 1: 'Febrero', 2: 'Marzo', 3: 'Abril', 4: 'Mayo', 5: 'Junio',
    6: 'Julio', 7: 'Agosto', 8: 'Septiembre', 9: 'Octubre', 10: 'Noviembre', 11: 'Diciembre'
  };

  return events.map((event, index) => {
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    // Obtener la zona horaria local del usuario
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const dayName = dayNames[startTime.getDay()];
    const day = startTime.getDate();
    const month = monthNames[startTime.getMonth()];
    const year = startTime.getFullYear();
    
    const startTimeStr = startTime.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: timeZone
    });
    const endTimeStr = endTime.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: timeZone
    });

    return (
      <div key={event.uri || index} className="text-sm bg-blue-50 border border-blue-200 p-3 rounded-lg mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-blue-800 text-base">
            {dayName}, {day} de {month} de {year}
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {event.status || 'Programado'}
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-mono font-semibold">
              {startTimeStr}
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-red-600 font-mono font-semibold">
              {endTimeStr}
            </span>
          </div>
          
          
        </div>
      </div>
    );
  });
};

const AuthenticatedState = ({ user, availability, events, loading, eventsLoading, onGetAvailability, onGetEvents, onDisconnect }) => {
  return (
    <div className="p-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-green-800 mb-2">
          ✅ Conectado exitosamente
        </h2>
        <div className="text-green-700 space-y-1">
          <p><strong>Nombre:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>URI:</strong> <span className="text-xs font-mono">{user?.uri}</span></p>
        </div>
        <button
          onClick={onDisconnect}
          className="mt-3 text-sm text-green-700 hover:text-green-900 underline"
        >
          Desconectar
        </button>
      </div>

      <div className="mb-4 flex gap-3">
        <button
          onClick={onGetAvailability}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '⏳ Cargando...' : '📅 Obtener Disponibilidad Real'}
        </button>
        <button
          onClick={onGetEvents}
          disabled={eventsLoading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {eventsLoading ? '⏳ Cargando...' : '📋 Ver Eventos de la Semana'}
        </button>
      </div>

      {availability.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Tu Disponibilidad Real:</h3>
          <div className="space-y-4">
            {availability.map((schedule, index) => (
              <div key={schedule.uri || index} className="border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-lg">{schedule.name || `Horario ${index + 1}`}</h4>
                  {schedule.default && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Por defecto
                    </span>
                  )}
                </div>
                
                
                
                <div>
                  <strong className="text-sm">Reglas:</strong>
                  {formatScheduleRules(schedule.rules)}
                </div>

                
              </div>
            ))}
          </div>
        </div>
      )}

      {availability.length === 0 && !loading && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700">
            Haz clic en "Obtener Disponibilidad Real" para cargar tus horarios
          </p>
        </div>
      )}

      {events.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold mb-4">📋 Eventos de esta Semana:</h3>
          <div className="space-y-4">
            {formatEvents(events)}
          </div>
        </div>
      )}

      {events.length === 0 && !eventsLoading && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mt-6">
          <p className="text-gray-700">
            Haz clic en "Ver Eventos de la Semana" para cargar tus eventos programados
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthenticatedState;