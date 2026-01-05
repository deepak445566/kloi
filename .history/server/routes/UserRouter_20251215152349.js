import express from 'express';
import {
  registerUser,
  loginUser,
  isAuth,
  logout,
  getCurrentUser
} from '../controllers/UserController.js';
import authUser from '../middleware/authUser.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/isauth', isAuth);
router.post('/logout', logout);

// Protected routes (require authentication)
router.get('/profile', authUser, getCurrentUser);

export default router;