import express from 'express';
import { getUserProfileController, loginController, logoutController, registerController, resetPasswordController, updatePasswordController, updateProfileController, updateProfilePicController } from '../controllers/userController.js';
import { isAuth } from '../middlewares/authMiddleware.js';
import { singleUpload } from '../middlewares/multer.js';

//router object
const router = express.Router();

//routes
router.post('/register', registerController);
router.post('/login', loginController);
router.get('/profile', isAuth, getUserProfileController);
router.get('/logout', isAuth, logoutController)
router.put('/profile-update', isAuth, updateProfileController);
router.put('/update-password', isAuth, updatePasswordController);
router.put('/update-picture', isAuth, singleUpload, updateProfilePicController);
router.post('/reset-password', resetPasswordController);

export default router;