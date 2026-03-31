import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Login from './components/Login'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = (token) => {
    localStorage.setItem('authToken', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div className="loading">Loading OpsPilot...</div>
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App