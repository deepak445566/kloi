import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast';
import { assets, categories } from '../../assets/assets';
import { Edit, Trash2, Package, DollarSign, Percent, Layers } from 'lucide-react';

function ProductList() {
  const { products, axios, fetchProducts } = useAppContext();
  const [editingProduct, setEditingProduct] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    offerPrice: '',
    weightUnit: 'kg',
    weightValue: '',
    gstPercentage: '5',
    inStock: true
  });
  const [editFiles, setEditFiles] = useState([]);
  const [currentProductImages, setCurrentProductImages] = useState([]);

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
    setCurrentProductImages(product.image || []);
    setEditData({
      name: product.name || '',
      description: Array.isArray(product.description) ? 
        product.description.join('\n') : 
        (product.description || ''),
      category: product.category || '',
      price: product.price || '',
      offerPrice: product.offerPrice || '',
      weightUnit: product.weightUnit || 'kg',
      weightValue: product.weightValue || '',
      gstPercentage: product.gstPercentage || '5',
      inStock: product.inStock !== undefined ? product.inStock : true
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
      weightUnit: 'kg',
      weightValue: '',
      gstPercentage: '5',
      inStock: true
    });
    setEditFiles([]);
    setCurrentProductImages([]);
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
        description: editData.description.split('\n').filter(item => item.trim() !== ''),
        category: editData.category,
        price: Number(editData.price),
        offerPrice: Number(editData.offerPrice),
        weightUnit: editData.weightUnit,
        weightValue: editData.weightValue ? Number(editData.weightValue) : null,
        gstPercentage: Number(editData.gstPercentage),
        inStock: editData.inStock
      };
      
      formData.append("productData", JSON.stringify(productData));
      formData.append("id", editingProduct);

      editFiles.forEach((file, index) => {
        if (file) {
          formData.append("image", file);
        }
      });

      const { data } = await axios.put("/api/product/update", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        }
      });

      if (data.success) {
        await fetchProducts();
        closeEditModal();
        toast.success(data.message);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    }
  };

  const gstOptions = [0, 5, 12, 18, 28];

  return (
    <>
      <div className="no-scrollbar flex-1 min-h-[95vh] overflow-y-scroll flex flex-col">
        <div className="w-full md:p-8 p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">All Products</h2>
            <p className="text-gray-600 text-sm mt-1">
              {products?.length || 0} products found
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products && products.length > 0 ? (
                  products.map((product) => {
                    const gstAmount = (product.offerPrice * (product.gstPercentage || 5)) / 100;
                    const priceWithGST = product.offerPrice + gstAmount;
                    
                    return (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0">
                              <img 
                                src={product.image?.[0] || assets.upload_area} 
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {product.name}
                              </div>
                              {product.weightValue && product.weightUnit && (
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <Package className="w-3 h-3" />
                                  {product.weightValue} {product.weightUnit}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                          
                              <span className="text-sm font-semibold text-green-700">
                                ₹{product.offerPrice}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              +GST: ₹{gstAmount.toFixed(2)}
                            </div>
                            <div className="text-xs font-medium">
                              Total: ₹{priceWithGST.toFixed(2)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            product.gstPercentage === 0 ? 'bg-green-100 text-green-800' :
                            product.gstPercentage === 5 ? 'bg-blue-100 text-blue-800' :
                            product.gstPercentage === 12 ? 'bg-yellow-100 text-yellow-800' :
                            product.gstPercentage === 18 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            <Percent className="w-3 h-3" />
                            {product.gstPercentage || 5}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleStock(product._id, !product.inStock)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                product.inStock ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                product.inStock ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                            <span className="ml-2 text-sm text-gray-700">
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              <Edit className="w-4 h-4 mr-1.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteProduct(product._id)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4 mr-1.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-500 font-medium">No products found</p>
                        <p className="text-gray-400 text-sm mt-1">Add your first product to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {products && products.length > 0 ? (
              products.map((product) => {
                const gstAmount = (product.offerPrice * (product.gstPercentage || 5)) / 100;
                const priceWithGST = product.offerPrice + gstAmount;
                
                return (
                  <div key={product._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    {/* Product Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="h-16 w-16 flex-shrink-0">
                          <img 
                            src={product.image?.[0] || assets.upload_area} 
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                              {product.category}
                            </span>
                            {product.weightValue && product.weightUnit && (
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {product.weightValue} {product.weightUnit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Stock Toggle Mobile */}
                      <button
                        onClick={() => toggleStock(product._id, !product.inStock)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          product.inStock ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          product.inStock ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Price and GST Section */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Price:</span>
                          <span className="font-semibold text-green-700">
                            ₹{product.offerPrice}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">GST:</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            product.gstPercentage === 0 ? 'bg-green-100 text-green-800' :
                            product.gstPercentage === 5 ? 'bg-blue-100 text-blue-800' :
                            product.gstPercentage === 12 ? 'bg-yellow-100 text-yellow-800' :
                            product.gstPercentage === 18 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.gstPercentage || 5}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total:</span>
                          <span className="font-bold text-gray-900">
                            ₹{priceWithGST.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* GST Details */}
                      <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs font-medium text-gray-700">GST Breakdown</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Base Price:</span>
                            <span>₹{product.offerPrice}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>GST Amount:</span>
                            <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
                          </div>
                          <div className="pt-1 border-t border-gray-200">
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Final Price:</span>
                              <span className="text-green-700">₹{priceWithGST.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          product.inStock ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Edit className="w-4 h-4 mr-1.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No products found</p>
                <p className="text-gray-400 text-sm mt-1">Add your first product to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal - Responsive */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
                  <p className="text-sm text-gray-500 mt-1">Update product details</p>
                </div>
                <button 
                  onClick={closeEditModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Form */}
              <form onSubmit={updateProduct} className="space-y-6">
                {/* Product Images - Responsive Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-semibold text-gray-900">Product Images</p>
                    <p className="text-sm text-gray-500">Max 4 images</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array(4).fill('').map((_, index) => {
                      const currentImage = currentProductImages[index];
                      const hasNewImage = editFiles[index];
                      
                      return (
                        <label 
                          key={index} 
                          htmlFor={`edit-image-${index}`} 
                          className="cursor-pointer group"
                        >
                          <input 
                            onChange={(e) => handleEditFileChange(index, e.target.files[0])}
                            accept="image/*" 
                            type="file" 
                            id={`edit-image-${index}`} 
                            hidden 
                          />
                          <div className="aspect-square border-2 border-dashed border-gray-300 rounded-xl p-2 flex items-center justify-center hover:border-primary transition-all group-hover:shadow-md">
                            <div className="relative w-full h-full">
                              <img 
                                src={hasNewImage ? 
                                  URL.createObjectURL(editFiles[index]) : 
                                  (currentImage || assets.upload_area)
                                }
                                alt="upload"
                                className="w-full h-full object-contain rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                                <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  {currentImage ? 'Change' : 'Upload'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Product Details - Responsive Grid */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                      placeholder="Enter product description"
                      required
                    />
                  </div>

                  {/* Weight/Size - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight/Size Value</label>
                      <input
                        type="number"
                        value={editData.weightValue || ''}
                        onChange={(e) => setEditData({...editData, weightValue: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        placeholder="e.g., 1, 500"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                      <select
                        value={editData.weightUnit || 'kg'}
                        onChange={(e) => setEditData({...editData, weightUnit: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Percentage (%) *</label>
                    <select
                      value={editData.gstPercentage || '5'}
                      onChange={(e) => setEditData({...editData, gstPercentage: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition"
                      required
                    >
                      {gstOptions.map(option => (
                        <option key={option} value={option}>
                          {option}% GST
                        </option>
                      ))}
                    </select>
                    {editData.offerPrice && editData.gstPercentage && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>GST Amount:</div>
                          <div className="font-medium">
                            ₹{(Number(editData.offerPrice) * Number(editData.gstPercentage) / 100).toFixed(2)}
                          </div>
                          <div>Total with GST:</div>
                          <div className="font-bold text-green-700">
                            ₹{(Number(editData.offerPrice) + (Number(editData.offerPrice) * Number(editData.gstPercentage) / 100)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData({...editData, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories && categories.map((item) => (
                        <option key={item.text} value={item.text}>
                          {item.text}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prices - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                      <input
                        type="number"
                        value={editData.price}
                        onChange={(e) => setEditData({...editData, price: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        required
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Offer Price (₹) *</label>
                      <input
                        type="number"
                        value={editData.offerPrice}
                        onChange={(e) => setEditData({...editData, offerPrice: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        required
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Stock Status</p>
                      <p className="text-sm text-gray-500">Toggle product availability</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        {editData.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditData({...editData, inStock: !editData.inStock})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          editData.inStock ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editData.inStock ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons - Responsive */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg"
                    >
                      Update Product
                    </button>
                  </div>
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