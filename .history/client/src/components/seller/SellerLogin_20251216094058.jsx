import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

function SellerLogin() {
  const { isSeller, setIsSeller, navigate, axios, fetchSeller } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await axios.post("/api/seller/login", {
        email,
        password
      });

      if (data.success) {
        setIsSeller(true);
        toast.success("Seller login successful!");
        
        // Refresh seller status
        await fetchSeller();
        
        // Redirect after a brief delay
        setTimeout(() => {
          navigate("/seller/dashboard");
        }, 1000);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check seller status on component mount
    fetchSeller();
    
    if (isSeller) {
      navigate("/seller/dashboard");
    }
  }, [isSeller, navigate]);

  return (
    !isSeller && (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-6 w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800">
            <span className="text-blue-600">Seller</span> Login
          </h2>
          
          <div className="w-full">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="seller@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="w-full">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-md font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            {loading ? 'Logging in...' : 'Login as Seller'}
          </button>
          
          <p className="text-center text-sm text-gray-600">
            Note: Only authorized sellers can login
          </p>
        </form>
      </div>
    )
  );
}

export default SellerLogin;