import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

// Add Product: /api/product/add
export const AddProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);

    // ✅ Ensure subCategory is included (could be empty string)
    if (!productData.subCategory) {
      productData.subCategory = "";
    }

    const images = req.files;
    let imgUrl = await Promise.all(
      images.map(async (file) => {
        let result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });
        return result.secure_url;
      })
    );

    await Product.create({ ...productData, image: imgUrl });
    res.json({
      success: true,
      message: "Product added"
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get all products: /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get single product: /api/product/id
export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Change stock status: /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: "Stock updated" });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Delete product: /api/product/delete
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    await Product.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Update product: /api/product/update
export const updateProduct = async (req, res) => {
  try {
    console.log("Update request received");
    console.log("Request body:", req.body);
    console.log("Files:", req.files);

    let productData = {};
    let id = "";

    // Parse productData from form data
    if (req.body.productData) {
      try {
        productData = JSON.parse(req.body.productData);
      } catch (parseError) {
        console.log("Error parsing productData:", parseError);
        productData = req.body.productData;
      }
    }

    // Get id from form data
    id = req.body.id;

    if (!id) {
      return res.json({
        success: false,
        message: "Product ID is required"
      });
    }

    let updateData = { ...productData };

    // ✅ Ensure subCategory is included (could be empty string)
    if (updateData.subCategory === undefined) {
      updateData.subCategory = "";
    }

    // If there are new images
    if (req.files && req.files.length > 0) {
      console.log("Uploading new images");
      const images = req.files;
      let imgUrl = await Promise.all(
        images.map(async (file) => {
          let result = await cloudinary.uploader.upload(file.path, {
            resource_type: 'image',
            folder: 'products' // Optional: add folder name
          });
          console.log(`Image uploaded to Cloudinary: ${result.secure_url}`);
          return result.secure_url;
        })
      );
      updateData.image = imgUrl;
      console.log("New images array:", imgUrl);
    } else {
      console.log("No new images uploaded");
    }

    console.log("Updating product with ID:", id);
    console.log("Update data:", updateData);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedProduct) {
      return res.json({
        success: false,
        message: "Product not found"
      });
    }

    console.log("Product updated successfully:", updatedProduct._id);

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    console.error("Update error details:", error);
    res.json({
      success: false,
      message: error.message || "Failed to update product"
    });
  }
};



