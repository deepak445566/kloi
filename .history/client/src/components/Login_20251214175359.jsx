import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

function Login() {
  const {setShowLogin, setUser, axios, navigate, fetchUser} = useAppContext();
  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmitHandle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload = {};

      if (state === "register") {
        payload = { name, email, password };
      } else {
        payload = { email, password };
      }

      console.log("Login/Register attempt:", state);
      
      const { data } = await axios.post(`/api/user/${state}`, payload, {
        withCredentials: true // ✅ IMPORTANT
      });

      console.log("Response:", data);

      if (data.success) {
        toast.success(data.message || `${state === 'login' ? 'Login' : 'Registration'} successful`);
        
        // ✅ MANUALLY REFETCH USER TO GET UPDATED DATA
        await fetchUser();
        
        navigate('/');
        setShowLogin(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Login/Register error:", error);
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setShowLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center text-sm text-gray-600 bg-black/50'>
        <form onSubmit={onSubmitHandle} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
          <p className="text-2xl font-medium m-auto">
            <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
          </p>
          
          {state === "register" && (
            <div className="w-full">
              <p>Name</p>
              <input 
                onChange={(e) => setName(e.target.value)} 
                value={name} 
                placeholder="Type your name" 
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary-dull" 
                type="text" 
                required 
              />
            </div>
          )}
          
          <div className="w-full">
            <p>Email</p>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email} 
              placeholder="Type your email" 
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary-dull" 
              type="email" 
              required 
            />
          </div>
          
          <div className="w-full">
            <p>Password</p>
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              placeholder="Type your password" 
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary-dull" 
              type="password" 
              required 
            />
          </div>
          
          {state === "register" ? (
            <p>
              Already have account? <span onClick={() => setState("login")} className="text-primary cursor-pointer">Click here</span>
            </p>
          ) : (
            <p>
              Create an account? <span onClick={() => setState("register")} className="text-primary cursor-pointer">Click here</span>
            </p>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className={`bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {loading ? 'Processing...' : state === "register" ? "Create Account" : "Login"}
          </button>
          
          <div className="text-xs text-gray-500 mt-2">
            <p>⚠️ Make sure cookies are enabled in your browser.</p>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login;