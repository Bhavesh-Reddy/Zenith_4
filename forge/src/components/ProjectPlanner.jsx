import React, { useState } from 'react';
import './ProjectPlanner.css';

const ProjectPlanner = () => {
  const [boards, setBoards] = useState({
    todo: [
      { id: 1, title: 'Design System', description: 'Define typography & colors', priority: 'high' },
      { id: 2, title: 'Auth Flow', description: 'Implement login/signup', priority: 'medium' },
    ],
    inProgress: [
      { id: 3, title: 'API Integration', description: 'Fetch data for dashboard', priority: 'high' },
    ],
    review: [
      { id: 4, title: 'Landing Page', description: 'Fix responsive issues', priority: 'low' },
    ],
    done: [
      { id: 5, title: 'Project Setup', description: 'Init repo & dependencies', priority: 'medium' },
    ],
  });

  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeColumn, setActiveColumn] = useState('todo');

  const columns = [
    { id: 'todo', title: 'To Do', color: '#6366f1' },
    { id: 'inProgress', title: 'In Progress', color: '#f59e0b' },
    { id: 'review', title: 'Review', color: '#8b5cf6' },
    { id: 'done', title: 'Done', color: '#10b981' },
  ];

  const handleAddTaskClick = (columnId) => {
    setActiveColumn(columnId);
    setShowAddTask(true);
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
    };
    setBoards({ ...boards, [activeColumn]: [...boards[activeColumn], task] });
    setNewTask({ title: '', description: '', priority: 'medium' });
    setShowAddTask(false);
  };

  const deleteTask = (columnId, taskId) => {
    setBoards({
      ...boards,
      [columnId]: boards[columnId].filter(task => task.id !== taskId),
    });
  };

  const moveTask = (taskId, fromCol, toCol) => {
    const task = boards[fromCol].find(t => t.id === taskId);
    setBoards({
      ...boards,
      [fromCol]: boards[fromCol].filter(t => t.id !== taskId),
      [toCol]: [...boards[toCol], task],
    });
  };

  const getPriorityColor = (p) => {
    if (p === 'high') return '#ef4444';
    if (p === 'medium') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="project-planner">
      <div className="planner-header">
        <div>
          <h1>Project Planner</h1>
          <p className="planner-subtitle">Manage tasks and track progress</p>
        </div>
        <button onClick={() => handleAddTaskClick('todo')} className="primary-btn">
          + New Task
        </button>
      </div>

      <div className="kanban-board">
        {columns.map(col => (
          <div key={col.id} className="kanban-column">
            <div className="column-header" style={{ borderTopColor: col.color }}>
              <div className="header-title">
                <span className="status-dot" style={{ background: col.color }}></span>
                <h3>{col.title}</h3>
              </div>
              <span className="task-count">{boards[col.id].length}</span>
            </div>
            
            <div className="column-content">
              {boards[col.id].map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <span className="priority-badge" style={{ borderColor: getPriorityColor(task.priority), color: getPriorityColor(task.priority) }}>
                      {task.priority}
                    </span>
                    <button onClick={() => deleteTask(col.id, task.id)} className="delete-task-btn">×</button>
                  </div>
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  
                  <div className="task-footer">
                    {col.id !== 'todo' && (
                      <button className="move-btn" onClick={() => moveTask(task.id, col.id, columns[columns.findIndex(c => c.id === col.id) - 1].id)}>←</button>
                    )}
                    <div className="spacer"></div>
                    {col.id !== 'done' && (
                      <button className="move-btn" onClick={() => moveTask(task.id, col.id, columns[columns.findIndex(c => c.id === col.id) + 1].id)}>→</button>
                    )}
                  </div>
                </div>
              ))}
              <button className="ghost-add-btn" onClick={() => handleAddTaskClick(col.id)}>+ Add</button>
            </div>
          </div>
        ))}
      </div>

      {showAddTask && (
        <div className="modal-overlay" onClick={() => setShowAddTask(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Add to {columns.find(c => c.id === activeColumn).title}</h3>
            <input
              autoFocus
              className="modal-input"
              placeholder="Task Title"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              className="modal-textarea"
              placeholder="Description"
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            />
            <div className="modal-options">
              <label>Priority:</label>
              <select
                value={newTask.priority}
                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddTask(false)} className="btn-cancel">Cancel</button>
              <button onClick={addTask} className="btn-confirm">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPlanner;