import { useState } from 'react'
import axios from 'axios'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : '/api'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login'
      const response = await axios.post(`${API_BASE}${endpoint}`, {
        email,
        password,
        ...(isRegistering && { 
          first_name: 'User',
          last_name: 'OpsPilot',
          role: 'admin'
        })
      })

      onLogin(response.data.token)
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>🚀 OpsPilot</h1>
        <h2>Operations Management Platform</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>
        
        <p>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button 
            type="button" 
            onClick={() => setIsRegistering(!isRegistering)}
            className="link-button"
          >
            {isRegistering ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login