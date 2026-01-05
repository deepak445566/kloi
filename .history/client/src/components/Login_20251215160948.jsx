import React from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

function Login() {
  const { setShowLogin, loginUser, registerUser, navigate } = useAppContext();
  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (state === "register") {
        result = await registerUser(name, email, password);
      } else {
        result = await loginUser(email, password);
      }

      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error("Login/Register error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className='fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/50'
      onClick={() => setShowLogin(false)}
    >
      <form 
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
        </p>
        
        {state === "register" && (
          <div className="w-full">
            <p className="mb-1">Name</p>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              required
              disabled={loading}
            />
          </div>
        )}
        
        <div className="w-full">
          <p className="mb-1">Email</p>
          <input 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            required
            disabled={loading}
          />
        </div>
        
        <div className="w-full">
          <p className="mb-1">Password</p>
          <input 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            required
            minLength="6"
            disabled={loading}
          />
        </div>
        
        <div className="w-full text-center">
          {state === "register" ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setState("login")}
                className="text-blue-600 hover:text-blue-800 font-medium"
                disabled={loading}
              >
                Login here
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setState("register")}
                className="text-blue-600 hover:text-blue-800 font-medium"
                disabled={loading}
              >
                Sign up here
              </button>
            </p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {state === "register" ? "Creating Account..." : "Logging in..."}
            </span>
          ) : (
            state === "register" ? "Create Account" : "Login"
          )}
        </button>
        
        <button
          type="button"
          onClick={() => setShowLogin(false)}
          className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default Login;