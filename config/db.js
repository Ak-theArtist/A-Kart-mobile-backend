import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log(`MongoDB connected on ${mongoose.connection.host}`.green.inverse);
    } catch (error) {
        console.log(`Mongo DB Error : ${error}`.bgRed.white);
    }
}

export default connectDB;