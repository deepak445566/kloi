import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets'; // assets import કરો

function ProductList() {
  const { products, axios, fetchProducts } = useAppContext();
  const [editingProduct, setEditingProduct] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    offerPrice: '',
    inStock: true
  });
  const [editFiles, setEditFiles] = useState([]);

  const toggleStock = async (id, inStock) => {
    try {
      const { data } = await axios.post("/api/product/stock", { id, inStock });
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const { data } = await axios.delete("/api/product/delete", { data: { id } });
        if (data.success) {
          fetchProducts();
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product._id);
    setEditData({
      name: product.name,
      description: Array.isArray(product.description) ? product.description.join(', ') : product.description,
      category: product.category,
      price: product.price,
      offerPrice: product.offerPrice,
      inStock: product.inStock
    });
    setEditFiles([]);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditData({
      name: '',
      description: '',
      category: '',
      price: '',
      offerPrice: '',
      inStock: true
    });
    setEditFiles([]);
  };

  const handleEditFileChange = (index, file) => {
    const newFiles = [...editFiles];
    newFiles[index] = file;
    setEditFiles(newFiles);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const productData = {
        name: editData.name,
        description: editData.description,
        category: editData.category,
        price: editData.price,
        offerPrice: editData.offerPrice,
        inStock: editData.inStock
      };
      
      formData.append("productData", JSON.stringify(productData));
      formData.append("id", editingProduct);

      for (let i = 0; i < editFiles.length; i++) {
        if (editFiles[i]) {
          formData.append("image", editFiles[i]);
        }
      }

      const { data } = await axios.put("/api/product/update", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (data.success) {
        fetchProducts();
        closeEditModal();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">All Products</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="md:table-auto table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold truncate">Product</th>
                  <th className="px-4 py-3 font-semibold truncate">Category</th>
                  <th className="px-4 py-3 font-semibold truncate hidden md:block">Selling Price</th>
                  <th className="px-4 py-3 font-semibold truncate">In Stock</th>
                  <th className="px-4 py-3 font-semibold truncate">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {products.map((product) => (
                  <tr key={product._id} className="border-t border-gray-500/20 hover:bg-gray-50">
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <div className="border border-gray-300 rounded overflow-hidden">
                        <img src={product.image[0]} alt="Product" className="w-16 h-16 object-cover" />
                      </div>
                      <span className="truncate max-sm:hidden w-full">{product.name}</span>
                    </td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3 max-sm:hidden">₹{product.offerPrice}</td>
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                        <input 
                          onClick={() => toggleStock(product._id, !product.inStock)} 
                          checked={product.inStock} 
                          type="checkbox" 
                          className="sr-only peer" 
                        />
                        <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                        <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteProduct(product._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Edit Product</h3>
                <button 
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={updateProduct} className="space-y-5">
                {/* Product Images */}
                <div>
                  <p className="text-base font-medium mb-2">Product Images</p>
                  <div className="grid grid-cols-4 gap-3">
                    {Array(4).fill('').map((_, index) => (
                      <label key={index} htmlFor={`edit-image-${index}`} className="cursor-pointer">
                        <input 
                          onChange={(e) => handleEditFileChange(index, e.target.files[0])}
                          accept="image/*" 
                          type="file" 
                          id={`edit-image-${index}`} 
                          hidden 
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 h-24 flex items-center justify-center">
                          <img 
                            src={editFiles[index] ? URL.createObjectURL(editFiles[index]) : assets.upload_area}
                            alt="upload"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-base font-medium mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full outline-none py-2.5 px-3 rounded border border-gray-500/40"
                    required
                  />
                </div>

                {/* Product Description */}
                <div>
                  <label className="block text-base font-medium mb-1">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows={3}
                    className="w-full outline-none py-2.5 px-3 rounded border border-gray-500/40 resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-base font-medium mb-1">Category</label>
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({...editData, category: e.target.value})}
                    className="w-full outline-none py-2.5 px-3 rounded border border-gray-500/40"
                  >
                    <option value="">Select Category</option>
                    {categories.map((item) => (
                      <option key={item.path} value={item.path}>
                        {item.text}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium mb-1">Price</label>
                    <input
                      type="number"
                      value={editData.price}
                      onChange={(e) => setEditData({...editData, price: e.target.value})}
                      className="w-full outline-none py-2.5 px-3 rounded border border-gray-500/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-1">Offer Price</label>
                    <input
                      type="number"
                      value={editData.offerPrice}
                      onChange={(e) => setEditData({...editData, offerPrice: e.target.value})}
                      className="w-full outline-none py-2.5 px-3 rounded border border-gray-500/40"
                      required
                    />
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.inStock}
                      onChange={(e) => setEditData({...editData, inStock: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                    <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                  </label>
                  <span className="text-base font-medium">In Stock</span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary text-white font-medium rounded hover:bg-primary-dark"
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductList;