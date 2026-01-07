import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const SellerLayout = () => {
  const { setIsSeller, axios, navigate } = useAppContext();

  const sidebarLinks = [
    { name: "Add Products", path: "/seller", icon: assets.add_icon },
    { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
    { name: "Shiprocket", path: "/seller/shiprocket", icon: assets.shipment_icon }, // NEW
  ];

  // Shiprocket icon add करें assets में अगर नहीं है
  // या फिर ये icon use करें:
  const shiprocketIcon = "https://cdn-icons-png.flaticon.com/512/2092/2092658.png";

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/seller/logout");
      if (data.success) {
        toast.success(data.message);
        setIsSeller(false);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white ">
        <Link to='/'>
          <img src="/logo1.png" className="h-15 w-15" alt="Logo" />
        </Link>
        <div className="flex items-center gap-5 text-gray-500">
          <p>Hi! Seller</p>
          <button 
            onClick={logout} 
            className='border border-gray-300 rounded-full text-sm px-4 py-1 hover:bg-gray-50 transition'
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-80px)]">
        <div className="md:w-64 w-16 border-r border-gray-300 pt-4 flex flex-col transition-all duration-300 bg-white">
          {sidebarLinks.map((item) => (
            <NavLink 
              to={item.path} 
              key={item.name} 
              end={item.path === "/seller"}
              className={({isActive}) => 
                `flex items-center py-3 px-4 gap-3 transition-colors
                ${isActive 
                  ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary font-medium" 
                  : "hover:bg-gray-100/90 text-gray-700 hover:text-gray-900"
                }`
              }
            >
              <img 
                src={item.name === "Shiprocket" ? shiprocketIcon : item.icon} 
                className="w-6 h-6 md:w-7 md:h-7"
                alt={item.name}
              />
              <p className="md:block hidden text-center">{item.name}</p>
            </NavLink>
          ))}
          
          {/* Additional Links Section */}
          <div className="mt-auto border-t border-gray-200 pt-4">
            <NavLink 
              to="/" 
              className="flex items-center py-3 px-4 gap-3 text-gray-700 hover:bg-gray-100/90 hover:text-gray-900 transition-colors"
            >
              <img src={assets.home_icon} className="w-6 h-6" alt="Home" />
              <p className="md:block hidden">Visit Store</p>
            </NavLink>
            
            <NavLink 
              to="/seller/settings" 
              className="flex items-center py-3 px-4 gap-3 text-gray-700 hover:bg-gray-100/90 hover:text-gray-900 transition-colors"
            >
              <img src={assets.setting_icon} className="w-6 h-6" alt="Settings" />
              <p className="md:block hidden">Settings</p>
            </NavLink>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50 p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default SellerLayout;