import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

function Login() {
  const { setShowLogin, login, register } = useAppContext();
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (state === "register") {
        result = await register(name, email, password);
      } else {
        result = await login(email, password);
      }

      if (result.success) {
        setShowLogin(false);
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
      } else {
        toast.error(result.message || "Authentication failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setState(state === "login" ? "register" : "login");
    // Reset form
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div 
      onClick={() => setShowLogin(false)} 
      className='fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
    >
      <form 
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col gap-4 p-8 w-80 sm:w-[400px] rounded-xl shadow-2xl border border-gray-300 bg-white"
      >
        <button
          type="button"
          onClick={() => setShowLogin(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {state === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        
        <p className="text-center text-gray-600 mb-6">
          {state === "login" ? "Sign in to your account" : "Join us today!"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              type="text"
              required
              disabled={loading}
            />
          </div>
        )}

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="you@example.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            type="email"
            required
            disabled={loading}
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="••••••••"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            type="password"
            required
            minLength="6"
            disabled={loading}
          />
          {state === "login" && (
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm mt-2">
          <button
            type="button"
            onClick={switchMode}
            className="text-blue-600 hover:text-blue-800 font-medium transition"
            disabled={loading}
          >
            {state === "login" 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"}
          </button>
          
          {state === "login" && (
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              Forgot password?
            </button>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {state === "register" ? "Creating Account..." : "Signing In..."}
            </span>
          ) : (
            state === "register" ? "Create Account" : "Sign In"
          )}
        </button>

        <div className="text-center text-xs text-gray-500 mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </form>
    </div>
  );
}

export default Login;