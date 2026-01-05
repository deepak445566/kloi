import React, { useState } from 'react'
import { assets, categories } from '../../assets/assets';
import { useAppContext } from "../../context/AppContext";
import toast from 'react-hot-toast';

function Addproduct() {
  const {axios} = useAppContext();
  const [files ,setFiles]= useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]= useState("");
  const [subCategory, setSubCategory]= useState("");
  const [price ,setPrice]= useState("");
  const [offerPrice, setOfferPrice]= useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [weightValue, setWeightValue] = useState("");
  const [gstPercentage, setGstPercentage] = useState("5"); // Default 5%

  const handlefile = async (e) => {
    try {
      e.preventDefault();

      const productData = {
        name,
        description: description.split('\n').filter(item => item.trim() !== ''),
        category: selectedMainCategory || category,
        subCategory: selectedMainCategory ? subCategory : "",
        price: Number(price),
        offerPrice: Number(offerPrice),
        weightUnit,
        weightValue: weightValue ? Number(weightValue) : null,
        gstPercentage: Number(gstPercentage)
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));

      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          formData.append("image", files[i]);
        }
      }

      const { data } = await axios.post("/api/product/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (data.success) {
        toast.success(data.message);
        // Reset all fields
        setName("");
        setDescription("");
        setCategory("");
        setSubCategory("");
        setSelectedMainCategory("");
        setPrice("");
        setOfferPrice("");
        setWeightUnit("kg");
        setWeightValue("");
        setGstPercentage("5");
        setFiles([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMainCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedMainCategory(value);
    setCategory(value);
    setSubCategory("");
  };

  const gstOptions = [0, 5, 12, 18, 28]; // Common GST slabs in India

  return (
    <>
      <div className=" no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
        <form onSubmit={handlefile} className="md:p-10 p-4 space-y-5 max-w-lg">
          {/* Product Image Section */}
          <div>
            <p className="text-base font-medium">Product Image (Max 4 images)</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {Array(4).fill('').map((_, index) => (
                <label key={index} htmlFor={`image${index}`} className="cursor-pointer">
                  <input 
                    onChange={(e)=>{
                      const newFiles = [...files];
                      newFiles[index] = e.target.files[0];
                      setFiles(newFiles);
                    }} 
                    accept="image/*" 
                    type="file" 
                    id={`image${index}`} 
                    hidden 
                  />
                  <img 
                    className="max-w-24 h-24 object-cover rounded-lg border border-gray-300 hover:border-primary transition" 
                    src={files[index]?URL.createObjectURL(files[index]):assets.upload_area} 
                    alt="uploadArea" 
                    width={100} 
                    height={100} 
                  />
                </label>
              ))}
            </div>
          </div>
          
          {/* Product Name */}
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="product-name">Product Name *</label>
            <input 
              onChange={(e)=>setName(e.target.value)} 
              value={name} 
              id="product-name" 
              type="text" 
              placeholder="Enter product name" 
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-primary transition" 
              required 
            />
          </div>
          
          {/* Product Description */}
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="product-description">Product Description *</label>
            <textarea 
              onChange={(e)=>setDescription(e.target.value)} 
              value={description} 
              id="product-description" 
              rows={4} 
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-primary transition resize-none" 
              placeholder="Enter product description (each line as a separate bullet point)"
              required
            ></textarea>
          </div>

          {/* Weight/Size Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="weight-value">Weight/Size Value</label>
              <input 
                onChange={(e)=>setWeightValue(e.target.value)} 
                value={weightValue} 
                id="weight-value" 
                type="number" 
                min="0"
                step="0.01"
                placeholder="e.g., 1, 500, 2.5" 
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-primary transition" 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="weight-unit">Unit *</label>
              <select 
                onChange={(e)=>setWeightUnit(e.target.value)} 
                value={weightUnit} 
                id="weight-unit" 
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-primary transition"
                required
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="l">Liter (L)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="piece">Piece</option>
                <option value="pack">Pack</option>
                <option value="dozen">Dozen</option>
                <option value="bottle">Bottle</option>
                <option value="bag">Bag</option>
                <option value="box">Box</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="set">Set</option>
                <option value="packet">Packet</option>
                <option value="can">Can</option>
                <option value="jar">Jar</option>
                <option value="tube">Tube</option>
              </select>
            </div>
          </div>
          
          {/* GST Percentage */}
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="gst-percentage">GST Percentage (%) *</label>
            <select 
              onChange={(e)=>setGstPercentage(e.target.value)} 
              value={gstPercentage} 
              id="gst-percentage" 
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-primary transition"
              required
            >
              {gstOptions.map(option => (
                <option key={option} value={option}>
                  {option}% GST
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Select applicable GST slab for this product
            </p>
          </div>

          {/* Main Category */}
          <div className="w-full flex flex-col gap-1">
            <label className="text-base font-medium" htmlFor="main-category">Main Category *</label>
            <select 
              onChange={handleMainCategoryChange} 
              value={selectedMainCategory} 
              id="main-category" 
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-primary transition"
              required
            >
              <option value="">Select Main Category</option>
              {categories.map((item) => (
                <option key={item.text} value={item.text}>
                  {item.text}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Category */}
          {selectedMainCategory && categories.find(cat => cat.text === selectedMainCategory)?.subItems && (
            <div className="w-full flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="sub-category">Sub Category</label>
              <select 
                onChange={(e)=>setSubCategory(e.target.value)} 
                value={subCategory} 
                id="sub-category" 
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-primary transition"
              >
                <option value="">Select Sub Category</option>
                {categories
                  .find(cat => cat.text === selectedMainCategory)
                  ?.subItems.map((subItem) => (
                    <option key={subItem.text} value={subItem.text}>
                      {subItem.text}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Legacy Category (for categories without sub-items) */}
          {!selectedMainCategory && (
            <div className="w-full flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="category">Category *</label>
              <select 
                onChange={(e)=>setCategory(e.target.value)} 
                value={category} 
                id="category" 
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-primary transition"
                required
              >
                <option value="">Select Category</option>
                {categories.map((item) => (
                  <option key={item.text} value={item.text}>
                    {item.text}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Price Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="product-price">Product Price (₹) *</label>
              <input 
                onChange={(e)=>setPrice(e.target.value)} 
                value={price} 
                id="product-price" 
                type="number" 
                min="0"
                step="0.01"
                placeholder="Enter price" 
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-primary transition" 
                required 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="offer-price">Offer Price (₹) *</label>
              <input 
                onChange={(e)=>setOfferPrice(e.target.value)} 
                value={offerPrice} 
                id="offer-price" 
                type="number" 
                min="0"
                step="0.01"
                placeholder="Enter offer price" 
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-primary transition" 
                required 
              />
            </div>
          </div>
          
          {/* Price Preview with GST */}
          {offerPrice && gstPercentage && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Price Preview:</p>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₹{Number(offerPrice).toFixed(2)}</span>
                </p>
                <p className="flex justify-between">
                  <span>GST ({gstPercentage}%):</span>
                  <span>₹{(Number(price) * Number(gstPercentage) / 100).toFixed(2)}</span>
                </p>
                <p className="flex justify-between font-medium border-t pt-2">
                  <span>Total with GST:</span>
                  <span>₹{(Number(price) + (Number(price) * Number(gstPercentage) / 100)).toFixed(2)}</span>
                </p>
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <button 
            type="submit"
            className="cursor-pointer px-8 py-3 bg-primary text-white font-medium rounded hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
          >
            ADD PRODUCT
          </button>
        </form>
      </div>
    </>
  )
}

export default Addproduct;