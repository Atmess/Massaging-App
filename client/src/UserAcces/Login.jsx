import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config.js'

  

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();
      login(data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save JWT token received from backend
      localStorage.setItem('token', data.token);

      // Redirect to posts feed
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/path-to-your-background.jpg')" }}
    >
      <div className="w-full max-w-md bg-stone-100/90 backdrop-blur-sm rounded-lg shadow-2xl p-8 border border-stone-200/50">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">
          Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold p-3 rounded-md shadow-md transition duration-200 ease-in-out cursor-pointer"
          >
            Log In
          </button>
        </form>
        <div className='py-2'>don't have accaunt <Link
                  to="/register"
                  className="text-blue-700 font-semibold hover:underline"
                >
                  Sign Up Here
                </Link></div>
      </div>
      
    </div>
  );
}
