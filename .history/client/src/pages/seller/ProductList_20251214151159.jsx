import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast';
import { Search, Filter, Package, DollarSign, Tag, ToggleLeft, ToggleRight, Edit, Eye, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

function ProductList() {
  const { products, axios, fetchProducts } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedProduct, setExpandedProduct] = useState(null);

  // Get unique categories
  const categories = ['all', ...new Set(products.map(product => product.category))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

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

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleProductExpand = (id) => {
    setExpandedProduct(expandedProduct === id ? null : id);
  };

  const getStatusColor = (status) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status) => {
    return status ? 'In Stock' : 'Out of Stock';
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Inventory</h1>
          <p className="text-gray-600">Manage and monitor your product listings</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-800">{filteredProducts.length}</p>
                </div>
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-2 bg-white rounded-xl shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Product Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <Tag className="w-3 h-3 mr-1" />
                            {product.category}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.inStock)}`}>
                            {getStatusText(product.inStock)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="text-xl font-bold">${product.offerPrice}</span>
                          {product.originalPrice && (
                            <span className="ml-2 text-sm line-through text-gray-400">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleProductExpand(product._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedProduct === product._id ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Product Details (Collapsible) */}
                {expandedProduct === product._id && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Product Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Product ID:</span>
                            <span className="font-medium">{product._id.slice(-8)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Description:</span>
                            <span className="font-medium text-right max-w-xs">
                              {product.description || 'No description'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-medium">
                              {new Date(product.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Inventory Management</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-700">Stock Status</p>
                              <p className="text-sm text-gray-500">Toggle product availability</p>
                            </div>
                            <button
                              onClick={() => toggleStock(product._id, !product.inStock)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                product.inStock ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  product.inStock ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          
                          <div className="flex space-x-3">
                            <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </button>
                            <button className="flex-1 flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Stock Control:</span>
                      <button
                        onClick={() => toggleStock(product._id, !product.inStock)}
                        className={`flex items-center px-3 py-1 rounded-full font-medium transition-colors ${
                          product.inStock
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {product.inStock ? (
                          <>
                            <ToggleRight className="w-4 h-4 mr-1" />
                            In Stock
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 mr-1" />
                            Out of Stock
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.inStock ? 'Available for sale' : 'Currently unavailable'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        {filteredProducts.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-800">{filteredProducts.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredProducts.filter(p => p.inStock).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredProducts.filter(p => !p.inStock).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Average Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${(filteredProducts.reduce((sum, p) => sum + (p.offerPrice || 0), 0) / filteredProducts.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;