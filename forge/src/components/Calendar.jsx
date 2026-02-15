import React, { useState } from 'react';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([
    { id: 1, title: 'Team Meeting', date: '2026-02-15', time: '10:00 AM', type: 'meeting' },
    { id: 2, title: 'Project Deadline', date: '2026-02-20', time: '5:00 PM', type: 'deadline' },
    { id: 3, title: 'Client Call', date: '2026-02-18', time: '2:00 PM', type: 'call' },
  ]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', type: 'meeting' });
  const [selectedDate, setSelectedDate] = useState(null);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = formatDate(date);
    return events.filter(event => event.date === dateStr);
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setNewEvent({ title: '', date: '', time: '', type: 'meeting' });
    setShowAddEvent(false);
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const days = getDaysInMonth(currentDate);

  const eventTypeColors = {
    meeting: '#6366f1',
    deadline: '#ef4444',
    call: '#10b981',
    event: '#f59e0b',
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>📅 Calendar & Events</h1>
        <button onClick={() => setShowAddEvent(true)} className="add-event-btn">
          + New Event
        </button>
      </div>

      {showAddEvent && (
        <div className="add-event-modal">
          <div className="modal-content">
            <h3>Create New Event</h3>
            <input
              type="text"
              placeholder="Event title..."
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="event-input"
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="event-input"
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              className="event-input"
            />
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              className="event-select"
            >
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="call">Call</option>
              <option value="event">Event</option>
            </select>
            <div className="modal-actions">
              <button onClick={addEvent} className="save-btn">Create Event</button>
              <button onClick={() => setShowAddEvent(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="calendar-nav">
        <button onClick={previousMonth} className="nav-btn">←</button>
        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={nextMonth} className="nav-btn">→</button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : [];
            const isToday = day && formatDate(day) === formatDate(today);
            const isSelected = day && selectedDate && formatDate(day) === formatDate(selectedDate);

            return (
              <div
                key={index}
                className={`calendar-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => day && setSelectedDate(day)}
              >
                {day && (
                  <>
                    <div className="day-number">{day.getDate()}</div>
                    <div className="day-events">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="event-dot"
                          style={{ backgroundColor: eventTypeColors[event.type] }}
                          title={event.title}
                        />
                      ))}
                      {dayEvents.length > 2 && <span className="more-events">+{dayEvents.length - 2}</span>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="upcoming-events">
        <h3>Upcoming Events</h3>
        <div className="events-list">
          {events
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(event => (
              <div key={event.id} className="event-item" style={{ borderLeftColor: eventTypeColors[event.type] }}>
                <div className="event-info">
                  <h4>{event.title}</h4>
                  <p>{event.date} at {event.time}</p>
                  <span className="event-type" style={{ backgroundColor: eventTypeColors[event.type] }}>
                    {event.type}
                  </span>
                </div>
                <button onClick={() => deleteEvent(event.id)} className="delete-event">
                  🗑️
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;