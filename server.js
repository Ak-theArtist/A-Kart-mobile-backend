import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import connectDB from './config/db.js';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

//env configuration
dotenv.config();

//database configuration
connectDB();

//cloudinary configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

//rest object
const app = express();

//middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
//for security purposes
app.use(helmet());
app.use(mongoSanitize());

//routes imports
import testRoutes from './routes/testRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

//routes
app.use('/api/v1', testRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/cat', categoryRoutes);
app.use('/api/v1/order', orderRoutes);

app.get('/', (req, res) => {
    res.status(200).send('<h1>Welcome to A-Kart</h1>');
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on PORT : ${PORT} on ${process.env.NODE_ENV} mode`.bgGreen.white)
});