import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config.js'
export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Handle controlled input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear individual field error when user starts typing again
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setFieldErrors({});

    // Client-side quick checks (trimming whitespace)
    const trimmedUsername = formData.username.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();
    const trimmedConfirmPassword = formData.confirmPassword.trim();

    // 1. Client-side empty check
    if (
      !trimmedUsername ||
      !trimmedEmail ||
      !trimmedPassword ||
      !trimmedConfirmPassword
    ) {
      setServerError('All fields are required and cannot be empty.');
      return;
    }

    // 2. Client-side confirm password match check
    if (trimmedPassword !== trimmedConfirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
          password: trimmedPassword,
          confirmPassword: trimmedConfirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle express-validator validation errors array from backend
        if (data.errors && Array.isArray(data.errors)) {
          const errorsObj = {};
          data.errors.forEach((err) => {
            // express-validator attaches field name to err.path or err.param
            const fieldName = err.path || err.param;
            if (fieldName) {
              errorsObj[fieldName] = err.msg;
            }
          });
          setFieldErrors(errorsObj);
        } else {
          setServerError(
            data.message || 'Registration failed. Please try again.'
          );
        }
        return;
      }

      // Success: User created (201 Created) -> Navigate to Login page
      navigate('/login', {
        state: { message: 'Account created successfully! Please log in.' },
      });
    } catch (err) {
      console.error('Network Error:', err);
      setServerError(
        'Unable to connect to the server. Please check if your backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-100/90 backdrop-blur-sm rounded-lg shadow-2xl p-8 border border-stone-200/50">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">
          Create an Account
        </h2>

        {/* Server or Connection Error Alert */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="e.g. johndoe"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-3 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 transition text-gray-800 ${
                fieldErrors.username
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.username}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 transition text-gray-800 ${
                fieldErrors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 transition text-gray-800 ${
                fieldErrors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>
          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3 bg-white border rounded-md shadow-sm text-gray-800 ${
                fieldErrors.confirmPassword
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              required
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold p-3 rounded-md shadow-md transition duration-200 ease-in-out cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-700 font-semibold hover:underline"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
