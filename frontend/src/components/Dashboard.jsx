import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard({ onLogout }) {
  const [stats, setStats] = useState({
    agents: 17,
    activeAgents: 3,
    dailyCost: 8.45,
    localProcessing: 73
  })

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : '/api'

  const agents = [
    { id: 'george', name: 'George 🦞', role: 'Chief of Staff', status: 'active' },
    { id: 'jason', name: 'Jason 🔧', role: 'Code Agent', status: 'standby' },
    { id: 'echo', name: 'Echo 📡', role: 'Research Agent', status: 'active' },
    { id: 'splash', name: 'Splash 🚗', role: 'Car Wash Operations', status: 'standby' },
    { id: 'foam', name: 'Foam 🏠', role: 'Spray Foam Business', status: 'standby' },
    { id: 'trigger', name: 'Trigger 🎯', role: 'Gun Store Operations', status: 'standby' },
    { id: 'wrench', name: 'Wrench 🔨', role: 'Hardware Store', status: 'standby' },
    { id: 'vault', name: 'Vault 💰', role: 'Financial Agent', status: 'active' },
  ]

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🚀 OpsPilot Mission Control</h1>
        <div className="header-actions">
          <span>Welcome back, Johnny!</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Agents</h3>
          <div className="stat-value">{stats.agents}</div>
        </div>
        <div className="stat-card">
          <h3>Active Agents</h3>
          <div className="stat-value active">{stats.activeAgents}</div>
        </div>
        <div className="stat-card">
          <h3>Daily Cost</h3>
          <div className="stat-value">${stats.dailyCost}</div>
        </div>
        <div className="stat-card">
          <h3>Local Processing</h3>
          <div className="stat-value">{stats.localProcessing}%</div>
        </div>
      </div>

      <div className="agents-section">
        <h2>Agent Status</h2>
        <div className="agents-grid">
          {agents.map(agent => (
            <div key={agent.id} className={`agent-card ${agent.status}`}>
              <h3>{agent.name}</h3>
              <p>{agent.role}</p>
              <span className={`status ${agent.status}`}>
                {agent.status === 'active' ? '🟢 Active' : '⚪ Standby'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn">📊 View Reports</button>
          <button className="action-btn">🎯 Assign Task</button>
          <button className="action-btn">⚙️ Settings</button>
          <button className="action-btn">📈 Analytics</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard