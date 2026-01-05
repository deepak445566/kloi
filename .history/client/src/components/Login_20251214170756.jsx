import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

function Login() {
  const { setShowLogin, loginUser, registerUser, navigate } = useAppContext();
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (state === "register") {
        result = await registerUser({ name, email, password });
      } else {
        result = await loginUser({ email, password });
      }

      if (result.success) {
        toast.success(state === "register" ? "Account created successfully!" : "Logged in successfully!");
        navigate('/');
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
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={() => setShowLogin(false)} 
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
    >
      <form 
        onSubmit={onSubmitHandle} 
        onClick={(e) => e.stopPropagation()} 
        className="flex flex-col gap-6 m-4 p-8 w-full max-w-md rounded-xl shadow-2xl border border-gray-300 bg-white"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            <span className="text-green-600">Agro</span> Marketplace
          </h2>
          <p className="text-gray-600 mt-2">
            {state === "login" ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        {state === "register" && (
          <div className="w-full">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
              type="text"
              required
              disabled={loading}
            />
          </div>
        )}

        <div className="w-full">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            type="email"
            required
            disabled={loading}
          />
        </div>

        <div className="w-full">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Password
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            type="password"
            required
            disabled={loading}
          />
        </div>

        <div className="text-center">
          {state === "register" ? (
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setState("login")}
                className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                disabled={loading}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              New to Agro Marketplace?{" "}
              <button
                type="button"
                onClick={() => setState("register")}
                className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                disabled={loading}
              >
                Create Account
              </button>
            </p>
          )}
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 active:transform active:scale-95'
          }`}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            state === "register" ? "Create Account" : "Sign In"
          )}
        </button>

        <div className="text-center text-sm text-gray-500 mt-4">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-green-600 hover:underline">Terms</a>{" "}
          and{" "}
          <a href="/privacy" className="text-green-600 hover:underline">Privacy Policy</a>
        </div>
      </form>
    </div>
  );
}

export default Login;