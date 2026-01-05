import React, { useState } from 'react'
import { assets,categories } from '../../assets/assets';
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

  const handlefile = async (e) => {
    try {
      e.preventDefault();

      const productData = {
        name,
        description,
        category: selectedMainCategory || category,
        subCategory: selectedMainCategory ? subCategory : "",
        price,
        offerPrice
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));

      for (let i = 0; i < files.length; i++) {
        formData.append("image", files[i]);
      }

      const { data } = await axios.post("/api/product/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (data.success) {
        toast.success(data.message);
        setName("");
        setDescription("");
        setCategory("");
        setSubCategory("");
        setSelectedMainCategory("");
        setPrice("");
        setOfferPrice("");
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
    setSubCategory(""); // Reset subcategory when main category changes
  };

  return (
    <>
      <div className=" no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
        <form onSubmit={handlefile} className="md:p-10 p-4 space-y-5 max-w-lg">
          <div>
            <p className="text-base font-medium">Product Image</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {Array(4).fill('').map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input onChange={(e)=>{
                    const newFiles = [...files];
                    newFiles[index] = e.target.files[0];
                    setFiles(newFiles);
                  }} accept="image/*" type="file" id={`image${index}`} hidden />
                  <img className="max-w-24 cursor-pointer" src={files[index]?URL.createObjectURL(files[index]):assets.upload_area} alt="uploadArea" width={100} height={100} />
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
            <input onChange={(e)=>setName(e.target.value)} value={name} id="product-name" type="text" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
          </div>
          
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="product-description">Product Description</label>
            <textarea onChange={(e)=>setDescription(e.target.value)} value={description} id="product-description" rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Type here"></textarea>
          </div>
          
          <div className="w-full flex flex-col gap-1">
            <label className="text-base font-medium" htmlFor="main-category">Main Category</label>
            <select 
              onChange={handleMainCategoryChange} 
              value={selectedMainCategory} 
              id="main-category" 
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            >
              <option value="">Select Main Category</option>
              {categories.map((item) => (
                <option key={item.text} value={item.text}>
                  {item.text}
                </option>
              ))}
            </select>
          </div>

          {selectedMainCategory && categories.find(cat => cat.text === selectedMainCategory)?.subItems && (
            <div className="w-full flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="sub-category">Sub Category</label>
              <select 
                onChange={(e)=>setSubCategory(e.target.value)} 
                value={subCategory} 
                id="sub-category" 
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
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

          {/* Backup for categories without sub-items or legacy support */}
          {!selectedMainCategory && (
            <div className="w-full flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="category">Category (Legacy)</label>
              <select 
                onChange={(e)=>setCategory(e.target.value)} 
                value={category} 
                id="category" 
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
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
          
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex-1 flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="product-price">Product Price</label>
              <input onChange={(e)=>setPrice(e.target.value)} value={price} id="product-price" type="number" placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
            </div>
            <div className="flex-1 flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="offer-price">Offer Price</label>
              <input onChange={(e)=>setOfferPrice(e.target.value)} value={offerPrice} id="offer-price" type="number" placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
            </div>
          </div>
          
          <button className="cursor-pointer px-8 py-2.5 bg-primary text-white font-medium rounded">ADD</button>
        </form>
      </div>
    </>
  )
}

export default Addproduct