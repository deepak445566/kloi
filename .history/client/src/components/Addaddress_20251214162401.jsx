import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast';

const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input 
    className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition' 
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name] || ''}
    required
  />
)

function Addaddress() {
  const { axios, user, navigate, fetchUser } = useAppContext();
  
  const [address, setAddress] = useState({
    firstname: "",
    lastname: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = ['firstname', 'lastname', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
    
    for (let field of requiredFields) {
      if (!address[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(address.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (address.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!user || !user._id) {
      toast.error('Please login to add address');
      navigate('/login');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('=== ADDING ADDRESS ===');
      console.log('User:', user);
      console.log('User ID:', user._id);
      console.log('Token available:', !!localStorage.getItem('token'));
      
      const requestData = {
        userId: user._id, // ✅ USER ID ADD करो
        address: address
      };
      
      console.log('Request Data:', requestData);
      
      const { data } = await axios.post('/api/address/add', requestData);
      
      console.log('API Response:', data);

      if (data.success) {
        toast.success(data.message || 'Address added successfully!');
        navigate("/cart");
      } else {
        toast.error(data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('=== API ERROR DETAILS ===');
      console.error('Full Error:', error);
      console.error('Response Data:', error.response?.data);
      console.error('Status Code:', error.response?.status);
      
      let errorMessage = 'Failed to add address';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED useEffect
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔄 Checking authentication...');
      
      // Pehle localStorage check करो
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      console.log('Saved user in localStorage:', savedUser);
      console.log('Saved token in localStorage:', savedToken);
      
      if (savedUser && savedToken) {
        // Agar localStorage में data hai to use karo
        const parsedUser = JSON.parse(savedUser);
        console.log('Parsed user from localStorage:', parsedUser);
        
        if (parsedUser && parsedUser._id) {
          // State update करो
          setUser(parsedUser);
          setIsAuthenticating(false);
          return;
        }
      }
      
      // Agar localStorage में nahi hai to API se fetch करo
      if (!user || !user._id) {
        console.log('🔄 Fetching user from API...');
        const fetchedUser = await fetchUser();
        
        if (fetchedUser && fetchedUser._id) {
          console.log('✅ User fetched successfully:', fetchedUser._id);
          setIsAuthenticating(false);
        } else {
          console.log('❌ No user found, redirecting to login');
          toast.error('Please login to continue');
          navigate("/login");
        }
      } else {
        setIsAuthenticating(false);
      }
    };
    
    checkAuth();
  }, [user, navigate, fetchUser]);

  // ✅ Loading state
  if (isAuthenticating) {
    return (
      <div className="mt-10 pb-16 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 pb-16">
        <p className="text-2xl md:text-3xl text-gray-500">
          Add Shipping <span className="font-semibold text-primary">Address</span>
        </p>

        {user && user._id ? (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-700">
              ✅ Logged in as: <strong>{user.email || user.name}</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              User ID: <code className="bg-blue-100 px-2 py-1 rounded">{user._id}</code>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Token: {localStorage.getItem('token') ? '✅ Available' : '❌ Not available'}
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-red-50 rounded">
            <p className="text-sm text-red-700">
              ❌ Not logged in. Please login to add address.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-2 px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary-dull"
            >
              Go to Login
            </button>
          </div>
        )}

        <div className="flex flex-col-reverse md:flex-row justify-between mt-10">
          <div className="flex-1 max-w-md">
            <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
              <div className='grid grid-cols-2 gap-4'>
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="firstname" 
                  type="text" 
                  placeholder="Enter First Name" 
                />
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="lastname" 
                  type="text" 
                  placeholder="Enter Last Name" 
                />
              </div>
              
              <InputField 
                handleChange={handleChange} 
                address={address} 
                name="email" 
                type="email" 
                placeholder="Enter Email" 
              />
              
              <InputField 
                handleChange={handleChange} 
                address={address} 
                name="street" 
                type="text" 
                placeholder="Street Address" 
              />
              
              <div className='grid grid-cols-2 gap-4'>
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="city" 
                  type="text" 
                  placeholder="City" 
                />
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="state" 
                  type="text" 
                  placeholder="State" 
                />
              </div>
              
              <div className='grid grid-cols-2 gap-4'>
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="zipcode" 
                  type="number" 
                  placeholder="Zip Code" 
                />
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="country" 
                  type="text" 
                  placeholder="Country" 
                />
              </div>
              
              <InputField 
                handleChange={handleChange} 
                address={address} 
                name="phone" 
                type="tel" 
                placeholder="Phone Number" 
              />

              <button 
                type="submit" 
                disabled={loading || !user || !user._id}
                className={`w-full mt-6 py-3 hover:bg-primary-dull transition uppercase ${
                  loading || !user || !user._id
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary text-white cursor-pointer'
                }`}
              >
                {loading ? 'Adding Address...' : 'Save Address'}
              </button>
              
              {(!user || !user._id) && (
                <p className="text-sm text-red-500 text-center">
                  Please login to save address
                </p>
              )}
            </form>
          </div>

          <img
            className="md:mr-16 mb-16 md:mt-0 w-full max-w-sm"
            src={assets.add_address_iamge}
            alt="Add Address Illustration"
          />
        </div>
      </div>
    </>
  );
}

export default Addaddress;