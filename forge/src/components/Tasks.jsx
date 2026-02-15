import React, { useState } from 'react';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review Q3 designs', completed: false, priority: 'High' },
    { id: 2, text: 'Update documentation', completed: true, priority: 'Medium' },
    { id: 3, text: 'Client meeting prep', completed: false, priority: 'Low' },
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = {
      id: Date.now(),
      text: newTask,
      completed: false,
      priority: 'Medium'
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1 className="page-title">Tasks</h1>
        <div className="task-stats">
          {tasks.filter(t => t.completed).length}/{tasks.length} Completed
        </div>
      </div>

      <form onSubmit={addTask} className="add-task-form">
        <input 
          type="text" 
          placeholder="Add a new task..." 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="add-task-input"
        />
        <button type="submit" className="add-task-btn">+</button>
      </form>

      <div className="tasks-list">
        {tasks.map(task => (
          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-left">
              <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={() => toggleTask(task.id)}
                className="task-checkbox"
              />
              <span className="task-text">{task.text}</span>
            </div>
            <div className="task-right">
              <span className={`task-priority ${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
              <button 
                onClick={() => deleteTask(task.id)}
                className="delete-task-btn"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="empty-tasks">
            No tasks yet. Add one above!
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;