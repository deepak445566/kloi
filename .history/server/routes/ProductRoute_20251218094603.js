import express from "express";
import { upload } from "../config/multer.js";
import authSeller from "../middlewares/authSeller.js";
import { AddProduct, changeStock, deleteProduct, productById, productList } from "../controllers/ProductController.js";

const ProductRouter = express.Router();

ProductRouter.post('/add', authSeller, upload.array("image", 4), AddProduct);


ProductRouter.get('/list',productList);
ProductRouter.get('/id',productById);
ProductRouter.post('/stock',authSeller,changeStock);
ProductRouter.delete('/delete', authSeller, deleteProduct);
ProductRouter.put('/update', authSeller, upload.array("image", 4), updateProduct);


export default ProductRouter;