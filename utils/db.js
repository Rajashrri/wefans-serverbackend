const mongoose = require("mongoose");

// const URI = "mongodb+srv://airitham:4lvBGvh0gtUcoyH6@cluster0.ztg1e4d.mongodb.net/wefans";

const URI =process.env.DB_URL;
// mongoose.connect(URI);

const connectDB = async () => {
    try {

       await mongoose.connect(URI);
       console.log('connection successful to DB');
        
    } catch (error) {

        console.error(error,"databse connection failed");
        process.exit(0);
        
    }
};

module.exports = connectDB; 
