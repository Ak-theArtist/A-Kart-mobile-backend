import userModel from "../models/userModel.js";
import cloudinary from 'cloudinary'
import bcrypt from "bcryptjs";
import getDataUri from "../utils/features.js";

//Register Controller
export const registerController = async (req, res) => {
    try {
        const { name, email, password, address, city, country, phone, answer } = req.body
        if (!name || !email || !password || !address || !city || !country || !phone || !answer) {
            return res.status(400).send({
                message: 'Please provide all required fields.',
                success: false
            })
        }
        //check existing user
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(500).send({
                message: 'Email already exists.',
                success: false
            });
        }
        //create new user
        const user = new userModel({
            name,
            email,
            password,
            address,
            city,
            country,
            phone,
            answer,
        });
        await user.save();
        res.status(201).send({
            message: 'User registered successfully.',
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error in Register API.',
            success: false,
            error
        })
    }
};

//Login Controller
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({
                message: 'Please provide email and password.',
                success: false
            });
        }

        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                message: 'User not found.',
                success: false
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).send({
                message: 'Invalid credentials.',
                success: false
            });
        }

        // Generate token
        const token = user.generateToken(); // Ensure this function exists in your userModel

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development', // Secure cookies in production
            sameSite: "Strict",
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // Expires in 7 days
        });

        res.status(200).send({
            message: 'User logged in successfully.',
            success: true,
            token,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'Error in Login API.',
            success: false,
            error
        });
    }
};

//Get User Profile

export const getUserProfileController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        user.password = undefined;
        res.status(200).send({
            message: 'User profile fetched successfully.',
            success: true,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error in Get User Profile API.',
            success: false,
            error
        })

    }
};

// Logout Controller
export const logoutController = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development',
            sameSite: "Strict",
            expires: new Date(0) // Expire immediately
        });

        res.status(200).send({
            message: 'User logged out successfully.',
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'Error in Logout API.',
            success: false,
            error
        });
    }
};

// Update User Profile
export const updateProfileController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        const { name, email, address, city, country, phone } = req.body;
        // validation + update
        if (name) user.name = name;
        if (email) user.email = email;
        if (address) user.address = address;
        if (city) user.city = city;
        if (country) user.country = country;
        if (phone) user.phone = phone;

        await user.save();
        res.status(200).send({
            message: 'User profile updated successfully.',
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'Error in Update API.',
            success: false,
            error
        });
    }
};

//update user password
export const updatePasswordController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        const { oldPassword, newPassword } = req.body;
        //validation
        if (!oldPassword || !newPassword) {
            return res.status(500).send({
                message: 'Please provide old or new password.',
                success: false
            });
        }
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(500).send({
                message: 'Old password is incorrect.',
                success: false
            });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).send({
            message: 'Password updated successfully.',
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'Error in Update Password API.',
            success: false,
            error
        });
    }
};

//update user profile photo
export const updateProfilePicController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        const file = getDataUri(req.file);
        //delete previous image
        await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
        //upload new image
        const cdb = await cloudinary.v2.uploader.upload(file.content)
        user.profilePic = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        };
        await user.save();

        res.status(200).send({
            message: 'Profile picture updated successfully.',
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'Error in Update Profile Picture API.',
            success: false,
            error
        });
    }
};

//reset password
export const resetPasswordController = async (req, res) => {
    try {
        const { email, newPassword, answer } = req.body;
        if (!email || !newPassword || !answer) {
            return res.status(500).send({
                message: 'Please provide email, new password and answer.',
                success: false
            });
        }

        const user = await userModel.findOne({ email, answer });
        if (!user) {
            return res.status(500).send({
                message: 'Invalid user or answer.',
                success: false
            });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).send({
            message: 'Password reset successfully.',
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'Error in Reset Password API.',
            success: false,
            error
        });
    }
}