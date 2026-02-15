import React from 'react';
import './Team.css';

const Team = () => {
  const members = [
    { id: 1, name: 'John Doe', role: 'Admin', email: 'john@example.com', status: 'online' },
    { id: 2, name: 'Sarah Smith', role: 'Editor', email: 'sarah@example.com', status: 'offline' },
    { id: 3, name: 'Mike Johnson', role: 'Viewer', email: 'mike@example.com', status: 'busy' },
  ];

  return (
    <div className="team-container">
      <div className="team-header">
        <h1 className="page-title">Team Members</h1>
        <button className="btn-primary invite-btn">Invite Member</button>
      </div>

      <div className="team-grid">
        {members.map(member => (
          <div key={member.id} className="member-card">
            <div className={`status-indicator ${member.status}`}></div>
            <div className="member-avatar">
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h3 className="member-name">{member.name}</h3>
            <span className="member-role">{member.role}</span>
            <span className="member-email">{member.email}</span>
            <div className="member-actions">
              <button className="btn-secondary btn-sm">Manage</button>
            </div>
          </div>
        ))}
        
        {/* Add Member Card Placeholder */}
        <div className="member-card add-card">
          <div className="add-icon">+</div>
          <span className="add-text">Add New Member</span>
        </div>
      </div>
    </div>
  );
};

export default Team;