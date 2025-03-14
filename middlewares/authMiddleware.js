import JWT from 'jsonwebtoken'
import userModel from '../models/userModel.js'

//user auth
export const isAuth = async (req, res, next) => {
    const { token } = req.cookies
    if (!token) {
        return res.status(401).send({
            message: 'You are not authenticated.',
            success: false
        })
    }
    const decodeData = JWT.verify(token, process.env.JWT_SECRET)
    req.user = await userModel.findById(decodeData._id)
    next()
}

//admin auth
export const isAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(401).send({
            message: 'Admin only.',
            success: false
        });
    }
    next();
};