import express from 'express';
import { isAdmin, isAuth } from '../middlewares/authMiddleware.js';
import { changeOrderStatusController, createOrderController, getAllOrdersController, getMyOrdersController, getSingleOrderController } from '../controllers/orderController.js';

const router = express.Router();

//routes
router.post('/create', isAuth, createOrderController);
router.get('/my-orders', isAuth, getMyOrdersController);
router.get('/my-orders/:id', isAuth, getSingleOrderController);

//admin routes
router.get('/admin/get-all-orders', isAuth, isAdmin, getAllOrdersController);
router.put('/admin/order/:id', isAuth, isAdmin, changeOrderStatusController);



export default router