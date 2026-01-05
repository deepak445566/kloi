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
  const { axios, user, navigate } = useAppContext();
  
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
      toast.error('Please enter a valid phone number (minimum 10 digits)');
      return false;
    }
    
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to add address');
      navigate('/login');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('=== SUBMITTING ADDRESS ===');
      console.log('User:', user);
      console.log('Address Data:', address);
      
      // Prepare the request payload
      const requestData = {
        address: {
          ...address,
          email: address.email || user.email // Use form email or user's email
        }
      };
      
      console.log('Request Payload:', requestData);
      
      const { data } = await axios.post('/api/address/add', requestData);
      
      console.log('API Response:', data);

      if (data.success) {
        toast.success('Address added successfully!');
        navigate("/cart");
      } else {
        toast.error(data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('=== API ERROR ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      
      let errorMessage = 'Failed to add address';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login again';
        navigate('/login');
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill email with user's email if available
  useEffect(() => {
    if (user && user.email && !address.email) {
      setAddress(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);

  // Check authentication on mount
  useEffect(() => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <>
      <div className="mt-10 pb-16">
        <p className="text-2xl md:text-3xl text-gray-500">
          Add Shipping <span className="font-semibold text-primary">Address</span>
        </p>

        {user ? (
          <div className="mt-4 p-3 bg-green-50 rounded">
            <p className="text-sm text-green-700">
              ✓ Logged in as: <strong>{user.email || user.name}</strong>
              {user._id && (
                <span className="ml-4 text-xs">User ID: {user._id.substring(0, 8)}...</span>
              )}
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-red-50 rounded">
            <p className="text-sm text-red-700">
              ✗ Please login to add address
            </p>
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
                  type="text" 
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
                placeholder="Phone Number (10+ digits)" 
              />

              <button 
                type="submit" 
                disabled={loading || !user}
                className={`w-full mt-6 py-3 rounded font-medium ${
                  loading || !user
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary text-white cursor-pointer hover:bg-primary-dull'
                }`}
              >
                {loading ? 'Adding Address...' : 'Save Address'}
              </button>
              
              {!user && (
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full mt-3 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                >
                  Login to Continue
                </button>
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