import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

function SellerLogin() {
  const { isSeller, setIsSeller, navigate, axios } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post("/api/seller/login", {
        email,
        password
      });

      if (data.success) {
        setIsSeller(true);
        toast.success("Seller login successful!");
        navigate("/seller/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (isSeller) {
      navigate("/seller/dashboard");
    }
  }, [isSeller]);

  return (
    !isSeller && (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200 bg-white"
          >
            <p className="text-2xl m-auto font-medium">
              <span className="text-primary">Seller</span> Login
            </p>
            <div className="w-full">
              <p>Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Enter Email"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                required
              />
            </div>
            <div className="w-full">
              <p>Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Enter Password"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                required
              />
            </div>
            <button 
              type="submit"
              className="bg-primary text-white w-full py-2 rounded-md cursor-pointer hover:bg-primary-dull transition-all"
            >
              Login as Seller
            </button>
          </form>
        </div>
      </>
    )
  );
}

export default SellerLogin;